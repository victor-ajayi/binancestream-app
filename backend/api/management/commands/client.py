import asyncio
import json

import redis
import websockets
from cleancar.settings import logging
from decouple import config
from django.core.management.base import BaseCommand

DJANGO_BASE_URL = config("DJANGO_BASE_URL")
BINANCE_BASE_URL = config("BINANCE_BASE_URL")
REDIS_URL = config("REDIS_URL")

redis_client = redis.asyncio.Redis.from_url(REDIS_URL)


class Command(BaseCommand):
    help = "Run Websocket client"

    async def close_connection(self, symbol, binance_socket):
        """Close binance connection when a disconnect signal is published."""

        pubsub = redis_client.pubsub()
        await pubsub.subscribe("DISCONNECT")

        async for message in pubsub.listen():
            if message["type"] == "message":
                logging.info(f"Closing connection to {symbol}.")
                await binance_socket.close()
                return

    async def get_symbol(self, queue):
        pubsub = redis_client.pubsub()
        await pubsub.subscribe("CONNECT")

        logging.info("Waiting for symbol from Django...")

        async for message in pubsub.listen():
            if message["type"] == "message":
                symbol = message["data"].decode("utf-8")
                logging.info(f"Received symbol: {symbol}")
                await queue.put(symbol)

    async def stream_data(self, symbol):
        """Stream data from binance websocket to Django channels."""

        BINANCE_URL = f"{BINANCE_BASE_URL}/{symbol.lower()}@trade"
        DJANGO_URL = f"{DJANGO_BASE_URL}/{symbol.lower()}"

        binance_socket = None
        django_socket = None
        disconnect_task = None

        try:
            binance_socket = await websockets.connect(BINANCE_URL)
            logging.info(f"Connected to {symbol}")

            disconnect_task = asyncio.create_task(
                self.close_connection(symbol, binance_socket)
            )

            async with websockets.connect(DJANGO_URL) as django_socket:
                logging.info("Connected to Django Channels")

                while True:
                    message = await binance_socket.recv()
                    await django_socket.send(
                        json.dumps({"symbol": symbol, "data": message})
                    )

        except websockets.exceptions.ConnectionClosed as e:
            logging.warning(f"WebSocket disconnected: {e.code} - {e.reason}")

        except Exception as e:
            logging.error(f"Unexpected error: {e}")

        finally:
            if disconnect_task:
                disconnect_task.cancel()

            if binance_socket:
                logging.info(f"Closing Binance WebSocket connection for {symbol}")
                await binance_socket.close()

            if django_socket:
                await django_socket.close()

    def handle(self, *args, **options):
        logging.info("Client running. Listening for requests.")

        async def run():
            queue = asyncio.Queue()
            asyncio.create_task(self.get_symbol(queue))

            while True:
                symbol = await queue.get()
                asyncio.create_task(self.stream_data(symbol))

        asyncio.run(run())
