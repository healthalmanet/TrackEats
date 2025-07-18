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



# RENAMED and REFACTORED for clarity and correct functionality 
#7day
class DailyUserMealSummaryView(APIView):
    """
    Provides a 7-day summary of meals, ending on a specific date provided by the user.
    This replaces DailyUserMealSummaryView to be more explicit and timezone-safe.
    It expects a query parameter like: /api/your-endpoint/?end_date=2023-10-27
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # The frontend provides the user's local "today" as the end_date.
        end_date_str = request.query_params.get('end_date')

        if not end_date_str:
            # If no date is provided, it's an error. The client must specify the date.
            return Response({"error": "An 'end_date' query parameter is required. Use YYYY-MM-DD format."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Parse the string from the client into a date object.
            end_date = parse_date(end_date_str)
            if not end_date: raise ValueError # parse_date returns None on failure

            # Calculate the start date for the 7-day range.
            start_date = end_date - timedelta(days=6)
            
            # Filter based on the user-specific date range.
            # Assumes your UserMeal model has a `date` field of type DateField.
            meals = UserMeal.objects.filter(user=request.user, date__range=(start_date, end_date))

        except (ValueError, TypeError):
            return Response({"error": "Invalid date format for 'end_date'. Use YYYY-MM-DD"}, status=status.HTTP_400_BAD_REQUEST)

        # The rest of the logic remains the same.
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

        # To ensure the frontend receives a full 7-day structure even if some days have no meals,
        # you can create a date map.
        date_map = {item['date']: item for item in summary}
        response_data = []
        for i in range(7):
            current_date = start_date + timedelta(days=i)
            day_data = date_map.get(current_date, {
                'date': current_date.isoformat(),
                'calories': 0,
                'protein': 0,
                'carbs': 0,
                'fats': 0
            })
            response_data.append(day_data)

        return Response(response_data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recommend_calories(request):
    """
    Calculates recommendations. Now accepts an optional 'current_date' from the client
    to ensure age is calculated based on the user's local date, not the server's.
    Example: /api/recommend-calories/?current_date=2023-10-27
    """
    try:
        # Get the user's current local date from the request, fallback to server's date if not provided.
        # The frontend should ALWAYS send this for accuracy.
        current_date_str = request.query_params.get('current_date')
        if current_date_str and (user_local_date := parse_date(current_date_str)):
             today = user_local_date
        else:
             # Fallback to server's date if client fails to send it.
             today = date.today()

        profile = UserProfile.objects.get(user=request.user)
        dob = profile.date_of_birth
        
        # Age calculation is now based on the user's local date.
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        
        # ... (rest of your calculation logic remains unchanged) ...
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

        activity_multipliers = {"sedentary": 1.2, "light": 1.3, "moderate": 1.45, "active": 1.6, "very_active": 1.75}
        maintenance_calories = bmr * activity_multipliers.get(activity_level, 1.2)

        if goal == "lose_weight":
            recommended_calories = maintenance_calories * 0.8
        elif goal == "gain_weight":
            recommended_calories = maintenance_calories * 1.15
        else:
            recommended_calories = maintenance_calories

        protein_grams = round(weight * 1.8)
        fats_grams = round(weight * 0.8)
        protein_calories = protein_grams * 4
        fats_calories = fats_grams * 9
        carbs_calories = recommended_calories - (protein_calories + fats_calories)
        carbs_grams = round(carbs_calories / 4) if carbs_calories > 0 else 0
        base_water_ml = weight * 35
        activity_water_bonus = {"sedentary": 0, "light": 250, "moderate": 500, "active": 750, "very_active": 1000}
        recommended_water_ml = base_water_ml + activity_water_bonus.get(activity_level, 0)
        
        return Response({
            "bmr": round(bmr), "maintenance_calories": round(maintenance_calories), "recommended_calories": round(recommended_calories),
            "macronutrients": {"protein_g": protein_grams, "carbs_g": carbs_grams, "fats_g": fats_grams},
            "water": {"recommended_ml": round(recommended_water_ml)},
            "goal": goal, "activity_level": activity_level
        })

    except UserProfile.DoesNotExist:
        return Response({"error": "User profile not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DailyCalorieSummaryView(APIView):
    """
    Provides a total summary for a single day.
    This view MUST receive a 'date' parameter from the client to avoid timezone issues.
    Example: /api/daily-summary/?date=2023-10-27
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get the target date string from the query parameters.
        date_str = request.query_params.get('date')

        if not date_str:
            return Response({"error": "A 'date' query parameter is required. Use YYYY-MM-DD format."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # This is the user's local date, parsed into a date object.
            target_date = parse_date(date_str)
            if not target_date: raise ValueError()
        except ValueError:
            return Response({"error": "Invalid date format. Use YYYY-MM-DD"}, status=status.HTTP_400_BAD_REQUEST)

        # Create a timezone-aware datetime range for the user's entire local day.
        # This assumes UserMeal.consumed_at is a timezone-aware DateTimeField.
        start_of_day = datetime.combine(target_date, time.min)
        end_of_day = datetime.combine(target_date, time.max)

        # If your project uses timezones (settings.USE_TZ=True), you should make these
        # datetimes aware of the current timezone to match the database.
        # from django.utils.timezone import make_aware
        # start_of_day = make_aware(datetime.combine(target_date, time.min))
        # end_of_day = make_aware(datetime.combine(target_date, time.max))
        
        # The filter now correctly queries for meals within the user's local day.
        meals_today = UserMeal.objects.filter(
            user=request.user, 
            consumed_at__gte=start_of_day, 
            consumed_at__lte=end_of_day
        )

        totals = meals_today.aggregate(
            total_calories=Sum("calories", default=0),
            total_protein=Sum("protein", default=0),
            total_carbs=Sum("carbs", default=0),
            total_fats=Sum("fats", default=0),
            total_sugar=Sum("sugar", default=0),
            total_fiber=Sum("fiber", default=0),
        )

        return Response({
            "date": target_date,
            "calories": totals["total_calories"],
            "protein": totals["total_protein"],
            "carbs": totals["total_carbs"],
            "fats": totals["total_fats"],
            "sugar": totals["total_sugar"],
            "fiber": totals["total_fiber"],
        })