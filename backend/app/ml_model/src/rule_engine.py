# import pandas as pd
# import re

# def get_allowed_foods(user_report_series, food_df):
#     """
#     Analyzes a user's report against a food database and returns a tuple:
#     1. A DataFrame of medically safe foods based on hard restrictions.
#     2. A list of string flags for dietary suggestions.
#     """
#     filters = []
#     suggestion_flags = []

#     print("\n--- Running Rule Engine ---")

#     def get_value(key, default=0):
#         return user_report_series.get(key, default) if pd.notna(user_report_series.get(key, default)) else default

#     # --- Rule 1: Diabetes / High Blood Sugar ---
#     is_diabetic = (
#         get_value('Fasting Blood Sugar (mg/dL)') >= 126 or
#         get_value('HbA1c (%)') >= 6.5 or
#         get_value('Postprandial Sugar (mg/dL)') >= 200 or
#         str(get_value('Diabetic (Yes/No)', 'no')).lower() == 'yes'
#     )
#     if is_diabetic:
#         print("RULE TRIGGERED: Diabetes / High Blood Sugar.")
#         filters.append((food_df['Estimated_GI'] < 55) & (food_df['Sugar'] < 5) & (food_df['Fiber'] > 5))

#     # --- Rule 2: Gout / High Uric Acid ---
#     gender = str(get_value('Gender', 'male')).lower()
#     uric_acid_threshold = 7.2 if gender == 'male' else 6.0
#     has_gout_risk = (
#         'gout' in str(get_value('Arthritis (RA/OA/Gout) (Yes/No)', '')).lower() or
#         get_value('Uric Acid (mg/dL)') > uric_acid_threshold
#     )
#     if has_gout_risk:
#         print("RULE TRIGGERED: Gout / High Uric Acid.")
#         filters.append(food_df['Purine_Level'].str.lower() == 'low')

#     # --- Rule 3: Hypertension ---
#     if str(get_value('Hypertension (Yes/No)', 'no')).lower() == 'yes':
#         print("RULE TRIGGERED: Hypertension.")
#         filters.append((food_df['Sodium/mg'] < 120) & (food_df['Potassium/mg'] > 300))

#     # --- Rule 4: Cholesterol / Heart Health ---
#     if get_value('LDL (mg/dL)') >= 130 or str(get_value('Heart condition (CVD) (Yes/No)', 'no')).lower() == 'yes':
#         print("RULE TRIGGERED: High LDL / Heart Condition.")
#         filters.append((food_df['Saturated_Fat/g'] < 1.5) & (food_df['Fiber'] > 5) & (food_df['Trans_Fat/g'] == 0))

#     if get_value('Triglycerides (mg/dL)') >= 200:
#         print("RULE TRIGGERED: High Triglycerides.")
#         filters.append((food_df['Sugar'] < 5) & (food_df['Omega_3/g'] > 0.5))

#     # --- Rule 5: Inflammation ---
#     arthritis_flag = str(get_value('Arthritis (RA/OA/Gout) (Yes/No)', 'no')).lower()
#     has_inflammation = (
#         get_value('CRP (mg/L)') > 3 or
#         get_value('ESR (mm/hr)') > 20 or
#         ('ra' in arthritis_flag or 'oa' in arthritis_flag)
#     )
#     if has_inflammation:
#         print("RULE TRIGGERED: High Inflammation (CRP/ESR/Arthritis).")
#         filters.append(food_df['Spice_Level'].str.lower().isin(['low', 'none']))

#     # --- Rule 6: Kidney Stress ---
#     if get_value('Creatinine (mg/dL)') > 1.3 or get_value('Urea (mg/dL)') > 45:
#         print("RULE TRIGGERED: Kidney Stress.")
#         filters.append((food_df['Protein'] < 8) & (food_df['Sodium/mg'] < 120))

#     # --- Rule 7: Liver Stress ---
#     if get_value('ALT (U/L)') > 56 or get_value('AST (U/L)') > 40:
#         print("RULE TRIGGERED: Liver Stress.")
#         filters.append((food_df['Fats'] < 5) & (food_df['Fiber'] > 4))

#     # --- Rule 8: Weight Management ---
#     bmi = get_value('BMI (auto-calculated)')
#     waist = get_value('Waist Circumference (cm)')
#     waist_threshold = 94 if gender == 'male' else 80
#     if bmi >= 25 or waist >= waist_threshold:
#         print("RULE TRIGGERED: Overweight / High Waist Circumference.")
#         filters.append((food_df['Calories'] < 200) & (food_df['Fiber'] > 5) & (food_df['Estimated_GI'] < 55))
#     elif bmi > 0 and bmi < 18.5:
#         print("RULE TRIGGERED: Underweight.")
#         filters.append((food_df['Calories'] > 300) & (food_df['Protein'] > 10))

#     # --- Rule 9: Gastric Issues ---
#     if str(get_value('Gastric issues (IBS/GERD) (Yes/No)', 'no')).lower() == 'yes':
#         print("RULE TRIGGERED: Gastric Issues.")
#         filters.append((food_df['FODMAP_Level'].str.lower() == 'low') & (food_df['Fats'] < 5))

#     # --- Rule 10: Family History ---
#     if str(get_value('Family history of diseases', 'no')).lower() not in ['no', 'none', '']:
#         print("RULE TRIGGERED: Family History (Preventive Rules).")
#         filters.append((food_df['Fiber'] > 5) & (food_df['Trans_Fat/g'] == 0) & (food_df['Sodium/mg'] < 120) & (food_df['Sugar'] < 5))

#     # --- Promotional Flags (Suggestions) ---
#     hdl_threshold = 40 if gender == 'male' else 50
#     if get_value('HDL (mg/dL)') < hdl_threshold:
#         print("SUGGESTION: Promote High HDL foods.")
#         suggestion_flags.append('promote_healthy_fats')
#     if get_value('Vitamin D3 (ng/mL)') < 20:
#         print("SUGGESTION: Promote Vitamin D3 rich foods.")
#         suggestion_flags.append('promote_vitamin_d')
#     if get_value('Vitamin B12 (pg/mL)') < 200:
#         print("SUGGESTION: Promote Vitamin B12 rich foods.")
#         suggestion_flags.append('promote_vitamin_b12')
#     if str(get_value('Thyroid disorder (Yes/No)','no')).lower() == 'yes':
#         tsh = get_value('TSH (uIU/mL)')
#         if tsh > 4.0:
#             print("SUGGESTION: Promote Iodine/Selenium for Hypothyroidism.")
#             suggestion_flags.append('promote_hypothyroid_support')
#         elif tsh > 0 and tsh < 0.4:
#             print("SUGGESTION: Moderate Iodine for Hyperthyroidism.")
#             suggestion_flags.append('moderate_hyperthyroid_support')

#     # --- Allergies (Critical Rule) ---
#     user_allergies_str = str(get_value('Known Allergies', '')).lower()
#     user_allergies_str = user_allergies_str.replace('milk', 'dairy') \
#                                            .replace('wheat', 'gluten') \
#                                            .replace('nuts', 'nut') \
#                                            .replace('peanut', 'nut')
#     if pd.notna(user_allergies_str) and user_allergies_str not in ['none', 'no', '']:
#         allergies_list = [a.strip() for a in re.split(r'[,/]', user_allergies_str) if a.strip()]
#         if allergies_list:
#             print(f"RULE TRIGGERED: Allergy filter for: {allergies_list}")

#             def clean_allergens(raw):
#                 if pd.isna(raw) or raw.strip().lower() in ['none', '']:
#                     return []
#                 raw = raw.lower()
#                 raw = re.sub(r'\([^)]*\)', '', raw)
#                 raw = raw.replace('milk', 'dairy').replace('wheat', 'gluten') \
#                          .replace('peanut', 'nut').replace('nuts', 'nut')
#                 tokens = re.split(r'[,/]', raw)
#                 return [t.strip() for t in tokens if t.strip() not in ['none', '']]

#             food_df['parsed_allergens'] = food_df['Allergens'].apply(clean_allergens)

#             def is_safe(allergen_list):
#                 return not any(a in allergen_list for a in allergies_list)

#             allergy_filter = food_df['parsed_allergens'].apply(is_safe)
#             filters.append(allergy_filter)

#     # --- Dietary Preference ---
#     preference = str(get_value('Dietary Preference', '')).lower()
#     if preference == 'vegetarian':
#         print("PREFERENCE: Applying Vegetarian filter.")
#         filters.append(food_df['Vegetarian'].str.lower() != 'non-vegetarian')
#     elif preference == 'vegan':
#         print("PREFERENCE: Applying Vegan filter.")
#         filters.append((food_df['Vegetarian'].str.lower() != 'non-vegetarian') &
#                        (~food_df['Allergens'].str.lower().str.contains('dairy|egg|honey', na=False, regex=True)))

#     # --- Combine Filters ---
#     if not filters:
#         print("No hard restrictions applied. Returning all foods.")
#         return food_df.copy(), suggestion_flags

#     print(f"\nApplying a total of {len(filters)} restrictive filter(s)...")
#     combined_filter = pd.Series([True] * len(food_df), index=food_df.index)
#     for f in filters:
#         combined_filter &= f

#     allowed_foods_df = food_df[combined_filter].copy()
#     print(f"Final allowed food count: {len(allowed_foods_df)}")
#     return allowed_foods_df, suggestion_flags


import pandas as pd
import re

def get_allowed_foods(user_report_series, food_df):
    """
    Analyzes a user's report against a food database and returns a tuple:
    1. A DataFrame of medically safe foods based on hard restrictions.
    2. A list of string flags for dietary suggestions.
    """
    filters = []
    suggestion_flags = []

    def get_value(key, default=0):
        val = user_report_series.get(key, default)
        return val if pd.notna(val) else default

    print("\n--- Running Rule Engine ---")

    # --- Condition 1: Diabetes ---
    is_diabetic = (
        get_value('Fasting Blood Sugar (mg/dL)') >= 126 or
        get_value('HbA1c (%)') >= 6.5 or
        get_value('Postprandial Sugar (mg/dL)') >= 200 or
        str(get_value('Diabetic (Yes/No)', 'no')).lower() == 'yes'
    )
    if is_diabetic:
        print("RULE TRIGGERED: Diabetes / High Blood Sugar.")
        filters.append((food_df['Estimated_GI'] < 60) & (food_df['Sugar'] < 10))

    # --- Condition 2: Gout / High Uric Acid ---
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

    # --- Condition 3: Hypertension ---
    if str(get_value('Hypertension (Yes/No)', 'no')).lower() == 'yes':
        print("RULE TRIGGERED: Hypertension.")
        filters.append((food_df['Sodium/mg'] < 300) & (food_df['Potassium/mg'] > 200))

    # --- Condition 4: Cholesterol / Heart Health ---
    if get_value('LDL (mg/dL)') >= 130 or str(get_value('Heart condition (CVD) (Yes/No)', 'no')).lower() == 'yes':
        print("RULE TRIGGERED: High LDL / Heart Condition.")
        filters.append((food_df['Saturated_Fat/g'] < 3) & (food_df['Fiber'] > 3) & (food_df['Trans_Fat/g'] <= 0.1))
    if get_value('Triglycerides (mg/dL)') >= 200:
        print("RULE TRIGGERED: High Triglycerides.")
        filters.append((food_df['Sugar'] < 10) & (food_df['Omega_3/g'] > 0.1))

    # --- Condition 5: Inflammation ---
    arthritis_flag = str(get_value('Arthritis (RA/OA/Gout) (Yes/No)', 'no')).lower()
    has_inflammation = (
        get_value('CRP (mg/L)') > 3 or
        get_value('ESR (mm/hr)') > 20 or
        ('ra' in arthritis_flag or 'oa' in arthritis_flag)
    )
    if has_inflammation:
        print("RULE TRIGGERED: High Inflammation (CRP/ESR/Arthritis).")
        filters.append(food_df['Spice_Level'].str.lower().isin(['low', 'mild', 'none']))

    # --- Condition 6: Kidney Stress ---
    if get_value('Creatinine (mg/dL)') > 1.3 or get_value('Urea (mg/dL)') > 45:
        print("RULE TRIGGERED: Kidney Stress.")
        filters.append((food_df['Protein'] < 12) & (food_df['Sodium/mg'] < 300))

    # --- Condition 7: Liver Stress ---
    if get_value('AST (U/L)') > 40 or get_value('ALT (U/L)') > 56:
        print("RULE TRIGGERED: Liver Stress.")
        filters.append((food_df['Fats'] < 10) & (food_df['Fiber'] > 3))

    # --- Condition 8: Weight Management ---
    bmi = get_value('BMI (auto-calculated)')
    waist = get_value('Waist Circumference (cm)')
    waist_threshold = 94 if gender == 'male' else 80
    if bmi >= 25 or waist >= waist_threshold:
        print("RULE TRIGGERED: Overweight / High Waist Circumference.")
        filters.append((food_df['Calories'] < 350) & (food_df['Fiber'] > 3) & (food_df['Estimated_GI'] < 65))
    elif bmi > 0 and bmi < 18.5:
        print("RULE TRIGGERED: Underweight.")
        filters.append((food_df['Calories'] > 300) & (food_df['Protein'] > 10))

    # --- Condition 9: Gastric Issues ---
    if str(get_value('Gastric issues (IBS/GERD) (Yes/No)', 'no')).lower() == 'yes':
        print("RULE TRIGGERED: Gastric Issues.")
        filters.append((food_df['FODMAP_Level'].str.lower() == 'low') & (food_df['Fats'] < 10))

    # --- Condition 10: Family History ---
    if str(get_value('Family history of diseases', 'no')).lower() not in ['no', 'none', '']:
        print("RULE TRIGGERED: Family History (Preventive Rules).")
        filters.append((food_df['Fiber'] > 3) & (food_df['Sodium/mg'] < 400) & (food_df['Sugar'] < 15))

    # --- Suggestions ---
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

    # --- Critical: Allergies ---
    user_allergies_str = str(get_value('Known Allergies', '')).lower()
    user_allergies_str = (
        user_allergies_str.replace('milk', 'dairy')
                          .replace('wheat', 'gluten')
                          .replace('peanuts', 'nut')
                          .replace('nuts', 'nut')
                          .replace('peanut', 'nut')
    )
    allergies_list = [a.strip() for a in re.split(r'[,/]', user_allergies_str) if a.strip() not in ['none', 'no', '']]
    if allergies_list:
        print(f"RULE TRIGGERED: Allergy filter for: {allergies_list}")

        def clean_allergens(value):
            if pd.isna(value):
                return []
            value = value.lower()
            value = re.sub(r'\([^)]*\)', '', value)
            value = value.replace('milk', 'dairy').replace('wheat', 'gluten').replace('nuts', 'nut').replace('peanut', 'nut')
            tokens = re.split(r'[,/\\|;:\-\s]', value)
            return [t.strip() for t in tokens if t.strip() not in ['none', '']]

        food_df['parsed_allergens'] = food_df['Allergens'].apply(clean_allergens)

        def is_safe(row_allergens):
            return not any(allergen in row_allergens for allergen in allergies_list)

        filters.append(food_df['parsed_allergens'].apply(is_safe))

    # --- Preferences ---
    preference = str(get_value('Dietary Preference', '')).lower()
    if preference == 'vegetarian':
        print("PREFERENCE: Applying Vegetarian filter.")
        filters.append(food_df['Vegetarian'].str.lower() != 'non-vegetarian')
    elif preference == 'vegan':
        print("PREFERENCE: Applying Vegan filter.")
        filters.append((food_df['Vegetarian'].str.lower() != 'non-vegetarian') & 
                       (~food_df['Allergens'].str.lower().str.contains('dairy|egg|honey', na=False, regex=True)))

    # --- Combine Filters ---
    if not filters:
        print("No hard restrictions applied. Returning all foods.")
        return food_df.copy(), suggestion_flags

    print(f"\nApplying a total of {len(filters)} restrictive filter(s)...")
    combined_filter = pd.Series(True, index=food_df.index)
    for f in filters:
        combined_filter &= f

    allowed_foods_df = food_df[combined_filter].copy()
    print(f"Final allowed food count: {len(allowed_foods_df)}")
    return allowed_foods_df, suggestion_flags