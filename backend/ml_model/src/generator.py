# ================================
# 🔹 Required Library Imports
# ================================
import torch
import pandas as pd
import json
import os
import random
from collections import defaultdict

# ================================
# 🔹 Import Custom Modules
# ================================
from .model import Encoder, Decoder, Seq2Seq
from .rule_engine import get_allowed_foods

# ================================
# 🔹 Import Django ORM Models
# ================================
# CORRECTED: Import the base Django User model and get it dynamically
from user.models import User
from userProfile.models import UserProfile, LabReport

# This is the standard Django way to get the active User model

# ================================
# 🔸 Initialization Logs
# ================================
print("AI DIET PLANNER: Initializing...")

# ================================
# 🔹 Configuration
# ================================
MODEL_VERSION = 'v1'
SRC_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(SRC_DIR)

VOCAB_FILE = os.path.join(BASE_DIR, 'saved_models', 'food_vocab.json')
MODEL_PATH = os.path.join(BASE_DIR, 'saved_models', f'diet_model_{MODEL_VERSION}_epoch_38.pth')
FOOD_DATA_FILE = os.path.join(BASE_DIR, 'data', 'food_items.xlsx')
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

PLAN_DAYS = 15
MEAL_NAMES = [
    'Early-Morning', 'Breakfast', 'Mid-Morning Snack',
    'Lunch', 'Afternoon Snack', 'Dinner', 'Bedtime'
]
TOP_K = 50
MAX_FOOD_REPETITION_IN_PLAN = 3

# ================================
# 🔸 Load Food Vocabulary
# ================================
try:
    with open(VOCAB_FILE, 'r') as f:
        food_vocab = json.load(f)
        inv_food_vocab = {v: k for k, v in food_vocab.items()}
        OUTPUT_DIM = len(food_vocab)
except FileNotFoundError:
    print(f"❌ Missing file: {VOCAB_FILE}")
    food_vocab, inv_food_vocab, OUTPUT_DIM = None, None, 0

# ================================
# 🔸 Load Trained Model
# ================================
model = None
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
        encoder = Encoder(INPUT_DIM, 256, 512)
        decoder = Decoder(OUTPUT_DIM, 256, 512)
        _model = Seq2Seq(encoder, decoder, DEVICE).to(DEVICE)
        checkpoint = torch.load(MODEL_PATH, map_location=DEVICE)
        _model.load_state_dict(checkpoint if 'model_state_dict' not in checkpoint else checkpoint['model_state_dict'])
        _model.eval()
        model = _model
        print(f"✅ Model {MODEL_VERSION} loaded.")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
else:
    print(f"❌ Model or vocab file missing.")

# ================================
# 🔸 Load Food Items from Excel File
# ================================
food_df = pd.DataFrame()
try:
    raw_food_df = pd.read_excel(FOOD_DATA_FILE)
    raw_food_df.rename(columns={'name': 'Food_Item', 'meal_type': 'Meal_Type'}, inplace=True)
    agg_funcs = {col: 'first' for col in raw_food_df.columns if col not in ['Food_Item', 'Meal_Type', 'Allergens']}
    agg_funcs['Meal_Type'] = lambda x: ', '.join(x.dropna().unique())
    agg_funcs['Allergens'] = lambda x: ', '.join(x.dropna().astype(str).unique())
    food_df = raw_food_df.groupby('Food_Item').agg(agg_funcs).reset_index().set_index('Food_Item')
    print(f"✅ Loaded {len(food_df)} food items from file.")
except Exception as e:
    print(f"❌ Failed to load food file {FOOD_DATA_FILE}: {e}")

# ================================
# 🔸 Generate Diet Plan Function (Corrected)
# ================================
def generate_diet_plan(user_id):
    """
    Generates a diet plan for a given user ID.
    The user_id provided should be the ID of the main Django auth User.
    """
    global model
    if model is None:
        return {"error": "Model not loaded."}

    try:
        # === THE FIX: TWO-STEP LOOKUP ===
        # 1. First, fetch the main authentication User object using the ID.
        auth_user = User.objects.get(id=user_id)
        
        # 2. Then, fetch the related UserProfile using the 'auth_user' object.
        #    This is the correct and reliable way to get the profile.
        user_profile = UserProfile.objects.get(user=auth_user)
        
        # 3. Fetch the lab report using the 'auth_user' object as well.
        lab_report = LabReport.objects.filter(user=auth_user).last()

        # Merge user profile and lab report fields into a single dictionary
        features = {**user_profile.__dict__, **(lab_report.__dict__ if lab_report else {})}
        
        # Ensure values are not None before converting to float
        user_vector = [float(features.get(col, 0) or 0) for col in NUMERICAL_COLS]
        input_tensor = torch.FloatTensor(user_vector).unsqueeze(0).to(DEVICE)

        # Apply rule engine and filter vocabulary based on user rules
        allowed_df, _ = get_allowed_foods(pd.Series(features), food_df)
        allowed_foods = set(allowed_df.index) & set(food_vocab.keys())

        if not allowed_foods:
            return {"error": "No suitable food items found in vocabulary after applying user preferences and health rules."}
            
        allowed_ids = [food_vocab[f] for f in allowed_foods]

        # Generate plan
        meal_plan = defaultdict(dict)
        food_count = defaultdict(int)

        for day in range(1, PLAN_DAYS + 1):
            if not allowed_ids:
                print(f"Warning: Ran out of unique food options for user {user_id} on Day {day}.")
                break

            outputs = model.generate(input_tensor, MEAL_NAMES, top_k=TOP_K, allowed_ids=allowed_ids)
            
            for meal, food_id in zip(MEAL_NAMES, outputs):
                food_name = inv_food_vocab.get(food_id, "Unknown")
                
                if food_count[food_name] < MAX_FOOD_REPETITION_IN_PLAN:
                    meal_plan[f"Day {day}"][meal] = food_name
                    food_count[food_name] += 1
                else:
                    # Find a different food that hasn't been used too much
                    alternatives = [alt_id for alt_id in allowed_ids if food_count[inv_food_vocab.get(alt_id)] < MAX_FOOD_REPETITION_IN_PLAN]
                    if alternatives:
                        random.shuffle(alternatives)
                        alt_id = alternatives[0]
                        alt_name = inv_food_vocab.get(alt_id)
                        meal_plan[f"Day {day}"][meal] = alt_name
                        food_count[alt_name] += 1
                    else:
                        # If no alternatives are left, assign a placeholder and log it
                        meal_plan[f"Day {day}"][meal] = "No suitable alternative available"
                        print(f"Warning: No alternative food found for {meal} on Day {day} for user {user_id}")

        return meal_plan

    # More specific exceptions for better debugging
    except User.DoesNotExist:
        return {"error": f"Authentication error: User with ID {user_id} not found in the system."}
    except UserProfile.DoesNotExist:
        return {"error": f"User profile for user ID {user_id} does not exist. Please complete your profile before generating a plan."}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": f"An unexpected error occurred during diet plan generation: {e}"}