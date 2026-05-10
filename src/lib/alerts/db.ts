import type { SupabaseClient } from "@supabase/supabase-js";

export async function insertAlertRow(
  userClient: SupabaseClient,
  input: {
    productId: string;
    city: string;
    targetPrice: number;
    platformId?: string;
  },
): Promise<{ ok: true; alertId: string } | { ok: false; message: string }> {
  const { data, error } = await userClient
    .from("alerts")
    .insert({
      product_id: input.productId,
      city: input.city,
      target_price: input.targetPrice,
      platform_id: input.platformId ?? null,
    })
    .select("id")
    .single();

  if (error) return { ok: false, message: error.message };
  if (!data?.id) return { ok: false, message: "Insert returned no id" };
  return { ok: true, alertId: data.id as string };
}
