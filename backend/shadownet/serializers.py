from rest_framework import serializers
from .models import Host, TerminalData, KeyloggerData


class HostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Host
        fields = '__all__'


class TerminalDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = TerminalData
        fields = '__all__'



class KeyloggerDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = KeyloggerData
        fields = '__all__'

