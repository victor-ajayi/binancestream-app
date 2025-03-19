## Django Application with WebSocket Integration to the Public Binance API

### API Requirements 

- Connect to the Binance WebSocket API (Tickers Stream).
- Receive price updates for selected cryptocurrency pairs (e.g., BTC/USDT, ETH/USDT).
- Save the updated data to PostgreSQL.
- Provide a REST API for viewing the history of changes.
- Implement a WebSocket server in Django (using Django Channels) that broadcasts updates to clients in real time.
- Include unit tests.

Binance provides a WebSocket connection for streaming cryptocurrency prices.  
URL: `wss://stream.binance.com:9443/ws/btcusdt@trade`

### How It Works

- Django establishes a WebSocket connection to Binance.
- Receives real-time price updates.
- Saves them to PostgreSQL (e.g., every minute).
- Django creates a WebSocket server (using Django Channels).
- Clients can connect via WS and receive updates in real time.
- History can also be requested via the REST API.
