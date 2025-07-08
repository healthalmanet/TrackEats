# import pandas as pd
# import numpy as np
# import json
# from src.rule_engine import get_allowed_foods
# from tqdm import tqdm
# import os

# # --- Configuration ---
# NUM_PLANS_PER_USER = 50
# PLAN_DAYS = 15
# MEALS_PER_DAY = 6
# SEQUENCE_LENGTH = PLAN_DAYS * MEALS_PER_DAY

# NUMERICAL_COLS = [
#     'Age', 'Weight (kg)', 'Height (cm)', 'BMI (auto-calculated)', 'Waist Circumference (cm)',
#     'Fasting Blood Sugar (mg/dL)', 'HbA1c (%)', 'Postprandial Sugar (mg/dL)', 'LDL (mg/dL)', 
#     'HDL (mg/dL)', 'Triglycerides (mg/dL)', 'CRP (mg/L)', 'ESR (mm/hr)', 'Uric Acid (mg/dL)',
#     'Creatinine (mg/dL)', 'Urea (mg/dL)', 'ALT (U/L)', 'AST (U/L)', 'Vitamin D3 (ng/mL)',
#     'Vitamin B12 (pg/mL)', 'TSH (uIU/mL)'
# ]

# def create_training_data():
#     print("Loading data...")

#     # Path: app/ml_model/
#     base_dir = os.path.dirname(os.path.abspath(__file__))

#     # Paths to data files
#     health_path = os.path.join(base_dir, "data", "health_report.xlsx")
#     food_path = os.path.join(base_dir, "data", "food_items.xlsx")

#     # Load Excel data
#     health_df = pd.read_excel(health_path)
#     food_df = pd.read_excel(food_path)

#     # Clean column names
#     food_df.columns = food_df.columns.str.strip()

#     print("\nCleaned Food Data Columns:")
#     print(food_df.columns.tolist())
#     print("-" * 30 + "\n")

#     # Create Food Vocabulary
#     if 'Food_Item' not in food_df.columns:
#         raise ValueError("Critical Error: 'Food_Item' column not found in food data.")

#     food_list = sorted(food_df['Food_Item'].unique().tolist())
#     food_vocab = {food: i + 3 for i, food in enumerate(food_list)}
#     food_vocab['<pad>'] = 0
#     food_vocab['<sos>'] = 1
#     food_vocab['<eos>'] = 2

#     # Save food vocabulary
#     saved_models_dir = os.path.join(base_dir, 'saved_models')
#     os.makedirs(saved_models_dir, exist_ok=True)

#     vocab_path = os.path.join(saved_models_dir, 'food_vocab.json')
#     with open(vocab_path, 'w') as f:
#         json.dump(food_vocab, f, indent=4)

#     print(f"Vocabulary created with {len(food_vocab)} items and saved to {vocab_path}.")

#     # Generate training samples
#     training_samples = []
#     print(f"Generating {NUM_PLANS_PER_USER} bootstrap plans for each of the {len(health_df)} users...")

#     for index, user_row in tqdm(health_df.iterrows(), total=len(health_df)):
#         allowed_foods_df, _ = get_allowed_foods(user_row, food_df)

#         if len(allowed_foods_df) < 5:
#             print(f"Skipping user {user_row.get('Full Name', f'#{index}')} due to insufficient allowed foods ({len(allowed_foods_df)}).")
#             continue

#         allowed_food_names = allowed_foods_df['Food_Item'].tolist()

#         for _ in range(NUM_PLANS_PER_USER):
#             plan = np.random.choice(allowed_food_names, size=SEQUENCE_LENGTH, replace=True)
#             plan_ids = [food_vocab[food] for food in plan]
#             user_vector = user_row[NUMERICAL_COLS].fillna(0).values.astype(float)

#             training_samples.append({
#                 'user_vector': list(user_vector),
#                 'plan_sequence': plan_ids
#             })

#     # Save training data to CSV
#     data_dir = os.path.join(base_dir, 'data')
#     os.makedirs(data_dir, exist_ok=True)

#     training_df = pd.DataFrame(training_samples)
#     training_path = os.path.join(data_dir, 'bootstrap_training_data.csv')
#     training_df.to_csv(training_path, index=False)

#     print(f"\n✅ Generated and saved {len(training_df)} training samples to '{training_path}'")

# if __name__ == '__main__':
#     create_training_data()

# import pandas as pd
# import numpy as np
# import json
# from src.rule_engine import get_allowed_foods
# from tqdm import tqdm
# import os

# # --- Configuration ---
# NUM_PLANS_PER_USER = 50
# PLAN_DAYS = 15
# MEALS_PER_DAY = 7  # <-- CHANGED from 6 to 7
# SEQUENCE_LENGTH = PLAN_DAYS * MEALS_PER_DAY  # This is now 105

# NUMERICAL_COLS = [
#     'Age', 'Weight (kg)', 'Height (cm)', 'BMI (auto-calculated)', 'Waist Circumference (cm)',
#     'Fasting Blood Sugar (mg/dL)', 'HbA1c (%)', 'Postprandial Sugar (mg/dL)', 'LDL (mg/dL)', 
#     'HDL (mg/dL)', 'Triglycerides (mg/dL)', 'CRP (mg/L)', 'ESR (mm/hr)', 'Uric Acid (mg/dL)',
#     'Creatinine (mg/dL)', 'Urea (mg/dL)', 'ALT (U/L)', 'AST (U/L)', 'Vitamin D3 (ng/mL)',
#     'Vitamin B12 (pg/mL)', 'TSH (uIU/mL)'
# ]

# def create_training_data():
#     print("Loading data...")

#     # Path: app/ml_model/
#     base_dir = os.path.dirname(os.path.abspath(__file__))

#     # Paths to data files
#     health_path = os.path.join(base_dir, "data", "health_report.xlsx")
#     food_path = os.path.join(base_dir, "data", "food_items.xlsx")

#     # Load Excel data
#     health_df = pd.read_excel(health_path)
#     food_df = pd.read_excel(food_path)

#     # Clean column names
#     food_df.columns = food_df.columns.str.strip()

#     print("\nCleaned Food Data Columns:")
#     print(food_df.columns.tolist())
#     print("-" * 30 + "\n")

#     # Create Food Vocabulary
#     if 'Food_Item' not in food_df.columns:
#         raise ValueError("Critical Error: 'Food_Item' column not found in food data.")

#     food_list = sorted(food_df['Food_Item'].unique().tolist())
#     food_vocab = {food: i + 3 for i, food in enumerate(food_list)}
#     food_vocab['<pad>'] = 0
#     food_vocab['<sos>'] = 1
#     food_vocab['<eos>'] = 2

#     # Save food vocabulary
#     saved_models_dir = os.path.join(base_dir, 'saved_models')
#     os.makedirs(saved_models_dir, exist_ok=True)

#     vocab_path = os.path.join(saved_models_dir, 'food_vocab.json')
#     with open(vocab_path, 'w') as f:
#         json.dump(food_vocab, f, indent=4)

#     print(f"Vocabulary created with {len(food_vocab)} items and saved to {vocab_path}.")

#     # Generate training samples
#     training_samples = []
#     print(f"Generating {NUM_PLANS_PER_USER} bootstrap plans for each of the {len(health_df)} users...")

#     for index, user_row in tqdm(health_df.iterrows(), total=len(health_df)):
#         allowed_foods_df, _ = get_allowed_foods(user_row, food_df)

#         if len(allowed_foods_df) < 5:
#             print(f"Skipping user {user_row.get('Full Name', f'#{index}')} due to insufficient allowed foods ({len(allowed_foods_df)}).")
#             continue

#         allowed_food_names = allowed_foods_df['Food_Item'].tolist()

#         for _ in range(NUM_PLANS_PER_USER):
#             plan = np.random.choice(allowed_food_names, size=SEQUENCE_LENGTH, replace=True)
#             plan_ids = [food_vocab[food] for food in plan]
#             user_vector = user_row[NUMERICAL_COLS].fillna(0).values.astype(float)

#             training_samples.append({
#                 'user_vector': list(user_vector),
#                 'plan_sequence': plan_ids
#             })

#     # Save training data to CSV
#     data_dir = os.path.join(base_dir, 'data')
#     os.makedirs(data_dir, exist_ok=True)

#     training_df = pd.DataFrame(training_samples)
#     training_path = os.path.join(data_dir, '1_bootstrap_training_data.csv')
#     training_df.to_csv(training_path, index=False)

#     print(f"\n✅ Generated and saved {len(training_df)} training samples to '{training_path}'")

# if __name__ == '__main__':
#     create_training_data()




import pandas as pd
import numpy as np
import json
from src.rule_engine import get_allowed_foods
from tqdm import tqdm
import os
import re

# --- Configuration ---
NUM_PLANS_PER_USER = 50
PLAN_DAYS = 15
MEALS_PER_DAY = 7  # 7 meals per day
SEQUENCE_LENGTH = PLAN_DAYS * MEALS_PER_DAY  # = 105

NUMERICAL_COLS = [
    'Age', 'Weight (kg)', 'Height (cm)', 'BMI (auto-calculated)', 'Waist Circumference (cm)',
    'Fasting Blood Sugar (mg/dL)', 'HbA1c (%)', 'Postprandial Sugar (mg/dL)', 'LDL (mg/dL)', 
    'HDL (mg/dL)', 'Triglycerides (mg/dL)', 'CRP (mg/L)', 'ESR (mm/hr)', 'Uric Acid (mg/dL)',
    'Creatinine (mg/dL)', 'Urea (mg/dL)', 'ALT (U/L)', 'AST (U/L)', 'Vitamin D3 (ng/mL)',
    'Vitamin B12 (pg/mL)', 'TSH (uIU/mL)'
]

def create_training_data():
    print("📦 Loading data...")

    # Base path of this script
    base_dir = os.path.dirname(os.path.abspath(__file__))

    # Input file paths
    health_path = os.path.join(base_dir, "data", "health_report.xlsx")
    food_path = os.path.join(base_dir, "data", "food_items.xlsx")

    # Load data
    health_df = pd.read_excel(health_path)
    food_df = pd.read_excel(food_path)
    food_df.columns = food_df.columns.str.strip()  # Clean column names

    print("\n✅ Cleaned Food Data Columns:")
    print(food_df.columns.tolist())
    print("-" * 30 + "\n")

    # --- Build food vocab ---
    if 'Food_Item' not in food_df.columns:
        raise ValueError("🛑 'Food_Item' column not found in food_items.xlsx")

    food_list = sorted(food_df['Food_Item'].unique().tolist())
    food_vocab = {food: i + 3 for i, food in enumerate(food_list)}
    food_vocab['<pad>'] = 0
    food_vocab['<sos>'] = 1
    food_vocab['<eos>'] = 2

    # Save vocab
    saved_models_dir = os.path.join(base_dir, 'saved_models')
    os.makedirs(saved_models_dir, exist_ok=True)
    vocab_path = os.path.join(saved_models_dir, 'food_vocab.json')
    with open(vocab_path, 'w') as f:
        json.dump(food_vocab, f, indent=4)

    print(f"✅ Vocabulary saved to: {vocab_path} with {len(food_vocab)} tokens")

    # --- Create training data ---
    training_samples = []
    print(f"\n🚀 Generating {NUM_PLANS_PER_USER} plans for each of the {len(health_df)} users...\n")

    for index, user_row in tqdm(health_df.iterrows(), total=len(health_df)):
        allowed_foods_df, _ = get_allowed_foods(user_row, food_df)

        if len(allowed_foods_df) < 5:
            print(f"⚠️ Skipping user {user_row.get('Full Name', f'#{index}')} (only {len(allowed_foods_df)} allowed foods)")
            continue

        allowed_food_names = allowed_foods_df['Food_Item'].tolist()

        for _ in range(NUM_PLANS_PER_USER):
            plan = np.random.choice(allowed_food_names, size=SEQUENCE_LENGTH, replace=True)
            plan_ids = [food_vocab[food] for food in plan]
            user_vector = user_row[NUMERICAL_COLS].fillna(0).values.astype(float)

            training_samples.append({
                'user_vector': list(user_vector),
                'plan_sequence': plan_ids
            })

    # Convert to DataFrame
    training_df = pd.DataFrame(training_samples)

    # ✅ Important: convert lists to JSON strings before saving to CSV
    training_df['user_vector'] = training_df['user_vector'].apply(json.dumps)
    training_df['plan_sequence'] = training_df['plan_sequence'].apply(json.dumps)

    # Save to CSV
    data_dir = os.path.join(base_dir, 'data')
    os.makedirs(data_dir, exist_ok=True)
    training_path = os.path.join(data_dir, '1_bootstrap_training_data.csv')
    training_df.to_csv(training_path, index=False)

    print(f"\n✅ Saved {len(training_df)} training samples to: {training_path}")

if __name__ == '__main__':
    create_training_data()
