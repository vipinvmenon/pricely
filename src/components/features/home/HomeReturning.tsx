"use client";

import { FormEvent } from "react";
import Link from "next/link";
import { Glass } from "@/components/ui/Glass";
import { SearchBar } from "@/components/ui/SearchBar";
import { formatINR } from "@/lib/utils/format";
import type { WatchlistPageItem } from "@/types";

interface ChangeItem {
	tone: "good" | "hit" | "wait" | "soon";
	head: string;
	sub: string;
	price: number;
	deltaPct: number;
	tag: string;
	name: string;
}

function ChangeRow({
	item,
	onNavigate,
}: {
	item: ChangeItem;
	onNavigate: (q: string) => void;
}) {
	const toneColor =
		item.tone === "good" || item.tone === "hit"
			? "var(--accent)"
			: item.tone === "wait"
				? "var(--warn)"
				: "var(--text-dim)";
	const isGood = item.tone === "good" || item.tone === "hit";

	return (
		<button
			type="button"
			onClick={() => onNavigate(item.name)}
			aria-label={`Compare prices for ${item.name}`}
			style={{
				display: "grid",
				gridTemplateColumns: "12px 1fr auto",
				gap: 18,
				alignItems: "center",
				padding: "20px 4px",
				cursor: "pointer",
				width: "100%",
				background: "transparent",
				border: "none",
				borderBottom: "1px solid var(--glass-plate-border)",
				textAlign: "left",
				font: "inherit",
				color: "inherit",
			}}
		>
			<span
				style={{
					width: 10,
					height: 10,
					borderRadius: "50%",
					background: toneColor,
					display: "block",
					marginTop: 3,
					flexShrink: 0,
				}}
			/>
			<div style={{ minWidth: 0 }}>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 10,
						marginBottom: 6,
					}}
				>
					<span
						style={{
							fontFamily: "var(--font-mono)",
							fontSize: 10,
							color: toneColor,
							letterSpacing: "0.04em",
							padding: "3px 8px",
							borderRadius: "var(--r-pill)",
							background: "var(--glass-plate-bg)",
							border: "1px solid var(--glass-plate-border)",
						}}
					>
						{item.tag.toUpperCase()}
					</span>
				</div>
				<div
					style={{
						fontSize: 17,
						fontWeight: 500,
						color: "var(--text)",
						letterSpacing: "-0.02em",
						lineHeight: 1.25,
					}}
				>
					{item.head}
				</div>
				{item.sub && (
					<div
						style={{
							fontSize: 12.5,
							color: "var(--text-faint)",
							marginTop: 5,
							lineHeight: 1.45,
						}}
					>
						{item.sub}
					</div>
				)}
			</div>
			<div style={{ display: "flex", alignItems: "center", gap: 14 }}>
				<div style={{ textAlign: "right" }}>
					<div
						style={{
							fontFamily: "var(--font-mono)",
							fontSize: 15,
							fontWeight: 600,
							color: "var(--text)",
						}}
					>
						{formatINR(item.price)}
					</div>
					{item.deltaPct !== 0 && (
						<div
							style={{
								fontFamily: "var(--font-mono)",
								fontSize: 11.5,
								color: isGood ? "var(--accent)" : "var(--text-faint)",
								marginTop: 3,
							}}
						>
							{item.deltaPct > 0 ? "+" : ""}
							{item.deltaPct}%
						</div>
					)}
				</div>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }} aria-hidden="true">
					<path
						d="M6 4l4 4-4 4"
						stroke="var(--text-faint)"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</div>
		</button>
	);
}

export function HomeReturning({
	user,
	query,
	setQuery,
	onSearch,
	onNavigate,
	watchlistItems,
}: {
	user: { email?: string; user_metadata?: { full_name?: string } } | null;
	query: string;
	setQuery: (q: string) => void;
	onSearch: (e: FormEvent) => void;
	onNavigate: (q: string) => void;
	watchlistItems: WatchlistPageItem[];
}) {
	const hour = new Date().getHours();
	const greeting =
		hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
	const firstName =
		user?.user_metadata?.full_name?.split(" ")[0] ??
		user?.email?.split("@")[0] ??
		"";

	// Derive changes from watchlist items with price movement
	const changes: ChangeItem[] = watchlistItems
		.filter((item) => {
			const oldest = item.trend[0] ?? item.now;
			return Math.abs(item.now - oldest) > 0 || item.status !== "Watching";
		})
		.slice(0, 5)
		.map((item) => {
			const oldest = item.trend[0] ?? item.now;
			const delta = item.now - oldest;
			const deltaPct = oldest > 0 ? Math.round((delta / oldest) * 100) : 0;
			const tone: ChangeItem["tone"] =
				item.status === "Target hit"
					? "hit"
					: item.status === "Just dropped"
						? "good"
						: item.status === "Holding"
							? "wait"
							: "soon";
			const head =
				item.status === "Target hit"
					? `${item.name} hit your target price`
					: delta < 0
						? `${item.name} dropped ${formatINR(Math.abs(delta))}`
						: delta > 0
							? `${item.name} is up ${formatINR(Math.abs(delta))}`
							: `${item.name} is holding steady`;
			const tag =
				item.status === "Target hit" || item.status === "Just dropped"
					? "Buy now"
					: item.status === "Holding"
						? "Hold"
						: "Watching";
			return { tone, head, sub: item.subtitle, price: item.now, deltaPct, tag, name: item.name };
		});

	const actionable = changes.filter((c) => c.tag === "Buy now").length;

	const totalSaved = watchlistItems.reduce((sum, item) => {
		const oldest = item.trend[0] ?? item.now;
		return sum + Math.max(0, oldest - item.now);
	}, 0);

	return (
		<div
			className="home-inner"
			style={{ maxWidth: 1180, margin: "0 auto", padding: "36px 40px 56px" }}
		>
			{/* Greeting */}
			<div style={{ marginBottom: 24 }}>
				<h1
					style={{
						fontSize: "clamp(1.625rem, 3vw, 2.125rem)",
						lineHeight: 1.06,
						letterSpacing: "-0.035em",
						fontWeight: 600,
						color: "var(--text)",
						margin: 0,
					}}
				>
					{greeting}
					{firstName ? `, ${firstName}` : ""}.
				</h1>
				<p
					style={{
						fontSize: 14.5,
						color: "var(--text-dim)",
						margin: "10px 0 0",
						letterSpacing: "-0.005em",
						lineHeight: 1.5,
					}}
				>
					{actionable > 0 ? (
						<>
							Mostly quiet today.{" "}
							<strong style={{ color: "var(--accent)", fontWeight: 600 }}>
								{actionable} {actionable === 1 ? "is" : "are"} worth acting on
							</strong>
							.
						</>
					) : (
						"Everything you're watching is holding steady."
					)}
				</p>
			</div>

			{/* Search — always present for returning users */}
			<div style={{ maxWidth: 760, marginBottom: 34 }}>
				<SearchBar
					value={query}
					onChange={setQuery}
					onSubmit={onSearch}
					placeholder="Search to add or compare…"
				/>
			</div>

			{/* Feed + sidebar */}
			<div
				style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 28, alignItems: "start" }}
				className="returning-grid"
			>
				{/* What changed feed */}
				<div>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							marginBottom: 12,
						}}
					>
						<span
							style={{
								fontFamily: "var(--font-mono)",
								fontSize: 11,
								color: "var(--text-dim)",
								letterSpacing: "0.08em",
								textTransform: "uppercase",
							}}
						>
							What changed
						</span>
						<span style={{ fontSize: 12, color: "var(--text-faint)" }}>
							Last 7 days · {changes.length} update{changes.length !== 1 ? "s" : ""}
						</span>
					</div>
					<div style={{ borderTop: "1px solid var(--glass-plate-border)" }}>
						{changes.length > 0 ? (
							changes.map((c, i) => (
								<ChangeRow key={i} item={c} onNavigate={onNavigate} />
							))
						) : (
							<div
								style={{
									padding: "32px 0",
									color: "var(--text-faint)",
									fontSize: 14,
									lineHeight: 1.5,
								}}
							>
								Everything you track is holding steady. We&apos;ll surface anything the moment
								it moves — no noise until then.
							</div>
						)}
					</div>
					{changes.length > 0 && (
						<p
							style={{
								marginTop: 22,
								fontSize: 13,
								color: "var(--text-faint)",
								lineHeight: 1.5,
							}}
						>
							Everything else you track is holding steady. We&apos;ll surface anything the
							moment it moves — no noise until then.
						</p>
					)}
					<div style={{ marginTop: 16 }}>
						<Link
							href="/watchlist"
							style={{
								fontSize: "0.8125rem",
								color: "var(--accent)",
								fontWeight: 600,
								textDecoration: "none",
							}}
						>
							See all watchlist →
						</Link>
					</div>
				</div>

				{/* Sidebar */}
				<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
					{/* Savings card */}
					{totalSaved > 100 && (
						<Glass
							variant="plate"
							style={{ borderRadius: "var(--r-lg)", padding: 22 }}
						>
							<div
								style={{
									fontFamily: "var(--font-mono)",
									fontSize: 10.5,
									color: "var(--text-dim)",
									letterSpacing: "0.08em",
									textTransform: "uppercase",
									marginBottom: 16,
								}}
							>
								Saved with Pricely
							</div>
							<div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
								<span
									style={{
										fontFamily: "var(--font-mono)",
										fontSize: 28,
										fontWeight: 600,
										letterSpacing: "-0.03em",
										color: "var(--text)",
									}}
								>
									{formatINR(totalSaved)}
								</span>
								<span style={{ fontSize: 12.5, color: "var(--text-dim)" }}>
									since you started watching
								</span>
							</div>
							<div
								style={{ marginTop: 12, fontSize: 12.5, color: "var(--text-faint)" }}
							>
								Watching {watchlistItems.length} product
								{watchlistItems.length !== 1 ? "s" : ""}.
							</div>
						</Glass>
					)}

					{/* You're watching list */}
					<Glass
						variant="plate"
						style={{ borderRadius: "var(--r-lg)", padding: "8px 0" }}
					>
						<div
							style={{
								fontFamily: "var(--font-mono)",
								fontSize: 10.5,
								color: "var(--text-dim)",
								letterSpacing: "0.08em",
								textTransform: "uppercase",
								padding: "10px 18px 8px",
							}}
						>
							You&apos;re watching
						</div>
						{watchlistItems.slice(0, 4).map((item, i) => {
							const isActionable =
								item.status === "Just dropped" || item.status === "Target hit";
							return (
								<button
									key={item.id}
									onClick={() => onNavigate(item.name)}
									style={{
										width: "100%",
										display: "flex",
										alignItems: "center",
										gap: 12,
										padding: "11px 18px",
										background: "none",
										border: "none",
										borderTop:
											i > 0 ? "1px solid var(--glass-plate-border)" : "none",
										cursor: "pointer",
										textAlign: "left",
									}}
								>
									<div
										style={{
											width: 32,
											height: 32,
											borderRadius: 8,
											background: "var(--bg3)",
											border: "1px solid var(--glass-plate-border)",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											fontFamily: "var(--font-mono)",
											fontSize: 10,
											fontWeight: 600,
											color: "var(--text-dim)",
											flexShrink: 0,
										}}
									>
										{item.initials}
									</div>
									<div style={{ flex: 1, minWidth: 0 }}>
										<div
											style={{
												fontSize: 13,
												fontWeight: 500,
												color: "var(--text)",
												overflow: "hidden",
												textOverflow: "ellipsis",
												whiteSpace: "nowrap",
											}}
										>
											{item.name}
										</div>
										<div
											style={{
												fontFamily: "var(--font-mono)",
												fontSize: 11,
												color: isActionable ? "var(--accent)" : "var(--text-faint)",
												marginTop: 2,
											}}
										>
											{item.status}
										</div>
									</div>
									<span
										style={{
											fontFamily: "var(--font-mono)",
											fontSize: 13,
											fontWeight: 600,
											color: "var(--text)",
											flexShrink: 0,
										}}
									>
										{formatINR(item.now)}
									</span>
								</button>
							);
						})}
						{watchlistItems.length > 4 && (
							<div
								style={{
									padding: "10px 18px",
									borderTop: "1px solid var(--glass-plate-border)",
								}}
							>
								<Link
									href="/watchlist"
									style={{
										fontSize: "0.8125rem",
										color: "var(--accent)",
										fontWeight: 600,
										textDecoration: "none",
									}}
								>
									See all {watchlistItems.length} →
								</Link>
							</div>
						)}
					</Glass>
				</div>
			</div>
		</div>
	);
}
