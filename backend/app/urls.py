from django.urls import path
from rest_framework.routers import DefaultRouter
from django.urls import include
from .views import (
    RegisterView, UserProfileDetailView, UserProfileCreateView,home,
    DiabeticProfileCreateView,DiabeticProfileDetailView,DiabeticProfileListView,
    UserMealViewSet,
    OwnerDashboardView,
    recommend_calories, DailyCalorieSummaryView,
    ReminderListCreateView,
    SendReminderView,
    UserContactListView,
    OperatorReportView,
    WeeklyDietRecommendationView,
    DailyDietRecommendationView,
    RegenerateDailyDietRecommendationView,
    submit_diet_feedback,
    get_feedback_for_recommendation,
    MyTokenObtainPairView,
    
    AssignPatientAPIView,
    AssignedPatientsView,
    PatientProfileDetailView,
    PatientMealLogView,
    ApproveOrRejectDietView,
    NutritionistFeedbackOnDiet,
    EditDietPlanView,
    
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,   # View to obtain JWT access and refresh tokens (login)
    TokenRefreshView,     # View to refresh access token using refresh token
    TokenBlacklistView,   # View to blacklist a refresh token (logout)
)

router = DefaultRouter()

#LogMeals API endpoint
router.register(r'logmeals', UserMealViewSet, basename='user-meals')

urlpatterns = [

    path('', include(router.urls)), 

    path('home',home, name='home'),  # Home page view
    # User registration endpoint (signup)
    path('signup/', RegisterView.as_view(), name='signup'),

    # JWT login endpoint - returns access and refresh tokens after user credentials verified
    path('login/', MyTokenObtainPairView.as_view(), name='login'),

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

    ###########Nutritionist APIs########################

    #User Diet Recommendations
    path('diet/week/', WeeklyDietRecommendationView.as_view(), name='weekly-diet'),
    path('diet/daily/', DailyDietRecommendationView.as_view(), name='daily-diet'),
    path('diet/daily/regenerate/', RegenerateDailyDietRecommendationView.as_view(), name='regenerate-daily-diet'),

    path('diet/feedback/', submit_diet_feedback, name='submit_diet_feedback'),
    path('diet/feedback/<int:recommendation_id>/', get_feedback_for_recommendation, name='get_feedback_for_recommendation'),


    # # ✅ Nutritionist Approve (POST)
    # path('approve/<int:recommendation_id>/', ApproveDietRecommendationAPIView.as_view(), name='approve-diet'),

    # # ⭐ User Feedback on Diet (POST)
    # path('feedback/<int:recommendation_id>/', SubmitDietFeedbackAPIView.as_view(), name='diet-feedback'),


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
    path('nutritionist/diet/<int:recommendation_id>/edit/', EditDietPlanView.as_view()),

]



        

    

