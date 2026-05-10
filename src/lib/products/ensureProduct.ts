import type { SupabaseClient } from "@supabase/supabase-js";

import type { PlatformCategory } from "@/types";

export async function ensureProductRow(
  service: SupabaseClient,
  input: {
    productId: string;
    title: string;
    category: PlatformCategory;
    subtitle?: string;
  },
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await service.from("products").upsert(
    {
      id: input.productId,
      title: input.title,
      category: input.category,
      subtitle: input.subtitle ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function productExists(
  service: SupabaseClient,
  productId: string,
): Promise<boolean> {
  const { data, error } = await service
    .from("products")
    .select("id")
    .eq("id", productId)
    .maybeSingle();

  if (error) return false;
  return data != null;
}
