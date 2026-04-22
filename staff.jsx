// staff.jsx — Staff desktop app

function StaffApp({ theme, cardLayout }) {
  const [step, setStep] = useState('setup'); // setup | picker | labels
  const [box, setBox] = useState(() => ({
    date: SAMPLE_BOX.date,
    event: SAMPLE_BOX.event,
    warehouse: SAMPLE_BOX.warehouse,
    servings: SAMPLE_BOX.servings,
    items: SAMPLE_BOX.items.slice(),
  }));
  const [query, setQuery] = useState('');
  const [showScan, setShowScan] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [candidates, setCandidates] = useState(null);
  const [selected, setSelected] = useState([]); // recipe ids (max 3)

  const boxKey = useMemo(() => {
    const d = box.date.replaceAll('-', '');
    const ev = (box.event || '').trim().toLowerCase().replace(/\s+/g, '-').slice(0, 18) || 'std';
    return `${box.warehouse.toLowerCase()}.${d}.${ev}`;
  }, [box]);

  const addItem = (id) => {
    setBox(b => {
      const exists = b.items.find(i => i.id === id);
      if (exists) return { ...b, items: b.items.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i) };
      return { ...b, items: [...b.items, { id, qty: 1 }] };
    });
  };
  const setQty = (id, qty) => setBox(b => ({ ...b, items: b.items.map(i => i.id === id ? { ...i, qty: Math.max(0, qty) } : i).filter(i => i.qty > 0) }));
  const removeItem = (id) => setBox(b => ({ ...b, items: b.items.filter(i => i.id !== id) }));

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return FOOD_CATALOG
      .filter(f => !box.items.find(i => i.id === f.id))
      .filter(f => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q))
      .slice(0, 6);
  }, [query, box.items]);

  const generate = () => {
    setGenerating(true);
    setStep('picker');
    setCandidates(null);
    setSelected([]);
    setTimeout(() => {
      setCandidates(RECIPES.slice(0, 4));
      setGenerating(false);
    }, 1400);
  };

  const toggleRecipe = (id) => {
    setSelected(s => {
      if (s.includes(id)) return s.filter(x => x !== id);
      if (s.length >= 3) return s;
      return [...s, id];
    });
  };

  const reset = () => {
    setStep('setup'); setCandidates(null); setSelected([]);
  };

  return (
    <div style={{
      background: theme.paper, border: `1px solid ${theme.line}`,
      borderRadius: 16, overflow: 'hidden',
      fontFamily: theme.body, color: theme.ink,
    }}>
      {/* Stepper bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        padding: '16px 24px', borderBottom: `1px solid ${theme.line}`,
        background: theme.bg,
      }}>
        <Stepper theme={theme} step={step} />
      </div>

      {/* Body */}
      <div style={{ minHeight: 620 }}>
        {step === 'setup' && (
          <SetupStep
            theme={theme} box={box} setBox={setBox} boxKey={boxKey}
            query={query} setQuery={setQuery} searchResults={searchResults}
            addItem={addItem} setQty={setQty} removeItem={removeItem}
            showScan={showScan} setShowScan={setShowScan}
            onGenerate={generate}
          />
        )}
        {step === 'picker' && (
          <PickerStep
            theme={theme} cardLayout={cardLayout}
            generating={generating} candidates={candidates}
            selected={selected} toggleRecipe={toggleRecipe}
            onBack={() => setStep('setup')}
            onConfirm={() => setStep('labels')}
          />
        )}
        {step === 'labels' && (
          <LabelsStep
            theme={theme} box={box} boxKey={boxKey}
            selected={selected.map(id => candidates.find(c => c.id === id)).filter(Boolean)}
            onReset={reset}
          />
        )}
      </div>
    </div>
  );
}

function Stepper({ theme, step }) {
  const steps = [
    { id: 'setup', label: '1  Box contents' },
    { id: 'picker', label: '2  Recipe picker' },
    { id: 'labels', label: '3  QR labels' },
  ];
  const idx = steps.findIndex(s => s.id === step);
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 12, fontFamily: theme.mono, letterSpacing: '0.02em' }}>
      {steps.map((s, i) => (
        <div key={s.id} style={{
          padding: '6px 10px', borderRadius: 8,
          background: i === idx ? theme.ink : 'transparent',
          color: i === idx ? theme.paper : (i < idx ? theme.ink : theme.muted),
          border: i < idx ? `1px solid ${theme.line}` : 'none',
          textTransform: 'uppercase',
        }}>
          {s.label}
        </div>
      ))}
    </div>
  );
}

// ─── Step 1: Setup ──────────────────────────────────────────
function SetupStep({ theme, box, setBox, boxKey, query, setQuery, searchResults, addItem, setQty, removeItem, showScan, setShowScan, onGenerate }) {
  const canGenerate = box.items.length >= 2 && box.date && box.servings >= 1;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', minHeight: 620 }}>
      {/* Left: box meta */}
      <div style={{ padding: 28, borderRight: `1px solid ${theme.line}`, background: theme.bg }}>
        <SectionLabel theme={theme}>Box identity</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
          <Field theme={theme} label="Date">
            <input type="date" value={box.date}
              onChange={e => setBox(b => ({ ...b, date: e.target.value }))}
              style={inputStyle(theme)} />
          </Field>
          <Field theme={theme} label="Event (optional)">
            <input type="text" value={box.event} placeholder="Christmas Distribution 2026"
              onChange={e => setBox(b => ({ ...b, event: e.target.value }))}
              style={inputStyle(theme)} />
          </Field>
          <Field theme={theme} label="Warehouse">
            <select value={box.warehouse}
              onChange={e => setBox(b => ({ ...b, warehouse: e.target.value }))}
              style={inputStyle(theme)}>
              {['Frisco','Little Elm','Plano','McKinney'].map(w => <option key={w}>{w}</option>)}
            </select>
          </Field>
          <Field theme={theme} label="Approx. servings per box">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => setBox(b => ({ ...b, servings: Math.max(1, b.servings - 1) }))}
                style={stepBtn(theme)}>{Icon.minus(theme.ink)}</button>
              <div style={{
                flex: 1, height: 40, borderRadius: 10, border: `1px solid ${theme.line}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: theme.display, fontSize: 20, fontWeight: theme.displayWeight,
                background: theme.paper,
              }}>{box.servings}</div>
              <button onClick={() => setBox(b => ({ ...b, servings: b.servings + 1 }))}
                style={stepBtn(theme)}>{Icon.plus(theme.ink)}</button>
            </div>
          </Field>
        </div>

        <div style={{
          marginTop: 22, padding: 14, borderRadius: 12,
          background: theme.paper, border: `1px solid ${theme.line}`,
        }}>
          <div style={{ fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Box key</div>
          <div style={{ fontFamily: theme.mono, fontSize: 13, color: theme.ink, marginTop: 6, wordBreak: 'break-all' }}>
            {boxKey}
          </div>
          <div style={{ fontSize: 11, color: theme.muted, marginTop: 8, lineHeight: 1.5 }}>
            Auto-derived from warehouse · date · event. Used to tie the box to its recipes and QR label.
          </div>
        </div>
      </div>

      {/* Right: items */}
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div style={{
              fontFamily: theme.display, fontWeight: theme.displayWeight,
              fontSize: 28, letterSpacing: theme.displayTracking, lineHeight: 1.05,
            }}>What's going in the box?</div>
            <div style={{ fontSize: 13, color: theme.muted, marginTop: 4 }}>
              {box.items.length} item{box.items.length === 1 ? '' : 's'} · for ~{box.servings} people
            </div>
          </div>
          <Button theme={theme} kind="secondary" size="sm" icon={Icon.barcode(theme.ink)}
            onClick={() => setShowScan(true)}>Scan barcode</Button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '0 14px', height: 46,
            border: `1px solid ${theme.line}`, borderRadius: 12,
            background: theme.paper,
          }}>
            {Icon.search(theme.muted)}
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search catalog — e.g. tuna, rice, beans…"
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontFamily: theme.body, fontSize: 14, color: theme.ink,
              }}/>
            <span style={{ fontSize: 11, color: theme.muted, fontFamily: theme.mono }}>↵ add</span>
          </div>
          {searchResults.length > 0 && (
            <div style={{
              position: 'absolute', top: 50, left: 0, right: 0, zIndex: 3,
              background: theme.paper, border: `1px solid ${theme.line}`,
              borderRadius: 12, overflow: 'hidden',
              boxShadow: '0 12px 30px -12px rgba(0,0,0,0.15)',
            }}>
              {searchResults.map(f => (
                <div key={f.id} onClick={() => { addItem(f.id); setQuery(''); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', cursor: 'pointer',
                    borderBottom: `1px solid ${theme.line}`,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = theme.bg}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <FoodThumb theme={theme} id={f.id} size={32} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{f.name}</div>
                    <div style={{ fontSize: 12, color: theme.muted }}>{f.measure} · {f.category}</div>
                  </div>
                  {Icon.plus(theme.muted)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Items list */}
        <div style={{ marginTop: 18, flex: 1, overflow: 'auto' }}>
          {box.items.length === 0 ? (
            <EmptyState theme={theme} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {box.items.map(i => {
                const f = FOOD_CATALOG.find(x => x.id === i.id);
                if (!f) return null;
                return (
                  <div key={i.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: 12, borderRadius: 12,
                    border: `1px solid ${theme.line}`, background: theme.paper,
                  }}>
                    <FoodThumb theme={theme} id={i.id} size={40} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</div>
                      <div style={{ fontSize: 12, color: theme.muted }}>{f.measure}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button onClick={() => setQty(i.id, i.qty - 1)} style={stepBtnSm(theme)}>{Icon.minus(theme.muted)}</button>
                      <div style={{
                        width: 28, textAlign: 'center', fontFamily: theme.mono, fontSize: 14,
                      }}>{i.qty}</div>
                      <button onClick={() => setQty(i.id, i.qty + 1)} style={stepBtnSm(theme)}>{Icon.plus(theme.muted)}</button>
                    </div>
                    <button onClick={() => removeItem(i.id)} style={{
                      ...stepBtnSm(theme), border: 'none', background: 'transparent',
                    }}>{Icon.close(theme.muted)}</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CTA */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 20, paddingTop: 18, borderTop: `1px solid ${theme.line}`,
        }}>
          <div style={{ fontSize: 12, color: theme.muted, lineHeight: 1.5, maxWidth: 420 }}>
            The Generator proposes up to 4 recipes. You'll pick up to 3 to associate with every box keyed to
            <span style={{ fontFamily: theme.mono, color: theme.ink }}> {boxKey}</span>.
          </div>
          <Button theme={theme} kind="primary" size="lg"
            icon={Icon.sparkle(theme.accentInk)}
            onClick={onGenerate} disabled={!canGenerate}>
            Generate recipes
          </Button>
        </div>
      </div>

      {showScan && <ScanModal theme={theme} onClose={() => setShowScan(false)} onScan={(id) => { addItem(id); setShowScan(false); }} />}
    </div>
  );
}

function EmptyState({ theme }) {
  return (
    <div style={{
      border: `1px dashed ${theme.line}`, borderRadius: 14,
      padding: 32, textAlign: 'center', color: theme.muted, fontSize: 13,
    }}>
      No items yet. Search the catalog above or scan a barcode.
    </div>
  );
}

function Field({ theme, label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
      {children}
    </label>
  );
}
function SectionLabel({ theme, children }) {
  return <div style={{ fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: theme.mono }}>{children}</div>;
}
function inputStyle(theme) {
  return {
    height: 40, padding: '0 12px',
    border: `1px solid ${theme.line}`, borderRadius: 10,
    background: theme.paper, color: theme.ink,
    fontFamily: theme.body, fontSize: 14, outline: 'none', width: '100%',
  };
}
function stepBtn(theme) {
  return {
    width: 40, height: 40, borderRadius: 10,
    border: `1px solid ${theme.line}`, background: theme.paper,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
  };
}
function stepBtnSm(theme) {
  return {
    width: 26, height: 26, borderRadius: 6,
    border: `1px solid ${theme.line}`, background: theme.paper,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
  };
}

// Tiny colored food thumbs — CSS-only placeholders, no SVG drawings
// Illustrated food emblem — stylized product silhouette (can / jar / bottle / bag)
// rendered as a small SVG on a color-washed tile. No emoji, no external images.
const FOOD_COLORS = {
  spaghetti:    { bg: '#F2D9A4', ink: '#6E4A1A', accent: '#C9772E' },
  marinara:     { bg: '#F5CFC0', ink: '#7A2618', accent: '#B3331C' },
  tuna:         { bg: '#C9D7E3', ink: '#2C4762', accent: '#416A88' },
  blackbeans:   { bg: '#D7CEBF', ink: '#2E231A', accent: '#4B3A2B' },
  ricewhite:    { bg: '#F0EADA', ink: '#7A6A3E', accent: '#A68743' },
  cornkernels:  { bg: '#F8E5A1', ink: '#7A5811', accent: '#E0A81F' },
  chickenbroth: { bg: '#F5E3BF', ink: '#6B4A18', accent: '#B88724' },
  tomatoes:     { bg: '#F1C1B0', ink: '#7B2418', accent: '#C23D28' },
  peanutbutter: { bg: '#E9C48D', ink: '#5B3712', accent: '#9A5E1F' },
  oats:         { bg: '#E8D7B1', ink: '#6A4E1F', accent: '#A87A2C' },
  peaches:      { bg: '#F8D2A3', ink: '#8A4714', accent: '#E68A32' },
  cornmeal:     { bg: '#F3DE9A', ink: '#7A5A1D', accent: '#D19B2D' },
};

function foodContainer(id) {
  // Which silhouette to draw for this item
  if (['tuna', 'blackbeans', 'cornkernels', 'chickenbroth', 'tomatoes', 'peaches'].includes(id)) return 'can';
  if (['marinara', 'peanutbutter'].includes(id)) return 'jar';
  if (['ricewhite', 'oats', 'cornmeal', 'spaghetti'].includes(id)) return 'bag';
  return 'box';
}

function FoodGlyph({ id, ink, accent, size = 26 }) {
  // Interior decorative symbol per food id
  const s = size;
  const half = s / 2;
  const common = { fill: 'none', stroke: accent, strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (id) {
    case 'spaghetti':
      return (
        <g>
          {[0, 1, 2, 3, 4].map(i => (
            <path key={i} d={`M ${4 + i * 2} 4 Q ${2 + i * 2} ${half}, ${4 + i * 2} ${s - 4}`} {...common} />
          ))}
        </g>
      );
    case 'marinara':
      return <circle cx={half} cy={half} r={s * 0.28} fill={accent} />;
    case 'tuna':
      return (
        <g>
          <path d={`M 4 ${half} Q ${half} ${half - 3.5}, ${s - 4} ${half} Q ${half} ${half + 3.5}, 4 ${half} Z`} fill={accent} />
          <circle cx={s - 7} cy={half - 1} r={0.8} fill={ink} />
        </g>
      );
    case 'blackbeans':
      return (
        <g fill={accent}>
          <ellipse cx={half - 4} cy={half} rx={3.2} ry={2.2} transform={`rotate(-20 ${half - 4} ${half})`} />
          <ellipse cx={half + 4} cy={half + 3} rx={3.2} ry={2.2} transform={`rotate(18 ${half + 4} ${half + 3})`} />
          <ellipse cx={half + 1} cy={half - 4} rx={3.2} ry={2.2} transform={`rotate(-5 ${half + 1} ${half - 4})`} />
        </g>
      );
    case 'ricewhite':
      return (
        <g fill={accent}>
          {Array.from({ length: 7 }).map((_, i) => (
            <ellipse key={i}
              cx={4 + (i % 4) * 4 + (i > 3 ? 2 : 0)}
              cy={half - 2 + Math.floor(i / 4) * 4}
              rx={1.4} ry={0.8}
              transform={`rotate(${30 + i * 10} ${4 + (i % 4) * 4} ${half - 2 + Math.floor(i / 4) * 4})`} />
          ))}
        </g>
      );
    case 'cornkernels':
    case 'cornmeal':
      return (
        <g>
          <ellipse cx={half} cy={half} rx={s * 0.18} ry={s * 0.32} fill={accent} />
          <path d={`M ${half} ${half - s * 0.32} L ${half} ${half + s * 0.32}`} stroke={ink} strokeWidth={0.8} opacity={0.4} />
          {[-0.22, 0, 0.22].map((dx, i) => (
            <path key={i} d={`M ${half + dx * s} ${half - s * 0.32} L ${half + dx * s} ${half + s * 0.32}`} stroke={ink} strokeWidth={0.4} opacity={0.3} />
          ))}
        </g>
      );
    case 'chickenbroth':
      return (
        <g>
          <path d={`M 5 ${half + 2} Q ${half} ${half - 1}, ${s - 5} ${half + 2}`} {...common} />
          <path d={`M 5 ${half + 5} Q ${half} ${half + 2}, ${s - 5} ${half + 5}`} {...common} />
          <circle cx={half - 3} cy={half - 2} r={0.9} fill={accent} />
          <circle cx={half + 2} cy={half - 3} r={0.7} fill={accent} />
        </g>
      );
    case 'tomatoes':
      return (
        <g>
          <circle cx={half} cy={half + 1} r={s * 0.28} fill={accent} />
          <path d={`M ${half - 2} ${half - s * 0.28 + 1} Q ${half} ${half - s * 0.28 - 1}, ${half + 2} ${half - s * 0.28 + 1}`} stroke={ink} strokeWidth={1.2} fill={ink} />
        </g>
      );
    case 'peanutbutter':
      return (
        <g>
          <ellipse cx={half - 2} cy={half} rx={s * 0.14} ry={s * 0.22} fill={accent} />
          <ellipse cx={half + 2} cy={half + 1} rx={s * 0.14} ry={s * 0.22} fill={accent} />
        </g>
      );
    case 'oats':
      return (
        <g fill={accent}>
          <ellipse cx={half} cy={half - 3} rx={1.6} ry={0.8} />
          <ellipse cx={half - 3} cy={half} rx={1.6} ry={0.8} transform={`rotate(-20 ${half - 3} ${half})`} />
          <ellipse cx={half + 3} cy={half} rx={1.6} ry={0.8} transform={`rotate(20 ${half + 3} ${half})`} />
          <ellipse cx={half} cy={half + 3} rx={1.6} ry={0.8} />
        </g>
      );
    case 'peaches':
      return (
        <g>
          <circle cx={half} cy={half + 1} r={s * 0.28} fill={accent} />
          <path d={`M ${half} ${half - s * 0.28 + 1} L ${half} ${half + s * 0.28 - 1}`} stroke={ink} strokeWidth={0.8} opacity={0.4} />
          <path d={`M ${half - 1} ${half - s * 0.28 + 1} Q ${half} ${half - s * 0.28 - 2}, ${half + 3} ${half - s * 0.28 - 1}`} stroke={ink} strokeWidth={1} fill="none" />
        </g>
      );
    default:
      return <circle cx={half} cy={half} r={s * 0.25} fill={accent} opacity={0.8} />;
  }
}

function FoodThumb({ theme, id, size = 40 }) {
  const c = FOOD_COLORS[id] || { bg: '#E8E0D2', ink: '#4A3B2B', accent: '#8A6A45' };
  const kind = foodContainer(id);
  const glyphBox = Math.max(16, size * 0.6);

  // Vector container silhouettes, fitted to `size`
  const vb = 40; // viewBox
  const renderContainer = () => {
    if (kind === 'can') return (
      <g>
        <rect x="8" y="7" width="24" height="27" rx="2.4" fill={c.ink} opacity={0.08}/>
        <rect x="8" y="7" width="24" height="27" rx="2.4" fill="#fff" fillOpacity="0.35" stroke={c.ink} strokeWidth="1" strokeOpacity="0.35"/>
        <rect x="8" y="13" width="24" height="15" fill={c.accent} fillOpacity="0.85"/>
        <rect x="8" y="13" width="24" height="2" fill={c.ink} fillOpacity="0.22"/>
        <rect x="8" y="26" width="24" height="2" fill={c.ink} fillOpacity="0.22"/>
      </g>
    );
    if (kind === 'jar') return (
      <g>
        <rect x="11" y="5" width="18" height="4" rx="1" fill={c.ink} fillOpacity="0.7"/>
        <rect x="10" y="9" width="20" height="26" rx="2.4" fill="#fff" fillOpacity="0.55" stroke={c.ink} strokeWidth="1" strokeOpacity="0.3"/>
        <rect x="10" y="15" width="20" height="14" rx="1" fill={c.accent} fillOpacity="0.85"/>
      </g>
    );
    if (kind === 'bag') return (
      <g>
        <path d="M 11 8 Q 11 5, 14 5 L 26 5 Q 29 5, 29 8 L 31 34 Q 31 36, 29 36 L 11 36 Q 9 36, 9 34 Z"
          fill="#fff" fillOpacity="0.55" stroke={c.ink} strokeWidth="1" strokeOpacity="0.3"/>
        <rect x="11" y="14" width="18" height="14" rx="1" fill={c.accent} fillOpacity="0.8"/>
        {/* Fold lines at top */}
        <path d="M 11 8 L 29 8" stroke={c.ink} strokeWidth="0.8" strokeOpacity="0.35"/>
        <path d="M 11 10 L 29 10" stroke={c.ink} strokeWidth="0.8" strokeOpacity="0.2"/>
      </g>
    );
    // default box
    return (
      <g>
        <rect x="8" y="8" width="24" height="25" rx="2" fill="#fff" fillOpacity="0.55" stroke={c.ink} strokeWidth="1" strokeOpacity="0.3"/>
        <rect x="8" y="14" width="24" height="13" fill={c.accent} fillOpacity="0.8"/>
      </g>
    );
  };

  return (
    <div style={{
      width: size, height: size, borderRadius: Math.max(6, size * 0.22),
      background: `linear-gradient(145deg, ${c.bg}, ${c.bg}dd 70%)`,
      flexShrink: 0, position: 'relative', overflow: 'hidden',
      boxShadow: `inset 0 0 0 1px ${c.ink}14`,
    }}>
      {size >= 22 ? (
        <svg viewBox={`0 0 ${vb} ${vb}`} width={size} height={size}
          style={{ display: 'block' }} aria-hidden="true">
          {renderContainer()}
          {/* Inner glyph centered inside the label */}
          <g transform={`translate(${(vb - glyphBox) / 2}, ${(vb - glyphBox) / 2})`}>
            <FoodGlyph id={id} ink={c.ink} accent={c.ink} size={glyphBox} />
          </g>
        </svg>
      ) : (
        // small-size fallback — a clean color dot with one-letter mark
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `linear-gradient(145deg, ${c.bg}, ${c.accent}55)`,
          color: c.ink, fontFamily: 'JetBrains Mono, monospace',
          fontSize: Math.max(8, size * 0.55), fontWeight: 700,
          letterSpacing: '-0.02em',
        }}>
          {(id[0] || '?').toUpperCase()}
        </div>
      )}
    </div>
  );
}

function ScanModal({ theme, onClose, onScan }) {
  const [status, setStatus] = useState('scanning');
  useEffect(() => {
    const t = setTimeout(() => {
      setStatus('found');
      setTimeout(() => onScan('peaches'), 700);
    }, 1600);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(30,20,10,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 420, background: theme.paper, borderRadius: 18,
        border: `1px solid ${theme.line}`, padding: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontFamily: theme.display, fontSize: 20, fontWeight: theme.displayWeight }}>Scan barcode</div>
          <button onClick={onClose} style={{ ...stepBtnSm(theme), width: 30, height: 30 }}>{Icon.close(theme.muted)}</button>
        </div>
        <div style={{
          height: 180, borderRadius: 12, background: '#111',
          position: 'relative', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            color: '#7a7', fontFamily: theme.mono, fontSize: 11,
          }}>// camera feed</div>
          <div style={{
            position: 'absolute', left: 40, right: 40, top: 70, height: 40,
            border: '1px solid rgba(255,255,255,0.3)', borderRadius: 4,
          }} />
          <div style={{
            position: 'absolute', left: 40, right: 40, top: 89, height: 2,
            background: status === 'found' ? '#6ECB7A' : theme.accent,
            boxShadow: `0 0 12px ${status === 'found' ? '#6ECB7A' : theme.accent}`,
            animation: status === 'scanning' ? 'scanline 1.6s ease-in-out infinite' : 'none',
          }} />
        </div>
        <div style={{ marginTop: 14, fontSize: 13, color: theme.muted, textAlign: 'center', fontFamily: theme.mono }}>
          {status === 'scanning' ? 'Reading barcode…' : 'Matched: Sliced Peaches · 15 oz'}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { StaffApp });
