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

  // Cabs
  ola: { id: "ola", name: "Ola", category: "cabs" },
  uber: { id: "uber", name: "Uber", category: "cabs" },
  rapido: { id: "rapido", name: "Rapido", category: "cabs" },
  namma_yatri: { id: "namma_yatri", name: "Namma Yatri", category: "cabs" },
  indrive: { id: "indrive", name: "InDrive", category: "cabs" },
};

