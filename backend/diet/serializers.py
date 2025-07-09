from rest_framework import serializers

from nutritionist.models import DietRecommendation

class DietRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = DietRecommendation
        fields = '__all__'
