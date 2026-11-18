"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Users,
  Server,
  Activity,
  DollarSign,
  Bot,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Database,
  Lock,
} from "lucide-react";
import {
  INITIAL_ADMIN_USERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_DATA_PROVIDERS,
  AdminUser,
  AuditLog,
} from "@/lib/admin/adminStore";
import { DEFAULT_FEE_SCHEDULE } from "@/lib/financial/nepseFeeEngine";

export function AdminDashboardView() {
  const [activeAdminTab, setActiveAdminTab] = useState<"telemetry" | "users" | "data-providers" | "fees" | "audit">("telemetry");
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_ADMIN_USERS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  return (
    <div className="space-y-6">
      {/* Admin Master Header */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/30 via-slate-900 to-[#131B2E] p-6 shadow-xl">
        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1.5 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/30">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
            <span>ENTERPRISE BACK-OFFICE MASTER CONTROL</span>
          </span>
          <span className="text-xs text-slate-400 font-mono">SUPER ADMINISTRATOR PRIVILEGES</span>
        </div>
        <h1 className="mt-2 text-2xl font-black text-white">Administration Master Console</h1>
        <p className="mt-1 text-xs text-slate-400">
          Role-based access management, live NEPSE market data feeds, regulatory fee schedules, and immutable audit logs.
        </p>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2 text-xs font-semibold">
        {[
          { key: "telemetry", label: "System Telemetry & Health", icon: Server },
          { key: "users", label: "User Management (RBAC)", icon: Users },
          { key: "data-providers", label: "Market Data Gateways", icon: Database },
          { key: "fees", label: "Regulatory Fee Schedules", icon: DollarSign },
          { key: "audit", label: "Immutable Audit Ledger", icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveAdminTab(tab.key as any)}
              className={`flex items-center space-x-1.5 rounded-xl px-4 py-2 transition-all ${
                isActive
                  ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Telemetry */}
      {activeAdminTab === "telemetry" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            <div className="rounded-xl border border-slate-800 bg-[#131B2E] p-4">
              <span className="text-slate-400 font-sans text-[11px] block">Server Uptime</span>
              <span className="text-xl font-bold text-emerald-400 mt-1 block">99.98%</span>
              <span className="text-slate-500 text-[10px] font-sans">0 downtime incidents</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#131B2E] p-4">
              <span className="text-slate-400 font-sans text-[11px] block">Active Terminal Sessions</span>
              <span className="text-xl font-bold text-blue-400 mt-1 block">342 Traders</span>
              <span className="text-slate-500 text-[10px] font-sans">Live WebSocket subscribers</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#131B2E] p-4">
              <span className="text-slate-400 font-sans text-[11px] block">Database Response Latency</span>
              <span className="text-xl font-bold text-white mt-1 block">2.4 ms</span>
              <span className="text-slate-500 text-[10px] font-sans">TimescaleDB index hit 99.4%</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#131B2E] p-4">
              <span className="text-slate-400 font-sans text-[11px] block">AI Ensemble Inference</span>
              <span className="text-xl font-bold text-purple-400 mt-1 block">145 ms</span>
              <span className="text-slate-500 text-[10px] font-sans">Model v3.4.1</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: User RBAC */}
      {activeAdminTab === "users" && (
        <div className="rounded-2xl border border-slate-800 bg-[#131B2E] overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-slate-800 bg-slate-900/80 font-sans text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">User</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Subscription Tier</th>
                  <th className="py-3 px-4 font-semibold">Account Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-850/50">
                    <td className="py-3 px-4">
                      <p className="font-bold text-white">{u.name}</p>
                      <p className="text-[11px] font-mono text-slate-400">{u.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-400 font-bold text-[11px] flex items-center space-x-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{u.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-blue-400">{u.tier}</td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{u.createdAt.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Data Gateways */}
      {activeAdminTab === "data-providers" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {INITIAL_DATA_PROVIDERS.map((prov, i) => (
            <div key={i} className="rounded-2xl border border-slate-800 bg-[#131B2E] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  {prov.status}
                </span>
                <span className="font-mono text-xs text-slate-400">{prov.latencyMs} ms latency</span>
              </div>
              <h3 className="font-bold text-white text-sm">{prov.name}</h3>
              <p className="text-[11px] font-mono text-slate-400 break-all">{prov.endpoint}</p>
              <div className="border-t border-slate-800 pt-2 text-[11px] text-slate-400 font-mono flex justify-between">
                <span>Synced Today: {prov.recordsSyncedToday.toLocaleString()}</span>
                <span className="text-slate-300">{prov.lastSync}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Regulatory Fee Schedules */}
      {activeAdminTab === "fees" && (
        <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white text-sm">Nepal Market Regulatory Fee Schedule</h3>
              <p className="text-xs text-slate-400">
                Effective Date: {DEFAULT_FEE_SCHEDULE.effectiveDate} (SEBON Directives Compliant)
              </p>
            </div>
            <span className="text-emerald-400 font-mono text-xs font-bold">VERIFIED CIRCULAR</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="rounded-xl bg-slate-900/80 p-4 space-y-2">
              <span className="font-sans font-bold text-amber-400 block text-xs">
                Broker Commission Slabs
              </span>
              <div className="flex justify-between">
                <span>Up to NPR 50,000:</span>
                <span className="text-white font-bold">0.40% (Min NPR 10)</span>
              </div>
              <div className="flex justify-between">
                <span>NPR 50,001 to NPR 500,000:</span>
                <span className="text-white font-bold">0.37%</span>
              </div>
              <div className="flex justify-between">
                <span>NPR 500,001 to NPR 2,000,000:</span>
                <span className="text-white font-bold">0.34%</span>
              </div>
              <div className="flex justify-between">
                <span>NPR 2,000,001 to NPR 10,000,000:</span>
                <span className="text-white font-bold">0.30%</span>
              </div>
              <div className="flex justify-between">
                <span>Above NPR 10,000,000:</span>
                <span className="text-white font-bold">0.27%</span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-900/80 p-4 space-y-2">
              <span className="font-sans font-bold text-blue-400 block text-xs">
                Mandatory Levies & Taxes
              </span>
              <div className="flex justify-between">
                <span>SEBON Regulatory Fee:</span>
                <span className="text-white font-bold">0.015% of turnover</span>
              </div>
              <div className="flex justify-between">
                <span>CDSC Depository Participant Fee:</span>
                <span className="text-white font-bold">NPR 25.00 per settlement</span>
              </div>
              <div className="flex justify-between">
                <span>CGT Short-term (&lt; 365 Days):</span>
                <span className="text-white font-bold">7.5% on capital gain</span>
              </div>
              <div className="flex justify-between">
                <span>CGT Long-term (&ge; 365 Days):</span>
                <span className="text-white font-bold">5.0% on capital gain</span>
              </div>
              <div className="flex justify-between">
                <span>Cash Dividend Tax Deduction:</span>
                <span className="text-white font-bold">5.0% at source</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Immutable Audit Ledger */}
      {activeAdminTab === "audit" && (
        <div className="rounded-2xl border border-slate-800 bg-[#131B2E] overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-slate-800 bg-slate-900/80 font-sans text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold">Administrator</th>
                  <th className="py-3 px-4 font-semibold">Action Description</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Old Value</th>
                  <th className="py-3 px-4 font-semibold">New Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850/50">
                    <td className="py-3 px-4 font-mono text-slate-400">{log.timestamp}</td>
                    <td className="py-3 px-4 font-bold text-white">{log.adminEmail}</td>
                    <td className="py-3 px-4 text-slate-200">{log.action}</td>
                    <td className="py-3 px-4 font-mono">
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-blue-400">
                        {log.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-rose-400 font-mono">{log.previousValue}</td>
                    <td className="py-3 px-4 text-emerald-400 font-mono font-bold">{log.newValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
