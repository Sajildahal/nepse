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
    return NextResponse.json(
      { open: false, status: "CLOSED", asOf: null, error: (err as Error).message },
      { status: 200 }
    );
  }
}