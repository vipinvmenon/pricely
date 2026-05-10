import type { SupabaseClient } from "@supabase/supabase-js";

import type { PlatformCategory, WatchlistItemView } from "@/types";

type ProductEmbed = {
  id: string;
  title: string;
  category: string;
  subtitle: string | null;
};

type WatchlistSelectRow = {
  id: string;
  city: string;
  created_at: string;
  product_id: string;
  products: ProductEmbed | ProductEmbed[] | null;
};

function embedProduct(products: WatchlistSelectRow["products"]): ProductEmbed | null {
  if (products == null) return null;
  if (Array.isArray(products)) return products[0] ?? null;
  return products;
}

function isPlatformCategory(value: string): value is PlatformCategory {
  return value === "grocery" || value === "electronics" || value === "cabs";
}

export async function listWatchlistViews(userClient: SupabaseClient): Promise<WatchlistItemView[]> {
  const { data: watchRows, error: watchErr } = await userClient
    .from("watchlist")
    .select("id, city, created_at, product_id, products ( id, title, category, subtitle )")
    .order("created_at", { ascending: false });

  if (watchErr) throw new Error(watchErr.message);

  const { data: alertRows, error: alertErr } = await userClient
    .from("alerts")
    .select("product_id, city")
    .eq("is_active", true);

  if (alertErr) throw new Error(alertErr.message);

  const alertKeys = new Set(
    (alertRows ?? []).map((a: { product_id: string; city: string }) => `${a.product_id}\0${a.city}`),
  );

  const rows = (watchRows ?? []) as unknown as WatchlistSelectRow[];

  return rows
    .map((row) => {
      const p = embedProduct(row.products);
      return { row, p };
    })
    .filter(({ p }) => p != null && isPlatformCategory(p.category))
    .map(({ row, p }) => {
      const prod = p!;
      return {
        id: row.id,
        productId: row.product_id,
        title: prod.title,
        category: prod.category as PlatformCategory,
        subtitle: row.city,
        hasAlert: alertKeys.has(`${row.product_id}\0${row.city}`),
      };
    });
}

export async function insertWatchlistRow(
  userClient: SupabaseClient,
  input: { productId: string; city: string },
): Promise<{ ok: true } | { ok: false; code: "duplicate" | "unknown"; message: string }> {
  const { error } = await userClient.from("watchlist").insert({
    product_id: input.productId,
    city: input.city,
  });

  if (!error) return { ok: true };

  if (error.code === "23505") {
    return { ok: false, code: "duplicate", message: "Already on watchlist" };
  }
  return { ok: false, code: "unknown", message: error.message };
}

export async function deleteWatchlistRow(
  userClient: SupabaseClient,
  input: { productId: string; city: string },
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await userClient
    .from("watchlist")
    .delete()
    .eq("product_id", input.productId)
    .eq("city", input.city);

  if (error) return { ok: false, message: error.message };
  return { ok: true };
}
