from django.db import models
from django.utils import timezone    
from django.conf import settings # ⬅️ Import Django settings


class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="userprofile")
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

    
class LabReport(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="lab_reports")
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


