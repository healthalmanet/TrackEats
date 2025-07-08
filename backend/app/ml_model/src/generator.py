# your_django_app/ai_diet_planner/generator.py

import torch
import torch.nn.functional as F
import pandas as pd
import json
import random
import os

from django.conf import settings

# --- AI Model Imports ---
from .model import Encoder, Decoder, Seq2Seq
from .rule_engine import get_allowed_foods

# --- Django Model Imports ---
from ...models import FoodItem, UserProfile, LabReport

# ==============================================================================
#  LOAD ONCE AT STARTUP
# ==============================================================================
print("AI DIET PLANNER (GUIDED): Initializing AI models and data...")

# --- Configuration & Paths ---
MODEL_VERSION = 'v1'
BASE_DIR = settings.BASE_DIR 
MODEL_PATH = os.path.join(BASE_DIR, 'saved_models', f'diet_model_{MODEL_VERSION}.pth')
VOCAB_PATH = os.path.join(BASE_DIR, 'saved_models', 'food_vocab.json')
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# --- Load Vocabulary ---
try:
    with open(VOCAB_PATH, 'r') as f:
        food_vocab = json.load(f)
    inv_food_vocab = {v: k for k, v in food_vocab.items()}
    OUTPUT_DIM = len(food_vocab)
except FileNotFoundError:
    food_vocab, inv_food_vocab, OUTPUT_DIM = None, None, 0
    print(f"AI DIET PLANNER: FATAL - Vocabulary file not found at {VOCAB_PATH}")

# --- Load AI Model ---
model = None
# This must match the order and number of features used for training AND for the snapshot
NUMERICAL_COLS = [
    'Age', 'Weight (kg)', 'Height (cm)', 'BMI (auto-calculated)', 'Waist Circumference (cm)',
    'Fasting Blood Sugar (mg/dL)', 'HbA1c (%)', 'Postprandial Sugar (mg/dL)', 'LDL (mg/dL)',
    'HDL (mg/dL)', 'Triglycerides (mg/dL)', 'CRP (mg/L)', 'ESR (mm/hr)', 'Uric Acid (mg/dL)',
    'Creatinine (mg/dL)', 'Urea (mg/dL)', 'ALT (U/L)', 'AST (U/L)', 'Vitamin D3 (ng/mL)',
    'Vitamin B12 (pg/mL)', 'TSH (uIU/mL)'
]
INPUT_DIM = len(NUMERICAL_COLS)

if os.path.exists(MODEL_PATH) and OUTPUT_DIM > 0:
    try:
        ENC_EMB_DIM, DEC_EMB_DIM, HID_DIM = 256, 256, 512
        encoder = Encoder(INPUT_DIM, ENC_EMB_DIM, HID_DIM)
        decoder = Decoder(OUTPUT_DIM, DEC_EMB_DIM, HID_DIM)
        _model = Seq2Seq(encoder, decoder, DEVICE).to(DEVICE)
        _model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
        _model.eval()
        model = _model
        print(f"AI DIET PLANNER: Model {MODEL_VERSION} loaded successfully onto {DEVICE}.")
    except Exception as e:
        print(f"AI DIET PLANNER: FATAL - Error loading model: {e}")
else:
    print(f"AI DIET PLANNER: FATAL - Model file not found at {MODEL_PATH}")

# --- Load Food Data from DATABASE into a Pandas DataFrame ---
food_df = pd.DataFrame()
try:
    food_data_list = list(FoodItem.objects.all().values())
    if food_data_list:
        food_df = pd.DataFrame(food_data_list)
        # IMPROVEMENT: Ensure consistency. Rename Django's 'name' column to 'Food_Item'
        # to match the rule engine and other scripts.
        food_df.rename(columns={'name': 'Food_Item'}, inplace=True)
        
        # CRITICAL: Set Food_Item's name column as the index for fast lookups
        food_df.set_index('Food_Item', inplace=True) 
        print(f"AI DIET PLANNER: Loaded {len(food_df)} food items from DB into memory with 'Food_Item' as index.")
    else:
        print("AI DIET PLANNER: WARNING - No food items found in the database.")
except Exception as e:
    print(f"AI DIET PLANNER: WARNING - Could not load FoodItems from DB. Error: {e}")


# ==============================================================================
#  UTILITY FUNCTION: CALCULATE NUTRITIONAL TARGETS
# ==============================================================================

def calculate_nutritional_targets(user_profile):
    """
    Calculates estimated daily calorie and protein needs.
    """
    if not all([user_profile.weight_kg, user_profile.height_cm, user_profile.age]):
        return {"calories": 2000, "protein": 75, "fats": 65, "carbs": 250}

    if user_profile.gender.lower() == 'male':
        bmr = 10 * user_profile.weight_kg + 6.25 * user_profile.height_cm - 5 * user_profile.age + 5
    else:
        bmr = 10 * user_profile.weight_kg + 6.25 * user_profile.height_cm - 5 * user_profile.age - 161

    activity_map = {'sedentary': 1.2, 'lightly_active': 1.375, 'moderately_active': 1.55, 'very_active': 1.725, 'extra_active': 1.9}
    tdee_factor = activity_map.get(user_profile.activity_level, 1.375)
    
    calorie_target = bmr * tdee_factor

    # Adjust for goal
    if user_profile.goal == 'lose_weight':
        calorie_target -= 500
    elif user_profile.goal == 'gain_weight':
        calorie_target += 500

    protein_g = 1.6 * user_profile.weight_kg
    fats_g = 0.8 * user_profile.weight_kg
    carbs_g = (calorie_target - (protein_g * 4) - (fats_g * 9)) / 4
    
    return {"calories": calorie_target, "protein": protein_g, "fats": fats_g, "carbs": carbs_g}


# ==============================================================================
#  MAIN GUIDED GENERATION FUNCTION
# ==============================================================================

def create_diet_plan_for_user(user_profile, lab_report=None):
    """
    This is the main function that orchestrates the diet plan generation.
    It integrates rule-based safety, AI-powered creativity, and nutritional guidance.
    """
    if not model or food_df.empty or not food_vocab:
        raise Exception("AI models or data not loaded. Cannot generate plan.")

    # 1. PREPARE INPUTS
    # ----------------------------------------------------
    daily_targets = calculate_nutritional_targets(user_profile)
    
    # IMPROVEMENT: Use a clear mapping dictionary to make the code less brittle.
    DJANGO_TO_REPORT_MAP = {
        'waist_circumference_cm': 'Waist Circumference (cm)',
        'fasting_blood_sugar': 'Fasting Blood Sugar (mg/dL)',
        'hba1c': 'HbA1c (%)',
        'postprandial_sugar': 'Postprandial Sugar (mg/dL)',
        'ldl_cholesterol': 'LDL (mg/dL)',
        'hdl_cholesterol': 'HDL (mg/dL)',
        'triglycerides': 'Triglycerides (mg/dL)',
        'crp': 'CRP (mg/L)',
        'esr': 'ESR (mm/hr)',
        'uric_acid': 'Uric Acid (mg/dL)',
        'creatinine': 'Creatinine (mg/dL)',
        'urea': 'Urea (mg/dL)',
        'alt': 'ALT (U/L)',
        'ast': 'AST (U/L)',
        'vitamin_d3': 'Vitamin D3 (ng/mL)',
        'vitamin_b12': 'Vitamin B12 (pg/mL)',
        'tsh': 'TSH (uIU/mL)',
    }

    user_report_data = {
        'Full Name': user_profile.user.get_full_name(),
        'Age': user_profile.age,
        'Gender': user_profile.gender,
        'Weight (kg)': user_profile.weight_kg,
        'Height (cm)': user_profile.height_cm,
        'BMI (auto-calculated)': user_profile.bmi,
        'Activity Level': user_profile.activity_level,
        'Dietary Preference': user_profile.diet_type,
        'Known Allergies': user_profile.allergies,
        'Family history of diseases': user_profile.family_history,
        'Diabetic (Yes/No)': 'yes' if user_profile.is_diabetic else 'no',
        'Hypertension (Yes/No)': 'yes' if user_profile.is_hypertensive else 'no',
        'Heart condition (CVD) (Yes/No)': 'yes' if user_profile.has_heart_condition else 'no',
        'Thyroid disorder (Yes/No)': 'yes' if user_profile.has_thyroid_disorder else 'no',
        'Arthritis (RA/OA/Gout) (Yes/No)': 'yes' if user_profile.has_arthritis else 'no',
        'Gastric issues (IBS/GERD) (Yes/No)': 'yes' if user_profile.has_gastric_issues else 'no',
    }
    
    # Add numerical lab values if a report exists
    for django_field, report_col in DJANGO_TO_REPORT_MAP.items():
        user_report_data[report_col] = getattr(lab_report, django_field, 0) if lab_report else 0

    user_report_series = pd.Series(user_report_data).fillna(0)
    user_vector_list = [float(user_report_series.get(col, 0) or 0) for col in NUMERICAL_COLS]
    user_vector = torch.tensor(user_vector_list, dtype=torch.float32).unsqueeze(0).to(DEVICE)
    
    # 2. SAFETY NET & AI GENERATION (WITH GUIDANCE)
    # ----------------------------------------------------
    allowed_foods_df, _ = get_allowed_foods(user_report_series, food_df.reset_index())
    allowed_food_names = set(allowed_foods_df['Food_Item'])
    
    if len(allowed_food_names) < 10:
        raise ValueError(f"Could not generate a varied plan. Only {len(allowed_food_names)} safe foods found. Check user restrictions.")

    final_plan_ids = []
    meal_names = ['Early Morning', 'Breakfast', 'Mid-Morning Snack', 'Lunch', 'Afternoon Snack', 'Bedtime']
    
    with torch.no_grad():
        hidden, cell = model.encoder(user_vector)
        input_token = torch.tensor([food_vocab['<sos>']], device=DEVICE)

        for day_num in range(15):
            daily_calories_consumed = 0
            for meal_num in range(len(meal_names)):
                output, hidden, cell = model.decoder(input_token, hidden, cell)

                # Guided Sampling Logic
                top_k = 50 
                probabilities = F.softmax(output, dim=-1)
                top_k_probs, top_k_indices = torch.topk(probabilities, top_k)

                valid_candidates = []
                valid_candidate_probs = []
                for i in range(top_k):
                    candidate_id = top_k_indices[0, i].item()
                    candidate_name = inv_food_vocab.get(candidate_id)
                    
                    if candidate_name and candidate_name in allowed_food_names:
                        nutrients = food_df.loc[candidate_name]
                        if daily_calories_consumed + nutrients['Calories'] < daily_targets['calories'] * 1.15:
                            valid_candidates.append(candidate_id)
                            valid_candidate_probs.append(top_k_probs[0, i].item())

                if valid_candidates:
                    probs_tensor = torch.tensor(valid_candidate_probs, dtype=torch.float32)
                    renormalized_probs = probs_tensor / probs_tensor.sum()
                    chosen_index = torch.multinomial(renormalized_probs, 1).item()
                    next_token_id = valid_candidates[chosen_index]
                else:
                    low_cal_allowed = allowed_foods_df[allowed_foods_df['Calories'] < 150]
                    fallback_food = low_cal_allowed.sample(1)['Food_Item'].iloc[0] if not low_cal_allowed.empty else random.choice(list(allowed_food_names))
                    next_token_id = food_vocab[fallback_food]

                chosen_food_nutrients = food_df.loc[inv_food_vocab[next_token_id]]
                daily_calories_consumed += chosen_food_nutrients['Calories']
                
                final_plan_ids.append(next_token_id)
                input_token = torch.tensor([next_token_id], device=DEVICE).detach()

    # 3. FORMAT OUTPUT for Django's JSONField
    # ----------------------------------------------------
    final_plan_json = {}
    for day_num in range(1, 16):
        day_meals = {}
        day_totals = {"calories": 0, "protein": 0, "carbs": 0, "fats": 0}
        
        for meal_idx, meal_name in enumerate(meal_names):
            food_id_index = (day_num - 1) * len(meal_names) + meal_idx
            food_id = final_plan_ids[food_id_index]
            food_name = inv_food_vocab.get(food_id, 'Unknown Food')
            
            food_details = food_df.loc[food_name]
            day_totals["calories"] += food_details['Calories']
            day_totals["protein"] += food_details['Protein']
            day_totals["carbs"] += food_details['Carbs']
            day_totals["fats"] += food_details['Fats']

            day_meals[meal_name] = {
                "item": food_name,
                "serving": f"{food_details['Default_Quantity']} {food_details['Default_Type']}",
                "calories": int(food_details['Calories']),
                "protein_g": round(food_details['Protein'], 1),
            }
        
        final_plan_json[f"Day {day_num}"] = {
            "meals": day_meals,
            "daily_totals": {
                "calories_actual": int(day_totals["calories"]),
                "protein_g_actual": round(day_totals["protein"], 1),
                "carbs_g_actual": round(day_totals["carbs"], 1),
                "fats_g_actual": round(day_totals["fats"], 1),
                "calories_target": int(daily_targets['calories']),
                "protein_g_target": round(daily_targets['protein'], 1),
            }
        }
            
    return final_plan_json