from django.urls import path

from diet import views

from .views import (
    
AllAssignedDietPlansListView,
ApproveOrRejectDietView,
AssignPatientAPIView,
AssignedPatientsView,
EditDietPlanView,
GeneratePlanForPatientView,
NutritionistCreatePatientView,
NutritionistPatientDietRecommendationsView,
PatientMealLogView,
PatientProfileDetailView,
UpdateRetrainingFlagsView,
UserListForNutritionistView, 
)



urlpatterns = [

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
    path('nutritionist/diet/<int:recommendation_id>/feedback/', UpdateRetrainingFlagsView.as_view()),

    #  PUT - Edit/update a specific diet plan (nutritionist)
    path('nutritionist/diet/<int:recommendation_id>/edit/', EditDietPlanView.as_view()),


    #Nutritionist Diet Recommendation view
    path('nutritionist/diet/<int:patient_id>/', NutritionistPatientDietRecommendationsView.as_view()),

    path('nutritionist/all-diet-plans/', AllAssignedDietPlansListView.as_view(), name='nutritionist-all-diet-plans'),


    #TO create a new patient profile by nutritionist
    path("nutritionist/create-patient/", NutritionistCreatePatientView.as_view(), name="nutritionist-create-patient"),

    #GENERATE PLAN
    path('patients/<int:patient_id>/generate-plan/', GeneratePlanForPatientView.as_view(), name='nutritionist-generate-patient-plan'),
    
  
]



        

    

