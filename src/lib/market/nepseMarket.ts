// ============================================================================
// NEPSE Live Market Data Client (server-side only)
// ============================================================================
// Fetches live quotes from NEPSE's undocumented public API, using the same
// authentication + WASM token-cleaning flow as the nepse-portfolio backend.
// Results are cached in memory; scrip metadata is persisted in Postgres.

// fs/path are Node-only; loaded lazily to keep them out of the edge bundle.

import {
  INITIAL_INDICES,
  INITIAL_MARKET_PRICES,
  NEPSE_COMPANIES,
  NEPSE_SECTORS,
} from "@/lib/market/nepseData";
import type { MarketIndex, MarketPrice, Sector } from "@/types";
import { cacheGet, cacheSet } from "./redisCache";

const BASE_URL = process.env.NEPSE_BASE_URL || "https://www.nepalstock.com";
const USER_AGENT =
  process.env.NEPSE_USER_AGENT ||
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

// ---------- WASM module (token index derivation) ----------

let wasmInstance: WebAssembly.Instance | null = null;
function getWasm(): WebAssembly.Instance {
  if (wasmInstance) return wasmInstance;
  const { join } = eval("require('path')") as { join: (...a: string[]) => string };
  const { readFileSync } = eval("require('fs')") as { readFileSync: (p: string) => Buffer };
  const wasmPath = join(process.cwd(), "src", "lib", "nepse", "css.wasm");
  const bytes = readFileSync(wasmPath);
  // WebAssembly.instantiate is async in Node; use sync compile + instantiate
  const wasmModule = new WebAssembly.Module(bytes as any);
  wasmInstance = new WebAssembly.Instance(wasmModule, {});
  return wasmInstance;
}

function invokeWasm(name: string, ...args: number[]): number {
  const fn = (getWasm().exports as Record<string, (...a: number[]) => number>)[name];
  if (typeof fn !== "function") throw new Error(`WASM export ${name} not found`);
  return Number(fn(...args));
}

// ---------- Auth token (cached ~40s) ----------

interface TokenCache {
  token: string;
  expiresAt: number;
}
let tokenCache: TokenCache | null = null;

async function fetchJson(path: string, token?: string): Promise<any> {
  const res = await fetch(BASE_URL + path, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.5",
      Referer: BASE_URL + "/",
      Origin: BASE_URL,
      ...(token ? { Authorization: "Salter " + token } : {}),
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`NEPSE ${path} HTTP ${res.status}`);
  if (!text || !text.trim() || text.trim() === "[]") {
    throw new Error(`NEPSE ${path} returned empty response`);
  }
  return JSON.parse(text);
}

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 2000) return tokenCache.token;

  const auth = await fetchJson("/api/authenticate/prove");
  const raw: string = auth.accessToken;
  const salts = [auth.salt1, auth.salt2, auth.salt3, auth.salt4, auth.salt5].map(Number);

  const indexes = [
    invokeWasm("cdx", ...salts),
    invokeWasm("rdx", salts[0], salts[1], salts[3], salts[2], salts[4]),
    invokeWasm("bdx", salts[0], salts[1], salts[3], salts[2], salts[4]),
    invokeWasm("ndx", salts[0], salts[1], salts[3], salts[2], salts[4]),
    invokeWasm("mdx", salts[0], salts[1], salts[3], salts[2], salts[4]),
  ].sort((a, b) => a - b);

  // clean junk chars at indexes
  const sorted = [...indexes].sort((a, b) => a - b);
  let out = "";
  let prev = 0;
  for (const idx of sorted) {
    out += raw.slice(prev, idx);
    prev = idx + 1;
  }
  out += raw.slice(prev);
  const token = out;

  const ttlMs = 40_000;
  tokenCache = { token, expiresAt: now + ttlMs };
  return token;
}

async function invalidateToken() {
  tokenCache = null;
}

async function fetchWithAuth<T>(path: string): Promise<T> {
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await invalidateToken();
    const token = await getAccessToken();
    try {
      return (await fetchJson(path, token)) as T;
    } catch (err) {
      console.warn(`[nepse] ${path} attempt ${attempt + 1} failed:`, (err as Error).message, (err as any)?.cause);
      if (attempt === 1) throw err;
    }
  }
  throw new Error("NEPSE request failed");
}

// ---------- Public fetchers ----------

export interface NepseLiveQuote {
  securityId: string;
  securityName: string;
  symbol: string;
  indexId: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  lastTradedPrice: number;
  previousClose: number;
  percentageChange: number;
  totalTradeQuantity: number;
  totalTradeValue: number;
  lastUpdatedDateTime: string;
  lastTradedVolume?: number;
  averageTradedPrice?: number;
}

export interface NepseCompany {
  id: number;
  companyName: string;
  symbol: string;
  securityName: string;
  status: string;
  sectorName: string;
  instrumentType: string;
}

export interface NepseSecurity {
  id: number;
  symbol: string;
  securityName: string;
  activeStatus: string;
}

export interface MarketOpenStatus {
  open: boolean;
  asOf: string | null;
}

let liveCache: { data: NepseLiveQuote[]; expiresAt: number } | null = null;
let companyCache: { data: NepseCompany[]; expiresAt: number } | null = null;
let marketOpenCache: { data: MarketOpenStatus; expiresAt: number } | null = null;

export async function fetchLiveMarket(): Promise<NepseLiveQuote[]> {
  const now = Date.now();
  if (liveCache && liveCache.expiresAt > now) return liveCache.data;
  const data = (await fetchWithAuth("/api/nots/lives-market")) as NepseLiveQuote[];
  liveCache = { data, expiresAt: now + 15_000 };
  return data;
}

export async function fetchCompanyList(): Promise<NepseCompany[]> {
  const now = Date.now();
  if (companyCache && companyCache.expiresAt > now) return companyCache.data;
  const data = (await fetchWithAuth("/api/nots/company/list")) as NepseCompany[];
  companyCache = { data, expiresAt: now + 10 * 60 * 1000 };
  return data;
}

export async function fetchSecurityList(): Promise<NepseSecurity[]> {
  return (await fetchWithAuth("/api/nots/security?nonDelisted=true")) as NepseSecurity[];
}

export async function fetchMarketOpen(): Promise<MarketOpenStatus> {
  const now = Date.now();
  if (marketOpenCache && marketOpenCache.expiresAt > now) return marketOpenCache.data;
  const raw = (await fetchWithAuth("/api/nots/nepse-data/market-open")) as any;
  const openRaw = raw?.isOpen ?? raw?.open ?? raw?.marketOpen;
  const open = String(openRaw).toUpperCase() === "OPEN" || openRaw === true || openRaw === 1;
  const status: MarketOpenStatus = { open, asOf: raw?.asOf ?? null };
  marketOpenCache = { data: status, expiresAt: now + 60_000 };
  return status;
}

export interface NepseIndexRow {
  id: number;
  index: string;
  close: number;
  high: number;
  low: number;
  previousClose: number;
  change: number;
  perChange: number;
  currentValue: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
}

export interface MarketSummary {
  totalTurnover: number;
  totalTradedShares: number;
  totalTransactions: number;
  totalScripsTraded: number;
  totalMarketCap: number;
}

let indexCache: { data: MarketIndex[]; expiresAt: number } | null = null;
let summaryCache: { data: MarketSummary; expiresAt: number } | null = null;

export async function fetchNepseIndex(): Promise<MarketIndex[]> {
  const now = Date.now();
  if (indexCache && indexCache.expiresAt > now) return indexCache.data;
  const rows = (await fetchWithAuth("/api/nots/nepse-index")) as NepseIndexRow[];
  const mapped: MarketIndex[] = rows.map((r) => ({
    name: r.index,
    current: Number(r.currentValue ?? r.close) || 0,
    change: Number(r.change) || 0,
    changePercent: Number(r.perChange) || 0,
    high: Number(r.high) || 0,
    low: Number(r.low) || 0,
    turnover: 0,
  }));
  indexCache = { data: mapped, expiresAt: now + 60_000 };
  return mapped;
}

export async function fetchMarketSummary(): Promise<MarketSummary> {
  const now = Date.now();
  if (summaryCache && summaryCache.expiresAt > now) return summaryCache.data;
  const rows = (await fetchWithAuth("/api/nots/market-summary")) as Array<{ detail: string; value: number }>;
  const get = (needle: string) =>
    rows.find((r) => r.detail.toLowerCase().includes(needle.toLowerCase()))?.value ?? 0;
  const summary: MarketSummary = {
    totalTurnover: get("Total Turnover"),
    totalTradedShares: get("Total Traded Shares"),
    totalTransactions: get("Total Transactions"),
    totalScripsTraded: get("Total Scrips Traded"),
    totalMarketCap: get("Total Market Capitalization"),
  };
  summaryCache = { data: summary, expiresAt: now + 60_000 };
  return summary;
}

export async function getLiveIndices(): Promise<MarketIndex[]> {
  try {
    const indices = await fetchNepseIndex();
    if (indices.length) return indices;
  } catch (err) {
    console.warn("[nepse] index fetch failed, using static fallback:", (err as Error).message);
  }
  return INITIAL_INDICES;
}

// ---------- DB layer ----------

let pool: any = null;
async function getPool(): Promise<any> {
  if (pool) return pool;
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  // pg is a Node-only module; load it at runtime to keep it out of the
  // edge/client bundle (Next.js cannot resolve its `fs` dependency there).
  const { Pool } = eval("require('pg')") as { Pool: new (cfg: any) => any };
  pool = new Pool({ connectionString: url, max: 5 });
  return pool;
}

const STOCK_META = new Map<string, { name: string; sector: string | null }>();

export async function ensureSchema(): Promise<void> {
  const p = await getPool();
  if (!p) return;
  await p.query(`
    CREATE TABLE IF NOT EXISTS nepse_stocks (
      symbol TEXT PRIMARY KEY,
      name TEXT,
      sector TEXT,
      instrument_type TEXT,
      active BOOLEAN NOT NULL DEFAULT true,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

export async function syncNepseStocks(): Promise<void> {
  const p = await getPool();
  if (!p) {
    console.warn("[nepse] DATABASE_URL not set; skipping scrip sync");
    return;
  }
  await ensureSchema();

  const [securities, companies] = await Promise.all([fetchSecurityList(), fetchCompanyList()]);
  const companyBySymbol = new Map<string, NepseCompany>();
  for (const c of companies) {
    if (c.symbol) companyBySymbol.set(c.symbol.toUpperCase(), c);
  }

  const seen = new Set<string>();
  const rows: Array<{ symbol: string; name: string; sector: string | null; instrumentType: string }> = [];

  for (const sec of securities) {
    if (!sec.symbol || !sec.symbol.trim()) continue;
    const symbol = sec.symbol.trim().toUpperCase();
    if (seen.has(symbol)) continue;
    seen.add(symbol);

    const exact = companyBySymbol.get(symbol);
    const base = symbol.endsWith("P") && symbol.length > 1 ? symbol.slice(0, -1) : symbol;
    const company = exact || companyBySymbol.get(base);

    const name = (sec.securityName || company?.companyName || symbol).trim();
    const sector = company?.sectorName?.trim() || null;
    const instrumentType =
      company?.instrumentType?.trim() ||
      (name.toLowerCase().includes("promot")
        ? "Promoter Shares"
        : name.toLowerCase().includes("debenture") || name.toLowerCase().includes("bond")
        ? "Non-Convertible Debentures"
        : name.toLowerCase().includes("mutual fund") || name.toLowerCase().includes("scheme") || name.toLowerCase().includes("fund")
        ? "Mutual Funds"
        : name.toLowerCase().includes("preference")
        ? "Preference Shares"
        : "Equity");

    rows.push({ symbol, name, sector, instrumentType });
  }

  const client = await p.connect();
  try {
    await client.query("BEGIN");
    for (const r of rows) {
      await client.query(
        `INSERT INTO nepse_stocks (symbol, name, sector, instrument_type, active, updated_at)
         VALUES ($1, $2, $3, $4, true, now())
         ON CONFLICT (symbol) DO UPDATE SET
           name = EXCLUDED.name,
           sector = COALESCE(EXCLUDED.sector, nepse_stocks.sector),
           instrument_type = COALESCE(EXCLUDED.instrument_type, nepse_stocks.instrument_type),
           active = true,
           updated_at = now()`,
        [r.symbol, r.name, r.sector, r.instrumentType]
      );
    }
    if (seen.size > 0) {
      await client.query(
        `UPDATE nepse_stocks SET active = false, updated_at = now()
         WHERE active = true AND NOT (symbol = ANY($1::text[]))`,
        [Array.from(seen)]
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }

  await loadStockMetaFromDb();
  console.log(`[nepse] synced ${rows.length} scrips (${seen.size} active)`);
}

async function loadStockMetaFromDb(): Promise<void> {
  const p = await getPool();
  if (!p) return;
  try {
    const res = await p.query("SELECT symbol, name, sector FROM nepse_stocks WHERE active = true");
    STOCK_META.clear();
    for (const r of res.rows) {
      STOCK_META.set(String(r.symbol).toUpperCase(), {
        name: r.name || r.symbol,
        sector: r.sector || null,
      });
    }
  } catch (err) {
    console.warn("[nepse] could not load stock meta from DB:", (err as Error).message);
  }
}

export function getStockMeta(symbol: string): { name: string; sector: string | null } {
  const key = symbol.toUpperCase();
  const fromDb = STOCK_META.get(key);
  if (fromDb) return fromDb;
  const staticCompany = NEPSE_COMPANIES.find((c) => c.symbol === key);
  if (staticCompany) return { name: staticCompany.name, sector: staticCompany.sector };
  return { name: key, sector: null };
}

// ---------- Transform ----------

const STATIC_BY_SYMBOL = new Map(NEPSE_COMPANIES.map((c) => [c.symbol, c]));

function isSector(value: string): value is Sector {
  return (NEPSE_SECTORS as string[]).includes(value);
}

function toIso(dt: string): string {
  if (!dt) return new Date().toISOString();
  // "2026-11-20 14:59:59.968499" -> ISO with Nepal offset
  const normalized = dt.replace(" ", "T");
  const withOffset = /[zZ]|[+-]\d{2}:?\d{2}$/.test(normalized) ? normalized : normalized + "+05:45";
  const d = new Date(withOffset);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function transformQuote(q: NepseLiveQuote, marketStatus: string): MarketPrice {
  const symbol = String(q.symbol).toUpperCase();
  const meta = getStockMeta(symbol);
  const staticCompany = STATIC_BY_SYMBOL.get(symbol);

  const ltp = Number(q.lastTradedPrice) || 0;
  const prev = Number(q.previousClose) || 0;
  const change = Number((ltp - prev).toFixed(2));
  const changePercent = Number(q.percentageChange) || (prev ? Number(((change / prev) * 100).toFixed(2)) : 0);

  const sectorRaw = meta.sector || staticCompany?.sector || "Others";
  const sector: Sector = isSector(sectorRaw) ? sectorRaw : "Others";

  const listedShares = staticCompany?.listedShares;
  const marketCap = listedShares ? Number(((ltp * listedShares) / 1e7).toFixed(2)) : 0;

  return {
    symbol,
    name: meta.name || staticCompany?.name || q.securityName || symbol,
    sector,
    ltp,
    change,
    changePercent,
    open: Number(q.openPrice) || 0,
    high: Number(q.highPrice) || 0,
    low: Number(q.lowPrice) || 0,
    previousClose: prev,
    volume: Number(q.totalTradeQuantity) || 0,
    turnover: Number(q.totalTradeValue) || 0,
    transactions: 0,
    marketCap,
    high52: staticCompany?.high52 ?? 0,
    low52: staticCompany?.low52 ?? 0,
    timestamp: toIso(q.lastUpdatedDateTime),
    status: marketStatus as MarketPrice["status"],
  };
}

// ---------- Public API ----------

let pricesCache: { data: MarketPrice[]; expiresAt: number } | null = null;

const REDIS_KEY = "nepse:live:prices";
const REDIS_TTL = 120; // seconds

export async function getLiveMarketPrices(): Promise<MarketPrice[]> {
  const now = Date.now();
  if (pricesCache && pricesCache.expiresAt > now) return pricesCache.data;

  // 1. Try Redis first (shared across users/instances)
  try {
    const cached = await cacheGet(REDIS_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as MarketPrice[];
      pricesCache = { data: parsed, expiresAt: now + 15_000 };
      return parsed;
    }
  } catch {
    // fall through
  }

  // 2. Fetch from NEPSE
  try {
    const [quotes, companies, marketOpen] = await Promise.all([
      fetchLiveMarket(),
      fetchCompanyList(),
      fetchMarketOpen(),
    ]);
    for (const c of companies) {
      if (!c.symbol) continue;
      const key = c.symbol.toUpperCase();
      if (!STOCK_META.has(key)) {
        STOCK_META.set(key, { name: c.companyName || key, sector: c.sectorName || null });
      }
    }
    const status = marketOpen.open ? "OPEN" : "CLOSED";
    const prices = quotes.map((q) => transformQuote(q, status));
    pricesCache = { data: prices, expiresAt: now + 15_000 };
    await cacheSet(REDIS_KEY, JSON.stringify(prices), REDIS_TTL);
    return prices;
  } catch (err) {
    console.warn("[nepse] live market fetch failed, using static fallback:", (err as Error).message, (err as any)?.cause);
    if (pricesCache?.data) return pricesCache.data;
    return INITIAL_MARKET_PRICES;
  }
}

export async function refreshLiveMarketCache(): Promise<void> {
  try {
    const [quotes, companies, marketOpen] = await Promise.all([
      fetchLiveMarket(),
      fetchCompanyList(),
      fetchMarketOpen(),
    ]);
    for (const c of companies) {
      if (!c.symbol) continue;
      const key = c.symbol.toUpperCase();
      if (!STOCK_META.has(key)) {
        STOCK_META.set(key, { name: c.companyName || key, sector: c.sectorName || null });
      }
    }
    const status = marketOpen.open ? "OPEN" : "CLOSED";
    const prices = quotes.map((q) => transformQuote(q, status));
    pricesCache = { data: prices, expiresAt: Date.now() + 15_000 };
    await cacheSet(REDIS_KEY, JSON.stringify(prices), REDIS_TTL);
    console.log(`[nepse] refreshed live market cache (${prices.length} scrips)`);
  } catch (err) {
    console.warn("[nepse] live market refresh failed:", (err as Error).message);
  }
}

export function getMarketStatusString(open: boolean): MarketPrice["status"] {
  return open ? "OPEN" : "CLOSED";
}

export async function getMarketOverviewData() {
  const stocks = await getLiveMarketPrices();
  const [marketOpen, indices, summary] = await Promise.all([
    fetchMarketOpen().catch(() => ({ open: false, asOf: null })),
    getLiveIndices(),
    fetchMarketSummary().catch(() => ({ totalTurnover: 0, totalTradedShares: 0, totalTransactions: 0, totalScripsTraded: 0, totalMarketCap: 0 })),
  ]);

  const topGainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  const topLosers = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);
  const highestTurnover = [...stocks].sort((a, b) => b.turnover - a.turnover).slice(0, 5);
  const highestVolume = [...stocks].sort((a, b) => b.volume - a.volume).slice(0, 5);

  const sentiment = (await import("@/lib/sentiment/sentimentEngine")).computeMarketSentiment(stocks);

  const advancers = stocks.filter((s) => s.change > 0).length;
  const decliners = stocks.filter((s) => s.change < 0).length;
  const unchanged = stocks.filter((s) => s.change === 0).length;
  const totalTurnover = summary.totalTurnover || stocks.reduce((sum, s) => sum + s.turnover, 0);
  const totalVolume = summary.totalTradedShares || stocks.reduce((sum, s) => sum + s.volume, 0);
  const totalTransactions = summary.totalTransactions || stocks.reduce((sum, s) => sum + s.transactions, 0);

  return {
    indices,
    breadth: {
      advancers,
      decliners,
      unchanged,
      totalTurnover,
      totalVolume,
      totalTransactions,
      asOf: marketOpen.asOf || new Date().toISOString(),
    },
    sentiment,
    topGainers,
    topLosers,
    highestTurnover,
    highestVolume,
    dataSource: "NEPSE Live API",
    timestamp: new Date().toISOString(),
    marketOpen: marketOpen.open,
  };
}
export async function getTickerData() {
  const [marketOpen, indices, summary] = await Promise.all([
    fetchMarketOpen().catch(() => ({ open: false, asOf: null })),
    getLiveIndices().catch(() => INITIAL_INDICES),
    fetchMarketSummary().catch(() => ({ totalTurnover: 0, totalTradedShares: 0, totalTransactions: 0, totalScripsTraded: 0, totalMarketCap: 0 })),
  ]);
  return {
    marketOpen: marketOpen.open,
    status: marketOpen.open ? "OPEN" : "CLOSED",
    asOf: marketOpen.asOf,
    indices,
    totalTurnover: summary.totalTurnover,
    totalTradedShares: summary.totalTradedShares,
    totalTransactions: summary.totalTransactions,
    totalScripsTraded: summary.totalScripsTraded,
    timestamp: new Date().toISOString(),
  };
}
