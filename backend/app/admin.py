from django.contrib import admin
from django import forms
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from .models import (
    User, UserProfile, DiabeticProfile, UserMeal,
    FoodItem, Feedback, PatientReminder,
    NutritionistProfile, DietRecommendation,
    PatientAssignment, AppReport, DietRecommendationFeedback, DietFeedback,
)

# ------------------------------
# Custom User Creation Form (for Admin 'Add User' Page)
# ------------------------------
class CustomUserCreationForm(forms.ModelForm):
    password1 = forms.CharField(label='Password', widget=forms.PasswordInput)
    password2 = forms.CharField(label='Confirm Password', widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ("email", "full_name", "role")

    def clean_password2(self):
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords don't match")
        return password2

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user

# ------------------------------
# Custom User Change Form (for editing users in Admin)
# ------------------------------
class CustomUserChangeForm(forms.ModelForm):
    password = ReadOnlyPasswordHashField()

    class Meta:
        model = User
        fields = ("email", "full_name", "role", "is_active", "is_admin")

# ------------------------------
# Custom User Admin Configuration
# ------------------------------
class CustomUserAdmin(BaseUserAdmin):
    form = CustomUserChangeForm
    add_form = CustomUserCreationForm

    list_display = ("email", "full_name", "role", "is_active", "is_admin")
    list_filter = ("role", "is_admin")

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("full_name",)}),
        ("Permissions", {"fields": ("role", "is_active", "is_admin")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "full_name", "role", "password1", "password2"),
        }),
    )

    search_fields = ("email", "full_name")
    ordering = ("email",)
    filter_horizontal = ()

# ------------------------------
# Register Models with Admin
# ------------------------------
admin.site.register(User, CustomUserAdmin)
admin.site.register(UserProfile)
admin.site.register(DiabeticProfile)
admin.site.register(UserMeal)
admin.site.register(FoodItem)
admin.site.register(Feedback)
admin.site.register(PatientReminder)
admin.site.register(NutritionistProfile)
admin.site.register(DietRecommendation)
admin.site.register(PatientAssignment)
admin.site.register(AppReport)
admin.site.register(DietRecommendationFeedback)
admin.site.register(DietFeedback)
