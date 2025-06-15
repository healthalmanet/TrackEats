from predict import recommend_meals

class UserProfile:
    goal = "Lose Weight"
    diet_type = "Vegetarian"
    health_conditions = ["diabetes"]

result = recommend_meals(UserProfile())
print(result)