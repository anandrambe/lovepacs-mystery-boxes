// boxes-detail.jsx — Mystery Box detail side-sliding panel + recipe detail sub-panel

function BoxDetailPanel({ theme, box, onClose, onAdvance, onOpenPublic, onPrint }) {
  const [recipeId, setRecipeId] = useState(null);
  const recipes = useMemo(() => (box.recipes || []).map(id => RECIPES.find(r => r.id === id)).filter(Boolean), [box]);
  const nextStatus = {
    'Draft':      'Finalized',
    'Finalized':  'Printed',
    'Printed':    'Dispatched',
    'Dispatched': null,
  }[box.status];

  const nextLabel = {
    'Draft':      'Finalize recipes',
    'Finalized':  'Mark as printed',
    'Printed':    'Mark as dispatched',
  }[box.status];

  // Render via portal so position:fixed is relative to the true viewport,
  // not the transform:scale() ancestor in the main layout.
  return ReactDOM.createPortal(
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(18,22,20,0.32)',
        zIndex: 40, animation: 'fadeIn 180ms ease-out',
      }} />
      <aside style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, left: 248,
        background: theme.paper, borderLeft: `1px solid ${theme.line}`,
        zIndex: 50, display: 'flex', flexDirection: 'column',
        boxShadow: '-24px 0 60px -20px rgba(0,0,0,0.2)',
        animation: 'slideIn 280ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}>
        <style>{`
          @keyframes slideIn { from { transform: translateX(32px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
          @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        `}</style>

        {/* Header */}
        <div style={{ padding: '24px 36px 20px', borderBottom: `1px solid ${theme.line}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
            {/* Left: ID + meta */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: theme.mono, fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>
                {box.region} · {new Date(box.dispatchDate + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <div style={{
                fontFamily: theme.display, fontWeight: theme.displayWeight,
                fontSize: 32, letterSpacing: theme.displayTracking, lineHeight: 1.05,
              }}>{box.id}</div>
              <div style={{ fontSize: 14, color: theme.muted, marginTop: 5 }}>{box.event}{box.address && box.address !== '—' ? ` · ${box.address}` : ''}</div>
            </div>
            {/* Right: actions + close */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              {onPrint && (
                <Button theme={theme} kind="secondary" size="sm" icon={Icon.print(theme.ink)} onClick={onPrint}>Print Label</Button>
              )}
              <button onClick={onClose} style={{
                width: 34, height: 34, borderRadius: 8, border: `1px solid ${theme.line}`,
                background: 'transparent', cursor: 'pointer', color: theme.muted,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>{Icon.close(theme.muted)}</button>
            </div>
          </div>

          {/* Status stepper — full width */}
          <div style={{ marginTop: 20, padding: '14px 18px', borderRadius: 12, background: theme.bg, border: `1px solid ${theme.line}` }}>
            <StatusStepper status={box.status} theme={theme} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
              <div style={{ fontSize: 12, color: theme.muted }}>
                {box.status === 'Dispatched' ? `Dispatched ${box.dispatchedAt || ''}` : `Current: ${box.status}`}
              </div>
              {nextStatus && (
                <Button theme={theme} kind="primary" size="sm"
                  icon={Icon.arrowR(theme.accentInk)}
                  onClick={() => onAdvance(nextStatus)}>{nextLabel}</Button>
              )}
            </div>
          </div>
        </div>

        {/* Body — two-column layout */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, height: '100%' }}>

            {/* Left column: stats + QR + contents */}
            <div style={{ padding: '24px 28px 40px', borderRight: `1px solid ${theme.line}`, overflowY: 'auto' }}>
              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
                <MiniStat theme={theme} label="Recipes" value={recipes.length} accent />
                <MiniStat theme={theme} label="Food items" value={box.items.length} />
                <MiniStat theme={theme} label="Units packed" value={box.items.reduce((s, i) => s + i.qty, 0)} />
              </div>

              {/* QR block */}
              {box.qrUrl && (
                <div style={{
                  padding: 16, borderRadius: 12, background: theme.bg,
                  border: `1px solid ${theme.line}`, marginBottom: 24,
                  display: 'flex', alignItems: 'center', gap: 16,
                }}>
                  <div style={{ padding: 5, background: '#fff', border: `1px solid ${theme.line}`, borderRadius: 8, flexShrink: 0 }}>
                    <QR size={64} seed={box.id} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: theme.mono, fontSize: 10, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                      Public recipe page
                    </div>
                    <div style={{ fontFamily: theme.mono, fontSize: 12, color: theme.ink, wordBreak: 'break-all', lineHeight: 1.4 }}>
                      {box.qrUrl}
                    </div>
                    <Button theme={theme} kind="secondary" size="sm" onClick={onOpenPublic} style={{ marginTop: 10 }}>Open page</Button>
                  </div>
                </div>
              )}

              {/* Box contents */}
              <SectionHeader theme={theme}>Box contents ({box.items.length} items)</SectionHeader>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {box.items.map(i => {
                  const f = FOOD_CATALOG.find(x => x.id === i.id);
                  if (!f) return null;
                  return (
                    <div key={i.id} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 10px', borderRadius: 10,
                      border: `1px solid ${theme.line}`, background: theme.paper,
                    }}>
                      <FoodThumb theme={theme} id={i.id} size={28} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: theme.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</div>
                        <div style={{ fontSize: 11, color: theme.muted }}>{f.measure}</div>
                      </div>
                      <div style={{ fontFamily: theme.mono, fontSize: 12, color: theme.ink, fontWeight: 600 }}>×{i.qty}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right column: recipes */}
            <div style={{ padding: '24px 28px 40px', overflowY: 'auto' }}>
              <SectionHeader theme={theme}>Generated recipes ({recipes.length})</SectionHeader>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recipes.map(r => {
                  // Map recipe IDs to hero photos; hash-based fallback for any extras
                  const HERO = {
                    'pantry-spag':  'assets/recipe-spaghetti.jpg',
                    'arroz-frijol': 'assets/recipe-ricebowl.jpg',
                    'oven-bake':    'assets/recipe-ricebowl.jpg',
                    'cowboy':       'assets/recipe-salad.jpg',
                  };
                  const FALLBACKS = [
                    'assets/recipe-spaghetti.jpg',
                    'assets/recipe-salad.jpg',
                    'assets/recipe-ricebowl.jpg',
                  ];
                  const fIdx = Math.abs(Array.from(r.id).reduce((a, c) => a + c.charCodeAt(0), 0)) % FALLBACKS.length;
                  const heroSrc = HERO[r.id] || FALLBACKS[fIdx];

                  return (
                  <button key={r.id} onClick={() => setRecipeId(r.id)} style={{
                    textAlign: 'left', padding: 0, borderRadius: 14,
                    border: `1px solid ${theme.line}`, background: theme.paper,
                    cursor: 'pointer', display: 'flex', alignItems: 'stretch', gap: 0,
                    overflow: 'hidden',
                    transition: 'border-color 140ms, background 140ms',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = theme.accent}
                  onMouseLeave={e => e.currentTarget.style.borderColor = theme.line}>
                    {/* Photo thumbnail */}
                    <div style={{
                      width: 72, flexShrink: 0,
                      background: '#1f1a14',
                      overflow: 'hidden',
                    }}>
                      <img
                        src={heroSrc}
                        alt={r.title.en}
                        style={{
                          width: '100%', height: '100%',
                          objectFit: 'cover', objectPosition: 'center',
                          display: 'block',
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0, padding: '14px 12px 14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontFamily: theme.display, fontWeight: theme.displayWeight, fontSize: 16,
                          letterSpacing: theme.displayTracking, lineHeight: 1.25,
                        }}>{r.title.en}</div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                          <Chip theme={theme} tone="soft">{r.time}</Chip>
                          <Chip theme={theme} tone="soft">Serves {r.servings}</Chip>
                          {r.missing && <Chip theme={theme} tone="missing">+ {r.missing.en}</Chip>}
                        </div>
                      </div>
                      {Icon.arrowR(theme.muted)}
                    </div>
                  </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {recipeId && (
          <RecipeDetailSubPanel theme={theme}
            recipe={recipes.find(r => r.id === recipeId)}
            onClose={() => setRecipeId(null)} />
        )}
      </aside>
    </>,
    document.body
  );
}

function MiniStat({ theme, label, value, accent }) {
  return (
    <div style={{ padding: '12px 14px', borderRadius: 12, border: `1px solid ${theme.line}`, background: theme.bg }}>
      <div style={{ fontSize: 10, fontFamily: theme.mono, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
      <div style={{
        fontFamily: theme.display, fontWeight: theme.displayWeight,
        fontSize: 24, letterSpacing: theme.displayTracking, marginTop: 4,
        color: accent ? theme.accent : theme.ink, lineHeight: 1,
      }}>{value}</div>
    </div>
  );
}

function SectionHeader({ theme, children }) {
  return (
    <div style={{
      fontFamily: theme.mono, fontSize: 11, color: theme.muted,
      textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10,
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      {children}
      <div style={{ flex: 1, height: 1, background: theme.line }} />
    </div>
  );
}

// Sub-panel overlaid on top of the box detail panel
function RecipeDetailSubPanel({ theme, recipe, onClose }) {
  const [lang, setLang] = useState('en');
  if (!recipe) return null;
  const steps = recipe.steps[lang];
  const boxIngs = recipe.ingredients.filter(i => i.source === 'box');
  const staples = recipe.ingredients.filter(i => i.source === 'staple');
  const missing = recipe.ingredients.filter(i => i.source === 'missing');

  const HERO = {
    'pantry-spag':  'assets/recipe-spaghetti.jpg',
    'arroz-frijol': 'assets/recipe-ricebowl.jpg',
    'oven-bake':    'assets/recipe-ricebowl.jpg',
    'cowboy':       'assets/recipe-salad.jpg',
  };
  const FALLBACKS = ['assets/recipe-spaghetti.jpg', 'assets/recipe-salad.jpg', 'assets/recipe-ricebowl.jpg'];
  const fIdx = Math.abs(Array.from(recipe.id).reduce((a, c) => a + c.charCodeAt(0), 0)) % FALLBACKS.length;
  const heroSrc = HERO[recipe.id] || FALLBACKS[fIdx];

  return (
    <>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(18,22,20,0.18)', zIndex: 2,
      }} />
      <div style={{
        position: 'absolute', top: 0, right: 0, height: '100%', width: 440,
        background: theme.paper, borderLeft: `1px solid ${theme.line}`,
        zIndex: 3, display: 'flex', flexDirection: 'column',
        boxShadow: '-20px 0 48px -16px rgba(0,0,0,0.22)',
        animation: 'slideIn 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}>

        {/* Hero image with overlaid back button + lang toggle */}
        <div style={{ position: 'relative', height: 180, flexShrink: 0, background: '#1f1a14', overflow: 'hidden' }}>
          <img src={heroSrc} alt={recipe.title.en} style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
          }} />
          {/* Gradient so controls are readable over photo */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 55%, rgba(0,0,0,0.35) 100%)',
          }} />
          {/* Top row: back + lang */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <button onClick={onClose} style={{
              background: 'rgba(0,0,0,0.32)', border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 8, cursor: 'pointer', color: '#fff',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', fontSize: 12, fontFamily: theme.body, backdropFilter: 'blur(4px)',
            }}>← Back</button>
            <div style={{
              display: 'inline-flex', background: 'rgba(0,0,0,0.32)',
              borderRadius: 8, padding: 2, border: '1px solid rgba(255,255,255,0.18)',
              backdropFilter: 'blur(4px)',
            }}>
              {['en', 'es'].map(l => (
                <button key={l} onClick={() => setLang(l)} style={{
                  padding: '4px 10px', borderRadius: 6, border: 'none',
                  background: lang === l ? 'rgba(255,255,255,0.92)' : 'transparent',
                  fontFamily: theme.mono, fontSize: 11, textTransform: 'uppercase',
                  letterSpacing: '0.1em', cursor: 'pointer',
                  color: lang === l ? theme.ink : 'rgba(255,255,255,0.8)',
                  fontWeight: lang === l ? 600 : 400,
                }}>{l}</button>
              ))}
            </div>
          </div>
          {/* Title overlay at bottom of image */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '12px 18px 14px',
          }}>
            <div style={{
              fontFamily: theme.display, fontWeight: theme.displayWeight,
              fontSize: 22, letterSpacing: theme.displayTracking, lineHeight: 1.15,
              color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.4)',
              textWrap: 'pretty',
            }}>{recipe.title[lang]}</div>
            {lang === 'en' && (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', marginTop: 2 }}>
                {recipe.title.es}
              </div>
            )}
          </div>
        </div>

        {/* Chips row */}
        <div style={{ padding: '12px 18px', borderBottom: `1px solid ${theme.line}`, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Chip theme={theme} tone="soft">{Icon.clock(theme.muted)} {recipe.time}</Chip>
          <Chip theme={theme} tone="soft">Serves {recipe.servings}</Chip>
          {recipe.tags.map((t, i) => <Chip key={i} theme={theme} tone="soft">{t}</Chip>)}
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '20px 20px 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 18 }}>
            {/* Ingredients */}
            <div style={{ padding: 16, background: theme.bg, borderRadius: 12, border: `1px solid ${theme.line}` }}>
              <SectionHeader theme={theme}>Ingredients</SectionHeader>
              {boxIngs.concat(staples).concat(missing).map((i, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0',
                  borderBottom: idx < recipe.ingredients.length - 1 ? `1px dashed ${theme.line}` : 'none',
                }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: 999,
                    background: i.source === 'missing' ? '#C24A2C' : i.source === 'staple' ? theme.muted : theme.accent,
                  }} />
                  <div style={{ flex: 1, fontSize: 13.5, color: theme.ink }}>{i.name[lang]}</div>
                  <div style={{ fontFamily: theme.mono, fontSize: 12, color: theme.muted }}>{i.amount[lang]}</div>
                </div>
              ))}
              <div style={{ marginTop: 10, fontSize: 11, color: theme.muted, fontStyle: 'italic' }}>
                <span style={{ color: theme.accent }}>●</span> from box
                <span style={{ marginLeft: 10, color: theme.muted }}>●</span> staple
                {missing.length > 0 && <><span style={{ marginLeft: 10, color: '#C24A2C' }}>●</span> missing</>}
              </div>
            </div>

            {/* Steps */}
            <div>
              <SectionHeader theme={theme}>Step-by-step instructions</SectionHeader>
              <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {steps.map((s, i) => (
                  <li key={i} style={{ display: 'flex', gap: 14, marginBottom: 14, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 999, flexShrink: 0,
                      background: theme.ink, color: theme.paper,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: theme.mono, fontSize: 12, fontWeight: 600,
                    }}>{i + 1}</div>
                    <div style={{ fontSize: 14, lineHeight: 1.55, color: theme.ink, paddingTop: 4, textWrap: 'pretty' }}>
                      {s}
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Serving notes */}
            <div style={{ padding: 14, background: theme.soft, borderRadius: 12, border: `1px solid ${theme.line}` }}>
              <div style={{ fontFamily: theme.mono, fontSize: 10, color: theme.accent, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>
                Serving notes
              </div>
              <div style={{ fontSize: 13, color: theme.ink, lineHeight: 1.5 }}>
                Serves {recipe.servings} — scale ingredients by ½ for a 2-person portion.
                {' '}{recipe.equipment[lang]}.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { BoxDetailPanel, RecipeDetailSubPanel });
