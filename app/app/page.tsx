"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  connectWebSocket,
  disconnectWebSocket,
  isSocketConnected,
} from "./socket";
import { Trade, TradesList } from "./trades";

export default function Home() {
  const [symbol, setSymbol] = useState("btcusdt");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastPrice, setLastPrice] = useState("");
  const [previousPrice, setPreviousPrice] = useState("");

  const handleConnect = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!symbol) {
      return;
    }

    if (isConnected) {
      disconnectWebSocket();
      setIsConnected(false);
      return;
    }

    // TODO: Fix disconnection issues

    setError(null);
    setIsLoading(true);

    try {
      await connectWebSocket(symbol.toLowerCase(), (trade, error) => {
        if (error) {
          setError(`Error processing trade data: ${error.message}`);
          return;
        }

        setTrades((prevTrades) => {
          const newTrades = [trade, ...prevTrades].slice(0, 20);
          return newTrades;
        });

        setPreviousPrice(lastPrice);
        setLastPrice(trade.price);
      });

      setIsConnected(true);
    } catch (err) {
      console.error("Connection error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to connect to Binance WebSocket"
      );
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check connection status periodically
    const checkConnection = setInterval(() => {
      if (isConnected && !isSocketConnected()) {
        setError("WebSocket connection lost");
        setIsConnected(false);
        setIsLoading(false);
      }
    }, 5000);

    return () => {
      clearInterval(checkConnection);
      if (isConnected) {
        disconnectWebSocket();
      }
    };
  }, [isConnected]);

  return (
    <main className="flex flex-col mt-3 mx-auto max-w-[900px] px-3 md-custom:px-10 min-h-[95vh] p-8 pb-20 gap-2 sm:p-20 items-center">
      <div className="border border-gray-200 rounded-2xl px-6 py-3 w-full mb-5">
        <Link href={"/"} className="font-semibold text-lg cursor-pointer">
          Cleancar Task
        </Link>
      </div>
      <p className="text-center mb-10">
        Получить обновления цен по выбранным криптовалютным парам
      </p>
      <form className="*:not-first:mt-2 w-[500px]" onSubmit={handleConnect}>
        <div className="flex items-center relative">
          <Input
            className="-me-px flex-1 rounded-e-none shadow-none focus-visible:z-10 w-full"
            placeholder="Введите валютную пару"
            value={symbol.toUpperCase()}
            disabled={isConnected}
            onChange={(e) => {
              setTrades([]);
              setSymbol(e.target.value);
            }}
          />
          <Button
            className="border-neutral-200 bg-white text-neutral-950 hover:bg-neutral-100 hover:text-neutral-950 focus-visible:border-neutral-950 focus-visible:ring-neutral-950/50 inline-flex items-center rounded-e-md rounded-s-none border px-6 cursor-pointer disabled:cursor-not-allowed"
            variant={isConnected ? "destructive" : "default"}
            disabled={isLoading || !symbol}
            type="submit"
          >
            {isConnected ? "Прервать" : "Получать"}
          </Button>
        </div>
      </form>
      {trades?.length > 0 && symbol ? (
        <TradesList
          trades={trades}
          symbol={symbol}
          previousPrice={previousPrice}
          lastPrice={lastPrice}
        />
      ) : (
        ""
      )}
    </main>
  );
}
