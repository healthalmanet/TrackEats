from datetime import date
from django.shortcuts import render
import copy # Don't forget this import
import numpy as np
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.db import transaction
from django.utils.timezone import now
from datetime import date
import numpy as np

from diet.serializers import DietRecommendationSerializer
from ml_model.src.generator import generate_diet_plan
from utils.gemini import fetch_nutrition_from_gemini
from utils.pagination import StandardResultsSetPagination


from .models import PatientAssignment
from diet.models import DietRecommendation
from user.models import User
from userProfile.models import LabReport, UserProfile
from userFood.models import FoodItem, UserMeal
from .serializers import (
    CreatePatientSerializer, UserSerializer1, PatientProfileSerializer1,
    UserMealSerializer1, DietRecommendationWithPatientSerializer1,
    ) 
from userProfile.serializers import LabReportSerializer, UserProfileSerializer
from django.db import transaction









# Create your views here.
###############################################################################DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD
# --- Permission Class ---
class IsNutritionist(permissions.BasePermission):
    """
    Allows access only to authenticated users with the 'nutritionist' role.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'nutritionist'


# --- API Views ---

class UserListForNutritionistView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsNutritionist]
    serializer_class = UserSerializer1
    # pagination_class = StandardResultsSetPagination # Uncomment if you have this
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['email', 'full_name']
    ordering_fields = ['date_joined', 'full_name']
    
    def get_queryset(self):
        # ✅ IMPROVEMENT: Only show users with the 'user' role (patients).
        return User.objects.filter(role='user').order_by('-date_joined')


class AssignPatientAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNutritionist]

    def post(self, request, *args, **kwargs):
        patient_id = request.data.get('patient_id')
        if not patient_id:
            return Response({'error': 'patient_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Ensure the user being assigned is actually a patient
            patient = User.objects.get(id=patient_id, role='user')
            # get_or_create prevents duplicate assignments
            assignment, created = PatientAssignment.objects.get_or_create(
                nutritionist=request.user, 
                patient=patient
            )
            message = 'Patient assigned successfully.' if created else 'Patient was already assigned.'
            return Response({'message': message}, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'Patient with the given ID not found.'}, status=status.HTTP_404_NOT_FOUND)


class AssignedPatientsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsNutritionist]
    serializer_class = UserSerializer1
    
    def get_queryset(self):
        # Get IDs of patients assigned to the current nutritionist
        assigned_patient_ids = PatientAssignment.objects.filter(
            nutritionist=self.request.user
        ).values_list('patient_id', flat=True)
        # Return the User objects for those IDs
        return User.objects.filter(id__in=assigned_patient_ids)


# ✅ FIXED: This view is completely rewritten to use the correct models.
class PatientProfileDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNutritionist]

    def get(self, request, patient_id):
        # 1. Verify that the nutritionist is assigned to this patient
        if not PatientAssignment.objects.filter(nutritionist=request.user, patient_id=patient_id).exists():
            return Response({'error': 'You are not assigned to this patient.'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            # 2. Fetch the patient's profile and latest lab report
            user_profile = UserProfile.objects.get(user_id=patient_id)
            latest_lab_report = LabReport.objects.filter(user_id=patient_id).order_by('-report_date').first()
            
            # 3. Serialize the data
            profile_serializer = PatientProfileSerializer1(user_profile)
            lab_report_serializer = LabReportSerializer(latest_lab_report) if latest_lab_report else None
            
            return Response({
                'profile': profile_serializer.data,
                'latest_lab_report': lab_report_serializer.data if lab_report_serializer else None
            }, status=status.HTTP_200_OK)
            
        except UserProfile.DoesNotExist:
            return Response({'error': 'Patient profile not found.'}, status=status.HTTP_404_NOT_FOUND)


# ✅ NEW: Implementation for the previously empty PatientMealLogView.
class PatientMealLogView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsNutritionist]
    serializer_class = UserMealSerializer1
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['consumed_at','date']  # ✅ Filter by exact date
    ordering_fields = ['consumed_at']
    ordering = ['-consumed_at']

    def get_queryset(self):
        patient_id = self.kwargs['patient_id']
        if not PatientAssignment.objects.filter(nutritionist=self.request.user, patient_id=patient_id).exists():
            raise PermissionDenied("You are not assigned to this patient.")
        return UserMeal.objects.filter(user_id=patient_id).order_by('-consumed_at')



class NutritionistPatientDietRecommendationsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsNutritionist]
    serializer_class = DietRecommendationWithPatientSerializer1

    def get_queryset(self):
        patient_id = self.kwargs['patient_id']
        if not PatientAssignment.objects.filter(nutritionist=self.request.user, patient_id=patient_id).exists():
            raise PermissionDenied("You are not assigned to this patient.")
        return DietRecommendation.objects.filter(user_id=patient_id).order_by('-created_at')


class ApproveOrRejectDietView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNutritionist]

    def post(self, request, recommendation_id):
        action = request.data.get("action")
        comment = request.data.get("comment", "")

        if action not in ["approved", "rejected"]:
            return Response({'error': 'Invalid action. Use "approved" or "rejected".'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            recommendation = DietRecommendation.objects.get(id=recommendation_id)
            
            # Optional: Check if this nutritionist is assigned to the recommendation's user
            if not PatientAssignment.objects.filter(nutritionist=request.user, patient=recommendation.user).exists():
                 return Response({'error': 'You are not assigned to this patient.'}, status=status.HTTP_403_FORBIDDEN)

            recommendation.status = action
            recommendation.reviewed_by = request.user
            recommendation.nutritionist_comment = comment
            recommendation.save()

            return Response({'message': f'Diet plan has been {action}.'}, status=status.HTTP_200_OK)
        except DietRecommendation.DoesNotExist:
            return Response({'error': 'Recommendation not found'}, status=status.HTTP_404_NOT_FOUND)


# ✅ FIXED: This view is rewritten to update the existing DietRecommendation model.
class UpdateRetrainingFlagsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNutritionist]

    def post(self, request, recommendation_id):
        # Get data from request
        notes = request.data.get("notes", "")
        approved_for_retraining = request.data.get("approved_for_retraining", False)
        
        # Ensure 'approved_for_retraining' is a boolean
        if not isinstance(approved_for_retraining, bool):
            return Response({'error': '"approved_for_retraining" must be a boolean (true/false).'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            recommendation = DietRecommendation.objects.get(id=recommendation_id)
            
            # Update the fields directly on the DietRecommendation instance
            recommendation.nutritionist_retraining_notes = notes
            recommendation.approved_for_retraining = approved_for_retraining
            recommendation.save()
            
            return Response({'message': 'Retraining feedback submitted successfully.'}, status=status.HTTP_200_OK)
        except DietRecommendation.DoesNotExist:
            return Response({'error': 'Recommendation not found.'}, status=status.HTTP_404_NOT_FOUND)


# Note: EditDietPlanView is still empty and would require a detailed implementation
# for modifying the `meals` JSON field, which can be complex.



class EditDietPlanView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNutritionist]

    @transaction.atomic
    def patch(self, request, recommendation_id):
        # ... (initial code is fine) ...
        new_meals_data = request.data.get('meals')
        if not isinstance(new_meals_data, dict):
            return Response({'error': '"meals" must be a valid JSON object.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            recommendation = DietRecommendation.objects.select_for_update().get(pk=recommendation_id)
        except DietRecommendation.DoesNotExist:
            return Response({'error': 'Recommendation not found.'}, status=status.HTTP_404_NOT_FOUND)

        existing_meals = copy.deepcopy(recommendation.meals or {})

        for day, meals in new_meals_data.items():
            if not isinstance(meals, dict) or "meals" not in meals:
                continue
            
            if not isinstance(existing_meals.get(day), dict) or "meals" not in existing_meals[day]:
                existing_meals[day] = {"meals": {}}

            for meal_slot, meal_info in meals["meals"].items():
                food_name_from_request = meal_info.get("item")
                if not food_name_from_request:
                    continue
                
                cleaned_food_name = food_name_from_request.strip()
                food = None # Initialize food as None

                # ✅ --- START OF NEW SEARCH LOGIC ---

                # TIER 1: Try for a perfect, case-insensitive match first. This is fast and accurate.
                food = FoodItem.objects.filter(name__iexact=cleaned_food_name).first()
                
                if not food:
                    # TIER 2: If no perfect match, try a more flexible 'contains' search.
                    # This finds items in your DB whose name is contained within the user's longer request string.
                    # Example: DB has "Brown Bread", request has "2 slices of Brown Bread".
                    # We order by the length of the name descending to get the most specific match first.
                    # e.g., "Brown Bread" will be matched before "Bread".
                    potential_matches = FoodItem.objects.filter(name__icontains=cleaned_food_name).order_by(Length('name').desc())
                    food = potential_matches.first() # Get the best possible match

                # ✅ --- END OF NEW SEARCH LOGIC ---

                if food:
                    # SUCCESS: We found the food in our DB without calling Gemini.
                    print(f"✅ DB HIT: Found '{food.name}' for request '{cleaned_food_name}'")
                    meal_info["nutrients"] = {
                        "calories": food.calories, "protein": food.protein, "carbs": food.carbs,
                        "fats": food.fats, "glycemic_index": food.estimated_gi,
                        "glycemic_load": food.glycemic_load, "food_type": food.food_type,
                        "meal_type": food.meal_type, "allergens": food.allergens,
                    }
                else:
                    # TIER 3: Last Resort. Both DB searches failed. NOW we call Gemini.
                    print(f"🔥 API CALL: No DB match for '{cleaned_food_name}'. Calling Gemini.")
                    try:
                        nutrition_data = fetch_nutrition_from_gemini(cleaned_food_name)
                        if not nutrition_data or not nutrition_data.get('name'):
                            continue

                        food_name_from_gemini = nutrition_data.get('name')

                        food, created = FoodItem.objects.get_or_create(
                            name__iexact=food_name_from_gemini,
                            defaults={
                                # ... all your fields for creating a new food item ...
                                'name': food_name_from_gemini,
                                'carbs': nutrition_data.get('carbohydrates'), # Remember to map Gemini's keys
                                'estimated_gi': nutrition_data.get('glycemic_index'),
                                # ... etc
                            }
                        )
                        
                        meal_info["nutrients"] = {
                           "calories": food.calories, "protein": food.protein, "carbs": food.carbs,
                           "fats": food.fats, "glycemic_index": food.estimated_gi,
                           "glycemic_load": food.glycemic_load, "food_type": food.food_type,
                           "meal_type": food.meal_type, "allergens": food.allergens,
                        }

                    except Exception as e:
                        print(f"Error processing food '{cleaned_food_name}': {e}")
                        continue

                existing_meals[day]["meals"][meal_slot] = meal_info

        # ... (rest of the code to save the recommendation is fine) ...
        recommendation.meals = existing_meals
        recommendation.status = 'pending'
        recommendation.reviewed_by = request.user
        recommendation.save(update_fields=['meals', 'status', 'reviewed_by', 'updated_at'])

        return Response({
            'message': 'Diet plan updated successfully.',
            'updated_meals': recommendation.meals
        }, status=status.HTTP_200_OK)



# ==============================================================================
# 🔹 NEW API VIEW: List all diet plans for all assigned patients
# ==============================================================================
class AllAssignedDietPlansListView(generics.ListAPIView):
    """
    Provides a list of all diet recommendations for all patients
    assigned to the currently authenticated nutritionist.

    Supports filtering by status, and searching by patient's name or email.
    - `?status=pending`
    - `?status=approved`
    - `?search=Anjali`
    """
    permission_classes = [permissions.IsAuthenticated, IsNutritionist]
    serializer_class = DietRecommendationWithPatientSerializer1
    pagination_class = StandardResultsSetPagination # Optional: uncomment if you have pagination
    
    # Enable filtering and searching
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Fields for filtering (e.g., /.../?status=pending)
    filterset_fields = ['status']
    
    # Fields for searching (e.g., /.../?search=Sharma)
    # Note the double-underscore to search on the related User model
    search_fields = ['user__full_name', 'user__email']
    
    # Fields for ordering (e.g., /.../?ordering=-created_at)
    ordering_fields = ['created_at', 'for_week_starting']
    ordering = ['-created_at'] # Default ordering

    def get_queryset(self):
        """
        This method customizes the queryset to only return diet plans
        for patients assigned to the logged-in nutritionist.
        """
        # 1. Get the list of patient IDs assigned to this nutritionist
        assigned_patient_ids = PatientAssignment.objects.filter(
            nutritionist=self.request.user
        ).values_list('patient_id', flat=True)

        # 2. Filter the DietRecommendation objects to only include those
        #    belonging to the list of assigned patient IDs.
        queryset = DietRecommendation.objects.filter(user_id__in=assigned_patient_ids)

        return queryset
    

#Create Patient
class NutritionistCreatePatientView(generics.GenericAPIView):
    serializer_class = CreatePatientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if request.user.role != "nutritionist":
            return Response({"detail": "Only nutritionists can create patients."}, status=403)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            with transaction.atomic():
                user = serializer.save()
                PatientAssignment.objects.create(nutritionist=request.user, patient=user)
                return Response({"detail": "Patient created and assigned successfully."}, status=201)
        except Exception as e:
            return Response({"detail": str(e)}, status=400)


##generate diet
# ==============================================================================
# 🔹 NEW API VIEW: Generate AI Plan for a Patient by Nutritionist
# ==============================================================================
class GeneratePlanForPatientView(APIView):
    """
    Allows a nutritionist to generate a new AI diet plan for an assigned patient.
    The generated plan is automatically marked as 'approved'.
    
    POST /api/nutritionist/patients/<patient_id>/generate-plan/
    """
    permission_classes = [permissions.IsAuthenticated, IsNutritionist]
    
    def _calculate_age(self, dob):
        if not dob: return 0
        today = date.today()
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    
    def _convert_numpy_types(self, obj):
        if isinstance(obj, (np.integer, np.int64)): return int(obj)
        if isinstance(obj, (np.floating, np.float64)): return float(obj)
        if isinstance(obj, dict): return {k: self._convert_numpy_types(v) for k, v in obj.items()}
        if isinstance(obj, list): return [self._convert_numpy_types(i) for i in obj]
        return obj

    def post(self, request, patient_id, *args, **kwargs):
        # 1. Verify patient exists and is assigned to the nutritionist
        try:
            patient = User.objects.get(id=patient_id, role='user')
            if not PatientAssignment.objects.filter(nutritionist=request.user, patient=patient).exists():
                return Response({'error': 'You are not assigned to this patient.'}, status=status.HTTP_403_FORBIDDEN)
        except User.DoesNotExist:
            return Response({'error': 'Patient with the given ID not found.'}, status=status.HTTP_404_NOT_FOUND)

        # 2. Prevent creating a new plan if one is already pending review
        if DietRecommendation.objects.filter(user=patient, status='pending').exists():
            return Response({
                'error': 'This patient already has a plan pending review. Please review the existing plan first.'
            }, status=status.HTTP_409_CONFLICT)
            
        # 3. Fetch patient profile and lab data
        try:
            user_profile = UserProfile.objects.get(user=patient)
            latest_lab_report = LabReport.objects.filter(user=patient).order_by('-report_date').first()
        except UserProfile.DoesNotExist:
            return Response({'error': 'Patient profile not found. The patient must complete their profile first.'}, status=status.HTTP_400_BAD_REQUEST)

        # 4. Build the input data vector
        NUMERICAL_COLS = [
            'Age', 'Weight (kg)', 'Height (cm)', 'BMI (auto-calculated)', 'Waist Circumference (cm)',
            'Fasting Blood Sugar (mg/dL)', 'HbA1c (%)', 'Postprandial Sugar (mg/dL)', 'LDL (mg/dL)',
            'HDL (mg/dL)', 'Triglycerides (mg/dL)', 'CRP (mg/L)', 'ESR (mm/hr)', 'Uric Acid (mg/dL)',
            'Creatinine (mg/dL)', 'Urea (mg/dL)', 'ALT (U/L)', 'AST (U/L)', 'Vitamin D3 (ng/mL)',
            'Vitamin B12 (pg/mL)', 'TSH (uIU/mL)'
        ]
        user_data_dict = {
            'Age': self._calculate_age(user_profile.date_of_birth),
            'Weight (kg)': user_profile.weight_kg,
            'Height (cm)': user_profile.height_cm,
            'BMI (auto-calculated)': user_profile.bmi,
            'Waist Circumference (cm)': getattr(latest_lab_report, 'waist_circumference_cm', 0),
            'Fasting Blood Sugar (mg/dL)': getattr(latest_lab_report, 'fasting_blood_sugar', 0),
            'HbA1c (%)': getattr(latest_lab_report, 'hba1c', 0),
            'Postprandial Sugar (mg/dL)': getattr(latest_lab_report, 'postprandial_sugar', 0),
            'LDL (mg/dL)': getattr(latest_lab_report, 'ldl_cholesterol', 0),
            'HDL (mg/dL)': getattr(latest_lab_report, 'hdl_cholesterol', 0),
            'Triglycerides (mg/dL)': getattr(latest_lab_report, 'triglycerides', 0),
            'CRP (mg/L)': getattr(latest_lab_report, 'crp', 0),
            'ESR (mm/hr)': getattr(latest_lab_report, 'esr', 0),
            'Uric Acid (mg/dL)': getattr(latest_lab_report, 'uric_acid', 0),
            'Creatinine (mg/dL)': getattr(latest_lab_report, 'creatinine', 0),
            'Urea (mg/dL)': getattr(latest_lab_report, 'urea', 0),
            'ALT (U/L)': getattr(latest_lab_report, 'alt', 0),
            'AST (U/L)': getattr(latest_lab_report, 'ast', 0),
            'Vitamin D3 (ng/mL)': getattr(latest_lab_report, 'vitamin_d3', 0),
            'Vitamin B12 (pg/mL)': getattr(latest_lab_report, 'vitamin_b12', 0),
            'TSH (uIU/mL)': getattr(latest_lab_report, 'tsh', 0),
        }
        user_vector_list = [
            float(user_data_dict.get(col, 0)) if user_data_dict.get(col, 0) is not None else 0.0
            for col in NUMERICAL_COLS
        ]

        # 5. Call the AI model
        try:
            print(f"Nutritionist {request.user.email} generating plan for patient {patient.email}")
            plan_json = generate_diet_plan(patient.id)

            if isinstance(plan_json, dict) and "error" in plan_json:
                return Response({'error': plan_json['error']}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            plan_json = self._convert_numpy_types(plan_json)

            # 6. Create the diet recommendation, auto-approving it
            new_recommendation = DietRecommendation.objects.create(
                user=patient,
                for_week_starting=now().date(),
                meals=plan_json,
                original_ai_plan=plan_json,
                user_profile_snapshot=user_vector_list,
                status='pending',  # Automatically approved
                reviewed_by=request.user, # The nutritionist who generated it
                nutritionist_comment="Plan generated by nutritionist."
            )
            
            serializer = DietRecommendationSerializer(new_recommendation)
            return Response({
                'message': 'New diet plan generated and approved for the patient successfully.',
                'plan_data': serializer.data
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            import traceback; traceback.print_exc()
            return Response({'error': f'An internal error occurred during diet generation: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PatientLabReportsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsNutritionist]
    serializer_class = LabReportSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['report_date']
    ordering_fields = ['report_date']

    def get_queryset(self):
        patient_id = self.kwargs['patient_id']
        if not PatientAssignment.objects.filter(nutritionist=self.request.user, patient_id=patient_id).exists():
            raise PermissionDenied("You are not assigned to this patient.")
        return LabReport.objects.filter(user_id=patient_id).order_by('-report_date')
