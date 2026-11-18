"use client";

import React, { useState } from "react";
import {
  Bookmark,
  Bell,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Sliders,
} from "lucide-react";
import { INITIAL_MARKET_PRICES } from "@/lib/market/nepseData";
import { WatchlistItem } from "@/types";

interface WatchlistViewProps {
  onSelectStock: (symbol: string) => void;
}

export function WatchlistView({ onSelectStock }: WatchlistViewProps) {
  const [activeWatchlist, setActiveWatchlist] = useState<string>("Core Growth");
  const [watchlists, setWatchlists] = useState<string[]>([
    "Core Growth",
    "High Dividend Yield",
    "Breakout Candidates",
  ]);

  const [items, setItems] = useState<WatchlistItem[]>([
    {
      id: "w-1",
      symbol: "NABIL",
      targetPrice: 580,
      stopLossPrice: 500,
      rsiAlertUpper: 70,
      rsiAlertLower: 35,
      notes: "Core bluechip banking holding",
      addedAt: "2024-10-01",
    },
    {
      id: "w-2",
      symbol: "CHCL",
      targetPrice: 480,
      stopLossPrice: 420,
      rsiAlertUpper: 72,
      notes: "Hydro breakout candidate over NPR 445 resistance",
      addedAt: "2024-10-15",
    },
    {
      id: "w-3",
      symbol: "HRL",
      targetPrice: 700,
      stopLossPrice: 590,
      notes: "Institutional turnover accumulation",
      addedAt: "2024-10-22",
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addSymbol, setAddSymbol] = useState("SCB");
  const [targetPrice, setTargetPrice] = useState("620");
  const [stopLoss, setStopLoss] = useState("540");
  const [notes, setNotes] = useState("");

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: WatchlistItem = {
      id: `w-${Date.now()}`,
      symbol: addSymbol.toUpperCase(),
      targetPrice: parseFloat(targetPrice) || undefined,
      stopLossPrice: parseFloat(stopLoss) || undefined,
      notes,
      addedAt: new Date().toISOString().split("T")[0],
    };
    setItems([newItem, ...items]);
    setShowAddModal(false);
    setNotes("");
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-800 bg-[#131B2E] p-6 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1.5 rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-bold text-blue-400 border border-blue-500/30">
              <Bookmark className="h-3.5 w-3.5 text-blue-400" />
              <span>SMART WATCHLIST & ALERT ENGINE</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">MULTI-CONDITION MONITOR</span>
          </div>
          <h1 className="mt-2 text-2xl font-black text-white">Custom Watchlists & Trigger Alerts</h1>
          <p className="mt-1 text-xs text-slate-400">
            Configure automated price threshold alerts, RSI boundary triggers, and volume breakout monitors.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          <span>Add Stock Alert</span>
        </button>
      </div>

      {/* Watchlist Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 text-xs font-semibold">
        {watchlists.map((wl) => (
          <button
            key={wl}
            onClick={() => setActiveWatchlist(wl)}
            className={`rounded-xl px-4 py-2 transition-all ${
              activeWatchlist === wl
                ? "bg-blue-600 text-white font-bold"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {wl}
          </button>
        ))}
      </div>

      {/* Watchlist Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const stock = INITIAL_MARKET_PRICES.find((s) => s.symbol === item.symbol);
          const currentPrice = stock?.ltp || 100;
          const targetDist = item.targetPrice
            ? Math.round(((item.targetPrice - currentPrice) / currentPrice) * 1000) / 10
            : null;
          const stopDist = item.stopLossPrice
            ? Math.round(((currentPrice - item.stopLossPrice) / currentPrice) * 1000) / 10
            : null;

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-800 bg-[#131B2E] p-5 shadow-lg space-y-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div
                  onClick={() => onSelectStock(item.symbol)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-400 border border-blue-500/30">
                      {item.symbol}
                    </span>
                    <span className="text-xs font-bold text-white truncate max-w-[120px]">
                      {stock?.name || item.symbol}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">{stock?.sector}</span>
                </div>

                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Price Row */}
              <div className="flex justify-between items-baseline font-mono">
                <span className="text-xl font-black text-white">NPR {currentPrice}</span>
                <span
                  className={`text-xs font-bold ${
                    (stock?.change || 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {(stock?.change || 0) >= 0 ? "+" : ""}
                  {stock?.change} ({stock?.changePercent}%)
                </span>
              </div>

              {/* Targets and Alerts Matrix */}
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-900/80 p-3 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Target Price</span>
                  <span className="font-bold text-emerald-400">
                    NPR {item.targetPrice || "--"}
                  </span>
                  {targetDist !== null && (
                    <span className="text-[10px] text-slate-500 block">
                      +{targetDist}% upside
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Stop Loss</span>
                  <span className="font-bold text-rose-400">
                    NPR {item.stopLossPrice || "--"}
                  </span>
                  {stopDist !== null && (
                    <span className="text-[10px] text-slate-500 block">
                      -{stopDist}% risk
                    </span>
                  )}
                </div>
              </div>

              {item.notes && (
                <p className="text-[11px] text-slate-400 italic">
                  &ldquo;{item.notes}&rdquo;
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Alert Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#131B2E] p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h2 className="text-sm font-bold text-white">Add Watchlist Alert</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Company</label>
                <select
                  value={addSymbol}
                  onChange={(e) => {
                    setAddSymbol(e.target.value);
                    const p = INITIAL_MARKET_PRICES.find((m) => m.symbol === e.target.value);
                    if (p) {
                      setTargetPrice(Math.round(p.ltp * 1.15).toString());
                      setStopLoss(Math.round(p.ltp * 0.94).toString());
                    }
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
                >
                  {INITIAL_MARKET_PRICES.map((m) => (
                    <option key={m.symbol} value={m.symbol}>
                      {m.symbol} - {m.name} (NPR {m.ltp})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Target Price (NPR)</label>
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Stop-Loss Price (NPR)</label>
                  <input
                    type="number"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Thesis Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Breakout retest confirmation"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-500"
                >
                  Save Watchlist Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
