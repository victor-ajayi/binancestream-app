from __future__ import annotations

import json
import logging

from celery import shared_task
from pydantic import BaseModel, Field, field_validator

from api.models import Trade

logger = logging.getLogger(__name__)


class TradeSerializer(BaseModel):
    trade_id: int = Field(alias="t")
    time: int = Field(alias="E")
    symbol: str = Field(alias="s")
    price: float = Field(alias="p")
    quantity: str = Field(alias="q")
    is_buyer_maker: bool = Field(alias="m")

    @field_validator("price", mode="after")
    @classmethod
    def round(cls, value):
        return round(float(value), 2)


@shared_task
def save_data(trade: str):
    trade = json.loads(trade)

    trade = TradeSerializer(**trade).model_dump()
    Trade.objects.create(**trade)

    logger.info(trade)
