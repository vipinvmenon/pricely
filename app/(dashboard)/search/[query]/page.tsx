import type { Metadata } from "next";

import { SearchResultsClient } from "../_components/SearchResultsClient";
import { normalizeQuery } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Search",
};

export default async function SearchResultsPage({
  params,
}: {
  params: Promise<{ query: string }>;
}) {
  const { query } = await params;
  const decoded = normalizeQuery(decodeURIComponent(query));

  return <SearchResultsClient query={decoded} />;
}

