from django.shortcuts import render, HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import BasePermission
from django.db.models import Sum
from django.db.models import Count  
from django.contrib.auth.models import Group
from rest_framework.exceptions import ValidationError   
from utils.utils import UNIT_TO_GRAMS,role_required,generate_diet_recommendation
from .ml_diet.predict import recommend_meals
from rest_framework.filters import SearchFilter
from datetime import datetime, time
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework import views
from rest_framework.permissions import IsAuthenticated
import copy
from django.db.models import Q
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.contrib.auth.models import User
from django.utils.encoding import force_bytes, smart_str, DjangoUnicodeDecodeError
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from django.core.exceptions import PermissionDenied
from rest_framework.decorators import action
from django.utils import timezone
from rest_framework.exceptions import NotFound
from rapidfuzz import process, fuzz
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny
from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from django.utils.dateparse import parse_date
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from datetime import timedelta
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.facebook.views import FacebookOAuth2Adapter
from dj_rest_auth.registration.views import SocialLoginView

from django.utils.timezone import now
from django.core.mail import send_mail
from rest_framework import status
from rest_framework import generics, permissions
from .models import (
    Blog, User, UserProfile, DiabeticProfile,UserMeal,
    FoodItem,PatientReminder, NutritionistProfile,
    DietRecommendation,DietFeedback,
    PatientAssignment, UserMeal, DietRecommendationFeedback,
    Feedback,
    WeightLog,WaterIntakeLog,CustomReminder, Message
    )
from .serializers import (
        FoodItemSerializer2, RegisterSerializer, UserProfileSerializer,DiabeticProfileSerializer,
        UserMealSerializer,PatientReminderSerializer,
        DietRecommendationSerializer,
        DietFeedbackSerializer,
        DietRecommendationPatchSerializer,
        FeedbackSerializer,
        WeightLogSerializer,CustomReminderSerializer,WaterIntakeLogSerializer,
        UserSerializer, DietRecommendationWithPatientSerializer, ResetPasswordSerializer, ForgotPasswordSerializer,
        MessageSerializer, BlogSerializer,
    )
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer

# Create your views here.

####################################DECORATORS####################################
#####################################DECORATORS###################################

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 6
    page_size_query_param = 'page_size'
    max_page_size = 100






def home(request):
    """
    A simple HTTP view to return a basic greeting message.
    Useful for testing if the server is running.
    """
    return HttpResponse("Hello, world! This is the home page.")

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    """
    API view to handle user registration.
    Allows clients to create a new user by sending POST request with email and password.
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter

class FacebookLogin(SocialLoginView):
    adapter_class = FacebookOAuth2Adapter


#Forgot Password
class ForgotPasswordView(generics.GenericAPIView):
    serializer_class = ForgotPasswordSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = PasswordResetTokenGenerator().make_token(user)
            frontend_url = "https://track-eats.onrender.com/reset-password"
            reset_url = f"{frontend_url}/{uid}/{token}/"

            send_mail(
                subject="Password Reset Request",
                message=f"Hi {user.full_name or user.email},\n\nClick the link to reset your password:\n{reset_url}\n\nIf you didn’t request this, please ignore it.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False
            )
            return Response({'message': 'Password reset link has been sent.'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            # Return 200 to avoid user enumeration
            return Response({'message': 'If this email exists, a password reset link will be sent.'}, status=status.HTTP_200_OK)

class ResetPasswordView(generics.GenericAPIView):
    serializer_class = ResetPasswordSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        uidb64 = serializer.validated_data['uidb64']
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']

        try:
            uid = smart_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
            if not PasswordResetTokenGenerator().check_token(user, token):
                return Response({'error': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.save()
            return Response({'message': 'Password has been reset successfully.'}, status=status.HTTP_200_OK)
        except (DjangoUnicodeDecodeError, User.DoesNotExist):
            return Response({'error': 'Invalid or expired link.'}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API view to retrieve, update, or delete the authenticated user's profile.
    - GET: Retrieve the current user's profile data.
    - PUT/PATCH: Update the current user's profile.
    - DELETE: Delete the current user's profile.
    Requires the user to be authenticated.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        try:
            return UserProfile.objects.get(user=self.request.user)
        except UserProfile.DoesNotExist:
            raise NotFound("User profile not found.")


class UserProfileCreateView(generics.CreateAPIView):
    """
    API view to create or update a UserProfile for the authenticated user.
    Accepts profile data in POST request.
    Links the created/updated profile with the current logged-in user automatically.
    Requires the user to be authenticated.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        UserProfile.objects.update_or_create(
            user=self.request.user,
            defaults=serializer.validated_data
        )


class DiabeticProfileCreateView(generics.CreateAPIView):
    """
    API view to create a DiabeticProfile for the authenticated user.
    Requires authentication.
    """
    serializer_class = DiabeticProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user_profile = self.request.user.userprofile
        serializer.save(user_profile=user_profile)


class DiabeticProfileListView(generics.ListAPIView):
    """
    API view to list all diabetic reports of the authenticated user.
    """
    serializer_class = DiabeticProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DiabeticProfile.objects.filter(user_profile__user=self.request.user)


class DiabeticProfileDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API view to retrieve, update, or delete a specific DiabeticProfile report of the authenticated user.
    Requires authentication.
    """
    serializer_class = DiabeticProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'

    def get_queryset(self):
        return DiabeticProfile.objects.filter(user_profile__user=self.request.user)





FUZZY_MATCH_THRESHOLD = 80  # Adjustable threshold for fuzzy matching confidence

class UserMealViewSet(viewsets.ModelViewSet):
    serializer_class = UserMealSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    ordering_fields = ['consumed_at']
    ordering = ['-consumed_at']
    filterset_fields = ['consumed_at', 'user', 'date', 'meal_type']

    def get_queryset(self):
        queryset = UserMeal.objects.filter(user=self.request.user)
        date_str = self.request.query_params.get('date')
        if date_str:
            date_obj = parse_date(date_str)
            if date_obj:
                queryset = queryset.filter(consumed_at__date=date_obj)
        return queryset

    def create(self, request, *args, **kwargs):
        user = request.user
        data = request.data
        if isinstance(data, dict):
            data = [data]

        response_data = []

        for item in data:
            serializer = self.get_serializer(data=item)
            serializer.is_valid(raise_exception=True)

            food_name = serializer.validated_data.get("food_name")
            quantity = serializer.validated_data.get("quantity")
            unit = serializer.validated_data.get("unit").lower()
            meal_type = serializer.validated_data.get("meal_type")

            food_item = self._get_best_matching_food_item(food_name)

            grams_per_unit = UNIT_TO_GRAMS.get(unit, 100)
            weight_in_grams = quantity * grams_per_unit

            instance = serializer.save(
                 user=user,
                 food_item=food_item,
                 food_name=food_item.name,
                 meal_type=meal_type,
                 calories=round((weight_in_grams / 100) * food_item.calories, 2),
                 protein=round((weight_in_grams / 100) * food_item.protein, 2),
                 carbs=round((weight_in_grams / 100) * food_item.carbs, 2),
                 fats=round((weight_in_grams / 100) * food_item.fats, 2),
                #  sugar=round((weight_in_grams / 100) * food_item.sugar, 2) if food_item.sugar is not None else None,
                #  fiber=round((weight_in_grams / 100) * food_item.fiber, 2) if food_item.fiber is not None else None,
                 estimated_gi=food_item.estimated_gi,  # usually not scaled — it’s per food, not weight-based
                 glycemic_load=round((weight_in_grams / 100) * food_item.glycemic_load, 2) if food_item.glycemic_load else None,
                 food_type=food_item.food_type,
            )

            response_data.append(self.get_serializer(instance).data)

        return Response(response_data, status=status.HTTP_201_CREATED)

    def _get_best_matching_food_item(self, food_name):
        try:
            # Exact match first (fast lookup)
            return FoodItem.objects.get(name__iexact=food_name)
        except FoodItem.DoesNotExist:
            # Fuzzy match fallback
            food_names = list(FoodItem.objects.values_list('name', flat=True))
            best_match, score, _ = process.extractOne(food_name, food_names, scorer=fuzz.WRatio)

            if score >= FUZZY_MATCH_THRESHOLD:
                return FoodItem.objects.get(name=best_match)

            raise ValidationError(f"Food item '{food_name}' not found (closest match '{best_match}' with confidence {score}%). Please check spelling.")



#------------------CALORIE RECOMMEND API ENDPOINTS---------------- to get calorie,carbs,protein,fats etc
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recommend_calories(request):
    try:
        profile = UserProfile.objects.get(user=request.user)

        weight = profile.weight_kg
        height = profile.height_cm
        age = profile.age
        gender = profile.gender
        activity_level = profile.activity_level
        goal = profile.goal

        # Calculate BMR (Mifflin-St Jeor)
        if gender == "male":
            bmr = 10 * weight + 6.25 * height - 5 * age + 5
        else:
            bmr = 10 * weight + 6.25 * height - 5 * age - 161

        # Activity multipliers (reduce slightly for realism)
        activity_multipliers = {
            "sedentary": 1.2,
            "light": 1.3,
            "moderate": 1.45,
            "active": 1.6,
            "very_active": 1.75,
        }

        activity_multiplier = activity_multipliers.get(activity_level, 1.2)

        # Maintenance calories
        maintenance_calories = bmr * activity_multiplier

        # Goal-based adjustment (percentage instead of hard -500)
        if goal == "lose_weight":
            recommended_calories = maintenance_calories * 0.8   # 20% deficit
        elif goal == "gain_weight":
            recommended_calories = maintenance_calories * 1.15  # 15% surplus
        else:
            recommended_calories = maintenance_calories

        # Protein grams per kg of body weight (1.6g - 2.2g is ideal for fat loss/muscle maintenance)
        protein_grams = round(weight * 1.8)

        # Fats: ~0.8g per kg body weight (can be tweaked)
        fats_grams = round(weight * 0.8)

        # Calculate calories from protein & fats
        protein_calories = protein_grams * 4
        fats_calories = fats_grams * 9

        # Remaining calories for carbs
        carbs_calories = recommended_calories - (protein_calories + fats_calories)
        carbs_grams = round(carbs_calories / 4) if carbs_calories > 0 else 0


             # ✅ Calculate recommended water intake
        base_water_ml = weight * 35  # 35 ml per kg

        # Activity adjustment (ml)
        activity_water_bonus = {
            "sedentary": 0,
            "light": 250,
            "moderate": 500,
            "active": 750,
            "very_active": 1000,
        }
        water_adjustment = activity_water_bonus.get(activity_level, 0)
        recommended_water_ml = base_water_ml + water_adjustment

        return Response({
            "bmr": round(bmr),
            "maintenance_calories": round(maintenance_calories),
            "recommended_calories": round(recommended_calories),
            "macronutrients": {
                "protein_g": protein_grams,
                "carbs_g": carbs_grams,
                "fats_g": fats_grams,
            },
            "water": {
                "recommended_ml": round(recommended_water_ml),
            },
            "goal": goal,
            "activity_level": activity_level,
        })

    except UserProfile.DoesNotExist:
        return Response({"error": "User profile not found."}, status=status.HTTP_404_NOT_FOUND)


##########################CALORIE TRACKER API ENDPOINTS END##########################
class DailyCalorieSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = now().date()
        start = datetime.combine(today, time.min)
        end = datetime.combine(today, time.max)
        meals_today = UserMeal.objects.filter(user=request.user, consumed_at__range=(start, end))


        totals = meals_today.aggregate(
            total_calories=Sum("calories"),
            total_protein=Sum("protein"),
            total_carbs=Sum("carbs"),
            total_fats=Sum("fats"),
            total_sugar=Sum("sugar"),
            total_fiber=Sum("fiber"),
        )

        return Response({
            "date": today,
            "calories": totals["total_calories"] or 0,
            "protein": totals["total_protein"] or 0,
            "carbs": totals["total_carbs"] or 0,
            "fats": totals["total_fats"] or 0,
            "sugar": totals["total_sugar"] or 0,
            "fiber": totals["total_fiber"] or 0,
        })


##############################################USER TYPES ROLES ACTORS##############################################

class OwnerDashboardView(APIView):
    @role_required(["owner"])
    def get(self, request):
        today = now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)

        # Core Metrics
        total_users = User.objects.filter(role="user").count()
        new_users_week = User.objects.filter(role="user", date_joined__gte=week_ago).count()
        new_users_month = User.objects.filter(role="user", date_joined__gte=month_ago).count()
        active_patients = UserMeal.objects.filter(date__gte=week_ago).values("user").distinct().count()

        estimated_revenue = active_patients * 49
        meals_logged_week = UserMeal.objects.filter(date__gte=week_ago).count()
        meals_logged_month = UserMeal.objects.filter(date__gte=month_ago).count()

        # Country-wise User Count
        users_by_country = (
            UserProfile.objects.values("country")
            .annotate(user_count=Count("id"))
            .order_by("-user_count")
        )

        # ✅ Feedback Integration with user email
        feedbacks_count = Feedback.objects.count()
        latest_feedbacks = Feedback.objects.select_related('user').order_by('-created_at')[:5]
        feedback_data = FeedbackSerializer(latest_feedbacks, many=True).data

        promotions = [
            {"campaign": "Instagram Ad", "reach": "10k+", "status": "Running"},
            {"campaign": "Referral Program", "reach": "5k+", "status": "Ended"},
        ]

        return Response({
            "date": str(today),
            "user_stats": {
                "total_users": total_users,
                "new_users_week": new_users_week,
                "new_users_month": new_users_month,
                "active_patients_week": active_patients,
            },
            "usage": {
                "meals_logged_week": meals_logged_week,
                "meals_logged_month": meals_logged_month,
            },
            "revenue": f"₹{estimated_revenue}",
            "users_by_country": users_by_country,
            "feedback_summary": {
                "feedback_collected": feedbacks_count,
                "latest_feedbacks": feedback_data
            },
            "promotions": promotions,
            "message": "Owner dashboard data fetched successfully"
        }, status=status.HTTP_200_OK)

##############################################OPERATOR DASHBOARD VIEW#################################################################
class IsOperator(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "operator"


# Create & list reminders
class ReminderListCreateView(generics.ListCreateAPIView):
    queryset = PatientReminder.objects.all()
    serializer_class = PatientReminderSerializer
    permission_classes = [IsOperator]

#
class SendReminderView(APIView):
    permission_classes = [IsOperator]

    def post(self, request, pk):
        try:
            reminder = PatientReminder.objects.get(pk=pk)
            # Simulate sending email/SMS
            reminder.sent = True
            reminder.save()

            # Optional: Send email (only if you set up SMTP)
            # send_mail(
            #     subject="Health Reminder",
            #     message=reminder.message,
            #     from_email="admin@yourapp.com",
            #     recipient_list=[reminder.user.email],
            # )

            return Response({"status": "Reminder sent!"})
        except PatientReminder.DoesNotExist:
            return Response({"error": "Reminder not found"}, status=status.HTTP_404_NOT_FOUND)


# Get all users' contact info
class UserContactListView(generics.ListAPIView):
    permission_classes = [IsOperator]

    def get(self, request):
        users = User.objects.filter(role="user")
        data = []

        for u in users:
            # Check if user has a profile before accessing it
            if hasattr(u, "userprofile"):
                profile = u.userprofile
                data.append({
                    "id": u.id,
                    "email": u.email,
                    "contact_number": profile.mobile_number,  # assuming contact_number is here
                    "country": profile.country,
                })
            else:
                # fallback if profile missing
                data.append({
                    "id": u.id,
                    "email": u.email,
                    "contact_number": None,
                    "country": None,
                })

        return Response(data)


#  Compile report (basic version for Owner)
class OperatorReportView(APIView):
    permission_classes = [IsOperator]

    def get(self, request):
        user_count = User.objects.filter(role="user").count()
        # reminders_sent = PatientReminder.objects.filter(sent_at=True).count()
        reminders_sent = PatientReminder.objects.exclude(sent_at=None).count()
        return Response({
            "total_users": user_count,
            "reminders_sent": reminders_sent,
        })
    

class dietPlant15Day(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.userprofile
        except:
            return Response({'error': 'User profile not found.'}, status=404)

        today = now().date()

        # ✅ 1. Check if pending exists (most recent)
        pending = DietRecommendation.objects.filter(
            user=request.user,
            status='pending',
            for_week_starting__gte=today - timedelta(days=15)
        ).order_by('-for_week_starting').first()

        if pending:
            return Response({'message': 'Your diet is under review.', 'status': 'pending'}, status=202)

        # ✅ 2. If approved and still in 15-day window, return it
        approved = DietRecommendation.objects.filter(
            user=request.user,
            status='approved',
            for_week_starting__lte=today
        ).order_by('-for_week_starting').first()

        if approved and (today - approved.for_week_starting).days < 15:
            return Response({
                'id': approved.id,
                'week_starting': str(approved.for_week_starting),
                'meals': approved.meals,
                'total_average_nutrition': {
                    'calories': approved.calories,
                    'protein': approved.protein,
                    'carbs': approved.carbs,
                    'fats': approved.fats,
                },
                'nutritionist_comment': approved.nutritionist_comment,
                'reviewed_by': approved.reviewed_by.email if approved.reviewed_by else None,
                'nutritionist_full_name': approved.reviewed_by.full_name if approved.reviewed_by else None,
                'status': approved.status,
            })

        # ✅ 3. Check if most recent diet was rejected and no pending exists
        latest = DietRecommendation.objects.filter(user=request.user).order_by('-created_at').first()
        if latest and latest.status != 'rejected':
            return Response({'message': 'No need to generate a new diet yet.'}, status=202)

        # ✅ 4. Generate new diet
        start_date = today
        generated = recommend_meals(profile, start_date=start_date, days_count=15)
        daily_nutrition = generated['daily_nutrition']
        avg_nutrition = {
            'calories': round(sum(day['calories'] for day in daily_nutrition.values()) / 15, 2),
            'protein': round(sum(day['protein'] for day in daily_nutrition.values()) / 15, 2),
            'carbs': round(sum(day['carbs'] for day in daily_nutrition.values()) / 15, 2),
            'fats': round(sum(day['fats'] for day in daily_nutrition.values()) / 15, 2),
        }

        new_rec = DietRecommendation.objects.create(
            user=request.user,
            for_week_starting=start_date,
            meals=generated['meals'],
            calories=avg_nutrition['calories'],
            protein=avg_nutrition['protein'],
            carbs=avg_nutrition['carbs'],
            fats=avg_nutrition['fats'],
            status='pending',
            reviewed_by=None,
            nutritionist_comment='',
        )

        return Response({
            'message': 'New diet generated and is now under review.',
            'status': new_rec.status
        }, status=202)

class DailyDietRecommendationView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        date_str = request.query_params.get('date')
        if not date_str:
            return Response({'error': 'date parameter required (YYYY-MM-DD)'}, status=400)

        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format'}, status=400)

        try:
            profile = request.user.userprofile
        except UserProfile.DoesNotExist:
            return Response({'error': 'User profile not found.'}, status=404)

        # ✅ Get latest recommendation that started on or before the target date
        recommendation = DietRecommendation.objects.filter(
            user=request.user,
            for_week_starting__lte=target_date
        ).order_by('-for_week_starting').first()

        if not recommendation:
            return Response({'error': 'No diet recommendation generated yet for this start date.'}, status=404)

        # ✅ Check if the date is within the 15-day range
        end_date = recommendation.for_week_starting + timedelta(days=14)
        if not (recommendation.for_week_starting <= target_date <= end_date):
            return Response({'error': 'Date is outside of the generated 15-day range.'}, status=404)

        if not recommendation.approved_by_nutritionist:
            return Response({'error': 'Your diet recommendation is pending approval.'}, status=403)

        # ✅ Meals is stored directly as:
        # { "2025-06-16": { "day": ..., "meals": ... }, ... }
        meals = recommendation.meals

        if date_str not in meals:
            return Response({'error': 'Date not found in stored recommendation.'}, status=404)

        generated = recommend_meals(profile, start_date=recommendation.for_week_starting, days_count=15)
        daily_nutrition = generated['daily_nutrition'].get(date_str, {})

        return Response({
            'date': date_str,
            'day': meals[date_str]['day'],
            'meals': meals[date_str]['meals'],
            'nutrition': daily_nutrition,
            'nutritionist_comment': recommendation.nutritionist_comment,
            'reviewed_by': recommendation.reviewed_by.email if recommendation.reviewed_by else None,
            'approved': recommendation.approved_by_nutritionist,
        })
# POST Regenerate Full 15-Day Diet Recommendation

class RegenerateDailyDietRecommendationView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        try:
            profile = user.userprofile
        except UserProfile.DoesNotExist:
            return Response({'error': 'User profile not found.'}, status=404)

        today = now().date()

        # ⚠️ Check if a plan already exists today
        existing = DietRecommendation.objects.filter(
            user=user,
            for_week_starting=today
        ).first()

        if existing:
            # Optional: Reject the previous one (if still pending)
            if not existing.approved_by_nutritionist and not existing.nutritionist_comment:
                existing.nutritionist_comment = "Auto-rejected due to manual regeneration."
                existing.save()

        # ✅ Always create a new one with today as start
        generated = recommend_meals(profile, start_date=today, days_count=15)
        daily_nutrition = generated['daily_nutrition']

        nutrition = {
            'calories': round(sum(day['calories'] for day in daily_nutrition.values()) / 15, 2),
            'protein': round(sum(day['protein'] for day in daily_nutrition.values()) / 15, 2),
            'carbs': round(sum(day['carbs'] for day in daily_nutrition.values()) / 15, 2),
            'fats': round(sum(day['fats'] for day in daily_nutrition.values()) / 15, 2),
        }

        new_recommendation = DietRecommendation.objects.create(
            user=user,
            for_week_starting=today,
            meals=generated['meals'],
            calories=nutrition['calories'],
            protein=nutrition['protein'],
            carbs=nutrition['carbs'],
            fats=nutrition['fats'],
            approved_by_nutritionist=False,
            reviewed_by=None,
            nutritionist_comment='',
        )

        return Response({
            'id': new_recommendation.id,
            'status': 'new_plan_generated',
            'generated_for_start_date': str(today),
            'meals': generated['meals'],
            'daily_nutrition': daily_nutrition,
        }, status=201)


#User diet feedback model
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_diet_feedback(request):
    serializer = DietFeedbackSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response({"message": "Feedback submitted successfully."}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_feedback_for_recommendation(request, recommendation_id):

    feedbacks = DietFeedback.objects.filter(recommendation_id=recommendation_id, user=request.user)
    serializer = DietFeedbackSerializer(feedbacks, many=True)
    return Response(serializer.data)



########################------Nutritionist Dashboard View------########################


class IsNutritionist(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'nutritionist'

#to view all users
class UserListForNutritionistView(ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsNutritionist]
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # ✅ Filter fields (e.g., active users only)
    filterset_fields = ['is_active']
    
    # ✅ Search fields (email or full name)
    search_fields = ['email', 'full_name']
    
    # ✅ Ordering fields (default = by 'date_joined')
    ordering_fields = ['date_joined', 'email']

#Assign patients to nutritionists{POST}
class AssignPatientAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNutritionist]

    def post(self, request):
        patient_id = request.data.get('patient_id')
        try:
            patient = User.objects.get(id=patient_id)
            PatientAssignment.objects.get_or_create(nutritionist=request.user, patient=patient)
            return Response({'message': 'Patient assigned successfully'})
        except User.DoesNotExist:
            return Response({'error': 'Invalid patient ID'}, status=404)

# List assigned patients {get}
class AssignedPatientsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNutritionist]

    def get(self, request):
        assigned = PatientAssignment.objects.filter(nutritionist=request.user)
        data = [{'id': p.patient.id, 'email': p.patient.email} for p in assigned]
        return Response(data)

#Patient Profile View
class PatientProfileDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNutritionist]

    def get(self, request, patient_id):
        try:
            assignment = PatientAssignment.objects.get(nutritionist=request.user, patient_id=patient_id)
            user_profile = UserProfile.objects.get(user_id=patient_id)
            diabetic_profiles = DiabeticProfile.objects.filter(user_profile=user_profile)

            return Response({
                'user_profile': {
                    'age': user_profile.age,
                    'weight': user_profile.weight_kg,
                    'height': user_profile.height_cm,
                    'activity_level': user_profile.activity_level,
                    'health_conditions': user_profile.health_conditions,
                },
                'diabetic_profiles': [
                    {
                        'hba1c': profile.hba1c,
                        'fasting_blood_sugar': profile.fasting_blood_sugar,
                        'diabetes_type': profile.diabetes_type,
                        'total_cholesterol': profile.total_cholesterol,
                        'medications': profile.medications,
                    }
                    for profile in diabetic_profiles
                ]
            })
        except (PatientAssignment.DoesNotExist, UserProfile.DoesNotExist):
            return Response({'error': 'Data not found or not assigned'}, status=404)

#Patient Meal Log View
class PatientMealLogView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNutritionist]

    def get(self, request, patient_id):
        if not PatientAssignment.objects.filter(nutritionist=request.user, patient_id=patient_id).exists():
            return Response({'error': 'Unauthorized'}, status=403)

        meals = UserMeal.objects.filter(user_id=patient_id).order_by('-date')

        paginator = StandardResultsSetPagination()
        result_page = paginator.paginate_queryset(meals, request)

        return paginator.get_paginated_response([
            {
                'meal_type': meal.meal_type,
                'food': meal.food_name,
                'calories': meal.calories,
                'date': meal.date,
                'time': meal.consumed_at.strftime('%H:%M:%S') if meal.consumed_at else None,
            }
            for meal in result_page
        ])
#Approve reject edit diet plan
# class ApproveOrRejectDietView(APIView):

#     permission_classes = [permissions.IsAuthenticated, IsNutritionist]

#     def post(self, request, recommendation_id):
#         action = request.data.get("action")  # 'approve' or 'reject'
#         comment = request.data.get("comment", "")

#         try:
#             recommendation = DietRecommendation.objects.get(id=recommendation_id)
#         except DietRecommendation.DoesNotExist:
#             return Response({'error': 'Recommendation not found'}, status=404)

#         if action == "approve":
#             recommendation.approved_by_nutritionist = True
#         elif action == "reject":
#             recommendation.approved_by_nutritionist = False
#         else:
#             return Response({'error': 'Invalid action'}, status=400)

#         recommendation.reviewed_by = request.user
#         recommendation.nutritionist_comment = comment
#         recommendation.save()
#         return Response({'message': f'Diet {action}d successfully'})

# #feeback + rating 
# class NutritionistFeedbackOnDiet(APIView):
#     permission_classes = [permissions.IsAuthenticated, IsNutritionist]

#     def post(self, request, recommendation_id):
#         feedback = request.data.get("feedback", "")
#         approved = request.data.get("approved", False)

#         try:
#             recommendation = DietRecommendation.objects.get(id=recommendation_id)
#             DietRecommendationFeedback.objects.create(
#                 recommendation=recommendation,
#                 nutritionist=request.user,
#                 feedback=feedback,
#                 approved_for_training=approved
#             )
#             return Response({'message': 'Feedback submitted for retraining'})
#         except DietRecommendation.DoesNotExist:
#             return Response({'error': 'Recommendation not found'}, status=404)

# #edit diet plant
# class EditDietPlanView(APIView):
#     permission_classes = [permissions.IsAuthenticated, IsNutritionist]

#     def patch(self, request, pk):
#         patient_id = request.data.get("patient_id")
#         if not patient_id:
#             return Response({"error": "patient_id is required"}, status=400)

#         # Check if nutritionist is assigned to this patient
#         if not PatientAssignment.objects.filter(nutritionist=request.user, patient_id=patient_id).exists():
#             return Response({'error': 'Unauthorized: Patient not assigned to you'}, status=403)

#         try:
#             recommendation = DietRecommendation.objects.get(pk=pk, user_id=patient_id)
#         except DietRecommendation.DoesNotExist:
#             return Response({'error': 'Diet recommendation not found'}, status=404)

#         data = request.data.copy()

#         # Deep merge meals
#         if 'meals' in data:
#          current_meals = copy.deepcopy(recommendation.meals or {})

#         for date, incoming_data in data['meals'].items():
#             if date not in current_meals:
#              current_meals[date] = incoming_data
#         else:
#             # Merge the inner structure correctly
#             current_day = current_meals[date]
#             incoming_day = incoming_data

#             # Merge 'day'
#             current_day['day'] = incoming_day.get('day', current_day.get('day'))

#             # Merge 'meals'
#             if 'meals' in incoming_day:
#                 current_day_meals = current_day.get('meals', {})
#                 current_day_meals.update(incoming_day['meals'])
#                 current_day['meals'] = current_day_meals

#             current_meals[date] = current_day

#             data['meals'] = current_meals

#         serializer = DietRecommendationPatchSerializer(recommendation, data=data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=400)

# #dIET RECOMMENDATION of all users

class NutritionistDietRecommendationsView(ListAPIView):
    permission_classes = [IsAuthenticated, IsNutritionist]
    serializer_class = DietRecommendationWithPatientSerializer

    def get_queryset(self):
        assigned_patient_ids = PatientAssignment.objects.filter(
            nutritionist=self.request.user
        ).values_list('patient_id', flat=True)

        return DietRecommendation.objects.filter(user_id__in=assigned_patient_ids).select_related('user').order_by('-for_week_starting')

#diet recommendation by patiend id
class NutritionistPatientDietRecommendationsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsNutritionist]
    serializer_class = DietRecommendationWithPatientSerializer

    def get_queryset(self):
        patient_id = self.kwargs['patient_id']
        
        # Ensure the nutritionist is assigned to this patient
        if not PatientAssignment.objects.filter(nutritionist=self.request.user, patient_id=patient_id).exists():
            raise PermissionDenied("You are not assigned to this patient")

        return DietRecommendation.objects.filter(user_id=patient_id).order_by('-for_week_starting')

class ApproveOrRejectDietView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNutritionist]

    def post(self, request, recommendation_id):
        action = request.data.get("action")  # 'approve' or 'reject'
        comment = request.data.get("comment", "")

        try:
            recommendation = DietRecommendation.objects.get(id=recommendation_id)
        except DietRecommendation.DoesNotExist:
            return Response({'error': 'Recommendation not found'}, status=404)

        if action not in ["approve", "reject"]:
            return Response({'error': 'Invalid action. Use "approve" or "reject".'}, status=400)

        recommendation.status = "approved" if action == "approve" else "rejected"
        recommendation.reviewed_by = request.user
        recommendation.nutritionist_comment = comment
        recommendation.save()

        return Response({'message': f'Diet {action}d successfully'})

class NutritionistFeedbackOnDiet(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNutritionist]

    def post(self, request, recommendation_id):
        feedback = request.data.get("feedback", "")
        approved = request.data.get("approved", False)

        try:
            recommendation = DietRecommendation.objects.get(id=recommendation_id)
            DietRecommendationFeedback.objects.create(
                recommendation=recommendation,
                nutritionist=request.user,
                feedback=feedback,
                approved_for_training=approved
            )
            return Response({'message': 'Feedback submitted for retraining'})
        except DietRecommendation.DoesNotExist:
            return Response({'error': 'Recommendation not found'}, status=404)

class EditDietPlanView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNutritionist]

    def patch(self, request, pk):
        patient_id = request.data.get("patient_id")
        if not patient_id:
            return Response({"error": "patient_id is required"}, status=400)

        if not PatientAssignment.objects.filter(nutritionist=request.user, patient_id=patient_id).exists():
            return Response({'error': 'Unauthorized: Patient not assigned to you'}, status=403)

        try:
            recommendation = DietRecommendation.objects.get(pk=pk, user_id=patient_id)
        except DietRecommendation.DoesNotExist:
            return Response({'error': 'Diet recommendation not found'}, status=404)

        if recommendation.status == 'approved':
            return Response({'error': 'Approved diet cannot be edited.'}, status=403)

        data = request.data.copy()

        # Deep merge meals
        if 'meals' in data:
            current_meals = copy.deepcopy(recommendation.meals or {})

            for date, incoming_data in data['meals'].items():
                if date not in current_meals:
                    current_meals[date] = incoming_data
                else:
                    current_day = current_meals[date]
                    incoming_day = incoming_data

                    current_day['day'] = incoming_day.get('day', current_day.get('day'))

                    if 'meals' in incoming_day:
                        current_day_meals = current_day.get('meals', {})
                        current_day_meals.update(incoming_day['meals'])
                        current_day['meals'] = current_day_meals

                    current_meals[date] = current_day

            data['meals'] = current_meals

        serializer = DietRecommendationPatchSerializer(recommendation, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
############-------------End of Nutritionist Dashboard View-----------------###############


################------------Application FeedBack from User-----------------######################
class FeedbackCreateView(generics.CreateAPIView):
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


###########--------------Tools(Weight,water,CUstom reminder)------------------##############

class WeightLogViewSet(viewsets.ModelViewSet):
    serializer_class = WeightLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = WeightLog.objects.all()
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['date']
    ordering_fields = ['date', 'time_logged']
    ordering = ['-time_logged']

    def get_queryset(self):
        return WeightLog.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class WaterIntakeLogViewSet(viewsets.ModelViewSet):
    queryset = WaterIntakeLog.objects.all()
    serializer_class = WaterIntakeLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['date']  # Enable ?date=YYYY-MM-DD filter
    ordering_fields = ['date']
    ordering = ['-date']

    def perform_create(self, serializer):
        today = timezone.now().date()
        amount_ml = serializer.validated_data.get('amount_ml')

        obj, created = WaterIntakeLog.objects.get_or_create(
            user=self.request.user,
            date=today,
            defaults={'amount_ml': amount_ml}  # 🟢 FIX: Provide default to avoid NOT NULL error
        )

        if not created:
            obj.amount_ml += amount_ml
            obj.save()

        response_serializer = self.get_serializer(obj)
        raise serializers.ValidationError(response_serializer.data)  # Unusual pattern, but kept as-is by your code

    def create(self, request, *args, **kwargs):
        today = timezone.now().date()
        amount_ml = request.data.get('amount_ml')

        if amount_ml is None:
            return Response({'error': 'amount_ml is required'}, status=400)

        obj, created = WaterIntakeLog.objects.get_or_create(
            user=request.user,
            date=today,
            defaults={'amount_ml': amount_ml}  # 🟢 FIX: Provide default here to satisfy NOT NULL constraint
        )

        serializer = self.get_serializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        if not created:
            obj.amount_ml += serializer.validated_data['amount_ml']
            obj.save()

        return Response(self.get_serializer(obj).data, status=status.HTTP_201_CREATED)

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='total')
    def total_water_intake(self, request):
        date = request.query_params.get('date')
        if not date:
            return Response({"error": "date query param required"}, status=400)

        total = self.get_queryset().filter(date=date).aggregate(total_ml=Sum('amount_ml'))['total_ml'] or 0
        return Response({"date": date, "total_water_ml": total})

class CustomReminderViewSet(viewsets.ModelViewSet):
    queryset = CustomReminder.objects.all()
    serializer_class = CustomReminderSerializer
    permission_classes = [permissions.IsAuthenticated]

    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['frequency', 'is_active']
    ordering_fields = ['reminder_time', 'created_at']
    ordering = ['reminder_time']

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)



class CanSendMessage(BasePermission):
    """
    Custom permission:
    - Nutritionists → can send to assigned patients
    - Patients → can send to their assigned nutritionist
    """

    def has_permission(self, request, view):
        receiver_id = request.data.get('receiver')
        if not receiver_id:
            return False

        user = request.user

        # If user is a nutritionist, can only message assigned patients
        if getattr(user, 'role', None) == 'nutritionist':
            return PatientAssignment.objects.filter(nutritionist=user, patient_id=receiver_id).exists()

        # If user is a patient, can only message their assigned nutritionist
        if getattr(user, 'role', None) == 'user':
            return PatientAssignment.objects.filter(patient=user, nutritionist_id=receiver_id).exists()

        # Other roles (e.g., operator) → Denied
        return False

class SendMessageView(generics.CreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated, CanSendMessage]

    def perform_create(self, serializer):
        receiver_id = self.request.data.get('receiver')
        serializer.save(sender=self.request.user, receiver_id=receiver_id)

class MessageListView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(
            Q(sender=self.request.user) | Q(receiver=self.request.user)
        ).order_by('-timestamp')        


class FoodItemListView(ListAPIView):
    queryset = FoodItem.objects.all()
    serializer_class = FoodItemSerializer2
    filter_backends = [SearchFilter, DjangoFilterBackend]
    search_fields = ['name']  # ✅ Allows ?search=Apple
    pagination_class = StandardResultsSetPagination



class BlogListCreateView(generics.ListCreateAPIView):
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    queryset = Blog.objects.all().order_by('-created_at')
    serializer_class = BlogSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination

class BlogDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Blog.objects.all()
    serializer_class = BlogSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_update(self, serializer):
        if self.request.user != self.get_object().author:
            raise PermissionDenied("You can only edit your own blogs.")
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user != instance.author:
            raise PermissionDenied("You can only delete your own blogs.")
        instance.delete()
