import type { Metadata } from "next";

import { ProductClient } from "../_components/ProductClient";

export const metadata: Metadata = {
  title: "Product",
};

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductClient productId={id} />;
}

