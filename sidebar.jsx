// sidebar.jsx — Collapsible app sidebar + Inventory screen

const NAV_ICONS = {
  inventory: (c) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 6.5L10 3l7 3.5v7L10 17l-7-3.5v-7z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M3 6.5L10 10l7-3.5M10 10v7" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M6.5 4.8L13.5 8.3" stroke={c} strokeWidth="1.4"/>
    </svg>
  ),
  menu: (c) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 4.5h12M4 8.5h12M4 12.5h8" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="15.5" cy="14.5" r="2.5" stroke={c} strokeWidth="1.4" fill="none"/>
      <path d="M15.5 13.2v2.6M14.2 14.5h2.6" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  chevronLeft: (c) => (
    <svg width="14" height="14" viewBox="0 0 14 14">
      <path d="M9 3l-4 4 4 4" stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  dashboard: (c) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="6" height="8" rx="1.5" stroke={c} strokeWidth="1.4"/>
      <rect x="11" y="3" width="6" height="4" rx="1.5" stroke={c} strokeWidth="1.4"/>
      <rect x="11" y="9" width="6" height="8" rx="1.5" stroke={c} strokeWidth="1.4"/>
      <rect x="3" y="13" width="6" height="4" rx="1.5" stroke={c} strokeWidth="1.4"/>
    </svg>
  ),
  boxes: (c) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="6" width="14" height="11" rx="1.5" stroke={c} strokeWidth="1.4"/>
      <path d="M3 10h14M10 6v11" stroke={c} strokeWidth="1.4"/>
      <path d="M7 3.5h6l1 2.5H6z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/>
    </svg>
  ),
  settings: (c) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="2.5" stroke={c} strokeWidth="1.4"/>
      <path d="M10 2v2M10 16v2M18 10h-2M4 10H2M15.7 4.3l-1.4 1.4M5.7 14.3l-1.4 1.4M15.7 15.7l-1.4-1.4M5.7 5.7L4.3 4.3" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
};

function Sidebar({ theme, collapsed, onToggle, active, onNavigate, warehouse }) {
  const items = [
    { id: 'dashboard', label: 'Dashboard',    icon: NAV_ICONS.dashboard },
    { id: 'inventory', label: 'Inventory',    icon: NAV_ICONS.inventory },
    { id: 'boxes',     label: 'Love Boxes',    icon: NAV_ICONS.boxes },
  ];

  const width = collapsed ? 76 : 248;
  return (
    <aside style={{
      width, flexShrink: 0,
      background: theme.paper,
      borderRight: `1px solid ${theme.line}`,
      display: 'flex', flexDirection: 'column',
      transition: 'width 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      position: 'sticky', top: 0, alignSelf: 'flex-start',
      height: '100vh',
    }}>
      <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{
        padding: collapsed ? '20px 0' : '18px 16px 18px 20px',
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        borderBottom: `1px solid ${theme.line}`,
        minHeight: 76, gap: 10,
      }}>
        {collapsed
          ? <LovepacsMarkIcon size={52} />
          : <>
              <LovepacsLogo height={38} />
              <button onClick={onToggle} title="Collapse menu"
                onMouseEnter={e => { e.currentTarget.style.background = theme.bg; e.currentTarget.style.color = theme.ink; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme.muted; }}
                style={{
                  width: 30, height: 30, borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'transparent', border: 'none',
                  cursor: 'pointer', color: theme.muted,
                  transition: 'background 140ms, color 140ms',
                  flexShrink: 0,
                }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6"/>
                  <line x1="9" y1="4" x2="9" y2="20" stroke="currentColor" strokeWidth="1.6"/>
                  <path d="M16 9l-2 3 2 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </>}
      </div>
      {collapsed && (
        <div style={{ padding: '8px 0', display: 'flex', justifyContent: 'center' }}>
          <button onClick={onToggle} title="Expand menu"
            onMouseEnter={e => { e.currentTarget.style.background = theme.bg; e.currentTarget.style.color = theme.ink; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme.muted; }}
            style={{
              width: 36, height: 36, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', border: 'none',
              cursor: 'pointer', color: theme.muted,
              transition: 'background 140ms, color 140ms',
            }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6"/>
              <line x1="9" y1="4" x2="9" y2="20" stroke="currentColor" strokeWidth="1.6"/>
              <path d="M13 9l2 3-2 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}

      <nav style={{ padding: collapsed ? '16px 12px' : '16px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map(item => (
          <NavItem key={item.id} theme={theme}
            collapsed={collapsed}
            active={active === item.id}
            icon={item.icon} label={item.label}
            onClick={() => onNavigate(item.id)}
          />
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      {!collapsed && (
        <div style={{ padding: '14px 16px' }}>
          <div style={{
            background: theme.bg, border: `1px solid ${theme.line}`,
            borderRadius: 12, padding: '10px 12px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 999, background: theme.soft,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: theme.mono, fontSize: 11, color: theme.ink, fontWeight: 600,
            }}>F</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 10, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: theme.mono }}>
                Warehouse
              </div>
              <div style={{ fontSize: 13, color: theme.ink, fontWeight: 600 }}>{warehouse}</div>
            </div>
            <svg width="12" height="12" viewBox="0 0 12 12">
              <path d="M3 5l3 3 3-3" stroke={theme.muted} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      )}

      <div style={{
        padding: collapsed ? '10px 12px' : '10px 14px',
        borderTop: `1px solid ${theme.line}`,
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        {/* User + sync status */}
        {collapsed ? (
          <div title="Kai Anderson · Synced just now" style={{
            display: 'flex', justifyContent: 'center', padding: '6px 0 2px',
          }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 32, height: 32, borderRadius: 999,
                background: theme.soft, color: theme.ink,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: theme.mono, fontSize: 11, fontWeight: 600,
                border: `1px solid ${theme.line}`,
              }}>KA</div>
              <span style={{
                position: 'absolute', bottom: -1, right: -1,
                width: 10, height: 10, borderRadius: 999,
                background: theme.accent, border: `2px solid ${theme.paper}`,
              }} />
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '6px 8px 10px',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 999,
              background: theme.soft, color: theme.ink,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: theme.mono, fontSize: 11, fontWeight: 600,
              flexShrink: 0,
            }}>KA</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, color: theme.ink, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Kai Anderson
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 10, color: theme.muted, fontFamily: theme.mono,
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                <span style={{ width: 5, height: 5, borderRadius: 999, background: theme.accent }} />
                Synced · just now
              </div>
            </div>
          </div>
        )}

        <NavItem theme={theme} collapsed={collapsed}
          icon={NAV_ICONS.settings} label="Settings" onClick={() => {}} />
      </div>
      </div>
    </aside>
  );
}

function NavItem({ theme, collapsed, active, disabled, icon, label, onClick }) {
  const bg = active ? theme.ink : 'transparent';
  const fg = active ? theme.paper : (disabled ? theme.muted : theme.ink);
  return (
    <button onClick={onClick} disabled={disabled} title={collapsed ? label : undefined}
      onMouseEnter={e => { if (!active && !disabled) e.currentTarget.style.background = theme.bg; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: collapsed ? 0 : '0 12px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        height: 44, borderRadius: 10,
        background: bg, color: fg,
        border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        fontFamily: theme.body, fontSize: 14, fontWeight: active ? 600 : 500,
        textAlign: 'left', transition: 'background 140ms, color 140ms',
    }}>
      <div style={{ flexShrink: 0, display: 'flex' }}>{icon(fg)}</div>
      {!collapsed && <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>}
    </button>
  );
}

// A tiny standalone mark for the collapsed sidebar — uses the first glyph from
// the logo: a house outline with a heart inside, drawn programmatically so it
// renders crisply at small sizes.
function LovepacsMarkIcon({ size = 36 }) {
  return (
    <img src="assets/lovepacs-icon.png" alt="Lovepacs"
      style={{ width: size, height: size, display: 'block', objectFit: 'contain' }} />
  );
}

// ──────────────────────────────────────────────────────────
// Inventory screen (stub but polished)
// ──────────────────────────────────────────────────────────
function InventoryScreen({ theme, warehouse }) {
  const [q, setQ] = useState('');
  // Sample stock data — built on top of FOOD_CATALOG
  const stock = useMemo(() => {
    const data = {
      spaghetti:    { qty: 184, par: 200, receivedDays: 3, lot: 'LT-2026-88' },
      marinara:     { qty: 212, par: 160, receivedDays: 1, lot: 'LT-2026-89' },
      tuna:         { qty: 96, par: 240, receivedDays: 5, lot: 'LT-2026-85', low: true },
      blackbeans:   { qty: 340, par: 200, receivedDays: 7, lot: 'LT-2026-82' },
      ricewhite:    { qty: 142, par: 180, receivedDays: 4, lot: 'LT-2026-86' },
      cornkernels:  { qty: 228, par: 160, receivedDays: 2, lot: 'LT-2026-90' },
      chickenbroth: { qty: 76,  par: 160, receivedDays: 8, lot: 'LT-2026-81', low: true },
      tomatoes:     { qty: 198, par: 180, receivedDays: 3, lot: 'LT-2026-88' },
      peanutbutter: { qty: 54,  par: 80,  receivedDays: 6, lot: 'LT-2026-84' },
      oats:         { qty: 120, par: 100, receivedDays: 2, lot: 'LT-2026-90' },
      peaches:      { qty: 88,  par: 80,  receivedDays: 4, lot: 'LT-2026-86' },
      cornmeal:     { qty: 64,  par: 80,  receivedDays: 9, lot: 'LT-2026-80', low: true },
    };
    return FOOD_CATALOG.map(f => ({ ...f, ...data[f.id] }));
  }, []);

  const filtered = stock.filter(s =>
    !q || s.name.toLowerCase().includes(q.toLowerCase()) || s.category.toLowerCase().includes(q.toLowerCase())
  );

  const totalSKUs = stock.length;
  const totalUnits = stock.reduce((a, s) => a + s.qty, 0);
  const belowPar = stock.filter(s => s.qty < s.par * 0.6).length;
  const incomingToday = 3;

  return (
    <div style={{ padding: '28px 36px 48px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: theme.mono }}>
            {warehouse} warehouse
          </div>
          <div style={{
            fontFamily: theme.display, fontWeight: theme.displayWeight,
            fontSize: 32, letterSpacing: theme.displayTracking, lineHeight: 1.05,
            marginTop: 6,
          }}>Inventory</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button theme={theme} kind="secondary" size="md" icon={Icon.barcode(theme.ink)}>Receive shipment</Button>
          <Button theme={theme} kind="primary" size="md" icon={Icon.plus(theme.accentInk)}>Add item</Button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <Kpi theme={theme} label="Total SKUs" value={totalSKUs} />
        <Kpi theme={theme} label="Units on hand" value={totalUnits.toLocaleString()} />
        <Kpi theme={theme} label="Below par" value={belowPar} tone="warn" />
        <Kpi theme={theme} label="Incoming today" value={incomingToday} tone="accent" />
      </div>

      {/* Toolbar */}
      <div style={{
        display: 'flex', gap: 12, alignItems: 'center',
        padding: 10, background: theme.paper, borderRadius: 14,
        border: `1px solid ${theme.line}`, marginBottom: 14,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '0 12px', height: 38, flex: 1,
          border: `1px solid ${theme.line}`, borderRadius: 10,
          background: theme.bg,
        }}>
          {Icon.search(theme.muted)}
          <input value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search SKU, category, or lot…"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontFamily: theme.body, fontSize: 14, color: theme.ink,
            }} />
        </div>
        <InvFilterChip theme={theme} label="All categories" />
        <InvFilterChip theme={theme} label="All statuses" />
        <InvFilterChip theme={theme} label="Sort: Most recent" />
      </div>

      {/* Table */}
      <div style={{
        background: theme.paper, borderRadius: 14,
        border: `1px solid ${theme.line}`, overflow: 'hidden',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2.4fr 1fr 1.4fr 1fr 1fr 0.6fr',
          padding: '12px 18px', gap: 14,
          fontFamily: theme.mono, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em',
          color: theme.muted, borderBottom: `1px solid ${theme.line}`, background: theme.bg,
        }}>
          <div>Item</div>
          <div>Category</div>
          <div>On hand · par</div>
          <div>Last received</div>
          <div>Lot</div>
          <div></div>
        </div>
        {filtered.map((s, i) => <InvRow key={s.id} theme={theme} s={s} last={i === filtered.length - 1} />)}
      </div>
    </div>
  );
}

function Kpi({ theme, label, value, tone }) {
  const tones = {
    warn: { color: '#8B3A12', chip: '#FCE6D4' },
    accent: { color: theme.accent, chip: theme.soft },
    default: { color: theme.ink, chip: theme.soft },
  };
  const t = tones[tone] || tones.default;
  return (
    <div style={{
      padding: 18, background: theme.paper, border: `1px solid ${theme.line}`,
      borderRadius: 14,
    }}>
      <div style={{ fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: theme.mono }}>
        {label}
      </div>
      <div style={{
        fontFamily: theme.display, fontWeight: theme.displayWeight,
        fontSize: 32, letterSpacing: theme.displayTracking, lineHeight: 1,
        marginTop: 10, color: t.color,
      }}>{value}</div>
    </div>
  );
}

function InvFilterChip({ theme, label }) {
  return (
    <button style={{
      height: 38, padding: '0 14px', borderRadius: 10,
      background: 'transparent', border: `1px solid ${theme.line}`,
      fontFamily: theme.body, fontSize: 13, color: theme.ink, cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: 8,
    }}>
      {label}
      <svg width="10" height="10" viewBox="0 0 10 10">
        <path d="M2 4l3 3 3-3" stroke={theme.muted} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

function InvRow({ theme, s, last }) {
  const pct = Math.min(1, s.qty / s.par);
  const status = pct < 0.3 ? 'critical' : pct < 0.6 ? 'low' : pct > 1.2 ? 'over' : 'ok';
  const barColor = status === 'critical' ? '#C24A2C' : status === 'low' ? '#C98A1E' : theme.accent;
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '2.4fr 1fr 1.4fr 1fr 1fr 0.6fr',
      alignItems: 'center',
      padding: '14px 18px', gap: 14,
      borderBottom: last ? 'none' : `1px solid ${theme.line}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <FoodThumb theme={theme} id={s.id} size={36} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: theme.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
          <div style={{ fontSize: 12, color: theme.muted }}>{s.measure}</div>
        </div>
      </div>
      <div style={{ fontSize: 13, color: theme.muted }}>{s.category}</div>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontFamily: theme.mono, fontSize: 14, color: theme.ink, fontWeight: 600 }}>{s.qty}</span>
          <span style={{ fontSize: 12, color: theme.muted }}>/ {s.par}</span>
          {status === 'critical' && <Chip theme={theme} tone="missing" style={{ marginLeft: 4, padding: '2px 8px', fontSize: 10 }}>Critical</Chip>}
          {status === 'low' && <span style={{ fontSize: 10, color: '#C98A1E', fontFamily: theme.mono, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: 4 }}>Low</span>}
        </div>
        <div style={{ height: 4, background: theme.bg, borderRadius: 999, marginTop: 6, overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(100, pct * 100)}%`, height: '100%', background: barColor, transition: 'width 200ms' }} />
        </div>
      </div>
      <div style={{ fontSize: 13, color: theme.ink }}>{s.receivedDays} day{s.receivedDays === 1 ? '' : 's'} ago</div>
      <div style={{ fontFamily: theme.mono, fontSize: 12, color: theme.muted }}>{s.lot}</div>
      <div style={{ textAlign: 'right' }}>
        <button style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'transparent', border: `1px solid ${theme.line}`,
          cursor: 'pointer', color: theme.muted,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="14" height="3" viewBox="0 0 14 3">
            <circle cx="2" cy="1.5" r="1.3" fill="currentColor"/>
            <circle cx="7" cy="1.5" r="1.3" fill="currentColor"/>
            <circle cx="12" cy="1.5" r="1.3" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { Sidebar, InventoryScreen });
