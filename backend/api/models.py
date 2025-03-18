from django.db import models


class Trade(models.Model):
    trade_id = models.CharField(max_length=128, null=True)
    time = models.CharField(max_length=128, null=True)
    symbol = models.CharField(max_length=50, null=True)
    price = models.DecimalField(max_digits=50, decimal_places=2, null=True)
    quantity = models.CharField(max_length=128, null=True)
    is_buyer_maker = models.BooleanField(null=True)
