"use client";

import { FormEvent } from "react";
import { Glass } from "./Glass";

function SearchIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
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

export function SearchBar({
	value,
	onChange,
	onSubmit,
	placeholder = "Search any product…",
	submitLabel = "Search",
	big = false,
	ariaLabel = "Search products",
}: {
	value: string;
	onChange: (v: string) => void;
	onSubmit: (e: FormEvent) => void;
	placeholder?: string;
	submitLabel?: string;
	big?: boolean;
	ariaLabel?: string;
}) {
	return (
		<form onSubmit={onSubmit} role="search">
			<Glass
				variant="plate"
				style={{
					display: "flex",
					alignItems: "center",
					borderRadius: "var(--r-pill)",
					padding: "0 8px 0 18px",
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
					aria-label={ariaLabel}
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
						color: "var(--bg0)",
						fontSize: "0.875rem",
						fontWeight: 700,
						fontFamily: "inherit",
						padding: big ? "11px 22px" : "9px 18px",
						minHeight: 44,
						cursor: "pointer",
					}}
				>
					{submitLabel}
				</button>
			</Glass>
		</form>
	);
}
