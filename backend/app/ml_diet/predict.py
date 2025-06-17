# import pandas as pd
# import joblib
# import random
# import calendar
# import os

# BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# FOOD_DATASET = os.path.join(BASE_DIR, 'data', 'indian_dishes_dataset.csv')
# MODEL_PATH = os.path.join(BASE_DIR, 'ml_diet', 'model.pkl')

# def load_model():
#     return joblib.load(MODEL_PATH)


# def recommend_meals(user_profile, for_date=None):
#     df = pd.read_csv(FOOD_DATASET)

#     GOAL_MAPPING = {
#         'lose_weight': 'weight loss',
#         'maintain': 'maintenance',
#         'gain_weight': 'weight gain',
#     }

#     DIET_MAPPING = {
#         'vegetarian': 'veg',
#         'non_vegetarian': 'nonveg',
#         'eggetarian': 'veg',
#         'vegan': 'veg',
#         'other': 'veg'
#     }

#     user_goal = GOAL_MAPPING.get(user_profile.goal, '').lower()
#     user_diet_type = DIET_MAPPING.get(user_profile.diet_type, '').lower()

#     df['Goal'] = df['Goal'].str.lower().str.strip()
#     df['Food Type'] = df['Food Type'].str.lower().str.strip()
#     df['Suitable For'] = df['Suitable For'].fillna('').str.lower().str.strip()
#     df['Meal Type'] = df['Meal Type'].str.lower().str.strip()

#     # Filter by goal and diet type
#     suitable_meals = df[df['Goal'].str.contains(user_goal)]
#     suitable_meals = suitable_meals[suitable_meals['Food Type'] == user_diet_type]

#     # Filter by health conditions if applicable
#     if user_profile.health_conditions:
#         health_conditions = [hc.lower().strip() for hc in user_profile.health_conditions]
#         suitable_meals = suitable_meals[
#             suitable_meals['Suitable For'].apply(
#                 lambda x: any(hc in x for hc in health_conditions)
#             )
#         ]

#     if suitable_meals.empty:
#         return {
#             "meals": {},
#             "daily_nutrition": {}
#         }

#     # Separate by meal types
#     breakfast_meals = suitable_meals[suitable_meals['Meal Type'] == 'breakfast']
#     lunch_meals = suitable_meals[suitable_meals['Meal Type'] == 'lunch']
#     dinner_meals = suitable_meals[suitable_meals['Meal Type'] == 'dinner']

#     days = list(calendar.day_name)
#     meals = {}
#     daily_nutrition = {}

#     for day in days:
#         day_meals = {}

#         bf = breakfast_meals.sample(1, random_state=random.randint(1, 10000)).iloc[0] if not breakfast_meals.empty else None
#         ln = lunch_meals.sample(1, random_state=random.randint(1, 10000)).iloc[0] if not lunch_meals.empty else None
#         dn = dinner_meals.sample(1, random_state=random.randint(1, 10000)).iloc[0] if not dinner_meals.empty else None

#         if bf is not None: day_meals["breakfast"] = bf["Food Name"]
#         if ln is not None: day_meals["lunch"] = ln["Food Name"]
#         if dn is not None: day_meals["dinner"] = dn["Food Name"]

#         total_calories = 0
#         total_protein = 0
#         total_carbs = 0
#         total_fats = 0

#         for meal in [bf, ln, dn]:
#             if meal is not None:
#                 total_calories += meal["Calories"]
#                 total_protein += meal["Protein"]
#                 total_carbs += meal["Carbs"]
#                 total_fats += meal["Fats"]

#         meals[day] = day_meals
#         daily_nutrition[day] = {
#             "calories": round(total_calories, 2),
#             "protein": round(total_protein, 2),
#             "carbs": round(total_carbs, 2),
#             "fats": round(total_fats, 2)
#         }

#     # If `for_date` provided, return only that day's data
#     if for_date:
#         weekday = for_date.strftime("%A")
#         return {
#             "meals": {weekday: meals.get(weekday)},
#             "daily_nutrition": {weekday: daily_nutrition.get(weekday)}
#         }

#     return {
#         "meals": meals,
#         "daily_nutrition": daily_nutrition
#     }

import pandas as pd
import joblib
import random
import calendar
import os
from datetime import datetime, timedelta

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FOOD_DATASET = os.path.join(BASE_DIR, 'data', 'indian_dishes_dataset.csv')
MODEL_PATH = os.path.join(BASE_DIR, 'ml_diet', 'model.pkl')

def load_model():
    return joblib.load(MODEL_PATH)

def recommend_meals(user_profile, start_date=None, days_count=15):
    df = pd.read_csv(FOOD_DATASET)

    GOAL_MAPPING = {
        'lose_weight': 'weight loss',
        'maintain': 'maintenance',
        'gain_weight': 'weight gain',
    }

    DIET_MAPPING = {
        'vegetarian': 'veg',
        'non_vegetarian': 'nonveg',
        'eggetarian': 'veg',
        'vegan': 'veg',
        'other': 'veg'
    }

    user_goal = GOAL_MAPPING.get(user_profile.goal, '').lower()
    user_diet_type = DIET_MAPPING.get(user_profile.diet_type, '').lower()

    df['Goal'] = df['Goal'].str.lower().str.strip()
    df['Food Type'] = df['Food Type'].str.lower().str.strip()
    df['Suitable For'] = df['Suitable For'].fillna('').str.lower().str.strip()
    df['Meal Type'] = df['Meal Type'].str.lower().str.strip()

    # Filter by goal and diet type
    suitable_meals = df[df['Goal'].str.contains(user_goal)]
    suitable_meals = suitable_meals[suitable_meals['Food Type'] == user_diet_type]

    # Filter by health conditions if applicable
    if user_profile.health_conditions:
        health_conditions = [hc.lower().strip() for hc in user_profile.health_conditions]
        suitable_meals = suitable_meals[
            suitable_meals['Suitable For'].apply(
                lambda x: any(hc in x for hc in health_conditions)
            )
        ]

    if suitable_meals.empty:
        return {
            "meals": {},
            "daily_nutrition": {}
        }

    # Separate by meal types
    breakfast_meals = suitable_meals[suitable_meals['Meal Type'] == 'breakfast']
    lunch_meals = suitable_meals[suitable_meals['Meal Type'] == 'lunch']
    dinner_meals = suitable_meals[suitable_meals['Meal Type'] == 'dinner']

    if start_date is None:
        start_date = datetime.today()

    meals = {}
    daily_nutrition = {}

    for i in range(days_count):
        current_date = start_date + timedelta(days=i)
        date_str = current_date.strftime("%Y-%m-%d")
        day_name = current_date.strftime("%A")

        day_meals = {}

        bf = breakfast_meals.sample(1, random_state=random.randint(1, 10000)).iloc[0] if not breakfast_meals.empty else None
        ln = lunch_meals.sample(1, random_state=random.randint(1, 10000)).iloc[0] if not lunch_meals.empty else None
        dn = dinner_meals.sample(1, random_state=random.randint(1, 10000)).iloc[0] if not dinner_meals.empty else None

        if bf is not None: day_meals["breakfast"] = bf["Food Name"]
        if ln is not None: day_meals["lunch"] = ln["Food Name"]
        if dn is not None: day_meals["dinner"] = dn["Food Name"]

        total_calories = 0
        total_protein = 0
        total_carbs = 0
        total_fats = 0

        for meal in [bf, ln, dn]:
            if meal is not None:
                total_calories += meal["Calories"]
                total_protein += meal["Protein"]
                total_carbs += meal["Carbs"]
                total_fats += meal["Fats"]

        meals[date_str] = {
            "day": day_name,
            "meals": day_meals
        }

        daily_nutrition[date_str] = {
            "calories": round(total_calories, 2),
            "protein": round(total_protein, 2),
            "carbs": round(total_carbs, 2),
            "fats": round(total_fats, 2)
        }

    return {
        "meals": meals,
        "daily_nutrition": daily_nutrition
    }