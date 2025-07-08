import torch
import torch.nn.functional as F
import pandas as pd
import json
import os
import random
import traceback
from src.model import Encoder, Decoder, Seq2Seq
from src.rule_engine import get_allowed_foods

# --- Configuration Constants ---

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_VERSION = 'v1'

VOCAB_FILE = os.path.join(SCRIPT_DIR, 'saved_models', 'food_vocab.json')
MODEL_PATH = os.path.join(SCRIPT_DIR, 'saved_models', f'diet_model_{MODEL_VERSION}.pth')
# MODEL_PATH = os.path.join(SCRIPT_DIR, 'saved_models', f'diet_model_{MODEL_VERSION}_epoch_20.pth')

FOOD_DATA_FILE = os.path.join(SCRIPT_DIR, 'data', 'food_items.xlsx')
HEALTH_REPORT_FILE = os.path.join(SCRIPT_DIR, 'data', 'health_report.xlsx')

DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
PLAN_DAYS = 15

# --- Meal Structure Configuration ---
MEALS_PER_DAY = 7  # <-- CHANGED
TOTAL_MEALS = PLAN_DAYS * MEALS_PER_DAY # This will now be 15 * 7 = 105
MEAL_NAMES = [     # <-- CHANGED
    'Early-Morning',
    'Breakfast',
    'Mid-Morning Snack',
    'Lunch',
    'Afternoon Snack',
    'Dinner',
    'Bedtime'
]

# --- Hyperparameters (must match training) ---
INPUT_DIM = 21 
ENC_EMB_DIM = 256
DEC_EMB_DIM = 256
HID_DIM = 512
NUMERICAL_COLS = [
    'Age', 'Weight (kg)', 'Height (cm)', 'BMI (auto-calculated)', 'Waist Circumference (cm)',
    'Fasting Blood Sugar (mg/dL)', 'HbA1c (%)', 'Postprandial Sugar (mg/dL)', 'LDL (mg/dL)', 
    'HDL (mg/dL)', 'Triglycerides (mg/dL)', 'CRP (mg/L)', 'ESR (mm/hr)', 'Uric Acid (mg/dL)',
    'Creatinine (mg/dL)', 'Urea (mg/dL)', 'ALT (U/L)', 'AST (U/L)', 'Vitamin D3 (ng/mL)',
    'Vitamin B12 (pg/mL)', 'TSH (uIU/mL)'
]

def load_data_and_models():
    """Loads all necessary data and models, with error handling."""
    try:
        with open(VOCAB_FILE, 'r') as f:
            food_vocab = json.load(f)
        inv_food_vocab = {v: k for k, v in food_vocab.items()}
        output_dim = len(food_vocab)

        food_df = pd.read_excel(FOOD_DATA_FILE)
        # Clean column names immediately after loading
        food_df.columns = food_df.columns.str.strip()

        encoder = Encoder(INPUT_DIM, ENC_EMB_DIM, HID_DIM)
        decoder = Decoder(output_dim, DEC_EMB_DIM, HID_DIM)
        model = Seq2Seq(encoder, decoder, DEVICE).to(DEVICE)
        checkpoint = torch.load(MODEL_PATH, map_location=DEVICE)
        model.load_state_dict(checkpoint['model_state_dict'])
        model.eval()
        
        print(f"Successfully loaded models, vocab, and food data on {DEVICE}.")
        return model, food_vocab, inv_food_vocab, food_df

    except FileNotFoundError as e:
        print(f"ERROR: A required file was not found: {e.filename}")
        return None, None, None, None
    except Exception as e:
        print(f"An unexpected error occurred during loading: {e}")
        traceback.print_exc()
        return None, None, None, None

# def generate_diet_plan(user_report_series, model, food_vocab, inv_food_vocab, food_df):
#     """Generates a validated 15-day diet plan for a user."""
#     print(f"\n--- Generating Diet Plan for: {user_report_series['Full Name']} (Model: {MODEL_VERSION}) ---")
    
#     # 1. SAFETY NET (RULE ENGINE)
#     allowed_foods_df, suggestion_flags = get_allowed_foods(user_report_series, food_df)
#     allowed_food_ids = {food_vocab[food] for food in allowed_foods_df['Food_Item'] if food in food_vocab}
    
#     if len(allowed_food_ids) < 10:
#         return f"Could not generate a varied plan. Only {len(allowed_food_ids)} safe foods found."

#     # 2. AI DRAFT GENERATION
#     print("Step 2: Using AI model to generate a creative plan draft...")
#     user_vector = torch.tensor(user_report_series[NUMERICAL_COLS].fillna(0).values, dtype=torch.float32).unsqueeze(0).to(DEVICE)

#     generated_sequence_ids = []
#     with torch.no_grad():
#         hidden, cell = model.encoder(user_vector)
#         input_token = torch.tensor([food_vocab['<sos>']], device=DEVICE)
        
#         # The loop now generates 105 food items instead of 90
#         for _ in range(TOTAL_MEALS):
#             output, hidden, cell = model.decoder(input_token, hidden, cell)
            
#             top_k = 10
#             top_k_logits, top_k_indices = torch.topk(output, top_k)
#             probabilities = F.softmax(top_k_logits, dim=-1)
#             chosen_index_in_topk = torch.multinomial(probabilities, 1)
#             next_token_id = top_k_indices.gather(-1, chosen_index_in_topk).squeeze()

#             generated_sequence_ids.append(next_token_id.item())
#             input_token = next_token_id.detach().unsqueeze(0)

#     # 3. VALIDATION & PROMOTIONAL BIAS
#     print("Step 3: Validating AI plan and applying promotional suggestions...")
#     final_plan_ids = []
    
#     PROMO_FLAG_TO_COLUMN_MAP = {
#         'promote_healthy_fats': 'Omega_3/g',
#         'promote_vitamin_d': 'Vitamin_D/mcg',
#         'promote_vitamin_b12': 'Vitamin_B12/mcg',
#         'promote_hypothyroid_support': 'Iodine/mcg',
#         'moderate_hyperthyroid_support': 'Iodine/mcg'
#     }
    
#     promo_foods = {}
#     for flag in suggestion_flags:
#         promo_col = PROMO_FLAG_TO_COLUMN_MAP.get(flag)
#         if promo_col and promo_col in allowed_foods_df.columns:
#             valid_foods = allowed_foods_df[allowed_foods_df[promo_col] > 0]
#             promo_foods[flag] = {food_vocab[row['Food_Item']] for _, row in valid_foods.iterrows() if row['Food_Item'] in food_vocab}
#         else:
#             promo_foods[flag] = set()

#     allowed_list = list(allowed_food_ids) 
#     for food_id in generated_sequence_ids:
#         if food_id not in allowed_food_ids:
#             found_promo = False
#             random.shuffle(suggestion_flags)
#             for flag in suggestion_flags:
#                 if promo_foods.get(flag): 
#                     final_plan_ids.append(random.choice(list(promo_foods[flag])))
#                     found_promo = True
#                     break
#             if not found_promo:
#                  final_plan_ids.append(random.choice(allowed_list))
#         else:
#             final_plan_ids.append(food_id)
            
#     # 4. FORMAT OUTPUT
#     print("Step 4: Formatting the final plan for nutritionist's review.")
#     plan_text = []
#     plan_text.append(f"--- DRAFT DIET PLAN (Model: {MODEL_VERSION}) ---")
#     plan_text.append(f"Patient: {user_report_series['Full Name']}\n")
#     plan_text.append("NOTE: This plan was generated by AI, validated against safety rules, and biased towards dietary suggestions. PLEASE REVIEW AND APPROVE/MODIFY.\n")
#     if suggestion_flags:
#         plan_text.append(f"Applied Dietary Suggestions: {', '.join(suggestion_flags)}\n")
    
#     for day in range(PLAN_DAYS):
#         plan_text.append(f"--- Day {day+1} ---")
#         # This loop now correctly iterates 7 times and uses the new MEAL_NAMES
#         for meal_idx in range(MEALS_PER_DAY):
#             food_id_index = day * MEALS_PER_DAY + meal_idx
#             food_id = final_plan_ids[food_id_index]
#             food_name = inv_food_vocab.get(food_id, 'Unknown Food')
#             plan_text.append(f"{MEAL_NAMES[meal_idx]}: {food_name}")
#         plan_text.append("")
        
#     return "\n".join(plan_text)


def generate_diet_plan(user_report_series, model, food_vocab, inv_food_vocab, food_df):
    """Generates a validated 15-day diet plan for a user, respecting meal types."""
    print(f"\n--- Generating Diet Plan for: {user_report_series['Full Name']} (Model: {MODEL_VERSION}) ---")
    
    # --- Step 1: Get all allowed foods based on health rules (this part is the same) ---
    print("Step 1: Running Rule Engine to get all safe foods...")
    allowed_foods_df, suggestion_flags = get_allowed_foods(user_report_series, food_df)
    
    # Get the master set of allowed food IDs for the entire plan
    all_allowed_food_ids = {food_vocab[food] for food in allowed_foods_df['Food_Item'] if food in food_vocab}
    
    if len(all_allowed_food_ids) < 10:
        return f"Could not generate a varied plan. Only {len(all_allowed_food_ids)} total safe foods found."

    # --- Step 2: NEW - Generate the plan meal by meal with guided generation ---
    print("Step 2: Using AI model to generate plan, guided by meal types...")
    user_vector = torch.tensor(user_report_series[NUMERICAL_COLS].fillna(0).values, dtype=torch.float32).unsqueeze(0).to(DEVICE)
    output_dim = len(food_vocab)

    generated_sequence_ids = []
    with torch.no_grad():
        hidden, cell = model.encoder(user_vector)
        # Start with the <sos> token
        input_token = torch.tensor([food_vocab['<sos>']], device=DEVICE)
        
        # *** THE MAIN LOGIC CHANGE IS HERE ***
        # Instead of one big loop, we loop through each day and each meal
        for day in range(PLAN_DAYS):
            for meal_idx in range(MEALS_PER_DAY):
                current_meal_name = MEAL_NAMES[meal_idx]

                # Filter the allowed foods for the CURRENT meal type
                meal_specific_foods_df = allowed_foods_df[
                    allowed_foods_df['Meal_Type'].str.contains(current_meal_name, case=False, na=False)
                ]
                meal_specific_allowed_ids = {
                    food_vocab[food] for food in meal_specific_foods_df['Food_Item'] if food in food_vocab
                }
                
                # --- Fallback Logic ---
                # If no specific foods are found for this meal type (e.g., no "Bedtime" snacks),
                # fall back to the general list of all allowed foods.
                final_ids_for_this_meal = list(meal_specific_allowed_ids)
                if not final_ids_for_this_meal:
                    print(f"WARN: No foods found for meal type '{current_meal_name}'. Using general list.")
                    final_ids_for_this_meal = list(all_allowed_food_ids)
                
                if not final_ids_for_this_meal:
                    # If there's still nothing (edge case), pick a random food from vocab and move on.
                    # This prevents a crash.
                    print(f"ERROR: No foods available for {current_meal_name}. Inserting a placeholder.")
                    generated_sequence_ids.append(random.choice(list(food_vocab.values())))
                    continue


                # Get the model's raw output (logits) for the next food
                output, hidden, cell = model.decoder(input_token, hidden, cell)

                # --- Create a "Mask" to force the model's choice ---
                # Start with a mask that disallows everything (-infinity)
                mask = torch.full((1, output_dim), -float('inf'), device=DEVICE)
                # Allow the specific foods for this meal by setting their mask value to 0
                mask[0, final_ids_for_this_meal] = 0.0
                
                # Apply the mask to the model's output
                masked_output = output + mask
                
                # Now, perform sampling (top-k) on the MASKED output
                # The model can now only choose from the foods we allowed.
                top_k = 10 
                # Ensure k is not larger than the number of available choices
                k = min(top_k, len(final_ids_for_this_meal))
                
                top_k_logits, top_k_indices = torch.topk(masked_output, k)
                probabilities = F.softmax(top_k_logits, dim=-1)
                
                chosen_index_in_topk = torch.multinomial(probabilities, 1)
                next_token_id = top_k_indices.gather(-1, chosen_index_in_topk).squeeze()

                generated_sequence_ids.append(next_token_id.item())
                input_token = next_token_id.detach().unsqueeze(0)

    # --- Step 3 & 4: Validation and Formatting (This part is mostly the same) ---
    # The validation step is less critical now but is a good safety net.
    print("Step 3: Validating AI plan and applying promotional suggestions...")
    final_plan_ids = []
    
    PROMO_FLAG_TO_COLUMN_MAP = {
        'promote_healthy_fats': 'Omega_3/g',
        'promote_vitamin_d': 'Vitamin_D/mcg',
        'promote_vitamin_b12': 'Vitamin_B12/mcg',
        'promote_hypothyroid_support': 'Iodine/mcg',
        'moderate_hyperthyroid_support': 'Iodine/mcg'
    }
    
    promo_foods = {}
    for flag in suggestion_flags:
        promo_col = PROMO_FLAG_TO_COLUMN_MAP.get(flag)
        if promo_col and promo_col in allowed_foods_df.columns:
            valid_foods = allowed_foods_df[allowed_foods_df[promo_col] > 0]
            promo_foods[flag] = {food_vocab[row['Food_Item']] for _, row in valid_foods.iterrows() if row['Food_Item'] in food_vocab}
        else:
            promo_foods[flag] = set()

    allowed_list = list(all_allowed_food_ids) 
    for food_id in generated_sequence_ids:
        if food_id not in all_allowed_food_ids:
            found_promo = False
            random.shuffle(suggestion_flags)
            for flag in suggestion_flags:
                if promo_foods.get(flag): 
                    final_plan_ids.append(random.choice(list(promo_foods[flag])))
                    found_promo = True
                    break
            if not found_promo:
                 final_plan_ids.append(random.choice(allowed_list))
        else:
            final_plan_ids.append(food_id)
            
    print("Step 4: Formatting the final plan for nutritionist's review.")
    plan_text = []
    plan_text.append(f"--- DRAFT DIET PLAN (Model: {MODEL_VERSION}) ---")
    plan_text.append(f"Patient: {user_report_series['Full Name']}\n")
    plan_text.append("NOTE: This plan was generated by AI, validated against safety rules, and biased towards dietary suggestions. PLEASE REVIEW AND APPROVE/MODIFY.\n")
    if suggestion_flags:
        plan_text.append(f"Applied Dietary Suggestions: {', '.join(suggestion_flags)}\n")
    
    for day in range(PLAN_DAYS):
        plan_text.append(f"--- Day {day+1} ---")
        for meal_idx in range(MEALS_PER_DAY):
            food_id_index = day * MEALS_PER_DAY + meal_idx
            food_id = final_plan_ids[food_id_index]
            food_name = inv_food_vocab.get(food_id, 'Unknown Food')
            plan_text.append(f"{MEAL_NAMES[meal_idx]}: {food_name}")
        plan_text.append("")
        
    return "\n".join(plan_text)



if __name__ == '__main__':
    model, food_vocab, inv_food_vocab, food_df = load_data_and_models()
    if model:
        try:
            health_reports = pd.read_excel(HEALTH_REPORT_FILE)
            # sample_user = health_reports.iloc[14] 

            sample_user = pd.Series({
    "Full Name": "Aarav Mehta",
    "Age": 27,
    "Gender": "Male",
    "Weight (kg)": 68,
    "Height (cm)": 176,
    "BMI (auto-calculated)": 21.95,
    "Waist Circumference (cm)": 78,
    "Activity Level": "Very Active",
    "Dietary Preference": "Vegetarian",
    "Known Allergies": "None",
    "Fasting Blood Sugar (mg/dL)": 87,
    "HbA1c (%)": 4.9,
    "Postprandial Sugar (mg/dL)": 110,
    "LDL (mg/dL)": 95,
    "HDL (mg/dL)": 62,
    "Triglycerides (mg/dL)": 95,
    "CRP (mg/L)": 0.4,
    "ESR (mm/hr)": 4,
    "Uric Acid (mg/dL)": 5.1,
    "Creatinine (mg/dL)": 0.9,
    "Urea (mg/dL)": 26,
    "ALT (U/L)": 24,
    "AST (U/L)": 21,
    "Vitamin D3 (ng/mL)": 42,
    "Vitamin B12 (pg/mL)": 620,
    "TSH (uIU/mL)": 2.1,
    "Diabetic (Yes/No)": "No",
    "Hypertension (Yes/No)": "No",
    "Heart condition (CVD) (Yes/No)": "No",
    "Thyroid disorder (Yes/No)": "No",
    "Arthritis (RA/OA/Gout) (Yes/No)": "No",
    "Gastric issues (IBS/GERD) (Yes/No)": "No",
    "Any other chronic condition": "None",
    "Family history of diseases": "None"
})
            
            final_plan = generate_diet_plan(sample_user, model, food_vocab, inv_food_vocab, food_df)
            
            print("\n" + "="*60)
            print("FINAL GENERATED PLAN")
            print("="*60)
            print(final_plan)
            
            file_name = f"generated_plan_{sample_user['Full Name'].replace(' ', '_')}.txt"
            with open(file_name, 'w', encoding='utf-8') as f:
                f.write(final_plan)
            print(f"\nPlan saved to {file_name}")

        except FileNotFoundError:
            print(f"ERROR: Health report file not found at '{HEALTH_REPORT_FILE}'")
        except Exception as e:
            print(f"An error occurred during plan generation: {e}")
            traceback.print_exc()