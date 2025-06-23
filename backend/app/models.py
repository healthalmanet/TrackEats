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
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    age = models.PositiveIntegerField()
    country = models.CharField(max_length=100, blank=True, null=True)
    mobile_number = models.CharField(max_length=15, blank=True, null=True)
    gender = models.CharField(max_length=10, choices=[("male", "Male"), ("female", "Female")])
    height_cm = models.FloatField()
    weight_kg = models.FloatField()
    activity_level = models.CharField(max_length=50, choices=[
        ("sedentary", "Sedentary"),
        ("light", "Light Activity"),
        ("moderate", "Moderate Activity"),
        ("active", "Active"),
        ("very_active", "Very Active"),
    ])
    goal = models.CharField(max_length=20, choices=[
        ("lose_weight", "Lose Weight"),
        ("maintain", "Maintain Weight"),
        ("gain_weight", "Gain Weight")
    ])

    diet_type = models.CharField(
        max_length=20,
        choices=[
            ("vegetarian", "Vegetarian"),
            ("non_vegetarian", "Non-Vegetarian"),
            ("vegan", "Vegan"),
            ("eggetarian", "Eggetarian"),
            ("other", "Other"),
        ],
        default="other"
    )
    HEALTH_CONDITION_CHOICES = [
        ("diabetes", "Diabetes"),
        ("hypertension", "Hypertension"),
        ("thyroid", "Thyroid"),
        ("cholesterol", "Cholesterol"),
        ("pcos", "PCOS/PCOD"),
        ("anemia", "Anemia"),
        ("cancer", "Cancer"),
        ("none", "None"),
    ]

    health_conditions = ArrayField(
        models.CharField(max_length=20, choices=HEALTH_CONDITION_CHOICES),
        blank=True,
        default=list,
        help_text="List of health conditions"
    )
    def __str__(self):
        return f"{self.user.email} Profile"
    

# ---------------------- Diabetes-Specific Table ----------------------
    
class DiabeticProfile(models.Model): 
    DIABETES_TYPE_CHOICES = [
        ('type1', 'Type 1 Diabetes'),
        ('type2', 'Type 2 Diabetes'),

        ('prediabetes','Prediabetes'),
        ('gestational', 'Gestational Diabetes'),
        ('other', 'Other'),
    ]


    user_profile = models.ForeignKey('UserProfile', on_delete=models.CASCADE, related_name='diabetic_reports')
    hba1c = models.FloatField(help_text="HbA1c level (%)")
    fasting_blood_sugar = models.FloatField(help_text="Fasting Blood Sugar (mg/dL)")
    insulin_dependent = models.BooleanField(default=False)
    medications = models.TextField(blank=True, null=True)
    diagnosis_date = models.DateField()

    diabetes_type = models.CharField(max_length=20, choices=DIABETES_TYPE_CHOICES, default='type2')

    total_cholesterol = models.FloatField(help_text="Total Cholesterol (mg/dL)", null=True, blank=True)


    def __str__(self):
        return f"Diabetes Profile for {self.user_profile.name}"
    
# ------------------------
# Food Items
# ------------------------
# class FoodItem(models.Model):
#     FOOD_TYPE_CHOICES = [
#         ("vegetarian", "Vegetarian"),
#         ("non_vegetarian", "Non-Vegetarian"),
#         ("vegan", "Vegan"),
#         ("eggetarian", "Eggetarian"),
#         ("other", "Other"),
#     ]

#     HEALTH_CONDITION_CHOICES = [
#         ("none", "None"),
#         ("diabetes", "Diabetes"),
#         ("thyroid", "Thyroid"),
#         ("hypertension", "Hypertension"),
#     ]

#     GOAL_CHOICES = [
#         ("weight_loss", "Weight Loss"),
#         ("maintain", "Maintain Weight"),
#         ("gain_weight", "Gain Weight"),
#     ]

#     name = models.CharField(max_length=100)
#     calories = models.FloatField()
#     protein_g = models.FloatField()
#     carbs_g = models.FloatField()
#     fats_g = models.FloatField()
#     sugar_g = models.FloatField()
#     fiber_g = models.FloatField()
#     glycemic_index = models.FloatField(null=True, blank=True)

#     food_type = models.CharField(max_length=20, choices=FOOD_TYPE_CHOICES, default="other")
#     suitable_for_conditions = models.CharField(max_length=50, choices=HEALTH_CONDITION_CHOICES, default="none")
#     suitable_for_goal = models.CharField(max_length=20, choices=GOAL_CHOICES, default="maintain")

#     def __str__(self):
#         return f"{self.name} ({self.food_type})"
from django.db import models

class FoodItem(models.Model):
    FOOD_TYPE_CHOICES = [
        ("veg", "Vegetarian"),
        ("non_veg", "Non-Vegetarian"),
        ("vegan", "Vegan"),
        ("eggetarian", "Eggetarian"),
        ("other", "Other"),
    ]

    MEAL_TYPE_CHOICES = [
        ("breakfast", "Breakfast"),
        ("lunch_dinner", "Lunch/Dinner"),
        ("snack", "Snack"),
        ("unknown", "Unknown"),
    ]

    name = models.CharField(max_length=150, unique=True)
    calories = models.FloatField()
    protein = models.FloatField(help_text="Protein (g)")
    carbs = models.FloatField(help_text="Carbohydrates (g)")
    fats = models.FloatField(help_text="Fats (g)")
    estimated_gi = models.FloatField(null=True, blank=True, help_text="Estimated Glycemic Index")
    glycemic_load = models.FloatField(null=True, blank=True)

    food_type = models.CharField(max_length=15, choices=FOOD_TYPE_CHOICES, default="other")
    meal_type = models.CharField(max_length=15, choices=MEAL_TYPE_CHOICES, default="unknown")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.get_food_type_display()} - {self.get_meal_type_display()})"


# class UserMeal(models.Model):
#     UNIT_CHOICES = [
#         ("g", "Grams"), ("kg", "Kilograms"),
#         ("ml", "Milliliters"), ("l", "Liters"),
#         ("cup", "Cup"), ("bowl", "Bowl"),
#         ("piece", "Piece"), ("tbsp", "Tablespoon"),
#         ("tsp", "Teaspoon"), ("slice", "Slice"),
#         ("other", "Other"),
#     ]

#     MEAL_CHOICES = [
#         ("breakfast", "Breakfast"),
#         ("lunch", "Lunch"),
#         ("dinner", "Dinner"),
#         ("snack", "Snack"),
#     ]

#     user = models.ForeignKey('User', on_delete=models.CASCADE)
#     food_item = models.ForeignKey('FoodItem', on_delete=models.SET_NULL, null=True, blank=True)
#     food_name = models.CharField(max_length=100, blank=True, null=True)

#     quantity = models.FloatField()
#     unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default="g")
#     meal_type = models.CharField(max_length=20, choices=MEAL_CHOICES)

#     consumed_at = models.DateTimeField(blank=True, null=True)
#     date = models.DateField(blank=True, null=True)

#     remarks = models.TextField(blank=True)

#     calories = models.FloatField(blank=True, null=True)
#     protein = models.FloatField(blank=True, null=True)
#     carbs = models.FloatField(blank=True, null=True)
#     fats = models.FloatField(blank=True, null=True)
#     sugar = models.FloatField(blank=True, null=True)
#     fiber = models.FloatField(blank=True, null=True)

#     def save(self, *args, **kwargs):
#         # Auto-populate food_name if not provided but food_item is set
#         if not self.food_name and self.food_item:
#             self.food_name = self.food_item.name

#         # ✅ If consumed_at not provided → set to now
#         if not self.consumed_at:
#             self.consumed_at = timezone.now()

#         # ✅ If date not provided → set from consumed_at.date()
#         if not self.date:
#             self.date = self.consumed_at.date()

#         super().save(*args, **kwargs)

#     def __str__(self):
#         return f"{self.user.email} ate {self.food_name or 'Unknown'} on {self.date} — {self.quantity} {self.unit}"

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
        ("breakfast", "Breakfast"),
        ("lunch", "Lunch"),
        ("dinner", "Dinner"),
        ("snack", "Snack"),
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

    # Nutritional snapshot at the time of logging
    calories = models.FloatField(blank=True, null=True)
    protein = models.FloatField(blank=True, null=True)
    carbs = models.FloatField(blank=True, null=True)
    fats = models.FloatField(blank=True, null=True)
    sugar = models.FloatField(blank=True, null=True)
    fiber = models.FloatField(blank=True, null=True)
    estimated_gi = models.FloatField(blank=True, null=True)
    glycemic_load = models.FloatField(blank=True, null=True)
    food_type = models.CharField(max_length=20, blank=True, null=True)  # <-- added

    def save(self, *args, **kwargs):
        # Auto-populate food_name & nutrition from food_item
        if self.food_item:
            if not self.food_name:
                self.food_name = self.food_item.name
            if not self.calories:
                self.calories = self.food_item.calories
            if not self.protein:
                self.protein = self.food_item.protein
            if not self.carbs:
                self.carbs = self.food_item.carbs
            if not self.fats:
                self.fats = self.food_item.fats
            if not self.estimated_gi:
                self.estimated_gi = self.food_item.estimated_gi
            if not self.glycemic_load:
                self.glycemic_load = self.food_item.glycemic_load
            if not self.food_type:
                self.food_type = self.food_item.food_type

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

class DietRecommendation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Monday of the week
    for_week_starting = models.DateField(default=timezone.now)
    meals = models.JSONField(default=dict)  #   # Structure: { 'Monday': {'breakfast': ..., 'lunch': ..., 'dinner': ...}, ... }
    
    
    calories = models.FloatField(default=0)
    protein = models.FloatField(default=0)
    carbs = models.FloatField(default=0)
    fats = models.FloatField(default=0)
    
    approved_by_nutritionist = models.BooleanField(default=False)
    nutritionist_comment = models.TextField(blank=True, null=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_dietrecommendations')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

#User Diet Feedback
class DietFeedback(models.Model):
    DAY_CHOICES = [
    ('Monday', 'Monday'),
    ('Tuesday', 'Tuesday'),
    ('Wednesday', 'Wednesday'),
    ('Thursday', 'Thursday'),
    ('Friday', 'Friday'),
    ('Saturday', 'Saturday'),
    ('Sunday', 'Sunday'),
    ]
    
    recommendation = models.ForeignKey(DietRecommendation, on_delete=models.CASCADE, related_name='feedbacks')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    day = models.CharField(max_length=10)  # e.g., 'Monday'
    feedback = models.TextField()
    rating = models.PositiveSmallIntegerField(default=0)  # 1 to 5 stars
    created_at = models.DateTimeField(auto_now_add=True)

class ModelRetrainLog(models.Model):
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    feedbacks_used = models.IntegerField(default=0)
    accuracy_score = models.FloatField(null=True, blank=True)
    initiated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

#Nutrionist Feedback for Retraining
class DietRecommendationFeedback(models.Model):
    recommendation = models.ForeignKey(DietRecommendation, on_delete=models.CASCADE, related_name="retraining_feedbacks")
    nutritionist = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={"role": "nutritionist"})
    feedback = models.TextField()
    approved_for_training = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


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