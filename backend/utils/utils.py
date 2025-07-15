import os
import json
import google.generativeai as genai
from functools import wraps
from django.http import HttpResponseForbidden
from h11 import Response


UNIT_TO_GRAMS = {
    "g": 1, "kg": 1000,
    "ml": 1, "l": 1000,
    "cup": 240, "bowl": 400,
    "piece": 100, "tbsp": 15,
    "tsp": 5, "slice": 30,
    "other": 100
}

def role_required(allowed_roles):
    def decorator(view_func):
        def _wrapped_view(self, *args, **kwargs):
            user = self.request.user
            if not user.is_authenticated:
                return Response({"detail": "Authentication required."}, status=401)
            if user.role not in allowed_roles:
                return Response({"detail": "Permission denied."}, status=403)
            return view_func(self, *args, **kwargs)
        return _wrapped_view
    return decorator




