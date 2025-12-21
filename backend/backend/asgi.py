"""
ASGI config for backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from shadownet import consumers
from channels.auth import AuthMiddlewareStack
from django.urls import path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

websocket_urlpatterns = [
    path('ws/shadownet/connect/host/', consumers.HostConnectionConsumer.as_asgi()),
    path('ws/shadownet/connect/client/', consumers.ClientConnectionConsumer.as_asgi()),
    path('ws/shadownet/connect/client/explorer/', consumers.ExplorerConnectionConsumer.as_asgi()),
    path('ws/shadownet/connect/client/agent/', consumers.AgentConnectionConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})
