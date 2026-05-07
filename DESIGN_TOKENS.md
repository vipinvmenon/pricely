# DESIGN_TOKENS.md

Canonical token reference used during implementation.

This file is produced from the repo's `src/styles/tokens.css` and `src/styles/typography.css` so that engineers have one place to copy from during the rewrite.

## tokens.css (verbatim)

```css
:root {
  /* Backgrounds */
  --bg-void: #07080b;
  --bg-canvas: #0e1015;
  --bg-raised: #171a22;
  --bg-overlay: #21242e;

  /* Text */
  --text-primary: #f6f6f8;
  --text-dim: rgba(246, 246, 248, 0.66);
  --text-faint: rgba(246, 246, 248, 0.42);

  /* Glass surfaces */
  --glass: rgba(28, 30, 38, 0.32);
  --glass-strong: rgba(34, 36, 46, 0.55);
  --glass-thin: rgba(255, 255, 255, 0.04);
  --glass-border: rgba(255, 255, 255, 0.07);
  --glass-border-hi: rgba(255, 255, 255, 0.13);

  /* Accent */
  --accent: #1db954;
  --accent-2: #1ed760;
  --accent-deep: #0f8a3f;
  --accent-soft: rgba(29, 185, 84, 0.12);

  /* Semantic */
  --save: #5be3a0;
  --save-soft: rgba(91, 227, 160, 0.14);
  --warn: #ffc062;
  --danger: #ff6680;
  --info: #7cc8ff;

  /* Gradients */
  --ramp-accent: linear-gradient(135deg, #1ed760 0%, #1db954 50%, #0f8a3f 100%);
  --void-bg:
    radial-gradient(
      70% 50% at 15% -10%,
      rgba(29, 185, 84, 0.1) 0%,
      transparent 60%
    ),
    radial-gradient(
      60% 45% at 95% 100%,
      rgba(29, 185, 84, 0.06) 0%,
      transparent 60%
    ),
    linear-gradient(180deg, #0e0b12 0%, #070809 100%);

  /* Specular rim */
  --specular-rim: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.03) 14%,
    rgba(255, 255, 255, 0) 40%
  );

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 32px;
  --space-8: 40px;
  --space-9: 48px;
  --space-10: 56px;

  --radius-xs: 8px;
  --radius-sm: 12px;
  --radius-md: 16px;
  --radius-lg: 22px;
  --radius-xl: 30px;
  --radius-pill: 9999px;

  --color-bg-void: var(--bg-void);
  --color-bg-canvas: var(--bg-canvas);
  --color-bg-raised: var(--bg-raised);
  --color-bg-overlay: var(--bg-overlay);
  --color-surface: rgba(255, 255, 255, 0.08);
  --color-surface-strong: rgba(255, 255, 255, 0.14);
  --color-line: rgba(246, 246, 248, 0.24);
  --color-line-subtle: rgba(246, 246, 248, 0.14);

  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-dim);
  --color-text-muted: var(--text-faint);

  --color-accent: var(--accent);
  --color-accent-bright: var(--accent-2);
  --color-accent-soft: var(--accent-soft);
  --color-success: var(--save);
  --color-warning: var(--warn);
  --color-danger: var(--danger);
  --color-info: var(--info);

  --color-glass: var(--glass);
  --color-glass-strong: var(--glass-strong);
  --color-glass-border: var(--glass-border);
  --color-glass-rim: var(--glass-border-hi);

  --shadow-card: 0 18px 36px -28px rgba(0, 0, 0, 0.7);
  --shadow-float: 0 24px 60px -30px rgba(0, 0, 0, 0.78);
  --shadow-glow: 0 0 48px -26px rgba(29, 185, 84, 0.42);
  --shadow-accent-glow: 0 0 34px -20px rgba(30, 215, 96, 0.6);

  --gradient-void-dark:
    radial-gradient(
      120% 120% at 12% 8%,
      rgba(30, 215, 96, 0.18) 0%,
      rgba(30, 215, 96, 0) 42%
    ),
    radial-gradient(
      80% 90% at 82% 14%,
      rgba(29, 185, 84, 0.14) 0%,
      rgba(29, 185, 84, 0) 48%
    ),
    linear-gradient(180deg, #07080b 0%, #0e1015 52%, #171a22 100%);
  --gradient-void-light:
    radial-gradient(
      120% 120% at 8% 4%,
      rgba(29, 185, 84, 0.12) 0%,
      rgba(29, 185, 84, 0) 44%
    ),
    radial-gradient(
      70% 80% at 90% 16%,
      rgba(30, 215, 96, 0.09) 0%,
      rgba(30, 215, 96, 0) 48%
    ),
    linear-gradient(180deg, #f2eee8 0%, #f9f6f1 52%, #ffffff 100%);
  --gradient-ramp-accent: var(--ramp-accent);
  --gradient-ramp-save: linear-gradient(
    135deg,
    #9ef0c7 0%,
    #5be3a0 54%,
    #2ba367 100%
  );

  --blur-frosted: 8px;
  --blur-glass: 24px;
  --blur-strong: 40px;
}

[data-theme="light"] {
  --color-bg-void: #f2eee8;
  --color-bg-canvas: #f9f6f1;
  --color-bg-raised: #ffffff;
  --color-bg-overlay: #ece6dd;
  --color-surface: rgba(255, 255, 255, 0.62);
  --color-surface-strong: rgba(255, 255, 255, 0.78);
  --color-line: rgba(12, 17, 28, 0.2);
  --color-line-subtle: rgba(12, 17, 28, 0.12);

  --color-text-primary: #11131a;
  --color-text-secondary: rgba(17, 19, 26, 0.72);
  --color-text-muted: rgba(17, 19, 26, 0.54);

  --color-accent-soft: rgba(29, 185, 84, 0.12);

  --color-glass: rgba(255, 255, 255, 0.42);
  --color-glass-strong: rgba(255, 255, 255, 0.65);
  --color-glass-border: rgba(255, 255, 255, 0.76);
  --color-glass-rim: rgba(255, 255, 255, 0.88);

  --shadow-card: 0 20px 40px -30px rgba(11, 14, 22, 0.24);
  --shadow-float: 0 28px 64px -34px rgba(11, 14, 22, 0.34);
  --shadow-glow: 0 0 48px -30px rgba(29, 185, 84, 0.3);
  --shadow-accent-glow: 0 0 34px -22px rgba(30, 215, 96, 0.42);
}
```

## GlassCard spec (3-level glass surface)

Implement a reusable “glass card” surface using:
- A root wrapper with `relative isolate overflow-hidden`
- Decorative layers using absolute positioned spans under a content `z-index` stack
- Token-driven backgrounds, borders, shadows, and blur

### Levels

In this repo, the surface uses 3 main levels:
- `thin` (inner tint overlay): `bg-[var(--glass-thin)]`
- `default`: `bg-[var(--color-glass)]` + `border-[var(--color-glass-border)]`
- `strong`: `bg-[var(--color-glass-strong)]` + `border-[var(--color-glass-border)]` and stronger blur tint

### Props contract (from current implementation)

Expected props:
- `mode`: `"default" | "subtle" | "strong"`
- `strong` (boolean): increases tint blur behavior
- `radius`: `"xs" | "sm" | "md" | "lg" | "xl" | "pill"`
- `floating` (boolean): uses `--shadow-float` vs `--shadow-card`
- `padding`: `"none" | "sm" | "md" | "lg"`

### Required pseudo-element layer pattern

The root wrapper must include these decorative layers (semantic example, implementation can vary):
- Layer A: thin overlay tint at `z-0`
- Layer B: blur + saturation tint at `z-1`
- Layer C: subtle highlight blob at `z-2`
- Layer D: specular rim mask at `z-3`
- Layer E: hairline border at `z-4`
- Content at `z-5`

## Typography scale

From `src/styles/typography.css`, the canonical classes are:

### Display
- `.display-xl` (largest headings/product names)
- `.display-lg`
- `.display-md`
- `.display-sm`

### Text
- `.text-lg`
- `.text-md`
- `.text-sm`

### Meta/caption
- `.caption`

### Mono
- `.mono-data`: tabular numerals with `--font-geist-mono`

