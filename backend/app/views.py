from django.shortcuts import render, HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import BasePermission
from django.db.models import Sum
from django.db.models import Count
from rest_framework.exceptions import ValidationError   
from utils.utils import UNIT_TO_GRAMS,role_required,generate_diet_recommendation
from .ml_diet.predict import recommend_meals
from datetime import datetime, time
from rest_framework.views import APIView
from rest_framework import views
from rest_framework.permissions import IsAuthenticated
import copy
from rest_framework.exceptions import NotFound
from rapidfuzz import process, fuzz
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from django.utils.dateparse import parse_date
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from datetime import timedelta
from django.utils.timezone import now
from django.core.mail import send_mail
from rest_framework import status
from rest_framework import generics, permissions
from .models import (
    User, UserProfile, DiabeticProfile,UserMeal,
    FoodItem,PatientReminder, NutritionistProfile,
    DietRecommendation,DietFeedback,
    PatientAssignment, UserMeal, DietRecommendationFeedback,
    Feedback,
    )
from .serializers import (
        RegisterSerializer, UserProfileSerializer,DiabeticProfileSerializer,
        UserMealSerializer,PatientReminderSerializer,
        DietRecommendationSerializer,
        DietFeedbackSerializer,
        DietRecommendationPatchSerializer,
        FeedbackSerializer,
    )
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer

# Create your views here.

####################################DECORATORS####################################
#####################################DECORATORS###################################

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
    API view to create a new UserProfile for the authenticated user.
    Accepts profile data in POST request.
    Links the created profile with the current logged-in user automatically.
    Requires the user to be authenticated.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        """
        Overrides creation to attach the current user to the profile before saving.
        """
        serializer.save(user=self.request.user)


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

# class UserMealViewSet(viewsets.ModelViewSet):
#     serializer_class = UserMealSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         return UserMeal.objects.filter(user=self.request.user)

#     def create(self, request, *args, **kwargs):
#         user = request.user
#         data = request.data

#         if isinstance(data, dict):  # Single object
#             data = [data]

#         response_data = []

#         for item in data:
#             serializer = self.get_serializer(data=item)
#             serializer.is_valid(raise_exception=True)

#             food_name = serializer.validated_data.get("food_name")
#             quantity = serializer.validated_data.get("quantity")
#             unit = serializer.validated_data.get("unit").lower()
#             meal_type = serializer.validated_data.get("meal_type")

#             try:
#                 food_item = FoodItem.objects.get(name__iexact=food_name)
#             except FoodItem.DoesNotExist:
#                 raise ValidationError(f"Food item '{food_name}' not found in database.")

#             grams_per_unit = UNIT_TO_GRAMS.get(unit, 100)
#             weight_in_grams = quantity * grams_per_unit

#             calories = (weight_in_grams / 100) * food_item.calories
#             protein = (weight_in_grams / 100) * food_item.protein_g
#             carbs = (weight_in_grams / 100) * food_item.carbs_g
#             fats = (weight_in_grams / 100) * food_item.fats_g
#             sugar = (weight_in_grams / 100) * food_item.sugar_g
#             fiber = (weight_in_grams / 100) * food_item.fiber_g

#             instance = serializer.save(
#                 user=user,
#                 food_item=food_item,
#                 food_name=food_item.name,
#                 meal_type=meal_type,
#                 calories=round(calories, 2),
#                 protein=round(protein, 2),
#                 carbs=round(carbs, 2),
#                 fats=round(fats, 2),
#                 sugar=round(sugar, 2),
#                 fiber=round(fiber, 2),
#             )

#             response_data.append(self.get_serializer(instance).data)

#         return Response(response_data, status=status.HTTP_201_CREATED)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 4
    page_size_query_param = 'page_size'
    max_page_size = 100


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
                protein=round((weight_in_grams / 100) * food_item.protein_g, 2),
                carbs=round((weight_in_grams / 100) * food_item.carbs_g, 2),
                fats=round((weight_in_grams / 100) * food_item.fats_g, 2),
                sugar=round((weight_in_grams / 100) * food_item.sugar_g, 2),
                fiber=round((weight_in_grams / 100) * food_item.fiber_g, 2),
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

        return Response({
            "bmr": round(bmr),
            "maintenance_calories": round(maintenance_calories),
            "recommended_calories": round(recommended_calories),
            "macronutrients": {
                "protein_g": protein_grams,
                "carbs_g": carbs_grams,
                "fats_g": fats_grams,
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
    
#########################################################################################################################################

############ Nutritionist Dashboard View


###########################################DIET RECOMMENDATION API ENDPOINTS###########################################
# Weekly API (GET)
# class WeeklyDietRecommendationView(views.APIView):
#     permission_classes = [permissions.IsAuthenticated]

#     def get(self, request):
#         try:
#             profile = request.user.userprofile
#         except UserProfile.DoesNotExist:
#             return Response({'error': 'User profile not found.'}, status=404)

#         week_start = now().date() - timedelta(days=now().weekday())

#         # Try fetching existing recommendation
#         recommendation, created = DietRecommendation.objects.get_or_create(
#             user=request.user,
#             for_week_starting=week_start,
#             defaults={'meals': {}, 'calories': 0, 'protein': 0, 'carbs': 0, 'fats': 0}
#         )

#         generated = recommend_meals(profile)

#         return Response({
#             'id': recommendation.id,  # Include recommendation ID here
#             'week_starting': str(week_start),
#             'meals': generated['meals'],
#             'daily_nutrition': generated['daily_nutrition'],
#         })
##################### Old is up


# class WeeklyDietRecommendationView(views.APIView):
#     permission_classes = [permissions.IsAuthenticated]

#     def get(self, request):
#         try:
#             profile = request.user.userprofile
#         except UserProfile.DoesNotExist:
#             return Response({'error': 'User profile not found.'}, status=404)

#         week_start = now().date() - timedelta(days=now().weekday())

#         try:
#             recommendation = DietRecommendation.objects.get(user=request.user, for_week_starting=week_start)
#         except DietRecommendation.DoesNotExist:
#             return Response({'error': 'No diet recommendation generated yet.'}, status=404)

#         if not recommendation.approved_by_nutritionist:
#             return Response({'error': 'Your diet recommendation is pending approval.'}, status=403)

#         return Response({
#             'id': recommendation.id,
#             'week_starting': str(week_start),
#             'meals': recommendation.meals,
#             'daily_nutrition': {
#                 'calories': recommendation.calories,
#                 'protein': recommendation.protein,
#                 'carbs': recommendation.carbs,
#                 'fats': recommendation.fats,
#             },
#             'nutritionist_comment': recommendation.nutritionist_comment,
#             'reviewed_by': recommendation.reviewed_by.email if recommendation.reviewed_by else None,
#             'approved': recommendation.approved_by_nutritionist,
#         })

# #  Daily API (GET specific day)
# class DailyDietRecommendationView(views.APIView):
#     permission_classes = [permissions.IsAuthenticated]

#     def get(self, request):
#         date_str = request.query_params.get('date')
#         if not date_str:
#             return Response({'error': 'date parameter required (YYYY-MM-DD)'}, status=400)

#         try:
#             target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
#         except ValueError:
#             return Response({'error': 'Invalid date format'}, status=400)

#         weekday = target_date.strftime('%A')

#         try:
#             profile = request.user.userprofile
#         except UserProfile.DoesNotExist:
#             return Response({'error': 'User profile not found.'}, status=404)

#         week_start = target_date - timedelta(days=target_date.weekday())

#         recommendation, created = DietRecommendation.objects.get_or_create(
#             user=request.user,
#             for_week_starting=week_start,
#             defaults={'meals': {}, 'calories': 0, 'protein': 0, 'carbs': 0, 'fats': 0}
#         )

#         generated = recommend_meals(profile)

#         return Response({
#             'id': recommendation.id,  # Include recommendation ID here
#             'date': date_str,
#             'day': weekday,
#             'meals': {weekday: generated['meals'].get(weekday)},
#             'nutrition': {weekday: generated['daily_nutrition'].get(weekday)},
#         })
# #  Daily Regenerate API (POST)
# class RegenerateDailyDietRecommendationView(views.APIView):
#     permission_classes = [permissions.IsAuthenticated]

#     def post(self, request):
#         user = request.user
#         try:
#             profile = user.userprofile
#         except UserProfile.DoesNotExist:
#             return Response({'error': 'User profile not found.'}, status=404)

#         today = now().date()
#         week_start = today - timedelta(days=today.weekday())

#         generated = recommend_meals(profile)
#         daily_nutrition = generated['daily_nutrition']

#         nutrition = {
#             'calories': round(sum(day['calories'] for day in daily_nutrition.values()) / 7, 2),
#             'protein': round(sum(day['protein'] for day in daily_nutrition.values()) / 7, 2),
#             'carbs': round(sum(day['carbs'] for day in daily_nutrition.values()) / 7, 2),
#             'fats': round(sum(day['fats'] for day in daily_nutrition.values()) / 7, 2),
#         }

#         recommendation, created = DietRecommendation.objects.update_or_create(
#             user=user,
#             for_week_starting=week_start,
#             defaults={
#                 'meals': {'generated_on': str(today), 'meals': generated['meals']},
#                 'calories': nutrition['calories'],
#                 'protein': nutrition['protein'],
#                 'carbs': nutrition['carbs'],
#                 'fats': nutrition['fats'],
#             }
#         )

#         return Response({
#             'id': recommendation.id,  # Include ID in response
#             'status': 'success',
#             'generated_for_week': str(week_start),
#             'meals': generated['meals'],
#             'daily_nutrition': daily_nutrition,
#         }, status=200)




class WeeklyDietRecommendationView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.userprofile
        except UserProfile.DoesNotExist:
            return Response({'error': 'User profile not found.'}, status=404)

        start_date = now().date()

        try:
            recommendation = DietRecommendation.objects.get(user=request.user, for_week_starting=start_date)
        except DietRecommendation.DoesNotExist:
            return Response({'error': 'No diet recommendation generated yet.'}, status=404)

        if not recommendation.approved_by_nutritionist:
            return Response({'error': 'Your diet recommendation is pending approval.'}, status=403)

        # 👇 Generate the full 15-day diet again to get the nutrition per day
        generated = recommend_meals(profile, start_date=start_date, days_count=15)

        return Response({
            'id': recommendation.id,
            'week_starting': str(start_date),
            'meals': recommendation.meals,  # This has the meals per date already
            'daily_nutrition': generated['daily_nutrition'],  # 👈 Now includes protein, carbs, fats PER DAY
            'total_average_nutrition': {
                'calories': recommendation.calories,
                'protein': recommendation.protein,
                'carbs': recommendation.carbs,
                'fats': recommendation.fats,
            },
            'nutritionist_comment': recommendation.nutritionist_comment,
            'reviewed_by': recommendation.reviewed_by.email if recommendation.reviewed_by else None,
            'approved': recommendation.approved_by_nutritionist,
        })

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

        generated = recommend_meals(profile, start_date=today, days_count=15)
        daily_nutrition = generated['daily_nutrition']

        nutrition = {
            'calories': round(sum(day['calories'] for day in daily_nutrition.values()) / 15, 2),
            'protein': round(sum(day['protein'] for day in daily_nutrition.values()) / 15, 2),
            'carbs': round(sum(day['carbs'] for day in daily_nutrition.values()) / 15, 2),
            'fats': round(sum(day['fats'] for day in daily_nutrition.values()) / 15, 2),
        }

        recommendation, created = DietRecommendation.objects.update_or_create(
            user=user,
            for_week_starting=today,
            defaults={
                'meals': generated['meals'],  # ✅ FIXED → FLAT meals dictionary
                'calories': nutrition['calories'],
                'protein': nutrition['protein'],
                'carbs': nutrition['carbs'],
                'fats': nutrition['fats'],
                # 'approved_by_nutritionist': False,  # ✅ Reset approval
                # 'reviewed_by': None,                # ✅ Remove reviewer
                # 'nutritionist_comment': '',         # ✅ Clear comment
            }
        )

        return Response({
            'id': recommendation.id,
            'status': 'success',
            'generated_for_start_date': str(today),
            'meals': generated['meals'],
            'daily_nutrition': daily_nutrition,
        }, status=200)


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
            diabetic_profile = DiabeticProfile.objects.get(user_profile=user_profile)

            return Response({
                'user_profile': {
                    'age': user_profile.age,
                    'weight': user_profile.weight_kg,
                    'height': user_profile.height_cm,
                    'activity_level': user_profile.activity_level,
                    'health_conditions': user_profile.health_conditions
                },
                'diabetic_profile': {
                    'hba1c': diabetic_profile.hba1c,
                    'fasting_blood_sugar': diabetic_profile.fasting_blood_sugar,
                    'medications': diabetic_profile.medications,
                }
            })
        except (PatientAssignment.DoesNotExist, UserProfile.DoesNotExist, DiabeticProfile.DoesNotExist):
            return Response({'error': 'Data not found or not assigned'}, status=404)

#Patient Meal Log View
class PatientMealLogView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNutritionist]

    def get(self, request, patient_id):
        if not PatientAssignment.objects.filter(nutritionist=request.user, patient_id=patient_id).exists():
            return Response({'error': 'Unauthorized'}, status=403)

        meals = UserMeal.objects.filter(user_id=patient_id).order_by('-date')
        return Response([
            {
                'meal_type': meal.meal_type,
                'food': meal.food_name,
                'calories': meal.calories,
                'date': meal.date,
                'time': meal.consumed_at.strftime('%H:%M:%S') if meal.consumed_at else None,
            }
            for meal in meals
        ])

#Approve reject edit diet plan
class ApproveOrRejectDietView(APIView):

    permission_classes = [permissions.IsAuthenticated, IsNutritionist]

    def post(self, request, recommendation_id):
        action = request.data.get("action")  # 'approve' or 'reject'
        comment = request.data.get("comment", "")

        try:
            recommendation = DietRecommendation.objects.get(id=recommendation_id)
        except DietRecommendation.DoesNotExist:
            return Response({'error': 'Recommendation not found'}, status=404)

        if action == "approve":
            recommendation.approved_by_nutritionist = True
        elif action == "reject":
            recommendation.approved_by_nutritionist = False
        else:
            return Response({'error': 'Invalid action'}, status=400)

        recommendation.reviewed_by = request.user
        recommendation.nutritionist_comment = comment
        recommendation.save()
        return Response({'message': f'Diet {action}d successfully'})

#feeback + rating 
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

#edit diet plant
class EditDietPlanView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNutritionist]

    def patch(self, request, pk):
        try:
            recommendation = DietRecommendation.objects.get(pk=pk, user=request.user)
        except DietRecommendation.DoesNotExist:
            return Response({'error': 'Diet recommendation not found'}, status=404)

        data = request.data.copy()

        # Deep merge for meals
        if 'meals' in data:
            current_meals = copy.deepcopy(recommendation.meals or {})
            for day, meals in data['meals'].items():
                if day in current_meals:
                    current_meals[day].update(meals)
                else:
                    current_meals[day] = meals
            data['meals'] = current_meals

        # Deep merge for daily_nutrition
        if 'daily_nutrition' in data:
            current_nutrition = copy.deepcopy(recommendation.daily_nutrition or {})
            for day, nutrition in data['daily_nutrition'].items():
                if day in current_nutrition:
                    current_nutrition[day].update(nutrition)
                else:
                    current_nutrition[day] = nutrition
            data['daily_nutrition'] = current_nutrition

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