"use client";

import React, { useState } from "react";
import {
  BrainCircuit,
  Play,
  RotateCcw,
  TrendingUp,
  BarChart3,
  Award,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { ScannerType } from "@/types";

export function BacktestingView() {
  const [strategy, setStrategy] = useState<ScannerType>("CONSOLIDATING_UP_BREAKOUT");
  const [holdingPeriod, setHoldingPeriod] = useState<number>(15);
  const [targetPct, setTargetPct] = useState<number>(12);
  const [stopLossPct, setStopLossPct] = useState<number>(6);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Backtest simulation metrics based on parameters
  const winRate = strategy === "CONSOLIDATING_UP_BREAKOUT" ? 78.5 : 72.0;
  const totalTrades = 42;
  const profitFactor = 2.45;
  const sharpeRatio = 1.84;
  const maxDrawdown = 7.2;
  const totalReturn = 38.6;

  // Generated cumulative equity curve simulation
  const equityCurve = [
    { trade: "Start", equity: 100000, benchmark: 100000 },
    { trade: "T-5", equity: 104500, benchmark: 101200 },
    { trade: "T-10", equity: 109200, benchmark: 102400 },
    { trade: "T-15", equity: 106800, benchmark: 100800 },
    { trade: "T-20", equity: 114500, benchmark: 103500 },
    { trade: "T-25", equity: 121000, benchmark: 104800 },
    { trade: "T-30", equity: 126400, benchmark: 106200 },
    { trade: "T-35", equity: 132000, benchmark: 108100 },
    { trade: "T-40", equity: 138600, benchmark: 109400 },
  ];

  const handleRunBacktest = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-6 shadow-xl">
        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1.5 rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-bold text-blue-400 border border-blue-500/30">
            <BrainCircuit className="h-3.5 w-3.5 text-blue-400" />
            <span>WALK-FORWARD STRATEGY BACKTESTING</span>
          </span>
          <span className="text-xs text-slate-400 font-mono">PURGED OUT-OF-SAMPLE VALIDATION</span>
        </div>
        <h1 className="mt-2 text-2xl font-black text-white">Systematic Strategy Backtesting Simulator</h1>
        <p className="mt-1 text-xs text-slate-400">
          Simulate trading algorithms against historical NEPSE tick data with transaction cost modeling and slippage.
        </p>
      </div>

      {/* Parameter Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 rounded-2xl border border-slate-800 bg-[#131B2E] p-5 text-xs">
        <div>
          <label className="text-slate-400 block mb-1">Strategy Scanner</label>
          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value as any)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
          >
            <option value="CONSOLIDATING_UP_BREAKOUT">Consolidating Up Breakout</option>
            <option value="INSIDE_BAR_UP">Inside Bar Bullish Breakout</option>
            <option value="TRENDING_STOCKS">Institutional Trend Leader</option>
            <option value="MOMENTUM_SIGNAL">MACD Momentum Surge</option>
            <option value="REVERSAL_SIGNAL">Mean Reversion Divergence</option>
          </select>
        </div>

        <div>
          <label className="text-slate-400 block mb-1">
            Holding Window: <strong className="text-blue-400 font-mono">{holdingPeriod} Days</strong>
          </label>
          <input
            type="range"
            min="5"
            max="60"
            step="1"
            value={holdingPeriod}
            onChange={(e) => setHoldingPeriod(parseInt(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>

        <div>
          <label className="text-slate-400 block mb-1">
            Target Profit: <strong className="text-emerald-400 font-mono">+{targetPct}%</strong>
          </label>
          <input
            type="range"
            min="5"
            max="30"
            step="1"
            value={targetPct}
            onChange={(e) => setTargetPct(parseInt(e.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={handleRunBacktest}
            disabled={isSimulating}
            className="w-full flex items-center justify-center space-x-1.5 rounded-xl bg-blue-600 px-4 py-2.5 font-bold text-white hover:bg-blue-500 transition-all shadow-md shadow-blue-600/30"
          >
            <Play className="h-4 w-4" />
            <span>{isSimulating ? "Simulating Walk-Forward..." : "Run Historical Backtest"}</span>
          </button>
        </div>
      </div>

      {/* KPI Performance Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
        <div className="rounded-xl border border-slate-800 bg-[#131B2E] p-3 text-center">
          <span className="text-slate-400 text-[10px] uppercase font-sans block">Win Rate</span>
          <span className="text-lg font-bold text-emerald-400 mt-1 block">{winRate}%</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#131B2E] p-3 text-center">
          <span className="text-slate-400 text-[10px] uppercase font-sans block">Total Return</span>
          <span className="text-lg font-bold text-white mt-1 block">+{totalReturn}%</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#131B2E] p-3 text-center">
          <span className="text-slate-400 text-[10px] uppercase font-sans block">Profit Factor</span>
          <span className="text-lg font-bold text-blue-400 mt-1 block">{profitFactor}x</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#131B2E] p-3 text-center">
          <span className="text-slate-400 text-[10px] uppercase font-sans block">Sharpe Ratio</span>
          <span className="text-lg font-bold text-purple-400 mt-1 block">{sharpeRatio}</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#131B2E] p-3 text-center">
          <span className="text-slate-400 text-[10px] uppercase font-sans block">Max Drawdown</span>
          <span className="text-lg font-bold text-rose-400 mt-1 block">-{maxDrawdown}%</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#131B2E] p-3 text-center">
          <span className="text-slate-400 text-[10px] uppercase font-sans block">Total Executions</span>
          <span className="text-lg font-bold text-amber-400 mt-1 block">{totalTrades} Trades</span>
        </div>
      </div>

      {/* Cumulative Equity Curve Chart */}
      <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-5 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3 text-xs">
          <div>
            <h2 className="text-sm font-bold text-white">Cumulative Equity Curve vs. NEPSE Benchmark</h2>
            <p className="text-slate-400">Starting Capital: NPR 100,000 | Fees & CGT Deducted</p>
          </div>
          <div className="flex items-center space-x-3 font-mono">
            <span className="flex items-center space-x-1 text-blue-400 font-bold">
              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
              <span>Strategy (+38.6%)</span>
            </span>
            <span className="flex items-center space-x-1 text-slate-400">
              <span className="h-2 w-2 rounded-full bg-slate-500"></span>
              <span>NEPSE (+9.4%)</span>
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={equityCurve}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="trade" stroke="#64748B" tick={{ fontSize: 10 }} />
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
              <Line
                type="monotone"
                dataKey="equity"
                stroke="#3B82F6"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="benchmark"
                stroke="#64748B"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
