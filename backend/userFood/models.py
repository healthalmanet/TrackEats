from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.utils import timezone
from django.conf import settings


class FoodItem(models.Model):
    # --- Basic Info & Serving ---
    name = models.CharField(max_length=150, unique=True, help_text="The unique name of the food item.")
    default_quantity = models.FloatField(default=1, help_text="e.g., 1, 2, 100")
    default_unit = models.CharField(max_length=20, default="piece", help_text="e.g., piece, cup, bowl, g")
    gram_equivalent = models.FloatField(null=True, blank=True, help_text="The equivalent weight in grams for the default serving (e.g., 1 cup = 240g)")

    # --- Core Macronutrients (per default serving) ---
    calories = models.FloatField()
    protein = models.FloatField(help_text="Protein in grams")
    carbs = models.FloatField(help_text="Carbohydrates in grams")
    fats = models.FloatField(help_text="Total Fat in grams")
    sugar = models.FloatField(null=True, blank=True, help_text="Sugar in grams")
    fiber = models.FloatField(null=True, blank=True, help_text="Fiber in grams")

    # --- Fat Profile (per default serving) ---
    saturated_fat_g = models.FloatField(null=True, blank=True, verbose_name="Saturated Fat (g)")
    trans_fat_g = models.FloatField(null=True, blank=True, verbose_name="Trans Fat (g)")
    
    # --- Glycemic Data ---
    estimated_gi = models.FloatField(null=True, blank=True, verbose_name="Estimated Glycemic Index")
    glycemic_load = models.FloatField(null=True, blank=True, verbose_name="Glycemic Load")

    # --- Minerals (per default serving) ---
    sodium_mg = models.FloatField(null=True, blank=True, verbose_name="Sodium (mg)")
    potassium_mg = models.FloatField(null=True, blank=True, verbose_name="Potassium (mg)")
    iron_mg = models.FloatField(null=True, blank=True, verbose_name="Iron (mg)")
    calcium_mg = models.FloatField(null=True, blank=True, verbose_name="Calcium (mg)")
    iodine_mcg = models.FloatField(null=True, blank=True, verbose_name="Iodine (mcg)")
    zinc_mg = models.FloatField(null=True, blank=True, verbose_name="Zinc (mg)")
    magnesium_mg = models.FloatField(null=True, blank=True, verbose_name="Magnesium (mg)")
    selenium_mcg = models.FloatField(null=True, blank=True, verbose_name="Selenium (mcg)")

    # --- Vitamins & Other Nutrients (per default serving) ---
    cholesterol_mg = models.FloatField(null=True, blank=True, verbose_name="Cholesterol (mg)")
    omega_3_g = models.FloatField(null=True, blank=True, verbose_name="Omega-3 (g)")
    vitamin_d_mcg = models.FloatField(null=True, blank=True, verbose_name="Vitamin D (mcg)")
    vitamin_b12_mcg = models.FloatField(null=True, blank=True, verbose_name="Vitamin B12 (mcg)")
    
    # --- Classification & Suitability ---
    FOOD_TYPE_CHOICES = [("Vegetarian", "Vegetarian"), ("Non-Vegetarian", "Non-Vegetarian"), ("Eggetarian", "Eggetarian"), ("Vegan", "Vegan"), ("Other", "Other")]
    food_type = models.CharField(max_length=20, choices=FOOD_TYPE_CHOICES, default="other")
    
    MEAL_TYPE_CHOICES = [
    ("Early-Morning", "Early-Morning"),
    ("Breakfast", "Breakfast"),
    ("Mid-Morning Snack", "Mid-Morning Snack"),
    ("Lunch", "Lunch"),
    ("Afternoon Snack", "Afternoon Snack"),
    ("Dinner", "Dinner"),
    ("Bedtime", "Bedtime"),
]

    meal_type = ArrayField(models.CharField(max_length=20, choices=MEAL_TYPE_CHOICES), default=list, help_text="Suitable for which meals?")

    LEVEL_CHOICES = [("Low", "Low"), ("Medium", "Medium"), ("High", "High"),("Moderate","Moderate"), ("Mild","Mild"), ("None", "None")]
    fodmap_level = models.CharField(max_length=10, choices=LEVEL_CHOICES, default="Low", verbose_name="FODMAP Level")
    spice_level = models.CharField(max_length=10, choices=LEVEL_CHOICES, default="Low", verbose_name="Spice Level")
    purine_level = models.CharField(max_length=10, choices=LEVEL_CHOICES, default="Low", verbose_name="Purine Level")

    # --- Allergens & Remarks ---
    allergens = models.TextField(blank=True, help_text="List of potential allergens, slash-separated (e.g., Gluten/Dairy/Nuts)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class UserMeal(models.Model):
    UNIT_CHOICES = [
        ("Gram", "Gram"), ("Kilogram", "Kilogram"),
        ("Milliliters", "Milliliters"), ("Liters", "Liters"),
        ("Cup", "Cup"), ("Bowl", "Bowl"),
        ("Piece", "Piece"), ("Tbsp", "Tablespoon"),
        ("Tsp", "Teaspoon"), ("Slice", "Slice"),
        ("Plate", "Plate"),
        ("Handful", "Handful"), ("Pinch", "Pinch"),
        ("Dash", "Dash"), ("Sprinkle", "Sprinkle"),
        ("Other", "Other"),
    ]

    MEAL_CHOICES = [
       ("Early-Morning", "Early-Morning"),
       ("Breakfast", "Breakfast"),
       ("Mid-Morning Snack", "Mid-Morning Snack"),
       ("Lunch", "Lunch"),
       ("Afternoon Snack", "Afternoon Snack"),
       ("Dinner", "Dinner"),
       ("Bedtime", "Bedtime"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    food_item = models.ForeignKey('FoodItem', on_delete=models.SET_NULL, null=True, blank=True)
    food_name = models.CharField(max_length=100, blank=True, null=True)

    quantity = models.FloatField()
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES, default="Gram")
    meal_type = models.CharField(max_length=20, choices=MEAL_CHOICES)

    consumed_at = models.DateTimeField(blank=True, null=True)
    date = models.DateField(blank=True, null=True)
    remarks = models.TextField(blank=True)

    # Nutritional snapshot
    total_grams = models.FloatField(blank=True, null=True, help_text="Estimated total weight in grams")
    calories = models.FloatField(blank=True, null=True)
    protein = models.FloatField(blank=True, null=True)
    carbs = models.FloatField(blank=True, null=True)
    fats = models.FloatField(blank=True, null=True)
    sugar = models.FloatField(blank=True, null=True)
    fiber = models.FloatField(blank=True, null=True)
    estimated_gi = models.FloatField(blank=True, null=True)
    glycemic_load = models.FloatField(blank=True, null=True)
    food_type = models.CharField(max_length=20, blank=True, null=True)

    def save(self, *args, **kwargs):
        # Auto-fill from food_item if missing
        if self.food_item:
            self.food_name = self.food_name or self.food_item.name
            self.calories = self.calories or self.food_item.calories
            self.protein = self.protein or self.food_item.protein
            self.carbs = self.carbs or self.food_item.carbs
            self.fats = self.fats or self.food_item.fats
            self.sugar = self.sugar or self.food_item.sugar
            self.fiber = self.fiber or self.food_item.fiber
            self.estimated_gi = self.estimated_gi or self.food_item.estimated_gi
            self.glycemic_load = self.glycemic_load or self.food_item.glycemic_load
            self.food_type = self.food_type or self.food_item.food_type

        if not self.consumed_at:
            self.consumed_at = timezone.now()

        if not self.date:
            self.date = self.consumed_at.date()

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.email} ate {self.food_name or 'Unknown'} on {self.date} — {self.quantity} {self.unit}"
