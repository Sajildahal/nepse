"use client";

import { useEffect, useState } from "react";
import { MarketPrice } from "@/types";

const REFRESH_MS = 90_000;

export function useMarketPrices() {
  const [stocks, setStocks] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/market/stocks", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        setStocks(Array.isArray(data.stocks) ? data.stocks : []);
        setLastUpdated(data.timestamp ?? new Date().toISOString());
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return { stocks, loading, error, lastUpdated };
}