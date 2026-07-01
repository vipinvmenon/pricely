"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useSWR, { useSWRConfig } from "swr";
import { Nav } from "@/components/layout/Nav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Glass } from "@/components/ui/Glass";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { AlertRow } from "@/components/ui/AlertRow";
import { LoadingState, ErrorState } from "@/components/ui/LoadingState";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { usePendingAlert } from "@/lib/hooks/usePendingAlert";
import { fetchJson } from "@/lib/utils/fetchJson";
import type { AlertPageItem } from "@/types";

const ALERTS_KEY = "/api/alerts";
const supabaseConfigured = isSupabaseConfigured();

function initials(title: string): string {
	return title
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((w) => w[0]?.toUpperCase() ?? "")
		.join("");
}

export default function AlertsPage() {
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

	const alertsKey = supabaseConfigured && !userId ? null : ALERTS_KEY;

	const { data, isLoading, error } = useSWR<AlertPageItem[]>(
		alertsKey,
		(url: string) => fetchJson<AlertPageItem[]>(url),
	);

	const isUnauthenticated = supabaseConfigured && authReady && !userId;
	const showLoading = !authReady || (Boolean(userId) && isLoading);

	const [removeConfirmId, setRemoveConfirmId] = useState<string | null>(null);
	const [toggleLoadingId, setToggleLoadingId] = useState<string | null>(null);

	usePendingAlert(Boolean(userId) && authReady);

	async function handleDelete(id: string) {
		const optimistic = (data ?? []).filter((item) => item.id !== id);
		await mutate(ALERTS_KEY, optimistic, { revalidate: false });
		try {
			await fetchJson(`${ALERTS_KEY}?id=${encodeURIComponent(id)}`, {
				method: "DELETE",
			});
		} finally {
			await mutate(ALERTS_KEY);
			setRemoveConfirmId(null);
		}
	}

	async function handleToggleActive(id: string, isActive: boolean) {
		const optimistic = (data ?? []).map((item) =>
			item.id === id ? { ...item, isActive: !isActive } : item,
		);
		setToggleLoadingId(id);
		await mutate(ALERTS_KEY, optimistic, { revalidate: false });
		try {
			await fetchJson("/api/alerts", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id, isActive: !isActive }),
			});
		} finally {
			await mutate(ALERTS_KEY);
			setToggleLoadingId(null);
		}
	}

	const items = data ?? [];
	const activeCount = items.filter((i) => i.isActive && !i.lastTriggeredAt).length;
	const triggeredCount = items.filter((i) => Boolean(i.lastTriggeredAt)).length;

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
							Alerts · {activeCount} active
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
							Watching quietly.{" "}
							{triggeredCount > 0 && (
								<span style={{ color: "var(--save)" }}>
									{triggeredCount} hit.
								</span>
							)}
						</h1>
					</div>

					<Link href="/compare" style={{ textDecoration: "none" }}>
						<Button variant="primary" size="md" type="button">
							+ Set alert
						</Button>
					</Link>
				</div>

				{/* Stats row */}
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(3, 1fr)",
						gap: 16,
						marginBottom: 40,
					}}
					className="alerts-stats-grid"
				>
					<StatCard label="Tracking" value={String(items.length)} sub="products" />
					<StatCard label="Active" value={String(activeCount)} sub="watching" />
					<StatCard
						label="Triggered"
						value={String(triggeredCount)}
						sub="target hit"
					/>
				</div>

				{/* Content */}
				{showLoading ? (
					<LoadingState label="Loading alerts…" />
				) : error ? (
					<Glass
						variant="plate"
						style={{ padding: 48, textAlign: "center", borderRadius: "var(--r-lg)" }}
					>
						<ErrorState
							message="Could not load your alerts. Try signing in again."
							onRetry={() => void mutate(ALERTS_KEY)}
						/>
					</Glass>
				) : isUnauthenticated ? (
					<Glass
						variant="plate"
						style={{ padding: 48, textAlign: "center", borderRadius: "var(--r-lg)" }}
					>
						<p style={{ color: "var(--text-dim)", marginBottom: 24 }}>
							Sign in to see your alerts
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
						style={{ padding: 48, textAlign: "center", borderRadius: "var(--r-lg)" }}
					>
						<p
							style={{
								color: "var(--text-dim)",
								marginBottom: 24,
								lineHeight: 1.6,
							}}
						>
							No alerts yet. Find a product on{" "}
							<strong style={{ color: "var(--text)" }}>Compare</strong>, check the
							verdict, then set a target price to get notified when it drops.
						</p>
						<Link href="/compare" style={{ textDecoration: "none" }}>
							<Button variant="primary" size="md" type="button">
								Find a product
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
								gridTemplateColumns: "1fr auto auto auto auto",
								gap: "16px",
								padding: "8px 20px 14px",
								borderBottom: "1px solid var(--glass-plate-border)",
							}}
						>
							{["Product", "Target", "Status", "Date", ""].map((h) => (
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
							<AlertRow
								key={item.id}
								initials={initials(item.productTitle)}
								name={item.productTitle}
								subtitle={item.productSubtitle}
								targetPrice={item.targetPrice}
								isActive={item.isActive}
								lastTriggeredAt={item.lastTriggeredAt}
								createdAt={item.createdAt}
								lastDeliveryStatus={item.lastDeliveryStatus}
								lastDeliveryError={item.lastDeliveryError}
								onRemoveRequest={() => setRemoveConfirmId(item.id)}
								removeConfirming={removeConfirmId === item.id}
								onConfirmRemove={() => void handleDelete(item.id)}
								onCancelRemove={() => setRemoveConfirmId(null)}
								onToggleActive={
									!item.lastTriggeredAt
										? () => void handleToggleActive(item.id, item.isActive)
										: undefined
								}
								toggleLoading={toggleLoadingId === item.id}
							/>
						))}
					</Glass>
				)}
			</section>

			<SiteFooter />

			<style>{`
        @media (max-width: 768px) {
          .alerts-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .alerts-stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
		</div>
	);
}
