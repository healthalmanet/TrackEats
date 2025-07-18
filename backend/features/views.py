from rest_framework import viewsets, permissions, status, generics, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Sum
from django.utils import timezone
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, Case, When, IntegerField, Sum
from django.db.models.functions import Length
from rest_framework.generics import ListAPIView
from rest_framework.exceptions import PermissionDenied
from rest_framework.filters import SearchFilter
from rest_framework.permissions import BasePermission

from utils.gemini import fetch_nutrition_from_gemini
from .models import WeightLog, WaterIntakeLog, CustomReminder, Message, Blog
from .serializers import WeightLogSerializer, WaterIntakeLogSerializer, CustomReminderSerializer, MessageSerializer, FoodItemSerializer2, BlogSerializer
from django.conf import settings
from nutritionist.models import PatientAssignment
from userFood.models import FoodItem
from utils.pagination import StandardResultsSetPagination



class WeightLogViewSet(viewsets.ModelViewSet):
    serializer_class = WeightLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = WeightLog.objects.all()
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['date']
    ordering_fields = ['date', 'time_logged']
    ordering = ['-time_logged']

    def get_queryset(self):
        return WeightLog.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class WaterIntakeLogViewSet(viewsets.ModelViewSet):
    queryset = WaterIntakeLog.objects.all()
    serializer_class = WaterIntakeLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['date']  # Enable ?date=YYYY-MM-DD filter
    ordering_fields = ['date']
    ordering = ['-date']

    def perform_create(self, serializer):
        today = timezone.now().date()
        amount_ml = serializer.validated_data.get('amount_ml')

        obj, created = WaterIntakeLog.objects.get_or_create(
            user=self.request.user,
            date=today,
            defaults={'amount_ml': amount_ml}  # 🟢 FIX: Provide default to avoid NOT NULL error
        )

        if not created:
            obj.amount_ml += amount_ml
            obj.save()

        response_serializer = self.get_serializer(obj)
        raise serializers.ValidationError(response_serializer.data)  # Unusual pattern, but kept as-is by your code

    def create(self, request, *args, **kwargs):
        today = timezone.now().date()
        amount_ml = request.data.get('amount_ml')

        if amount_ml is None:
            return Response({'error': 'amount_ml is required'}, status=400)

        obj, created = WaterIntakeLog.objects.get_or_create(
            user=request.user,
            date=today,
            defaults={'amount_ml': amount_ml}  # 🟢 FIX: Provide default here to satisfy NOT NULL constraint
        )

        serializer = self.get_serializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        if not created:
            obj.amount_ml += serializer.validated_data['amount_ml']
            obj.save()

        return Response(self.get_serializer(obj).data, status=status.HTTP_201_CREATED)

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='total')
    def total_water_intake(self, request):
        date = request.query_params.get('date')
        if not date:
            return Response({"error": "date query param required"}, status=400)

        total = self.get_queryset().filter(date=date).aggregate(total_ml=Sum('amount_ml'))['total_ml'] or 0
        return Response({"date": date, "total_water_ml": total})

class CustomReminderViewSet(viewsets.ModelViewSet):
    queryset = CustomReminder.objects.all()
    serializer_class = CustomReminderSerializer
    permission_classes = [permissions.IsAuthenticated]

    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['frequency', 'is_active']
    ordering_fields = ['reminder_time', 'created_at']
    ordering = ['reminder_time']

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)



class CanSendMessage(BasePermission):
    """
    Custom permission:
    - Nutritionists → can send to assigned patients
    - Patients → can send to their assigned nutritionist
    """

    def has_permission(self, request, view):
        receiver_id = request.data.get('receiver')
        if not receiver_id:
            return False

        user = request.user

        # If user is a nutritionist, can only message assigned patients
        if getattr(user, 'role', None) == 'nutritionist':
            return PatientAssignment.objects.filter(nutritionist=user, patient_id=receiver_id).exists()

        # If user is a patient, can only message their assigned nutritionist
        if getattr(user, 'role', None) == 'user':
            return PatientAssignment.objects.filter(patient=user, nutritionist_id=receiver_id).exists()

        # Other roles (e.g., operator) → Denied
        return False

class SendMessageView(generics.CreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated, CanSendMessage]

    def perform_create(self, serializer):
        receiver_id = self.request.data.get('receiver')
        serializer.save(sender=self.request.user, receiver_id=receiver_id)

class MessageListView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(
            Q(sender=self.request.user) | Q(receiver=self.request.user)
        ).order_by('-timestamp')        





class FoodItemListView(ListAPIView):
    queryset = FoodItem.objects.all()
    serializer_class = FoodItemSerializer2
    filter_backends = [SearchFilter, DjangoFilterBackend]
    search_fields = ['name']

    def list(self, request, *args, **kwargs):
        search_term = request.query_params.get('search', None)
        if not search_term:
            return super().list(request, *args, **kwargs)

        cleaned_search_term = search_term.strip().lower()

        # --- TIER 1: Exact Match ---
        exact_queryset = FoodItem.objects.filter(name__iexact=cleaned_search_term)
        if exact_queryset.exists():
            print(f"✅ Exact Found: '{cleaned_search_term}'")
            return self.get_paginated_response_for_queryset(exact_queryset)

        # --- TIER 2: Substring Match (optional fallback) ---
        substring_queryset = FoodItem.objects.filter(name__icontains=cleaned_search_term)
        if substring_queryset.exists():
            print(f"✅ Substring Found: '{cleaned_search_term}'")
            return self.get_paginated_response_for_queryset(substring_queryset)

        # --- TIER 3: Gemini External API Fallback ---
        print(f"🔥 No DB match for '{cleaned_search_term}' -> Gemini fallback")
        try:
            nutrition_data = fetch_nutrition_from_gemini(search_term)

            if nutrition_data and nutrition_data.get('name'):
                food, created = FoodItem.objects.get_or_create(
                    name__iexact=nutrition_data.get('name'),
                    defaults=self._map_api_data_to_model_fields(nutrition_data)
                )
                if created:
                    print(f"✅ Gemini Success: '{food.name}' created in DB")
                new_item_queryset = FoodItem.objects.filter(pk=food.pk)
                return self.get_paginated_response_for_queryset(new_item_queryset)

            print("❌ Gemini returned no valid data")

        except Exception as e:
            print(f"❌ Gemini Exception: {e}")

        # --- TIER 4: Return Empty ---
        print(f"❌ No match found anywhere for '{cleaned_search_term}'")
        return self.get_paginated_response_for_queryset(FoodItem.objects.none())

    def get_paginated_response_for_queryset(self, queryset):
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def _map_api_data_to_model_fields(self, data: dict) -> dict:
        """Safe fallback handler for null/empty Gemini fields."""

        def safe_float(val):
            try:
                return float(val) if val is not None else 0.0
            except (ValueError, TypeError):
                return 0.0

        return {
            'name': data.get('name'),
            'default_quantity': safe_float(data.get('default_quantity')),
            'default_unit': data.get('default_unit') or "piece",
            'gram_equivalent': safe_float(data.get('gram_equivalent')),
            'calories': safe_float(data.get('calories')),
            'protein': safe_float(data.get('protein')),
            'carbs': safe_float(data.get('carbohydrates')),
            'fats': safe_float(data.get('fats')),
            'sugar': safe_float(data.get('sugar')),
            'fiber': safe_float(data.get('fiber')),
            'saturated_fat_g': safe_float(data.get('saturated_fat_g')),
            'trans_fat_g': safe_float(data.get('trans_fat_g')),
            'estimated_gi': safe_float(data.get('glycemic_index')),
            'glycemic_load': safe_float(data.get('glycemic_load')),
            'sodium_mg': safe_float(data.get('sodium_mg')),
            'potassium_mg': safe_float(data.get('potassium_mg')),
            'iron_mg': safe_float(data.get('iron_mg')),
            'calcium_mg': safe_float(data.get('calcium_mg')),
            'iodine_mcg': safe_float(data.get('iodine_mcg')),
            'zinc_mg': safe_float(data.get('zinc_mg')),
            'magnesium_mg': safe_float(data.get('magnesium_mg')),
            'selenium_mcg': safe_float(data.get('selenium_mcg')),
            'cholesterol_mg': safe_float(data.get('cholesterol_mg')),
            'omega_3_g': safe_float(data.get('omega_3_g')),
            'vitamin_d_mcg': safe_float(data.get('vitamin_d_mcg')),
            'vitamin_b12_mcg': safe_float(data.get('vitamin_b12_mcg')),
            'food_type': data.get('food_type') or "Unknown",
            'meal_type': data.get('meal_type') or [],
            'fodmap_level': data.get('fodmap_level') or "unknown",
            'spice_level': data.get('spice_level') or "medium",
            'purine_level': data.get('purine_level') or "medium",
            'allergens': "/".join(data.get('allergens') or []),
        }



class BlogListCreateView(generics.ListCreateAPIView):
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    queryset = Blog.objects.all().order_by('-created_at')
    serializer_class = BlogSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination

class BlogDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Blog.objects.all()
    serializer_class = BlogSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_update(self, serializer):
        if self.request.user != self.get_object().author:
            raise PermissionDenied("You can only edit your own blogs.")
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user != instance.author:
            raise PermissionDenied("You can only delete your own blogs.")
        instance.delete()
