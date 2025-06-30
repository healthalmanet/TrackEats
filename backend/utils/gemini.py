import google.generativeai as genai
from decouple import config
import json

# ✅ Set your Gemini API Key
genai.configure(api_key=config("GEMINI_API_KEY"))

# def fetch_nutrition_from_gemini(food_name, quantity=1, unit="g"):
#     prompt = f"""
# Give nutritional information for {quantity} {unit} of "{food_name}" in this exact JSON format.
# Return raw JSON only. Do not include markdown, code blocks, or extra text. 
# Make sure `food_type` is either "vegetarian" or "non-vegetarian".
# Also include 'gram_equivalent' as the weight in grams for the given quantity and unit.

# {{
#   "food_name": "...",
#   "quantity": ...,             
#   "unit": "...",               
#   "gram_equivalent": ...,      # ⬅️ NEW FIELD
#   "calories": ...,
#   "protein": ...,              
#   "fat": ...,                  
#   "carbohydrates": ...,        
#   "sugar": ...,                
#   "fiber": ...,                
#   "glycemic_index": ...,       
#   "glycemic_load": ...,        
#   "remarks": "...",            
#   "food_type": "...",          
#   "meal_type": "..."           
# }}
# """

#     try:
#         model = genai.GenerativeModel(model_name="models/gemini-1.5-flash-latest")
#         response = model.generate_content(prompt)

#         if not hasattr(response, 'text') or not response.text:
#             raise ValueError("Gemini response is empty or missing text.")

#         text = response.text.strip()

#         # 🔧 Remove markdown and non-JSON prefixes
#         if text.startswith("```"):
#             text = text.split("```")[1].strip()

#         if text.lower().startswith("json"):
#             text = text[4:].lstrip(":").strip()

#         # 🪵 Debug output (remove or log properly in production)
#         print("🌟 Gemini Raw Response:", text)

#         data = json.loads(text)

#         # 🧠 Auto-calculate glycemic load if missing
#         if (
#             not data.get("glycemic_load")
#             and data.get("glycemic_index") is not None
#             and data.get("carbohydrates") is not None
#         ):
#             data["glycemic_load"] = round(
#                 (data["glycemic_index"] * data["carbohydrates"]) / 100, 2
#             )

#         return data

#     except json.JSONDecodeError as e:
#         raise ValueError(f"Failed to parse Gemini response as JSON: {str(e)}")

#     except Exception as e:
#         raise ValueError(f"Gemini API error: {str(e)}")



def fetch_nutrition_from_gemini(food_name, quantity=1, unit="g"):
    prompt = f"""
Give nutritional information for {quantity} {unit} of "{food_name}" in this exact JSON format.
Return raw JSON only. Do not include markdown, code blocks, or extra text. 
Make sure `food_type` is either "vegetarian" or "non-vegetarian".
Also include 'gram_equivalent' as the weight in grams for the given quantity and unit.

{{
  "food_name": "...",
  "quantity": ...,             
  "unit": "...",               
  "gram_equivalent": ...,      
  "calories": ...,
  "protein": ...,              
  "fat": ...,                  
  "carbohydrates": ...,        
  "sugar": ...,                
  "fiber": ...,                
  "glycemic_index": ...,       
  "glycemic_load": ...,        
  "remarks": "...",            
  "food_type": "...",          
  "meal_type": "..."           
}}
"""

    try:
        model = genai.GenerativeModel(model_name="models/gemini-1.5-flash-latest")
        response = model.generate_content(prompt)

        if not hasattr(response, 'text') or not response.text:
            raise ValueError("Gemini response is empty or missing text.")

        text = response.text.strip()

        # 🧹 Clean markdown/code fences if any
        if text.startswith("```"):
            text = text.split("```")[1].strip()
        if text.lower().startswith("json"):
            text = text[4:].lstrip(":").strip()

        # 🧠 Parse JSON
        data = json.loads(text)

        # 🧠 Auto-calculate glycemic load if missing
        if (
            not data.get("glycemic_load")
            and data.get("glycemic_index") is not None
            and data.get("carbohydrates") is not None
        ):
            data["glycemic_load"] = round(
                (data["glycemic_index"] * data["carbohydrates"]) / 100, 2
            )

        return data

    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse Gemini response as JSON: {str(e)}")

    except Exception as e:
        raise ValueError(f"Gemini API error: {str(e)}")