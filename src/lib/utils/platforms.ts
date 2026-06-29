import type { PlatformId } from "@/types";

export type Platform = {
  id: PlatformId;
  name: string;
};

export const PLATFORMS: Record<PlatformId, Platform> = {
  amazon:           { id: "amazon",           name: "Amazon" },
  flipkart:         { id: "flipkart",         name: "Flipkart" },
  croma:            { id: "croma",            name: "Croma" },
  reliance_digital: { id: "reliance_digital", name: "Reliance Digital" },
  vijay_sales:      { id: "vijay_sales",      name: "Vijay Sales" },
  tata_cliq:        { id: "tata_cliq",        name: "Tata Cliq" },
  myntra:           { id: "myntra",           name: "Myntra" },
};

/** Canonical list of supported retailer ids — the single source for scrape fan-out. */
export const SUPPORTED_PLATFORM_IDS = Object.keys(PLATFORMS) as PlatformId[];

/** Display name for a platform id, falling back to the raw id. */
export function platformName(id: PlatformId | string): string {
  return PLATFORMS[id as PlatformId]?.name ?? String(id);
}

