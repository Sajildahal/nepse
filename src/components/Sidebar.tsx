"use client";

import React from "react";
import {
  LayoutDashboard,
  TrendingUp,
  Briefcase,
  Bot,
  LineChart,
  Crosshair,
  Building2,
  Gauge,
  Newspaper,
  Filter,
  BookOpen,
  Calculator,
  ShieldCheck,
  CreditCard,
  Bookmark,
  ShieldAlert,
  BrainCircuit,
} from "lucide-react";

export type TabKey =
  | "dashboard"
  | "live-market"
  | "portfolio"
  | "ai-intelligence"
  | "technical"
  | "tools"
  | "fundamentals"
  | "backtesting"
  | "risk"
  | "watchlist"
  | "sentiment"
  | "news"
  | "screener"
  | "journal"
  | "calculator"
  | "admin"
  | "subscription";

interface SidebarProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}

export function Sidebar({ currentTab, onSelectTab }: SidebarProps) {
  const menuGroups = [
    {
      group: "PORTFOLIO & CORE",
      items: [
        { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { key: "live-market", label: "Live Market", icon: TrendingUp },
        { key: "portfolio", label: "My Portfolio", icon: Briefcase, badge: "CRUD" },
        { key: "watchlist", label: "Watchlist & Alerts", icon: Bookmark },
        { key: "risk", label: "Risk & Stress Test", icon: ShieldAlert },
        { key: "calculator", label: "Share Calculator", icon: Calculator },
      ],
    },
    {
      group: "INTELLIGENCE & QUANT",
      items: [
        { key: "ai-intelligence", label: "AI Intelligence", icon: Bot, badge: "v3.4" },
        { key: "tools", label: "Trading Scanners (9x)", icon: Crosshair },
        { key: "backtesting", label: "Strategy Backtesting", icon: BrainCircuit, badge: "Sim" },
        { key: "technical", label: "Technical Analysis", icon: LineChart },
        { key: "fundamentals", label: "Fundamental Analysis", icon: Building2 },
      ],
    },
    {
      group: "MARKET DYNAMICS",
      items: [
        { key: "sentiment", label: "Market Sentiment", icon: Gauge },
        { key: "news", label: "Financial News", icon: Newspaper },
        { key: "screener", label: "Stock Screener", icon: Filter },
        { key: "journal", label: "Trading Journal", icon: BookOpen },
      ],
    },
    {
      group: "ENTERPRISE",
      items: [
        { key: "admin", label: "Admin Master Control", icon: ShieldCheck, badge: "Master" },
        { key: "subscription", label: "Subscription Plans", icon: CreditCard },
      ],
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-800 bg-[#0F172A] p-4 flex flex-col justify-between overflow-y-auto">
      <div className="space-y-5">
        {menuGroups.map((group, idx) => (
          <div key={idx}>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              {group.group}
            </p>
            <nav className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => onSelectTab(item.key as TabKey)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      isActive
                        ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold shadow-sm"
                        : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon
                        className={`h-4 w-4 ${
                          isActive ? "text-blue-400" : "text-slate-400"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          item.badge === "Master"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : item.badge === "Sim"
                            ? "bg-purple-500/20 text-purple-300"
                            : "bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer Info Box */}
      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-300">Nepal Regulatory Compliance</span>
          <span className="text-[10px] text-emerald-400 font-mono">SEBON 0.015%</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">
          Broker commission slabs & CGT audited per FY 2081/82 tax circulars.
        </p>
      </div>
    </aside>
  );
}
