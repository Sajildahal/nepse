import { NextResponse } from "next/server";
import { getTickerData } from "@/lib/market/nepseMarket";

export async function GET() {
  const data = await getTickerData();
  return NextResponse.json(data);
}