from rest_framework import serializers
from user.models import User
from userProfile.models import UserProfile,LabReport
from userFood.models import UserMeal
from nutritionist.models import DietRecommendation

#############------------------------------------------nutritonist serializer----------------------------######################
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'role', 'date_joined']  # ✅ Add full_name here
        read_only_fields = ['email', 'role', 'date_joined']  # Prevents accidental changes to email/role/date


class UserSerializer1(serializers.ModelSerializer):
    """
    Serializer for the custom User model.
    """
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'role', 'date_joined', 'is_active']


class LabReportSerializer1(serializers.ModelSerializer):
    """
    Serializer for the LabReport model.
    """
    class Meta:
        model = LabReport
        # List all fields you want to expose from the lab report
        fields = [
            'id', 'report_date', 'weight_kg', 'height_cm', 'waist_circumference_cm',
            'blood_pressure_systolic', 'blood_pressure_diastolic',
            'fasting_blood_sugar', 'postprandial_sugar', 'hba1c',
            'ldl_cholesterol', 'hdl_cholesterol', 'triglycerides', 'crp', 'esr',
            'uric_acid', 'creatinine', 'urea', 'alt', 'ast', 'vitamin_d3',
            'vitamin_b12', 'tsh'
        ]


class PatientProfileSerializer1(serializers.ModelSerializer):
    """
    Serializer for the UserProfile model, designed for nutritionist view.
    """
    # Nest the user's basic info directly
    email = serializers.EmailField(source='user.email', read_only=True)
    full_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = UserProfile
        # List all fields from UserProfile you want to show
        fields = [
            'email', 'full_name', 'date_of_birth', 'gender', 'occupation',
            'height_cm', 'weight_kg', 'bmi', 'activity_level', 'goal',
            'diet_type', 'allergies', 'is_diabetic', 'is_hypertensive',
            'has_heart_condition', 'has_thyroid_disorder', 'has_arthritis',
            'has_gastric_issues', 'other_chronic_condition', 'family_history'
        ]

class UserMealSerializer1(serializers.ModelSerializer):
    """
    Serializer for patient's meal logs.
    """
    food_item_name = serializers.CharField(source='food_item.name', read_only=True, default='')

    class Meta:
        model = UserMeal
        fields = [
            'id', 'food_item_name', 'food_name', 'quantity', 'unit', 'meal_type',
            'consumed_at', 'date', 'calories', 'protein', 'carbs', 'fats'
        ]


class DietRecommendationWithPatientSerializer1(serializers.ModelSerializer):
    """
    Serializer for DietRecommendation that includes patient details.
    """
    patient_info = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = DietRecommendation
        fields = [
            'id', 'for_week_starting', 'status', 'created_at',
            'patient_info', 'meals', 'nutritionist_comment'
        ]
####################################################################----------------------------------------##########################

