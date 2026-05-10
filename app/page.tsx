"use client";

import { Nav } from "@/components/ui/Nav";
import { Glass } from "@/components/ui/Glass";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { formatINR } from "@/lib/utils/format";

const WATCHLIST_PREVIEW = [
	{ name: "Sony WH-1000XM5", retailer: "Amazon", price: 23450, save: 6540 },
	{
		name: 'Apple iPad Air 11"',
		retailer: "Flipkart",
		price: 58999,
		save: 5901,
	},
	{
		name: "Dyson V12 Detect Slim",
		retailer: "Amazon",
		price: 44990,
		save: 7910,
	},
	{ name: "Asics Novablast 4", retailer: "Flipkart", price: 8249, save: 4750 },
];

function TrackIllustration() {
	return (
		<svg
			viewBox="0 0 160 80"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			style={{ width: "100%", height: 80 }}
		>
			<polyline
				points="0,60 20,50 40,55 60,35 80,45 100,25 120,30 140,15 160,20"
				stroke="var(--accent)"
				strokeWidth="2"
				strokeLinejoin="round"
				strokeLinecap="round"
				fill="none"
				opacity="0.8"
			/>
			<circle cx="160" cy="20" r="4" fill="var(--accent)" />
		</svg>
	);
}

function CompareIllustration() {
	const bars = [
		{ height: 50, accent: false },
		{ height: 70, accent: false },
		{ height: 90, accent: true },
		{ height: 60, accent: false },
		{ height: 80, accent: false },
		{ height: 45, accent: false },
		{ height: 65, accent: false },
	];
	return (
		<svg
			viewBox="0 0 160 80"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			style={{ width: "100%", height: 80 }}
		>
			{bars.map((b, i) => (
				<rect
					key={i}
					x={i * 22 + 4}
					y={80 - b.height}
					width={16}
					height={b.height}
					rx="3"
					fill={b.accent ? "var(--accent)" : "rgba(255,255,255,0.12)"}
				/>
			))}
		</svg>
	);
}

function ForecastIllustration() {
	return (
		<svg
			viewBox="0 0 160 80"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			style={{ width: "100%", height: 80 }}
		>
			<polyline
				points="0,60 30,55 60,45 90,40 110,38"
				stroke="var(--accent)"
				strokeWidth="2"
				strokeLinejoin="round"
				fill="none"
			/>
			<polyline
				points="110,38 140,28 160,22"
				stroke="var(--accent)"
				strokeWidth="2"
				strokeLinejoin="round"
				strokeDasharray="4 3"
				fill="none"
				opacity="0.5"
			/>
			<line
				x1="110"
				y1="0"
				x2="110"
				y2="80"
				stroke="rgba(255,255,255,0.12)"
				strokeWidth="1"
				strokeDasharray="3 3"
			/>
			<text
				x="104"
				y="74"
				style={{
					fontFamily: "var(--font-mono)",
					fontSize: 8,
					fill: "var(--accent)",
				}}
			>
				NOW
			</text>
			<text
				x="144"
				y="18"
				style={{
					fontFamily: "var(--font-mono)",
					fontSize: 8,
					fill: "rgba(255,255,255,0.4)",
				}}
			>
				+30d
			</text>
		</svg>
	);
}

const HOW_IT_WORKS = [
	{
		label: "01 / Track",
		heading: "Add anything to your watchlist",
		body: "Search for any product and set your target price. Pricely monitors it in real time across 12 retailers.",
		visual: <TrackIllustration />,
	},
	{
		label: "02 / Compare",
		heading: "See every retailer at once",
		body: "Side-by-side price tables updated every 5 minutes. Delivery, returns, stock status — all visible instantly.",
		visual: <CompareIllustration />,
	},
	{
		label: "03 / Save",
		heading: "Buy when the model says buy",
		body: "Our price model analyses 12 months of history and tells you whether to buy now or wait for a better drop.",
		visual: <ForecastIllustration />,
	},
];

const SALE_CALENDAR = [
	{ name: "Amazon Sale", dates: "12–14", color: "var(--accent)" },
	{ name: "Flipkart BBD", dates: "25–27", color: "#4F8EF7" },
];

export default function HomePage() {
	return (
		<div style={{ minHeight: "100vh", background: "var(--bg0)" }}>
			<Nav />

			{/* Hero section */}
			<section
				style={{
					position: "relative",
					minHeight: "90vh",
					display: "flex",
					alignItems: "center",
					padding: "80px 24px 60px",
					overflow: "hidden",
				}}
			>
				<div
					aria-hidden
					style={{
						position: "absolute",
						inset: 0,
						background:
							"radial-gradient(ellipse 60% 40% at 20% 50%, rgba(30,215,96,0.07) 0%, transparent 70%)",
						pointerEvents: "none",
					}}
				/>

				<div
					style={{
						maxWidth: 1200,
						margin: "0 auto",
						width: "100%",
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: "80px",
						alignItems: "center",
						position: "relative",
						zIndex: 1,
					}}
					className="hero-grid"
				>
					{/* Left — headline */}
					<div>
						<div style={{ marginBottom: 32 }}>
							<Chip variant="active" withDot size="sm">
								Live across 12 Indian retailers
							</Chip>
						</div>

						<h1
							className="hero-headline"
							style={{
								fontSize: "clamp(4rem, 8vw, 6rem)",
								fontWeight: 500,
								lineHeight: 0.92,
								letterSpacing: "-0.04em",
								color: "var(--text)",
								margin: "0 0 40px",
							}}
						>
							Never
							<br />
							<span style={{ color: "var(--accent)" }}>overpay</span>
							<br />
							again.
						</h1>

						<div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
							<Button variant="primary" size="lg">
								Track a product
							</Button>
							<Button variant="ghost" size="lg">
								How it works →
							</Button>
						</div>
					</div>

					{/* Right — stats */}
					<div>
						<p
							style={{
								fontSize: "1.125rem",
								color: "var(--text-dim)",
								lineHeight: 1.65,
								marginBottom: 40,
							}}
						>
							Pricely watches prices across Blinkit, Zepto, Amazon, Flipkart,
							Croma and 7 more — so you never have to open 12 tabs again. Set a
							target, get alerted, save money.
						</p>

						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(3, 1fr)",
								gap: 24,
							}}
						>
							{[
								{ value: "₹14.2L", label: "Saved this month" },
								{ value: "2.1M", label: "Prices tracked daily" },
								{ value: "9.4×", label: "Faster than manual" },
							].map((stat) => (
								<div key={stat.label}>
									<div
										className="mono"
										style={{
											fontSize: "1.75rem",
											fontWeight: 600,
											color: "var(--text)",
											lineHeight: 1.1,
											marginBottom: 4,
										}}
									>
										{stat.value}
									</div>
									<div
										style={{ fontSize: "0.8125rem", color: "var(--text-dim)" }}
									>
										{stat.label}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* How it works */}
			<section
				style={{ padding: "0 24px 100px", maxWidth: 1200, margin: "0 auto" }}
			>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(3, 1fr)",
						gap: 20,
					}}
					className="how-grid"
				>
					{HOW_IT_WORKS.map((card) => (
						<Glass
							key={card.label}
							variant="plate"
							style={{ padding: "var(--sp-8)" }}
						>
							<div
								style={{
									fontFamily: "var(--font-mono)",
									fontSize: "0.6875rem",
									fontWeight: 700,
									letterSpacing: "0.12em",
									textTransform: "uppercase",
									color: "var(--accent)",
									marginBottom: "var(--sp-4)",
								}}
							>
								{card.label}
							</div>
							<div style={{ marginBottom: "var(--sp-4)" }}>{card.visual}</div>
							<h3
								style={{
									fontSize: "1.125rem",
									fontWeight: 600,
									color: "var(--text)",
									margin: "0 0 12px",
									lineHeight: 1.3,
								}}
							>
								{card.heading}
							</h3>
							<p
								style={{
									fontSize: "0.9rem",
									color: "var(--text-dim)",
									lineHeight: 1.65,
									margin: 0,
								}}
							>
								{card.body}
							</p>
						</Glass>
					))}
				</div>
			</section>

			{/* "What it feels like" editorial section */}
			<section
				style={{ padding: "0 24px 100px", maxWidth: 1200, margin: "0 auto" }}
			>
				<h2
					style={{
						fontSize: "clamp(1.75rem, 4vw, 3rem)",
						fontWeight: 500,
						lineHeight: 1.15,
						letterSpacing: "-0.02em",
						color: "var(--text)",
						marginBottom: 48,
						maxWidth: 700,
					}}
				>
					A quiet assistant that does the haggling —
					<br />
					<span style={{ color: "var(--accent)" }}>actually saving.</span>
				</h2>

				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: 20,
					}}
					className="editorial-grid"
				>
					{/* Watchlist preview card */}
					<Glass variant="plate" style={{ padding: "var(--sp-6)" }}>
						<div
							style={{
								fontSize: "0.8125rem",
								fontWeight: 600,
								color: "var(--text-dim)",
								marginBottom: 20,
								display: "flex",
								alignItems: "center",
								gap: 6,
							}}
						>
							<span className="pulse-dot" />
							Your watchlist · 4 active
						</div>
						<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
							{WATCHLIST_PREVIEW.map((item) => (
								<div
									key={item.name}
									style={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										gap: 12,
									}}
								>
									<div>
										<div
											style={{
												fontSize: "0.875rem",
												fontWeight: 500,
												color: "var(--text)",
											}}
										>
											{item.name}
										</div>
										<div
											style={{
												fontSize: "0.75rem",
												color: "var(--text-faint)",
											}}
										>
											{item.retailer}
										</div>
									</div>
									<div style={{ textAlign: "right", flexShrink: 0 }}>
										<div
											className="mono"
											style={{
												fontSize: "0.9375rem",
												fontWeight: 600,
												color: "var(--text)",
											}}
										>
											{formatINR(item.price)}
										</div>
										<div style={{ fontSize: "0.75rem", color: "var(--save)" }}>
											Save {formatINR(item.save)}
										</div>
									</div>
								</div>
							))}
						</div>
					</Glass>

					{/* Sale calendar card */}
					<Glass variant="plate" style={{ padding: "var(--sp-6)" }}>
						<div
							style={{
								fontSize: "0.8125rem",
								fontWeight: 600,
								color: "var(--text-dim)",
								marginBottom: 20,
							}}
						>
							Sale calendar · next 30 days
						</div>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(7, 1fr)",
								gap: 4,
							}}
						>
							{Array.from({ length: 30 }, (_, i) => {
								const day = i + 1;
								const amazon = day >= 12 && day <= 14;
								const flipkart = day >= 25 && day <= 27;
								return (
									<div
										key={day}
										style={{
											aspectRatio: "1",
											borderRadius: "var(--r-xs)",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											fontSize: "0.6875rem",
											fontFamily: "var(--font-mono)",
											background: amazon
												? "rgba(30,215,96,0.2)"
												: flipkart
													? "rgba(79,142,247,0.2)"
													: "var(--bg3)",
											color: amazon
												? "var(--accent)"
												: flipkart
													? "#4F8EF7"
													: "var(--text-faint)",
											border: amazon
												? "1px solid rgba(30,215,96,0.35)"
												: flipkart
													? "1px solid rgba(79,142,247,0.35)"
													: "1px solid transparent",
										}}
									>
										{day}
									</div>
								);
							})}
						</div>
						<div style={{ display: "flex", gap: 16, marginTop: 16 }}>
							{SALE_CALENDAR.map((s) => (
								<div
									key={s.name}
									style={{ display: "flex", alignItems: "center", gap: 6 }}
								>
									<span
										style={{
											display: "inline-block",
											width: 10,
											height: 10,
											borderRadius: 2,
											background: s.color,
											opacity: 0.7,
										}}
									/>
									<span
										style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}
									>
										{s.name} {s.dates}
									</span>
								</div>
							))}
						</div>
					</Glass>
				</div>
			</section>

			<style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .how-grid { grid-template-columns: 1fr !important; }
          .editorial-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
		</div>
	);
}
