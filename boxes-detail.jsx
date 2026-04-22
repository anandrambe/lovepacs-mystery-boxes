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

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(18,22,20,0.32)',
        zIndex: 40, animation: 'fadeIn 180ms ease-out',
      }} />
      <aside style={{
        position: 'fixed', top: 0, right: 0, height: '100vh', width: 620,
        background: theme.paper, borderLeft: `1px solid ${theme.line}`,
        zIndex: 50, display: 'flex', flexDirection: 'column',
        boxShadow: '-24px 0 50px -20px rgba(0,0,0,0.25)',
        animation: 'slideIn 260ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}>
        <style>{`
          @keyframes slideIn { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        `}</style>

        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${theme.line}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontFamily: theme.mono, fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                {box.region} · {new Date(box.dispatchDate + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: 8, border: `1px solid ${theme.line}`,
              background: 'transparent', cursor: 'pointer', color: theme.muted,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>{Icon.close(theme.muted)}</button>
          </div>
          <div style={{
            fontFamily: theme.display, fontWeight: theme.displayWeight,
            fontSize: 26, letterSpacing: theme.displayTracking, lineHeight: 1.1,
          }}>{box.id}</div>
          <div style={{ fontSize: 13, color: theme.muted, marginTop: 4 }}>{box.event} · {box.address}</div>

          {/* Status stepper */}
          <div style={{ marginTop: 18, padding: '14px 16px', borderRadius: 12, background: theme.bg, border: `1px solid ${theme.line}` }}>
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

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px 40px' }}>
          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 22 }}>
            <MiniStat theme={theme} label="Families" value={box.families} />
            <MiniStat theme={theme} label="4-person meals" value={box.meals4p} accent />
            <MiniStat theme={theme} label="2-person meals" value={box.meals2p} />
          </div>

          {/* QR action */}
          {box.qrUrl && (
            <div style={{
              padding: 14, borderRadius: 12, background: theme.bg,
              border: `1px solid ${theme.line}`, marginBottom: 22,
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{ padding: 4, background: '#fff', border: `1px solid ${theme.line}`, borderRadius: 6 }}>
                <QR size={54} seed={box.id} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: theme.mono, fontSize: 10, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Public recipe page
                </div>
                <div style={{ fontFamily: theme.mono, fontSize: 12, color: theme.ink, marginTop: 4, wordBreak: 'break-all' }}>
                  {box.qrUrl}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button theme={theme} kind="secondary" size="sm" onClick={onOpenPublic}>Open</Button>
                <Button theme={theme} kind="primary" size="sm" icon={Icon.print(theme.accentInk)} onClick={onPrint}>Print Label</Button>
              </div>
            </div>
          )}

          {/* Contents */}
          <SectionHeader theme={theme}>Box contents ({box.items.length} items)</SectionHeader>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 22 }}>
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

          {/* Recipes */}
          <SectionHeader theme={theme}>Generated recipes ({recipes.length})</SectionHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recipes.map(r => (
              <button key={r.id} onClick={() => setRecipeId(r.id)} style={{
                textAlign: 'left', padding: 14, borderRadius: 12,
                border: `1px solid ${theme.line}`, background: theme.paper,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                transition: 'border-color 140ms, background 140ms',
              }}
              onMouseEnter={e => e.currentTarget.style.background = theme.bg}
              onMouseLeave={e => e.currentTarget.style.background = theme.paper}>
                <div style={{
                  width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                  position: 'relative', overflow: 'hidden',
                  background: `radial-gradient(at 30% 30%, ${theme.soft}, ${theme.bg})`,
                  border: `1px solid ${theme.line}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg viewBox="0 0 40 40" width="40" height="40" style={{ position: 'absolute', inset: 6 }}>
                    <ellipse cx="20" cy="22" rx="15" ry="9" fill={theme.paper} stroke={theme.line} strokeWidth="0.8"/>
                    <ellipse cx="20" cy="22" rx="11" ry="6" fill="none" stroke={theme.accent} strokeOpacity="0.4" strokeWidth="0.7"/>
                  </svg>
                  <div style={{
                    position: 'relative', zIndex: 1,
                    fontFamily: theme.display, fontSize: 18, fontWeight: theme.displayWeight,
                    color: theme.accent, letterSpacing: theme.displayTracking,
                  }}>{r.title.en[0]}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: theme.display, fontWeight: theme.displayWeight, fontSize: 16,
                    letterSpacing: theme.displayTracking,
                  }}>{r.title.en}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
                    <Chip theme={theme} tone="soft">{r.time}</Chip>
                    <Chip theme={theme} tone="soft">Serves {r.servings}</Chip>
                    {r.missing && <Chip theme={theme} tone="missing">+ {r.missing.en}</Chip>}
                  </div>
                </div>
                {Icon.arrowR(theme.muted)}
              </button>
            ))}
          </div>
        </div>

        {recipeId && (
          <RecipeDetailSubPanel theme={theme}
            recipe={recipes.find(r => r.id === recipeId)}
            onClose={() => setRecipeId(null)} />
        )}
      </aside>
    </>
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
  return (
    <>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(18,22,20,0.18)', zIndex: 2,
      }} />
      <div style={{
        position: 'absolute', top: 0, right: 0, height: '100%', width: '96%',
        background: theme.paper, borderLeft: `1px solid ${theme.line}`,
        zIndex: 3, display: 'flex', flexDirection: 'column',
        boxShadow: '-24px 0 40px -20px rgba(0,0,0,0.25)',
        animation: 'slideIn 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${theme.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: 13, color: theme.muted, display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 8px', borderRadius: 6, fontFamily: theme.body,
          }}>← Back</button>
          <div style={{ flex: 1 }} />
          <div style={{
            display: 'inline-flex', background: theme.bg, borderRadius: 8, padding: 2,
            border: `1px solid ${theme.line}`,
          }}>
            {['en', 'es'].map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                padding: '4px 10px', borderRadius: 6, border: 'none',
                background: lang === l ? theme.paper : 'transparent',
                fontFamily: theme.mono, fontSize: 11, textTransform: 'uppercase',
                letterSpacing: '0.1em', cursor: 'pointer', color: theme.ink,
                fontWeight: lang === l ? 600 : 400,
                boxShadow: lang === l ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}>{l}</button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '22px 24px 40px' }}>
          <div style={{
            fontFamily: theme.display, fontWeight: theme.displayWeight,
            fontSize: 28, letterSpacing: theme.displayTracking, lineHeight: 1.1,
          }}>{recipe.title[lang]}</div>
          {lang === 'en' && (
            <div style={{ fontSize: 13, color: theme.muted, fontStyle: 'italic', marginTop: 4 }}>{recipe.title.es}</div>
          )}

          <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
            <Chip theme={theme} tone="soft">{Icon.clock(theme.muted)} {recipe.time}</Chip>
            <Chip theme={theme} tone="soft">Serves {recipe.servings}</Chip>
            {recipe.tags.map((t, i) => <Chip key={i} theme={theme} tone="soft">{t}</Chip>)}
          </div>

          <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: '1fr', gap: 18 }}>
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
