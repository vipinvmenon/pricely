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

