// Pricely brand — 3 wordmark directions + mark explorations
// Spotify-green based palette: #1DB954 → #1ED760, paired with deep blue #0676C9 / black #191414

const BRAND_GREEN_A = '#1DB954';
const BRAND_GREEN_B = '#1ED760';
const BRAND_DEEP    = '#0F8A3F';
const BRAND_BLACK   = '#191414';

function PricelyMarkA({ size = 40, mode = 'dark' }) {
  // Direction A — split-circle "compare lens" mark, geometric sans wordmark
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="pma-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={BRAND_GREEN_B}/>
          <stop offset="1" stopColor={BRAND_GREEN_A}/>
        </linearGradient>
        <linearGradient id="pma-g2" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={BRAND_DEEP}/>
          <stop offset="1" stopColor={BRAND_GREEN_A}/>
        </linearGradient>
      </defs>
      <path d="M20 4a16 16 0 0 0 0 32V4z" fill="url(#pma-g)"/>
      <path d="M20 4a16 16 0 0 1 0 32V4z" fill="url(#pma-g2)" opacity="0.95"/>
      <rect x="19.25" y="4" width="1.5" height="32" fill={mode === 'dark' ? BRAND_BLACK : '#FBFAF7'}/>
    </svg>
  );
}

function PricelyMarkB({ size = 40 }) {
  // Direction B — descending bars, "lowest price" silhouette
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="pmb-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={BRAND_GREEN_B}/>
          <stop offset="1" stopColor={BRAND_GREEN_A}/>
        </linearGradient>
      </defs>
      <rect x="6"  y="8"  width="6" height="24" rx="2" fill="url(#pmb-g)" opacity="0.5"/>
      <rect x="14" y="14" width="6" height="18" rx="2" fill="url(#pmb-g)" opacity="0.7"/>
      <rect x="22" y="20" width="6" height="12" rx="2" fill="url(#pmb-g)" opacity="0.85"/>
      <rect x="30" y="26" width="6" height="6"  rx="2" fill="url(#pmb-g)"/>
    </svg>
  );
}

function PricelyMarkC({ size = 40 }) {
  // Direction C — rupee glyph in a glass capsule — most literal/India-rooted
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="pmc-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={BRAND_GREEN_B}/>
          <stop offset="1" stopColor={BRAND_DEEP}/>
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="36" height="36" rx="12" fill="url(#pmc-g)"/>
      <path d="M14 12h13M14 17h13M14 12c5 0 8 3 8 5s-3 5-8 5h-1l8 8" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

// Wordmarks — three directions
function PricelyWordmarkA({ color = '#F4F4F6' }) {
  // geometric sans, tight tracking, custom 'i' dot is the lens
  return (
    <span style={{
      fontFamily: PRICELY_TYPE.display, fontWeight: 700,
      fontSize: 36, letterSpacing: -1.2, color, lineHeight: 1, display: 'inline-flex', alignItems: 'baseline'
    }}>
      pr<span style={{ position: 'relative', display: 'inline-block' }}>
        i
        <span style={{
          position: 'absolute', top: -4, left: '50%', transform: 'translateX(-50%)',
          width: 8, height: 8, borderRadius: 4,
          background: `linear-gradient(135deg, ${BRAND_GREEN_B} 0%, ${BRAND_GREEN_A} 100%)`,
        }} />
      </span>cely
    </span>
  );
}

function PricelyWordmarkB({ color = '#F4F4F6' }) {
  // soft humanist — variable weight, reduced contrast
  return (
    <span style={{
      fontFamily: PRICELY_TYPE.display, fontWeight: 500,
      fontSize: 36, letterSpacing: -0.4, color, lineHeight: 1
    }}>Pricely<span style={{ color: BRAND_GREEN_A }}>.</span></span>
  );
}

function PricelyWordmarkC({ color = '#F4F4F6' }) {
  // serif/sans contrast lockup
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6 }}>
      <span style={{ fontFamily: '"Pricely Display", "GT Sectra", "Playfair Display", Georgia, serif', fontStyle: 'italic', fontWeight: 500, fontSize: 38, letterSpacing: -0.6, color, lineHeight: 1 }}>Pricely</span>
      <span style={{ fontFamily: PRICELY_TYPE.mono, fontSize: 11, letterSpacing: 2, color, opacity: 0.55, textTransform: 'uppercase' }}>/in</span>
    </span>
  );
}

Object.assign(window, {
  PricelyMarkA, PricelyMarkB, PricelyMarkC,
  PricelyWordmarkA, PricelyWordmarkB, PricelyWordmarkC,
});
