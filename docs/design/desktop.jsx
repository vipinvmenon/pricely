// Pricely desktop — product-first web app, NOT a marketing site
// 1440x900 viewport, side nav, comparison grid, detail page, cab compare

function DShell({ mode = 'dark', activeNav = 0, children }) {
  const t = PRICELY_TOKENS[mode];
  const navItems = [
    { l: 'Search',      icon: 'M9 9a6 6 0 1112 0 6 6 0 01-12 0zm-2 14l-4 4' },
    { l: 'Watchlist',   icon: 'M3 6h18M5 6v13a2 2 0 002 2h10a2 2 0 002-2V6M9 11l3 3 3-3' },
    { l: 'Trips',       icon: 'M5 18h14M7 14h10l-1.5-9h-7L7 14z' },
    { l: 'Alerts',      icon: 'M5 18l1.5-2V13a5.5 5.5 0 1111 0v3l1.5 2H5zM10 21a2 2 0 004 0' },
    { l: 'Settings',    icon: 'M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4' },
  ];
  return (
    <div style={{
      width: 1440, height: 900, color: t.text,
      fontFamily: PRICELY_TYPE.text,
      background: mode === 'dark' ? PRICELY_FX.voidDark : PRICELY_FX.voidLight,
      display: 'flex', overflow: 'hidden',
    }}>
      {/* side nav */}
      <div style={{
        width: 232, padding: '24px 16px',
        borderRight: `1px solid ${t.line}`,
        display: 'flex', flexDirection: 'column', gap: 4,
        background: mode === 'dark' ? 'rgba(10,11,14,0.4)' : 'rgba(255,255,255,0.4)',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px 24px' }}>
          <PricelyMarkB size={28}/>
          <span style={{ fontFamily: PRICELY_TYPE.display, fontWeight: 700, fontSize: 18, letterSpacing: -0.6, color: t.text }}>pricely</span>
          <span style={{ fontFamily: PRICELY_TYPE.mono, fontSize: 9, color: t.textFaint, padding: '2px 6px', border: `1px solid ${t.line2}`, borderRadius: 4, marginLeft: 'auto', textTransform: 'uppercase', letterSpacing: 1 }}>IN</span>
        </div>
        {/* command bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 10px', marginBottom: 16,
          borderRadius: PRICELY_RADIUS.md, background: t.glass,
          border: `1px solid ${t.glassBorder}`, color: t.textDim,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/><path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          <span style={{ flex: 1, fontSize: 13, letterSpacing: -0.1 }}>Quick search</span>
          <span style={{ fontFamily: PRICELY_TYPE.mono, fontSize: 10, padding: '2px 5px', borderRadius: 3, background: t.bg2, color: t.textFaint }}>⌘K</span>
        </div>
        {navItems.map((n, i) => {
          const on = i === activeNav;
          return (
            <div key={n.l} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: PRICELY_RADIUS.md,
              background: on ? t.accentSoft : 'transparent',
              color: on ? t.accent : t.textDim,
              border: `1px solid ${on ? 'rgba(63,212,198,0.25)' : 'transparent'}`,
              fontSize: 13.5, fontWeight: on ? 600 : 500, letterSpacing: -0.1,
            }}>
              <svg width="16" height="16" viewBox="0 0 28 28" fill="none">
                <path d={n.icon} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {n.l}
              {n.l === 'Alerts' && <span style={{ marginLeft: 'auto', fontFamily: PRICELY_TYPE.mono, fontSize: 10, padding: '1px 6px', borderRadius: 8, background: t.accent, color: '#fff', fontWeight: 600 }}>3</span>}
            </div>
          );
        })}
        <div style={{ flex: 1 }}/>
        {/* user */}
        <div style={{ padding: 10, borderRadius: PRICELY_RADIUS.md, background: t.glass, border: `1px solid ${t.glassBorder}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 14, background: PRICELY_FX.rampAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>R</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: t.text }}>Riya M.</div>
            <div style={{ fontSize: 10.5, color: t.textFaint, fontFamily: PRICELY_TYPE.mono }}>BLR · Saved ₹4,210 ↓</div>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}

// ─── DESKTOP 1: Search results / compare grid ─────────────────
function DResults({ mode = 'dark' }) {
  const t = PRICELY_TOKENS[mode];
  const platforms = ['aisle','zip','bolt','basket','kart'];
  const rows = [
    { p: 'aisle',  price: 89,  mrp: 110, eta: '15 min', save: 21,  best: true,  offer: 'AISLE10' },
    { p: 'zip',    price: 92,  mrp: 110, eta: '8 min',  save: 18 },
    { p: 'bolt',   price: 96,  mrp: 110, eta: '10 min', save: 14 },
    { p: 'basket', price: 99,  mrp: 110, eta: 'today',  save: 11 },
    { p: 'kart',   price: 110, eta: '2 days' },
  ];
  return (
    <DShell mode={mode} activeNav={0}>
      {/* top bar */}
      <div style={{ padding: '20px 32px 18px', borderBottom: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ flex: 1, maxWidth: 720 }}>
          <PSearchBar t={t} mode={mode} value="Amul Paneer 200g" size="md"/>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: PRICELY_TYPE.mono, fontSize: 11, color: t.textFaint, letterSpacing: 0.5 }}>Live · 12s ago</span>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: t.save, boxShadow: `0 0 8px ${t.save}` }}/>
        </div>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '264px 1fr', overflow: 'hidden' }}>
        {/* filter sidebar */}
        <div style={{ padding: '20px 24px', borderRight: `1px solid ${t.line}`, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <FilterGroup t={t} title="Sort" items={[['Cheapest', true], ['Fastest delivery', false], ['Best value', false], ['Highest rated', false]]} radio/>
          <FilterGroup t={t} title="Platform" items={[['Aisle', true], ['Zip', true], ['Bolt', true], ['Basket', true], ['Kart', true], ['Marq', false]]}/>
          <FilterGroup t={t} title="Delivery in" items={[['<10 min', false], ['<30 min', true], ['Today', true], ['2 days+', false]]}/>
          <div>
            <div style={{ fontFamily: PRICELY_TYPE.text, fontSize: 11, fontWeight: 600, letterSpacing: 1.4, textTransform: 'uppercase', color: t.textDim, marginBottom: 10 }}>Price under</div>
            <div style={{ height: 4, borderRadius: 2, background: t.line, position: 'relative' }}>
              <div style={{ width: '40%', height: '100%', background: PRICELY_FX.rampAccent, borderRadius: 2 }}/>
              <div style={{ position: 'absolute', left: '40%', top: '50%', transform: 'translate(-50%,-50%)', width: 14, height: 14, borderRadius: 7, background: t.bg2, border: `2px solid ${t.accent}` }}/>
            </div>
            <div style={{ marginTop: 8, fontFamily: PRICELY_TYPE.mono, fontSize: 11, color: t.text }}>₹0 — ₹120</div>
          </div>
        </div>

        {/* main grid */}
        <div style={{ padding: '20px 32px 0', overflowY: 'auto' }}>
          {/* product summary card */}
          <div style={{
            display: 'grid', gridTemplateColumns: '120px 1fr 320px',
            gap: 20, padding: 20, borderRadius: PRICELY_RADIUS.lg,
            background: t.glass, border: `1px solid ${t.glassBorder}`,
            marginBottom: 20,
          }}>
            <div style={{ width: 100, height: 100, borderRadius: 14, background: `repeating-linear-gradient(45deg, ${t.bg2}, ${t.bg2} 6px, ${t.bg3} 6px, ${t.bg3} 12px)` }}/>
            <div>
              <div style={{ fontFamily: PRICELY_TYPE.mono, fontSize: 10.5, color: t.textFaint, letterSpacing: 1, textTransform: 'uppercase' }}>Grocery · Dairy</div>
              <div style={{ fontFamily: PRICELY_TYPE.display, fontSize: 28, fontWeight: 600, letterSpacing: -0.8, color: t.text, marginTop: 4 }}>Amul Paneer · 200g</div>
              <div style={{ fontSize: 13, color: t.textDim, marginTop: 6 }}>5 platforms compared · ₹89 cheapest · ₹21 saved vs MRP · updated 12s ago</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <PVerdictChip verdict="buy" t={t} confidence={87}/>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: PRICELY_RADIUS.pill, background: t.glass, border: `1px solid ${t.glassBorder}`, color: t.text, fontSize: 12.5, fontWeight: 500 }}>
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M5 13l1.5-2V8a3.5 3.5 0 117 0v3l1.5 2H5zM8 14a2 2 0 004 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Set price alert
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div style={{ width: '100%' }}>
                <div style={{ fontFamily: PRICELY_TYPE.mono, fontSize: 10.5, color: t.textFaint, letterSpacing: 1, textTransform: 'uppercase', textAlign: 'right' }}>30-day price</div>
                <PSparkChart t={t} width={300} height={64}/>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: PRICELY_TYPE.mono, fontSize: 10, color: t.textFaint, marginTop: 2 }}>
                  <span>30d high ₹110</span>
                  <span style={{ color: t.save }}>30d low ₹89</span>
                </div>
              </div>
            </div>
          </div>

          {/* compare grid */}
          <div style={{ borderRadius: PRICELY_RADIUS.lg, background: t.glass, border: `1px solid ${t.glassBorder}`, overflow: 'hidden' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1.6fr 0.9fr 0.9fr 1fr 1.1fr 0.9fr',
              padding: '12px 20px', fontFamily: PRICELY_TYPE.mono, fontSize: 10.5,
              color: t.textFaint, letterSpacing: 1, textTransform: 'uppercase',
              borderBottom: `1px solid ${t.line}`, background: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            }}>
              <div>Platform</div><div>Price</div><div>MRP</div><div>You save</div><div>Delivery</div><div>Action</div>
            </div>
            {rows.map((r, i) => (
              <div key={r.p} style={{
                display: 'grid', gridTemplateColumns: '1.6fr 0.9fr 0.9fr 1fr 1.1fr 0.9fr',
                padding: '14px 20px', alignItems: 'center',
                borderBottom: i < rows.length - 1 ? `1px solid ${t.line}` : 'none',
                background: r.best ? t.accentSoft : 'transparent',
                position: 'relative',
              }}>
                {r.best && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: PRICELY_FX.rampAccent }}/>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <PPlatformLogo id={r.p} size={28}/>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: t.text, letterSpacing: -0.2 }}>{PRICELY_PLATFORMS[r.p].name}</div>
                    {r.offer && <div style={{ fontSize: 10.5, fontFamily: PRICELY_TYPE.mono, color: t.save, marginTop: 1 }}>code: {r.offer}</div>}
                  </div>
                </div>
                <div><PPrice value={r.price} size="md" t={t}/></div>
                <div>{r.mrp ? <PPrice value={r.mrp} size="sm" t={t} strike/> : <span style={{ color: t.textFaint, fontFamily: PRICELY_TYPE.mono, fontSize: 13 }}>—</span>}</div>
                <div>{r.save ? <PSaveBadge amount={r.save} t={t}/> : <span style={{ color: t.textFaint, fontFamily: PRICELY_TYPE.mono, fontSize: 11 }}>—</span>}</div>
                <div><PETABadge time={r.eta} t={t} tone="fast"/></div>
                <div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '7px 14px', borderRadius: PRICELY_RADIUS.pill,
                    background: r.best ? PRICELY_FX.rampAccent : (mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(20,18,15,0.06)'),
                    color: r.best ? '#fff' : t.text,
                    fontSize: 12, fontWeight: 600, letterSpacing: -0.1,
                  }}>
                    Buy <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginLeft: 1 }}><path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ height: 24 }}/>
        </div>
      </div>
    </DShell>
  );
}

function FilterGroup({ t, title, items, radio = false }) {
  return (
    <div>
      <div style={{ fontFamily: PRICELY_TYPE.text, fontSize: 11, fontWeight: 600, letterSpacing: 1.4, textTransform: 'uppercase', color: t.textDim, marginBottom: 10 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(([label, on]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: t.text, letterSpacing: -0.1 }}>
            <div style={{
              width: radio ? 14 : 14, height: 14, borderRadius: radio ? 7 : 4,
              border: `1.5px solid ${on ? t.accent : t.line2}`,
              background: on ? (radio ? 'transparent' : t.accent) : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {on && (radio
                ? <div style={{ width: 7, height: 7, borderRadius: 4, background: t.accent }}/>
                : <svg width="9" height="9" viewBox="0 0 9 9"><path d="M1 4.5L3.5 7 8 1.5" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round"/></svg>)}
            </div>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DESKTOP 2: Product detail page ────────────────────────────
function DDetail({ mode = 'dark' }) {
  const t = PRICELY_TOKENS[mode];
  const months = ['Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May'];
  const data = [71200, 70800, 70500, 69900, 69200, 67500, 66100, 65000, 63800, 62499];
  return (
    <DShell mode={mode} activeNav={0}>
      <div style={{ padding: '20px 40px', flex: 1, overflowY: 'auto' }}>
        {/* breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: PRICELY_TYPE.mono, fontSize: 11, color: t.textFaint, letterSpacing: 0.5, marginBottom: 16 }}>
          <span>SEARCH</span> <span>›</span> <span>ELECTRONICS</span> <span>›</span> <span style={{ color: t.text }}>IPHONE 15 128GB</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '440px 1fr', gap: 32 }}>
          {/* left: hero + variant */}
          <div>
            <div style={{
              height: 380, borderRadius: PRICELY_RADIUS.xl,
              background: `radial-gradient(circle at 50% 40%, ${t.bg3}, ${t.bg1})`,
              border: `1px solid ${t.glassBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: PRICELY_TYPE.mono, fontSize: 11, color: t.textFaint, letterSpacing: 1,
              position: 'relative',
            }}>
              [ product render ]
              <div style={{ position: 'absolute', bottom: 12, left: 12, padding: '4px 8px', borderRadius: 6, background: t.glassStrong, border: `1px solid ${t.glassBorder}`, fontSize: 10, color: t.text }}>1 / 4</div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{ flex: 1, height: 60, borderRadius: 10, background: t.glass, border: `1px solid ${i === 0 ? t.accent : t.glassBorder}` }}/>
              ))}
            </div>
            <div style={{ marginTop: 24 }}>
              <div style={{ fontFamily: PRICELY_TYPE.text, fontSize: 11, fontWeight: 600, letterSpacing: 1.4, textTransform: 'uppercase', color: t.textDim, marginBottom: 10 }}>Storage</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['128GB', '256GB', '512GB'].map((v, i) => (
                  <div key={v} style={{
                    padding: '10px 14px', borderRadius: PRICELY_RADIUS.md,
                    background: i === 0 ? t.accentSoft : t.glass,
                    border: `1px solid ${i === 0 ? t.accent : t.glassBorder}`,
                    color: i === 0 ? t.accent : t.text,
                    fontSize: 13, fontWeight: 500, letterSpacing: -0.1,
                  }}>{v}</div>
                ))}
              </div>
              <div style={{ fontFamily: PRICELY_TYPE.text, fontSize: 11, fontWeight: 600, letterSpacing: 1.4, textTransform: 'uppercase', color: t.textDim, margin: '18px 0 10px' }}>Color</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {['#1F1F23','#F5F0E6','#7B6354','#3A4A5E'].map((c, i) => (
                  <div key={c} style={{ width: 32, height: 32, borderRadius: 16, background: c, border: i === 0 ? `2px solid ${t.accent}` : `1px solid ${t.glassBorder}`, boxShadow: 'inset 0 0 0 2px ' + (mode === 'dark' ? '#0A0B0E' : '#fff') }}/>
                ))}
              </div>
            </div>
          </div>

          {/* right: summary + chart + offers */}
          <div>
            <div style={{ fontFamily: PRICELY_TYPE.mono, fontSize: 10.5, color: t.textFaint, letterSpacing: 1, textTransform: 'uppercase' }}>Apple · Smartphone</div>
            <div style={{ fontFamily: PRICELY_TYPE.display, fontSize: 38, fontWeight: 600, letterSpacing: -1.2, color: t.text, marginTop: 6, lineHeight: 1.05 }}>iPhone 15 · 128GB Black Titanium</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 18 }}>
              <PPrice value="62,499" size="xl" t={t}/>
              <PPrice value="68,999" size="md" t={t} strike/>
              <PSaveBadge amount="6,500" percent={9} t={t}/>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
              <PPlatformLogo id="kart" size={22}/>
              <span style={{ fontSize: 13, color: t.textDim }}>Cheapest on <span style={{ color: t.text, fontWeight: 600 }}>Kart</span> · ships tomorrow · 4 platforms compared</span>
            </div>

            {/* big chart */}
            <div style={{ marginTop: 24, padding: 20, borderRadius: PRICELY_RADIUS.lg, background: t.glass, border: `1px solid ${t.glassBorder}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontFamily: PRICELY_TYPE.text, fontSize: 12, fontWeight: 600, letterSpacing: 1.4, textTransform: 'uppercase', color: t.textDim }}>Price history</div>
                  <div style={{ fontFamily: PRICELY_TYPE.display, fontSize: 18, fontWeight: 600, color: t.text, marginTop: 4 }}>Down ₹8,701 since launch</div>
                </div>
                <div style={{ display: 'flex', gap: 4, padding: 3, borderRadius: 8, background: t.bg2, border: `1px solid ${t.line}` }}>
                  {['30d','90d','6m','1y','All'].map((r, i) => (
                    <span key={r} style={{
                      padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                      background: i === 2 ? t.bg3 : 'transparent',
                      color: i === 2 ? t.text : t.textDim,
                    }}>{r}</span>
                  ))}
                </div>
              </div>
              <DLineChart t={t} data={data} months={months} mode={mode}/>
              <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
                <PVerdictChip verdict="wait" t={t} confidence={64}/>
                <span style={{ fontSize: 12, color: t.textDim, alignSelf: 'center' }}>Pricely predicts <span style={{ color: t.text, fontWeight: 600 }}>₹59,999</span> within 14 days based on 30d trend.</span>
              </div>
            </div>

            {/* compact offer list */}
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <PResultCard platform="kart"  price="62,499" mrp="68,999" eta="Tomorrow" save="6,500" savePercent={9} t={t} mode={mode} best compact/>
              <PResultCard platform="marq"  price="63,250" mrp="68,999" eta="2 days"   save="5,749" savePercent={8} t={t} mode={mode} compact/>
              <PResultCard platform="vogue" price="64,999" eta="3 days"  t={t} mode={mode} compact/>
            </div>
          </div>
        </div>
      </div>
    </DShell>
  );
}

function DLineChart({ t, data, months, mode }) {
  const W = 720, H = 200;
  const min = Math.min(...data), max = Math.max(...data);
  const sx = (i) => (i / (data.length - 1)) * (W - 40) + 20;
  const sy = (v) => H - 30 - ((v - min) / (max - min || 1)) * (H - 60);
  const path = data.map((v, i) => `${i ? 'L' : 'M'}${sx(i)} ${sy(v)}`).join(' ');
  const fill = `${path} L${sx(data.length - 1)} ${H - 30} L${sx(0)} ${H - 30} Z`;
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="dchartfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={t.accent} stopOpacity="0.32"/>
          <stop offset="1" stopColor={t.accent} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* grid */}
      {[0,1,2,3].map(i => (
        <line key={i} x1="20" x2={W-20} y1={30 + i*40} y2={30 + i*40} stroke={t.grid} strokeDasharray="2 4"/>
      ))}
      <path d={fill} fill="url(#dchartfill)"/>
      <path d={path} stroke={t.accent} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      {/* end marker */}
      <circle cx={sx(data.length - 1)} cy={sy(data[data.length - 1])} r="5" fill={t.accent}/>
      <circle cx={sx(data.length - 1)} cy={sy(data[data.length - 1])} r="10" fill={t.accent} opacity="0.2"/>
      {months.map((m, i) => (
        <text key={m} x={sx(i)} y={H - 8} fill={t.textFaint} fontFamily={PRICELY_TYPE.mono} fontSize="10" textAnchor="middle">{m}</text>
      ))}
    </svg>
  );
}

// ─── DESKTOP 3: Cab fare compare ───────────────────────────────
function DCab({ mode = 'dark' }) {
  const t = PRICELY_TOKENS[mode];
  const cabs = [
    { p: 'drift', tier: 'Mini',  price: 312, eta: '4 min', save: 88, sp: 22, best: true, surge: 1.2 },
    { p: 'hop',   tier: 'Go',    price: 348, eta: '6 min', save: 52, sp: 13,             surge: 1.4 },
    { p: 'loop',  tier: 'Auto',  price: 218, eta: '9 min',                                  surge: 1.0 },
    { p: 'drift', tier: 'Sedan', price: 412, eta: '5 min',                                  surge: 1.2 },
    { p: 'hop',   tier: 'XL',    price: 488, eta: '7 min',                                  surge: 1.4 },
  ];
  return (
    <DShell mode={mode} activeNav={2}>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '440px 1fr', overflow: 'hidden' }}>
        {/* trip planner */}
        <div style={{ padding: '24px 28px', borderRight: `1px solid ${t.line}`, overflowY: 'auto' }}>
          <div style={{ fontFamily: PRICELY_TYPE.display, fontSize: 26, fontWeight: 600, letterSpacing: -0.6, color: t.text, marginBottom: 4 }}>One-time fare check</div>
          <div style={{ fontSize: 13, color: t.textDim, marginBottom: 18 }}>We'll compare fares across cab apps in real time.</div>

          <div style={{
            padding: 18, borderRadius: PRICELY_RADIUS.lg,
            background: t.glass, border: `1px solid ${t.glassBorder}`,
            display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16,
          }}>
            {[
              ['From', 'Indiranagar, Bengaluru', t.text],
              ['To',   'Kempegowda Intl. Airport (BLR)', t.accent],
            ].map(([l, v, c], i) => (
              <React.Fragment key={l}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: i === 0 ? 4 : 2, background: c, flexShrink: 0 }}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10.5, color: t.textFaint, fontFamily: PRICELY_TYPE.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>{l}</div>
                    <div style={{ fontSize: 14.5, fontWeight: 500, color: t.text, letterSpacing: -0.2 }}>{v}</div>
                  </div>
                </div>
                {i === 0 && <div style={{ height: 1, background: t.line, marginLeft: 18 }}/>}
              </React.Fragment>
            ))}
          </div>
          {/* trip stats */}
          <div style={{
            padding: 18, borderRadius: PRICELY_RADIUS.lg,
            background: t.glass, border: `1px solid ${t.glassBorder}`,
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16,
          }}>
            {[['Distance', '38 km'], ['ETA', '~52 min'], ['Surge', '1.4×']].map(([k, v], i) => (
              <div key={k}>
                <div style={{ fontSize: 10.5, color: t.textFaint, fontFamily: PRICELY_TYPE.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>{k}</div>
                <div style={{ fontFamily: PRICELY_TYPE.display, fontSize: 18, fontWeight: 600, color: i === 2 ? t.warn : t.text, marginTop: 4, letterSpacing: -0.4 }}>{v}</div>
              </div>
            ))}
          </div>
          {/* surge advisor */}
          <div style={{
            padding: 16, borderRadius: PRICELY_RADIUS.lg,
            background: 'rgba(255,192,98,0.08)', border: '1px solid rgba(255,192,98,0.25)',
            display: 'flex', gap: 12, alignItems: 'flex-start',
          }}>
            <div style={{ width: 32, height: 32, borderRadius: 16, background: 'rgba(255,192,98,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.warn, flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5l5.5 10h-11L7 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M7 5.5v3M7 10v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.text, letterSpacing: -0.1 }}>Wait 12 min, save ~₹56</div>
              <div style={{ fontSize: 12, color: t.textDim, marginTop: 4, lineHeight: 1.5 }}>Surge across all 3 apps drops to 1.0× by 12:18. Pricely will refresh fares automatically.</div>
            </div>
          </div>

          <div style={{ marginTop: 18, fontFamily: PRICELY_TYPE.text, fontSize: 11, fontWeight: 600, letterSpacing: 1.4, textTransform: 'uppercase', color: t.textDim, marginBottom: 10 }}>Filter</div>
          <FilterGroup t={t} title="Vehicle" items={[['Auto', true], ['Mini / Go', true], ['Sedan', true], ['XL / 6-seater', false]]}/>
        </div>

        {/* fare grid + map */}
        <div style={{ padding: '24px 32px', overflowY: 'auto' }}>
          {/* mock map */}
          <div style={{
            height: 220, borderRadius: PRICELY_RADIUS.lg,
            background: `radial-gradient(circle at 30% 40%, ${t.bg3}, ${t.bg1})`,
            border: `1px solid ${t.glassBorder}`,
            position: 'relative', overflow: 'hidden', marginBottom: 20,
          }}>
            {/* faux roads */}
            <svg width="100%" height="100%" viewBox="0 0 800 220" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
              <path d="M40 180 C 200 140, 320 90, 500 80 S 720 60, 760 30" stroke={t.accent} strokeWidth="2.5" fill="none" strokeDasharray="4 5"/>
              {[0.1, 0.18, 0.28, 0.4, 0.55, 0.72, 0.9].map((p, i) => (
                <circle key={i} cx={40 + p*720} cy={180 - p*150} r="1.5" fill={t.textFaint}/>
              ))}
            </svg>
            <div style={{ position: 'absolute', left: 32, bottom: 30, display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 6, background: t.text, boxShadow: `0 0 0 4px ${t.glass}` }}/>
              <span style={{ fontSize: 11, fontWeight: 500, color: t.text, background: t.glassStrong, padding: '3px 8px', borderRadius: 4, border: `1px solid ${t.glassBorder}` }}>Indiranagar</span>
            </div>
            <div style={{ position: 'absolute', right: 32, top: 18, display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: t.accent, boxShadow: `0 0 0 4px ${t.glass}` }}/>
              <span style={{ fontSize: 11, fontWeight: 500, color: t.text, background: t.glassStrong, padding: '3px 8px', borderRadius: 4, border: `1px solid ${t.glassBorder}` }}>BLR Airport</span>
            </div>
          </div>

          {/* compare table */}
          <div style={{ borderRadius: PRICELY_RADIUS.lg, background: t.glass, border: `1px solid ${t.glassBorder}`, overflow: 'hidden' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1.5fr 0.9fr 0.9fr 1fr 0.9fr 1fr',
              padding: '12px 20px', fontFamily: PRICELY_TYPE.mono, fontSize: 10.5,
              color: t.textFaint, letterSpacing: 1, textTransform: 'uppercase',
              borderBottom: `1px solid ${t.line}`, background: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            }}>
              <div>App · Tier</div><div>Fare</div><div>Save</div><div>ETA</div><div>Surge</div><div>Action</div>
            </div>
            {cabs.map((r, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1.5fr 0.9fr 0.9fr 1fr 0.9fr 1fr',
                padding: '14px 20px', alignItems: 'center',
                borderBottom: i < cabs.length - 1 ? `1px solid ${t.line}` : 'none',
                background: r.best ? t.accentSoft : 'transparent',
                position: 'relative',
              }}>
                {r.best && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: PRICELY_FX.rampAccent }}/>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <PPlatformLogo id={r.p} size={28}/>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: t.text, letterSpacing: -0.2 }}>{PRICELY_PLATFORMS[r.p].name}</div>
                    <div style={{ fontSize: 11, color: t.textDim, marginTop: 1 }}>{r.tier}</div>
                  </div>
                </div>
                <div><PPrice value={r.price} size="md" t={t}/></div>
                <div>{r.save ? <PSaveBadge amount={r.save} percent={r.sp} t={t}/> : <span style={{ color: t.textFaint, fontFamily: PRICELY_TYPE.mono, fontSize: 11 }}>—</span>}</div>
                <div><PETABadge time={r.eta} t={t}/></div>
                <div style={{ fontFamily: PRICELY_TYPE.mono, fontSize: 13, color: r.surge > 1.2 ? t.warn : t.textDim, fontVariantNumeric: 'tabular-nums' }}>{r.surge.toFixed(1)}×</div>
                <div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '7px 14px', borderRadius: PRICELY_RADIUS.pill,
                    background: r.best ? PRICELY_FX.rampAccent : (mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(20,18,15,0.06)'),
                    color: r.best ? '#fff' : t.text,
                    fontSize: 12, fontWeight: 600, letterSpacing: -0.1,
                  }}>
                    Open {PRICELY_PLATFORMS[r.p].name} <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DShell>
  );
}

Object.assign(window, { DShell, DResults, DDetail, DCab });
