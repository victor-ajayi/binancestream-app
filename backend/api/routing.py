from django.urls import path

from api import consumers

websocket_urlpatterns = [
    path(r"ws/socket/<symbol>", consumers.Consumer.as_asgi()),
    path(r"ws/client/<symbol>", consumers.ClientConsumer.as_asgi()),
]
