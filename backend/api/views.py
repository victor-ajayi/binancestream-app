from django.forms.models import model_to_dict
from django.http import JsonResponse

from api.models import Trade


def history(request):
    trades = Trade.objects.all()
    trades = [model_to_dict(trade) for trade in trades]

    return JsonResponse(trades, safe=False)
