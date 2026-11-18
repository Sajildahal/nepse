"use client";

import React, { useState } from "react";
import {
  Bot,
  Zap,
  Target,
  ShieldAlert,
  ArrowUpRight,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  BrainCircuit,
  History,
  Sparkles,
} from "lucide-react";
import { AIRecommendation, Holding } from "@/types";
import { getAllAIRecommendations } from "@/lib/ai/recommendationEngine";
import { INITIAL_MARKET_PRICES } from "@/lib/market/nepseData";
import { simulateAveraging } from "@/lib/portfolio/portfolioEngine";

interface AIIntelligenceViewProps {
  holdings: Holding[];
  onSelectStock: (symbol: string) => void;
}

export function AIIntelligenceView({ holdings, onSelectStock }: AIIntelligenceViewProps) {
  const recommendations = getAllAIRecommendations(INITIAL_MARKET_PRICES);
  const [selectedSymbol, setSelectedSymbol] = useState<string>("NABIL");

  // Selected Stock Recommendation
  const currentRec =
    recommendations.find((r) => r.symbol === selectedSymbol) || recommendations[0];

  // Holding if user owns this stock
  const currentHolding = holdings.find((h) => h.symbol === selectedSymbol);

  // Averaging Assistant interactive state
  const [addQty, setAddQty] = useState(50);
  const [addPrice, setAddPrice] = useState(currentRec.currentPrice);

  const averagingSim = currentHolding
    ? simulateAveraging(currentHolding, addQty, addPrice)
    : null;

  return (
    <div className="space-y-6">
      {/* AI Engine Hero Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/40 p-6 shadow-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1.5 rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-bold text-blue-400 border border-blue-500/30">
              <Bot className="h-3.5 w-3.5 text-blue-400" />
              <span>NEPSE-QUANT-ENSEMBLE v3.4.1</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">CALIBRATED WALK-FORWARD</span>
          </div>
          <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">
            AI Market Intelligence & Recommendation Engine
          </h1>
          <p className="mt-1 text-xs text-slate-400 max-w-2xl">
            Multi-factor synthesis of price action, 14 technical indicators, audited company fundamentals, and order book volume depth.
          </p>
        </div>

        {/* Model Accuracy Metrics */}
        <div className="mt-4 flex items-center space-x-4 lg:mt-0 font-mono text-xs">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-center">
            <span className="text-slate-400 block text-[10px] uppercase">Model Win Rate</span>
            <span className="text-base font-bold text-emerald-400">76.4%</span>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-center">
            <span className="text-slate-400 block text-[10px] uppercase">Profit Factor</span>
            <span className="text-base font-bold text-blue-400">2.42x</span>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-center">
            <span className="text-slate-400 block text-[10px] uppercase">Expectancy</span>
            <span className="text-base font-bold text-amber-400">+11.8%</span>
          </div>
        </div>
      </div>

      {/* Stock Selection Ribbon */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        {recommendations.map((rec) => (
          <button
            key={rec.symbol}
            onClick={() => {
              setSelectedSymbol(rec.symbol);
              setAddPrice(rec.currentPrice);
            }}
            className={`flex items-center space-x-2 rounded-xl px-3 py-2 font-medium transition-all ${
              selectedSymbol === rec.symbol
                ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30"
                : "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850"
            }`}
          >
            <span>{rec.symbol}</span>
            <span
              className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                rec.signal === "STRONG_BUY" || rec.signal === "BUY"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : rec.signal === "ACCUMULATE" || rec.signal === "AVERAGE_DOWN"
                  ? "bg-blue-500/20 text-blue-300"
                  : "bg-slate-700/50 text-slate-300"
              }`}
            >
              {rec.signal}
            </span>
          </button>
        ))}
      </div>

      {/* Detailed Recommendation Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Signal Header & Numerical Targets */}
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">{currentRec.companyName}</span>
                <h2 className="text-2xl font-bold font-mono text-white">{currentRec.symbol}</h2>
              </div>
              <span
                className={`rounded-xl px-3 py-1 text-xs font-black tracking-wide border ${
                  currentRec.signal === "STRONG_BUY" || currentRec.signal === "BUY"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    : currentRec.signal === "ACCUMULATE"
                    ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                    : currentRec.signal === "REDUCE"
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                    : "bg-rose-500/20 text-rose-400 border-rose-500/40"
                }`}
              >
                {currentRec.signal}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
              <span className="text-xs text-slate-400">Current Verified LTP:</span>
              <span className="text-base font-bold font-mono text-white">
                NPR {currentRec.currentPrice}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-slate-400">AI Confidence Rating:</span>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-20 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${currentRec.confidenceScore}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold font-mono text-blue-400">
                  {currentRec.confidenceScore}%
                </span>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-slate-400">Time Horizon:</span>
              <span className="text-xs font-medium text-slate-200">{currentRec.horizon}</span>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-slate-400">Market Regime:</span>
              <span className="text-xs font-semibold text-emerald-400">
                {currentRec.marketRegime}
              </span>
            </div>

            {/* Target, Entry & Stop Loss Matrix */}
            <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-900/80 p-3 text-center font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Entry Zone</span>
                <span className="text-xs font-bold text-slate-200">
                  {currentRec.entryRange.min} - {currentRec.entryRange.max}
                </span>
              </div>
              <div className="border-x border-slate-800 px-1">
                <span className="text-[10px] text-slate-400 block font-sans">Target Price</span>
                <span className="text-xs font-bold text-emerald-400">
                  NPR {currentRec.targetPrice}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Stop-Loss</span>
                <span className="text-xs font-bold text-rose-400">
                  NPR {currentRec.stopLoss}
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Risk/Reward Ratio:</span>
              <span className="font-bold text-emerald-400">{currentRec.riskReward} : 1.0</span>
            </div>
          </div>

          {/* Invalidation Rules */}
          <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-4 text-xs">
            <h3 className="font-bold text-rose-400 flex items-center space-x-1.5 mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Signal Invalidation Conditions</span>
            </h3>
            <ul className="space-y-1.5 text-slate-300">
              {currentRec.invalidationConditions.map((cond, i) => (
                <li key={i} className="flex items-start space-x-1.5 text-[11px]">
                  <span className="text-rose-400">•</span>
                  <span>{cond}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right 2 Columns: Explainable Reasoning & Intelligent Averaging Assistant */}
        <div className="space-y-4 lg:col-span-2">
          {/* Detailed Theses */}
          <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-5 space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center space-x-1.5">
                <BrainCircuit className="h-4 w-4" />
                <span>Quantitative & Technical Thesis</span>
              </h3>
              <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                {currentRec.technicalThesis}
              </p>
            </div>

            <div className="border-t border-slate-800 pt-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                <Target className="h-4 w-4" />
                <span>Fundamental & Balance Sheet Thesis</span>
              </h3>
              <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                {currentRec.fundamentalThesis}
              </p>
            </div>

            {/* Pros and Cons Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl bg-slate-900/60 p-3">
                <span className="text-[11px] font-bold text-emerald-400 block mb-1.5">
                  Positive Catalysts
                </span>
                <ul className="space-y-1 text-[11px] text-slate-300">
                  {currentRec.positiveFactors.map((f, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl bg-slate-900/60 p-3">
                <span className="text-[11px] font-bold text-amber-400 block mb-1.5">
                  Key Risk Factors
                </span>
                <ul className="space-y-1 text-[11px] text-slate-300">
                  {currentRec.negativeFactors.map((f, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <ShieldAlert className="h-3 w-3 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Interactive Intelligent Averaging Assistant */}
          <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-slate-900 to-[#131B2E] p-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Sliders className="h-4 w-4 text-blue-400" />
                  <span>Intelligent Averaging Assistant</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Simulate purchase quantities to calculate resulting WACC reduction & revised break-even price.
                </p>
              </div>
              {currentHolding && (
                <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300 font-mono">
                  Currently Holding: {currentHolding.quantity} units @ NPR {currentHolding.wacc}
                </span>
              )}
            </div>

            {currentHolding ? (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Slider 1: Additional Units */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Additional Units to Purchase:</span>
                      <span className="font-bold font-mono text-blue-400">{addQty} units</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="500"
                      step="10"
                      value={addQty}
                      onChange={(e) => setAddQty(parseInt(e.target.value))}
                      className="w-full accent-blue-500"
                    />
                  </div>

                  {/* Slider 2: Purchase Price */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Prospective Purchase Price:</span>
                      <span className="font-bold font-mono text-emerald-400">NPR {addPrice}</span>
                    </div>
                    <input
                      type="range"
                      min={Math.round(currentRec.currentPrice * 0.8)}
                      max={Math.round(currentRec.currentPrice * 1.2)}
                      step="1"
                      value={addPrice}
                      onChange={(e) => setAddPrice(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                </div>

                {/* Simulation Output Cards */}
                {averagingSim && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl bg-slate-900/90 p-4 font-mono text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">New Total Units</span>
                      <span className="text-sm font-bold text-white">{averagingSim.newTotalUnits}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">Revised WACC</span>
                      <span className="text-sm font-bold text-blue-400">NPR {averagingSim.newWacc}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">Cost Reduction / Share</span>
                      <span className="text-sm font-bold text-emerald-400">
                        -NPR {averagingSim.costReductionPerShare}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">Capital Required</span>
                      <span className="text-sm font-bold text-amber-400">
                        NPR {averagingSim.additionalCapitalRequired.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4 rounded-xl bg-slate-900/50 p-4 text-center text-xs text-slate-400">
                You do not currently own {currentRec.symbol} in your active portfolio. Add an initial purchase in the Portfolio tab to unlock the dynamic averaging assistant.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
