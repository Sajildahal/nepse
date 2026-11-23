import { NextResponse } from "next/server";
import { fetchMarketOpen } from "@/lib/market/nepseMarket";

export async function GET() {
  try {
    const status = await fetchMarketOpen();
    const state = status.open ? "OPEN" : "CLOSED";
    return NextResponse.json({
      open: status.open,
      status: state,
      asOf: status.asOf,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // A failed lookup is NOT the same as the market being closed. Report an
    // explicit unknown state so callers don't render a false "MARKET CLOSED".
    return NextResponse.json(
      { open: null, status: "UNKNOWN", asOf: null, error: (err as Error).message },
      { status: 503 }
    );
  }
}