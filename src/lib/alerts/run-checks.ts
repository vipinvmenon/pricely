import type { SupabaseClient } from "@supabase/supabase-js";

import { sendPriceAlertEmail } from "@/lib/email/resend";

const THROTTLE_MS = 24 * 60 * 60 * 1000;

type AlertRow = {
  id: string;
  user_id: string;
  product_id: string;
  city: string;
  platform_id: string | null;
  target_price: number;
  last_triggered_at: string | null;
};

function num(v: string | number): number {
  return typeof v === "number" ? v : Number(v);
}

function isThrottled(lastTriggeredAt: string | null): boolean {
  if (!lastTriggeredAt) return false;
  const t = Date.parse(lastTriggeredAt);
  if (!Number.isFinite(t)) return false;
  return Date.now() - t < THROTTLE_MS;
}

async function minObservedPrice(
  supabase: SupabaseClient,
  productId: string,
  city: string,
  platformId: string | null,
): Promise<number | null> {
  let q = supabase
    .from("price_history")
    .select("price")
    .eq("product_id", productId)
    .eq("city", city);

  if (platformId) {
    q = q.eq("platform_id", platformId);
  }

  const { data, error } = await q.order("recorded_at", { ascending: false }).limit(120);
  if (error || !data?.length) return null;
  const prices = data
    .map((r) => num((r as { price: string | number }).price))
    .filter((n) => Number.isFinite(n) && n >= 0);
  if (prices.length === 0) return null;
  return Math.min(...prices);
}

export async function runAlertChecks(supabase: SupabaseClient): Promise<{
  checked: number;
  emailsSent: number;
  skippedNoPrice: number;
  skippedThrottle: number;
  skippedNoEmail: number;
  skippedResend: boolean;
}> {
  const hasResend = Boolean(process.env.RESEND_API_KEY);

  const { data: alerts, error } = await supabase
    .from("alerts")
    .select("id, user_id, product_id, city, platform_id, target_price, last_triggered_at")
    .eq("is_active", true);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (alerts ?? []) as AlertRow[];
  let emailsSent = 0;
  let skippedNoPrice = 0;
  let skippedThrottle = 0;
  let skippedNoEmail = 0;

  for (const a of rows) {
    if (isThrottled(a.last_triggered_at)) {
      skippedThrottle += 1;
      continue;
    }

    const observed = await minObservedPrice(supabase, a.product_id, a.city, a.platform_id);
    if (observed == null) {
      skippedNoPrice += 1;
      continue;
    }

    const target = num(a.target_price);
    if (observed > target) {
      continue;
    }

    const { data: product } = await supabase
      .from("products")
      .select("title")
      .eq("id", a.product_id)
      .maybeSingle();

    const title =
      product && typeof (product as { title?: string }).title === "string"
        ? (product as { title: string }).title
        : a.product_id;

    const { data: adminUser, error: adminErr } = await supabase.auth.admin.getUserById(a.user_id);
    if (adminErr || !adminUser.user?.email) {
      skippedNoEmail += 1;
      continue;
    }

    if (!hasResend) {
      continue;
    }

    const ok = await sendPriceAlertEmail({
      to: adminUser.user.email,
      productTitle: title,
      productId: a.product_id,
      city: a.city,
      targetPrice: target,
      observedPrice: observed,
    });

    if (ok) {
      emailsSent += 1;
      await supabase
        .from("alerts")
        .update({ last_triggered_at: new Date().toISOString() })
        .eq("id", a.id);
    }
  }

  return {
    checked: rows.length,
    emailsSent,
    skippedNoPrice,
    skippedThrottle,
    skippedNoEmail,
    skippedResend: !hasResend,
  };
}
