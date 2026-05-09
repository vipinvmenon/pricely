import { badRequest, json } from "../../http";
import type { PriceResult, PricesRequest } from "../../types";
import { scrapeDmartReady } from "../../providers/grocery/dmart-ready";
import { scrapeBigBasket } from "../../providers/grocery/bigbasket";
import { scrapeBlinkit } from "../../providers/grocery/blinkit";
import { scrapeZepto } from "../../providers/grocery/zepto";
import { scrapeSwiggyInstamart } from "../../providers/grocery/swiggy-instamart";

type GroceryProviderId = "dmart_ready" | "bigbasket" | "blinkit" | "zepto" | "swiggy_instamart";
type ElectronicsProviderId = "amazon" | "flipkart" | "croma" | "reliance_digital" | "vijay_sales";
type CabsProviderId = "uber" | "ola" | "rapido" | "namma_yatri" | "indrive";

export async function handlePricesV1(req: Request): Promise<Response> {
  const body = (await req.json().catch(() => null)) as unknown;
  if (!body || typeof body !== "object") return badRequest("Invalid request body");

  const raw = body as Partial<PricesRequest>;
  const category = typeof raw.category === "string" ? raw.category : null;
  if (category !== "grocery" && category !== "electronics" && category !== "cabs") {
    return badRequest("category is required");
  }

  if (category === "grocery") {
    const q = typeof raw.q === "string" ? raw.q.trim() : "";
    if (!q) return badRequest("q is required");

    const city = typeof raw.city === "string" ? raw.city : undefined;

    const allow = normalizeAllowlist(raw.platformIds);

    const jobs: Array<Promise<PriceResult | null>> = [];
    if (allow.includes("dmart_ready")) jobs.push(scrapeDmartReady({ q, city }));
    if (allow.includes("bigbasket")) jobs.push(scrapeBigBasket({ q, city }));
    if (allow.includes("blinkit")) jobs.push(scrapeBlinkit({ q, city }));
    if (allow.includes("zepto")) jobs.push(scrapeZepto({ q, city }));
    if (allow.includes("swiggy_instamart")) jobs.push(scrapeSwiggyInstamart({ q, city }));

    const settled = await Promise.allSettled(jobs);

    const results: PriceResult[] = settled
      .filter((r): r is PromiseFulfilledResult<PriceResult | null> => r.status === "fulfilled")
      .map((r) => r.value)
      .filter((v): v is PriceResult => Boolean(v));

    return json(results);
  }

  if (category === "electronics") {
    // Provider implementations will be added incrementally. Respect allowlist shape now.
    void normalizeElectronicsAllowlist(raw.platformIds);
    return json([] as PriceResult[]);
  }

  if (category === "cabs") {
    void normalizeCabsAllowlist(raw.platformIds);
    return json([] as PriceResult[]);
  }

  return json([] as PriceResult[]);
}

function normalizeAllowlist(input: unknown): GroceryProviderId[] {
  const supported: GroceryProviderId[] = ["dmart_ready", "bigbasket", "blinkit", "zepto", "swiggy_instamart"];
  if (!Array.isArray(input) || input.length === 0) return supported;

  const out: GroceryProviderId[] = [];
  for (const v of input) {
    if (v === "dmart_ready" || v === "bigbasket" || v === "blinkit" || v === "zepto" || v === "swiggy_instamart")
      out.push(v);
  }
  return out.length > 0 ? Array.from(new Set(out)) : supported;
}

function normalizeElectronicsAllowlist(input: unknown): ElectronicsProviderId[] {
  const supported: ElectronicsProviderId[] = ["amazon", "flipkart", "croma", "reliance_digital", "vijay_sales"];
  if (!Array.isArray(input) || input.length === 0) return supported;

  const out: ElectronicsProviderId[] = [];
  for (const v of input) {
    if (v === "amazon" || v === "flipkart" || v === "croma" || v === "reliance_digital" || v === "vijay_sales") out.push(v);
  }
  return out.length > 0 ? Array.from(new Set(out)) : supported;
}

function normalizeCabsAllowlist(input: unknown): CabsProviderId[] {
  const supported: CabsProviderId[] = ["uber", "ola", "rapido", "namma_yatri", "indrive"];
  if (!Array.isArray(input) || input.length === 0) return supported;

  const out: CabsProviderId[] = [];
  for (const v of input) {
    if (v === "uber" || v === "ola" || v === "rapido" || v === "namma_yatri" || v === "indrive") out.push(v);
  }
  return out.length > 0 ? Array.from(new Set(out)) : supported;
}

