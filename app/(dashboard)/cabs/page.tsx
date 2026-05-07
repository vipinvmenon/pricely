import type { Metadata } from "next";

import { CabsClient } from "./_components/CabsClient";

export const metadata: Metadata = {
  title: "Cabs",
};

export default function CabsPage() {
  return <CabsClient />;
}

