# import csv
# import os
# from app.models import FoodItem  # Replace 'yourapp' with your actual app name
# from django.conf import settings

# csv_file_path = os.path.join(settings.BASE_DIR, 'app', 'dataset', 'indian_food_items.csv')

# with open(csv_file_path, newline='', encoding='utf-8') as csvfile:
#     reader = csv.DictReader(csvfile)
#     for row in reader:
#         FoodItem.objects.create(
#             name=row['name'],
#             calories=float(row['calories']),
#             protein_g=float(row['protein_g']),
#             carbs_g=float(row['carbs_g']),
#             fats_g=float(row['fats_g']),
#             sugar_g=float(row['sugar_g']),
#             fiber_g=float(row['fiber_g']),
#             glycemic_index=float(row['glycemic_index']),
#             food_type=row['food_type'],
#             suitable_for_conditions=row['suitable_for_conditions'],
#             suitable_for_goal=row['suitable_for_goal'],
#         )
# print("Data imported successfully!")

# import csv
# import os
# from app.models import FoodItem  # Replace 'app' with your actual app name
# from django.conf import settings

# csv_file_path = os.path.join(settings.BASE_DIR, 'app', 'dataset', 'a.csv')

# with open(csv_file_path, newline='', encoding='utf-8') as csvfile:
#     reader = csv.DictReader(csvfile)
#     for row in reader:
#         FoodItem.objects.create(
#             name=row['food_name'],
#             calories=float(row['calories']),
#             protein=float(row['protein']),
#             carbs=float(row['carbs']),
#             fats=float(row['fats']),
#             estimated_gi=float(row['estimated_gi']) if row['estimated_gi'] else None,
#             glycemic_load=float(row['glycemic_load']) if row['glycemic_load'] else None,
#             food_type=row['food_type'].lower(),  # Convert 'Veg' → 'veg', 'Non-Veg' → 'non_veg'
#             meal_type=row['meal_type'].lower() if row['meal_type'] else 'unknown',
#             print("x")
#         )
# print("Data imported successfully!")

# # python manage.py shell < app/dataset/r.py


# import csv
# import os
# from app.models import FoodItem
# from django.conf import settings

# csv_file_path = os.path.join(settings.BASE_DIR, 'app', 'dataset', 'a.csv')

# with open(csv_file_path, newline='', encoding='utf-8') as csvfile:
#     reader = csv.DictReader(csvfile)
#     for row in reader:
#         FoodItem.objects.get_or_create(
#             name=row['food_name'],
#             defaults={
#                 'calories': float(row['calories']),
#                 'protein': float(row['protein']),
#                 'carbs': float(row['carbs']),
#                 'fats': float(row['fats']),
#                 'estimated_gi': float(row['estimated_gi']) if row['estimated_gi'] else None,
#                 'glycemic_load': float(row['glycemic_load']) if row['glycemic_load'] else None,
#                 'food_type': row['food_type'].lower() if row['food_type'] else 'unknown',
#                 'meal_type': row['meal_type'].lower() if row['meal_type'] else 'unknown',
#             }
#         )

# print("✅ Data imported successfully using get_or_create!")

import csv
import os
from app.models import FoodItem
from django.conf import settings

csv_file_path = os.path.join(settings.BASE_DIR, 'app', 'dataset', 'a.csv')

existing_names = set(FoodItem.objects.values_list('name', flat=True))

def clean_number(value):
    if not value or value.strip() == '':
        return None
    cleaned = value.replace('kcal', '').replace('g', '').replace('mg', '').strip()
    try:
        return float(cleaned)
    except ValueError:
        return None  # Handle invalid entries gracefully

new_items = []
with open(csv_file_path, newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        name = row['food_name']
        if name in existing_names:
            continue

        calories = clean_number(row.get('calories', ''))
        protein = clean_number(row.get('protein', ''))
        carbs = clean_number(row.get('carbs', ''))
        fats = clean_number(row.get('fats', ''))
        estimated_gi = clean_number(row.get('estimated_gi', ''))
        glycemic_load = clean_number(row.get('glycemic_load', ''))
        food_type = row.get('food_type', 'unknown').lower() or 'unknown'
        meal_type = row.get('meal_type', 'unknown').lower() or 'unknown'

        # Mandatory fields check
        if name and calories is not None and protein is not None and carbs is not None and fats is not None:
            new_items.append(FoodItem(
                name=name,
                calories=calories,
                protein=protein,
                carbs=carbs,
                fats=fats,
                estimated_gi=estimated_gi,
                glycemic_load=glycemic_load,
                food_type=food_type,
                meal_type=meal_type,
            ))

FoodItem.objects.bulk_create(new_items, batch_size=500)
print(f"✅ Inserted {len(new_items)} new clean records.")