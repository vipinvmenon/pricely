"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR, { useSWRConfig } from "swr";
import { Nav } from "@/components/ui/Nav";
import { Glass } from "@/components/ui/Glass";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { PriceBadge } from "@/components/ui/PriceBadge";
import { RetailerRow } from "@/components/ui/RetailerRow";
import { PriceChart } from "@/components/ui/PriceChart";
import { DEFAULT_CITY, DEFAULT_COMPARE_QUERY } from "@/lib/constants";
import { useSupabaseUser } from "@/lib/hooks/useSupabaseUser";
import { trackProduct } from "@/lib/watchlist/trackProduct";
import { normalizeProductCategory } from "@/lib/utils/productCategory";
import { fetchJson } from "@/lib/utils/fetchJson";
import { normalizeQuery } from "@/lib/utils/format";
import type { CompareResponse, TrendingItem } from "@/types";

function SearchIcon() {
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 18 18"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
			<path
				d="M13 13l2.5 2.5"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
		</svg>
	);
}

function VerdictHero({
	verdict,
	lowest,
}: {
	verdict: { action: "buy" | "wait"; confidence: number; reason: string };
	lowest: { price: number; name: string } | undefined;
}) {
	const isBuy = verdict.action === "buy";
	const actionColor = isBuy ? "var(--accent)" : "var(--warn)";
	const confidence =
		verdict.confidence > 1
			? Math.round(verdict.confidence)
			: Math.round(verdict.confidence * 100);

	return (
		<Glass
			variant="plate"
			style={{
				padding: "var(--sp-8)",
				marginBottom: 24,
				borderRadius: "var(--r-xl)",
				borderLeft: `3px solid ${actionColor}`,
				background: isBuy
					? "linear-gradient(135deg, rgba(29,185,84,0.06) 0%, transparent 60%)"
					: "linear-gradient(135deg, rgba(255,192,98,0.05) 0%, transparent 60%)",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "flex-start",
					justifyContent: "space-between",
					gap: 24,
					flexWrap: "wrap",
				}}
			>
				<div>
					<div
						style={{
							fontFamily: "var(--font-mono)",
							fontSize: "0.6875rem",
							letterSpacing: "0.12em",
							textTransform: "uppercase",
							color: "var(--text-faint)",
							marginBottom: 12,
						}}
					>
						Verdict · Price Intelligence
					</div>
					<div
						className="mono"
						style={{
							fontSize: "clamp(2.25rem, 5vw, 3.25rem)",
							fontWeight: 700,
							color: actionColor,
							lineHeight: 1,
							letterSpacing: "-0.03em",
							marginBottom: 16,
						}}
					>
						{isBuy ? "BUY NOW." : "WAIT."}
					</div>
					<p
						style={{
							fontSize: "1rem",
							color: "var(--text-dim)",
							margin: 0,
							lineHeight: 1.65,
							maxWidth: 560,
						}}
					>
						{verdict.reason}
					</p>
				</div>

				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "flex-end",
						gap: 12,
						flexShrink: 0,
					}}
				>
					{confidence > 0 && (
						<Chip variant={isBuy ? "active" : "default"} size="sm">
							{confidence}% confident
						</Chip>
					)}
					{isBuy && lowest && (
						<div style={{ textAlign: "right" }}>
							<div
								style={{
									fontFamily: "var(--font-mono)",
									fontSize: "0.6875rem",
									letterSpacing: "0.08em",
									textTransform: "uppercase",
									color: "var(--text-faint)",
									marginBottom: 6,
								}}
							>
								Lowest now
							</div>
							<PriceBadge value={lowest.price} size="lg" />
							<div
								style={{
									fontSize: "0.75rem",
									color: "var(--text-dim)",
									marginTop: 4,
								}}
							>
								at {lowest.name}
							</div>
						</div>
					)}
				</div>
			</div>
		</Glass>
	);
}

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
	} = useSWR<CompareResponse>(compareUrl(activeQuery), (url: string) =>
		fetchJson<CompareResponse>(url),
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

				<form onSubmit={handleSubmit}>
					<Glass
						variant="plate"
						style={{
							display: "flex",
							alignItems: "center",
							borderRadius: "var(--r-pill)",
							padding: "0 16px",
							marginBottom: 16,
						}}
					>
						<span style={{ color: "var(--text-faint)", flexShrink: 0 }}>
							<SearchIcon />
						</span>
						<input
							type="text"
							value={inputQuery}
							onChange={(e) => setInputQuery(e.target.value)}
							placeholder="Search for any product…"
							style={{
								flex: 1,
								background: "none",
								border: "none",
								outline: "none",
								color: "var(--text)",
								fontSize: "1rem",
								fontFamily: "inherit",
								padding: "16px 12px",
							}}
						/>
						<Button variant="primary" size="md" type="submit">
							Compare
						</Button>
					</Glass>
				</form>

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
