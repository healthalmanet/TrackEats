
from django.urls import path, include
from userFood.views import DailyCalorieSummaryView, DailyUserMealSummaryView, UserMealViewSet, recommend_calories
from rest_framework.routers import DefaultRouter

router = DefaultRouter()




router.register(r'logmeals', UserMealViewSet, basename='user-meals')

urlpatterns = [
       # #Calorie recommendation endpoint also fat,protein,carbs
    path('recommend-calories/', recommend_calories, name='recommend_calories'),
    ######calorie tracking ######## also fat,protein,carbs
    path('daily-calorie-summary/', DailyCalorieSummaryView.as_view(), name='daily_calorie_summary'),
    
    #7day track
    path('nutrition7day/', DailyUserMealSummaryView.as_view()),


    path('', include(router.urls)), 


]
