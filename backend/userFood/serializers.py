from rest_framework import serializers
from .models import UserMeal,FoodItem

class UserMealSerializer(serializers.ModelSerializer):
    food_item_id = serializers.PrimaryKeyRelatedField(
        source="food_item", queryset=FoodItem.objects.all(), required=False
    )
    food_name = serializers.CharField(required=False)
    quantity = serializers.FloatField()
    unit = serializers.CharField()
    gram_equivalent = serializers.FloatField(source="food_item.gram_equivalent", read_only=True)
    meal_type = serializers.ChoiceField(choices=UserMeal.MEAL_CHOICES)
    remarks = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = UserMeal
        fields = [
            "id",
            "user",               # optional if you're setting `user=request.user` in the view
            "food_item_id",
            "food_name",
            "quantity",
            "unit",
            "meal_type",
            "remarks",
            "consumed_at",
            "date",

            # read-only nutrition snapshot
            "calories",
            "protein",
            "carbs",
            "fats",
            "sugar",
            "fiber",
            "estimated_gi",
            "glycemic_load",
            "food_type",
             "gram_equivalent",  # ✅ Added here
        ]
        read_only_fields = [
            "id", "user", "calories", "protein", "carbs", "fats", "sugar",
            "fiber", "estimated_gi", "glycemic_load", "food_type",
            "consumed_at", "date","gram_equivalent"
        ]