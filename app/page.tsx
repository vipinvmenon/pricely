"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Nav } from "@/components/layout/Nav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { HomeFirstVisit } from "@/components/features/home/HomeFirstVisit";
import { HomeReturning } from "@/components/features/home/HomeReturning";
import { useSupabaseUser } from "@/lib/hooks/useSupabaseUser";
import { useRecentSearches } from "@/lib/hooks/useRecentSearches";
import { useSearchSuggestions } from "@/lib/hooks/useSearchSuggestions";
import { trackEvent } from "@/lib/analytics/track";
import { fetchJson } from "@/lib/utils/fetchJson";
import { normalizeQuery } from "@/lib/utils/format";
import type { WatchlistPageItem } from "@/types";

export default function HomePage() {
	const router = useRouter();
	const { user, ready } = useSupabaseUser();
	const [query, setQuery] = useState("");
	const { addRecent } = useRecentSearches();
	const suggestions = useSearchSuggestions(query);

	const { data: watchlistData } = useSWR<WatchlistPageItem[]>(
		ready && user ? "/api/watchlist" : null,
		(url: string) => fetchJson<WatchlistPageItem[]>(url),
		{
			refreshInterval: 0,
			revalidateOnFocus: false,
		},
	);

	function handleSearch(e: FormEvent) {
		e.preventDefault();
		const q = normalizeQuery(query);
		if (!q) return;
		addRecent(q);
		trackEvent("search_submitted", { query: q, source: "home" });
		router.push(`/compare?q=${encodeURIComponent(q)}`);
	}

	function navigateTo(q: string) {
		const normalized = normalizeQuery(q);
		if (!normalized) return;
		addRecent(normalized);
		trackEvent("search_submitted", { query: normalized, source: "home_chip" });
		router.push(`/compare?q=${encodeURIComponent(normalized)}`);
	}

	const watchlistItems = watchlistData ?? [];
	const isReturning = ready && !!user && watchlistItems.length > 0;

	return (
		<div style={{ minHeight: "100vh", background: "var(--bg0)" }}>
			<Nav />
			{isReturning ? (
				<HomeReturning
					user={user}
					query={query}
					setQuery={setQuery}
					onSearch={handleSearch}
					onNavigate={navigateTo}
					watchlistItems={watchlistItems}
				/>
			) : (
				<HomeFirstVisit
					query={query}
					setQuery={setQuery}
					onSearch={handleSearch}
					onChip={navigateTo}
					suggestions={suggestions}
				/>
			)}
			<SiteFooter />
			<style>{`
        .pulse-dot-ring {
          position: absolute;
          inset: -3px;
          border-radius: 6px;
          background: var(--accent);
          opacity: 0.25;
          animation: pw-pulse 2.4s ease-in-out infinite;
        }
        @keyframes pw-pulse {
          0%, 100% { transform: scale(1); opacity: 0.25; }
          50% { transform: scale(1.6); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pulse-dot-ring { animation: none; }
        }
        @media (max-width: 1024px) {
          .returning-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .how-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .home-inner { padding: 20px 20px 40px !important; }
        }
      `}</style>
		</div>
	);
}
