"use client";

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  DollarSign,
  PieChart,
  Bot,
  Zap,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { INITIAL_INDICES, INITIAL_MARKET_PRICES } from "@/lib/market/nepseData";
import { PortfolioSummary, Holding } from "@/types";
import { TabKey } from "../Sidebar";

interface DashboardViewProps {
  summary: PortfolioSummary;
  holdings: Holding[];
  onNavigate: (tab: TabKey) => void;
  onSelectStock: (symbol: string) => void;
}

export function DashboardView({
  summary,
  holdings,
  onNavigate,
  onSelectStock,
}: DashboardViewProps) {
  const topGainers = [...INITIAL_MARKET_PRICES]
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 4);

  const topTurnover = [...INITIAL_MARKET_PRICES]
    .sort((a, b) => b.turnover - a.turnover)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Metrics */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between rounded-2xl border border-slate-800 bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900/80 p-6 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/30">
              NEPSE INTELLIGENCE AI TERMINAL
            </span>
            <span className="text-xs text-slate-400 font-mono">v3.4.1 PRODUCTION</span>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
            Nepal Stock Exchange Market Intelligence
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Real-time quantitative signals, portfolio accounting, and automated regulatory compliance.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 lg:mt-0">
          <button
            onClick={() => onNavigate("portfolio")}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all"
          >
            Manage Portfolio
          </button>
          <button
            onClick={() => onNavigate("tools")}
            className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-750 transition-all flex items-center space-x-1.5"
          >
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>Launch 9x Scanners</span>
          </button>
        </div>
      </div>

      {/* Primary Portfolio Glance Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Invested */}
        <div className="rounded-xl border border-slate-800 bg-[#131B2E] p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Invested Capital</span>
            <DollarSign className="h-4 w-4 text-slate-500" />
          </div>
          <p className="mt-2 text-xl font-bold font-mono text-white">
            NPR {summary.totalInvested.toLocaleString()}
          </p>
          <div className="mt-1 text-[11px] text-slate-400">
            Across {summary.holdingsCount} active holdings (WACC Basis)
          </div>
        </div>

        {/* Current Market Value */}
        <div className="rounded-xl border border-slate-800 bg-[#131B2E] p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Current Market Value</span>
            <PieChart className="h-4 w-4 text-blue-400" />
          </div>
          <p className="mt-2 text-xl font-bold font-mono text-white">
            NPR {summary.currentMarketValue.toLocaleString()}
          </p>
          <div className="mt-1 flex items-center space-x-1 text-[11px] text-emerald-400 font-medium">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>Daily +NPR {summary.dailyChange.toLocaleString()} (+{summary.dailyChangePercent}%)</span>
          </div>
        </div>

        {/* Unrealized Profit / Loss */}
        <div className="rounded-xl border border-slate-800 bg-[#131B2E] p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Unrealized Profit / Loss</span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <p
            className={`mt-2 text-xl font-bold font-mono ${
              summary.unrealizedPL >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {summary.unrealizedPL >= 0 ? "+" : ""}NPR{" "}
            {summary.unrealizedPL.toLocaleString()}
          </p>
          <div
            className={`mt-1 text-[11px] font-semibold ${
              summary.unrealizedPLPercent >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {summary.unrealizedPLPercent >= 0 ? "+" : ""}
            {summary.unrealizedPLPercent}% All-time return
          </div>
        </div>

        {/* Realized Gains & Cash */}
        <div className="rounded-xl border border-slate-800 bg-[#131B2E] p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Available Cash & Realized</span>
            <ShieldCheck className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-xl font-bold font-mono text-amber-400">
            NPR {summary.cashBalance.toLocaleString()}
          </p>
          <div className="mt-1 text-[11px] text-slate-400">
            Realized Gains: +NPR {summary.realizedPL.toLocaleString()} (Net CGT)
          </div>
        </div>
      </div>

      {/* Middle Grid: Market Indices & Top Stocks */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Market Indices Breakdown */}
        <div className="rounded-xl border border-slate-800 bg-[#131B2E] p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Activity className="h-4 w-4 text-blue-400" />
              <span>Key NEPSE Indices</span>
            </h2>
            <button
              onClick={() => onNavigate("live-market")}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              View All
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {INITIAL_INDICES.slice(0, 5).map((idx) => (
              <div
                key={idx.name}
                className="flex items-center justify-between rounded-lg bg-slate-900/60 p-3 text-xs"
              >
                <div>
                  <p className="font-semibold text-slate-200">{idx.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    High: {idx.high.toLocaleString()} | Low: {idx.low.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold font-mono text-white">{idx.current.toLocaleString()}</p>
                  <p
                    className={`text-[11px] font-semibold ${
                      idx.change >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {idx.change >= 0 ? "+" : ""}
                    {idx.change} ({idx.changePercent}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Gainers Today */}
        <div className="rounded-xl border border-slate-800 bg-[#131B2E] p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span>Top Gainers Today</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">REAL-TIME</span>
          </div>

          <div className="mt-4 space-y-3">
            {topGainers.map((s) => (
              <div
                key={s.symbol}
                onClick={() => onSelectStock(s.symbol)}
                className="flex items-center justify-between rounded-lg bg-slate-900/60 p-3 text-xs cursor-pointer hover:bg-slate-850 transition-colors"
              >
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-white">{s.symbol}</span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[110px]">
                      {s.name}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Vol: {s.volume.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold font-mono text-white">NPR {s.ltp}</p>
                  <p className="text-[11px] font-bold text-emerald-400">
                    +{s.change} (+{s.changePercent}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Highest Turnover Leaders */}
        <div className="rounded-xl border border-slate-800 bg-[#131B2E] p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Turnover Leaders</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">INSTITUTIONAL</span>
          </div>

          <div className="mt-4 space-y-3">
            {topTurnover.map((s) => (
              <div
                key={s.symbol}
                onClick={() => onSelectStock(s.symbol)}
                className="flex items-center justify-between rounded-lg bg-slate-900/60 p-3 text-xs cursor-pointer hover:bg-slate-850 transition-colors"
              >
                <div>
                  <span className="font-bold text-white">{s.symbol}</span>
                  <p className="text-[10px] text-slate-400">
                    Turnover: NPR {(s.turnover / 10000000).toFixed(2)} Cr
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold font-mono text-white">NPR {s.ltp}</p>
                  <p
                    className={`text-[11px] font-bold ${
                      s.change >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {s.change >= 0 ? "+" : ""}
                    {s.changePercent}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Portfolio Holdings Snapshot */}
      <div className="rounded-xl border border-slate-800 bg-[#131B2E] p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white">Active Portfolio Holdings</h2>
            <p className="text-xs text-slate-400">Current positions and AI strategic recommendation</p>
          </div>
          <button
            onClick={() => onNavigate("portfolio")}
            className="flex items-center space-x-1 text-xs font-semibold text-blue-400 hover:text-blue-300"
          >
            <span>Full Portfolio Details</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="pb-3 font-semibold">Symbol</th>
                <th className="pb-3 font-semibold">Quantity</th>
                <th className="pb-3 font-semibold">WACC</th>
                <th className="pb-3 font-semibold">Current LTP</th>
                <th className="pb-3 font-semibold">Market Value</th>
                <th className="pb-3 font-semibold">Unrealized P/L</th>
                <th className="pb-3 font-semibold">Break-Even</th>
                <th className="pb-3 font-semibold">AI Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {holdings.slice(0, 5).map((h) => (
                <tr
                  key={h.symbol}
                  onClick={() => onSelectStock(h.symbol)}
                  className="hover:bg-slate-850/50 cursor-pointer transition-colors"
                >
                  <td className="py-3 font-bold text-white font-sans flex items-center space-x-2">
                    <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-blue-400 border border-blue-500/20">
                      {h.symbol}
                    </span>
                  </td>
                  <td className="py-3 text-slate-300">{h.quantity.toLocaleString()}</td>
                  <td className="py-3 text-slate-300">NPR {h.wacc.toFixed(2)}</td>
                  <td className="py-3 font-bold text-white">NPR {h.currentLtp}</td>
                  <td className="py-3 text-slate-200">NPR {h.currentMarketValue.toLocaleString()}</td>
                  <td
                    className={`py-3 font-bold ${
                      h.unrealizedPL >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {h.unrealizedPL >= 0 ? "+" : ""}NPR {h.unrealizedPL.toLocaleString()} (
                    {h.unrealizedPLPercent}%)
                  </td>
                  <td className="py-3 text-amber-400">NPR {h.breakEvenPrice.toFixed(2)}</td>
                  <td className="py-3 font-sans">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                        h.aiSuggestedAction === "STRONG_BUY" || h.aiSuggestedAction === "BUY"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : h.aiSuggestedAction === "AVERAGE_DOWN"
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : h.aiSuggestedAction === "REDUCE"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-slate-700/50 text-slate-300"
                      }`}
                    >
                      {h.aiSuggestedAction} ({h.aiConfidence}%)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
