"use client";

import { useEffect, useState } from "react";
import { MarketIndex, MarketPrice } from "@/types";

const REFRESH_MS = 90_000;

interface MarketOverviewResponse {
  indices?: MarketIndex[];
  topGainers?: MarketPrice[];
  highestTurnover?: MarketPrice[];
  timestamp?: string;
}

export function useMarketOverview() {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [topGainers, setTopGainers] = useState<MarketPrice[]>([]);
  const [topTurnover, setTopTurnover] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/market/overview", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as MarketOverviewResponse;
        if (cancelled) return;
        setIndices(Array.isArray(data.indices) ? data.indices : []);
        setTopGainers(Array.isArray(data.topGainers) ? data.topGainers : []);
        setTopTurnover(Array.isArray(data.highestTurnover) ? data.highestTurnover : []);
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

  return { indices, topGainers, topTurnover, loading, error, lastUpdated };
}