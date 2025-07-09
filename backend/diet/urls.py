from django.urls import path
from .views import DietPlanView


urlpatterns = [
    
  # User Profile API  
  path('diet/', DietPlanView.as_view(), name='generate-diet-plan'),

]
