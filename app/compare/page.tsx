"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR, { useSWRConfig } from "swr";
import { Nav } from "@/components/layout/Nav";
import { Glass } from "@/components/ui/Glass";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { PriceBadge } from "@/components/ui/PriceBadge";
import { RetailerRow } from "@/components/ui/RetailerRow";
import { PriceChart } from "@/components/ui/PriceChart";
import { SearchBar } from "@/components/ui/SearchBar";
import { VerdictHero } from "@/components/features/VerdictHero";
import { DEFAULT_CITY, DEFAULT_COMPARE_QUERY } from "@/lib/constants";
import { useSupabaseUser } from "@/lib/hooks/useSupabaseUser";
import { trackProduct } from "@/lib/watchlist/trackProduct";
import { normalizeProductCategory } from "@/lib/utils/productCategory";
import { fetchJson } from "@/lib/utils/fetchJson";
import { formatINR, normalizeQuery } from "@/lib/utils/format";
import type { CompareResponse, TrendingItem } from "@/types";

function compareUrl(query: string): string {
	return `/api/compare?q=${encodeURIComponent(query)}&city=${encodeURIComponent(DEFAULT_CITY)}`;
}

function ComparePageContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { mutate } = useSWRConfig();
	const { user, ready: authReady, configured } = useSupabaseUser();

	const paramQuery = searchParams.get("q")?.trim() ?? "";
	const activeQuery = paramQuery || DEFAULT_COMPARE_QUERY;

	const [inputQuery, setInputQuery] = useState(activeQuery);
	const [prevParamQuery, setPrevParamQuery] = useState(paramQuery);
	const [showAll, setShowAll] = useState(false);
	const [trackState, setTrackState] = useState<"idle" | "loading" | "done">(
		"idle",
	);
	const [trackError, setTrackError] = useState<string | null>(null);
	const [targetPrice, setTargetPrice] = useState("");
	const [alertState, setAlertState] = useState<"idle" | "loading" | "done">(
		"idle",
	);
	const [alertError, setAlertError] = useState<string | null>(null);

	// Sync input when URL param changes (React's "adjust state on render" pattern)
	if (paramQuery !== prevParamQuery) {
		setPrevParamQuery(paramQuery);
		setInputQuery(paramQuery || DEFAULT_COMPARE_QUERY);
		setShowAll(false);
	}

	const {
		data,
		error,
		isLoading,
	} = useSWR<CompareResponse>(
		compareUrl(activeQuery),
		(url: string) => fetchJson<CompareResponse>(url),
		{
			// Compare can fan out to multiple scrapers, so avoid automatic refetch storms.
			refreshInterval: 0,
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
			dedupingInterval: 300_000,
		},
	);

	const { data: trending } = useSWR<TrendingItem[]>(
		`/api/trending?city=${encodeURIComponent(DEFAULT_CITY)}`,
		(url: string) => fetchJson<TrendingItem[]>(url),
	);

	const trendingQueries =
		trending?.map((item) => item.query) ??
		[
			"iPhone 15 128GB",
			"Dyson V12",
			"Asics Novablast 4",
			"Bose QC Ultra",
			"Lego Bonsai 10281",
		];

	const retailers = data?.retailers ?? [];
	const visibleRetailers = showAll ? retailers : retailers.slice(0, 6);
	const lowest =
		retailers.find((r) => r.isLowest && r.available !== false) ??
		retailers.find((r) => r.available !== false);
	const pricedCount = retailers.filter((r) => r.available !== false).length;
	const verdict = data?.verdict;
	const productId = data?.product.id;

	// Reset transient action state when the product changes (adjust-state-during-render).
	const [trackedProductId, setTrackedProductId] = useState(productId);
	if (productId !== trackedProductId) {
		setTrackedProductId(productId);
		setTrackState("idle");
		setTrackError(null);
		setAlertState("idle");
		setAlertError(null);
	}

	// Prefill the target price from the lowest price whenever it changes.
	const priceKey =
		productId && lowest?.price ? `${productId}:${lowest.price}` : undefined;
	const [pricedFor, setPricedFor] = useState<string | undefined>(undefined);
	if (priceKey && priceKey !== pricedFor) {
		setPricedFor(priceKey);
		setTargetPrice(String(Math.round((lowest?.price ?? 0) * 0.95)));
	}

	function navigateToQuery(raw: string) {
		const q = normalizeQuery(raw);
		if (!q) return;
		router.replace(`/compare?q=${encodeURIComponent(q)}`);
	}

	function handleSubmit(e: FormEvent) {
		e.preventDefault();
		navigateToQuery(inputQuery);
	}

	async function handleTrack() {
		if (!data?.product.id || trackState === "loading") return;
		setTrackState("loading");
		setTrackError(null);
		try {
			const result = await trackProduct(
				{
					productId: data.product.id,
					city: DEFAULT_CITY,
					title: data.product.name,
					category: normalizeProductCategory(data.product.category),
					subtitle:
						[data.product.brand, data.product.category]
							.filter(Boolean)
							.join(" · ") || undefined,
					imageUrl: data.product.image,
					searchQuery: activeQuery,
				},
				Boolean(user),
			);
			if (result === "synced") {
				await mutate("/api/watchlist");
			}
			if (result === "pending") {
				router.push(
					configured
						? `/signin?next=${encodeURIComponent("/watchlist")}`
						: "/watchlist",
				);
				return;
			}
			setTrackState("done");
		} catch (err) {
			setTrackState("idle");
			const message =
				err instanceof Error ? err.message : "Could not save to watchlist.";
			setTrackError(
				message.includes("service_role")
					? "Add SUPABASE_SERVICE_ROLE_KEY to .env.local and restart the dev server."
					: message || "Could not save to watchlist. Did you run supabase/schema.sql?",
			);
		}
	}

	async function handleSetAlert() {
		if (!data?.product.id || alertState === "loading") return;

		const parsed = Number(targetPrice.replace(/[^0-9]/g, ""));
		if (!parsed || parsed <= 0) {
			setAlertError("Enter a valid target price.");
			return;
		}

		if (!user) {
			const next = `/compare?q=${encodeURIComponent(activeQuery)}`;
			router.push(
				configured
					? `/signin?next=${encodeURIComponent(next)}`
					: "/alerts",
			);
			return;
		}

		setAlertState("loading");
		setAlertError(null);
		try {
			await fetchJson("/api/alerts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					productId: data.product.id,
					city: DEFAULT_CITY,
					targetPrice: parsed,
					title: data.product.name,
					category: normalizeProductCategory(data.product.category),
					subtitle:
						[data.product.brand, data.product.category]
							.filter(Boolean)
							.join(" · ") || undefined,
					imageUrl: data.product.image,
					searchQuery: activeQuery,
				}),
			});
			await mutate("/api/alerts");
			setAlertState("done");
		} catch (err) {
			setAlertState("idle");
			const message =
				err instanceof Error ? err.message : "Could not create alert.";
			setAlertError(
				message.includes("service_role")
					? "Add SUPABASE_SERVICE_ROLE_KEY to .env.local and restart the server."
					: message || "Could not create alert. Did you run supabase/schema.sql?",
			);
		}
	}

	return (
		<div style={{ minHeight: "100vh", background: "var(--bg0)" }}>
			<Nav />

			<section
				style={{ padding: "60px 24px 40px", maxWidth: 1100, margin: "0 auto" }}
			>
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
						marginBottom: 20,
					}}
				>
					<span className="pulse-dot" />
					Price Intelligence · live
				</div>

				<h1
					style={{
						fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
						fontWeight: 500,
						lineHeight: 0.95,
						letterSpacing: "-0.03em",
						color: "var(--text)",
						margin: "0 0 40px",
					}}
				>
					What are you <span style={{ color: "var(--accent)" }}>actually</span>
					<br />
					buying?
				</h1>

				<div style={{ marginBottom: 16 }}>
					<SearchBar
						value={inputQuery}
						onChange={setInputQuery}
						onSubmit={handleSubmit}
						placeholder="Search for any product…"
						submitLabel="Compare"
						ariaLabel="Search products to compare"
					/>
				</div>

				<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
					{trendingQueries.map((q) => (
						<Chip
							key={q}
							variant={normalizeQuery(q) === normalizeQuery(activeQuery) ? "active" : "default"}
							size="sm"
							onClick={() => navigateToQuery(q)}
						>
							{q}
						</Chip>
					))}
				</div>
			</section>

			{isLoading ? (
				<div
					style={{
						textAlign: "center",
						padding: "60px 24px",
						color: "var(--text-faint)",
						fontFamily: "var(--font-mono)",
					}}
				>
					Loading…
				</div>
			) : error ? (
				<div
					style={{
						textAlign: "center",
						padding: "60px 24px",
						color: "var(--danger)",
						fontFamily: "var(--font-mono)",
					}}
				>
					Could not load prices. Try again.
				</div>
			) : data ? (
				<section
					style={{ padding: "0 24px 60px", maxWidth: 1100, margin: "0 auto" }}
				>
					{verdict && (
						<VerdictHero verdict={verdict} lowest={lowest} />
					)}

					<div
						style={{
							display: "grid",
							gridTemplateColumns: "320px 1fr",
							gap: 24,
						}}
						className="compare-grid"
					>
						<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
							<Glass
								variant="plate"
								style={{
									borderRadius: "var(--r-xl)",
									aspectRatio: "4/3",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<span
									style={{
										fontFamily: "var(--font-mono)",
										fontSize: "0.6875rem",
										letterSpacing: "0.1em",
										textTransform: "uppercase",
										color: "var(--text-faint)",
									}}
								>
									Product image
								</span>
							</Glass>

							<div>
								<div
									style={{
										fontFamily: "var(--font-mono)",
										fontSize: "0.6875rem",
										letterSpacing: "0.12em",
										textTransform: "uppercase",
										color: "var(--text-faint)",
										marginBottom: 8,
									}}
								>
									{data.product.brand} · {data.product.category}
								</div>
								<h2
									style={{
										fontSize: "1.375rem",
										fontWeight: 600,
										color: "var(--text)",
										margin: "0 0 16px",
										lineHeight: 1.3,
									}}
								>
									{data.product.name}
								</h2>

								<div
									style={{
										display: "flex",
										alignItems: "baseline",
										gap: 10,
										marginBottom: 6,
									}}
								>
									<PriceBadge value={lowest?.price ?? 0} size="lg" />
									{lowest?.mrp && (
										<PriceBadge value={lowest.mrp} size="sm" strike />
									)}
									{lowest?.mrp && lowest?.price && (
										<span
											style={{
												fontSize: "0.875rem",
												fontWeight: 700,
												color: "var(--accent)",
											}}
										>
											-
											{Math.round(
												((lowest.mrp - lowest.price) / lowest.mrp) * 100,
											)}
											%
										</span>
									)}
								</div>
							</div>

							{trackError && (
								<p
									style={{
										fontSize: "0.8125rem",
										color: "var(--danger)",
										margin: 0,
										lineHeight: 1.5,
									}}
								>
									{trackError}
								</p>
							)}

							<div style={{ display: "flex", gap: 10 }}>
								<Button
									variant="primary"
									size="md"
									style={{ flex: 1 }}
									disabled={!lowest?.buyUrl}
									onClick={() => {
										if (lowest?.buyUrl) window.open(lowest.buyUrl, "_blank");
									}}
								>
									Buy at {lowest?.name ?? "retailer"}
								</Button>
								<Button
									variant="ghost"
									size="md"
									style={{ flex: 1 }}
									disabled={!authReady || trackState === "loading"}
									onClick={() => void handleTrack()}
								>
									{trackState === "done"
										? "Tracked"
										: trackState === "loading"
											? "Saving…"
											: "Track"}
								</Button>
							</div>
							{trackState === "done" && (
								<Link
									href="/watchlist"
									style={{
										fontSize: "0.8125rem",
										color: "var(--accent)",
										fontWeight: 600,
										textDecoration: "none",
									}}
								>
									View watchlist →
								</Link>
							)}

							<Glass
								variant="plate"
								style={{
									padding: "var(--sp-4)",
									borderRadius: "var(--r-lg)",
									display: "flex",
									flexDirection: "column",
									gap: 12,
								}}
							>
								<div
									style={{
										fontFamily: "var(--font-mono)",
										fontSize: "0.6875rem",
										letterSpacing: "0.1em",
										textTransform: "uppercase",
										color: "var(--text-faint)",
									}}
								>
									Price alert
								</div>
								<label
									style={{
										fontSize: "0.8125rem",
										color: "var(--text-dim)",
										display: "flex",
										flexDirection: "column",
										gap: 8,
									}}
								>
									Notify me when price drops below
									<Glass
										variant="plate"
										style={{
											display: "flex",
											alignItems: "center",
											borderRadius: "var(--r-md)",
											padding: "0 12px",
										}}
									>
										<span
											style={{
												color: "var(--text-faint)",
												fontFamily: "var(--font-mono)",
												fontSize: "0.875rem",
											}}
										>
											₹
										</span>
										<input
											type="text"
											inputMode="numeric"
											value={targetPrice}
											onChange={(e) =>
												setTargetPrice(
													e.target.value.replace(/[^0-9]/g, ""),
												)
											}
											placeholder={
												lowest?.price
													? String(Math.round(lowest.price * 0.95))
													: "0"
											}
											style={{
												flex: 1,
												background: "none",
												border: "none",
												outline: "none",
												color: "var(--text)",
												fontSize: "1rem",
												fontFamily: "var(--font-mono)",
												padding: "12px 8px",
											}}
										/>
									</Glass>
								</label>
								{lowest?.price ? (
									<p
										style={{
											fontSize: "0.75rem",
											color: "var(--text-faint)",
											margin: 0,
										}}
									>
										Lowest now: {formatINR(lowest.price)}
									</p>
								) : null}
								{alertError && (
									<p
										style={{
											fontSize: "0.8125rem",
											color: "var(--danger)",
											margin: 0,
											lineHeight: 1.5,
										}}
									>
										{alertError}
									</p>
								)}
								<Button
									variant="ghost"
									size="md"
									fullWidth
									disabled={!authReady || alertState === "loading"}
									onClick={() => void handleSetAlert()}
								>
									{alertState === "done"
										? "Alert set"
										: alertState === "loading"
											? "Saving…"
											: "Set alert"}
								</Button>
								{alertState === "done" && (
									<Link
										href="/alerts"
										style={{
											fontSize: "0.8125rem",
											color: "var(--accent)",
											fontWeight: 600,
											textDecoration: "none",
											textAlign: "center",
										}}
									>
										View alerts →
									</Link>
								)}
							</Glass>
						</div>

						<div>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									marginBottom: 16,
									flexWrap: "wrap",
									gap: 12,
								}}
							>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										gap: 8,
										fontSize: "0.875rem",
										color: "var(--text-dim)",
									}}
								>
									<span className="pulse-dot" />
									{pricedCount} priced · {retailers.length} retailers tracked
								</div>
								<div style={{ display: "flex", gap: 8 }}>
									{["Price", "Delivery", "Trust"].map((s, i) => (
										<Chip
											key={s}
											size="sm"
											variant={i === 0 ? "active" : "default"}
										>
											{s}
										</Chip>
									))}
								</div>
							</div>

							<Glass
								variant="plate"
								style={{ padding: "8px 0", borderRadius: "var(--r-lg)" }}
							>
								<div
									style={{
										display: "grid",
										gridTemplateColumns: "32px 1fr auto auto auto auto auto",
										gap: "16px",
										padding: "8px 20px 12px",
										borderBottom: "1px solid var(--glass-plate-border)",
									}}
								>
									{[
										"#",
										"Retailer",
										"Price",
										"Delivery",
										"Returns",
										"Stock",
										"",
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

								{visibleRetailers.map((r) => (
									<RetailerRow
										key={`${r.rank}-${r.name}`}
										rank={r.rank}
										name={r.name}
										isLowest={r.isLowest}
										available={r.available}
										price={r.price}
										mrp={r.mrp}
										delivery={r.delivery}
										returns={r.returns}
										stock={r.stock}
										onBuy={() => {
											if (r.buyUrl) window.open(r.buyUrl, "_blank");
										}}
									/>
								))}

								{retailers.length > 6 && (
									<div
										style={{
											padding: "12px 20px",
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
											borderTop: "1px solid var(--glass-plate-border)",
										}}
									>
										<span
											style={{
												fontSize: "0.8125rem",
												color: "var(--text-faint)",
											}}
										>
											+ {retailers.length - 6} more retailers
										</span>
										<button
											type="button"
											onClick={() => setShowAll(!showAll)}
											style={{
												background: "none",
												border: "none",
												cursor: "pointer",
												color: "var(--accent)",
												fontSize: "0.8125rem",
												fontWeight: 600,
												fontFamily: "inherit",
											}}
										>
											{showAll ? "Show less" : "Show all →"}
										</button>
									</div>
								)}
							</Glass>
						</div>
					</div>

					{data.history.length > 0 && (
						<div style={{ marginTop: 48 }}>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: 8,
									fontSize: "0.8125rem",
									color: "var(--text-dim)",
									marginBottom: 16,
								}}
							>
								<span className="pulse-dot" />
								Price history · last 90 days
							</div>

							<h2
								style={{
									fontSize: "1.75rem",
									fontWeight: 500,
									letterSpacing: "-0.02em",
									color: "var(--text)",
									margin: "0 0 24px",
								}}
							>
								{verdict?.action === "buy" ? (
									<>
										Currently the{" "}
										<span style={{ color: "var(--accent)" }}>lowest</span> in
										recent months.
									</>
								) : verdict?.action === "wait" ? (
									<>
										It{"’"}s been{" "}
										<span style={{ color: "var(--warn)" }}>cheaper before</span>.
										Hold off.
									</>
								) : (
									<>Price trend over the last 90 days.</>
								)}
							</h2>

							<Glass variant="plate" style={{ padding: "var(--sp-6)" }}>
								<PriceChart data={data.history} />
							</Glass>
						</div>
					)}
				</section>
			) : null}

			<style>{`
        @media (max-width: 900px) {
          .compare-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
		</div>
	);
}

export default function ComparePage() {
	return (
		<Suspense
			fallback={
				<div style={{ minHeight: "100vh", background: "var(--bg0)" }}>
					<Nav />
					<div
						style={{
							textAlign: "center",
							padding: "120px 24px",
							color: "var(--text-faint)",
							fontFamily: "var(--font-mono)",
						}}
					>
						Loading…
					</div>
				</div>
			}
		>
			<ComparePageContent />
		</Suspense>
	);
}
