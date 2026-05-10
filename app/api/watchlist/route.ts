import type { WatchlistItemView } from "@/types";
import {
  badRequest,
  json,
  unauthorized,
  serverError,
  serviceUnavailable,
} from "@/lib/api/http";
import { watchlistPostSchema } from "@/lib/api/schemas/watchlistPost";
import {
  createSupabaseRouteHandlerClient,
  createSupabaseServiceRoleClient,
  isSupabasePublicConfigured,
  isSupabaseServiceConfigured,
} from "@/lib/db/supabase-server";
import { ensureProductRow } from "@/lib/products/ensureProduct";
import { deleteWatchlistRow, insertWatchlistRow, listWatchlistViews } from "@/lib/watchlist/db";

export async function GET() {
  if (!isSupabasePublicConfigured()) {
    return json<WatchlistItemView[]>(MOCK_WATCHLIST);
  }

  const supabase = await createSupabaseRouteHandlerClient();
  if (!supabase) return json<WatchlistItemView[]>(MOCK_WATCHLIST);

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr) return serverError("Auth error");
  if (!user) return unauthorized();

  try {
    const items = await listWatchlistViews(supabase);
    return json<WatchlistItemView[]>(items);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return serverError(message);
  }
}

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  const parsed = watchlistPostSchema.safeParse(raw);
  if (!parsed.success) return badRequest("Invalid request body");

  if (!isSupabasePublicConfigured()) {
    void parsed.data;
    return json({ ok: true });
  }

  const supabase = await createSupabaseRouteHandlerClient();
  if (!supabase) return json({ ok: true });

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr) return serverError("Auth error");
  if (!user) return unauthorized();

  const body = parsed.data;

  if (body.action === "remove") {
    try {
      const res = await deleteWatchlistRow(supabase, {
        productId: body.productId,
        city: body.city,
      });
      if (!res.ok) return serverError(res.message);
      return json({ ok: true });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      return serverError(message);
    }
  }

  if (!isSupabaseServiceConfigured()) {
    return serviceUnavailable("SUPABASE_SERVICE_ROLE_KEY is required to add watchlist items");
  }

  const service = createSupabaseServiceRoleClient();
  if (!service) return serviceUnavailable("Service role client unavailable");

  const ensured = await ensureProductRow(service, {
    productId: body.productId,
    title: body.title,
    category: body.category,
    subtitle: body.subtitle,
  });

  if (!ensured.ok) return serverError(ensured.message);

  try {
    const res = await insertWatchlistRow(supabase, {
      productId: body.productId,
      city: body.city,
    });
    if (!res.ok) {
      if (res.code === "duplicate") return json({ ok: true, duplicate: true });
      return serverError(res.message);
    }
    return json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return serverError(message);
  }
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const productId = (url.searchParams.get("productId") ?? "").trim();
  const city = (url.searchParams.get("city") ?? "").trim();

  if (!productId || !city) return badRequest("productId and city are required");

  if (!isSupabasePublicConfigured()) {
    return json({ ok: true });
  }

  const supabase = await createSupabaseRouteHandlerClient();
  if (!supabase) return json({ ok: true });

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr) return serverError("Auth error");
  if (!user) return unauthorized();

  try {
    const res = await deleteWatchlistRow(supabase, { productId, city });
    if (!res.ok) return serverError(res.message);
    return json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return serverError(message);
  }
}

const MOCK_WATCHLIST: WatchlistItemView[] = [
  {
    id: "w1",
    productId: "mock-amul-taaza-1l",
    title: "Amul Taaza 1L",
    category: "grocery",
    subtitle: "Bengaluru",
    deltaText: "↓ ₹12 today",
    hasAlert: true,
  },
  {
    id: "w2",
    productId: "mock-iphone-16-128",
    title: "iPhone 16 128GB",
    category: "electronics",
    subtitle: "Bengaluru",
    deltaText: "↑ ₹499 this week",
    hasAlert: false,
  },
  {
    id: "w3",
    productId: "mock-airport-koramangala",
    title: "Airport → Koramangala",
    category: "cabs",
    subtitle: "Bengaluru",
    deltaText: "↓ ₹18 avg",
    hasAlert: false,
  },
];
