from django.urls import path

from api.views import history

urlpatterns = [
    path("history", history, name="history"),
]
