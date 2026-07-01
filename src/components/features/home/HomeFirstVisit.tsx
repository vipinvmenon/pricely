"use client";

import { FormEvent } from "react";
import { Glass } from "@/components/ui/Glass";
import { SearchBar } from "@/components/ui/SearchBar";

const TRENDING_CHIPS = [
	"iPhone 16",
	"Sony WH-1000XM5",
	"Nike Pegasus 41",
	"MacBook Air M3",
	"Dyson V12",
];

const STATS = [
	{ value: "Up to 7", label: "Supported retailers when coverage is available" },
	{ value: "Up to 90 days", label: "Price history when we have enough daily data" },
	{ value: "Buy / Wait", label: "A clear call with stated confidence" },
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

export function HomeFirstVisit({
	query,
	setQuery,
	onSearch,
	onChip,
	suggestions = [],
}: {
	query: string;
	setQuery: (q: string) => void;
	onSearch: (e: FormEvent) => void;
	onChip: (q: string) => void;
	suggestions?: string[];
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
				Pricely watches electronics and fashion prices across supported Indian
				retailers — Amazon, Flipkart, Croma, and more — and tells you the one thing
				that matters:{" "}
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
					placeholder="Search electronics or fashion…"
					big
					suggestions={suggestions}
					onSelectSuggestion={onChip}
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
			<p
				style={{
					marginTop: 16,
					fontSize: 12,
					color: "var(--text-faint)",
					maxWidth: 640,
					lineHeight: 1.5,
				}}
			>
				Coverage, freshness, and history depth vary by product, city, and retailer
				availability. Pricely shows what we could verify — not a guarantee of the
				lowest payable price.
			</p>

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
