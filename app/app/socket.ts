import { Trade } from "./trades";

let websocket: WebSocket | null = null;

interface TradeIn {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  t: number; // Trade ID
  p: string; // Price
  q: string; // Quantity
  T: number; // Trade time
  m: boolean; // Is the buyer the market maker?
  M: boolean; // Ignore
}

export function connectWebSocket(
  symbol: string,
  onTradeCallback: (trade: Trade, error?: any) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (websocket) {
      websocket.close();
    }

    const connectionTimeout = setTimeout(() => {
      if (websocket) {
        websocket.close();
        websocket = null;
      }
      reject(
        new Error("Connection timeout: Failed to connect to Binance WebSocket")
      );
    }, 10000);

    try {
      websocket = new WebSocket(`ws://localhost:8000/ws/socket/${symbol}`);

      websocket.onopen = () => {
        console.log("Connected to Binance WebSocket");
        clearTimeout(connectionTimeout);
        resolve();

        // Send periodic pings to keep the connection alive
        const pingInterval = setInterval(() => {
          if (websocket && websocket.readyState === WebSocket.OPEN) {
            websocket.send(new Uint8Array([0x9])); // WebSocket-level ping
          }
        }, 15000);
      };

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log(data);
        if (data.type === "pong") {
          console.log("Pong received from server");
          return;
        }

        const tradeData = JSON.parse(data.message);

        try {
          const processedTrade: Trade = {
            id: tradeData.t,
            price: tradeData.p,
            quantity: tradeData.q,
            time: tradeData.E,
            isBuyerMaker: tradeData.m,
          };
          onTradeCallback(processedTrade);
        } catch (error) {
          console.error("Error processing trade data:", error);
          onTradeCallback(null as any, error);
        }
      };

      websocket.onerror = (error) => {
        console.error("Failed to connect to server", error);
        clearTimeout(connectionTimeout);
      };

      websocket.onclose = (event) => {
        console.log(
          "Disconnected from Binance WebSocket",
          event.code,
          event.reason
        );
        if (!event.wasClean) {
          reject(
            new Error(
              `Connection closed unexpectedly: ${event.code} ${event.reason}`
            )
          );
        }
      };
    } catch (error) {
      clearTimeout(connectionTimeout);
      reject(error);
    }
  });
}

export function disconnectWebSocket() {
  if (websocket) {
    websocket.close();
    websocket = null;
  }
}

export function isSocketConnected(): boolean {
  return websocket !== null && websocket.readyState === WebSocket.OPEN;
}
