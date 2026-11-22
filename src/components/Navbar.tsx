"use client";

import React, { useEffect, useState } from "react";
import {
  Bell,
  Search,
  Activity,
  Shield,
  TrendingUp,
  Clock,
  Layers,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { INITIAL_INDICES } from "@/lib/market/nepseData";

interface NavbarProps {
  onSearchSelect?: (symbol: string) => void;
  onOpenNotifications?: () => void;
  activePortfolioName: string;
  theme?: "dark" | "light";
  onToggleTheme?: () => void;
}

export function Navbar({
  onSearchSelect,
  onOpenNotifications,
  activePortfolioName,
  theme = "dark",
  onToggleTheme,
}: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [ticker, setTicker] = useState<{
    marketOpen: boolean | null;
    nepseIndex: number;
    sensitiveIndex: number;
    totalTurnover: number;
    asOf: string | null;
  }>({
    marketOpen: null,
    nepseIndex: INITIAL_INDICES[0].current,
    sensitiveIndex: INITIAL_INDICES[1].current,
    totalTurnover: 0,
    asOf: null,
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/market/ticker", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const nepse = (data.indices || []).find((i: any) => i.name === "NEPSE Index");
        const sensitive = (data.indices || []).find((i: any) => i.name === "Sensitive Index");
        setTicker({
          marketOpen: Boolean(data.marketOpen),
          nepseIndex: Number(nepse?.current ?? ticker.nepseIndex),
          sensitiveIndex: Number(sensitive?.current ?? ticker.sensitiveIndex),
          totalTurnover: Number(data.totalTurnover ?? 0),
          asOf: data.asOf ?? null,
        });
      } catch {
        // leave as-is
      }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#0F172A]/95 backdrop-blur-md">
      {/* Top Real-time Ticker Ribbon */}
      <div className="flex h-7 items-center justify-between overflow-x-auto border-b border-slate-850 px-4 text-xs font-mono text-slate-300 bg-[#0B0F19]">
        <div className="flex items-center space-x-6 min-w-max">
          <div className="flex items-center space-x-2">
            <span
              className={`inline-block h-2 w-2 rounded-full animate-ping ${
                ticker.marketOpen === null
                  ? "bg-slate-500"
                  : ticker.marketOpen
                  ? "bg-emerald-500"
                  : "bg-rose-500"
              }`}
            ></span>
            <span className="text-slate-400 font-sans">MARKET STATUS:</span>
            <span
              className={`font-semibold ${
                ticker.marketOpen === null
                  ? "text-slate-400"
                  : ticker.marketOpen
                  ? "text-emerald-400"
                  : "text-rose-400"
              }`}
            >
              {ticker.marketOpen === null ? "CHECKING..." : ticker.marketOpen ? "MARKET OPEN" : "MARKET CLOSED"}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400">NEPSE:</span>
            <span className="font-bold text-white">{ticker.nepseIndex.toLocaleString()}</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400">SENSITIVE:</span>
            <span className="font-bold text-white">{ticker.sensitiveIndex.toLocaleString()}</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400">TOTAL TURNOVER:</span>
            <span className="font-bold text-amber-400">
              NPR {(ticker.totalTurnover / 1e9).toFixed(2)} Arba
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-slate-400 font-sans">
          <Clock className="h-3 w-3 text-slate-500" />
          <span>AS OF: {ticker.asOf ? new Date(ticker.asOf).toLocaleString() : "—"}</span>
        </div>
      </div>

      {/* Main App Navigation Bar */}
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/25">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black tracking-tight text-white">NEPSE</span>
                <span className="rounded-md bg-blue-500/20 px-1.5 py-0.5 text-[11px] font-bold text-blue-400 border border-blue-500/30">
                  INTELLIGENCE AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                Institutional Quant & Portfolio Ecosystem
              </p>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-80 max-w-md hidden md:block">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search stock symbol (e.g. NABIL, CHCL, HRL)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery && onSearchSelect) {
                onSearchSelect(searchQuery.toUpperCase());
                setSearchQuery("");
              }
            }}
            className="w-full rounded-lg border border-slate-700 bg-slate-900/80 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-400 transition-all focus:border-blue-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* User & Portfolio Status */}
        <div className="flex items-center space-x-3">
          {/* Active Portfolio Badge */}
          <div className="flex items-center space-x-2 rounded-lg border border-slate-750 bg-slate-850/60 px-3 py-1.5 text-xs text-slate-300">
            <Layers className="h-3.5 w-3.5 text-blue-400" />
            <span className="font-medium text-white">{activePortfolioName}</span>
          </div>

          {/* Theme Toggle (Dark / Light) */}
          <button
            onClick={onToggleTheme}
            title="Toggle Dark / Light Theme"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors border border-slate-800"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-blue-400" />
            )}
          </button>

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors border border-slate-800"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/40 text-xs font-bold">
              SS
            </div>
            <div className="hidden lg:block text-left text-xs">
              <p className="font-semibold text-slate-200">Siddhartha S.</p>
              <p className="text-[10px] text-emerald-400 font-mono">PRO SUBSCRIBER</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
