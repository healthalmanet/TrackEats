
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BlogDetailView,
    BlogListCreateView,
    FoodItemListView,
    MessageListView,
    SendMessageView,
    WeightLogViewSet,
    WaterIntakeLogViewSet,
    CustomReminderViewSet,
)

router = DefaultRouter()

router.register(r'weight', WeightLogViewSet, basename='weight-log')
router.register(r'water', WaterIntakeLogViewSet, basename='water-log')
router.register(r'reminders', CustomReminderViewSet, basename='reminder')

urlpatterns = [
    
    #Messaging 
    path('messages/', MessageListView.as_view(), name='message-list'),
    path('messages/send/', SendMessageView.as_view(), name='send-message'),

      #Blog APIs
    path('blogs/', BlogListCreateView.as_view(), name='blog-list-create'),
    path('blogs/<int:pk>/', BlogDetailView.as_view(), name='blog-detail'),

    path('foods/', FoodItemListView.as_view(), name='food-list'),


    path('', include(router.urls)), 

]
