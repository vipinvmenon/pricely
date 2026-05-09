export type PlatformCategory = "grocery" | "electronics" | "cabs";

export type PlatformId =
  | "blinkit"
  | "zepto"
  | "swiggy_instamart"
  | "bigbasket"
  | "dmart_ready"
  | "amazon"
  | "flipkart"
  | "croma"
  | "reliance_digital"
  | "vijay_sales"
  | "ola"
  | "uber"
  | "rapido"
  | "namma_yatri"
  | "indrive";

export type PriceResult = {
  platformId: PlatformId;
  platformName: string;
  category: PlatformCategory;
  price: number;
  mrp?: number;
  etaText?: string;
  offerText?: string;
  updatedAt: string;
  url?: string;
};

export type PricesRequest = {
  category: PlatformCategory;
  platformIds?: PlatformId[];
  q?: string;
  city?: string;
  from_lat?: number;
  from_lng?: number;
  to_lat?: number;
  to_lng?: number;
};

