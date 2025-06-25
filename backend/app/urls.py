from django.urls import path
from rest_framework.routers import DefaultRouter
from django.urls import include
from .views import (
    FoodItemListView, RegisterView, UserProfileDetailView, UserProfileCreateView,home,
    DiabeticProfileCreateView,DiabeticProfileDetailView,DiabeticProfileListView,
    UserMealViewSet,
    OwnerDashboardView,
    recommend_calories, DailyCalorieSummaryView,
    ReminderListCreateView,
    SendReminderView,
    UserContactListView,
    OperatorReportView,
    dietPlant15Day,
    DailyDietRecommendationView,
    RegenerateDailyDietRecommendationView,
    submit_diet_feedback,
    get_feedback_for_recommendation,
    MyTokenObtainPairView,
    
    AssignPatientAPIView,
    AssignedPatientsView,NutritionistDietRecommendationsView, NutritionistPatientDietRecommendationsView,
    PatientProfileDetailView,
    PatientMealLogView,
    ApproveOrRejectDietView,
    NutritionistFeedbackOnDiet, UserListForNutritionistView,
    EditDietPlanView,
    FeedbackCreateView,
    WaterIntakeLogViewSet,WeightLogViewSet,CustomReminderViewSet, ForgotPasswordView,
    ResetPasswordView, GoogleLogin, FacebookLogin,
    SendMessageView,MessageListView
    
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,   # View to obtain JWT access and refresh tokens (login)
    TokenRefreshView,     # View to refresh access token using refresh token
    TokenBlacklistView,   # View to blacklist a refresh token (logout)
)

router = DefaultRouter()

#LogMeals API endpoint
router.register(r'logmeals', UserMealViewSet, basename='user-meals')

router.register(r'weight', WeightLogViewSet, basename='weight-log')
router.register(r'water', WaterIntakeLogViewSet, basename='water-log')
router.register(r'reminders', CustomReminderViewSet, basename='reminder')

urlpatterns = [

    path('', include(router.urls)), 

    path('home',home, name='home'),  # Home page view
    # User registration endpoint (signup)
    path('signup/', RegisterView.as_view(), name='signup'),

    # JWT login endpoint - returns access and refresh tokens after user credentials verified
    path('login/', MyTokenObtainPairView.as_view(), name='login'),

    path('accounts/', include('allauth.socialaccount.urls')),
    path('google/', GoogleLogin.as_view(), name='google_login'),
    path('facebook/', FacebookLogin.as_view(), name='facebook_login'),

    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),

    # Refresh JWT access token endpoint using a valid refresh token
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Logout endpoint to blacklist the refresh token, effectively logging out user
    path('logout/', TokenBlacklistView.as_view(), name='logout'),

    # Retrieve, update, or delete the logged-in user's profile details
    path('profile/', UserProfileDetailView.as_view(), name='user-profile'),

    # Create user profile endpoint (for logged-in users)
    path('profile/create/', UserProfileCreateView.as_view(), name='create-user-profile'),

     # Create diabetic profile
    path('diabetic-reports/', DiabeticProfileListView.as_view(), name='diabetic-reports-list'),
    path('diabetic-reports/create/', DiabeticProfileCreateView.as_view(), name='diabetic-reports-create'),
    path('diabetic-reports/<int:pk>/', DiabeticProfileDetailView.as_view(), name='diabetic-reports-detail'),


    # #Calorie recommendation endpoint also fat,protein,carbs
    path('recommend-calories/', recommend_calories, name='recommend_calories'),
    ######calorie tracking ######## also fat,protein,carbs
    path('daily-calorie-summary/', DailyCalorieSummaryView.as_view(), name='daily_calorie_summary'),

 



    ####################### ACTORS IN SYSTEM #######################
    path('owner/', OwnerDashboardView.as_view(), name='owner-dashboard'),


    ########################Operator APIs########################
    # Operator - Create or List patient reminders
    path("operator/reminders/", ReminderListCreateView.as_view(), name="reminder-list-create"),
    
    # Operator - Manually send reminder email to a patient
    path("operator/reminders/send/<int:pk>/", SendReminderView.as_view(), name="send-reminder"),        
    
    # Operator - View all users' contact details
    path("operator/users/contacts/", UserContactListView.as_view(), name="user-contacts"),
    
    # Operator - Generate basic user and reminder reports
    path("operator/reports/", OperatorReportView.as_view(), name="operator-report"),
    ##################################################################################################


    #User Diet Recommendations
    path('diet/week/', dietPlant15Day.as_view(), name='dietPlant15Day'),
    path('diet/daily/', DailyDietRecommendationView.as_view(), name='daily-diet'),
    path('diet/daily/regenerate/', RegenerateDailyDietRecommendationView.as_view(), name='regenerate-daily-diet'),

    path('diet/feedback/', submit_diet_feedback, name='submit_diet_feedback'),
    path('diet/feedback/<int:recommendation_id>/', get_feedback_for_recommendation, name='get_feedback_for_recommendation'),

   
    ###########Nutritionist APIs########################

    path('nutritionist/users/', UserListForNutritionistView.as_view(), name='nutritionist-user-list'),

    # POST - Assign a patient to nutritionist
    path('nutritionist/assign-patient/', AssignPatientAPIView.as_view()),

    #  GET - Get all patients assigned to the logged-in nutritionist
    path('nutritionist/patients/', AssignedPatientsView.as_view()),

    # GET - Detailed profile of a specific patient
    path('nutritionist/patient/<int:patient_id>/profile/', PatientProfileDetailView.as_view()),

    # GET - Meal logs for a specific patient
    path('nutritionist/patient/<int:patient_id>/meals/', PatientMealLogView.as_view()),

    #  POST - Approve or Reject a specific diet plan
    path('nutritionist/diet/<int:recommendation_id>/review/', ApproveOrRejectDietView.as_view()),

    # POST - Submit feedback for retraining (nutritionist)
    path('nutritionist/diet/<int:recommendation_id>/feedback/', NutritionistFeedbackOnDiet.as_view()),

    #  PUT - Edit/update a specific diet plan (nutritionist)
    path('nutritionist/diet/<int:pk>/edit/', EditDietPlanView.as_view()),

    #DIET RECOMMNEDATION FOR NUTRIONIST 
    path('nutritionist/diet/recommendations/', NutritionistDietRecommendationsView.as_view()),

    #Nutritionist Diet Recommendation view
    path('nutritionist/diet/<int:patient_id>/', NutritionistPatientDietRecommendationsView.as_view()),


    # # # ⭐ User Feedback on Application (POST)
    path('feedback/create/', FeedbackCreateView.as_view(), name='feedback-create'),


    #Messaging 
    path('messages/', MessageListView.as_view(), name='message-list'),
    path('messages/send/', SendMessageView.as_view(), name='send-message'),


    #Nutrion Search 
    path('foods/', FoodItemListView.as_view(), name='food-list'),
]



        

    

