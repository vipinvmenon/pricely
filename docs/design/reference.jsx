// Pricely system reference cards — colors, type, glass, components grid

function RefCard({ t, mode, title, sub, children, w = 720, h = 480 }) {
  return (
    <div style={{
      width: w, height: h, padding: '32px 36px', boxSizing: 'border-box',
      background: mode === 'dark' ? PRICELY_FX.voidDark : PRICELY_FX.voidLight,
      color: t.text, fontFamily: PRICELY_TYPE.text,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: PRICELY_TYPE.mono, fontSize: 10.5, color: t.textFaint, letterSpacing: 1.5, textTransform: 'uppercase' }}>{sub}</div>
        <div style={{ fontFamily: PRICELY_TYPE.display, fontSize: 30, fontWeight: 600, letterSpacing: -0.8, color: t.text, marginTop: 4 }}>{title}</div>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
    </div>
  );
}

// Brand directions side-by-side
function RefBrand({ mode = 'dark' }) {
  const t = PRICELY_TOKENS[mode];
  const dirs = [
    { label: 'Direction A · Geometric', mark: <PricelyMarkA size={56} mode={mode}/>, word: <PricelyWordmarkA color={t.text}/>, note: 'Geometric grotesque · tight tracking · split-lens mark for "compare"' },
    { label: 'Direction B · Soft humanist', mark: <PricelyMarkB size={56}/>, word: <PricelyWordmarkB color={t.text}/>, note: 'Friendly humanist · descending bars = lowest price · approachable, daily-use' },
    { label: 'Direction C · Editorial', mark: <PricelyMarkC size={56}/>, word: <PricelyWordmarkC color={t.text}/>, note: 'Italic serif · India-rooted ₹ glyph · premium, trustworthy, fintech-adjacent' },
  ];
  return (
    <RefCard t={t} mode={mode} title="Wordmark exploration" sub="Brand · 3 directions" w={840} h={520}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {dirs.map((d) => (
          <div key={d.label} style={{
            padding: 22, borderRadius: PRICELY_RADIUS.lg,
            background: t.glass, border: `1px solid ${t.glassBorder}`,
            display: 'grid', gridTemplateColumns: '88px 1fr 1fr', alignItems: 'center', gap: 24,
          }}>
            {d.mark}
            <div>{d.word}</div>
            <div>
              <div style={{ fontFamily: PRICELY_TYPE.mono, fontSize: 10, color: t.textFaint, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{d.label}</div>
              <div style={{ fontSize: 12.5, color: t.textDim, lineHeight: 1.5 }}>{d.note}</div>
            </div>
          </div>
        ))}
      </div>
    </RefCard>
  );
}

// Color tokens — both themes side by side
function RefColors({ mode = 'dark' }) {
  const t = PRICELY_TOKENS[mode];
  const groups = [
    { label: 'Surfaces', keys: ['bg0','bg1','bg2','bg3','glass','glassStrong'] },
    { label: 'Text & lines', keys: ['text','textDim','textFaint','line','line2','glassBorder'] },
    { label: 'Accent & semantic', keys: ['accent','accent2','save','warn','danger','info'] },
  ];
  return (
    <RefCard t={t} mode={mode} title={`Color tokens · ${mode === 'dark' ? 'Dark (hero)' : 'Light'}`} sub="Color system" w={720} h={520}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {groups.map(g => (
          <div key={g.label}>
            <div style={{ fontFamily: PRICELY_TYPE.text, fontSize: 11, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: t.textDim, marginBottom: 8 }}>{g.label}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
              {g.keys.map(k => (
                <div key={k} style={{ borderRadius: PRICELY_RADIUS.md, overflow: 'hidden', border: `1px solid ${t.glassBorder}` }}>
                  <div style={{ height: 56, background: t[k] }}/>
                  <div style={{ padding: '6px 8px', background: t.glass }}>
                    <div style={{ fontSize: 10.5, fontWeight: 600, color: t.text, letterSpacing: -0.1 }}>{k}</div>
                    <div style={{ fontSize: 9.5, fontFamily: PRICELY_TYPE.mono, color: t.textFaint, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{String(t[k]).replace('rgba(255,255,255,','rgba(w,').replace('rgba(20,18,15,','rgba(b,')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {/* Gradient ramp */}
        <div>
          <div style={{ fontFamily: PRICELY_TYPE.text, fontSize: 11, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: t.textDim, marginBottom: 8 }}>Gradient ramps</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ height: 44, borderRadius: PRICELY_RADIUS.md, background: PRICELY_FX.rampAccent, padding: '12px 14px', color: '#fff', fontFamily: PRICELY_TYPE.mono, fontSize: 11, fontWeight: 600, letterSpacing: 0.3 }}>rampAccent · #FF6E5C → #FF3D9A → #B14CFF</div>
            <div style={{ height: 44, borderRadius: PRICELY_RADIUS.md, background: PRICELY_FX.rampSave, padding: '12px 14px', color: '#0A0B0E', fontFamily: PRICELY_TYPE.mono, fontSize: 11, fontWeight: 600, letterSpacing: 0.3 }}>rampSave · #5BE3A0 → #3FB6FF</div>
          </div>
        </div>
      </div>
    </RefCard>
  );
}

// Type scale + samples
function RefType({ mode = 'dark' }) {
  const t = PRICELY_TOKENS[mode];
  const sizes = [
    ['Display XL', 56, 700, -1.6, 'Find anything, cheaper.'],
    ['Display L',  38, 600, -1.2, 'iPhone 15 · 128GB Black Titanium'],
    ['Display M',  28, 600, -0.8, 'Across 5 platforms'],
    ['Title',      20, 600, -0.4, 'Watching · 4 items'],
    ['Body',       14, 450, -0.1, 'Cheapest on Aisle, ships in 15 min · You\'d save ₹21 vs MRP.'],
    ['Caption',    11.5, 500, 0,    'Updated 12 seconds ago'],
  ];
  return (
    <RefCard t={t} mode={mode} title="Type scale" sub="Typography · Display / Text / Mono" w={720} h={520}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sizes.map(([n, sz, w, ls, sample]) => (
          <div key={n} style={{ display: 'grid', gridTemplateColumns: '120px 60px 60px 1fr', gap: 16, alignItems: 'baseline', borderBottom: `1px solid ${t.line}`, padding: '12px 0' }}>
            <span style={{ fontFamily: PRICELY_TYPE.mono, fontSize: 10.5, color: t.textFaint, letterSpacing: 0.5 }}>{n}</span>
            <span style={{ fontFamily: PRICELY_TYPE.mono, fontSize: 10.5, color: t.textFaint }}>{sz}/1.1</span>
            <span style={{ fontFamily: PRICELY_TYPE.mono, fontSize: 10.5, color: t.textFaint }}>{w} · {ls}</span>
            <span style={{ fontFamily: PRICELY_TYPE.display, fontSize: sz, fontWeight: w, letterSpacing: ls, color: t.text, lineHeight: 1.05 }}>{sample}</span>
          </div>
        ))}
        <div style={{ marginTop: 8, padding: 18, borderRadius: PRICELY_RADIUS.md, background: t.glass, border: `1px solid ${t.glassBorder}` }}>
          <div style={{ fontFamily: PRICELY_TYPE.mono, fontSize: 10.5, color: t.textFaint, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Mono · prices, ETA, codes</div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'baseline' }}>
            <span style={{ fontFamily: PRICELY_TYPE.mono, fontSize: 28, fontWeight: 500, color: t.text, letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums' }}>₹62,499.00</span>
            <span style={{ fontFamily: PRICELY_TYPE.mono, fontSize: 14, color: t.save, letterSpacing: 0.2 }}>↓ ₹6,500 (9%)</span>
            <span style={{ fontFamily: PRICELY_TYPE.mono, fontSize: 12, color: t.textDim, letterSpacing: 0.5 }}>ETA · 15:42</span>
          </div>
        </div>
      </div>
    </RefCard>
  );
}

// Glass + radius + shadow specimen
function RefSurfaces({ mode = 'dark' }) {
  const t = PRICELY_TOKENS[mode];
  return (
    <RefCard t={t} mode={mode} title="Liquid glass surfaces" sub="Depth · Radius · Blur" w={720} h={520}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, height: '100%' }}>
        {/* blur scale */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontFamily: PRICELY_TYPE.text, fontSize: 11, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: t.textDim }}>Blur scale</div>
          {[
            ['Frosted · 8',  '8px',  'rgba(22,24,31,0.35)'],
            ['Glass · 24',   '24px', t.glass],
            ['Strong · 40',  '40px', t.glassStrong],
          ].map(([l, b, bg]) => (
            <div key={l} style={{
              padding: '14px 16px', borderRadius: PRICELY_RADIUS.lg,
              background: bg, border: `1px solid ${t.glassBorder}`,
              backdropFilter: `blur(${b}) saturate(160%)`, WebkitBackdropFilter: `blur(${b}) saturate(160%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: t.text }}>{l}</span>
              <span style={{ fontFamily: PRICELY_TYPE.mono, fontSize: 11, color: t.textFaint }}>backdrop-filter: {b}</span>
            </div>
          ))}
          <div style={{ fontFamily: PRICELY_TYPE.text, fontSize: 11, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: t.textDim, marginTop: 6 }}>Radius</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['xs', 6], ['sm', 10], ['md', 14], ['lg', 20], ['xl', 28]].map(([n, r]) => (
              <div key={n} style={{ flex: 1, height: 64, background: t.glass, border: `1px solid ${t.glassBorder}`, borderRadius: r, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: t.text }}>{n}</span>
                <span style={{ fontFamily: PRICELY_TYPE.mono, fontSize: 9.5, color: t.textFaint }}>{r}px</span>
              </div>
            ))}
          </div>
        </div>
        {/* hero glass demo */}
        <div style={{
          borderRadius: PRICELY_RADIUS.xl, padding: 22, position: 'relative', overflow: 'hidden',
          background: PRICELY_FX.rampAccent,
        }}>
          {/* decorative orbs */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, background: '#1DB954', opacity: 0.45, filter: 'blur(40px)' }}/>
          <div style={{ position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, borderRadius: 60, background: '#1ED760', opacity: 0.3, filter: 'blur(30px)' }}/>
          {/* glass card */}
          <div style={{
            position: 'relative', padding: 18, borderRadius: PRICELY_RADIUS.lg,
            background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.25)', color: '#fff', marginTop: 30,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <PPlatformLogo id="aisle" size={28}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Aisle</div>
                <div style={{ fontSize: 11, opacity: 0.85, fontFamily: PRICELY_TYPE.mono }}>15 min · cheapest</div>
              </div>
              <span style={{ fontFamily: PRICELY_TYPE.mono, fontSize: 22, fontWeight: 500, letterSpacing: -0.5 }}>₹89</span>
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.2)', margin: '6px 0' }}/>
            <div style={{ fontSize: 11, opacity: 0.85, lineHeight: 1.5 }}>Glass over gradient. Note the saturation pull, the inner shine, the soft border.</div>
          </div>
          <div style={{ position: 'absolute', bottom: 18, left: 22, fontFamily: PRICELY_TYPE.mono, fontSize: 10, color: 'rgba(255,255,255,0.75)', letterSpacing: 1, textTransform: 'uppercase' }}>Liquid glass · over rampAccent</div>
        </div>
      </div>
    </RefCard>
  );
}

// Component library showcase
function RefComponents({ mode = 'dark' }) {
  const t = PRICELY_TOKENS[mode];
  return (
    <RefCard t={t} mode={mode} title="Component library" sub="UI Kit · 14 atoms" w={840} h={620}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* search */}
        <Showcase t={t} label="Glass search bar"><PSearchBar t={t} value="" placeholder="Search any product or ride" size="md"/></Showcase>
        <Showcase t={t} label="Search · focused"><PSearchBar t={t} value="Amul Pa" focused size="md"/></Showcase>
        {/* platform pills */}
        <Showcase t={t} label="Platform pills" span={2}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['zip','bolt','aisle','basket','kart','marq','vogue','drift','hop','loop'].map(p => (
              <PPlatformPill key={p} id={p} t={t}/>
            ))}
          </div>
        </Showcase>
        {/* prices and badges */}
        <Showcase t={t} label="Price · sizes">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <PPrice value="89" size="xs" t={t}/>
            <PPrice value="89" size="sm" t={t}/>
            <PPrice value="89" size="md" t={t}/>
            <PPrice value="89" size="lg" t={t}/>
            <PPrice value="89" size="xl" t={t}/>
          </div>
        </Showcase>
        <Showcase t={t} label="Save / ETA / Trend">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <PSaveBadge amount={21} percent={19} t={t}/>
            <PETABadge time="8 min" t={t}/>
            <PETABadge time="2 days" t={t} tone="slow"/>
            <PTrendChip direction="down" amount={42} t={t}/>
            <PTrendChip direction="up" amount={5} t={t}/>
          </div>
        </Showcase>
        {/* verdict */}
        <Showcase t={t} label="Verdict chips" span={2}>
          <div style={{ display: 'flex', gap: 12 }}>
            <PVerdictChip verdict="buy" t={t} confidence={87}/>
            <PVerdictChip verdict="wait" t={t} confidence={64}/>
          </div>
        </Showcase>
        {/* result card */}
        <Showcase t={t} label="Result card · best" span={2}>
          <PResultCard platform="aisle" price={89} mrp={110} eta="15 min" save={21} savePercent={19} offer="AISLE10 · saves ₹10 more" t={t} best/>
        </Showcase>
        <Showcase t={t} label="Result card · default" span={2}>
          <PResultCard platform="zip" price={92} mrp={110} eta="8 min" save={18} savePercent={16} t={t}/>
        </Showcase>
        {/* CTA */}
        <Showcase t={t} label="Primary CTA · ramp">
          <div style={{ padding: '12px 18px', borderRadius: PRICELY_RADIUS.lg, background: PRICELY_FX.rampAccent, color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 24px -8px rgba(43,179,154,0.6)', fontWeight: 600, fontSize: 14 }}>
            Buy on Aisle <span style={{ fontFamily: PRICELY_TYPE.mono, opacity: 0.9 }}>· ₹89</span>
          </div>
        </Showcase>
        <Showcase t={t} label="Secondary · glass">
          <div style={{ padding: '11px 16px', borderRadius: PRICELY_RADIUS.lg, background: t.glass, border: `1px solid ${t.glassBorder}`, color: t.text, display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 500, fontSize: 14 }}>
            Set price alert
          </div>
        </Showcase>
      </div>
    </RefCard>
  );
}

function Showcase({ t, label, span = 1, children }) {
  return (
    <div style={{
      gridColumn: span === 2 ? 'span 2' : undefined,
      padding: 16, borderRadius: PRICELY_RADIUS.md,
      background: t.glass, border: `1px solid ${t.glassBorder}`,
    }}>
      <div style={{ fontFamily: PRICELY_TYPE.mono, fontSize: 10, color: t.textFaint, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>{label}</div>
      {children}
    </div>
  );
}

Object.assign(window, { RefBrand, RefColors, RefType, RefSurfaces, RefComponents });
