from django.urls import path
from .consumers import (
    HostConnectionConsumer,
    ClientConnectionConsumer,
    ExplorerConnectionConsumer,
    AgentConnectionConsumer,
)

websocket_urlpatterns = [
    path("ws/shadownet/connect/host/", HostConnectionConsumer.as_asgi()),
    path("ws/shadownet/connect/client/", ClientConnectionConsumer.as_asgi()),
    path("ws/shadownet/connect/client/explorer/", ExplorerConnectionConsumer.as_asgi()),
    path("ws/shadownet/connect/client/agent/", AgentConnectionConsumer.as_asgi()),
]
