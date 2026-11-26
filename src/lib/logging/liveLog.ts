// ============================================================================
// Live in-memory application log buffer (server-side only)
// ============================================================================
// Keeps a capped ring buffer of structured log entries so operators can tail
// recent NEPSE activity from /api/log or /log without shell access.

export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogEntry {
  id: number;
  timestamp: string;
  level: LogLevel;
  scope: string;
  message: string;
  meta?: Record<string, unknown>;
}

export interface LogQuery {
  limit?: number;
  level?: LogLevel | LogLevel[];
  since?: string;
}

interface LiveLogState {
  entries: LogEntry[];
  sequence: number;
  listeners: Set<(entry: LogEntry) => void>;
  throttle: Map<string, number>;
}

const MAX_ENTRIES = 500;

const globalState = globalThis as unknown as {
  __nepseLiveLogState?: LiveLogState;
};

function state(): LiveLogState {
  if (!globalState.__nepseLiveLogState) {
    globalState.__nepseLiveLogState = {
      entries: [],
      sequence: 0,
      listeners: new Set(),
      throttle: new Map(),
    };
  }
  return globalState.__nepseLiveLogState;
}

const SENSITIVE_KEY = /token|authorization|secret|password|accessToken|salt/i;

function redact(value: unknown, depth = 0): unknown {
  if (depth > 4 || value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((item) => redact(item, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    out[key] = SENSITIVE_KEY.test(key) ? "[redacted]" : redact(item, depth + 1);
  }
  return out;
}

function consoleWrite(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const write = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  if (meta && Object.keys(meta).length > 0) write(message, meta);
  else write(message);
}

export function logMessage(
  level: LogLevel,
  scope: string,
  message: string,
  meta?: Record<string, unknown>,
): LogEntry {
  const s = state();
  const safeMeta = meta ? (redact(meta) as Record<string, unknown>) : undefined;
  const entry: LogEntry = {
    id: ++s.sequence,
    timestamp: new Date().toISOString(),
    level,
    scope,
    message,
    ...(safeMeta && Object.keys(safeMeta).length > 0 ? { meta: safeMeta } : {}),
  };

  s.entries.push(entry);
  if (s.entries.length > MAX_ENTRIES) s.entries.splice(0, s.entries.length - MAX_ENTRIES);

  consoleWrite(level, `[${scope}] ${message}`, safeMeta);

  for (const listener of s.listeners) {
    try {
      listener(entry);
    } catch {
      // A dead SSE client must never break application logging.
    }
  }

  return entry;
}

/** Log at most once per key within windowMs. Useful for expected skip events. */
export function logMessageThrottled(
  key: string,
  windowMs: number,
  level: LogLevel,
  scope: string,
  message: string,
  meta?: Record<string, unknown>,
): LogEntry | null {
  const s = state();
  const now = Date.now();
  const last = s.throttle.get(key) ?? 0;
  if (now - last < windowMs) return null;
  s.throttle.set(key, now);
  return logMessage(level, scope, message, meta);
}

export function getLogs(query: LogQuery = {}): LogEntry[] {
  const s = state();
  const sinceMs = query.since ? Date.parse(query.since) : NaN;
  const levels = query.level
    ? (Array.isArray(query.level) ? query.level : String(query.level).split(","))
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
    : [];

  let entries = s.entries;
  if (Number.isFinite(sinceMs)) {
    entries = entries.filter((entry) => Date.parse(entry.timestamp) >= sinceMs);
  }
  if (levels.length > 0) {
    entries = entries.filter((entry) => levels.includes(entry.level));
  }

  const limit = Math.max(1, Math.min(MAX_ENTRIES, Number(query.limit) || 100));
  return entries.slice(-limit);
}

export function subscribeLogs(listener: (entry: LogEntry) => void): () => void {
  const s = state();
  s.listeners.add(listener);
  return () => s.listeners.delete(listener);
}
