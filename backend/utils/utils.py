import os
import json
import google.generativeai as genai
from functools import wraps
from django.http import HttpResponseForbidden

# # UNIT_TO_GRAMS = {
#     "g": 1,
#     "kg": 1000,
#     "ml": 1,
#     "l": 1000,
#     "cup": 200,        # for Indian gravies
#     "bowl": 150,       # was 300 → now 150g per bowl
#     "piece": 100,
#     "tbsp": 15,
#     "tsp": 5,
#     "slice": 30,
#     "plate": 350,      # optional
#     "katori": 100,     # smaller serving bowl (desi households)
#     "other": 100,
# }

UNIT_TO_GRAMS = {
    "g": 1, "kg": 1000,
    "ml": 1, "l": 1000,
    "cup": 240, "bowl": 400,
    "piece": 100, "tbsp": 15,
    "tsp": 5, "slice": 30,
    "other": 100
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



genai.configure(api_key="AIzaSyB8ZLcao8qK2CIND2EpTxpETYJhvZuxk6c")

def fetch_food_info_from_ai(food_name):
    prompt = f"""
Give nutrition data for Indian food: "{food_name}".

Respond only in strict JSON:

{{
  "name": "Corrected Name",
  "calories": float,
  "protein": float,
  "carbs": float,
  "fats": float,
  "estimated_gi": float,
  "glycemic_load": float,
  "food_type": "veg" | "non_veg" | "vegan" | "eggetarian" | "other",
  "meal_type": "breakfast" | "lunch_dinner" | "snack" | "unknown"
}}
"""

    try:
        model = genai.GenerativeModel("gemini-1.5-pro")
        response = model.generate_content(prompt)
        return json.loads(response.text.strip())
    except Exception as e:
        print("Gemini Error:", e)
        return None




