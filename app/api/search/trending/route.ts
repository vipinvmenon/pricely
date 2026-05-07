import { json } from "@/lib/api/http";

type TrendingItem = {
  id: string;
  query: string;
  category: "grocery" | "electronics" | "cabs";
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const city = url.searchParams.get("city");
  if (!city) return json<TrendingItem[]>(MOCK_TRENDING);
  return json<TrendingItem[]>(MOCK_TRENDING);
}

const MOCK_TRENDING: TrendingItem[] = [
  { id: "t1", query: "milk", category: "grocery" },
  { id: "t2", query: "bread", category: "grocery" },
  { id: "t3", query: "eggs", category: "grocery" },
  { id: "t4", query: "iphone 16", category: "electronics" },
  { id: "t5", query: "airpods", category: "electronics" },
  { id: "t6", query: "airport to koramangala", category: "cabs" },
];

