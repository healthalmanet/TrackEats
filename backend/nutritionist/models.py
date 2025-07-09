from django.db import models

from django.conf import settings
from django.utils import timezone





##############Nutritionist Recommendations
class NutritionistProfile(models.Model):
    EXPERTISE_CHOICES = [
        (1, 'Basic Nutritionist'),
        (2, 'Senior Nutritionist'),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='nutritionist_profile')
    expert_level = models.IntegerField(choices=EXPERTISE_CHOICES, default=1)

    def __str__(self):
        return f"{self.user.email} - {self.get_expert_level_display()}" # type: ignore
#Patient Nutritionist Assignment
class PatientAssignment(models.Model):
    nutritionist = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assigned_patients')  # user with nutritionist group
    patient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assigned_nutritionist')
    assigned_at = models.DateTimeField(auto_now_add=True)



