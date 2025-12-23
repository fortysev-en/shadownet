from rest_framework import serializers
from .models import Account


class AccountSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Account
        fields = ('id', 'is_superuser', 'email', 'first_name', 'last_name', 'is_active', 'is_admin', 'date_joined', 'last_login')
        # fields = '__all__'
