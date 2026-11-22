import { NextResponse } from "next/server";
import { getLiveMarketPrices } from "@/lib/market/nepseMarket";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sector = searchParams.get("sector");
  const search = searchParams.get("search")?.toUpperCase();

  let stocks = await getLiveMarketPrices();

  if (sector && sector !== "ALL") {
    stocks = stocks.filter((s) => s.sector === sector);
  }

  if (search) {
    stocks = stocks.filter(
      (s) =>
        s.symbol.toUpperCase().includes(search) ||
        s.name.toUpperCase().includes(search)
    );
  }

  return NextResponse.json({
    count: stocks.length,
    stocks,
    dataFreshness: "NEPSE Live API",
    timestamp: new Date().toISOString(),
  });
}