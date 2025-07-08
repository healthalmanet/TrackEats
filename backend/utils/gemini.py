import google.generativeai as genai
from decouple import config
import json

# ✅ Set your Gemini API Key
genai.configure(api_key=config("GEMINI_API_KEY"))

def fetch_nutrition_from_gemini(food_name, quantity=1, unit="piece"):
    """
    Uses Gemini AI to get complete and accurate nutritional information
    for a food item, with no estimates and no nulls.
    """
    prompt = f"""
Give 100% accurate nutritional information for: {quantity} {unit} of "{food_name}".

🔒 STRICT INSTRUCTIONS:
- Use only real values from reliable nutritional databases.
- Do NOT estimate or calculate.
- DO NOT return `null` for any field.
- Do not skip micronutrients like selenium_mcg, zinc_mg, magnesium_mg, glycemic_index, glycemic_load — these MUST be included with accurate values.
- Output only valid JSON — no explanations, no markdown, no comments.
- food_type must be one of: "Vegetarian", "Non-Vegetarian", "Vegan".
- meal_type must be one of slash separated: "Early-Morning", "Breakfast", "Mid-Morning Snack", "Lunch", "Afternoon Snack", "Dinner", "Bedtime", "Dessert".
- allergens must be slash separated (e.g., "Gluten/Nuts/Dairy/Soy").

Use this exact JSON format:
{{
  "food_name": "{food_name}",
  "quantity": {quantity},
  "unit": "{unit}",
  "gram_equivalent": <number>,
  "calories": <number>,
  "protein": <number>,
  "carbohydrates": <number>,
  "fats": <number>,
  "sugar": <number>,
  "fiber": <number>,
  "saturated_fat_g": <number>,
  "trans_fat_g": <number>,
  "glycemic_index": <number>,
  "glycemic_load": <number>,
  "sodium_mg": <number>,
  "potassium_mg": <number>,
  "iron_mg": <number>,
  "calcium_mg": <number>,
  "iodine_mcg": <number>,
  "zinc_mg": <number>,
  "magnesium_mg": <number>,
  "selenium_mcg": <number>,
  "cholesterol_mg": <number>,
  "omega_3_g": <number>,
  "vitamin_d_mcg": <number>,
  "vitamin_b12_mcg": <number>,
  "food_type": "<Vegetarian | Non-Vegetarian | Vegan>",
  "meal_type": ["<string>", "..."],
  "fodmap_level": "<low | medium | high | none>",
  "spice_level": "<low | medium | high>",
  "purine_level": "<low | medium | high>",
  "allergens": "<comma-separated list or empty string>"
}}
"""

    try:
        model = genai.GenerativeModel(model_name="models/gemini-1.5-flash-latest")
        response = model.generate_content(prompt)

        if not hasattr(response, 'text') or not response.text:
            raise ValueError("Gemini response is empty or missing text.")

        text = response.text.strip()

        # Clean markdown fences if present
        if text.startswith("```"):
            text = text.split("```")[1].strip()
            if text.lower().startswith("json"):
                text = text[4:].lstrip(":").strip()

        # Find start of JSON
        start_index = text.find("{")
        if start_index > 0:
            text = text[start_index:]

        # Load JSON
        data = json.loads(text)

        # Map to your model
        model_data = {
            'name': data.get('food_name'),
            'default_quantity': data.get('quantity'),
            'default_unit': data.get('unit'),
            'gram_equivalent': data.get('gram_equivalent'),
            'calories': data.get('calories'),
            'protein': data.get('protein'),
            'carbs': data.get('carbohydrates'),
            'fats': data.get('fats', data.get('fat')),
            'sugar': data.get('sugar'),
            'fiber': data.get('fiber'),
            'saturated_fat_g': data.get('saturated_fat_g'),
            'trans_fat_g': data.get('trans_fat_g'),
            'estimated_gi': data.get('glycemic_index'),
            'glycemic_load': data.get('glycemic_load'),
            'sodium_mg': data.get('sodium_mg'),
            'potassium_mg': data.get('potassium_mg'),
            'iron_mg': data.get('iron_mg'),
            'calcium_mg': data.get('calcium_mg'),
            'iodine_mcg': data.get('iodine_mcg'),
            'zinc_mg': data.get('zinc_mg'),
            'magnesium_mg': data.get('magnesium_mg'),
            'selenium_mcg': data.get('selenium_mcg'),
            'cholesterol_mg': data.get('cholesterol_mg'),
            'omega_3_g': data.get('omega_3_g'),
            'vitamin_d_mcg': data.get('vitamin_d_mcg'),
            'vitamin_b12_mcg': data.get('vitamin_b12_mcg'),
            'food_type': data.get('food_type'),
            'meal_type': data.get('meal_type'),
            'fodmap_level': data.get('fodmap_level'),
            'spice_level': data.get('spice_level'),
            'purine_level': data.get('purine_level'),
            'allergens': data.get('allergens'),
        }

        print("✅ Gemini Raw JSON:", json.dumps(data, indent=2))
        print("✅ Mapped Model:", json.dumps(model_data, indent=2))

        return model_data

    except json.JSONDecodeError as e:
        print(f"❌ Gemini JSON Decode Error:\n{text}")
        raise ValueError(f"Invalid JSON: {str(e)}")

    except Exception as e:
        raise ValueError(f"Gemini API Error: {str(e)}")
