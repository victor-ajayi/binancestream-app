import asyncio
import json
import logging
import time

import redis
from channels.generic.websocket import AsyncWebsocketConsumer
from decouple import config

from api.tasks import save_data

redis_client = redis.asyncio.Redis.from_url(config("REDIS_URL"))

logger = logging.getLogger(__name__)


class Consumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.symbol = self.scope["url_route"]["kwargs"]["symbol"].upper()

        logger.info(f"Sending Redis signal: {self.symbol}")
        await redis_client.publish("CONNECT", self.symbol)
        await redis_client.incr(self.symbol)

        await self.channel_layer.group_add(self.symbol, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.symbol, self.channel_name)

        count = await redis_client.decr(self.symbol)

        if not count:
            await redis_client.publish("DISCONNECT", self.symbol)

    async def send_message(self, event):
        await self.send(text_data=json.dumps({"message": event["message"]}))


class ClientConsumer(AsyncWebsocketConsumer):
    last_save = time.time()

    async def connect(self):
        self.symbol = self.scope["url_route"]["kwargs"]["symbol"].upper()
        await self.accept()

    async def receive(self, text_data):
        data = json.loads(text_data)
        symbol = data.get("symbol")
        message = data.get("data")

        await self.channel_layer.group_send(
            symbol, {"type": "send_message", "message": message}
        )

        try:
            asyncio.create_task(self.save_with_celery(message))
        except Exception as e:
            logger.error(f"Celery task failed: {e}")

    async def save_with_celery(self, message):
        SAVE_TO_DB_INTERVAL = config("SAVE_TO_DB_INTERVAL", cast=int, default=15)
        current_time = time.time()

        if current_time - self.last_save >= SAVE_TO_DB_INTERVAL:
            save_data.delay(message)
            self.last_save = current_time
