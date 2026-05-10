import { badRequest, json, unauthorized, serverError, serviceUnavailable } from "@/lib/api/http";
import {
  alertCreateBodySchema,
  normalizeAlertCreateBody,
} from "@/lib/api/schemas/alertPost";
import { insertAlertRow } from "@/lib/alerts/db";
import {
  createSupabaseRouteHandlerClient,
  createSupabaseServiceRoleClient,
  isSupabasePublicConfigured,
  isSupabaseServiceConfigured,
} from "@/lib/db/supabase-server";
import { ensureProductRow, productExists } from "@/lib/products/ensureProduct";

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  const parsed = alertCreateBodySchema.safeParse(raw);
  if (!parsed.success) return badRequest("Invalid request body");

  const data = normalizeAlertCreateBody(parsed.data);

  if (!isSupabasePublicConfigured()) {
    return json(
      {
        ok: true,
        alertId: `a_${Math.random().toString(16).slice(2)}`,
      },
      { status: 201 },
    );
  }

  const supabase = await createSupabaseRouteHandlerClient();
  if (!supabase) {
    return json(
      {
        ok: true,
        alertId: `a_${Math.random().toString(16).slice(2)}`,
      },
      { status: 201 },
    );
  }

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr) return serverError("Auth error");
  if (!user) return unauthorized();

  if (!isSupabaseServiceConfigured()) {
    return serviceUnavailable("SUPABASE_SERVICE_ROLE_KEY is required to create alerts");
  }

  const service = createSupabaseServiceRoleClient();
  if (!service) return serviceUnavailable("Service role client unavailable");

  const exists = await productExists(service, data.productId);
  if (!exists) {
    if (!data.title || !data.category) {
      return badRequest("title and category are required when the product is not in the catalog");
    }
    const ensured = await ensureProductRow(service, {
      productId: data.productId,
      title: data.title,
      category: data.category,
    });
    if (!ensured.ok) return serverError(ensured.message);
  }

  const res = await insertAlertRow(supabase, {
    productId: data.productId,
    city: data.city,
    targetPrice: data.targetPrice,
    platformId: data.platformId,
  });

  if (!res.ok) return serverError(res.message);

  return json({ ok: true, alertId: res.alertId }, { status: 201 });
}
