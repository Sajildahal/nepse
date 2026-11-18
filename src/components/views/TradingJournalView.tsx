"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Plus,
  BrainCircuit,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Award,
  Zap,
} from "lucide-react";
import { JournalEntry } from "@/types";

export function TradingJournalView() {
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: "j-1",
      symbol: "NABIL",
      entryDate: "2024-08-15",
      exitDate: "2024-10-10",
      entryPrice: 490,
      exitPrice: 565,
      quantity: 150,
      strategy: "50-SMA Mean Reversion",
      setupType: "RSI Bullish Divergence",
      emotionAtEntry: "Disciplined",
      emotionAtExit: "Satisfied",
      confidenceRating: 4,
      pl: 10840,
      plPercent: 15.3,
      lessonsLearned: "Patience rewarded; waited for candle close confirmation rather than chasing market orders.",
      isClosed: true,
    },
    {
      id: "j-2",
      symbol: "UPPER",
      entryDate: "2024-09-02",
      exitDate: "2024-09-18",
      entryPrice: 245,
      exitPrice: 220,
      quantity: 200,
      strategy: "Breakout Continuation",
      setupType: "High Volume Surge",
      emotionAtEntry: "FOMO",
      emotionAtExit: "Panic Sold",
      confidenceRating: 2,
      pl: -5200,
      plPercent: -10.2,
      lessonsLearned: "Chased 3rd green daily candle near known resistance; failed to set predefined stop-loss order.",
      isClosed: true,
    },
    {
      id: "j-3",
      symbol: "CHCL",
      entryDate: "2024-10-05",
      entryPrice: 420,
      quantity: 100,
      strategy: "Support Zone Accumulation",
      setupType: "Tight Bollinger Squeeze",
      emotionAtEntry: "Disciplined",
      confidenceRating: 5,
      lessonsLearned: "Holding position with trailing stop at break-even.",
      isClosed: false,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [symbol, setSymbol] = useState("SCB");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);
  const [entryPrice, setEntryPrice] = useState("550");
  const [quantity, setQuantity] = useState("100");
  const [strategy, setStrategy] = useState("Moving Average Pullback");
  const [emotion, setEmotion] = useState<JournalEntry["emotionAtEntry"]>("Disciplined");
  const [confidence, setConfidence] = useState(4);
  const [lessons, setLessons] = useState("");

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: JournalEntry = {
      id: `j-${Date.now()}`,
      symbol: symbol.toUpperCase(),
      entryDate,
      entryPrice: parseFloat(entryPrice) || 500,
      quantity: parseInt(quantity) || 100,
      strategy,
      setupType: "Technical Setup",
      emotionAtEntry: emotion,
      confidenceRating: confidence,
      lessonsLearned: lessons,
      isClosed: false,
    };
    setEntries([newEntry, ...entries]);
    setShowAddModal(false);
    setLessons("");
  };

  const closedTrades = entries.filter((e) => e.isClosed && e.pl !== undefined);
  const winCount = closedTrades.filter((e) => (e.pl || 0) > 0).length;
  const winRate = closedTrades.length > 0 ? Math.round((winCount / closedTrades.length) * 100) : 0;
  const totalPL = closedTrades.reduce((sum, e) => sum + (e.pl || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-800 bg-[#131B2E] p-6 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1.5 rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-bold text-blue-400 border border-blue-500/30">
              <BookOpen className="h-3.5 w-3.5 text-blue-400" />
              <span>TRADING JOURNAL & PSYCHOLOGY AUDIT</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">BEHAVIORAL COACHING</span>
          </div>
          <h1 className="mt-2 text-2xl font-black text-white">Trading Journal & Performance Analytics</h1>
          <p className="mt-1 text-xs text-slate-400">
            Log trade emotions, avoid FOMO & revenge trading biases, and refine systematic discipline.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          <span>Log Journal Trade</span>
        </button>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        <div className="rounded-xl border border-slate-800 bg-[#131B2E] p-4 text-center">
          <span className="text-slate-400 text-[10px] uppercase font-sans block">Journal Win Rate</span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">{winRate}%</span>
          <span className="text-slate-500 text-[10px] font-sans">
            {winCount} Wins / {closedTrades.length - winCount} Losses
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#131B2E] p-4 text-center">
          <span className="text-slate-400 text-[10px] uppercase font-sans block">Total Realized Net P/L</span>
          <span
            className={`text-2xl font-black mt-1 block ${
              totalPL >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {totalPL >= 0 ? "+" : ""}NPR {totalPL.toLocaleString()}
          </span>
          <span className="text-slate-500 text-[10px] font-sans">Across closed executions</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#131B2E] p-4 text-center">
          <span className="text-slate-400 text-[10px] uppercase font-sans block">AI Behavioral Diagnosis</span>
          <span className="text-sm font-bold text-amber-400 mt-2 block font-sans">
            FOMO Risk on Rapid Gap-Ups
          </span>
          <span className="text-slate-400 text-[10px] font-sans">
            Loss on UPPER traced to emotional chase.
          </span>
        </div>
      </div>

      {/* Journal Entries List */}
      <div className="space-y-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="rounded-2xl border border-slate-800 bg-[#131B2E] p-5 shadow-lg space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-400 border border-blue-500/30">
                  {entry.symbol}
                </span>
                <span className="text-xs font-semibold text-white">{entry.strategy}</span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    entry.emotionAtEntry === "Disciplined"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/20 text-rose-400"
                  }`}
                >
                  Emotion: {entry.emotionAtEntry}
                </span>
              </div>

              <div className="font-mono text-xs">
                {entry.isClosed && entry.pl !== undefined ? (
                  <span
                    className={`font-bold ${entry.pl >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                  >
                    {entry.pl >= 0 ? "+" : ""}NPR {entry.pl.toLocaleString()} ({entry.plPercent}%)
                  </span>
                ) : (
                  <span className="text-blue-400 font-bold">ACTIVE POSITION</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono text-slate-300">
              <div>
                <span className="text-[10px] text-slate-500 font-sans block">Entry Date & Price</span>
                <span>{entry.entryDate} @ NPR {entry.entryPrice}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-sans block">Quantity</span>
                <span>{entry.quantity} Units</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-sans block">Exit Details</span>
                <span>{entry.exitDate ? `${entry.exitDate} @ NPR ${entry.exitPrice}` : "Holding"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-sans block">Confidence</span>
                <span>{"★".repeat(entry.confidenceRating)}{"☆".repeat(5 - entry.confidenceRating)}</span>
              </div>
            </div>

            {entry.lessonsLearned && (
              <div className="rounded-xl bg-slate-900/60 p-3 text-xs text-slate-300 flex items-start space-x-2">
                <BrainCircuit className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">Post-Trade Review & Lessons: </strong>
                  {entry.lessonsLearned}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Journal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#131B2E] p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h2 className="text-sm font-bold text-white">Log Trading Journal Entry</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEntry} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Symbol</label>
                  <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Date</label>
                  <input
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Entry Price (NPR)</label>
                  <input
                    type="number"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Units</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Strategy Used</label>
                <input
                  type="text"
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Emotional State</label>
                  <select
                    value={emotion}
                    onChange={(e) => setEmotion(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
                  >
                    <option value="Disciplined">Disciplined</option>
                    <option value="FOMO">FOMO / Chasing</option>
                    <option value="Excited">Excited</option>
                    <option value="Anxious">Anxious</option>
                    <option value="Revenge">Revenge Trading</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Confidence (1 to 5)</label>
                  <select
                    value={confidence}
                    onChange={(e) => setConfidence(parseInt(e.target.value))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white font-mono"
                  >
                    <option value="5">5 - Maximum</option>
                    <option value="4">4 - High</option>
                    <option value="3">3 - Moderate</option>
                    <option value="2">2 - Low</option>
                    <option value="1">1 - Speculative</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Key Lessons & Trade Review</label>
                <textarea
                  rows={2}
                  value={lessons}
                  onChange={(e) => setLessons(e.target.value)}
                  placeholder="What worked? What rule was followed or broken?"
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
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
