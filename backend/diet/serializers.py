from rest_framework import serializers

from .models import DietRecommendation

class DietRecommendationSerializer(serializers.ModelSerializer):
    user_full_name = serializers.CharField(source='user.full_name', read_only=True)
    reviewer_full_name = serializers.CharField(source='reviewed_by.full_name', read_only=True)
    class Meta:
        model = DietRecommendation
        fields = [
            'id',
            'user',
            'user_full_name',
            'for_week_starting',
            'meals',
            'status',
            'nutritionist_comment',
            'reviewed_by',
            'reviewer_full_name',
            # 'user_profile_snapshot',
            # 'original_ai_plan',
            # 'approved_for_retraining',
            # 'nutritionist_retraining_notes',
            # 'was_used_for_retraining',
            'created_at',
            'updated_at',
        ]
