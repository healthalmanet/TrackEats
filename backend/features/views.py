from rest_framework import viewsets, permissions, status, generics, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Sum
from django.utils import timezone
from rest_framework.pagination import PageNumberPagination
from rest_framework.generics import ListAPIView
from rest_framework.exceptions import PermissionDenied
from rest_framework.filters import SearchFilter
from rest_framework.permissions import BasePermission
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
    search_fields = ['name']  # ✅ Allows ?search=Apple
    pagination_class = StandardResultsSetPagination



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
