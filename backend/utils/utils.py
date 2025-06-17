from functools import wraps
from django.http import HttpResponseForbidden

UNIT_TO_GRAMS = {
    "g": 1,
    "kg": 1000,
    "ml": 1,
    "l": 1000,
    "cup": 200,        # for Indian gravies
    "bowl": 150,       # was 300 → now 150g per bowl
    "piece": 100,
    "tbsp": 15,
    "tsp": 5,
    "slice": 30,
    "plate": 350,      # optional
    "katori": 100,     # smaller serving bowl (desi households)
    "other": 100,
}

def role_required(allowed_roles):
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(self, request, *args, **kwargs):
            user = request.user
            if not user.is_authenticated or user.role not in allowed_roles:
                return HttpResponseForbidden("Access Denied")
            return view_func(self, request, *args, **kwargs)
        return _wrapped_view
    return decorator

def generate_diet_recommendation(user_profile, for_date=None):
    """
    Generate a weekly diet recommendation including meals and daily nutritional summary.
    `user_profile`: UserProfile object with user health data.
    `for_date`: Optional, specify a single day's recommendation.
    Returns dict with 'meals' and 'daily_nutrition'.
    """

    meals = {
        "Monday": {
            "breakfast": "Oats with almonds and banana",
            "lunch": "Paneer curry with brown rice and salad",
            "dinner": "Moong dal with chapati and sautéed vegetables"
        },
        "Tuesday": {
            "breakfast": "Vegetable upma with coconut chutney",
            "lunch": "Chickpea curry with jeera rice and cucumber salad",
            "dinner": "Mixed vegetable curry with chapati"
        },
        "Wednesday": {
            "breakfast": "Besan chilla with mint chutney",
            "lunch": "Rajma with brown rice and salad",
            "dinner": "Palak paneer with chapati"
        },
        "Thursday": {
            "breakfast": "Poha with peanuts and coriander",
            "lunch": "Sambar with quinoa and vegetable poriyal",
            "dinner": "Masoor dal with chapati and stir-fried greens"
        },
        "Friday": {
            "breakfast": "Multigrain toast with peanut butter and apple slices",
            "lunch": "Bhindi sabzi with bajra roti and cucumber raita",
            "dinner": "Tofu stir-fry with brown rice"
        },
        "Saturday": {
            "breakfast": "Idli with sambar and coconut chutney",
            "lunch": "Matar paneer with quinoa and salad",
            "dinner": "Mixed dal with chapati and sautéed spinach"
        },
        "Sunday": {
            "breakfast": "Vegetable paratha with curd",
            "lunch": "Chole with brown rice and salad",
            "dinner": "Vegetable pulao with raita"
        }
    }

    daily_nutrition = {
        "Monday": {"calories": 2000, "protein": 110, "carbs": 250, "fats": 65},
        "Tuesday": {"calories": 2050, "protein": 115, "carbs": 255, "fats": 70},
        "Wednesday": {"calories": 2100, "protein": 120, "carbs": 260, "fats": 72},
        "Thursday": {"calories": 2000, "protein": 105, "carbs": 245, "fats": 68},
        "Friday": {"calories": 1950, "protein": 100, "carbs": 240, "fats": 66},
        "Saturday": {"calories": 2100, "protein": 120, "carbs": 265, "fats": 75},
        "Sunday": {"calories": 2200, "protein": 125, "carbs": 270, "fats": 78},
    }

    if for_date:
        weekday = for_date.strftime("%A")
        return {
            "meals": {weekday: meals.get(weekday)},
            "daily_nutrition": {weekday: daily_nutrition.get(weekday)}
        }

    return {
        "meals": meals,
        "daily_nutrition": daily_nutrition
    }

# @shared_task
# def generate_weekly_diet_plans():
    today = now().date()
    start_of_week = today - timedelta(days=today.weekday())

    for profile in UserProfile.objects.all():
        existing = DietRecommendation.objects.filter(user=profile.user, for_week_starting=start_of_week).exists()
        if not existing:
            recommendation = generate_diet_recommendation(profile)
            DietRecommendation.objects.create(
                user=profile.user,
                for_week_starting=start_of_week,
                meals=recommendation['meals'],
                calories=recommendation['calories'],
                protein=recommendation['protein'],
                carbs=recommendation['carbs'],
                fats=recommendation['fats'],
            )