from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.utils import timezone
from django.utils.timezone import now
from django.conf import settings
from django.contrib.postgres.fields import JSONField
from django.contrib.postgres.fields import ArrayField

# ---------------------- User Authentication ----------------------

class UserManager(BaseUserManager):
    def create_user(self, email, full_name, password=None):
        if not email:
            raise ValueError("Email is required")
        if not full_name:
            raise ValueError("Full name is required")
        user = self.model(email=self.normalize_email(email), full_name=full_name)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, full_name, password=None):
        user = self.create_user(email, full_name, password)
        user.is_admin = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser):
    ROLE_CHOICES = [
        ("user", "Normal User (Patient)"),
        ("nutritionist", "Nutritionist"),
        ("admin", "Admin"),
        ("owner", "Owner"),
        ("operator", "Operator"),
    ]

    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)  # ✅ New field added here
    date_joined = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="user")

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']  # ✅ Required when creating superuser

    def __str__(self):
        return f"{self.full_name} ({self.email} - {self.role})"

    def has_perm(self, perm, obj=None):
        return self.is_admin or self.role == 'admin'

    def has_module_perms(self, app_label):
        return self.is_admin or self.role == 'admin'

    @property
    def is_staff(self):
        return self.is_admin or self.role in ['admin', 'owner']
# ------------------------
# User Profile
# ------------------------
# class UserProfile(models.Model):
#     user = models.OneToOneField(User, on_delete=models.CASCADE)
#     name = models.CharField(max_length=100)
#     age = models.PositiveIntegerField()
#     country = models.CharField(max_length=100, blank=True, null=True)
#     mobile_number = models.CharField(max_length=15, blank=True, null=True)
#     gender = models.CharField(max_length=10, choices=[("male", "Male"), ("female", "Female")])
#     height_cm = models.FloatField()
#     weight_kg = models.FloatField()
#     activity_level = models.CharField(max_length=50, choices=[
#         ("sedentary", "Sedentary"),
#         ("light", "Light Activity"),
#         ("moderate", "Moderate Activity"),
#         ("active", "Active"),
#         ("very_active", "Very Active"),
#     ])
#     goal = models.CharField(max_length=20, choices=[
#         ("lose_weight", "Lose Weight"),
#         ("maintain", "Maintain Weight"),
#         ("gain_weight", "Gain Weight")
#     ])

#     diet_type = models.CharField(
#         max_length=20,
#         choices=[
#             ("vegetarian", "Vegetarian"),
#             ("non_vegetarian", "Non-Vegetarian"),
#             ("vegan", "Vegan"),
#             ("eggetarian", "Eggetarian"),
#             ("other", "Other"),
#         ],
#         default="other"
#     )
#     HEALTH_CONDITION_CHOICES = [
#         ("diabetes", "Diabetes"),
#         ("hypertension", "Hypertension"),
#         ("thyroid", "Thyroid"),
#         ("cholesterol", "Cholesterol"),
#         ("pcos", "PCOS/PCOD"),
#         ("anemia", "Anemia"),
#         ("cancer", "Cancer"),
#         ("none", "None"),
#     ]

#     health_conditions = ArrayField(
#         models.CharField(max_length=20, choices=HEALTH_CONDITION_CHOICES),
#         blank=True,
#         default=list,
#         help_text="List of health conditions"
#     )
#     def __str__(self):
#         return f"{self.user.email} Profile"
    

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="userprofile")
    # Basic Info
    date_of_birth = models.DateField(null=True, blank=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    mobile_number = models.CharField(max_length=15, blank=True, null=True)
    gender = models.CharField(max_length=10, choices=[("male", "Male"), ("female", "Female"), ("other", "Other")])

    occupation = models.CharField(max_length=100, blank=True, help_text="e.g., Software Developer, Teacher, Construction Worker")
    
    # Core Anthropometry
    height_cm = models.FloatField(null=True, blank=True, help_text="User's current height in cm")
    weight_kg = models.FloatField(null=True, blank=True, help_text="User's current weight in kg")

    # Lifestyle
    activity_level = models.CharField(max_length=50, choices=[
        ("sedentary", "Sedentary (little or no exercise)"),
        ("lightly_active", "Lightly Active (light exercise/sports 1-3 days/week)"),
        ("moderately_active", "Moderately Active (moderate exercise/sports 3-5 days/week)"),
        ("very_active", "Very Active (hard exercise/sports 6-7 days a week)"),
        ("extra_active", "Extra Active (very hard exercise/physical job)"),
    ], null=True, blank=True)
    goal = models.CharField(max_length=20, choices=[
        ("lose_weight", "Lose Weight"),
        ("maintain", "Maintain Weight"),
        ("gain_weight", "Gain Weight")
    ], null=True, blank=True)

    # Dietary Preferences and Restrictions
    diet_type = models.CharField(max_length=20, choices=[
        ("vegetarian", "Vegetarian"), ("non_vegetarian", "Non-Vegetarian"),
        ("vegan", "Vegan"), ("eggetarian", "Eggetarian"),
        ("keto", "Keto"), ("other", "Other"),
    ], default="other")
    allergies = models.TextField(blank=True, help_text="List known food allergies, separated by commas.")

    # Known Medical Conditions (Flags for the Rule Engine)
    is_diabetic = models.BooleanField(default=False, verbose_name="Known Diabetic Condition")
    is_hypertensive = models.BooleanField(default=False, verbose_name="Known Hypertension (High BP)")
    has_heart_condition = models.BooleanField(default=False, verbose_name="Known Heart Condition (CVD)")
    has_thyroid_disorder = models.BooleanField(default=False, verbose_name="Known Thyroid Disorder")
    has_arthritis = models.BooleanField(default=False, verbose_name="Known Arthritis (RA/OA/Gout)")
    has_gastric_issues = models.BooleanField(default=False, verbose_name="Known Gastric Issues (IBS/GERD)")

    # Additional Context
    other_chronic_condition = models.TextField(blank=True, help_text="Describe any other long-term health conditions.")
    family_history = models.TextField(blank=True, help_text="Describe significant family history of diseases.")

    def __str__(self):
        return f"Profile for {self.user.full_name}"
    
    @property
    def bmi(self):
        if self.height_cm and self.weight_kg:
            return round(self.weight_kg / ((self.height_cm / 100) ** 2), 2)
        return 0

# ---------------------- Diabetes-Specific Table ----------------------
    
class LabReport(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="lab_reports")
    report_date = models.DateField(default=timezone.now, help_text="The date the lab report was generated.")

    weight_kg = models.FloatField(null=True, blank=True, help_text="Weight in kg at the time of the report.")
    height_cm = models.FloatField(null=True, blank=True, help_text="Height in cm at the time of the report.")
    waist_circumference_cm = models.FloatField(null=True, blank=True, help_text="Waist circumference in cm.")
    blood_pressure_systolic = models.PositiveIntegerField(null=True, blank=True)
    blood_pressure_diastolic = models.PositiveIntegerField(null=True, blank=True)
    
    fasting_blood_sugar = models.FloatField(null=True, blank=True, help_text="mg/dL")
    postprandial_sugar = models.FloatField(null=True, blank=True, help_text="mg/dL")
    hba1c = models.FloatField(null=True, blank=True, help_text="%")
    
    ldl_cholesterol = models.FloatField(null=True, blank=True, help_text="mg/dL")
    hdl_cholesterol = models.FloatField(null=True, blank=True, help_text="mg/dL")
    triglycerides = models.FloatField(null=True, blank=True, help_text="mg/dL")

    crp = models.FloatField(null=True, blank=True, help_text="mg/L")
    esr = models.FloatField(null=True, blank=True, help_text="mm/hr")
    
    uric_acid = models.FloatField(null=True, blank=True, help_text="mg/dL")
    creatinine = models.FloatField(null=True, blank=True, help_text="mg/dL")
    urea = models.FloatField(null=True, blank=True, help_text="mg/dL")

    alt = models.FloatField(null=True, blank=True, help_text="U/L")
    ast = models.FloatField(null=True, blank=True, help_text="U/L")
    
    vitamin_d3 = models.FloatField(null=True, blank=True, help_text="ng/mL")
    vitamin_b12 = models.FloatField(null=True, blank=True, help_text="pg/mL")

    tsh = models.FloatField(null=True, blank=True, help_text="µIU/mL")

    class Meta:
        ordering = ['-report_date']

    def __str__(self):
        return f"Lab Report for {self.user.full_name} on {self.report_date}"


# class FoodItem(models.Model):
#     FOOD_TYPE_CHOICES = [
#         ("vegetarian", "Vegetarian"),
#         ("non-vegetarian", "Non-Vegetarian"),
#         ("eggetarian", "Eggetarian"),
#         ("vegan", "Vegan"),
#         ("other", "Other"),
#     ]

#     MEAL_TYPE_CHOICES = [
#         ("breakfast", "Breakfast"),
#         ("lunch", "Lunch"),
#         ("dinner", "Dinner"),
#         ("snack", "Snack"),
#         ("dessert", "Dessert"),
#         ("beverage", "Beverage"),
#         ("unknown", "Unknown"),
#     ]

#     name = models.CharField(max_length=150, unique=True)
#     default_quantity = models.FloatField(help_text="Standard portion size (numeric)", default=1)
#     default_unit = models.CharField(max_length=20, help_text="e.g., gram, bowl, tsp", default="g")
#     gram_equivalent = models.FloatField(
#         null=True,
#         blank=True,
#         help_text="Weight in grams for the default_quantity (e.g., 1 plate = 250g)"
#     )

#     # Macronutrients
#     calories = models.FloatField()
#     protein = models.FloatField(help_text="Protein (g)")
#     carbs = models.FloatField(help_text="Carbohydrates (g)")
#     fats = models.FloatField(help_text="Fats (g)")
#     sugar = models.FloatField(help_text="Sugar (g)", null=True, blank=True)
#     fiber = models.FloatField(help_text="Fiber (g)", null=True, blank=True)

#     # Glycemic data
#     estimated_gi = models.FloatField(null=True, blank=True)
#     glycemic_load = models.FloatField(null=True, blank=True)

#     # Classification
#     food_type = models.CharField(max_length=20, choices=FOOD_TYPE_CHOICES, default="other")
#     meal_type = ArrayField(
#         models.CharField(max_length=20, choices=MEAL_TYPE_CHOICES),
#         default=list,
#         help_text="List of meals this food is suitable for (e.g., breakfast, lunch, dinner)"
#     )

#     remarks = models.TextField(blank=True, null=True)

#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return f"{self.name} ({self.food_type} - {', '.join(self.meal_type)})"



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
    FOOD_TYPE_CHOICES = [("vegetarian", "Vegetarian"), ("non_vegetarian", "Non-Vegetarian"), ("eggetarian", "Eggetarian"), ("vegan", "Vegan"), ("other", "Other")]
    food_type = models.CharField(max_length=20, choices=FOOD_TYPE_CHOICES, default="other")
    
    MEAL_TYPE_CHOICES = [
    ("early_morning", "Early-Morning"),
    ("breakfast", "Breakfast"),
    ("morning_snack", "Mid-Morning Snack"),
    ("lunch", "Lunch"),
    ("afternoon_snack", "Afternoon Snack"),
    ("dinner", "Dinner"),
    ("bedtime", "Bedtime"),
]

    meal_type = ArrayField(models.CharField(max_length=20, choices=MEAL_TYPE_CHOICES), default=list, help_text="Suitable for which meals?")

    LEVEL_CHOICES = [("low", "Low"), ("medium", "Medium"), ("high", "High"), ("none", "None")]
    fodmap_level = models.CharField(max_length=10, choices=LEVEL_CHOICES, default="low", verbose_name="FODMAP Level")
    spice_level = models.CharField(max_length=10, choices=LEVEL_CHOICES, default="low", verbose_name="Spice Level")
    purine_level = models.CharField(max_length=10, choices=LEVEL_CHOICES, default="low", verbose_name="Purine Level")

    # --- Allergens & Remarks ---
    allergens = models.TextField(blank=True, help_text="List of potential allergens, slash-separated (e.g., Gluten/Dairy/Nuts)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name




class UserMeal(models.Model):
    UNIT_CHOICES = [
        ("g", "Grams"), ("kg", "Kilograms"),
        ("ml", "Milliliters"), ("l", "Liters"),
        ("cup", "Cup"), ("bowl", "Bowl"),
        ("piece", "Piece"), ("tbsp", "Tablespoon"),
        ("tsp", "Teaspoon"), ("slice", "Slice"),
        ("other", "Other"),
    ]

    MEAL_CHOICES = [
        ("early_morning", "Early-Morning"),
        ("breakfast", "Breakfast"),
        ("morning_snack", "Morning Snack"),
        ("lunch", "Lunch"),
        ("evening_snack", "Evening Snack"),
        ("dinner", "Dinner"),
        ("post_dinner", "Post-Dinner / Bedtime"),
    ]

    user = models.ForeignKey('User', on_delete=models.CASCADE)
    food_item = models.ForeignKey('FoodItem', on_delete=models.SET_NULL, null=True, blank=True)
    food_name = models.CharField(max_length=100, blank=True, null=True)

    quantity = models.FloatField()
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default="g")
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



# ------------------------For OWNER/OPERATOR
class AppReport(models.Model):
    report_date = models.DateField(auto_now_add=True)
    new_users = models.IntegerField()
    active_patients = models.IntegerField()
    total_revenue = models.FloatField()
    feedback_summary = models.TextField(blank=True)

    def __str__(self):
        return f"Report on {self.report_date}"


# ------------------------# Patient Reminders
class PatientReminder(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255, default="General Reminder")
    message = models.TextField(blank=True, default="No message provided.")
    created_at = models.DateTimeField(auto_now_add=True)  # No default here
    sent_at = models.DateTimeField(null=True, blank=True)
    date = models.DateTimeField(default=now)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_reminders"
    )

    def __str__(self):
        if self.user:
            return f"Reminder to {self.user.email} - {self.title}"
        return f"Reminder - {self.title}"


########## ------------------------
# Feedback Model
class Feedback(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    rating = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback by {self.user.email} - {self.rating}⭐"



##############Nutritionist Recommendations
class NutritionistProfile(models.Model):
    EXPERTISE_CHOICES = [
        (1, 'Basic Nutritionist'),
        (2, 'Senior Nutritionist'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='nutritionist_profile')
    expert_level = models.IntegerField(choices=EXPERTISE_CHOICES, default=1)

    def __str__(self):
        return f"{self.user.email} - {self.get_expert_level_display()}" # type: ignore
#Patient Nutritionist Assignment
class PatientAssignment(models.Model):
    nutritionist = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_patients')  # user with nutritionist group
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_nutritionist')
    assigned_at = models.DateTimeField(auto_now_add=True)


# # ------------------------
# # Diet Recommendations
# # ------------------------

# class DietRecommendation(models.Model):
#     STATUS_CHOICES = [
#         ('pending', 'Pending'),
#         ('approved', 'Approved'),
#         ('rejected', 'Rejected'),
#     ]

#     # Existing fields
#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     for_week_starting = models.DateField(default=timezone.now)
#     meals = models.JSONField(default=dict)
#     calories = models.FloatField(default=0)
#     protein = models.FloatField(default=0)
#     carbs = models.FloatField(default=0)
#     fats = models.FloatField(default=0)

#     # ✅ New field
#     status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

#     # Existing review-related fields
#     nutritionist_comment = models.TextField(blank=True, null=True)
#     reviewed_by = models.ForeignKey(
#         User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_diets'
#     )

#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

class DietRecommendation(models.Model):
    """
    Stores an AI-generated diet plan and tracks its lifecycle from
    generation through nutritionist review and its use in retraining.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="diet_recommendations")
    for_week_starting = models.DateField(default=timezone.now)
    meals = models.JSONField(default=dict, help_text="The full 15-day meal plan generated by AI.")


    # --- Review & Workflow Fields ---
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    nutritionist_comment = models.TextField(
        blank=True, null=True, help_text="Comments from the nutritionist for the user."
    )
    reviewed_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_diets'
    )

    # --- Retraining Pipeline Fields ---
    user_profile_snapshot = models.JSONField(
        null=True, blank=True, help_text="Immutable JSON of the user's health vector at generation time."
    )
    original_ai_plan = models.JSONField(
        null=True, blank=True, help_text="The unmodified plan from the AI for comparison."
    )
    approved_for_retraining = models.BooleanField(
        default=False, help_text="Flagged by a nutritionist as a high-quality example for retraining."
    )
    nutritionist_retraining_notes = models.TextField(
        blank=True, null=True, 
        help_text="Internal notes for the ML team about this plan's quality."
    )
    was_used_for_retraining = models.BooleanField(
        default=False, db_index=True, help_text="Set automatically after the plan is used for training."
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Plan for {self.user.username} starting {self.for_week_starting} ({self.get_status_display()})"

    def get_plan_sequence_ids(self, food_vocab):
        """
        Converts meal items to food vocab index sequence.
        """
        if not self.meals or not food_vocab:
            return []
        sequence_ids = []
        day_keys = sorted(self.meals.keys(), key=lambda x: int(x.split(' ')[1]))
        meal_order = ['Early Morning', 'Breakfast', 'Mid-Morning Snack', 'Lunch', 'Evening Snack', 'Dinner', 'Bedtime']
        for day_key in day_keys:
            day_data = self.meals.get(day_key, {})
            if "meals" in day_data:
                for meal_name in meal_order:
                    meal_info = day_data["meals"].get(meal_name, {})
                    food_item_name = meal_info.get("item")
                    if food_item_name and food_item_name in food_vocab:
                        sequence_ids.append(food_vocab[food_item_name])
        return sequence_ids

#User Diet Feedback
# class DietFeedback(models.Model):
#     DAY_CHOICES = [
#     ('Monday', 'Monday'),
#     ('Tuesday', 'Tuesday'),
#     ('Wednesday', 'Wednesday'),
#     ('Thursday', 'Thursday'),
#     ('Friday', 'Friday'),
#     ('Saturday', 'Saturday'),
#     ('Sunday', 'Sunday'),
#     ]
    
#     recommendation = models.ForeignKey(DietRecommendation, on_delete=models.CASCADE, related_name='feedbacks')
#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     day = models.CharField(max_length=10)  # e.g., 'Monday'
#     feedback = models.TextField()
#     rating = models.PositiveSmallIntegerField(default=0)  # 1 to 5 stars
#     created_at = models.DateTimeField(auto_now_add=True)



class DietFeedback(models.Model):
    """
    Stores feedback submitted by a user for a specific day of their diet plan.
    """
    recommendation = models.ForeignKey(DietRecommendation, on_delete=models.CASCADE, related_name='feedbacks')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # This now aligns with the JSON keys in the 'meals' field of DietRecommendation
    day = models.CharField(max_length=15, help_text="e.g., 'Day 1', 'Day 8', etc.")
    
    feedback = models.TextField()
    rating = models.PositiveSmallIntegerField(help_text="User rating from 1 to 5.", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('recommendation', 'user', 'day') # User can only submit one feedback per day per plan

    def __str__(self):
        return f"Feedback by {self.user.username} for {self.day} of plan {self.recommendation.id}"


class ModelRetrainLog(models.Model):
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    feedbacks_used = models.IntegerField(default=0)
    accuracy_score = models.FloatField(null=True, blank=True)
    initiated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

#Nutrionist Feedback for Retraining
# class DietRecommendationFeedback(models.Model):
#     recommendation = models.ForeignKey(DietRecommendation, on_delete=models.CASCADE, related_name="retraining_feedbacks")
#     nutritionist = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={"role": "nutritionist"})
#     feedback = models.TextField()
#     approved_for_training = models.BooleanField(default=False)
#     created_at = models.DateTimeField(auto_now_add=True)


#################################-----------Tools Section Models----------------------------####################
#Water, Weight, and Custom Reminders
class WeightLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    weight_kg = models.FloatField()
    time_logged = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user} - {self.date} - {self.weight_kg} kg"



class WaterIntakeLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='water_logs')
    amount_ml = models.PositiveIntegerField()
    date = models.DateField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.user.email} - {self.amount_ml} ml on {self.date}"


class CustomReminder(models.Model):
    FREQUENCY_CHOICES = [
        ('once', 'Once'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('custom', 'Custom')
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reminders')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    reminder_time = models.TimeField()
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, default='daily')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.user.email}"
    

class Message(models.Model):
    sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_messages', on_delete=models.CASCADE)
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"From {self.sender} to {self.receiver} at {self.timestamp}"
    

class Blog(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blogs')
    title = models.CharField(max_length=255)
    content = models.TextField()
    image_url = models.URLField(null=True, blank=True)
    image = models.ImageField(upload_to='blog_images/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title