"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useSupabaseUser } from "@/lib/hooks/useSupabaseUser";

const NAV_LINKS = [
	{ label: "Home", href: "/" },
	{ label: "Compare", href: "/compare" },
	{ label: "Watchlist", href: "/watchlist" },
	{ label: "Alerts", href: "/alerts" },
];

/** Avoid background RSC prefetches — first compile on D: drive can hang 30s+ */
function shouldPrefetch(href: string): boolean {
	return href === "/";
}

function BarChartIcon() {
	return (
		<svg
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<rect x="2" y="2" width="3" height="16" rx="1" fill="var(--accent)" />
			<rect x="7" y="6" width="3" height="12" rx="1" fill="var(--accent)" />
			<rect x="12" y="10" width="3" height="8" rx="1" fill="var(--accent)" />
			<rect x="17" y="13" width="3" height="5" rx="1" fill="var(--accent)" />
		</svg>
	);
}

function MenuIcon() {
	return (
		<svg
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<rect x="2" y="5" width="16" height="1.5" rx="0.75" fill="currentColor" />
			<rect
				x="2"
				y="9.25"
				width="16"
				height="1.5"
				rx="0.75"
				fill="currentColor"
			/>
			<rect
				x="2"
				y="13.5"
				width="16"
				height="1.5"
				rx="0.75"
				fill="currentColor"
			/>
		</svg>
	);
}

export function Nav() {
	const pathname = usePathname();
	const router = useRouter();
	const [mobileOpen, setMobileOpen] = useState(false);
	const { user, ready, signOut, configured } = useSupabaseUser();

	async function handleSignOut() {
		await signOut();
		setMobileOpen(false);
		router.push("/");
		router.refresh();
	}

	const showSignedIn = configured && ready && user;
	const userLabel =
		user?.user_metadata?.full_name ??
		user?.user_metadata?.name ??
		user?.email ??
		"Account";

	return (
		<>
			<nav
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					height: 64,
					zIndex: 100,
					background: "var(--bg0)",
					borderBottom: "1px solid var(--line)",
					display: "flex",
					alignItems: "center",
					padding: "0 24px",
					gap: 16,
				}}
			>
				{/* Logo */}
				<Link
					href="/"
					style={{
						display: "flex",
						alignItems: "center",
						gap: 8,
						textDecoration: "none",
						flexShrink: 0,
					}}
				>
					<BarChartIcon />
					<span
						style={{
							fontSize: "1.0625rem",
							fontWeight: 600,
							color: "var(--text)",
							letterSpacing: "-0.01em",
						}}
					>
						Pricely<span style={{ color: "var(--accent)" }}>.</span>
					</span>
				</Link>

				{/* Desktop nav links */}
				<div
					style={{
						flex: 1,
						display: "flex",
						justifyContent: "center",
					}}
					className="nav-links-desktop"
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							border: "1px solid var(--line-strong)",
							borderRadius: "var(--r-pill)",
							padding: "3px",
							gap: 2,
						}}
					>
						{NAV_LINKS.map(({ label, href }) => {
							const isActive =
								href === "/" ? pathname === "/" : pathname.startsWith(href);
							return (
								<Link
									key={href}
									href={href}
									prefetch={shouldPrefetch(href)}
									aria-current={isActive ? "page" : undefined}
									style={{
										display: "inline-flex",
										alignItems: "center",
										padding: "6px 14px",
										borderRadius: "var(--r-pill)",
										fontSize: "0.875rem",
										fontWeight: 500,
										color: isActive ? "var(--text)" : "var(--text-dim)",
										background: isActive
											? "var(--glass-strong-bg)"
											: "transparent",
										textDecoration: "none",
										transition: "background 0.15s, color 0.15s",
										whiteSpace: "nowrap",
									}}
								>
									{label}
								</Link>
							);
						})}
					</div>
				</div>

				{/* Right actions */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 8,
						flexShrink: 0,
					}}
					className="nav-actions-desktop"
				>
					{showSignedIn ? (
						<>
							<span
								style={{
									fontSize: "0.8125rem",
									color: "var(--text-dim)",
									maxWidth: 160,
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap",
								}}
								title={userLabel}
							>
								{userLabel}
							</span>
							<Button variant="ghost" size="sm" type="button" onClick={handleSignOut}>
								Sign out
							</Button>
						</>
					) : (
						<>
							<a href="/signin" style={{ textDecoration: "none" }}>
								<Button variant="ghost" size="sm" type="button">
									Sign in
								</Button>
							</a>
							<a href="/signup" style={{ textDecoration: "none" }}>
								<Button variant="primary" size="sm" type="button">
									Create account
								</Button>
							</a>
						</>
					)}
				</div>

				{/* Mobile hamburger */}
				<button
					onClick={() => setMobileOpen(!mobileOpen)}
					className="nav-hamburger"
					style={{
						background: "none",
						border: "none",
						cursor: "pointer",
						color: "var(--text)",
						width: 44,
						height: 44,
						display: "none",
						alignItems: "center",
						justifyContent: "center",
						marginLeft: "auto",
						borderRadius: "var(--r-pill)",
					}}
					aria-label="Toggle menu"
					aria-expanded={mobileOpen}
				>
					<MenuIcon />
				</button>
			</nav>

			{/* Mobile dropdown */}
			{mobileOpen && (
				<div
					className="nav-mobile-menu"
					style={{
						position: "fixed",
						top: 64,
						left: 0,
						right: 0,
						zIndex: 99,
						background: "var(--bg1)",
						borderBottom: "1px solid var(--line)",
						padding: "12px 16px",
						display: "flex",
						flexDirection: "column",
						gap: 4,
					}}
				>
					{NAV_LINKS.map(({ label, href }) => {
						const isActive =
							href === "/" ? pathname === "/" : pathname.startsWith(href);
						return (
							<Link
								key={href}
								href={href}
								prefetch={shouldPrefetch(href)}
								onClick={() => setMobileOpen(false)}
								aria-current={isActive ? "page" : undefined}
								style={{
									padding: "12px 16px",
									borderRadius: "var(--r-md)",
									fontSize: "0.9375rem",
									fontWeight: 500,
									color: isActive ? "var(--accent)" : "var(--text)",
									background: isActive ? "var(--accent-dim)" : "transparent",
									textDecoration: "none",
									display: "block",
								}}
							>
								{label}
							</Link>
						);
					})}
					<div
						style={{
							height: 1,
							background: "var(--line)",
							margin: "8px 0",
						}}
					/>
					{showSignedIn ? (
						<>
							<p
								style={{
									fontSize: "0.875rem",
									color: "var(--text-dim)",
									margin: "0 0 8px",
									padding: "0 4px",
								}}
							>
								Signed in as {userLabel}
							</p>
							<Button
								variant="ghost"
								size="md"
								fullWidth
								type="button"
								onClick={handleSignOut}
							>
								Sign out
							</Button>
						</>
					) : (
						<>
							<a
								href="/signin"
								onClick={() => setMobileOpen(false)}
								style={{ textDecoration: "none" }}
							>
								<Button variant="ghost" size="md" fullWidth type="button">
									Sign in
								</Button>
							</a>
							<a
								href="/signup"
								onClick={() => setMobileOpen(false)}
								style={{ textDecoration: "none" }}
							>
								<Button variant="primary" size="md" fullWidth type="button">
									Create account
								</Button>
							</a>
						</>
					)}
				</div>
			)}

			<style>{`
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .nav-actions-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>

			{/* Spacer so content isn't behind fixed nav */}
			<div style={{ height: 64 }} />
		</>
	);
}
