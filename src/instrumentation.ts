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
      console.warn("[nepse] startup sync failed:", (err as Error)?.message || err);
    }
  }

  // 2. Sync scrips every midnight (00:00 NPT)
  if (!g.__nepseMidnightScheduled) {
    g.__nepseMidnightScheduled = true;
    const runSync = async () => {
      try {
        const { syncNepseStocks } = await import("./lib/market/nepseMarket");
        await syncNepseStocks();
        console.log("[nepse] midnight scrip sync done");
      } catch (err) {
        console.warn("[nepse] midnight sync failed:", (err as Error)?.message || err);
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
      console.warn("[nepse] live market refresh failed:", (err as Error)?.message || err);
    }
  };

  // warm up if we boot inside the window
  if (isTradingWindow()) tick();
  setInterval(tick, 90_000);
  console.log("[nepse] live market scheduler started (90s, trading window only)");
}