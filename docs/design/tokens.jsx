// Pricely design tokens — iOS 26 Liquid Glass system
// Brighter color fields under glass; specular rims; heavy blur+saturation.

const PRICELY_TOKENS = {
  dark: {
    // graphite base — slightly cool, but the void layer adds vivid color blobs
    bg0: '#07080B',          // app void
    bg1: '#0E1015',          // canvas
    bg2: '#171A22',          // raised
    bg3: '#21242E',          // overlay
    line: 'rgba(255,255,255,0.07)',
    line2: 'rgba(255,255,255,0.12)',
    text: '#F6F6F8',
    textDim: 'rgba(246,246,248,0.66)',
    textFaint: 'rgba(246,246,248,0.42)',
    // LIQUID GLASS — much more transparent so backdrop bleeds through
    glass: 'rgba(28,30,38,0.32)',
    glassStrong: 'rgba(34,36,46,0.55)',
    glassThin: 'rgba(255,255,255,0.04)',
    glassBorder: 'rgba(255,255,255,0.05)',
    glassBorderHi: 'rgba(255,255,255,0.10)',
    glassHi: 'rgba(255,255,255,0.08)',
    // accent: spotify green official
    accent: '#1DB954',
    accent2: '#1ED760',
    accent3: '#0F8A3F',
    accentSoft: 'rgba(29,185,84,0.12)',
    // semantics
    save: '#5BE3A0',
    saveSoft: 'rgba(91,227,160,0.14)',
    warn: '#FFC062',
    danger: '#FF6680',
    info: '#7CC8FF',
    grid: 'rgba(255,255,255,0.05)',
  },
  light: {
    // warm off-white with brighter color blobs underneath
    bg0: '#F2EEE8',
    bg1: '#F9F6F1',
    bg2: '#FFFFFF',
    bg3: '#EFEAE3',
    line: 'rgba(20,18,15,0.07)',
    line2: 'rgba(20,18,15,0.12)',
    text: '#14120F',
    textDim: 'rgba(20,18,15,0.62)',
    textFaint: 'rgba(20,18,15,0.40)',
    // LIQUID GLASS — frosted, lets warm color underneath bleed through
    glass: 'rgba(255,255,255,0.42)',
    glassStrong: 'rgba(255,255,255,0.65)',
    glassThin: 'rgba(255,255,255,0.25)',
    glassBorder: 'rgba(20,18,15,0.04)',
    glassBorderHi: 'rgba(255,255,255,0.5)',
    glassHi: 'rgba(255,255,255,0.85)',
    accent: '#1DB954',
    accent2: '#0F8A3F',
    accent3: '#0A6630',
    accentSoft: 'rgba(29,185,84,0.10)',
    save: '#1E9F6E',
    saveSoft: 'rgba(30,159,110,0.10)',
    warn: '#C68A2E',
    danger: '#D8284A',
    info: '#3A7FBF',
    grid: 'rgba(20,18,15,0.06)',
  },
};

// Liquid glass: brighter, more vivid color fields underneath so glass has something to refract
const PRICELY_FX = {
  // Subtle, calm — just enough tint for glass to refract, no flashy color blasts
  voidDark: `
    radial-gradient(70% 50% at 15% -10%, rgba(29,185,84,0.10) 0%, rgba(29,185,84,0) 60%),
    radial-gradient(60% 45% at 95% 100%, rgba(29,185,84,0.06) 0%, rgba(29,185,84,0) 60%),
    linear-gradient(180deg, #191414 0%, #0E0B0B 100%)
  `,
  voidLight: `
    radial-gradient(70% 50% at 15% -10%, rgba(29,185,84,0.07) 0%, rgba(29,185,84,0) 60%),
    radial-gradient(60% 45% at 95% 100%, rgba(15,138,63,0.05) 0%, rgba(15,138,63,0) 60%),
    linear-gradient(180deg, #FAF6F0 0%, #F2EEE8 100%)
  `,
  // Green ramp — spotify green to deeper graphite-green
  rampAccent: 'linear-gradient(135deg, #1ED760 0%, #1DB954 50%, #0F8A3F 100%)',
  rampSave: 'linear-gradient(135deg, #1ED760 0%, #1DB954 100%)',
  rampNight: 'linear-gradient(180deg, #21242E 0%, #0E1015 100%)',
  // specular rim highlight — bright top, fades to nothing
  specularRim: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 14%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 100%)',
  specularRimLight: 'linear-gradient(180deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.12) 14%, rgba(255,255,255,0) 45%, rgba(255,255,255,0) 100%)',
};

const PRICELY_TYPE = {
  display: '"Pricely Display", "General Sans", "Inter Tight", "SF Pro Display", -apple-system, system-ui, sans-serif',
  text: '"Pricely Text", "Inter", -apple-system, "SF Pro Text", system-ui, sans-serif',
  mono: '"JetBrains Mono", "SF Mono", "IBM Plex Mono", ui-monospace, monospace',
};

const PRICELY_RADIUS = { xs: 8, sm: 12, md: 16, lg: 22, xl: 30, xxl: 38, pill: 999 };

const PRICELY_SHADOW = {
  // Calmer shadows — apple liquid glass is subtle, not heavy
  cardDark: '0 1px 0 rgba(255,255,255,0.03) inset, 0 6px 20px -16px rgba(0,0,0,0.45)',
  cardLight: '0 1px 0 rgba(255,255,255,0.5) inset, 0 5px 14px -14px rgba(20,18,15,0.10)',
  glow: '0 0 0 1px rgba(29,185,84,0.25), 0 6px 18px -6px rgba(29,185,84,0.20)',
  floatDark: '0 1px 0 rgba(255,255,255,0.06) inset, 0 6px 18px -12px rgba(0,0,0,0.35)',
  floatLight: '0 1px 0 rgba(255,255,255,0.55) inset, 0 6px 16px -12px rgba(20,18,15,0.08)',
};

function usePricelyTheme(mode = 'dark') {
  return { mode, t: PRICELY_TOKENS[mode], fx: PRICELY_FX, type: PRICELY_TYPE, r: PRICELY_RADIUS, shadow: PRICELY_SHADOW };
}

Object.assign(window, {
  PRICELY_TOKENS, PRICELY_FX, PRICELY_TYPE, PRICELY_RADIUS, PRICELY_SHADOW, usePricelyTheme,
});
