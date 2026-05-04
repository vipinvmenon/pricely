// Pricely mobile screens — sized for iOS frame (402x874 inner content)
// Each screen returns the inside-of-frame content; the canvas wraps it in IOSDevice.

// ─── helpers ────────────────────────────────────────────────────
function MScreenBg({ t, mode, children, padTop = 56 }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: mode === 'dark' ? PRICELY_FX.voidDark : PRICELY_FX.voidLight,
      color: t.text,
      fontFamily: PRICELY_TYPE.text,
      paddingTop: padTop,
      display: 'flex', flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>{children}</div>
  );
}

// Floating tab bar wrapper — sits over content, not flush
function MFloatingTab({ t, mode, active }) {
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 20 }}>
      <PTabBar t={t} mode={mode} active={active}/>
    </div>
  );
}

function MStatusFaux({ t, time = '9:41' }) {
  // Lightweight status row when the iOS status bar is also rendered by the frame
  // (we just leave space)
  return null;
}

// ─── 1. HOME — search-first ─────────────────────────────────────
function MHome({ mode = 'dark' }) {
  const t = PRICELY_TOKENS[mode];
  const trending = ['Amul Paneer 200g', 'iPhone 15', 'Onion 1kg', 'Nike Pegasus', 'Coke 750ml'];
  const recent = [
    { q: 'Maggi 12-pack', best: '₹148', save: 22, plat: 'aisle' },
    { q: 'Samsonite carry-on', best: '₹6,499', save: 1100, plat: 'kart' },
    { q: 'Airport drop · BLR', best: '₹312', save: 88, plat: 'drift' },
  ];
  return (
    <MScreenBg t={t} mode={mode} padTop={54}>
      {/* greeting + brand */}
      <div style={{ padding: '12px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <PricelyMarkB size={28}/>
          <span style={{ fontFamily: PRICELY_TYPE.display, fontWeight: 700, fontSize: 17, letterSpacing: -0.5, color: t.text }}>pricely</span>
          <div style={{ flex: 1 }}/>
          <div style={{ width: 32, height: 32, borderRadius: 16, background: t.glass, border: `1px solid ${t.glassBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.textDim }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v4M7 9v4M1 7h4M9 7h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          </div>
        </div>
        <div style={{ fontFamily: PRICELY_TYPE.display, fontSize: 32, fontWeight: 600, letterSpacing: -1.2, lineHeight: 1.05, color: t.text, textWrap: 'pretty' }}>
          Find the<br/>cheapest, fastest<br/><span style={{ background: PRICELY_FX.rampAccent, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>everything.</span>
        </div>
      </div>
      <div style={{ padding: '4px 16px 0' }}>
        <PSearchBar t={t} mode={mode} value="" placeholder="Search any product or ride" size="lg"/>
      </div>
      {/* category chips */}
      <div style={{ padding: '14px 16px 0', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {[['Grocery','◐'],['Electronics','◢'],['Fashion','◇'],['Cabs','▷'],['Food','◯']].map((c, i) => (
          <div key={c[0]} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
            padding: '8px 14px', borderRadius: PRICELY_RADIUS.pill,
            background: i === 0 ? t.accentSoft : t.glass,
            border: `1px solid ${i === 0 ? t.accent : t.glassBorder}`,
            color: i === 0 ? t.accent : t.text,
            fontSize: 13, fontWeight: 500, letterSpacing: -0.1,
          }}>
            <span style={{ opacity: 0.7 }}>{c[1]}</span>{c[0]}
          </div>
        ))}
      </div>
      {/* trending */}
      <div style={{ padding: '24px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: PRICELY_TYPE.text, fontSize: 12, fontWeight: 600, letterSpacing: 1.4, textTransform: 'uppercase', color: t.textDim }}>Trending in your area</span>
        <span style={{ fontFamily: PRICELY_TYPE.mono, fontSize: 10, color: t.textFaint }}>BLR · 12:04</span>
      </div>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {trending.map((q, i) => (
          <div key={q} style={{
            padding: '12px 14px', borderRadius: PRICELY_RADIUS.md,
            background: t.glass, border: `1px solid ${t.glassBorder}`,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontFamily: PRICELY_TYPE.mono, fontSize: 11, color: t.textFaint, width: 16 }}>0{i+1}</span>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: t.text, letterSpacing: -0.2 }}>{q}</span>
            <PTrendChip direction="down" amount={[12,8,3,42,5][i]} t={t}/>
          </div>
        ))}
      </div>
      {/* recent watchlist */}
      <div style={{ padding: '20px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: PRICELY_TYPE.text, fontSize: 12, fontWeight: 600, letterSpacing: 1.4, textTransform: 'uppercase', color: t.textDim }}>You're watching</span>
        <span style={{ fontFamily: PRICELY_TYPE.text, fontSize: 12, color: t.accent, fontWeight: 500 }}>See all</span>
      </div>
      <div style={{ padding: '0 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {recent.map((r) => (
          <div key={r.q} style={{
            padding: '12px 14px', borderRadius: PRICELY_RADIUS.md,
            background: t.glass, border: `1px solid ${t.glassBorder}`,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <PPlatformLogo id={r.plat} size={32}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: t.text, letterSpacing: -0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.q}</div>
              <div style={{ fontFamily: PRICELY_TYPE.mono, fontSize: 10.5, color: t.save, marginTop: 2 }}>↓ ₹{r.save} since you watched</div>
            </div>
            <span style={{ fontFamily: PRICELY_TYPE.mono, fontSize: 14, fontWeight: 600, color: t.text }}>{r.best}</span>
          </div>
        ))}
      </div>
      <div style={{ flex: 1 }}/>
      <div style={{ height: 80 }}/>
      <MFloatingTab t={t} mode={mode} active={0}/>
    </MScreenBg>
  );
}

// ─── 2. SEARCH RESULTS — sorted cheapest first ─────────────────
function MResults({ mode = 'dark' }) {
  const t = PRICELY_TOKENS[mode];
  const offers = [
    { p: 'aisle', price: 89, mrp: 110, eta: '15 min', save: 21, sp: 19, offer: 'AISLE10 · saves ₹10 more' },
    { p: 'zip',   price: 92, mrp: 110, eta: '8 min',  save: 18, sp: 16 },
    { p: 'bolt',  price: 96, mrp: 110, eta: '10 min', save: 14, sp: 13 },
    { p: 'basket',price: 99, mrp: 110, eta: 'today',  save: 11, sp: 10 },
    { p: 'kart',  price: 110,           eta: '2 days' },
  ];
  return (
    <MScreenBg t={t} mode={mode} padTop={54}>
      {/* sticky search */}
      <div style={{ padding: '6px 16px 12px', position: 'relative', zIndex: 10 }}>
        <PSearchBar t={t} mode={mode} value="Amul Paneer 200g" size="md"/>
      </div>
      {/* product header card */}
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{
          padding: 14, borderRadius: PRICELY_RADIUS.lg,
          background: t.glass, border: `1px solid ${t.glassBorder}`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: `repeating-linear-gradient(45deg, ${t.bg2}, ${t.bg2} 6px, ${t.bg3} 6px, ${t.bg3} 12px)`, flexShrink: 0 }}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: PRICELY_TYPE.text, fontSize: 14.5, fontWeight: 600, color: t.text, letterSpacing: -0.2 }}>Amul Paneer · 200g</div>
            <div style={{ fontFamily: PRICELY_TYPE.text, fontSize: 12, color: t.textDim, marginTop: 2 }}>Compared across 5 platforms · updated 12s ago</div>
            <div style={{ marginTop: 8 }}>
              <PVerdictChip verdict="buy" t={t} confidence={87}/>
            </div>
          </div>
        </div>
      </div>
      {/* sort row */}
      <div style={{ padding: '0 16px 10px', display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ fontFamily: PRICELY_TYPE.mono, fontSize: 10.5, color: t.textFaint, marginRight: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Sort</span>
        {['Cheapest', 'Fastest', 'Best value'].map((s, i) => (
          <span key={s} style={{
            padding: '4px 10px', borderRadius: PRICELY_RADIUS.pill,
            fontSize: 11.5, fontWeight: 500,
            background: i === 0 ? t.accentSoft : 'transparent',
            border: `1px solid ${i === 0 ? t.accent : t.glassBorder}`,
            color: i === 0 ? t.accent : t.textDim,
          }}>{s}</span>
        ))}
      </div>
      {/* results */}
      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', flex: 1 }}>
        {offers.map((o, i) => (
          <PResultCard key={o.p} platform={o.p} price={o.price} mrp={o.mrp} eta={o.eta}
            save={o.save} savePercent={o.sp} offer={o.offer} t={t} mode={mode} best={i === 0} compact/>
        ))}
        {/* alert me at price */}
        <div style={{
          marginTop: 6, padding: '14px 16px', borderRadius: PRICELY_RADIUS.lg,
          border: `1px dashed ${t.line2}`, background: 'transparent',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 13l1.5-2V8a4.5 4.5 0 119 0v3l1.5 2H3zM7 15a2 2 0 004 0" stroke={t.textDim} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div style={{ flex: 1, fontSize: 13, color: t.textDim, letterSpacing: -0.1 }}>Alert me when below <span style={{ color: t.text, fontWeight: 600 }}>₹85</span></div>
          <span style={{ fontSize: 12, color: t.accent, fontWeight: 600 }}>Set</span>
        </div>
      </div>
      {/* sticky bottom CTA */}
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{
          padding: '14px 18px', borderRadius: PRICELY_RADIUS.lg,
          background: PRICELY_FX.rampAccent, color: '#fff',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 8px 24px -8px rgba(43,179,154,0.6)',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: PRICELY_TYPE.text, fontSize: 11, opacity: 0.85, letterSpacing: 0.6, textTransform: 'uppercase' }}>Buy on Aisle</div>
            <div style={{ fontFamily: PRICELY_TYPE.display, fontSize: 18, fontWeight: 700, letterSpacing: -0.4 }}>₹89 · Saves ₹21</div>
          </div>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 10h10M11 5l5 5-5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </div>
      <div style={{ height: 80 }}/>
      <MFloatingTab t={t} mode={mode} active={0}/>
    </MScreenBg>
  );
}

// ─── 3. PRODUCT DETAIL — price history + verdict ───────────────
function MDetail({ mode = 'dark' }) {
  const t = PRICELY_TOKENS[mode];
  return (
    <MScreenBg t={t} mode={mode} padTop={54}>
      {/* product hero */}
      <div style={{ padding: '8px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontFamily: PRICELY_TYPE.mono, fontSize: 10.5, color: t.textFaint, letterSpacing: 1, textTransform: 'uppercase' }}>Electronics · Apple</span>
        </div>
        <div style={{ fontFamily: PRICELY_TYPE.display, fontSize: 26, fontWeight: 600, letterSpacing: -0.8, color: t.text, lineHeight: 1.1 }}>iPhone 15 · 128GB<br/><span style={{ color: t.textDim, fontWeight: 500 }}>Black Titanium</span></div>
      </div>
      {/* hero image placeholder */}
      <div style={{ margin: '16px 20px 0', height: 180, borderRadius: PRICELY_RADIUS.xl,
        background: `radial-gradient(circle at 50% 40%, ${t.bg3}, ${t.bg1})`,
        border: `1px solid ${t.glassBorder}`, position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: PRICELY_TYPE.mono, fontSize: 11, color: t.textFaint, letterSpacing: 1 }}>[ product render ]</span>
        <div style={{ position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: 18, background: t.glassStrong, border: `1px solid ${t.glassBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.text }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 12s-5-3-5-7a3 3 0 015-2 3 3 0 015 2c0 4-5 7-5 7z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
        </div>
      </div>
      {/* price card with sparkline */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ padding: 18, borderRadius: PRICELY_RADIUS.lg, background: t.glass, border: `1px solid ${t.glassBorder}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontFamily: PRICELY_TYPE.mono, fontSize: 10.5, color: t.textFaint, letterSpacing: 1, textTransform: 'uppercase' }}>Lowest right now</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                <PPrice value="62,499" size="lg" t={t}/>
                <PSaveBadge amount="6,500" percent={9} t={t}/>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <PPlatformLogo id="kart" size={18}/>
                <span style={{ fontSize: 12, color: t.textDim }}>Kart · ships tomorrow</span>
              </div>
            </div>
            <PVerdictChip verdict="wait" t={t} confidence={64}/>
          </div>
          <div style={{ marginTop: 12, marginBottom: 8 }}>
            <PSparkChart t={t} width={336} height={72}/>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: PRICELY_TYPE.mono, fontSize: 10, color: t.textFaint }}>
            <span>90d ago · ₹71,200</span>
            <span>Today · ₹62,499</span>
          </div>
        </div>
      </div>
      {/* compare list */}
      <div style={{ padding: '14px 16px 0', display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', flex: 1 }}>
        <span style={{ fontFamily: PRICELY_TYPE.text, fontSize: 12, fontWeight: 600, letterSpacing: 1.4, textTransform: 'uppercase', color: t.textDim, marginBottom: 2 }}>Across 4 platforms</span>
        <PResultCard platform="kart"  price="62,499" mrp="68,999" eta="Tomorrow" save="6,500" savePercent={9} t={t} mode={mode} best compact/>
        <PResultCard platform="marq"  price="63,250" mrp="68,999" eta="2 days"   save="5,749" savePercent={8} t={t} mode={mode} compact/>
        <PResultCard platform="vogue" price="64,999" eta="3 days"  t={t} mode={mode} compact/>
      </div>
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{
          padding: '14px 18px', borderRadius: PRICELY_RADIUS.lg,
          background: t.glassStrong, border: `1px solid ${t.line2}`,
          display: 'flex', alignItems: 'center', gap: 10, color: t.text,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: PRICELY_TYPE.text, fontSize: 11, color: t.textDim, letterSpacing: 0.6, textTransform: 'uppercase' }}>Watch · alert me at</div>
            <div style={{ fontFamily: PRICELY_TYPE.display, fontSize: 17, fontWeight: 700 }}>₹59,999 <span style={{ color: t.textDim, fontWeight: 500, fontSize: 13 }}>likely in ~14 days</span></div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: 18, background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
        </div>
      </div>
      <div style={{ height: 80 }}/>
      <MFloatingTab t={t} mode={mode} active={0}/>
    </MScreenBg>
  );
}

// ─── 4. CAB FARE — same DNA, different content ─────────────────
function MCab({ mode = 'dark' }) {
  const t = PRICELY_TOKENS[mode];
  const cabs = [
    { p: 'drift', tier: 'Mini',  price: 312, eta: '4 min', save: 88, sp: 22, offer: 'DRIFT100 applied' },
    { p: 'hop',   tier: 'Go',    price: 348, eta: '6 min', save: 52, sp: 13 },
    { p: 'loop',  tier: 'Auto',  price: 218, eta: '9 min', save: 0, sp: 0, slow: true },
    { p: 'drift', tier: 'Sedan', price: 412, eta: '5 min' },
  ];
  return (
    <MScreenBg t={t} mode={mode} padTop={54}>
      {/* trip header */}
      <div style={{ padding: '4px 20px 14px' }}>
        <div style={{ fontFamily: PRICELY_TYPE.mono, fontSize: 10.5, color: t.textFaint, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>One-time fare check</div>
        <div style={{
          padding: 14, borderRadius: PRICELY_RADIUS.lg,
          background: t.glass, border: `1px solid ${t.glassBorder}`,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {/* from */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: t.text, flexShrink: 0 }}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10.5, color: t.textFaint, fontFamily: PRICELY_TYPE.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>From</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: t.text, letterSpacing: -0.2 }}>Indiranagar, Bengaluru</div>
            </div>
          </div>
          <div style={{ height: 1, background: t.line, marginLeft: 18 }}/>
          {/* to */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: t.accent, flexShrink: 0 }}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10.5, color: t.textFaint, fontFamily: PRICELY_TYPE.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>To</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: t.text, letterSpacing: -0.2 }}>Kempegowda Intl. Airport (BLR)</div>
            </div>
            <span style={{ fontFamily: PRICELY_TYPE.mono, fontSize: 11, color: t.textDim }}>38 km</span>
          </div>
        </div>
      </div>
      {/* sort */}
      <div style={{ padding: '0 16px 10px', display: 'flex', gap: 6 }}>
        {['Cheapest', 'Fastest', 'Comfort'].map((s, i) => (
          <span key={s} style={{
            padding: '5px 12px', borderRadius: PRICELY_RADIUS.pill,
            fontSize: 11.5, fontWeight: 500,
            background: i === 0 ? t.accentSoft : 'transparent',
            border: `1px solid ${i === 0 ? t.accent : t.glassBorder}`,
            color: i === 0 ? t.accent : t.textDim,
          }}>{s}</span>
        ))}
      </div>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', flex: 1 }}>
        {cabs.map((c, i) => (
          <div key={i} style={{
            padding: '14px 16px', borderRadius: PRICELY_RADIUS.lg,
            background: i === 0 ? t.glassStrong : t.glass,
            border: `1px solid ${i === 0 ? t.accent : t.glassBorder}`,
            display: 'flex', alignItems: 'center', gap: 12,
            position: 'relative', overflow: 'hidden',
            boxShadow: i === 0 ? `0 0 0 1px ${t.accent} inset, 0 12px 32px -12px rgba(43,179,154,0.35)` : 'none',
          }}>
            {i === 0 && (
              <div style={{ position: 'absolute', top: -1, right: 18, padding: '3px 10px 4px', borderRadius: '0 0 8px 8px', background: PRICELY_FX.rampAccent, color: '#fff', fontFamily: PRICELY_TYPE.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Cheapest</div>
            )}
            <PPlatformLogo id={c.p} size={40}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: PRICELY_TYPE.text, fontSize: 14.5, fontWeight: 600, color: t.text, letterSpacing: -0.2 }}>{PRICELY_PLATFORMS[c.p].name}</span>
                <span style={{ fontSize: 12, color: t.textDim }}>· {c.tier}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <PETABadge time={c.eta} t={t} tone={c.slow ? 'slow' : 'fast'}/>
                {c.offer && <span style={{ fontSize: 10.5, color: t.save, fontFamily: PRICELY_TYPE.mono }}>{c.offer}</span>}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <PPrice value={c.price} size="md" t={t}/>
              {c.save > 0 && <div style={{ marginTop: 4 }}><PSaveBadge amount={c.save} percent={c.sp} t={t}/></div>}
            </div>
          </div>
        ))}
      </div>
      {/* surge note */}
      <div style={{ padding: '10px 20px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: 3, background: t.warn }}/>
        <span style={{ fontSize: 11.5, color: t.textDim, letterSpacing: -0.1 }}>1.4× surge across all apps. Wait 12 min for ~18% drop.</span>
      </div>
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{ padding: '14px 18px', borderRadius: PRICELY_RADIUS.lg, background: PRICELY_FX.rampAccent, color: '#fff', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 24px -8px rgba(43,179,154,0.6)' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, opacity: 0.85, letterSpacing: 0.6, textTransform: 'uppercase' }}>Open Drift</div>
            <div style={{ fontFamily: PRICELY_TYPE.display, fontSize: 18, fontWeight: 700, letterSpacing: -0.4 }}>Book ₹312 · Saves ₹88</div>
          </div>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 10h10M11 5l5 5-5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </div>
      <div style={{ height: 80 }}/>
      <MFloatingTab t={t} mode={mode} active={0}/>
    </MScreenBg>
  );
}

// ─── 5. WATCHLIST + ALERT ──────────────────────────────────────
function MWatchlist({ mode = 'dark' }) {
  const t = PRICELY_TOKENS[mode];
  const items = [
    { name: 'iPhone 15 · 128GB',     plat: 'kart',  now: '62,499', target: '59,999', spark: [80,82,79,76,72,70,68,66,64,62], hit: 0.6 },
    { name: 'Nike Pegasus 41',        plat: 'vogue', now: '9,795',  target: '8,500',  spark: [110,108,106,104,103,99,97,98,98,97], hit: 0.35 },
    { name: 'Maggi 12-pack',          plat: 'aisle', now: '148',    target: '135',    spark: [170,165,160,158,154,152,150,148,148,148], hit: 0.85 },
    { name: 'Samsonite Carry-on 55cm',plat: 'kart',  now: '6,499',  target: '5,800',  spark: [85,86,84,80,78,75,72,70,68,65], hit: 0.5 },
  ];
  return (
    <MScreenBg t={t} mode={mode} padTop={54}>
      <div style={{ padding: '4px 20px 14px' }}>
        <div style={{ fontFamily: PRICELY_TYPE.display, fontSize: 28, fontWeight: 600, letterSpacing: -0.8, color: t.text }}>Watching</div>
        <div style={{ fontSize: 13, color: t.textDim, marginTop: 4 }}>4 items · You'd save ₹14,900 if all hit target</div>
      </div>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', flex: 1 }}>
        {items.map((it, i) => (
          <div key={i} style={{
            padding: 14, borderRadius: PRICELY_RADIUS.lg,
            background: t.glass, border: `1px solid ${t.glassBorder}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <PPlatformLogo id={it.plat} size={28}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: t.text, letterSpacing: -0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.name}</div>
                <div style={{ fontFamily: PRICELY_TYPE.mono, fontSize: 10.5, color: t.textFaint, marginTop: 2 }}>Cheapest on {PRICELY_PLATFORMS[it.plat].name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <PPrice value={it.now} size="sm" t={t}/>
              </div>
            </div>
            {/* progress to target */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <PSparkChart t={t} data={it.spark} width={120} height={32}/>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: PRICELY_TYPE.mono, fontSize: 10.5, color: t.textFaint }}>Target ₹{it.target}</span>
                  <span style={{ fontFamily: PRICELY_TYPE.mono, fontSize: 10.5, color: t.save }}>{Math.round(it.hit*100)}%</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: t.line, overflow: 'hidden' }}>
                  <div style={{ width: `${it.hit*100}%`, height: '100%', background: PRICELY_FX.rampAccent, borderRadius: 2 }}/>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ height: 80 }}/>
      <MFloatingTab t={t} mode={mode} active={1}/>
    </MScreenBg>
  );
}

Object.assign(window, { MHome, MResults, MDetail, MCab, MWatchlist, MFloatingTab });
