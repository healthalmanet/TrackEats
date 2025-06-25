from rest_framework import serializers
from .models import (
    User, UserProfile, DiabeticProfile,UserMeal,
    PatientReminder, FoodItem, NutritionistProfile,
    DietRecommendation, DietFeedback,
    PatientAssignment, UserMeal, DietRecommendationFeedback,
    Feedback,
    WeightLog,WaterIntakeLog,CustomReminder, Message
    
)
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


# JWT Serializer with additional claims
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['email'] = user.email
        token['full_name'] = user.full_name  # ✅ Add full_name to the token payload
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['role'] = self.user.role
        data['email'] = self.user.email
        data['full_name'] = self.user.full_name  # ✅ Add full_name to response body
        return data


# User Registration
class RegisterSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(required=True)  # ✅ Add this to expose it in API page

    class Meta:
        model = User
        fields = ['email', 'full_name', 'password']  # ✅ Include full_name here
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

# User Profile Serializer
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        exclude = ['user']


# Diabetic Profile Serializer
class DiabeticProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiabeticProfile
        fields = '__all__'
        extra_kwargs = {
            'user_profile': {'read_only': True}  # ✅ prevent user from needing to provide it
        }

# Nutritionist Profile Serializer
class NutritionistProfileSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = NutritionistProfile
        fields = ['id', 'user']


# User Meal Logging
class UserMealSerializer(serializers.ModelSerializer):
    food_name = serializers.CharField()
    meal_type = serializers.ChoiceField(choices=["breakfast", "lunch", "dinner", "snack"])

    class Meta:
        model = UserMeal
        fields = [
            "id", "food_name", "meal_type", "unit", "quantity", "calories",
            "protein", "carbs", "fats", "sugar", "fiber",
            "consumed_at", "remarks", "date"
        ]
        read_only_fields = [
            "calories", "protein", "carbs", "fats", "sugar", "fiber"
        ]


# Patient Reminders
class PatientReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientReminder
        fields = '__all__'


# Food Items
class FoodItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodItem
        fields = ['id', 'name', 'calories']


# Diet Recommendation (For users and nutritionists)
class DietRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = DietRecommendation
        fields = '__all__'


# Diet Feedback (from patients)
class DietFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = DietFeedback
        fields = ['id', 'recommendation', 'user', 'day', 'feedback', 'rating', 'created_at']
        read_only_fields = ['id', 'created_at', 'user']


# Diet Recommendation Feedback (from nutritionists for retraining)
class DietRecommendationFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = DietRecommendationFeedback
        fields = '__all__'

class DietRecommendationWithPatientSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()

    class Meta:
        model = DietRecommendation
        fields = [
            'id',
            'for_week_starting',
            'meals',
            'calories',
            'protein',
            'carbs',
            'fats',
            'status',  # 🔁 replaced 'approved_by_nutritionist'
            'nutritionist_comment',
            'reviewed_by',
            'created_at',
            'updated_at',
            'full_name',
            'email',
        ]

    def get_full_name(self, obj):
        return obj.user.full_name if obj.user else None

    def get_email(self, obj):
        return obj.user.email if obj.user else None

    def get_full_name(self, obj):
     return obj.user.full_name or obj.user.email

    def get_email(self, obj):
        return obj.user.email

# Patient Assignment Serializer (to map patients to nutritionists)
class PatientAssignmentSerializer(serializers.ModelSerializer):
    patient = serializers.StringRelatedField()

    class Meta:
        model = PatientAssignment
        fields = ['id', 'patient']


# User Serializer (used for brief user representation)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'role', 'date_joined']  # ✅ Add full_name here
        read_only_fields = ['email', 'role', 'date_joined']  # Prevents accidental changes to email/role/date


# Meal Log Serializer (used for nutritionist viewing logs)
class MealLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserMeal
        fields = '__all__'


# Diet Recommendation Patch Serializer (for nutritionists to update recommendations)
class DietRecommendationPatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = DietRecommendation
        fields = [
            'meals', 
            'calories', 
            'protein', 
            'carbs', 
            'fats', 
            'status',  # 🔁 replaced 'approved_by_nutritionist'
            'nutritionist_comment'
        ]
        extra_kwargs = {field: {'required': False} for field in fields}

#User Application FeedBack
class FeedbackSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Feedback
        fields = ['id', 'user_email', 'message', 'rating', 'created_at']

####Wate,Weight Cuustom REminder
class WeightLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeightLog
        fields = ['id', 'date', 'weight_kg', 'time_logged']
        read_only_fields = ['time_logged']



class WaterIntakeLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WaterIntakeLog
        fields = '__all__'
        read_only_fields = ('user', 'date')

class CustomReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomReminder
        fields = '__all__'
        read_only_fields = ['user', 'created_at']



#Forgot PassWord
class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

class ResetPasswordSerializer(serializers.Serializer):
    uidb64 = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8)

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'text', 'timestamp', 'is_read']
        read_only_fields = ['id', 'sender', 'timestamp', 'is_read']

class FoodItemSerializer2(serializers.ModelSerializer):
    class Meta:
        model = FoodItem
        fields = '__all__'