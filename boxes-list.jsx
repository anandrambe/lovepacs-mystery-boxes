// boxes-list.jsx — Mystery Boxes listing page + shared status utilities

// ── Status lifecycle (Draft → Finalized → Printed → Dispatched) ────────────
const STATUS_ORDER = ['Draft', 'Finalized', 'Printed', 'Dispatched'];

function statusTone(s, theme) {
  switch (s) {
    case 'Draft':      return { bg: 'transparent', color: theme.muted, dot: theme.muted, border: `1px dashed ${theme.line}` };
    case 'Finalized':  return { bg: 'rgba(200, 154, 60, 0.14)', color: '#8A6A1F', dot: '#C89A3C', border: 'none' };
    case 'Printed':    return { bg: theme.soft, color: theme.accent, dot: theme.accent, border: 'none' };
    case 'Dispatched': return { bg: theme.ink, color: theme.paper, dot: theme.paper, border: 'none' };
    default:           return { bg: theme.bg, color: theme.muted, dot: theme.muted, border: 'none' };
  }
}

function StatusPill({ status, theme, size = 'md' }) {
  const t = statusTone(status, theme);
  const h = size === 'sm' ? 22 : 26;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      height: h, padding: '0 10px', borderRadius: 999,
      background: t.bg, color: t.color, border: t.border,
      fontFamily: theme.mono, fontSize: size === 'sm' ? 10 : 11,
      textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: 999, background: t.dot,
        flexShrink: 0,
      }} />
      {status}
    </span>
  );
}

function StatusStepper({ status, theme, compact }) {
  const idx = STATUS_ORDER.indexOf(status);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      {STATUS_ORDER.map((s, i) => {
        const done = i < idx, current = i === idx;
        const dotColor = done || current ? theme.accent : theme.line;
        const ringColor = current ? theme.accent : 'transparent';
        return (
          <React.Fragment key={s}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: compact ? 10 : 14, height: compact ? 10 : 14, borderRadius: 999,
                background: done || current ? dotColor : theme.paper,
                border: current
                  ? `2px solid ${ringColor}`
                  : `1.5px solid ${done ? theme.accent : theme.line}`,
                boxShadow: current ? `0 0 0 3px ${theme.soft}` : 'none',
                transition: 'all 200ms',
              }} />
              {!compact && (
                <div style={{
                  fontFamily: theme.mono, fontSize: 10,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: done || current ? theme.ink : theme.muted,
                  fontWeight: current ? 600 : 500, whiteSpace: 'nowrap',
                }}>{s}</div>
              )}
            </div>
            {i < STATUS_ORDER.length - 1 && (
              <div style={{
                width: compact ? 22 : 56, height: 1.5, margin: compact ? '0 2px' : '0 4px',
                marginBottom: compact ? 0 : 20,
                background: done ? theme.accent : theme.line,
                transition: 'background 200ms',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Listing page ───────────────────────────────────────────────────────────
function MysteryBoxesScreen({ theme, warehouse, onStartMenu, openWizard, onWizardOpened }) {
  const [boxes, setBoxes] = useState(MYSTERY_BOXES);
  const [region, setRegion] = useState('All warehouses');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('list'); // list | wizard
  const [selectedId, setSelectedId] = useState(null);
  const [printBox, setPrintBox] = useState(null);

  useEffect(() => {
    if (openWizard) {
      setMode('wizard');
      if (onWizardOpened) onWizardOpened();
    }
  }, [openWizard]);

  const selected = boxes.find(b => b.id === selectedId) || null;

  const regions = useMemo(() => ['All warehouses', ...Array.from(new Set(boxes.map(b => b.region))).sort()], [boxes]);

  const filtered = useMemo(() => {
    return boxes.filter(b => {
      if (region !== 'All warehouses' && b.region !== region) return false;
      if (statusFilter !== 'All statuses' && b.status !== statusFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!b.id.toLowerCase().includes(q) && !b.address.toLowerCase().includes(q) && !b.event.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [boxes, region, statusFilter, query]);

  const counts = useMemo(() => {
    const c = { Draft: 0, Finalized: 0, Printed: 0, Dispatched: 0 };
    boxes.forEach(b => { c[b.status] = (c[b.status] || 0) + 1; });
    return c;
  }, [boxes]);

  const advanceStatus = (id, to) => {
    setBoxes(bs => bs.map(b => b.id === id ? { ...b, status: to } : b));
  };

  const saveBox = (newBox) => {
    setBoxes(bs => {
      const exists = bs.find(b => b.id === newBox.id);
      if (exists) return bs.map(b => b.id === newBox.id ? newBox : b);
      return [newBox, ...bs];
    });
  };

  if (mode === 'wizard') {
    return <BoxWizard theme={theme} onCancel={() => setMode('list')} onSave={(b) => { saveBox(b); setMode('list'); setSelectedId(b.id); }} />;
  }
  if (printBox) {
    return <LabelScreen theme={theme} box={printBox} onDone={() => setPrintBox(null)} fromList />;
  }

  return (
    <div style={{ padding: '28px 36px 48px', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: theme.mono }}>
            {warehouse} warehouse · {boxes.length} boxes
          </div>
          <div style={{
            fontFamily: theme.display, fontWeight: theme.displayWeight,
            fontSize: 34, letterSpacing: theme.displayTracking, lineHeight: 1.05,
            marginTop: 6,
          }}>Love Boxes</div>
          <div style={{ fontSize: 14, color: theme.muted, marginTop: 6, maxWidth: 600 }}>
            Every box dispatched gets a QR that unlocks a private recipe page tailored to what's inside.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button theme={theme} kind="secondary" size="md">Export CSV</Button>
          <Button theme={theme} kind="primary" size="md" icon={Icon.plus(theme.accentInk)}
            onClick={() => setMode('wizard')}>New Love Box</Button>
        </div>
      </div>

      {/* Status pipeline — quick overview of lifecycle distribution */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 18,
      }}>
        {STATUS_ORDER.map(s => {
          const t = statusTone(s, theme);
          const isActive = statusFilter === s;
          return (
            <button key={s}
              onClick={() => setStatusFilter(isActive ? 'All statuses' : s)}
              style={{
                textAlign: 'left', padding: '16px 18px', borderRadius: 14,
                background: theme.paper, border: `1px solid ${isActive ? theme.ink : theme.line}`,
                cursor: 'pointer', transition: 'border-color 140ms ease',
                position: 'relative', overflow: 'hidden',
              }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: t.dot,
              }} />
              <div style={{
                fontSize: 11, fontFamily: theme.mono, textTransform: 'uppercase', letterSpacing: '0.1em',
                color: theme.muted, marginBottom: 6,
              }}>{s}</div>
              <div style={{
                fontFamily: theme.display, fontWeight: theme.displayWeight,
                fontSize: 28, letterSpacing: theme.displayTracking, lineHeight: 1,
                color: theme.ink,
              }}>{counts[s] || 0}</div>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div style={{
        display: 'flex', gap: 10, alignItems: 'center',
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
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search by box ID, address or event…"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontFamily: theme.body, fontSize: 14, color: theme.ink,
            }} />
        </div>
        <FilterSelect theme={theme} value={region} options={regions} onChange={setRegion} label="Warehouse" />
        <FilterSelect theme={theme} value={statusFilter} options={['All statuses', ...STATUS_ORDER]} onChange={setStatusFilter} label="Status" />
      </div>

      {/* Table */}
      <div style={{
        background: theme.paper, borderRadius: 14,
        border: `1px solid ${theme.line}`, overflow: 'hidden',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr 1.8fr 1fr 0.8fr 1.2fr 1.1fr 48px',
          padding: '14px 18px', gap: 14,
          fontFamily: theme.mono, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.1em',
          color: theme.muted, borderBottom: `1px solid ${theme.line}`, background: theme.bg,
        }}>
          <div>Box ID</div>
          <div>Warehouse</div>
          <div>Address dispatched</div>
          <div>Dispatch date</div>
          <div>Families</div>
          <div>Recipes</div>
          <div>Status</div>
          <div></div>
        </div>
        {filtered.length === 0 && (
          <div style={{ padding: 60, textAlign: 'center', color: theme.muted, fontSize: 14 }}>
            No boxes match these filters.
          </div>
        )}
        {filtered.map((b, i) => (
          <BoxRow key={b.id} theme={theme} box={b} last={i === filtered.length - 1}
            selected={b.id === selectedId}
            onOpen={() => setSelectedId(b.id)}
            onOpenPublic={() => window.open(getPublicUrl(b.id), '_blank')}
            onPrint={() => setPrintBox(b)} />
        ))}
      </div>

      {/* Detail panel */}
      {selected && (
        <BoxDetailPanel
          theme={theme}
          box={selected}
          onClose={() => setSelectedId(null)}
          onAdvance={(to) => advanceStatus(selected.id, to)}
          onOpenPublic={() => window.open(getPublicUrl(selected.id), '_blank')}
          onPrint={() => setPrintBox(selected)}
        />
      )}
    </div>
  );
}

function FilterSelect({ theme, value, options, onChange, label }) {
  return (
    <div style={{
      height: 38, display: 'flex', alignItems: 'center',
      padding: '0 6px 0 14px', borderRadius: 10,
      border: `1px solid ${theme.line}`, background: theme.paper,
      position: 'relative',
    }}>
      <span style={{
        fontFamily: theme.mono, fontSize: 10, color: theme.muted,
        textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: 8,
      }}>{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        height: 34, padding: '0 26px 0 6px', border: 'none', outline: 'none',
        background: 'transparent', fontFamily: theme.body, fontSize: 13,
        color: theme.ink, fontWeight: 500, appearance: 'none', cursor: 'pointer',
      }}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <svg width="10" height="10" viewBox="0 0 10 10" style={{ position: 'absolute', right: 12, pointerEvents: 'none' }}>
        <path d="M2 4l3 3 3-3" stroke={theme.muted} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

function BoxRow({ theme, box, last, selected, onOpen, onOpenPublic, onPrint }) {
  return (
    <div
      onClick={onOpen}
      style={{
        display: 'grid',
        gridTemplateColumns: '1.1fr 0.9fr 1.8fr 1fr 0.8fr 1.2fr 1.1fr 48px',
        padding: '16px 18px', gap: 14, alignItems: 'center',
        borderBottom: last ? 'none' : `1px solid ${theme.line}`,
        cursor: 'pointer', background: selected ? theme.bg : 'transparent',
        transition: 'background 120ms ease',
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = theme.bg; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
    >
      <div style={{ fontFamily: theme.mono, fontSize: 13, color: theme.ink, fontWeight: 600 }}>{box.id}</div>
      <div style={{ fontSize: 13, color: theme.ink }}>{box.region}</div>
      <div style={{ fontSize: 13, color: theme.ink, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {box.address}
      </div>
      <div style={{ fontSize: 13, color: theme.muted }}>
        {new Date(box.dispatchDate + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </div>
      <div style={{ fontFamily: theme.mono, fontSize: 14, color: theme.ink, fontWeight: 600 }}>{box.families}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: theme.mono, fontSize: 13, color: theme.ink, fontWeight: 600 }}>{box.recipesCount}</span>
        <button onClick={e => { e.stopPropagation(); onOpen(); }} style={{
          fontSize: 11, fontFamily: theme.mono, color: theme.accent,
          background: 'transparent', border: 'none', cursor: 'pointer',
          textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600,
          padding: '4px 6px', borderRadius: 6,
        }}>View →</button>
      </div>
      <div><StatusPill status={box.status} theme={theme} /></div>
      <div style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
        <RowMenu theme={theme} box={box} onOpen={onOpen} onOpenPublic={onOpenPublic} onPrint={onPrint} />
      </div>
    </div>
  );
}

function MealBadge({ theme, size, count }) {
  if (count <= 0) return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 6,
      fontFamily: theme.mono, fontSize: 11, color: theme.muted,
      border: `1px dashed ${theme.line}`, opacity: 0.5,
    }}>—</span>
  );
  const fill = size === 4 ? theme.accent : '#C89A3C';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 9px 3px 6px', borderRadius: 6,
      background: theme.bg, border: `1px solid ${theme.line}`,
      fontFamily: theme.mono, fontSize: 11.5, color: theme.ink, fontWeight: 600,
    }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 18, height: 14, borderRadius: 3,
        background: fill, color: '#fff', fontSize: 9, fontWeight: 700,
      }}>{size}p</span>
      ×{count}
    </span>
  );
}

function RowMenu({ theme, box, onOpen, onOpenPublic, onPrint }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    setTimeout(() => window.addEventListener('click', close), 0);
    return () => window.removeEventListener('click', close);
  }, [open]);
  const items = [
    { label: 'View box details', action: onOpen },
    { label: 'View generated recipes', action: onOpen },
    { label: 'View QR link', action: onOpenPublic },
    { label: '🖨  Print Label', action: onPrint, highlight: true },
  ];
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={e => { e.stopPropagation(); setOpen(o => !o); }} style={{
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
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 40, zIndex: 30,
          background: theme.paper, border: `1px solid ${theme.line}`,
          borderRadius: 10, padding: 4, minWidth: 200,
          boxShadow: '0 12px 30px -12px rgba(0,0,0,0.18)',
        }}>
          {items.map((it, i) => (
            <React.Fragment key={i}>
              {it.highlight && <div style={{ height: 1, background: theme.line, margin: '4px 0' }} />}
              <button disabled={it.disabled}
                onClick={() => { if (!it.disabled) { it.action(); setOpen(false); } }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', textAlign: 'left',
                  padding: '8px 10px', borderRadius: 6, border: 'none',
                  background: 'transparent', cursor: it.disabled ? 'not-allowed' : 'pointer',
                  fontFamily: theme.body, fontSize: 13,
                  color: it.disabled ? theme.muted : it.highlight ? theme.accent : theme.ink,
                  fontWeight: it.highlight ? 600 : 400,
                  opacity: it.disabled ? 0.5 : 1,
                }}
                onMouseEnter={e => { if (!it.disabled) e.currentTarget.style.background = theme.bg; }}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                {it.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

Object.assign(window, {
  MysteryBoxesScreen, StatusPill, StatusStepper, STATUS_ORDER, statusTone, MealBadge,
});
