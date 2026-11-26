import { logMessage } from "./lib/logging/liveLog";

const NPT_OFFSET_MS = (5 * 60 + 45) * 60 * 1000;

function nowNpt(): Date {
  return new Date(Date.now() + NPT_OFFSET_MS);
}

// isTradingWindow is imported from nepseMarket at runtime (see tick()).

function msUntilNextMidnightNpt(): number {
  const npt = nowNpt();
  const next = Date.UTC(npt.getUTCFullYear(), npt.getUTCMonth(), npt.getUTCDate() + 1, 0, 0, 0, 0);
  return next - NPT_OFFSET_MS - Date.now();
}

const g = globalThis as unknown as {
  __nepseStartupSynced?: boolean;
  __nepseMidnightScheduled?: boolean;
  __nepseLiveSchedulerStarted?: boolean;
};

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // 1. Sync scrips once at startup
  if (!g.__nepseStartupSynced) {
    g.__nepseStartupSynced = true;
    try {
      const { syncNepseStocks } = await import("./lib/market/nepseMarket");
      await syncNepseStocks();
    } catch (err) {
      logMessage("error", "nepse", `Startup scrip sync failed — ${(err as Error)?.message || err}`, {
        error: (err as Error)?.message || String(err),
      });
    }
  }

  // 2. Sync scrips every midnight (00:00 NPT)
  if (!g.__nepseMidnightScheduled) {
    g.__nepseMidnightScheduled = true;
    const runSync = async () => {
      try {
        const { syncNepseStocks } = await import("./lib/market/nepseMarket");
        await syncNepseStocks();
        logMessage("info", "nepse", "Midnight scrip sync completed successfully");
      } catch (err) {
        logMessage("error", "nepse", `Midnight scrip sync failed — ${(err as Error)?.message || err}`, {
          error: (err as Error)?.message || String(err),
        });
      }
    };
    setTimeout(() => {
      runSync();
      setInterval(runSync, 24 * 60 * 60 * 1000);
    }, msUntilNextMidnightNpt());
  }

  // 3. Live market refresh every 90s, only during trading window (Mon-Fri 11:00-15:00 NPT)
  if (g.__nepseLiveSchedulerStarted) return;
  g.__nepseLiveSchedulerStarted = true;

  const { refreshLiveMarketCache, refreshMarketOverviewCache, isTradingWindow } = await import("./lib/market/nepseMarket");

  const tick = async () => {
    if (!isTradingWindow()) return;
    try {
      await refreshLiveMarketCache();
      await refreshMarketOverviewCache();
    } catch (err) {
      logMessage("error", "nepse", `Scheduled live market refresh failed — ${(err as Error)?.message || err}`, {
        error: (err as Error)?.message || String(err),
      });
    }
  };

  // warm up if we boot inside the window
  if (isTradingWindow()) tick();
  setInterval(tick, 90_000);
  logMessage("info", "nepse", "Live market scheduler started (90s interval, NPT 11:00–15:00 only)");
}