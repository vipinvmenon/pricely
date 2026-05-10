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

export type City = {
  id: string;
  name: string;
  countryCode: "IN";
};

export type Verdict = {
  action: "buy" | "wait";
  confidence: number; // 0..100
  reason: string;
};

export type PriceResult = {
  platformId: PlatformId;
  platformName: string;
  category: PlatformCategory;
  price: number; // INR
  mrp?: number; // INR
  etaText?: string;
  offerText?: string;
  updatedAt: string; // ISO
  url?: string;
};

export type PriceHistoryPoint = {
  productId: string;
  date: string; // YYYY-MM-DD
  price: number; // INR
  platformId: PlatformId;
};

export type WatchlistItem = {
  id: string;
  userId: string;
  productId: string;
  cityId: string;
  createdAt: string; // ISO
};

/** API shape for GET /api/watchlist and home preview rows */
export type WatchlistItemView = {
  id: string;
  productId: string;
  title: string;
  category: PlatformCategory;
  subtitle?: string;
  deltaText?: string;
  hasAlert?: boolean;
};
