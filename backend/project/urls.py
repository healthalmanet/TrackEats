from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.views import TokenBlacklistView

urlpatterns = [
    path('admin/', admin.site.urls),


    path('api/', include('user.urls')),
    path('api/', include('userProfile.urls')),
    path('api/', include('userFood.urls')),
    path('api/', include('owner.urls')),
    path('api/', include('nutritionist.urls')),
    path('api/', include('features.urls')),
    path('api/', include('diet.urls')),


    path('api/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/logout/', TokenBlacklistView.as_view(), name='logout'),

]
