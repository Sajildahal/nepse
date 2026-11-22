import { NextResponse } from "next/server";
import { getMarketOverviewData } from "@/lib/market/nepseMarket";

export async function GET() {
  const data = await getMarketOverviewData();
  return NextResponse.json(data);
}