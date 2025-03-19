## Django-приложение с WebSocket-интеграцией к публичному API Binance.

Требования к API:
1. Подключиться к WebSocket API Binance (Tickers Stream).
2. Получать обновления цен по выбранным криптовалютным парам (например, BTC/USDT, ETH/USDT).
3. Сохранять обновленные данные в PostgreSQL.
4. Предоставить REST API для просмотра истории изменений.
5. Реализовать WebSocket-сервер в Django (Django Channels),
- который рассылает обновления клиентам в реальном времени.
6. Unit-тесты.

Документация Binance WebSocket API Binance предоставляет WebSocket-соединение для стриминга цен криптовалют. URL: `wss://stream.binance.com:9443/ws/btcusdt@trade`


Как это работает?
 1. Django устанавливает WebSocket-соединение с Binance.
 2. Получает обновления цен в реальном времени.
 3. Сохраняет их в PostgreSQL (например, каждую минуту).
 4. Django создает WebSocket-сервер (Django Channels).
 5. Клиенты могут подключаться по WS и получать обновления в реальном времени.
 6. Также можно запросить историю через REST API.