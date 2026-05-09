import { badRequest, json } from "@/lib/api/http";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as unknown;

  const parsed = await parseAlertCreate(body);
  if (!parsed.ok) return badRequest(parsed.error);

  // Phase 7+ will persist to Supabase; keep local dev unblocked.
  return json(
    {
      ok: true,
      alertId: `a_${Math.random().toString(16).slice(2)}`,
    },
    { status: 201 }
  );
}

type AlertCreate = {
  productId: string;
  targetPrice: number;
  city: string;
  platformId?: string;
};

async function parseAlertCreate(
  input: unknown
): Promise<{ ok: true; data: AlertCreate } | { ok: false; error: string }> {
  const mod = await loadZod();
  if (mod) {
    const schema = mod.z.object({
      productId: mod.z.string().min(1),
      targetPrice: mod.z.number().finite().nonnegative(),
      city: mod.z.string().min(1),
      platformId: mod.z.string().min(1).optional(),
      platform: mod.z.string().min(1).optional(),
    });

    const res = schema.safeParse(input);
    if (!res.success) return { ok: false, error: "Invalid request body" };
    const platformId =
      typeof res.data.platformId === "string"
        ? res.data.platformId
        : typeof (res.data as unknown as { platform?: unknown }).platform === "string"
          ? (res.data as unknown as { platform: string }).platform
          : undefined;
    return { ok: true, data: { ...res.data, platformId } };
  }

  if (!input || typeof input !== "object") return { ok: false, error: "Invalid request body" };
  const obj = input as Record<string, unknown>;
  if (typeof obj.productId !== "string" || obj.productId.trim().length === 0) {
    return { ok: false, error: "productId is required" };
  }
  if (typeof obj.targetPrice !== "number" || !Number.isFinite(obj.targetPrice)) {
    return { ok: false, error: "targetPrice must be a number" };
  }
  if (typeof obj.city !== "string" || obj.city.trim().length === 0) {
    return { ok: false, error: "city is required" };
  }
  const rawPlatform = obj.platformId ?? obj.platform;
  if (rawPlatform != null && (typeof rawPlatform !== "string" || rawPlatform.trim().length === 0)) {
    return { ok: false, error: "platform must be a string" };
  }

  const data: AlertCreate = {
    productId: obj.productId.trim(),
    targetPrice: obj.targetPrice,
    city: obj.city.trim(),
    platformId: typeof rawPlatform === "string" ? rawPlatform.trim() : undefined,
  };
  return { ok: true, data };
}

type ZodModule = {
  z: {
    object: (shape: Record<string, unknown>) => {
      safeParse: (v: unknown) => { success: true; data: AlertCreate } | { success: false };
    };
    string: () => { min: (n: number) => unknown; optional: () => unknown };
    number: () => { finite: () => { nonnegative: () => unknown } };
  };
};

async function loadZod(): Promise<ZodModule | null> {
  try {
    return (await import("zod")) as unknown as ZodModule;
  } catch {
    return null;
  }
}
