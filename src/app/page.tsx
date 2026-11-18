"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar, TabKey } from "@/components/Sidebar";
import { DashboardView } from "@/components/views/DashboardView";
import { LiveMarketView } from "@/components/views/LiveMarketView";
import { PortfolioView } from "@/components/views/PortfolioView";
import { WatchlistView } from "@/components/views/WatchlistView";
import { RiskManagementView } from "@/components/views/RiskManagementView";
import { BacktestingView } from "@/components/views/BacktestingView";
import { AIIntelligenceView } from "@/components/views/AIIntelligenceView";
import { TechnicalAnalysisView } from "@/components/views/TechnicalAnalysisView";
import { TradingToolsView } from "@/components/views/TradingToolsView";
import { ShareCalculatorView } from "@/components/views/ShareCalculatorView";
import { FundamentalAnalysisView } from "@/components/views/FundamentalAnalysisView";
import { MarketSentimentView } from "@/components/views/MarketSentimentView";
import { FinancialNewsView } from "@/components/views/FinancialNewsView";
import { StockScreenerView } from "@/components/views/StockScreenerView";
import { TradingJournalView } from "@/components/views/TradingJournalView";
import { AdminDashboardView } from "@/components/views/AdminDashboardView";
import { SubscriptionView } from "@/components/views/SubscriptionView";
import { AveragingAssistantModal } from "@/components/modals/AveragingAssistantModal";
import { StockDetailModal } from "@/components/modals/StockDetailModal";
import {
  computePortfolioHoldings,
  getSeedTransactions,
} from "@/lib/portfolio/portfolioEngine";
import { INITIAL_MARKET_PRICES } from "@/lib/market/nepseData";
import { Holding, Transaction } from "@/types";

export default function Home() {
  const [currentTab, setCurrentTab] = useState<TabKey>("dashboard");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    getSeedTransactions()
  );
  const [accountingMethod, setAccountingMethod] = useState<"WACC" | "FIFO">("WACC");

  // Selected Stock for deep-dive
  const [inspectSymbol, setInspectSymbol] = useState<string | null>(null);
  const [averagingHolding, setAveragingHolding] = useState<Holding | null>(null);

  // Compute live portfolio state
  const { holdings, summary } = useMemo(() => {
    return computePortfolioHoldings(
      transactions,
      INITIAL_MARKET_PRICES,
      accountingMethod
    );
  }, [transactions, accountingMethod]);

  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSelectStock = (symbol: string) => {
    setInspectSymbol(symbol.toUpperCase());
  };

  const handleOpenAnalysis = (symbol: string) => {
    setCurrentTab("technical");
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, [theme]);

  return (
    <div
      className={`flex h-screen w-screen flex-col overflow-hidden transition-colors ${
        theme === "dark" ? "bg-[#0B0F19] text-slate-100" : "bg-slate-100 text-slate-900"
      }`}
    >
      {/* Top Navigation Bar */}
      <Navbar
        onSearchSelect={(sym) => {
          setInspectSymbol(sym);
        }}
        activePortfolioName={summary.portfolioName}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main App Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar currentTab={currentTab} onSelectTab={(tab) => setCurrentTab(tab)} />

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            {currentTab === "dashboard" && (
              <DashboardView
                summary={summary}
                holdings={holdings}
                onNavigate={(tab) => setCurrentTab(tab)}
                onSelectStock={handleSelectStock}
              />
            )}

            {currentTab === "live-market" && (
              <LiveMarketView onSelectStock={handleSelectStock} />
            )}

            {currentTab === "portfolio" && (
              <PortfolioView
                holdings={holdings}
                summary={summary}
                transactions={transactions}
                onAddTransaction={handleAddTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                onSelectStock={handleSelectStock}
                onOpenAveragingModal={(h) => setAveragingHolding(h)}
              />
            )}

            {currentTab === "watchlist" && (
              <WatchlistView onSelectStock={handleSelectStock} />
            )}

            {currentTab === "risk" && (
              <RiskManagementView holdings={holdings} summary={summary} />
            )}

            {currentTab === "backtesting" && <BacktestingView />}

            {currentTab === "ai-intelligence" && (
              <AIIntelligenceView
                holdings={holdings}
                onSelectStock={handleSelectStock}
              />
            )}

            {currentTab === "technical" && (
              <TechnicalAnalysisView
                initialSymbol={inspectSymbol || "NABIL"}
                onSelectStock={handleSelectStock}
              />
            )}

            {currentTab === "tools" && (
              <TradingToolsView onSelectStock={handleSelectStock} />
            )}

            {currentTab === "calculator" && <ShareCalculatorView />}

            {currentTab === "fundamentals" && (
              <FundamentalAnalysisView initialSymbol={inspectSymbol || "NABIL"} />
            )}

            {currentTab === "sentiment" && (
              <MarketSentimentView onSelectStock={handleSelectStock} />
            )}

            {currentTab === "news" && (
              <FinancialNewsView onSelectStock={handleSelectStock} />
            )}

            {currentTab === "screener" && (
              <StockScreenerView onSelectStock={handleSelectStock} />
            )}

            {currentTab === "journal" && <TradingJournalView />}

            {currentTab === "admin" && <AdminDashboardView />}

            {currentTab === "subscription" && <SubscriptionView />}
          </div>
        </main>
      </div>

      {/* Dynamic Modals */}
      <AveragingAssistantModal
        holding={averagingHolding}
        onClose={() => setAveragingHolding(null)}
      />

      <StockDetailModal
        symbol={inspectSymbol}
        onClose={() => setInspectSymbol(null)}
        onOpenAnalysis={handleOpenAnalysis}
      />
    </div>
  );
}
