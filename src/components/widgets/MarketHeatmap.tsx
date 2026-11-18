"use client";

import React, { useState } from "react";
import { INITIAL_MARKET_PRICES } from "@/lib/market/nepseData";
import { Sector } from "@/types";

interface MarketHeatmapProps {
  onSelectStock: (symbol: string) => void;
}

export function MarketHeatmap({ onSelectStock }: MarketHeatmapProps) {
  const [metric, setMetric] = useState<"turnover" | "volume">("turnover");
  const [selectedSector, setSelectedSector] = useState<string>("ALL");

  const sectors: Sector[] = Array.from(
    new Set(INITIAL_MARKET_PRICES.map((s) => s.sector))
  );

  const filtered = INITIAL_MARKET_PRICES.filter(
    (s) => selectedSector === "ALL" || s.sector === selectedSector
  );

  const getHeatmapColor = (changePercent: number) => {
    if (changePercent >= 3.0) return "bg-emerald-600 hover:bg-emerald-500 text-white";
    if (changePercent >= 1.5) return "bg-emerald-700/80 hover:bg-emerald-600 text-white";
    if (changePercent > 0) return "bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200";
    if (changePercent === 0) return "bg-slate-800 hover:bg-slate-700 text-slate-300";
    if (changePercent > -1.5) return "bg-rose-900/60 hover:bg-rose-800 text-rose-200";
    if (changePercent > -3.0) return "bg-rose-700/80 hover:bg-rose-600 text-white";
    return "bg-rose-600 hover:bg-rose-500 text-white";
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <span>NEPSE Market Heatmap</span>
            <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/30">
              REAL-TIME MATRIX
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Tile color denotes session gain/loss; tile size represents market liquidity.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <div className="flex rounded-lg border border-slate-700 bg-slate-900 p-0.5 text-xs font-semibold">
            <button
              onClick={() => setMetric("turnover")}
              className={`rounded px-2.5 py-1 ${
                metric === "turnover" ? "bg-blue-600 text-white" : "text-slate-400"
              }`}
            >
              By Turnover
            </button>
            <button
              onClick={() => setMetric("volume")}
              className={`rounded px-2.5 py-1 ${
                metric === "volume" ? "bg-blue-600 text-white" : "text-slate-400"
              }`}
            >
              By Volume
            </button>
          </div>

          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-white"
          >
            <option value="ALL">All Sectors</option>
            {sectors.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {filtered.map((stock) => {
          const colorClass = getHeatmapColor(stock.changePercent);
          return (
            <div
              key={stock.symbol}
              onClick={() => onSelectStock(stock.symbol)}
              className={`rounded-xl p-3 cursor-pointer transition-all border border-slate-700/40 shadow-sm flex flex-col justify-between h-24 ${colorClass}`}
            >
              <div className="flex justify-between items-start">
                <span className="font-black text-sm tracking-tight">{stock.symbol}</span>
                <span className="font-mono text-xs font-bold">
                  {stock.changePercent >= 0 ? "+" : ""}
                  {stock.changePercent}%
                </span>
              </div>

              <div>
                <span className="font-mono text-xs block font-bold">NPR {stock.ltp}</span>
                <span className="text-[10px] opacity-80 block truncate">
                  {metric === "turnover"
                    ? `NPR ${(stock.turnover / 10000000).toFixed(1)} Cr`
                    : `${(stock.volume / 1000).toFixed(0)}k Units`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Heatmap Color Scale Legend */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
        <span>-3.0% (Bearish)</span>
        <div className="flex items-center space-x-1">
          <span className="h-2.5 w-6 rounded-sm bg-rose-600"></span>
          <span className="h-2.5 w-6 rounded-sm bg-rose-700"></span>
          <span className="h-2.5 w-6 rounded-sm bg-rose-900"></span>
          <span className="h-2.5 w-6 rounded-sm bg-slate-800"></span>
          <span className="h-2.5 w-6 rounded-sm bg-emerald-900"></span>
          <span className="h-2.5 w-6 rounded-sm bg-emerald-700"></span>
          <span className="h-2.5 w-6 rounded-sm bg-emerald-600"></span>
        </div>
        <span>+3.0% (Bullish)</span>
      </div>
    </div>
  );
}
