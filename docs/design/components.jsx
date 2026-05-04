// Pricely components — glass surfaces, search, pills, cards, charts, badges
// All consume PRICELY_TOKENS via the `t` prop (theme tokens).

// ─── Liquid Glass surface (iOS 26 style) ──────────────────────────
// Stacks: backdrop blur+saturation → tint → inner radial sheen → specular rim → chromatic edge
function PGlass({ children, t, mode = 'dark', strong = false, radius, style = {}, floating = false, padding }) {
  const r = radius ?? PRICELY_RADIUS.lg;
  const isLight = mode === 'light';
  const rim = isLight ? PRICELY_FX.specularRimLight : PRICELY_FX.specularRim;
  return (
    <div style={{
      position: 'relative',
      borderRadius: r,
      isolation: 'isolate',
      ...style,
    }}>
      {/* glass body — blur + tint + saturation */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: r,
        background: strong ? t.glassStrong : t.glass,
        backdropFilter: 'blur(28px) saturate(180%) brightness(1.05)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%) brightness(1.05)',
        boxShadow: floating
          ? (isLight ? PRICELY_SHADOW.floatLight : PRICELY_SHADOW.floatDark)
          : (isLight ? PRICELY_SHADOW.cardLight : PRICELY_SHADOW.cardDark),
        zIndex: 0,
      }}/>
      {/* inner radial sheen */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: r, pointerEvents: 'none',
        background: isLight
          ? 'radial-gradient(120% 80% at 30% -10%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 55%)'
          : 'radial-gradient(120% 80% at 30% -10%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 55%)',
        zIndex: 1,
      }}/>
      {/* specular top rim */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: r, pointerEvents: 'none',
        padding: 1,
        background: rim,
        WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
        WebkitMaskComposite: 'xor', maskComposite: 'exclude',
        zIndex: 2,
      }}/>
      {/* outer hairline border */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: r, pointerEvents: 'none',
        border: `1px solid ${t.glassBorder}`,
        zIndex: 3,
      }}/>
      <div style={{ position: 'relative', zIndex: 4, padding }}>{children}</div>
    </div>
  );
}

// ─── Search bar ──────────────────────────────────────────────────
function PSearchBar({ t, mode = 'dark', value = 'Amul Paneer 200g', placeholder = 'Search across 12 platforms', size = 'md', focused = false }) {
  const h = size === 'lg' ? 64 : size === 'sm' ? 44 : 56;
  const isLight = mode === 'light';
  const r = PRICELY_RADIUS.pill;
  return (
    <div style={{ position: 'relative', height: h, isolation: 'isolate' }}>
      {/* glass body */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: r,
        background: t.glassStrong,
        backdropFilter: 'blur(32px) saturate(190%) brightness(1.06)',
        WebkitBackdropFilter: 'blur(32px) saturate(190%) brightness(1.06)',
        boxShadow: focused
          ? `0 0 0 4px ${t.accentSoft}, ${isLight ? PRICELY_SHADOW.floatLight : PRICELY_SHADOW.floatDark}`
          : (isLight ? PRICELY_SHADOW.floatLight : PRICELY_SHADOW.floatDark),
        zIndex: 0,
      }}/>
      {/* inner sheen */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: r, pointerEvents: 'none',
        background: isLight
          ? 'radial-gradient(120% 80% at 30% -20%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 50%)'
          : 'radial-gradient(120% 80% at 30% -20%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 55%)',
        zIndex: 1,
      }}/>
      {/* specular rim */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: r, pointerEvents: 'none',
        padding: 1,
        background: isLight ? PRICELY_FX.specularRimLight : PRICELY_FX.specularRim,
        WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
        WebkitMaskComposite: 'xor', maskComposite: 'exclude',
        zIndex: 2,
      }}/>
      {/* hairline */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: r, pointerEvents: 'none',
        border: `1px solid ${focused ? t.accent : t.glassBorder}`,
        zIndex: 3,
      }}/>
      {/* content */}
      <div style={{
        position: 'relative', zIndex: 4, height: '100%',
        display: 'flex', alignItems: 'center', padding: '0 8px 0 18px', gap: 12,
      }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="9" cy="9" r="6.5" stroke={t.textDim} strokeWidth="1.6"/>
          <path d="M14 14l3.5 3.5" stroke={t.textDim} strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
        <span style={{
          flex: 1, color: value ? t.text : t.textFaint,
          fontFamily: PRICELY_TYPE.text, fontSize: size === 'lg' ? 17 : 15,
          fontWeight: 450, letterSpacing: -0.2,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {value || placeholder}
          {focused && <span style={{
            display: 'inline-block', width: 1.5, height: 18, marginLeft: 2, verticalAlign: 'middle',
            background: t.accent, animation: 'pCaret 1s steps(2) infinite',
          }} />}
        </span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button style={{
            width: 36, height: 36, borderRadius: 18, border: 'none',
            background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: t.textDim,
          }}>
            <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
              <rect x="4" y="1" width="6" height="10" rx="3" stroke="currentColor" strokeWidth="1.6"/>
              <path d="M1 8a6 6 0 0012 0M7 14v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
          <div style={{
            height: h - 16, padding: '0 14px', borderRadius: PRICELY_RADIUS.pill,
            background: PRICELY_FX.rampAccent,
            color: '#fff', display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: PRICELY_TYPE.text, fontSize: 13, fontWeight: 600, letterSpacing: -0.1,
            boxShadow: '0 1px 0 rgba(255,255,255,0.4) inset, 0 6px 16px -6px rgba(43,179,154,0.6)',
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 3h8M3.5 6h5M5 9h2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            Filters
          </div>
        </div>
      </div>
      <style>{`@keyframes pCaret{50%{opacity:0}}`}</style>
    </div>
  );
}

// ─── Platform pill (logo + name) ─────────────────────────────────
// Made-up platform names with abstracted logos to avoid branded marks.
const PRICELY_PLATFORMS = {
  zip:   { name: 'Zip',     cat: 'grocery', tagline: '8-min',   bg: 'linear-gradient(135deg,#7C3AED,#C026D3)', glyph: 'Z' },
  bolt:  { name: 'Bolt',    cat: 'grocery', tagline: '10-min',  bg: 'linear-gradient(135deg,#F59E0B,#EF4444)', glyph: 'B' },
  aisle: { name: 'Aisle',   cat: 'grocery', tagline: '15-min',  bg: 'linear-gradient(135deg,#10B981,#059669)', glyph: 'A' },
  basket:{ name: 'Basket',  cat: 'grocery', tagline: 'today',   bg: 'linear-gradient(135deg,#0EA5E9,#06B6D4)', glyph: 'b' },
  kart:  { name: 'Kart',    cat: 'ecom',    tagline: '2 days',  bg: 'linear-gradient(135deg,#2563EB,#1D4ED8)', glyph: 'K' },
  marq:  { name: 'Marq',    cat: 'ecom',    tagline: 'tomorrow',bg: 'linear-gradient(135deg,#0F172A,#334155)', glyph: 'M' },
  vogue: { name: 'Vogue.in',cat: 'fashion', tagline: '3 days',  bg: 'linear-gradient(135deg,#EC4899,#F43F5E)', glyph: 'V' },
  drift: { name: 'Drift',   cat: 'cab',     tagline: '4 min',   bg: 'linear-gradient(135deg,#000,#1F2937)',    glyph: '◐' },
  hop:   { name: 'Hop',     cat: 'cab',     tagline: '6 min',   bg: 'linear-gradient(135deg,#84CC16,#15803D)', glyph: 'h' },
  loop:  { name: 'Loop',    cat: 'cab',     tagline: '8 min',   bg: 'linear-gradient(135deg,#F97316,#DC2626)', glyph: '↺' },
};

function PPlatformLogo({ id, size = 28, radius }) {
  const p = PRICELY_PLATFORMS[id];
  if (!p) return null;
  return (
    <div style={{
      width: size, height: size, borderRadius: radius ?? size * 0.28,
      background: p.bg, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: PRICELY_TYPE.display, fontWeight: 700,
      fontSize: size * 0.5, letterSpacing: -0.5,
      boxShadow: '0 1px 0 rgba(255,255,255,0.18) inset, 0 2px 6px rgba(0,0,0,0.25)',
      flexShrink: 0,
    }}>{p.glyph}</div>
  );
}

function PPlatformPill({ id, t, active = false }) {
  const p = PRICELY_PLATFORMS[id];
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '6px 12px 6px 6px',
      borderRadius: PRICELY_RADIUS.pill,
      background: active ? t.accentSoft : t.glass,
      border: `1px solid ${active ? t.accent : t.glassBorder}`,
      fontFamily: PRICELY_TYPE.text, fontSize: 13, fontWeight: 500,
      color: t.text,
    }}>
      <PPlatformLogo id={id} size={20} />
      {p.name}
    </div>
  );
}

// ─── Price formatting ────────────────────────────────────────────
function PPrice({ value, size = 'md', t, strike = false, mono = true }) {
  const sz = { xs: 13, sm: 16, md: 22, lg: 32, xl: 44 }[size] || 22;
  return (
    <span style={{
      fontFamily: mono ? PRICELY_TYPE.mono : PRICELY_TYPE.display,
      fontWeight: mono ? 500 : 700,
      fontSize: sz, letterSpacing: -0.5, color: strike ? t.textFaint : t.text,
      textDecoration: strike ? 'line-through' : 'none',
      fontVariantNumeric: 'tabular-nums', lineHeight: 1,
    }}>
      <span style={{ opacity: 0.6, marginRight: 1 }}>₹</span>{value}
    </span>
  );
}

// ─── Trend / save / ETA badges ───────────────────────────────────
function PSaveBadge({ amount, percent, t }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 8px', borderRadius: PRICELY_RADIUS.pill,
      background: t.saveSoft, color: t.save,
      fontFamily: PRICELY_TYPE.mono, fontSize: 11, fontWeight: 600,
      letterSpacing: -0.1, fontVariantNumeric: 'tabular-nums',
    }}>
      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
        <path d="M4.5 1L8 5H6v3H3V5H1L4.5 1z" fill="currentColor" transform="rotate(180 4.5 4.5)"/>
      </svg>
      Save ₹{amount}{percent ? ` · ${percent}%` : ''}
    </span>
  );
}

function PETABadge({ time, t, tone = 'fast' }) {
  const c = tone === 'fast' ? t.save : t.textDim;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontFamily: PRICELY_TYPE.mono, fontSize: 11, fontWeight: 500,
      color: c, letterSpacing: -0.1,
    }}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M5 2.5V5L7 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
      {time}
    </span>
  );
}

function PTrendChip({ direction = 'down', amount, t }) {
  const isDown = direction === 'down';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '2px 7px', borderRadius: PRICELY_RADIUS.pill,
      background: isDown ? t.saveSoft : 'rgba(255,102,128,0.12)',
      color: isDown ? t.save : t.danger,
      fontFamily: PRICELY_TYPE.mono, fontSize: 10, fontWeight: 600,
      fontVariantNumeric: 'tabular-nums',
    }}>
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ transform: isDown ? 'none' : 'rotate(180deg)' }}>
        <path d="M4 7L1 3h6L4 7z" fill="currentColor"/>
      </svg>
      ₹{amount}
    </span>
  );
}

// ─── Result card (one platform's offer) ──────────────────────────
function PResultCard({ platform, price, mrp, eta, save, savePercent, t, mode = 'dark', best = false, compact = false, offer }) {
  const p = PRICELY_PLATFORMS[platform];
  const isLight = mode === 'light';
  const r = PRICELY_RADIUS.lg;
  return (
    <div style={{ position: 'relative', isolation: 'isolate' }}>
      {/* glass body */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: r,
        background: best ? t.glassStrong : t.glass,
        backdropFilter: 'blur(26px) saturate(180%) brightness(1.04)',
        WebkitBackdropFilter: 'blur(26px) saturate(180%) brightness(1.04)',
        boxShadow: best
          ? `${isLight ? PRICELY_SHADOW.cardLight : PRICELY_SHADOW.cardDark}, 0 0 0 1px ${t.accent} inset, 0 6px 18px -14px rgba(29,185,84,0.20)`
          : (isLight ? PRICELY_SHADOW.cardLight : PRICELY_SHADOW.cardDark),
        zIndex: 0,
      }}/>
      {/* inner sheen */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: r, pointerEvents: 'none',
        background: isLight
          ? 'radial-gradient(140% 80% at 30% -10%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 55%)'
          : 'radial-gradient(140% 80% at 30% -10%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 55%)',
        zIndex: 1,
      }}/>
      {/* specular rim */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: r, pointerEvents: 'none',
        padding: 1,
        background: isLight ? PRICELY_FX.specularRimLight : PRICELY_FX.specularRim,
        WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
        WebkitMaskComposite: 'xor', maskComposite: 'exclude',
        zIndex: 2,
      }}/>
      {/* hairline */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: r, pointerEvents: 'none',
        border: `1px solid ${best ? t.accent : t.glassBorder}`,
        zIndex: 3,
      }}/>
      {/* content */}
      <div style={{
        position: 'relative', zIndex: 4, overflow: 'hidden', borderRadius: r,
        padding: compact ? '12px 14px' : '16px 18px',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        {best && (
          <div style={{
            position: 'absolute', top: -1, right: 18,
            padding: '3px 10px 4px',
            borderRadius: '0 0 8px 8px',
            background: PRICELY_FX.rampAccent,
            color: '#fff', fontFamily: PRICELY_TYPE.mono, fontSize: 9.5, fontWeight: 700,
            letterSpacing: 1, textTransform: 'uppercase',
          }}>Cheapest</div>
        )}
        <PPlatformLogo id={platform} size={compact ? 36 : 44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontFamily: PRICELY_TYPE.text, fontSize: compact ? 14 : 15, fontWeight: 600, color: t.text, letterSpacing: -0.2 }}>{p.name}</span>
            <PETABadge time={eta || p.tagline} t={t} tone="fast"/>
          </div>
          {offer && (
            <div style={{ marginTop: 4, fontFamily: PRICELY_TYPE.text, fontSize: 11.5, color: t.textDim, letterSpacing: -0.1 }}>
              {offer}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, justifyContent: 'flex-end' }}>
            {mrp && <PPrice value={mrp} size="xs" t={t} strike/>}
            <PPrice value={price} size={compact ? 'sm' : 'md'} t={t}/>
          </div>
          {save && (
            <div style={{ marginTop: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <PSaveBadge amount={save} percent={savePercent} t={t}/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sparkline chart ─────────────────────────────────────────────
function PSparkChart({ data = [120,118,115,122,130,128,121,114,108,112,109,99,104,98,95,92,89], t, width = 320, height = 80, accent }) {
  const min = Math.min(...data), max = Math.max(...data);
  const sx = (i) => (i / (data.length - 1)) * width;
  const sy = (v) => height - 8 - ((v - min) / (max - min || 1)) * (height - 16);
  const path = data.map((v, i) => `${i ? 'L' : 'M'}${sx(i).toFixed(1)} ${sy(v).toFixed(1)}`).join(' ');
  const fill = `${path} L${width} ${height} L0 ${height} Z`;
  const lastX = sx(data.length - 1), lastY = sy(data[data.length - 1]);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id="psparkfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={accent || t.accent} stopOpacity="0.35"/>
          <stop offset="1" stopColor={accent || t.accent} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={fill} fill="url(#psparkfill)"/>
      <path d={path} stroke={accent || t.accent} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={lastX} cy={lastY} r="3" fill={accent || t.accent}/>
      <circle cx={lastX} cy={lastY} r="6" fill={accent || t.accent} opacity="0.2"/>
    </svg>
  );
}

// ─── Buy-now / Wait recommendation chip ──────────────────────────
function PVerdictChip({ verdict = 'buy', t, confidence = 87 }) {
  const isBuy = verdict === 'buy';
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      padding: '8px 14px 8px 10px', borderRadius: PRICELY_RADIUS.pill,
      background: isBuy ? t.saveSoft : 'rgba(255,192,98,0.14)',
      border: `1px solid ${isBuy ? 'rgba(91,227,160,0.3)' : 'rgba(255,192,98,0.3)'}`,
      color: isBuy ? t.save : t.warn,
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: 11,
        background: isBuy ? t.save : t.warn,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isBuy ? (
          <svg width="11" height="11" viewBox="0 0 11 11"><path d="M1.5 5.5l3 3 5-6" stroke="#0A0B0E" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="3.5" stroke="#0A0B0E" strokeWidth="1.5" fill="none"/><path d="M5 3.5V5l1 1" stroke="#0A0B0E" strokeWidth="1.5" strokeLinecap="round"/></svg>
        )}
      </div>
      <div>
        <div style={{ fontFamily: PRICELY_TYPE.text, fontSize: 12.5, fontWeight: 600, letterSpacing: -0.1, lineHeight: 1.1 }}>
          {isBuy ? 'Buy now' : 'Wait — price likely to drop'}
        </div>
        <div style={{ fontFamily: PRICELY_TYPE.mono, fontSize: 10, opacity: 0.7, marginTop: 2 }}>
          {confidence}% confidence · 30d signal
        </div>
      </div>
    </div>
  );
}

// ─── Tab bar (mobile) — floating liquid glass capsule ────────────
function PTabBar({ t, mode = 'dark', active = 0 }) {
  const tabs = [
    { label: 'Search', icon: 'M9 9a6 6 0 1112 0 6 6 0 01-12 0zm-2 14l-4 4' },
    { label: 'Watch',  icon: 'M3 6h18M5 6v13a2 2 0 002 2h10a2 2 0 002-2V6M9 11l3 3 3-3' },
    { label: 'Trips',  icon: 'M5 18h14M7 14h10l-1.5-9h-7L7 14z' },
    { label: 'You',    icon: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 22a8 8 0 0116 0' },
  ];
  const isLight = mode === 'light';
  const r = PRICELY_RADIUS.pill;
  return (
    <div style={{ padding: '10px 14px 18px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ position: 'relative', isolation: 'isolate', width: '100%', maxWidth: 360 }}>
        {/* glass body */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: r,
          background: t.glassStrong,
          backdropFilter: 'blur(36px) saturate(200%) brightness(1.06)',
          WebkitBackdropFilter: 'blur(36px) saturate(200%) brightness(1.06)',
          boxShadow: isLight ? PRICELY_SHADOW.floatLight : PRICELY_SHADOW.floatDark,
          zIndex: 0,
        }}/>
        {/* inner sheen */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: r, pointerEvents: 'none',
          background: isLight
            ? 'radial-gradient(120% 80% at 30% -20%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 50%)'
            : 'radial-gradient(120% 80% at 30% -20%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 55%)',
          zIndex: 1,
        }}/>
        {/* specular rim */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: r, pointerEvents: 'none',
          padding: 1,
          background: isLight ? PRICELY_FX.specularRimLight : PRICELY_FX.specularRim,
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor', maskComposite: 'exclude',
          zIndex: 2,
        }}/>
        {/* hairline */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: r, pointerEvents: 'none',
          border: `1px solid ${t.glassBorder}`,
          zIndex: 3,
        }}/>
        {/* tabs */}
        <div style={{
          position: 'relative', zIndex: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          padding: '8px 8px',
        }}>
          {tabs.map((tab, i) => {
            const isOn = i === active;
            return (
              <div key={tab.label} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                color: isOn ? t.text : t.textFaint,
                padding: '6px 14px', borderRadius: PRICELY_RADIUS.pill,
                background: isOn ? (isLight ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.10)') : 'transparent',
                boxShadow: isOn
                  ? (isLight ? '0 1px 0 rgba(255,255,255,0.9) inset, 0 2px 6px rgba(20,18,15,0.06)' : '0 1px 0 rgba(255,255,255,0.18) inset, 0 2px 6px rgba(0,0,0,0.3)')
                  : 'none',
              }}>
                <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                  <path d={tab.icon} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontFamily: PRICELY_TYPE.text, fontSize: 10, fontWeight: isOn ? 600 : 500, letterSpacing: -0.05 }}>{tab.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  PGlass, PSearchBar, PPlatformLogo, PPlatformPill, PRICELY_PLATFORMS,
  PPrice, PSaveBadge, PETABadge, PTrendChip, PResultCard,
  PSparkChart, PVerdictChip, PTabBar,
});
