"use client";

import React from "react";
import { X, ExternalLink, Activity, Target, ShieldCheck } from "lucide-react";
import { INITIAL_MARKET_PRICES, NEPSE_COMPANIES } from "@/lib/market/nepseData";
import { generateStockAIRecommendation } from "@/lib/ai/recommendationEngine";

interface StockDetailModalProps {
  symbol: string | null;
  onClose: () => void;
  onOpenAnalysis: (symbol: string) => void;
}

export function StockDetailModal({
  symbol,
  onClose,
  onOpenAnalysis,
}: StockDetailModalProps) {
  if (!symbol) return null;

  const stock = INITIAL_MARKET_PRICES.find((s) => s.symbol === symbol);
  const company = NEPSE_COMPANIES.find((c) => c.symbol === symbol);
  const ai = stock ? generateStockAIRecommendation(symbol, stock) : null;

  if (!stock) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#131B2E] p-6 shadow-2xl space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <span className="rounded bg-blue-500/20 px-2.5 py-1 text-sm font-black text-blue-400 border border-blue-500/30">
              {stock.symbol}
            </span>
            <div>
              <h2 className="text-base font-bold text-white">{stock.name}</h2>
              <span className="text-[10px] text-slate-400">{stock.sector}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Price & Action Badge */}
        <div className="flex justify-between items-center rounded-xl bg-slate-900/80 p-4">
          <div>
            <span className="text-2xl font-black font-mono text-white">NPR {stock.ltp}</span>
            <span
              className={`block text-xs font-bold font-mono ${
                stock.change >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {stock.change >= 0 ? "+" : ""}
              {stock.change} ({stock.changePercent}%)
            </span>
          </div>

          {ai && (
            <div className="text-right">
              <span
                className={`rounded px-2.5 py-1 text-xs font-black border ${
                  ai.signal === "STRONG_BUY" || ai.signal === "BUY"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                }`}
              >
                {ai.signal}
              </span>
              <span className="block text-[10px] text-slate-400 mt-1 font-mono">
                {ai.confidenceScore}% Confidence
              </span>
            </div>
          )}
        </div>

        {/* Quick Fundamentals */}
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-900/60 p-3 font-mono text-center">
          <div>
            <span className="text-[10px] text-slate-400 block font-sans">P/E Ratio</span>
            <span className="font-bold text-white">{company?.pe || 22}x</span>
          </div>
          <div className="border-x border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">EPS</span>
            <span className="font-bold text-emerald-400">NPR {company?.eps || 24}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-sans">ROE</span>
            <span className="font-bold text-blue-400">{company?.roe || 12}%</span>
          </div>
        </div>

        {/* Targets */}
        {ai && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Target Price:</span>
              <span className="text-emerald-400 font-bold">NPR {ai.targetPrice}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Stop-Loss Level:</span>
              <span className="text-rose-400 font-bold">NPR {ai.stopLoss}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Risk / Reward:</span>
              <span className="text-amber-400 font-bold">{ai.riskReward} : 1.0</span>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-2">
          <button
            onClick={() => {
              onClose();
              onOpenAnalysis(stock.symbol);
            }}
            className="flex items-center space-x-1.5 text-blue-400 hover:text-blue-300 font-semibold text-xs"
          >
            <span>Open Technical Chart</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={onClose}
            className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
