"use client";

import { useEffect, useState } from "react";

interface LogEntry {
  id: number;
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  scope: string;
  message: string;
  meta?: Record<string, unknown>;
}

const STORAGE_KEY = "nepse-log-view-token";

const LEVEL_STYLE: Record<LogEntry["level"], string> = {
  info: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  warn: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  error: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  debug: "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

function formatTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleTimeString("en-GB", { hour12: false });
}

export default function LogViewer() {
  const [token, setToken] = useState("");
  const [draftToken, setDraftToken] = useState("");
  const [ready, setReady] = useState(false);
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY) ?? "";
    setToken(saved);
    setDraftToken(saved);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;

    const headers = token ? { "X-Log-Token": token } : undefined;
    fetch("/api/log?limit=100", { headers, cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { logs?: LogEntry[] };
        if (!cancelled) setEntries(data.logs ?? []);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(`Could not load logs: ${err.message}`);
      });

    const query = token ? `?token=${encodeURIComponent(token)}` : "";
    const source = new EventSource(`/api/log/stream${query}`);

    source.addEventListener("ready", () => {
      if (!cancelled) {
        setConnected(true);
        setError(null);
      }
    });

    source.addEventListener("log", (event) => {
      if (cancelled) return;
      try {
        const entry = JSON.parse((event as MessageEvent<string>).data) as LogEntry;
        setEntries((prev) => [...prev, entry].slice(-200));
      } catch {
        // ignore malformed frames
      }
    });

    source.onerror = () => {
      if (!cancelled) {
        setConnected(false);
        setError("Log stream disconnected; retrying automatically...");
      }
    };

    return () => {
      cancelled = true;
      source.close();
    };
  }, [token, ready]);

  const saveToken = () => {
    const next = draftToken.trim();
    sessionStorage.setItem(STORAGE_KEY, next);
    setToken(next);
  };

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-200">
      <div className="mx-auto max-w-5xl space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-white">Live NEPSE Logs</h1>
            <p className="text-sm text-slate-400">/api/log · /api/log/stream</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span
              className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-400" : "bg-slate-600"}`}
            />
            <span className={connected ? "text-emerald-300" : "text-slate-400"}>
              {connected ? "Live" : "Connecting"}
            </span>
          </div>
        </header>

        <div className="flex flex-wrap gap-2 rounded-lg border border-slate-800 bg-slate-900 p-3">
          <input
            type="password"
            value={draftToken}
            onChange={(event) => setDraftToken(event.target.value)}
            placeholder="Log token (if required)"
            className="min-w-64 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-sky-500"
          />
          <button
            type="button"
            onClick={saveToken}
            className="rounded bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
          >
            Apply
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
          {entries.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">No log entries yet.</div>
          ) : (
            <ul className="divide-y divide-slate-800">
              {entries.map((entry) => (
                <li key={entry.id} className="grid grid-cols-[90px_70px_1fr] gap-3 px-4 py-3 text-sm">
                  <span className="font-mono text-xs text-slate-500">{formatTime(entry.timestamp)}</span>
                  <span
                    className={`h-fit w-fit rounded border px-2 py-0.5 text-xs uppercase ${LEVEL_STYLE[entry.level]}`}
                  >
                    {entry.level}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate font-medium text-slate-100">{entry.message}</div>
                    <div className="mt-0.5 truncate font-mono text-xs text-slate-500">
                      {entry.scope}
                      {entry.meta ? ` ${JSON.stringify(entry.meta)}` : ""}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
