from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from utils.pagination import StandardResultsSetPagination


from .models import PatientAssignment
from diet.models import DietRecommendation
from user.models import User
from userProfile.models import LabReport, UserProfile
from userFood.models import UserMeal
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
    # pagination_class = StandardResultsSetPagination # Uncomment if you have this
    
    def get_queryset(self):
        patient_id = self.kwargs['patient_id']
        # 1. Verify assignment
        if not PatientAssignment.objects.filter(nutritionist=self.request.user, patient_id=patient_id).exists():
            raise PermissionDenied("You are not assigned to this patient.")
        # 2. Return meal logs for the specified patient, ordered by most recent
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
    # This would likely be a PATCH request to update the 'meals' JSON field.
    # Implementation depends on how you want to handle JSON updates.
    def patch(self, request, recommendation_id):
        # Basic implementation example
        new_meals_data = request.data.get('meals')
        if not new_meals_data:
            return Response({'error': 'The "meals" field is required.'}, status=4_00)

        try:
            rec = DietRecommendation.objects.get(pk=recommendation_id)
            rec.meals = new_meals_data
            rec.save(update_fields=['meals', 'updated_at'])
            return Response({'message': 'Diet plan updated successfully.'}, status=2_00)
        except DietRecommendation.DoesNotExist:
            return Response({'error': 'Recommendation not found.'}, status=4_04)

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
