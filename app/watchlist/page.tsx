"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useSWR, { useSWRConfig } from "swr";
import { Nav } from "@/components/layout/Nav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Glass } from "@/components/ui/Glass";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { LoadingState, ErrorState } from "@/components/ui/LoadingState";
import { WatchlistRow } from "@/components/ui/WatchlistRow";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { fetchJson } from "@/lib/utils/fetchJson";
import { usePendingWatchlist } from "@/lib/hooks/usePendingWatchlist";
import type { WatchlistPageItem } from "@/types";

const WATCHLIST_KEY = "/api/watchlist";
const supabaseConfigured = isSupabaseConfigured();

export default function WatchlistPage() {
	const { mutate } = useSWRConfig();
	const [userId, setUserId] = useState<string | null>(null);
	const [authReady, setAuthReady] = useState(!supabaseConfigured);

	useEffect(() => {
		if (!supabaseConfigured) return;

		const supabase = createClient();

		void supabase.auth.getSession().then(({ data: { session } }) => {
			setUserId(session?.user.id ?? null);
			setAuthReady(true);
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUserId(session?.user.id ?? null);
			setAuthReady(true);
		});

		return () => subscription.unsubscribe();
	}, []);

	// Only call the API when signed in — avoids 401 noise when Supabase is configured
	const watchlistKey =
		supabaseConfigured && !userId ? null : WATCHLIST_KEY;

	const { data, isLoading, error } = useSWR<WatchlistPageItem[]>(
		watchlistKey,
		(url: string) => fetchJson<WatchlistPageItem[]>(url),
		{
			// Live enrichment fans out to compare/scrapers — load once, no polling.
			refreshInterval: 0,
			revalidateOnFocus: false,
		},
	);

	const isUnauthenticated = supabaseConfigured && authReady && !userId;
	const showLoading = !authReady || (Boolean(userId) && isLoading);

	// Flush any pending watchlist items buffered while unauthenticated
	usePendingWatchlist(Boolean(userId) && !isLoading && !error);

	const [removeConfirmId, setRemoveConfirmId] = useState<string | null>(null);

	async function handleRemove(id: string) {
		const optimistic = (data ?? []).filter((item) => item.id !== id);
		await mutate(WATCHLIST_KEY, optimistic, { revalidate: false });
		try {
			await fetchJson(`${WATCHLIST_KEY}?id=${encodeURIComponent(id)}`, {
				method: "DELETE",
			});
		} finally {
			await mutate(WATCHLIST_KEY);
			setRemoveConfirmId(null);
		}
	}

	const items = data ?? [];

	const totalSaved = items.reduce((sum, item) => {
		const savings = item.mrp ? item.mrp - item.now : 0;
		return sum + Math.max(0, savings);
	}, 0);

	const belowTarget = items.filter((item) => item.vsTarget <= 0).length;

	return (
		<div style={{ minHeight: "100vh", background: "var(--bg0)" }}>
			<Nav />

			<section
				style={{ padding: "60px 24px 40px", maxWidth: 1200, margin: "0 auto" }}
			>
				<div
					style={{
						display: "flex",
						alignItems: "flex-start",
						justifyContent: "space-between",
						flexWrap: "wrap",
						gap: 20,
						marginBottom: 40,
					}}
				>
					<div>
						<div
							style={{
								display: "inline-flex",
								alignItems: "center",
								gap: 6,
								fontSize: "0.75rem",
								fontFamily: "var(--font-mono)",
								color: "var(--text-dim)",
								letterSpacing: "0.08em",
								textTransform: "uppercase",
								marginBottom: 16,
							}}
						>
							<span className="pulse-dot" />
							Watchlist · {items.length} items
						</div>

						<h1
							style={{
								fontSize: "clamp(2rem, 4.5vw, 3rem)",
								fontWeight: 500,
								lineHeight: 0.95,
								letterSpacing: "-0.03em",
								color: "var(--text)",
								margin: 0,
							}}
						>
							Tracking quietly.{" "}
							{totalSaved > 0 && (
								<span style={{ color: "var(--accent)" }}>
									₹{totalSaved.toLocaleString("en-IN")} observed vs listed MRP
								</span>
							)}
						</h1>
					</div>

					<Link href="/compare" style={{ textDecoration: "none" }}>
						<Button variant="primary" size="md" type="button">
							+ Add product
						</Button>
					</Link>
				</div>

				{/* Stats row — only for signed-in users with data */}
				{!isUnauthenticated && items.length > 0 && (
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(4, 1fr)",
						gap: 16,
						marginBottom: 40,
					}}
					className="stats-grid"
				>
					<StatCard
						label="Tracked"
						value={String(items.length)}
						sub="products"
					/>
					<StatCard
						label="Below Target"
						value={String(belowTarget)}
						sub="items"
					/>
					<StatCard
						label="Observed vs MRP"
						value={
							totalSaved > 0 ? `₹${totalSaved.toLocaleString("en-IN")}` : "—"
						}
						sub="listed price drop"
					/>
					<StatCard
						label="Target hit"
						value={String(
							items.filter((i) => i.status === "Target hit").length,
						)}
						sub="alerts reached"
					/>
				</div>
				)}

				{/* Content area */}
				{showLoading ? (
					<LoadingState label="Loading watchlist…" />
				) : error ? (
					<Glass
						variant="plate"
						style={{
							padding: 48,
							textAlign: "center",
							borderRadius: "var(--r-lg)",
						}}
					>
						<ErrorState
							message="Could not load your watchlist. Try signing in again."
							onRetry={() => void mutate(WATCHLIST_KEY)}
						/>
					</Glass>
				) : isUnauthenticated ? (
					<Glass
						variant="plate"
						style={{
							padding: 48,
							textAlign: "center",
							borderRadius: "var(--r-lg)",
						}}
					>
						<p style={{ color: "var(--text-dim)", marginBottom: 24 }}>
							Sign in to see your watchlist
						</p>
						<a href="/signin" style={{ textDecoration: "none" }}>
							<Button variant="primary" size="md" type="button">
								Sign in
							</Button>
						</a>
					</Glass>
				) : items.length === 0 ? (
					<Glass
						variant="plate"
						style={{
							padding: 48,
							textAlign: "center",
							borderRadius: "var(--r-lg)",
						}}
					>
						<p style={{ color: "var(--text-dim)", marginBottom: 24, lineHeight: 1.6 }}>
							Your watchlist is empty. Open Compare, pick a product, then click{" "}
							<strong style={{ color: "var(--text)" }}>Track</strong> to save it
							here.
						</p>
						<Link href="/compare" style={{ textDecoration: "none" }}>
							<Button variant="primary" size="md" type="button">
								Compare products
							</Button>
						</Link>
					</Glass>
				) : (
					<Glass
						variant="plate"
						style={{ padding: "8px 0", borderRadius: "var(--r-lg)" }}
					>
						{/* Table header */}
						<div
							className="compare-table-header"
							style={{
								display: "grid",
								gridTemplateColumns: "1fr auto auto auto auto auto",
								gap: "16px",
								padding: "8px 20px 14px",
								borderBottom: "1px solid var(--glass-plate-border)",
							}}
						>
							{[
								"Product",
								"Target",
								"Now",
								"Vs. Target",
								"Trend",
								"Status",
							].map((h) => (
								<span
									key={h}
									style={{
										fontFamily: "var(--font-mono)",
										fontSize: "0.6875rem",
										letterSpacing: "0.08em",
										textTransform: "uppercase",
										color: "var(--text-faint)",
									}}
								>
									{h}
								</span>
							))}
						</div>

						{items.map((item) => (
							<WatchlistRow
								key={item.id}
								initials={item.initials}
								name={item.name}
								subtitle={item.subtitle}
								target={item.target}
								now={item.now}
								mrp={item.mrp}
								vsTarget={item.vsTarget}
								trend={item.trend}
								status={item.status}
								onRemoveRequest={() => setRemoveConfirmId(item.id)}
								removeConfirming={removeConfirmId === item.id}
								onConfirmRemove={() => void handleRemove(item.id)}
								onCancelRemove={() => setRemoveConfirmId(null)}
							/>
						))}
					</Glass>
				)}
			</section>

			<SiteFooter />

			<style>{`
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
		</div>
	);
}
