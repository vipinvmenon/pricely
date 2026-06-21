"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { Nav } from "@/components/ui/Nav";
import { Glass } from "@/components/ui/Glass";
import { useSupabaseUser } from "@/lib/hooks/useSupabaseUser";
import { fetchJson } from "@/lib/utils/fetchJson";
import { formatINR } from "@/lib/utils/format";
import { normalizeQuery } from "@/lib/utils/format";
import type { WatchlistPageItem } from "@/types";

function SearchIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
			<circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
			<path d="M13 13l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
		</svg>
	);
}

function SearchBar({
	value,
	onChange,
	onSubmit,
	placeholder = "Search any product…",
	big = false,
}: {
	value: string;
	onChange: (v: string) => void;
	onSubmit: (e: FormEvent) => void;
	placeholder?: string;
	big?: boolean;
}) {
	return (
		<form onSubmit={onSubmit}>
			<Glass
				variant="plate"
				style={{
					display: "flex",
					alignItems: "center",
					borderRadius: "var(--r-pill)",
					padding: `0 8px 0 18px`,
					gap: 8,
				}}
			>
				<span style={{ color: "var(--text-faint)", flexShrink: 0 }}>
					<SearchIcon />
				</span>
				<input
					type="text"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder={placeholder}
					autoComplete="off"
					style={{
						flex: 1,
						background: "none",
						border: "none",
						outline: "none",
						color: "var(--text)",
						fontSize: big ? "1.0625rem" : "1rem",
						fontFamily: "inherit",
						padding: big ? "18px 4px" : "14px 4px",
					}}
				/>
				<button
					type="submit"
					style={{
						flexShrink: 0,
						background: "var(--accent)",
						border: "none",
						borderRadius: "var(--r-pill)",
						color: "#0A0A0B",
						fontSize: "0.875rem",
						fontWeight: 700,
						fontFamily: "inherit",
						padding: big ? "11px 22px" : "9px 18px",
						cursor: "pointer",
					}}
				>
					Search
				</button>
			</Glass>
		</form>
	);
}

// ── First-visit hero ──────────────────────────────────────────────────────────

const TRENDING_CHIPS = [
	"iPhone 16",
	"Sony WH-1000XM5",
	"Nike Pegasus 41",
	"MacBook Air M3",
	"Dyson V12",
];

const STATS = [
	{ value: "₹2.4Cr", label: "Saved for shoppers this year" },
	{ value: "40K+", label: "Products tracked daily" },
	{ value: "92%", label: "Of buy-calls beat waiting" },
];

const HOW_STEPS = [
	{
		n: "01",
		title: "Track",
		body: "Add anything you want to buy. Pricely starts watching every retailer that sells it.",
	},
	{
		n: "02",
		title: "Watch",
		body: "We log the price every day and learn its pattern — sale cycles, drops and restocks.",
	},
	{
		n: "03",
		title: "Decide",
		body: "When the price is genuinely good, we tell you. Buy now, or wait — always with the reason.",
	},
];

function HomeFirstVisit({
	query,
	setQuery,
	onSearch,
	onChip,
}: {
	query: string;
	setQuery: (q: string) => void;
	onSearch: (e: FormEvent) => void;
	onChip: (q: string) => void;
}) {
	return (
		<div
			className="home-inner"
			style={{ maxWidth: 1180, margin: "0 auto", padding: "36px 40px 56px" }}
		>
			{/* Eyebrow */}
			<div
				style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20 }}
			>
				<span
					style={{ position: "relative", width: 7, height: 7, display: "inline-block" }}
				>
					<span
						style={{
							position: "absolute",
							inset: 0,
							borderRadius: 4,
							background: "var(--accent)",
							display: "block",
						}}
					/>
					<span className="pulse-dot-ring" />
				</span>
				<span
					style={{
						fontFamily: "var(--font-mono)",
						fontSize: 10.5,
						color: "var(--text-dim)",
						letterSpacing: "0.06em",
					}}
				>
					PRICE INTELLIGENCE
				</span>
			</div>

			{/* Headline */}
			<h1
				style={{
					fontSize: "clamp(2.75rem, 5.5vw, 4rem)",
					lineHeight: 0.97,
					letterSpacing: "-0.035em",
					fontWeight: 500,
					color: "var(--text)",
					margin: 0,
					maxWidth: 880,
				}}
			>
				Never{" "}
				<em style={{ fontStyle: "normal", color: "var(--accent)", fontWeight: 500 }}>
					overpay
				</em>{" "}
				again.
			</h1>
			<p
				style={{
					fontSize: 17,
					lineHeight: 1.55,
					color: "var(--text-dim)",
					margin: "20px 0 0",
					maxWidth: 620,
					letterSpacing: "-0.005em",
				}}
			>
				Pricely watches the price of anything you want to buy — across Amazon, Flipkart,
				Myntra, Croma and more — and tells you the one thing that matters:{" "}
				<strong style={{ color: "var(--text)", fontWeight: 600 }}>
					buy now, or wait.
				</strong>
			</p>

			{/* Search + chips */}
			<div style={{ marginTop: 32, maxWidth: 760 }}>
				<SearchBar
					value={query}
					onChange={setQuery}
					onSubmit={onSearch}
					placeholder="Search any product…"
					big
				/>
				<div
					style={{
						marginTop: 14,
						display: "flex",
						gap: 7,
						flexWrap: "wrap",
						alignItems: "center",
					}}
				>
					<span
						style={{
							fontFamily: "var(--font-mono)",
							fontSize: 10.5,
							color: "var(--text-faint)",
							marginRight: 2,
						}}
					>
						TRY
					</span>
					{TRENDING_CHIPS.map((s) => (
						<button
							key={s}
							onClick={() => onChip(s)}
							style={{
								padding: "6px 13px",
								borderRadius: "var(--r-pill)",
								border: "1px solid var(--glass-plate-border)",
								background: "var(--glass-plate-bg)",
								color: "var(--text-dim)",
								fontSize: "0.8125rem",
								fontWeight: 500,
								fontFamily: "inherit",
								cursor: "pointer",
							}}
						>
							{s}
						</button>
					))}
				</div>
			</div>

			{/* Trust stats */}
			<div
				style={{
					display: "flex",
					gap: 52,
					marginTop: 48,
					flexWrap: "wrap",
				}}
			>
				{STATS.map((s) => (
					<div key={s.value}>
						<div
							style={{
								fontSize: "clamp(1.875rem, 3vw, 2.25rem)",
								fontWeight: 600,
								letterSpacing: "-0.045em",
								color: "var(--text)",
								lineHeight: 1,
							}}
						>
							{s.value}
						</div>
						<div
							style={{
								fontSize: 12.5,
								color: "var(--text-faint)",
								marginTop: 8,
								maxWidth: 160,
								lineHeight: 1.4,
							}}
						>
							{s.label}
						</div>
					</div>
				))}
			</div>

			{/* How it works */}
			<div style={{ marginTop: 56 }}>
				<div
					style={{
						fontFamily: "var(--font-mono)",
						fontSize: 11,
						color: "var(--text-dim)",
						letterSpacing: "0.08em",
						textTransform: "uppercase",
						marginBottom: 20,
					}}
				>
					How Pricely works
				</div>
				<div
					style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}
					className="how-grid"
				>
					{HOW_STEPS.map((s) => (
						<Glass
							key={s.n}
							variant="plate"
							style={{
								borderRadius: "var(--r-xl)",
								padding: 28,
								minHeight: 180,
								display: "flex",
								flexDirection: "column",
							}}
						>
							<span
								style={{
									fontFamily: "var(--font-mono)",
									fontSize: 12,
									color: "var(--accent)",
									letterSpacing: "0.1em",
								}}
							>
								{s.n}
							</span>
							<h3
								style={{
									fontSize: "clamp(1.25rem, 2vw, 1.625rem)",
									fontWeight: 500,
									letterSpacing: "-0.03em",
									color: "var(--text)",
									margin: "20px 0 0",
								}}
							>
								{s.title}
							</h3>
							<p
								style={{
									fontSize: 13.5,
									lineHeight: 1.55,
									color: "var(--text-dim)",
									margin: "10px 0 0",
									flex: 1,
								}}
							>
								{s.body}
							</p>
						</Glass>
					))}
				</div>
			</div>
		</div>
	);
}

// ── Returning-user feed ───────────────────────────────────────────────────────

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
		<div
			onClick={() => onNavigate(item.name)}
			style={{
				display: "grid",
				gridTemplateColumns: "12px 1fr auto",
				gap: 18,
				alignItems: "center",
				padding: "20px 4px",
				borderBottom: "1px solid var(--glass-plate-border)",
				cursor: "pointer",
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
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
					<path
						d="M6 4l4 4-4 4"
						stroke="var(--text-faint)"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</div>
		</div>
	);
}

function HomeReturning({
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

// ── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
	const router = useRouter();
	const { user, ready } = useSupabaseUser();
	const [query, setQuery] = useState("");

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
		if (q) router.push(`/compare?q=${encodeURIComponent(q)}`);
	}

	function navigateTo(q: string) {
		const normalized = normalizeQuery(q);
		if (normalized) router.push(`/compare?q=${encodeURIComponent(normalized)}`);
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
				/>
			)}
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
