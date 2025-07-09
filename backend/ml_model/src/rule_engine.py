import pandas as pd
import re

def get_allowed_foods(user_report_series, food_df):
    """
    Main Rule Engine Function.

    🔹 Input:
        - user_report_series: A pandas Series containing user profile + lab values.
        - food_df: Full food item DataFrame (with nutrients, tags, allergens).

    🔹 Output:
        - filtered DataFrame of foods allowed based on medical filters.
        - suggestion flags for dietary hints (like promote Vitamin D, etc).
    """

    filters = []  # List of hard restriction rules (for filtering foods)
    suggestion_flags = []  # Optional recommendations (e.g., for AI to use)

    # Utility: Safely fetch a field from user_report_series
    def get_value(key, default=0):
        val = user_report_series.get(key, default)
        return val if pd.notna(val) else default

    print("\n--- Running Rule Engine ---")

    # =============================================================================
    # 🔴 MEDICAL CONDITION 1: Diabetes
    # =============================================================================
    is_diabetic = (
        get_value('Fasting Blood Sugar (mg/dL)') >= 126 or
        get_value('HbA1c (%)') >= 6.5 or
        get_value('Postprandial Sugar (mg/dL)') >= 200 or
        str(get_value('Diabetic (Yes/No)', 'no')).lower() == 'yes'
    )
    if is_diabetic:
        print("RULE TRIGGERED: Diabetes / High Blood Sugar.")
        filters.append((food_df['Estimated_GI'] < 60) & (food_df['Sugar'] < 10))

    # =============================================================================
    # 🔴 MEDICAL CONDITION 2: Gout / High Uric Acid
    # =============================================================================
    gender = str(get_value('Gender', 'male')).lower()
    uric_acid_threshold = 7.2 if gender == 'male' else 6.0
    has_gout_risk = (
        'gout' in str(get_value('Arthritis (RA/OA/Gout) (Yes/No)', '')).lower() or
        get_value('Uric Acid (mg/dL)') > uric_acid_threshold
    )
    if has_gout_risk:
        print("RULE TRIGGERED: Gout / High Uric Acid.")
        if 'Purine_Level' in food_df.columns:
            filters.append(food_df['Purine_Level'].str.lower() == 'low')
        else:
            print("WARNING: 'Purine_Level' column not found in food data. Skipping Gout filter.")

    # =============================================================================
    # 🔴 MEDICAL CONDITION 3: Hypertension (High Blood Pressure)
    # =============================================================================
    if str(get_value('Hypertension (Yes/No)', 'no')).lower() == 'yes':
        print("RULE TRIGGERED: Hypertension.")
        filters.append((food_df['Sodium/mg'] < 300) & (food_df['Potassium/mg'] > 200))

    # =============================================================================
    # 🔴 MEDICAL CONDITION 4: High LDL / Heart Disease
    # =============================================================================
    if get_value('LDL (mg/dL)') >= 130 or str(get_value('Heart condition (CVD) (Yes/No)', 'no')).lower() == 'yes':
        print("RULE TRIGGERED: High LDL / Heart Condition.")
        filters.append((food_df['Saturated_Fat/g'] < 3) & (food_df['Fiber'] > 3) & (food_df['Trans_Fat/g'] <= 0.1))

    if get_value('Triglycerides (mg/dL)') >= 200:
        print("RULE TRIGGERED: High Triglycerides.")
        filters.append((food_df['Sugar'] < 10) & (food_df['Omega_3/g'] > 0.1))

    # =============================================================================
    # 🔴 MEDICAL CONDITION 5: Inflammation / Arthritis / CRP / ESR
    # =============================================================================
    arthritis_flag = str(get_value('Arthritis (RA/OA/Gout) (Yes/No)', 'no')).lower()
    has_inflammation = (
        get_value('CRP (mg/L)') > 3 or
        get_value('ESR (mm/hr)') > 20 or
        ('ra' in arthritis_flag or 'oa' in arthritis_flag)
    )
    if has_inflammation:
        print("RULE TRIGGERED: High Inflammation (CRP/ESR/Arthritis).")
        filters.append(food_df['Spice_Level'].str.lower().isin(['low', 'mild', 'none']))

    # =============================================================================
    # 🔴 MEDICAL CONDITION 6: Kidney Stress
    # =============================================================================
    if get_value('Creatinine (mg/dL)') > 1.3 or get_value('Urea (mg/dL)') > 45:
        print("RULE TRIGGERED: Kidney Stress.")
        filters.append((food_df['Protein'] < 12) & (food_df['Sodium/mg'] < 300))

    # =============================================================================
    # 🔴 MEDICAL CONDITION 7: Liver Stress
    # =============================================================================
    if get_value('AST (U/L)') > 40 or get_value('ALT (U/L)') > 56:
        print("RULE TRIGGERED: Liver Stress.")
        filters.append((food_df['Fats'] < 10) & (food_df['Fiber'] > 3))

    # =============================================================================
    # 🔴 MEDICAL CONDITION 8: Weight Management (Obese/Underweight)
    # =============================================================================
    bmi = get_value('BMI (auto-calculated)')
    waist = get_value('Waist Circumference (cm)')
    waist_threshold = 94 if gender == 'male' else 80
    if bmi >= 25 or waist >= waist_threshold:
        print("RULE TRIGGERED: Overweight / High Waist Circumference.")
        filters.append((food_df['Calories'] < 350) & (food_df['Fiber'] > 3) & (food_df['Estimated_GI'] < 65))
    elif bmi > 0 and bmi < 18.5:
        print("RULE TRIGGERED: Underweight.")
        filters.append((food_df['Calories'] > 300) & (food_df['Protein'] > 10))

    # =============================================================================
    # 🔴 MEDICAL CONDITION 9: Gastric Issues (IBS, GERD)
    # =============================================================================
    if str(get_value('Gastric issues (IBS/GERD) (Yes/No)', 'no')).lower() == 'yes':
        print("RULE TRIGGERED: Gastric Issues.")
        filters.append((food_df['FODMAP_Level'].str.lower() == 'low') & (food_df['Fats'] < 10))

    # =============================================================================
    # 🔴 MEDICAL CONDITION 10: Family History (Preventive Rule)
    # =============================================================================
    if str(get_value('Family history of diseases', 'no')).lower() not in ['no', 'none', '']:
        print("RULE TRIGGERED: Family History (Preventive Rules).")
        filters.append((food_df['Fiber'] > 3) & (food_df['Sodium/mg'] < 400) & (food_df['Sugar'] < 15))

    # =============================================================================
    # 💡 NUTRITION SUGGESTIONS (for AI hints only, not for filtering)
    # =============================================================================
    if get_value('HDL (mg/dL)') < (40 if gender == 'male' else 50):
        suggestion_flags.append('promote_healthy_fats')
    if get_value('Vitamin D3 (ng/mL)') < 20:
        suggestion_flags.append('promote_vitamin_d')
    if get_value('Vitamin B12 (pg/mL)') < 200:
        suggestion_flags.append('promote_vitamin_b12')
    if str(get_value('Thyroid disorder (Yes/No)', 'no')).lower() == 'yes':
        tsh = get_value('TSH (uIU/mL)')
        if tsh > 4.0:
            suggestion_flags.append('promote_hypothyroid_support')
        elif tsh < 0.4:
            suggestion_flags.append('moderate_hyperthyroid_support')

    # =============================================================================
    # 🚨 ALLERGY FILTER (Critical!)
    # =============================================================================
    user_allergies_str = str(get_value('Known Allergies', '')).lower()

    # Normalize allergy keywords to match food data
    user_allergies_str = (
        user_allergies_str.replace('milk', 'dairy')
                          .replace('wheat', 'gluten')
                          .replace('peanuts', 'nut')
                          .replace('nuts', 'nut')
                          .replace('peanut', 'nut')
    )

    # Split allergy string into a list of words
    allergies_list = [a.strip() for a in re.split(r'[,/]', user_allergies_str) if a.strip() not in ['none', 'no', '']]
    if allergies_list:
        print(f"RULE TRIGGERED: Allergy filter for: {allergies_list}")

        # Parse allergens from food database into clean lists
        def clean_allergens(value):
            if pd.isna(value):
                return []
            value = value.lower()
            value = re.sub(r'\([^)]*\)', '', value)  # Remove anything in brackets
            value = value.replace('milk', 'dairy').replace('wheat', 'gluten').replace('nuts', 'nut').replace('peanut', 'nut')
            tokens = re.split(r'[,/\\|;:\-\s]', value)
            return [t.strip() for t in tokens if t.strip() not in ['none', '']]

        food_df['parsed_allergens'] = food_df['Allergens'].apply(clean_allergens)

        # Filter out any food that contains an allergen from the user list
        def is_safe(row_allergens):
            return not any(allergen in row_allergens for allergen in allergies_list)

        filters.append(food_df['parsed_allergens'].apply(is_safe))

    # =============================================================================
    # 🌱 DIETARY PREFERENCE (Veg/Vegan)
    # =============================================================================
    preference = str(get_value('Dietary Preference', '')).lower()
    if 'Food_Type' in food_df.columns:
        if preference == 'vegetarian':
            print("PREFERENCE: Applying Vegetarian filter.")
            filters.append(food_df['Food_Type'].str.lower() != 'non-vegetarian')
        elif preference == 'vegan':
            print("PREFERENCE: Applying Vegan filter.")
            filters.append(
                (food_df['Food_Type'].str.lower() != 'non-vegetarian') &
                (~food_df['Allergens'].str.lower().str.contains('dairy|egg|honey', na=False))
            )
    else:
        print("WARNING: 'Food_Type' column not found. Skipping dietary preference filter.")

    # =============================================================================
    # ✅ FINAL FILTER APPLICATION
    # =============================================================================
    if not filters:
        print("No hard restrictions applied. Returning all foods.")
        return food_df.copy(), suggestion_flags

    print(f"\nApplying a total of {len(filters)} restrictive filter(s)...")

    # Combine all filters using logical AND
    combined_filter = pd.Series(True, index=food_df.index)
    for f in filters:
        combined_filter &= f

    allowed_foods_df = food_df[combined_filter].copy()
    print(f"Final allowed food count: {len(allowed_foods_df)}")

    return allowed_foods_df, suggestion_flags
