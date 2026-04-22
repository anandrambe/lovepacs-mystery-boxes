// boxes-public.jsx — Public (QR-linked) recipe landing page — mobile-first

const RECIPE_HERO = {
  'pantry-spag':  'assets/recipe-spaghetti.jpg',
  'arroz-frijol': 'assets/recipe-ricebowl.jpg',
  'oven-bake':    'assets/recipe-ricebowl.jpg',
  'cowboy':       'assets/recipe-salad.jpg',
};
const HERO_FALLBACKS = ['assets/recipe-spaghetti.jpg', 'assets/recipe-salad.jpg', 'assets/recipe-ricebowl.jpg'];

function recipeHero(id) {
  if (RECIPE_HERO[id]) return RECIPE_HERO[id];
  const h = Math.abs(Array.from(id).reduce((a, c) => a + c.charCodeAt(0), 0));
  return HERO_FALLBACKS[h % HERO_FALLBACKS.length];
}

function PublicRecipePage({ theme, box, onClose, isPreview = true }) {
  const [lang, setLang] = useState('en');
  const [activeIdx, setActiveIdx] = useState(0);
  if (!box) return null;

  const recipes = (box.recipes || []).map(id => RECIPES.find(r => r.id === id)).filter(Boolean);
  const active  = recipes[activeIdx] || recipes[0];
  const steps   = active ? active.steps[lang] : [];

  const T = {
    en: {
      kicker:        'Your Love Box',
      hello:         'meals in your box',
      intro:         "Every recipe here cooks on a regular stovetop — no special equipment needed. Ingredients marked ● are right inside your box.",
      contents:      "What's in your box",
      pickTitle:     'Choose a meal to cook',
      ingredients:   'Ingredients',
      steps:         'How to cook it',
      notes:         'Serving notes',
      legend_box:    'in your box',
      legend_staple: 'pantry staple',
      legend_missing:"you'll need this",
      serves:        'Serves',
      footer:        "Questions? Your local Lovepacs volunteer is happy to help.",
      madeWith:      "Made with love.",
    },
    es: {
      kicker:        'Tu Love Box',
      hello:         'comidas en tu caja',
      intro:         'Cada receta se cocina en estufa común — sin equipo especial. Los ingredientes marcados ● están en tu caja.',
      contents:      'Qué hay en tu caja',
      pickTitle:     'Elige una comida para cocinar',
      ingredients:   'Ingredientes',
      steps:         'Cómo cocinarlo',
      notes:         'Notas',
      legend_box:    'en tu caja',
      legend_staple: 'despensa común',
      legend_missing:'necesitarás esto',
      serves:        'Porciones',
      footer:        '¿Preguntas? Tu voluntario Lovepacs local estará encantado de ayudarte.',
      madeWith:      'Hecho con amor.',
    },
  }[lang];

  return (
    <div style={{ background: theme.bg, minHeight: '100vh', fontFamily: theme.body, color: theme.ink }}>

      {/* ── Staff preview bar (staff app only) ─────────────────── */}
      {isPreview && (
        <div style={{
          background: theme.ink, color: theme.paper,
          padding: '10px 20px',
          display: 'flex', alignItems: 'center', gap: 12,
          fontFamily: theme.mono, fontSize: 11,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          flexWrap: 'wrap', gap: 8,
        }}>
          <span style={{ opacity: 0.5 }}>Preview</span>
          <span style={{ opacity: 0.3 }}>·</span>
          <span style={{ opacity: 0.7, fontSize: 10, wordBreak: 'break-all' }}>{getPublicUrl(box.id)}</span>
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={{
            background: 'transparent', border: '1px solid rgba(255,255,255,0.25)',
            color: theme.paper, padding: '5px 12px', borderRadius: 6,
            cursor: 'pointer', fontFamily: theme.mono, fontSize: 11,
            textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap',
          }}>Close ×</button>
        </div>
      )}

      {/* ── Sticky header: logo + lang toggle ──────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: theme.paper, borderBottom: `1px solid ${theme.line}`,
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <LovepacsLogo height={28} />
        <div style={{
          display: 'inline-flex', background: theme.bg, borderRadius: 999,
          padding: 3, border: `1px solid ${theme.line}`,
        }}>
          {['en', 'es'].map(l => (
            <button key={l} onClick={() => setLang(l)} style={{
              padding: '5px 14px', borderRadius: 999, border: 'none',
              background: lang === l ? theme.ink : 'transparent',
              color: lang === l ? theme.paper : theme.muted,
              fontFamily: theme.mono, fontSize: 11, fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
              transition: 'background 150ms',
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* ── Hero: box intro ─────────────────────────────────────── */}
      <div style={{
        padding: '28px 20px 24px',
        background: `radial-gradient(ellipse at 80% 0%, ${theme.soft} 0%, transparent 60%), ${theme.paper}`,
        borderBottom: `1px solid ${theme.line}`,
      }}>
        <div style={{
          fontFamily: theme.mono, fontSize: 10, color: theme.muted,
          textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 10,
        }}>{T.kicker} · {box.id}</div>
        <div style={{
          fontFamily: theme.display, fontWeight: theme.displayWeight,
          fontSize: 34, letterSpacing: theme.displayTracking, lineHeight: 1.05,
          marginBottom: 12,
        }}>
          {recipes.length} {T.hello}
        </div>
        <div style={{ fontSize: 15, color: theme.muted, lineHeight: 1.65 }}>
          {T.intro}
        </div>
      </div>

      {/* ── Box contents (horizontal scroll) ───────────────────── */}
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.line}`, background: theme.bg }}>
        <div style={{
          fontFamily: theme.mono, fontSize: 10, color: theme.muted,
          textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10,
        }}>{T.contents}</div>
        <div style={{
          display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4,
          scrollbarWidth: 'none', msOverflowStyle: 'none',
        }}>
          {box.items.map(i => {
            const f = FOOD_CATALOG.find(x => x.id === i.id);
            if (!f) return null;
            return (
              <span key={i.id} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px 6px 6px', borderRadius: 999, flexShrink: 0,
                background: theme.paper, border: `1px solid ${theme.line}`,
                fontSize: 13, color: theme.ink, whiteSpace: 'nowrap',
              }}>
                <FoodThumb theme={theme} id={i.id} size={22} />
                {lang === 'en' ? f.name : f.nameEs} <span style={{ color: theme.muted }}>×{i.qty}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* ── Recipe tab bar (horizontal scroll) ─────────────────── */}
      <div style={{
        position: 'sticky', top: 53, zIndex: 20,
        background: theme.paper, borderBottom: `1px solid ${theme.line}`,
        display: 'flex', overflowX: 'auto',
        scrollbarWidth: 'none', msOverflowStyle: 'none',
        padding: '0 4px',
      }}>
        {recipes.map((r, i) => (
          <button key={r.id} onClick={() => setActiveIdx(i)} style={{
            padding: '14px 16px', flexShrink: 0,
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: theme.body, fontSize: 13.5, fontWeight: i === activeIdx ? 600 : 400,
            color: i === activeIdx ? theme.ink : theme.muted,
            borderBottom: `2.5px solid ${i === activeIdx ? theme.accent : 'transparent'}`,
            transition: 'color 120ms, border-color 120ms',
            whiteSpace: 'nowrap',
          }}>
            {String(i + 1).padStart(2, '0')} · {r.title[lang]}
          </button>
        ))}
      </div>

      {/* ── Active recipe ───────────────────────────────────────── */}
      {active && (
        <div>
          {/* Recipe photo hero */}
          <div style={{
            position: 'relative', height: 220, overflow: 'hidden',
            background: theme.soft,
          }}>
            <img
              src={recipeHero(active.id)}
              alt={active.title[lang]}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.12) 50%, transparent 100%)',
            }} />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '16px 20px 20px',
            }}>
              <div style={{
                fontFamily: theme.mono, fontSize: 10, color: 'rgba(255,255,255,0.7)',
                textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6,
              }}>
                {String(activeIdx + 1).padStart(2, '0')} · {active.tags[0]}
              </div>
              <div style={{
                fontFamily: theme.display, fontWeight: theme.displayWeight,
                fontSize: 26, letterSpacing: theme.displayTracking,
                color: '#fff', lineHeight: 1.15,
              }}>{active.title[lang]}</div>
              <div style={{
                display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap',
              }}>
                <span style={{
                  background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)',
                  color: '#fff', padding: '4px 10px', borderRadius: 999,
                  fontSize: 12, fontFamily: theme.mono,
                }}>
                  ⏱ {active.time}
                </span>
                <span style={{
                  background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)',
                  color: '#fff', padding: '4px 10px', borderRadius: 999,
                  fontSize: 12, fontFamily: theme.mono,
                }}>
                  👤 {T.serves} {active.servings}
                </span>
                {active.missing && (
                  <span style={{
                    background: 'rgba(194,74,44,0.8)',
                    color: '#fff', padding: '4px 10px', borderRadius: 999,
                    fontSize: 12, fontFamily: theme.mono,
                  }}>
                    + {active.missing[lang]}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div style={{ padding: '24px 20px 0', background: theme.paper }}>
            <PublicSectionLabel theme={theme}>{T.ingredients}</PublicSectionLabel>
            <div style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${theme.line}`, marginTop: 10 }}>
              {active.ingredients.map((ing, i) => {
                const dotColor = ing.source === 'missing' ? '#C24A2C'
                               : ing.source === 'staple'  ? theme.muted
                               : theme.accent;
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    minHeight: 52, padding: '0 16px',
                    borderBottom: i < active.ingredients.length - 1 ? `1px solid ${theme.line}` : 'none',
                    background: theme.paper,
                  }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: 999,
                      background: dotColor, flexShrink: 0,
                    }} />
                    <span style={{ flex: 1, fontSize: 15, color: theme.ink, lineHeight: 1.4 }}>
                      {ing.name[lang]}
                    </span>
                    <span style={{
                      fontFamily: theme.mono, fontSize: 13, color: theme.muted,
                      textAlign: 'right',
                    }}>{ing.amount[lang]}</span>
                  </div>
                );
              })}
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: theme.muted, fontStyle: 'italic', flexWrap: 'wrap' }}>
              <span><span style={{ color: theme.accent }}>●</span> {T.legend_box}</span>
              <span><span style={{ color: theme.muted }}>●</span> {T.legend_staple}</span>
              {active.missing && <span><span style={{ color: '#C24A2C' }}>●</span> {T.legend_missing}</span>}
            </div>
          </div>

          {/* Steps */}
          <div style={{ padding: '24px 20px 0', background: theme.paper }}>
            <PublicSectionLabel theme={theme}>{T.steps}</PublicSectionLabel>
            <ol style={{ margin: '14px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {steps.map((s, i) => (
                <li key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 999, flexShrink: 0,
                    background: theme.ink, color: theme.paper,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: theme.mono, fontSize: 13, fontWeight: 700,
                  }}>{i + 1}</div>
                  <div style={{ fontSize: 15, lineHeight: 1.65, color: theme.ink, paddingTop: 6 }}>
                    {s}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Serving notes */}
          <div style={{ padding: '20px 20px 32px', background: theme.paper }}>
            <div style={{
              background: theme.soft, borderRadius: 14,
              padding: '16px 18px', border: `1px solid ${theme.line}`,
            }}>
              <div style={{
                fontFamily: theme.mono, fontSize: 10, color: theme.accent,
                textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8,
              }}>{T.notes}</div>
              <div style={{ fontSize: 14.5, color: theme.ink, lineHeight: 1.6 }}>
                {lang === 'en'
                  ? `Serves ${active.servings}. ${active.equipment.en}. Scale down by half for a 2-person portion.`
                  : `Para ${active.servings}. ${active.equipment.es}. Reduzca a la mitad para 2 personas.`}
              </div>
            </div>
          </div>

          {/* Next recipe nudge */}
          {recipes.length > 1 && (
            <div style={{
              padding: '0 20px 32px', background: theme.paper,
              borderTop: `1px solid ${theme.line}`, paddingTop: 24,
            }}>
              <div style={{
                fontFamily: theme.mono, fontSize: 10, color: theme.muted,
                textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12,
              }}>{lang === 'en' ? 'More recipes in this box' : 'Más recetas en esta caja'}</div>
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
                {recipes.filter((_, i) => i !== activeIdx).map((r, _, arr) => {
                  const ri = recipes.indexOf(r);
                  return (
                    <button key={r.id} onClick={() => { setActiveIdx(ri); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px 10px 10px', borderRadius: 12, flexShrink: 0,
                      background: theme.bg, border: `1px solid ${theme.line}`,
                      cursor: 'pointer', textAlign: 'left',
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
                      }}>
                        <img src={recipeHero(r.id)} alt={r.title[lang]}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: theme.ink, whiteSpace: 'nowrap', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title[lang]}</div>
                        <div style={{ fontSize: 11, color: theme.muted, fontFamily: theme.mono, marginTop: 2 }}>{r.time}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Footer ──────────────────────────────────────────────── */}
      <div style={{
        padding: '32px 20px 48px',
        textAlign: 'center',
        borderTop: `1px solid ${theme.line}`,
        background: theme.bg,
      }}>
        <LovepacsMark size={36} color={theme.ink} accent={theme.accent} />
        <div style={{ fontSize: 13, color: theme.muted, marginTop: 14, lineHeight: 1.7, maxWidth: 260, margin: '14px auto 0' }}>
          {T.footer}
        </div>
        <div style={{ fontFamily: theme.mono, fontSize: 10, color: theme.line, marginTop: 16, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {T.madeWith}
        </div>
      </div>

    </div>
  );
}

// Small helpers
function PublicSectionLabel({ theme, children }) {
  return (
    <div style={{
      fontFamily: theme.mono, fontSize: 10, color: theme.muted,
      textTransform: 'uppercase', letterSpacing: '0.14em',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <div style={{ width: 20, height: 1, background: theme.line }} />
      {children}
    </div>
  );
}

Object.assign(window, { PublicRecipePage });
