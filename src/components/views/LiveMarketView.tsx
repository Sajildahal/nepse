"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
  LayoutGrid,
  Table as TableIcon,
} from "lucide-react";
import { NEPSE_SECTORS } from "@/lib/market/nepseData";
import { MarketPrice, Sector } from "@/types";
import { MarketHeatmap } from "@/components/widgets/MarketHeatmap";
import { useMarketPrices } from "@/hooks/useMarketPrices";

interface LiveMarketViewProps {
  onSelectStock: (symbol: string) => void;
}

export function LiveMarketView({ onSelectStock }: LiveMarketViewProps) {
  const [viewMode, setViewMode] = useState<"table" | "heatmap">("table");
  const [search, setSearch] = useState("");
  const [selectedSector, setSelectedSector] = useState<string>("ALL");
  const [sortField, setSortField] = useState<keyof MarketPrice>("turnover");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const { stocks: liveStocks, loading } = useMarketPrices();

  const handleSort = (field: keyof MarketPrice) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const filteredStocks = useMemo(() => {
    return liveStocks.filter((stock) => {
      const matchesSearch =
        stock.symbol.toLowerCase().includes(search.toLowerCase()) ||
        stock.name.toLowerCase().includes(search.toLowerCase());
      const matchesSector =
        selectedSector === "ALL" || stock.sector === selectedSector;
      return matchesSearch && matchesSector;
    }).sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [liveStocks, search, selectedSector, sortField, sortDirection]);

  return (
    <div className="space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-white">Live NEPSE Market Table & Heatmap</h1>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
              LIVE STREAM
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time equity quotes with verified turnover, volume, and sector classifications.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-slate-700 bg-slate-900 p-0.5 text-xs font-semibold">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center space-x-1.5 rounded-md px-3 py-1.5 transition-all ${
                viewMode === "table" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode("heatmap")}
              className={`flex items-center space-x-1.5 rounded-md px-3 py-1.5 transition-all ${
                viewMode === "heatmap" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Heatmap</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search symbol..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/90 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {loading && liveStocks.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-[#131B2E] p-8 text-center text-slate-400">
          Loading live market data…
        </div>
      ) : viewMode === "heatmap" ? (
        <MarketHeatmap onSelectStock={onSelectStock} stocks={liveStocks} />
      ) : (
        <>
          {/* Sector Filter Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedSector("ALL")}
              className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                selectedSector === "ALL"
                  ? "bg-blue-600 text-white font-bold"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              All Sectors ({liveStocks.length})
            </button>
            {NEPSE_SECTORS.map((sector) => {
              const count = liveStocks.filter((s) => s.sector === sector).length;
              if (count === 0) return null;
              return (
                <button
                  key={sector}
                  onClick={() => setSelectedSector(sector)}
                  className={`rounded-lg px-3 py-1.5 font-medium whitespace-nowrap transition-all ${
                    selectedSector === sector
                      ? "bg-blue-600 text-white font-bold"
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {sector} ({count})
                </button>
              );
            })}
          </div>

          {/* Complete Market Data Table */}
          <div className="rounded-xl border border-slate-800 bg-[#131B2E] overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-slate-800 bg-slate-900/80 font-sans text-[11px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th
                      onClick={() => handleSort("symbol")}
                      className="py-3 px-4 font-semibold cursor-pointer hover:text-white"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Symbol</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4 font-semibold font-sans">Company</th>
                    <th
                      onClick={() => handleSort("ltp")}
                      className="py-3 px-4 font-semibold cursor-pointer hover:text-white text-right"
                    >
                      <div className="flex items-center justify-end space-x-1">
                        <span>LTP</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("changePercent")}
                      className="py-3 px-4 font-semibold cursor-pointer hover:text-white text-right"
                    >
                      <div className="flex items-center justify-end space-x-1">
                        <span>Change %</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4 font-semibold text-right">Open</th>
                    <th className="py-3 px-4 font-semibold text-right">High</th>
                    <th className="py-3 px-4 font-semibold text-right">Low</th>
                    <th className="py-3 px-4 font-semibold text-right">Prev Close</th>
                    <th
                      onClick={() => handleSort("volume")}
                      className="py-3 px-4 font-semibold cursor-pointer hover:text-white text-right"
                    >
                      <div className="flex items-center justify-end space-x-1">
                        <span>Volume</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("turnover")}
                      className="py-3 px-4 font-semibold cursor-pointer hover:text-white text-right"
                    >
                      <div className="flex items-center justify-end space-x-1">
                        <span>Turnover (NPR)</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="py-3 px-4 font-semibold text-right">Trades</th>
                    <th className="py-3 px-4 font-semibold text-right">52W H / L</th>
                    <th className="py-3 px-4 font-semibold font-sans">Sector</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredStocks.map((s) => (
                    <tr
                      key={s.symbol}
                      onClick={() => onSelectStock(s.symbol)}
                      className="hover:bg-slate-850/60 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-white font-sans">
                        <span className="rounded bg-blue-500/15 px-2 py-0.5 text-blue-400 border border-blue-500/25">
                          {s.symbol}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-300 font-sans truncate max-w-[150px]">
                        {s.name}
                      </td>
                      <td className="py-3 px-4 font-bold text-white text-right">
                        NPR {s.ltp.toFixed(1)}
                      </td>
                      <td
                        className={`py-3 px-4 font-bold text-right ${
                          s.change >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {s.change >= 0 ? "+" : ""}
                        {s.change} ({s.changePercent}%)
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-right">{s.open}</td>
                      <td className="py-3 px-4 text-emerald-400 text-right">{s.high}</td>
                      <td className="py-3 px-4 text-rose-400 text-right">{s.low}</td>
                      <td className="py-3 px-4 text-slate-400 text-right">{s.previousClose}</td>
                      <td className="py-3 px-4 text-slate-300 text-right">
                        {s.volume.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-amber-300 text-right">
                        {(s.turnover / 10000000).toFixed(2)} Cr
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-right">{s.transactions}</td>
                      <td className="py-3 px-4 text-slate-300 text-right text-[11px]">
                        {s.high52} / {s.low52}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-sans text-[11px]">
                        {s.sector}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Data Quality Footer */}
            <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900/60 px-4 py-2.5 text-xs text-slate-400 font-sans">
              <span>Showing {filteredStocks.length} listed NEPSE equities</span>
              <span className="text-emerald-400 font-mono">
                Provider: NEPSE Official Data Gateway (Verified)
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
