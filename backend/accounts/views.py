from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from datetime import datetime
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Account
from rest_framework.response import Response
from .serializers import AccountSerializer
from django.contrib.auth.hashers import make_password
from django.db.models import Q
from rest_framework_simplejwt.exceptions import InvalidToken
import requests
import os
from django.conf import settings



class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # update last login
        self.user.last_login = datetime.now()
        self.user.save(update_fields=["last_login"])
        return data


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):

        response = super().post(request, *args, **kwargs)

        if response.status_code == 200 and "access" in response.data:
            access = response.data.get("access")
            refresh = response.data.get("refresh")

            res = Response(
                {
                    "access": access,
                    "refresh": refresh,
                },
                status=status.HTTP_200_OK,
            )

            return res

        return response



class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        try:
            return super().post(request, *args, **kwargs)
        except InvalidToken:
            response = Response({"detail": "Invalid refresh token"}, status=401)
            # clear invalid cookie
            response.delete_cookie("refresh_token")
            return response




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def auth_user(request):
    try:
        user = request.user
        serializer = AccountSerializer(user, many=False)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)




@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_password(request):
    user = request.user
    data = request.data

    try:
        oldPassword = user.check_password(data['oldPassword'])
        if oldPassword:
            user.password = make_password(data['confirmPassword'])
            user.save()
            return Response(status=status.HTTP_200_OK)
        else:
            return Response("Old password does not match!", status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)
