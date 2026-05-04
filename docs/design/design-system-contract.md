# Pricely Design System Contract

This file is the enforceable design-to-engineering contract for production UI implementation.
Source of truth references are archived under `docs/design/`.

## 1) Product UI Principles

- Product-first interface, not marketing-first.
- Dark theme is default; light theme is optional parity.
- Accent color is a semantic signal, not decorative fill.
- Surfaces use glass layering only to express hierarchy.
- Data clarity outranks ornamentation in every component.

## 2) Spacing System

- Base unit: `4px`.
- Approved spacing steps: `2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 48, 56`.
- Component internal spacing: `12-16px`.
- Section/container spacing: `20-32px`.
- Hero/prominent block spacing: `36-56px`.
- Non-token spacing values are disallowed.

## 3) Typography

- Use three roles only:
  - display: headings and product names.
  - text: body copy and controls.
  - mono: prices, metrics, counters, ETA, savings.
- Numeric content must use tabular numerals.
- Heading scale: `26, 28, 32, 38, 64`.
- Body scale: `12-15`; caption/meta: `10-11.5`.
- Uppercase mono labels are reserved for metadata and sectional eyebrows.

## 4) Color and Token Rules

- All production colors must reference semantic tokens.
- Required semantic groups:
  - backgrounds (`bg0`, `bg1`, `bg2`, `bg3`)
  - text (`primary`, `secondary`, `muted`)
  - actions (`accent`, `accentSoft`)
  - states (`success`, `warning`, `danger`, `info`)
  - lines (`line`, `lineSubtle`)
  - glass (`glass`, `glassStrong`, `glassBorder`)
- Accent green family is canonical: `#1DB954` / `#1ED760`.
- Coral/magenta accents from earlier exploration are deprecated for production UI.

## 5) Radius and Surface Rules

- Canonical radius scale is fixed to:
  - `xs=8`, `sm=12`, `md=16`, `lg=22`, `xl=30`, `pill=9999`.
- Legacy specimen radius labels (`6,10,14,20,28`) are deprecated.
- Surface hierarchy:
  - canvas -> surface -> elevated surface.
- Card and shell borders must use tokenized hairlines.

## 6) Layout and Responsiveness

- Canonical target canvases:
  - mobile: `402x874` equivalent behavior.
  - desktop: `1440x900` equivalent behavior.
- Until explicit breakpoint tokens are published, implement two modes:
  - mobile-first default
  - desktop-enhanced layout
- Content gutters:
  - mobile `16-20px`
  - desktop `24-32px`

## 7) Interaction and Motion

- Motion is subtle, purpose-driven, and optional.
- Transition duration range: `120-180ms`.
- No decorative/continuous animation except cursor/blink indicators where needed.
- Every motion-capable component must honor `prefers-reduced-motion`.
- Focus, active, disabled, loading states are mandatory for interactive controls.

## 8) Accessibility Minimums

- All interactive controls must be keyboard reachable.
- Visible focus ring is required on keyboard focus.
- Minimum target size: `44x44` for touch interactions.
- Semantic labels/roles required for tabs, toggles, alerts, dialogs, inputs.
- Enforce WCAG contrast minimums for text and iconography in both themes.

## 9) Component Patterns

- Shared components must follow standardized patterns:
  - search bar (pill form, explicit focus state)
  - result card (platform + price + savings + ETA)
  - badge/chip (status and trend)
  - tab bar / nav controls
  - CTA hierarchy (primary accent, secondary glass)
- "Best" or "Cheapest" states require consistent accent treatment.

## 10) Non-Negotiable Engineering Rules

- Hardcoded hex values in components are prohibited unless present in tokens.
- Duplicate component variants in feature folders are prohibited.
- Utilities and visual behavior must be reusable before feature-local duplication.
- New UI code must map directly to this contract and `.cursor/rules/02-design-system.mdc`.
