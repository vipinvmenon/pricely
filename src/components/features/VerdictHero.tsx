"use client";

import { Glass } from "@/components/ui/Glass";
import { Chip } from "@/components/ui/Chip";
import { PriceBadge } from "@/components/ui/PriceBadge";
import type { Verdict } from "@/types";

export function VerdictHero({
	verdict,
	lowest,
}: {
	verdict: Verdict;
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
					? "linear-gradient(135deg, var(--accent-dim) 0%, transparent 60%)"
					: "linear-gradient(135deg, var(--warn-soft) 0%, transparent 60%)",
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
