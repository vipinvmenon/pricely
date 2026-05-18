"use client";

import useSWR, { useSWRConfig } from "swr";
import Link from "next/link";
import { Nav } from "@/components/ui/Nav";
import { Glass } from "@/components/ui/Glass";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { WatchlistRow } from "@/components/ui/WatchlistRow";
import { fetchJson, FetchJsonError } from "@/lib/utils/fetchJson";
import { usePendingWatchlist } from "@/lib/hooks/usePendingWatchlist";
import type { WatchlistPageItem } from "@/types";

const WATCHLIST_KEY = "/api/watchlist";

export default function WatchlistPage() {
	const { mutate } = useSWRConfig();
	const { data, isLoading, error } = useSWR<WatchlistPageItem[]>(
		WATCHLIST_KEY,
		(url: string) => fetchJson<WatchlistPageItem[]>(url),
	);

	const isUnauthenticated =
		error instanceof FetchJsonError && error.status === 401;

	// Flush any pending watchlist items buffered while unauthenticated
	usePendingWatchlist(!isUnauthenticated && !isLoading && !error);

	async function handleRemove(id: string) {
		const optimistic = (data ?? []).filter((item) => item.id !== id);
		await mutate(WATCHLIST_KEY, optimistic, { revalidate: false });
		try {
			await fetchJson(`${WATCHLIST_KEY}?id=${encodeURIComponent(id)}`, {
				method: "DELETE",
			});
		} finally {
			await mutate(WATCHLIST_KEY);
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
									Saved ₹{totalSaved.toLocaleString("en-IN")}
								</span>
							)}
						</h1>
					</div>

					<Button variant="primary" size="md">
						+ Add product
					</Button>
				</div>

				{/* Stats row */}
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
						label="Total Saved"
						value={
							totalSaved > 0 ? `₹${totalSaved.toLocaleString("en-IN")}` : "—"
						}
						sub="vs. MRP"
					/>
					<StatCard
						label="Tracked"
						value={String(
							items.filter((i) => i.status === "Target hit").length,
						)}
						sub="target hit"
					/>
				</div>

				{/* Content area */}
				{isLoading ? (
					<div
						style={{
							textAlign: "center",
							padding: 60,
							color: "var(--text-faint)",
							fontFamily: "var(--font-mono)",
						}}
					>
						Loading…
					</div>
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
						<Link href="/signin">
							<Button variant="primary" size="md">
								Sign in
							</Button>
						</Link>
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
						<p style={{ color: "var(--text-dim)", marginBottom: 24 }}>
							Your watchlist is empty. Search for a product and add it.
						</p>
					</Glass>
				) : (
					<Glass
						variant="plate"
						style={{ padding: "8px 0", borderRadius: "var(--r-lg)" }}
					>
						{/* Table header */}
						<div
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
								onMenu={() => handleRemove(item.id)}
							/>
						))}
					</Glass>
				)}
			</section>

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
