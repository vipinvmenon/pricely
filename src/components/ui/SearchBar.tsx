"use client";

import { FormEvent, useId, useState } from "react";
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
	suggestions = [],
	onSelectSuggestion,
}: {
	value: string;
	onChange: (v: string) => void;
	onSubmit: (e: FormEvent) => void;
	placeholder?: string;
	submitLabel?: string;
	big?: boolean;
	ariaLabel?: string;
	suggestions?: string[];
	onSelectSuggestion?: (value: string) => void;
}) {
	const listId = useId();
	const [open, setOpen] = useState(false);
	const showSuggestions = open && suggestions.length > 0;

	function handleSelect(suggestion: string) {
		onChange(suggestion);
		onSelectSuggestion?.(suggestion);
		setOpen(false);
	}

	return (
		<div className="search-bar-wrap">
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
					className="search-input"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					onFocus={() => setOpen(true)}
					onBlur={() => window.setTimeout(() => setOpen(false), 120)}
					placeholder={placeholder}
					autoComplete="off"
					aria-label={ariaLabel}
					aria-autocomplete="list"
					style={{
						fontSize: big ? "1.0625rem" : "1rem",
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
			{showSuggestions ? (
				<ul id={listId} role="listbox" className="search-suggestions">
					{suggestions.map((suggestion) => (
						<li key={suggestion}>
							<button
								type="button"
								role="option"
								aria-selected={false}
								className="search-suggestion-item"
								onMouseDown={(e) => e.preventDefault()}
								onClick={() => handleSelect(suggestion)}
							>
								{suggestion}
							</button>
						</li>
					))}
				</ul>
			) : null}
		</div>
	);
}
