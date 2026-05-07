import { json } from "@/lib/api/http";

type WatchlistItemView = {
  id: string;
  title: string;
  category: "grocery" | "electronics" | "cabs";
  subtitle?: string;
  deltaText?: string;
  hasAlert?: boolean;
};

export async function GET() {
  return json<WatchlistItemView[]>(MOCK_WATCHLIST);
}

export async function POST(req: Request) {
  // Mock-only for now. Phase 6 contract exists; Phase 7 will back this by Supabase + auth.
  const body = (await req.json().catch(() => null)) as unknown;
  void body;
  return json({ ok: true });
}

const MOCK_WATCHLIST: WatchlistItemView[] = [
  {
    id: "w1",
    title: "Amul Taaza 1L",
    category: "grocery",
    subtitle: "Bengaluru",
    deltaText: "↓ ₹12 today",
    hasAlert: true,
  },
  {
    id: "w2",
    title: "iPhone 16 128GB",
    category: "electronics",
    subtitle: "Bengaluru",
    deltaText: "↑ ₹499 this week",
    hasAlert: false,
  },
  {
    id: "w3",
    title: "Airport → Koramangala",
    category: "cabs",
    subtitle: "Bengaluru",
    deltaText: "↓ ₹18 avg",
    hasAlert: false,
  },
];

