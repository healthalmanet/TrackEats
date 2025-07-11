
from rest_framework import serializers
from .models import WeightLog, WaterIntakeLog, CustomReminder, Message, Blog
from userFood.models import FoodItem

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

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'text', 'timestamp', 'is_read']
        read_only_fields = ['id', 'sender', 'timestamp', 'is_read']

class FoodItemSerializer2(serializers.ModelSerializer):
    class Meta:
        model = FoodItem
        fields = '__all__'

class BlogSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.full_name', read_only=True)

    class Meta:
        model = Blog
        fields = [
            'id', 'author', 'author_name',
            'title', 'content',
            'image', 'image_url',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']

    def validate(self, data):
        image = data.get('image')
        image_url = data.get('image_url')

        if not image and not image_url:
            raise serializers.ValidationError("You must provide either an image file or an image URL.")
        
        return data
    