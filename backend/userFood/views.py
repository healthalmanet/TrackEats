from datetime import date, timedelta, datetime, time
from django.utils.timezone import now
from django.utils.dateparse import parse_date
from django.db.models import Sum
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import api_view, permission_classes


from utils.pagination import StandardResultsSetPagination
from utils.gemini import fetch_nutrition_from_gemini

from .serializers import UserMealSerializer

from .models import UserMeal, FoodItem
from userProfile.models import UserProfile


FUZZY_MATCH_THRESHOLD = 90

class UserMealViewSet(viewsets.ModelViewSet):
    serializer_class = UserMealSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    ordering_fields = ['consumed_at']
    ordering = ['-consumed_at']
    filterset_fields = ['date', 'meal_type'] # Removed 'user' as it's auto-filtered

    def get_queryset(self):
        """
        Always filter UserMeal objects for the currently authenticated user.
        """
        return UserMeal.objects.filter(user=self.request.user).order_by('-consumed_at')

    def create(self, request, *args, **kwargs):
        from dateutil import parser
        from fuzzywuzzy import process

        def process_meal(item_data):
            """
            Processes a single meal item from the request payload.
            """
            food_name = item_data.get("food_name", "").strip().lower()
            if not food_name:
                raise ValueError("`food_name` cannot be empty.")
                
            quantity = float(item_data.get("quantity", 1))
            unit = item_data.get("unit", "g")
            meal_type = item_data.get("meal_type", "breakfast")
            remarks = item_data.get("remarks", "")
            consumed_at_str = item_data.get("consumed_at")
            date_str = item_data.get("date")

            try:
                consumed_at = parser.parse(consumed_at_str) if consumed_at_str else timezone.now()
                date = parser.parse(date_str).date() if date_str else consumed_at.date()
            except Exception as e:
                raise ValueError(f"Invalid date/time format: {e}")

            # 1. Exact Match (case-insensitive)
            food = FoodItem.objects.filter(name__iexact=food_name).first()

            # 2. Fuzzy Match
            if not food:
                all_names = list(FoodItem.objects.values_list("name", flat=True))
                if all_names:
                    match_result = process.extractOne(food_name, all_names)
                    if match_result and match_result[1] >= FUZZY_MATCH_THRESHOLD:
                        food = FoodItem.objects.get(name=match_result[0])

            # 3. Gemini AI Fallback
            if not food:
                try:
                    print(f"Food '{food_name}' not found. Querying Gemini...")
                    # --- ✅ THIS IS THE CORRECTED PART ---
                    # The Gemini function now returns a dictionary ready for the model
                    gemini_data = fetch_nutrition_from_gemini(food_name, quantity, unit)
                    
                    # Unpack the dictionary to create the FoodItem
                    food = FoodItem.objects.create(**gemini_data) 
                    print(f"Successfully created new food item '{food.name}' via Gemini.")
                    # --- END CORRECTION ---

                except Exception as e:
                    # Catch errors from the Gemini call and return a clear message
                    raise ValueError(f"AI nutrition lookup failed for '{food_name}': {e}")

            # 4. Create the UserMeal log entry
            # The nutritional values are now taken directly from the definitive `food` object
            # This ensures consistency whether the food was found in the DB or created by AI
            return UserMeal.objects.create(
                user=request.user,
                food_item=food,
                food_name=food.name,
                quantity=quantity,
                unit=unit,
                meal_type=meal_type,
                remarks=remarks,
                calories=food.calories,
                protein=food.protein,
                carbs=food.carbs,
                fats=food.fats,
                sugar=food.sugar,
                fiber=food.fiber,
                estimated_gi=food.estimated_gi,
                glycemic_load=food.glycemic_load,
                food_type=food.food_type,
                consumed_at=consumed_at,
                date=date
            )

        try:
            payload = request.data
            # Handles both a single meal object and a list of meal objects
            meals = [process_meal(item) for item in payload] if isinstance(payload, list) else [process_meal(payload)]
            
            serializer = self.get_serializer(meals, many=True)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except ValueError as e:
            # Catches custom errors raised within process_meal
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Catches unexpected errors
            import traceback
            traceback.print_exc()
            return Response({"error": "An unexpected error occurred while logging meals.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#7day track
class DailyUserMealSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        start_date_str = request.query_params.get('start_date')
        if start_date_str:
            try:
                start_date = parse_date(start_date_str)
                end_date = start_date + timedelta(days=6)
                meals = UserMeal.objects.filter(user=request.user, date__range=(start_date, end_date))
            except:
                return Response({"error": "Invalid date format. Use YYYY-MM-DD"}, status=400)
        else:
            meals = UserMeal.objects.filter(user=request.user)

        summary = (
            meals.values('date')
            .annotate(
                calories=Sum('calories'),
                protein=Sum('protein'),
                carbs=Sum('carbs'),
                fats=Sum('fats')
            )
            .order_by('date')
        )

        return Response(summary)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recommend_calories(request):
    try:
        profile = UserProfile.objects.get(user=request.user)
        dob = profile.date_of_birth  # a `datetime.date` object
        today = date.today()
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        weight = profile.weight_kg
        height = profile.height_cm
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
