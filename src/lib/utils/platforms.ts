import type { PlatformCategory, PlatformId } from "@/types";

export type Platform = {
  id: PlatformId;
  name: string;
  category: PlatformCategory;
};

export const PLATFORMS: Record<PlatformId, Platform> = {
  // Grocery
  blinkit: { id: "blinkit", name: "Blinkit", category: "grocery" },
  zepto: { id: "zepto", name: "Zepto", category: "grocery" },
  swiggy_instamart: {
    id: "swiggy_instamart",
    name: "Swiggy Instamart",
    category: "grocery",
  },
  bigbasket: { id: "bigbasket", name: "BigBasket", category: "grocery" },
  dmart_ready: { id: "dmart_ready", name: "DMart Ready", category: "grocery" },

  // Electronics
  amazon: { id: "amazon", name: "Amazon", category: "electronics" },
  flipkart: { id: "flipkart", name: "Flipkart", category: "electronics" },
  croma: { id: "croma", name: "Croma", category: "electronics" },
  reliance_digital: {
    id: "reliance_digital",
    name: "Reliance Digital",
    category: "electronics",
  },
  vijay_sales: { id: "vijay_sales", name: "Vijay Sales", category: "electronics" },
  tata_cliq:  { id: "tata_cliq",  name: "Tata Cliq",   category: "electronics" },
  myntra:     { id: "myntra",     name: "Myntra",        category: "electronics" },

  // Cabs
  blusmart: { id: "blusmart", name: "BluSmart", category: "cabs" },
  rapido:   { id: "rapido",   name: "Rapido",   category: "cabs" },
  uber:     { id: "uber",     name: "Uber",     category: "cabs" },
  ola:      { id: "ola",      name: "Ola",      category: "cabs" },
};

