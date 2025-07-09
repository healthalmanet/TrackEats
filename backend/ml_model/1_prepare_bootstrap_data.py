# 🔹 Import required libraries
import pandas as pd  # For data manipulation and loading Excel files
import numpy as np   # For numerical operations like sampling
import json          # For saving/loading food vocab and JSON fields
from src.rule_engine import get_allowed_foods  # Custom function to filter foods for a user
from tqdm import tqdm  # For progress bars in loops
import os            # For file path operations
import re            # (Not used here, can remove unless needed later)

# 🔸 Configuration constants
NUM_PLANS_PER_USER = 50  # How many plans to generate per user
PLAN_DAYS = 15           # Each plan spans 15 days
MEALS_PER_DAY = 7        # Number of meals per day
SEQUENCE_LENGTH = PLAN_DAYS * MEALS_PER_DAY  # Expected total meal entries per plan

# 🔸 Columns representing the user’s numerical health data (must match model training)
NUMERICAL_COLS = [
    'Age', 'Weight (kg)', 'Height (cm)', 'BMI (auto-calculated)', 'Waist Circumference (cm)',
    'Fasting Blood Sugar (mg/dL)', 'HbA1c (%)', 'Postprandial Sugar (mg/dL)', 'LDL (mg/dL)',
    'HDL (mg/dL)', 'Triglycerides (mg/dL)', 'CRP (mg/L)', 'ESR (mm/hr)', 'Uric Acid (mg/dL)',
    'Creatinine (mg/dL)', 'Urea (mg/dL)', 'ALT (U/L)', 'AST (U/L)', 'Vitamin D3 (ng/mL)',
    'Vitamin B12 (pg/mL)', 'TSH (uIU/mL)'
]

# 🔸 Order of meals per day used for consistent plan structure
MEAL_ORDER = [
    'Early-Morning', 'Breakfast', 'Mid-Morning Snack', 'Lunch',
    'Afternoon Snack', 'Dinner', 'Bedtime'
]

# 🔸 Mapping meal slots to corresponding meal types (to guide plan generation)
MEAL_TYPE_KEYWORDS = {
    'Early-Morning': 'Early-Morning',
    'Breakfast': 'Breakfast',
    'Mid-Morning Snack': 'Mid-Morning Snack',
    'Lunch': 'Lunch',
    'Afternoon Snack': 'Afternoon Snack',
    'Dinner': 'Dinner',
    'Bedtime': 'Bedtime',             # Or "Soup" etc., if you have such a type
}

# ======================================================================================
# 🔹 Main function to generate training data from raw food and health data
# ======================================================================================
def create_training_data():
    print("📦 Loading data...")

    # 🔸 Define base path and file locations
    base_dir = os.path.dirname(os.path.abspath(__file__))
    health_path = os.path.join(base_dir, "data", "health_report.xlsx")
    food_path = os.path.join(base_dir, "data", "food_items.xlsx")

    # 🔸 Load health reports and food data
    health_df = pd.read_excel(health_path)
    raw_food_df = pd.read_excel(food_path)

    # 🔸 Clean and aggregate food data
    print("🔄 Pre-processing Food Data: Aggregating multiple rows per food item...")
    raw_food_df.columns = raw_food_df.columns.str.strip()  # Remove extra spaces from column names

    # 🔸 Group rows by food name; combine text columns; take first value for numeric columns
    agg_funcs = {col: 'first' for col in raw_food_df.columns if col not in ['Food_Item', 'Meal_Type', 'Allergens']}
    agg_funcs['Meal_Type'] = lambda x: ', '.join(x.dropna().unique())
    agg_funcs['Allergens'] = lambda x: ', '.join(x.dropna().unique())
    food_df = raw_food_df.groupby('Food_Item').agg(agg_funcs).reset_index()

    print(f"✅ Pre-processing complete. Processed {len(food_df)} unique food items.")

    # 🔸 Build a food vocabulary: food name → integer token
    if 'Food_Item' not in food_df.columns:
        raise ValueError("🛑 'Food_Item' column not found in food data.")

    food_list = sorted(food_df['Food_Item'].unique().tolist())
    food_vocab = {food: i + 3 for i, food in enumerate(food_list)}  # Reserve 0–2 for special tokens
    food_vocab['<pad>'] = 0
    food_vocab['<sos>'] = 1
    food_vocab['<eos>'] = 2

    # 🔸 Save vocabulary to disk
    saved_models_dir = os.path.join(base_dir, 'saved_models')
    os.makedirs(saved_models_dir, exist_ok=True)
    vocab_path = os.path.join(saved_models_dir, 'food_vocab.json')
    with open(vocab_path, 'w') as f:
        json.dump(food_vocab, f, indent=4)
    print(f"✅ Vocabulary saved to: {vocab_path} with {len(food_vocab)} tokens")

    # ======================================================================================
    # 🔹 Generate training plans for each user
    # ======================================================================================
    training_samples = []
    print(f"\n🚀 Generating {NUM_PLANS_PER_USER} structured plans for each of the {len(health_df)} users...\n")

    for _, user_row in tqdm(health_df.iterrows(), total=len(health_df), desc="Generating plans"):
        # 🔸 Filter foods based on medical and allergy rules
        allowed_foods_df, _ = get_allowed_foods(user_row, food_df)

        if len(allowed_foods_df) < 15:
            tqdm.write(f"⚠️ Skipping user {user_row.get('Full Name', 'N/A')} (only {len(allowed_foods_df)} allowed foods)")
            continue

        # 🔸 Build meal-wise menu: e.g., Lunch → [rice, dal], Snack → [nuts, fruits]
        allowed_by_meal_type = {}
        for meal_slot, keyword in MEAL_TYPE_KEYWORDS.items():
            meal_foods = allowed_foods_df[
                allowed_foods_df['Meal_Type'].str.contains(keyword, case=False, na=False)
            ]['Food_Item'].tolist()
            allowed_by_meal_type[meal_slot] = meal_foods

        # 🔸 Fallback: fill empty slots with all allowed foods
        for meal_slot, foods in allowed_by_meal_type.items():
            if not foods:
                allowed_by_meal_type[meal_slot] = allowed_foods_df['Food_Item'].tolist()

        # 🔸 Generate multiple plans for this user
        for _ in range(NUM_PLANS_PER_USER):
            plan_names = []
            for day_num in range(PLAN_DAYS):
                for meal_slot in MEAL_ORDER:
                    if not allowed_by_meal_type[meal_slot]: continue  # Safety check
                    choice = np.random.choice(allowed_by_meal_type[meal_slot])
                    plan_names.append(choice)

            if len(plan_names) != SEQUENCE_LENGTH:
                continue  # Skip if incomplete

            # 🔸 Convert food names to token IDs
            plan_ids = [food_vocab[food] for food in plan_names]

            # 🔸 Extract user health vector
            user_vector = user_row[NUMERICAL_COLS].fillna(0).values.astype(float)

            # 🔸 Append training sample
            training_samples.append({
                'user_vector': list(user_vector),
                'plan_sequence': plan_ids
            })

    # ======================================================================================
    # 🔹 Save final dataset to disk
    # ======================================================================================
    training_df = pd.DataFrame(training_samples)

    # Convert lists to JSON strings for CSV storage
    training_df['user_vector'] = training_df['user_vector'].apply(json.dumps)
    training_df['plan_sequence'] = training_df['plan_sequence'].apply(json.dumps)

    # Save to CSV file
    data_dir = os.path.join(base_dir, 'data')
    os.makedirs(data_dir, exist_ok=True)
    training_path = os.path.join(data_dir, '1_bootstrap_training_data.csv')
    training_df.to_csv(training_path, index=False)

    print(f"\n✅ All Done! Saved {len(training_df)} high-quality training samples to: {training_path}")

# 🔸 Execute function only if script is run directly (not imported)
if __name__ == '__main__':
    create_training_data()
