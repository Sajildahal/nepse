import { NextResponse } from "next/server";
import { isLogViewAuthorized } from "@/lib/logging/logAuth";
import { getLogs, type LogLevel } from "@/lib/logging/liveLog";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET(request: Request) {
  if (!isLogViewAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const levelParam = url.searchParams.get("level");
  const level = (levelParam ? levelParam.split(",") : undefined) as LogLevel[] | undefined;

  const logs = getLogs({
    limit: Number(url.searchParams.get("limit")) || 100,
    level,
    since: url.searchParams.get("since") ?? undefined,
  });

  return NextResponse.json(
    {
      count: logs.length,
      logs,
      timestamp: new Date().toISOString(),
    },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}
