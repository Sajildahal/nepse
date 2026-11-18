"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Calculator,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Sliders,
  DollarSign,
  PieChart,
  FileSpreadsheet,
} from "lucide-react";
import { Holding, PortfolioSummary, Transaction, TransactionType } from "@/types";
import { calculateBuy, calculateSell, DEFAULT_FEE_SCHEDULE } from "@/lib/financial/nepseFeeEngine";
import { INITIAL_MARKET_PRICES } from "@/lib/market/nepseData";
import { CSVImportModal } from "@/components/modals/CSVImportModal";

interface PortfolioViewProps {
  holdings: Holding[];
  summary: PortfolioSummary;
  transactions: Transaction[];
  onAddTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onSelectStock: (symbol: string) => void;
  onOpenAveragingModal: (holding: Holding) => void;
}

export function PortfolioView({
  holdings,
  summary,
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  onSelectStock,
  onOpenAveragingModal,
}: PortfolioViewProps) {
  const [activeTab, setActiveTab] = useState<"holdings" | "transactions">("holdings");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [accountingMethod, setAccountingMethod] = useState<"WACC" | "FIFO">("WACC");

  // Add Transaction Form State
  const [txSymbol, setTxSymbol] = useState("NABIL");
  const [txType, setTxType] = useState<TransactionType>("BUY");
  const [txDate, setTxDate] = useState(new Date().toISOString().split("T")[0]);
  const [txQuantity, setTxQuantity] = useState("100");
  const [txPrice, setTxPrice] = useState("524");
  const [txNotes, setTxNotes] = useState("");

  const qtyNum = parseFloat(txQuantity) || 0;
  const priceNum = parseFloat(txPrice) || 0;

  // Real-time calculation preview
  const buyPreview =
    txType === "BUY" || txType === "IPO" || txType === "RIGHTS"
      ? calculateBuy(txSymbol, qtyNum, priceNum, DEFAULT_FEE_SCHEDULE)
      : null;

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (qtyNum <= 0 || priceNum <= 0) return;

    let gross = qtyNum * priceNum;
    let broker = 0;
    let sebon = 0;
    let dp = 0;
    let net = gross;

    if (txType === "BUY") {
      const calc = calculateBuy(txSymbol, qtyNum, priceNum, DEFAULT_FEE_SCHEDULE);
      broker = calc.brokerCommission;
      sebon = calc.sebonFee;
      dp = calc.dpFee;
      net = calc.totalPayable;
    } else if (txType === "SELL") {
      const calc = calculateSell(txSymbol, qtyNum, priceNum, priceNum * 0.9, 120, true, DEFAULT_FEE_SCHEDULE);
      broker = calc.brokerCommission;
      sebon = calc.sebonFee;
      dp = calc.dpFee;
      net = calc.netReceivable;
    }

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      portfolioId: "default",
      symbol: txSymbol.toUpperCase(),
      companyName: INITIAL_MARKET_PRICES.find((m) => m.symbol === txSymbol.toUpperCase())?.name || txSymbol,
      type: txType,
      date: txDate,
      quantity: qtyNum,
      price: priceNum,
      grossAmount: gross,
      brokerCommission: broker,
      sebonFee: sebon,
      dpFee: dp,
      totalCharges: broker + sebon + dp,
      netAmount: net,
      notes: txNotes,
      createdAt: new Date().toISOString(),
    };

    onAddTransaction(newTx);
    setShowAddModal(false);
    setTxNotes("");
  };

  const handleExportCSV = () => {
    const headers = "ID,Symbol,Company,Type,Date,Quantity,Price,Gross,Broker,SEBON,DP,Net,Notes\n";
    const rows = transactions
      .map(
        (t) =>
          `"${t.id}","${t.symbol}","${t.companyName}","${t.type}","${t.date}",${t.quantity},${t.price},${t.grossAmount},${t.brokerCommission},${t.sebonFee},${t.dpFee},${t.netAmount},"${t.notes || ""}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `NEPSE_Portfolio_Ledger_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Portfolio Summary */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Institutional Portfolio Ledger</h1>
          <p className="text-xs text-slate-400">
            Realized & unrealized gains, WACC accounting, dividend audit, and break-even analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Accounting Method Toggle */}
          <div className="flex items-center rounded-lg border border-slate-700 bg-slate-900 p-0.5 text-xs font-semibold">
            <button
              onClick={() => setAccountingMethod("WACC")}
              className={`rounded-md px-3 py-1.5 transition-all ${
                accountingMethod === "WACC"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              WACC Method
            </button>
            <button
              onClick={() => setAccountingMethod("FIFO")}
              className={`rounded-md px-3 py-1.5 transition-all ${
                accountingMethod === "FIFO"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              FIFO Method
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-750"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-750"
          >
            <Upload className="h-3.5 w-3.5 text-emerald-400" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-[#131B2E] p-4">
          <span className="text-xs text-slate-400">Total Invested (Cost Basis)</span>
          <p className="mt-1 text-lg font-bold font-mono text-white">
            NPR {summary.totalInvested.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500 font-mono">
            Charges included: NPR {summary.totalExpenses.toLocaleString()}
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#131B2E] p-4">
          <span className="text-xs text-slate-400">Current Market Valuation</span>
          <p className="mt-1 text-lg font-bold font-mono text-white">
            NPR {summary.currentMarketValue.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-400 font-mono">
            Active Holdings: {summary.holdingsCount}
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#131B2E] p-4">
          <span className="text-xs text-slate-400">Unrealized Profit / Loss</span>
          <p
            className={`mt-1 text-lg font-bold font-mono ${
              summary.unrealizedPL >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {summary.unrealizedPL >= 0 ? "+" : ""}NPR {summary.unrealizedPL.toLocaleString()}
          </p>
          <span
            className={`text-[10px] font-bold ${
              summary.unrealizedPLPercent >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {summary.unrealizedPLPercent >= 0 ? "+" : ""}
            {summary.unrealizedPLPercent}% Return
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#131B2E] p-4">
          <span className="text-xs text-slate-400">Net Realized Capital Gains</span>
          <p className="mt-1 text-lg font-bold font-mono text-amber-400">
            NPR {summary.realizedPL.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400">
            Cash: NPR {summary.cashBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab("holdings")}
          className={`border-b-2 py-2.5 px-4 text-xs font-bold transition-all ${
            activeTab === "holdings"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Active Holdings ({holdings.length})
        </button>
        <button
          onClick={() => setActiveTab("transactions")}
          className={`border-b-2 py-2.5 px-4 text-xs font-bold transition-all ${
            activeTab === "transactions"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Transaction History ({transactions.length})
        </button>
      </div>

      {/* Tab 1: Active Holdings */}
      {activeTab === "holdings" && (
        <div className="rounded-xl border border-slate-800 bg-[#131B2E] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-slate-800 bg-slate-900/80 font-sans text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Stock</th>
                  <th className="py-3 px-4 font-semibold text-right">Units</th>
                  <th className="py-3 px-4 font-semibold text-right">WACC</th>
                  <th className="py-3 px-4 font-semibold text-right">LTP</th>
                  <th className="py-3 px-4 font-semibold text-right">Invested</th>
                  <th className="py-3 px-4 font-semibold text-right">Market Val</th>
                  <th className="py-3 px-4 font-semibold text-right">Unrealized P/L</th>
                  <th className="py-3 px-4 font-semibold text-right">Break-Even</th>
                  <th className="py-3 px-4 font-semibold font-sans">Action</th>
                  <th className="py-3 px-4 font-semibold font-sans text-center">Averaging</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {holdings.map((h) => (
                  <tr
                    key={h.symbol}
                    className="hover:bg-slate-850/50 transition-colors"
                  >
                    <td
                      onClick={() => onSelectStock(h.symbol)}
                      className="py-3 px-4 font-sans cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white rounded bg-blue-500/10 px-1.5 py-0.5 text-blue-400 border border-blue-500/20">
                          {h.symbol}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                          {h.companyName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-right">{h.quantity.toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-300 text-right">NPR {h.wacc.toFixed(2)}</td>
                    <td className="py-3 px-4 font-bold text-white text-right">NPR {h.currentLtp}</td>
                    <td className="py-3 px-4 text-slate-300 text-right">
                      NPR {h.totalInvested.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white text-right">
                      NPR {h.currentMarketValue.toLocaleString()}
                    </td>
                    <td
                      className={`py-3 px-4 font-bold text-right ${
                        h.unrealizedPL >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {h.unrealizedPL >= 0 ? "+" : ""}
                      {h.unrealizedPL.toLocaleString()} ({h.unrealizedPLPercent}%)
                    </td>
                    <td className="py-3 px-4 text-amber-300 text-right">
                      NPR {h.breakEvenPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          h.aiSuggestedAction === "STRONG_BUY" || h.aiSuggestedAction === "BUY"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : h.aiSuggestedAction === "AVERAGE_DOWN"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {h.aiSuggestedAction}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onOpenAveragingModal(h)}
                        className="rounded bg-slate-800 px-2 py-1 text-[11px] font-semibold text-blue-400 hover:bg-slate-700 hover:text-white transition-colors"
                      >
                        Assistant
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Transaction History Ledger */}
      {activeTab === "transactions" && (
        <div className="rounded-xl border border-slate-800 bg-[#131B2E] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-slate-800 bg-slate-900/80 font-sans text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Symbol</th>
                  <th className="py-3 px-4 font-semibold text-right">Units</th>
                  <th className="py-3 px-4 font-semibold text-right">Price</th>
                  <th className="py-3 px-4 font-semibold text-right">Gross</th>
                  <th className="py-3 px-4 font-semibold text-right">Broker + SEBON</th>
                  <th className="py-3 px-4 font-semibold text-right">DP Fee</th>
                  <th className="py-3 px-4 font-semibold text-right">Net Amount</th>
                  <th className="py-3 px-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 text-slate-400">{tx.date}</td>
                    <td className="py-3 px-4 font-sans">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          tx.type === "BUY" || tx.type === "IPO" || tx.type === "RIGHTS"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : tx.type === "SELL"
                            ? "bg-rose-500/20 text-rose-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">{tx.symbol}</td>
                    <td className="py-3 px-4 text-slate-300 text-right">{tx.quantity}</td>
                    <td className="py-3 px-4 text-slate-300 text-right">NPR {tx.price}</td>
                    <td className="py-3 px-4 text-slate-400 text-right">NPR {tx.grossAmount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-400 text-right">
                      NPR {(tx.brokerCommission + tx.sebonFee).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-right">NPR {tx.dpFee}</td>
                    <td className="py-3 px-4 font-bold text-white text-right">
                      NPR {tx.netAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          if (confirm(`Delete transaction for ${tx.symbol} (${tx.type})?`)) {
                            onDeleteTransaction(tx.id);
                          }
                        }}
                        className="rounded p-1 text-slate-500 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#131B2E] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Record Portfolio Transaction</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400">Stock Symbol</label>
                  <select
                    value={txSymbol}
                    onChange={(e) => {
                      setTxSymbol(e.target.value);
                      const p = INITIAL_MARKET_PRICES.find((m) => m.symbol === e.target.value);
                      if (p) setTxPrice(p.ltp.toString());
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
                  >
                    {INITIAL_MARKET_PRICES.map((m) => (
                      <option key={m.symbol} value={m.symbol}>
                        {m.symbol} - {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400">Transaction Type</label>
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as TransactionType)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
                  >
                    <option value="BUY">Secondary BUY</option>
                    <option value="SELL">Secondary SELL</option>
                    <option value="IPO">IPO Allocation</option>
                    <option value="RIGHTS">Rights Offering</option>
                    <option value="BONUS">Bonus Shares</option>
                    <option value="DIVIDEND">Cash Dividend</option>
                    <option value="AUCTION">Auction Shares</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400">Date</label>
                  <input
                    type="date"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Quantity (Units)</label>
                  <input
                    type="number"
                    min="1"
                    value={txQuantity}
                    onChange={(e) => setTxQuantity(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Price Per Share (NPR)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={txPrice}
                    onChange={(e) => setTxPrice(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              {/* Instant Fee Calculation Preview */}
              {buyPreview && txType === "BUY" && (
                <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 font-mono text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Gross Turnover:</span>
                    <span>NPR {buyPreview.grossAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Broker Commission ({(buyPreview.brokerCommissionRate * 100).toFixed(2)}%):</span>
                    <span>NPR {buyPreview.brokerCommission}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>SEBON Fee (0.015%):</span>
                    <span>NPR {buyPreview.sebonFee}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>CDSC DP Fee:</span>
                    <span>NPR {buyPreview.dpFee}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800 pt-1 font-bold text-emerald-400">
                    <span>Total Payable:</span>
                    <span>NPR {buyPreview.totalPayable.toLocaleString()}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Effective Cost / Share: NPR {buyPreview.effectiveCostPerShare}
                  </div>
                </div>
              )}

              <div>
                <label className="text-slate-400">Notes / Trading Thesis</label>
                <input
                  type="text"
                  placeholder="e.g. 50-SMA bounce, strong quarterly earnings"
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-500 shadow-md shadow-blue-600/30"
                >
                  Confirm & Audit Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={(importedList) => {
          importedList.forEach((t) => onAddTransaction(t));
        }}
      />
    </div>
  );
}
