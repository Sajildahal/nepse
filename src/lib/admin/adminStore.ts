// ============================================================================
// Admin Master Control & System Telemetry Store
// User RBAC, Fee Schedules, Data Provider Monitoring, Audit Logging
// ============================================================================

import { FeeSchedule, UserRole } from "@/types";
import { DEFAULT_FEE_SCHEDULE } from "@/lib/financial/nepseFeeEngine";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "Active" | "Suspended" | "Pending";
  tier: "Free" | "Pro" | "Premium";
  createdAt: string;
}

export interface DataProviderStatus {
  name: string;
  endpoint: string;
  status: "ONLINE" | "DEGRADED" | "OFFLINE";
  latencyMs: number;
  lastSync: string;
  recordsSyncedToday: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  adminEmail: string;
  action: string;
  category: "FEE_SCHEDULE" | "USER_MANAGEMENT" | "AI_MODEL" | "SECURITY";
  previousValue?: string;
  newValue?: string;
}

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: "usr-1",
    name: "Siddhartha Sharma",
    email: "superadmin@nepseintelligence.ai",
    role: "Super Admin",
    status: "Active",
    tier: "Premium",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "usr-2",
    name: "Aarav Adhikari",
    email: "quant.analyst@nepseintelligence.ai",
    role: "Financial Analyst",
    status: "Active",
    tier: "Premium",
    createdAt: "2024-03-12T00:00:00Z",
  },
  {
    id: "usr-3",
    name: "Prashant Karki",
    email: "trader.user@gmail.com",
    role: "Trader",
    status: "Active",
    tier: "Pro",
    createdAt: "2024-05-18T00:00:00Z",
  },
];

export const INITIAL_DATA_PROVIDERS: DataProviderStatus[] = [
  {
    name: "NEPSE Official Market Data Stream",
    endpoint: "wss://api.nepalstock.com/v1/live",
    status: "ONLINE",
    latencyMs: 42,
    lastSync: "Just now",
    recordsSyncedToday: 48920,
  },
  {
    name: "SEBON Company Disclosures Gateway",
    endpoint: "https://disclosures.sebon.gov.np/feed",
    status: "ONLINE",
    latencyMs: 110,
    lastSync: "2 mins ago",
    recordsSyncedToday: 1420,
  },
  {
    name: "CDSC Clearing & Settlement Registry",
    endpoint: "https://dp.cdsc.com.np/api/v2",
    status: "ONLINE",
    latencyMs: 68,
    lastSync: "5 mins ago",
    recordsSyncedToday: 8340,
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-1",
    timestamp: "2026-11-02T14:30:00+05:45",
    adminEmail: "superadmin@nepseintelligence.ai",
    action: "Updated Broker Slab S-1 Minimum Commission",
    category: "FEE_SCHEDULE",
    previousValue: "NPR 10.00",
    newValue: "NPR 10.00 (Verified with SEBON circular)",
  },
  {
    id: "log-2",
    timestamp: "2026-11-02T11:15:00+05:45",
    adminEmail: "superadmin@nepseintelligence.ai",
    action: "AI Quant Ensemble model weights calibrated",
    category: "AI_MODEL",
    previousValue: "Model v3.3.0",
    newValue: "Model v3.4.1 (Walk-forward out-of-sample validated)",
  },
  {
    id: "log-3",
    timestamp: "2026-11-01T16:45:00+05:45",
    adminEmail: "superadmin@nepseintelligence.ai",
    action: "Role elevation for quantitative research analyst",
    category: "USER_MANAGEMENT",
    previousValue: "Trader",
    newValue: "Financial Analyst",
  },
];
