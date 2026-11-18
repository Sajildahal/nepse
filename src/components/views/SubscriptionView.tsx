"use client";

import React, { useState } from "react";
import {
  CreditCard,
  CheckCircle2,
  Zap,
  Shield,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export function SubscriptionView() {
  const [selectedPlan, setSelectedPlan] = useState<string>("pro");
  const [paymentProvider, setPaymentProvider] = useState<"esewa" | "khalti" | "connectips">("esewa");
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const plans = [
    {
      id: "free",
      name: "Free Investor",
      priceNpr: "0",
      period: "Forever Free",
      description: "Essential portfolio ledger and daily closing market data.",
      features: [
        "1 Personal Portfolio",
        "EOD Delayed Market Data",
        "Standard NEPSE Fee Calculator",
        "Basic Financial News Feed",
        "Up to 20 Transactions History",
      ],
      cta: "Current Active Tier",
      badge: "STARTER",
    },
    {
      id: "pro",
      name: "Pro Quantitative Trader",
      priceNpr: "1,499",
      period: "per month",
      description: "Full AI recommendation engine, 9x scanners, and real-time alerts.",
      features: [
        "Unlimited Custom Portfolios",
        "Real-Time Verified NEPSE Stream",
        "9x Advanced Quantitative Scanners",
        "AI Stock Recommendations & Averaging Assistant",
        "Complete Trading Journal & Behavioral Analytics",
        "Multi-Timeframe TradingView Charting",
        "Priority Customer Support",
      ],
      cta: "Upgrade to Pro",
      badge: "MOST POPULAR",
      popular: true,
    },
    {
      id: "premium",
      name: "Institutional Alpha",
      priceNpr: "3,999",
      period: "per month",
      description: "Advanced order book analysis, institutional block trade detection, and API keys.",
      features: [
        "Everything in Pro Tier",
        "Institutional Block Transaction Detector",
        "Monte Carlo Risk & CVaR Optimization",
        "Personalized Daily AI Research Reports",
        "REST API & WebSocket Access Key",
        "Custom Machine Learning Factor Weights",
      ],
      cta: "Contact Enterprise",
      badge: "INSTITUTIONAL",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-6 text-center max-w-2xl mx-auto shadow-xl">
        <span className="inline-flex items-center space-x-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-400 border border-blue-500/30">
          <Sparkles className="h-3.5 w-3.5" />
          <span>NEPSE INTELLIGENCE AI COMMERCIAL SUITE</span>
        </span>
        <h1 className="mt-3 text-3xl font-black text-white">Choose Your Edge in NEPSE</h1>
        <p className="mt-1.5 text-xs text-slate-400">
          Equip yourself with institutional-grade quantitative models, AI risk calibration, and Nepal regulatory fee optimization.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`rounded-2xl p-6 transition-all flex flex-col justify-between ${
              p.popular
                ? "border-2 border-blue-500 bg-gradient-to-b from-blue-950/40 via-slate-900 to-[#131B2E] shadow-2xl relative"
                : "border border-slate-800 bg-[#131B2E]"
            }`}
          >
            {p.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                {p.badge}
              </span>
            )}

            <div>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">{p.name}</h2>
                {!p.popular && (
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                    {p.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">{p.description}</p>

              <div className="mt-4 font-mono">
                <span className="text-2xl font-black text-white">NPR {p.priceNpr}</span>
                <span className="text-slate-400 text-xs ml-1 font-sans">{p.period}</span>
              </div>

              <div className="mt-6 space-y-2.5 text-xs border-t border-slate-800/80 pt-4">
                {p.features.map((feat, i) => (
                  <div key={i} className="flex items-start space-x-2 text-slate-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  setSelectedPlan(p.id);
                  if (p.id !== "free") setCheckoutSuccess(true);
                }}
                className={`w-full rounded-xl py-2.5 text-xs font-bold transition-all ${
                  p.popular
                    ? "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30"
                    : "border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-750"
                }`}
              >
                {p.cta}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Nepal Payment Gateways Section */}
      <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-6 text-xs space-y-4">
        <h3 className="font-bold text-white text-sm">Supported Nepal Payment Gateways</h3>
        <p className="text-slate-400">
          Instant subscription activation via authorized Nepal payment settlement partners.
        </p>

        <div className="flex flex-wrap gap-4 pt-1">
          <div
            onClick={() => setPaymentProvider("esewa")}
            className={`flex items-center space-x-2.5 rounded-xl border p-3 cursor-pointer transition-all ${
              paymentProvider === "esewa"
                ? "border-emerald-500 bg-emerald-500/10 text-white font-bold"
                : "border-slate-800 bg-slate-900 text-slate-400"
            }`}
          >
            <span className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-black text-black">
              e
            </span>
            <span>eSewa Digital Wallet</span>
          </div>

          <div
            onClick={() => setPaymentProvider("khalti")}
            className={`flex items-center space-x-2.5 rounded-xl border p-3 cursor-pointer transition-all ${
              paymentProvider === "khalti"
                ? "border-purple-500 bg-purple-500/10 text-white font-bold"
                : "border-slate-800 bg-slate-900 text-slate-400"
            }`}
          >
            <span className="h-4 w-4 rounded-full bg-purple-500 flex items-center justify-center text-[10px] font-black text-white">
              K
            </span>
            <span>Khalti Payment Gateway</span>
          </div>

          <div
            onClick={() => setPaymentProvider("connectips")}
            className={`flex items-center space-x-2.5 rounded-xl border p-3 cursor-pointer transition-all ${
              paymentProvider === "connectips"
                ? "border-blue-500 bg-blue-500/10 text-white font-bold"
                : "border-slate-800 bg-slate-900 text-slate-400"
            }`}
          >
            <span className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-black text-white">
              C
            </span>
            <span>ConnectIPS (NCHL Bank Transfer)</span>
          </div>
        </div>

        {checkoutSuccess && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300 font-semibold flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>
              Mock Payment Gateway triggered for {paymentProvider.toUpperCase()}. Subscription upgraded to PRO tier!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
