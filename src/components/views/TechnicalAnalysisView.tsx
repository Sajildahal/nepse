"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Activity,
  Layers,
  ChevronRight,
  Maximize2,
  Calendar,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
} from "recharts";
import { INITIAL_MARKET_PRICES, generateHistoricalCandles } from "@/lib/market/nepseData";
import {
  calculateBollingerBands,
  calculateEMA,
  calculateMACD,
  calculateRSI,
  calculateSMA,
  calculateSupportResistance,
} from "@/lib/quantitative/indicators";

interface TechnicalAnalysisViewProps {
  initialSymbol?: string;
  onSelectStock?: (symbol: string) => void;
}

export function TechnicalAnalysisView({
  initialSymbol = "NABIL",
  onSelectStock,
}: TechnicalAnalysisViewProps) {
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol);
  const [timeframe, setTimeframe] = useState<"Daily" | "Weekly">("Daily");
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true);
  const [showBollinger, setShowBollinger] = useState(true);

  const stock =
    INITIAL_MARKET_PRICES.find((s) => s.symbol === selectedSymbol) ||
    INITIAL_MARKET_PRICES[0];

  const rawCandles = useMemo(
    () => generateHistoricalCandles(selectedSymbol, 50),
    [selectedSymbol]
  );
  const closes = rawCandles.map((c) => c.close);

  const sma20 = useMemo(() => calculateSMA(closes, 20), [closes]);
  const sma50 = useMemo(() => calculateSMA(closes, 50), [closes]);
  const bb = useMemo(() => calculateBollingerBands(closes, 20), [closes]);
  const rsi = useMemo(() => calculateRSI(closes, 14), [closes]);
  const macd = useMemo(() => calculateMACD(closes), [closes]);
  const sr = useMemo(() => calculateSupportResistance(rawCandles), [rawCandles]);

  // Merge chart series
  const chartData = useMemo(() => {
    return rawCandles.map((c, i) => ({
      date: c.date.slice(5),
      close: c.close,
      open: c.open,
      high: c.high,
      low: c.low,
      volume: c.volume,
      sma20: sma20[i],
      sma50: sma50[i],
      bbUpper: bb.upper[i],
      bbLower: bb.lower[i],
      rsi: rsi[i],
      macdHist: macd.histogram[i],
    }));
  }, [rawCandles, sma20, sma50, bb, rsi, macd]);

  const latestRsi = rsi[rsi.length - 1] ?? 50;
  const latestMacdHist = macd.histogram[macd.histogram.length - 1] ?? 0;
  const s20Val = sma20[sma20.length - 1] ?? stock.ltp;
  const s50Val = sma50[sma50.length - 1] ?? stock.ltp;

  return (
    <div className="space-y-6">
      {/* Header and Stock Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-white">Technical Analysis Engine</h1>
            <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/30">
              TRADINGVIEW CHARTING ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Multi-indicator quantitative trend detection, Bollinger envelopes, and momentum oscillators.
          </p>
        </div>

        {/* Symbol Quick Select */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-white focus:border-blue-500 focus:outline-none"
          >
            {INITIAL_MARKET_PRICES.map((s) => (
              <option key={s.symbol} value={s.symbol}>
                {s.symbol} - NPR {s.ltp} ({s.changePercent}%)
              </option>
            ))}
          </select>

          {/* Timeframe selector */}
          <div className="flex rounded-lg border border-slate-700 bg-slate-900 p-0.5 text-xs font-semibold">
            <button
              onClick={() => setTimeframe("Daily")}
              className={`rounded px-2.5 py-1 ${
                timeframe === "Daily" ? "bg-blue-600 text-white" : "text-slate-400"
              }`}
            >
              1D
            </button>
            <button
              onClick={() => setTimeframe("Weekly")}
              className={`rounded px-2.5 py-1 ${
                timeframe === "Weekly" ? "bg-blue-600 text-white" : "text-slate-400"
              }`}
            >
              1W
            </button>
          </div>
        </div>
      </div>

      {/* Main Chart Container */}
      <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-5 shadow-xl space-y-4">
        {/* Chart Header Indicators Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 text-xs">
          <div className="flex items-center space-x-4">
            <span className="font-bold text-white text-base">{stock.symbol}</span>
            <span className="font-mono text-emerald-400 font-bold">
              NPR {stock.ltp} (+{stock.changePercent}%)
            </span>
            <span className="text-slate-400 text-[11px] hidden sm:inline">
              Sector: {stock.sector}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-1 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={showSMA20}
                onChange={(e) => setShowSMA20(e.target.checked)}
                className="rounded accent-blue-500"
              />
              <span className="text-[11px]">SMA 20 (Blue)</span>
            </label>

            <label className="flex items-center space-x-1 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={showSMA50}
                onChange={(e) => setShowSMA50(e.target.checked)}
                className="rounded accent-amber-500"
              />
              <span className="text-[11px]">SMA 50 (Gold)</span>
            </label>

            <label className="flex items-center space-x-1 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={showBollinger}
                onChange={(e) => setShowBollinger(e.target.checked)}
                className="rounded accent-purple-500"
              />
              <span className="text-[11px]">Bollinger Bands</span>
            </label>
          </div>
        </div>

        {/* Primary Price & Trend Chart */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 10 }} />
              <YAxis
                domain={["auto", "auto"]}
                stroke="#64748B"
                tick={{ fontSize: 10 }}
                orientation="right"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0F172A",
                  borderColor: "#334155",
                  borderRadius: "8px",
                  fontSize: "11px",
                }}
              />

              {/* Bollinger Bands Envelopes */}
              {showBollinger && (
                <>
                  <Line
                    type="monotone"
                    dataKey="bbUpper"
                    stroke="#A855F7"
                    strokeDasharray="2 2"
                    dot={false}
                    strokeWidth={1}
                  />
                  <Line
                    type="monotone"
                    dataKey="bbLower"
                    stroke="#A855F7"
                    strokeDasharray="2 2"
                    dot={false}
                    strokeWidth={1}
                  />
                </>
              )}

              {/* Moving Averages */}
              {showSMA20 && (
                <Line
                  type="monotone"
                  dataKey="sma20"
                  stroke="#3B82F6"
                  dot={false}
                  strokeWidth={1.5}
                />
              )}
              {showSMA50 && (
                <Line
                  type="monotone"
                  dataKey="sma50"
                  stroke="#F59E0B"
                  dot={false}
                  strokeWidth={1.5}
                />
              )}

              {/* Close Price Line */}
              <Line
                type="monotone"
                dataKey="close"
                stroke="#10B981"
                dot={false}
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Secondary Oscillator Charts: RSI & MACD */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
          {/* RSI (14) */}
          <div className="h-28 w-full bg-slate-900/60 rounded-xl p-2.5">
            <div className="flex justify-between text-[11px] mb-1">
              <span className="font-semibold text-slate-300">RSI (14 Period)</span>
              <span
                className={`font-mono font-bold ${
                  latestRsi >= 70
                    ? "text-rose-400"
                    : latestRsi <= 35
                    ? "text-emerald-400"
                    : "text-blue-400"
                }`}
              >
                {latestRsi} ({latestRsi >= 70 ? "Overbought" : latestRsi <= 35 ? "Oversold" : "Neutral"})
              </span>
            </div>
            <ResponsiveContainer width="100%" height="80%">
              <ComposedChart data={chartData}>
                <YAxis domain={[0, 100]} hide={true} />
                <Line type="monotone" dataKey="rsi" stroke="#38BDF8" dot={false} strokeWidth={1.5} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* MACD Histogram */}
          <div className="h-28 w-full bg-slate-900/60 rounded-xl p-2.5">
            <div className="flex justify-between text-[11px] mb-1">
              <span className="font-semibold text-slate-300">MACD (12, 26, 9) Histogram</span>
              <span
                className={`font-mono font-bold ${
                  latestMacdHist >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {latestMacdHist >= 0 ? "+" : ""}
                {latestMacdHist}
              </span>
            </div>
            <ResponsiveContainer width="100%" height="80%">
              <ComposedChart data={chartData}>
                <Bar dataKey="macdHist" fill={latestMacdHist >= 0 ? "#10B981" : "#EF4444"} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quantitative Summary & Key Levels */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        <div className="rounded-xl border border-slate-800 bg-[#131B2E] p-4">
          <span className="text-slate-400 text-[11px] font-sans">Moving Average Stack</span>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between">
              <span>SMA 20:</span>
              <span className="text-blue-400 font-bold">NPR {s20Val.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span>SMA 50:</span>
              <span className="text-amber-400 font-bold">NPR {s50Val.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#131B2E] p-4">
          <span className="text-slate-400 text-[11px] font-sans">Nearest Resistance Levels</span>
          <div className="mt-2 space-y-1">
            {sr.resistances.slice(0, 2).map((r, i) => (
              <div key={i} className="flex justify-between text-rose-400 font-bold">
                <span>R{i + 1}:</span>
                <span>NPR {r.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#131B2E] p-4">
          <span className="text-slate-400 text-[11px] font-sans">Nearest Support Levels</span>
          <div className="mt-2 space-y-1">
            {sr.supports.slice(0, 2).map((s, i) => (
              <div key={i} className="flex justify-between text-emerald-400 font-bold">
                <span>S{i + 1}:</span>
                <span>NPR {s.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
