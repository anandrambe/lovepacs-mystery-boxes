// boxes-public.jsx — Public (QR-linked) recipe landing page — mobile-first, two-screen nav

// ─────────────────────────────────────────────────────────────
// Live backend
// ─────────────────────────────────────────────────────────────
const API_BASE_PUBLIC = 'https://lovepacs.up.railway.app';

// Normalize backend Recipe domain object → frontend recipe shape.
// Supports bilingual output: Spanish fields from Gemini are persisted in DB
// and returned in the API response.
function normalizeApiRecipeForPublic(r) {
  function parseSteps(raw) {
    if (!raw) return [];
    const lines = raw.split(/\n+/).map(s => s.trim()).filter(Boolean);
    if (lines.length > 1) return lines.map(s => s.replace(/^\d+[\.\)\-]\s*/, '')).filter(Boolean);
    const parts = raw.split(/(?<=[.!?])\s+(?=[A-ZÀ-ÿ])/);
    return parts.length > 1 ? parts : (raw ? [raw] : []);
  }

  const stepsEn = parseSteps((r.instructions || '').trim());
  const stepsEs = parseSteps((r.instructions_es || '').trim());

  const ingredients = (r.ingredients || []).map(ing => ({
    name:   { en: ing.name, es: ing.name_es || ing.name },
    amount: {
      en: [ing.amount, ing.unit].filter(Boolean).join(' '),
      es: [ing.amount, ing.unit].filter(Boolean).join(' '),
    },
    source: ing.is_staple ? 'staple' : 'box',
  }));
  const missing = r.missing_items || [];
  return {
    id:            r.id,
    title:         { en: r.name || 'Recipe', es: r.name_es || r.name || 'Receta' },
    time:          r.cook_time || r.time || '30 min',
    servings:      r.servings  || 4,
    tags:          ['Home-cooked', ...(r.allergy_tags || []).slice(0, 2)],
    equipment:     { en: r.equipment || 'stovetop', es: r.equipment_es || r.equipment || 'estufa' },
    missing:       missing.length > 0 ? { en: missing[0], es: missing[0] } : null,
    imageKeywords: r.image_keywords || '',
    ingredients,
    steps: {
      en: stepsEn.length ? stepsEn : ['Follow the recipe instructions.'],
      es: stepsEs.length ? stepsEs : (stepsEn.length ? stepsEn : ['Siga las instrucciones de la receta.']),
    },
  };
}

// recipeHero — delegates to shared recipeHeroUrl which uses the full recipe
// object for keyword matching. Accepts either a recipe object or a bare id
// string (legacy path — falls back to hash-based local asset).
function recipeHero(recipeOrId) {
  if (recipeOrId && typeof recipeOrId === 'object') return recipeHeroUrl(recipeOrId);
  // bare id — build a minimal stub so recipeHeroUrl can still hash-fallback
  return recipeHeroUrl({ id: recipeOrId || '', title: {}, tags: [], ingredients: [] });
}

function PublicRecipePage({ theme, box, onClose, isPreview = true }) {
  const [lang, setLang]           = useState('en');
  const [screen, setScreen]       = useState('home');
  const [activeIdx, setActiveIdx] = useState(0);
  const [apiData, setApiData]     = useState(null);   // { recipes, items } from live API
  const [apiLoading, setApiLoading] = useState(false);
  if (!box) return null;

  // Fetch live data from Railway backend on mount
  useEffect(() => {
    const fetchLive = async () => {
      setApiLoading(true);
      try {
        const [boxRes, recipesRes] = await Promise.all([
          fetch(`${API_BASE_PUBLIC}/api/v1/boxes/${box.id}`),
          fetch(`${API_BASE_PUBLIC}/api/v1/boxes/${box.id}/recipes?selected=true`),
        ]);
        if (!boxRes.ok || !recipesRes.ok) return;
        const [boxData, recipesData] = await Promise.all([boxRes.json(), recipesRes.json()]);
        const liveRecipes = (recipesData.recipes || []).map(normalizeApiRecipeForPublic);
        // Always set apiData when the API responds successfully — even when 0 selected
        // recipes are returned. This prevents the static fallback (which lists all 4
        // demo recipes) from incorrectly appearing for real boxes where the staff
        // simply hasn't made a selection yet.
        const liveItems = (boxData.items || []).map(it => ({
          id: it.id, name: it.name, measure: it.measure, qty: it.quantity,
        }));
        setApiData({ recipes: liveRecipes, items: liveItems });
      } catch (_) {
        // Silently fall back to static embedded data
      } finally {
        setApiLoading(false);
      }
    };
    fetchLive();
  }, [box.id]);

  // Prefer live API data; fall back to data embedded in the box object
  const recipes = apiData
    ? apiData.recipes
    : (box.recipes || []).map(r => {
        if (r && typeof r === 'object') return r;
        return RECIPES.find(x => x.id === r);
      }).filter(Boolean);

  const boxItems = apiData ? apiData.items : (box.items || []);

  const active  = recipes[activeIdx] || recipes[0];

  const T = {
    en: {
      kicker:        'Your Love Box',
      subtitle:      n => `${n} meal${n !== 1 ? 's' : ''} ready to cook`,
      intro:         "Everything cooks on a regular stovetop — no special equipment needed.",
      contents:      "What's in your box",
      menuTitle:     'Your meals',
      ingredients:   'Ingredients',
      steps:         'How to cook it',
      notes:         'Serving notes',
      back:          '← Back to meals',
      legend_box:    'in your box',
      legend_staple: 'pantry staple',
      legend_missing:"you'll need this",
      serves:        'Serves',
      footer:        "Questions? Your local Lovepacs volunteer is happy to help.",
      madeWith:      "Made with love.",
    },
    es: {
      kicker:        'Tu Love Box',
      subtitle:      n => `${n} comida${n !== 1 ? 's' : ''} lista${n !== 1 ? 's' : ''} para cocinar`,
      intro:         'Todo se cocina en estufa común — sin equipo especial.',
      contents:      'Qué hay en tu caja',
      menuTitle:     'Tus comidas',
      ingredients:   'Ingredientes',
      steps:         'Cómo cocinarlo',
      notes:         'Notas',
      back:          '← Volver a las comidas',
      legend_box:    'en tu caja',
      legend_staple: 'despensa común',
      legend_missing:'necesitarás esto',
      serves:        'Porciones',
      footer:        '¿Preguntas? Tu voluntario Lovepacs local estará encantado de ayudarte.',
      madeWith:      'Hecho con amor.',
    },
  }[lang];

  const openRecipe = (idx) => {
    setActiveIdx(idx);
    setScreen('recipe');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goHome = () => {
    setScreen('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ background: theme.bg, minHeight: '100vh', fontFamily: theme.body, color: theme.ink }}>

      {/* ── Staff preview bar ──────────────────────────────────── */}
      {isPreview && (
        <div style={{
          background: theme.ink, color: theme.paper,
          padding: '10px 20px',
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
          fontFamily: theme.mono, fontSize: 11,
          textTransform: 'uppercase', letterSpacing: '0.1em',
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

      {/* ── Sticky header ──────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: theme.paper, borderBottom: `1px solid ${theme.line}`,
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {screen === 'recipe' ? (
          <button onClick={goHome} style={{
            background: 'none', border: 'none', padding: '4px 0',
            fontFamily: theme.body, fontSize: 14, fontWeight: 600,
            color: theme.accent, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {T.back}
          </button>
        ) : (
          <LovepacsLogo height={28} />
        )}
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

      {/* ══════════════════════════════════════════════════════════
          HOME SCREEN
      ══════════════════════════════════════════════════════════ */}
      {screen === 'home' && (
        <>
          {/* Hero */}
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
              fontSize: 34, letterSpacing: theme.displayTracking, lineHeight: 1.05, marginBottom: 10,
            }}>
              {apiLoading && recipes.length === 0
                ? 'Loading your meals…'
                : T.subtitle(recipes.length)}
            </div>
            <div style={{ fontSize: 15, color: theme.muted, lineHeight: 1.65 }}>
              {T.intro}
            </div>
          </div>

          {/* Recipe list */}
          <div style={{ padding: '24px 20px', background: theme.bg }}>
            <div style={{
              fontFamily: theme.mono, fontSize: 10, color: theme.muted,
              textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14,
            }}>{T.menuTitle}</div>

            {/* When the API responded but no recipes are selected yet, show a
                friendly waiting state rather than a blank page. */}
            {!apiLoading && apiData && recipes.length === 0 && (
              <div style={{
                textAlign: 'center', padding: '40px 20px',
                borderRadius: 16, background: theme.paper,
                border: `1px solid ${theme.line}`,
              }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>👩‍🍳</div>
                <div style={{
                  fontFamily: theme.display, fontWeight: theme.displayWeight,
                  fontSize: 20, letterSpacing: theme.displayTracking,
                }}>
                  {lang === 'es' ? 'Recetas en camino…' : 'Recipes coming soon…'}
                </div>
                <div style={{ fontSize: 13, color: theme.muted, marginTop: 8, lineHeight: 1.6 }}>
                  {lang === 'es'
                    ? 'Tu voluntario Lovepacs aún está seleccionando las recetas para esta caja. ¡Vuelve pronto!'
                    : 'Your Lovepacs volunteer is still selecting recipes for this box. Check back soon!'}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recipes.map((r, i) => (
                <button key={r.id} onClick={() => openRecipe(i)} style={{
                  display: 'flex', alignItems: 'stretch',
                  background: theme.paper, border: `1px solid ${theme.line}`,
                  borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                  textAlign: 'left', padding: 0,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'transform 100ms ease, box-shadow 100ms ease',
                }}
                  onTouchStart={e => e.currentTarget.style.transform = 'scale(0.985)'}
                  onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {/* Photo */}
                  <div style={{ width: 100, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={recipeHero(r)}
                      alt={r.title[lang]}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to right, transparent 60%, rgba(0,0,0,0.08))',
                    }} />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, padding: '16px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, minWidth: 0 }}>
                    <div style={{
                      fontFamily: theme.mono, fontSize: 10, color: theme.muted,
                      textTransform: 'uppercase', letterSpacing: '0.1em',
                    }}>
                      {String(i + 1).padStart(2, '0')} · {r.tags[0]}
                    </div>
                    <div style={{
                      fontFamily: theme.display, fontWeight: theme.displayWeight,
                      fontSize: 17, letterSpacing: theme.displayTracking, lineHeight: 1.2,
                      color: theme.ink,
                    }}>{r.title[lang]}</div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: theme.muted, fontFamily: theme.mono }}>
                        ⏱ {r.time}
                      </span>
                      <span style={{ fontSize: 12, color: theme.muted, fontFamily: theme.mono }}>
                        👤 {T.serves} {r.servings}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div style={{
                    width: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: theme.muted, flexShrink: 0,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* What's in your box — clean list */}
          <div style={{ padding: '24px 20px', background: theme.paper, borderTop: `1px solid ${theme.line}` }}>
            <PublicSectionLabel theme={theme}>{T.contents}</PublicSectionLabel>
            <div style={{
              marginTop: 12, borderRadius: 14, overflow: 'hidden',
              border: `1px solid ${theme.line}`,
            }}>
              {boxItems.map((i, idx) => {
                const f = FOOD_CATALOG.find(x => x.id === i.id);
                // API items have a name field; static items look up via FOOD_CATALOG
                const displayName = f
                  ? (lang === 'en' ? f.name : f.nameEs)
                  : (i.name || i.id);
                const qty = i.qty ?? i.quantity ?? 1;
                return (
                  <div key={i.id || idx} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 16px', background: theme.paper,
                    borderBottom: idx < boxItems.length - 1 ? `1px solid ${theme.line}` : 'none',
                    minHeight: 52,
                  }}>
                    <FoodThumb theme={theme} id={i.id} size={28} />
                    <span style={{ flex: 1, fontSize: 15, color: theme.ink }}>
                      {displayName}
                    </span>
                    <span style={{
                      fontFamily: theme.mono, fontSize: 13, color: theme.muted,
                      background: theme.bg, padding: '3px 10px', borderRadius: 999,
                      border: `1px solid ${theme.line}`,
                    }}>×{qty}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div style={{
            padding: '32px 20px 48px', textAlign: 'center',
            borderTop: `1px solid ${theme.line}`, background: theme.bg,
          }}>
            <LovepacsMark size={36} color={theme.ink} accent={theme.accent} />
            <div style={{ fontSize: 13, color: theme.muted, marginTop: 14, lineHeight: 1.7, maxWidth: 260, margin: '14px auto 0' }}>
              {T.footer}
            </div>
            <div style={{ fontFamily: theme.mono, fontSize: 10, color: theme.line, marginTop: 16, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {T.madeWith}
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════
          RECIPE DETAIL SCREEN
      ══════════════════════════════════════════════════════════ */}
      {screen === 'recipe' && active && (() => {
        const steps = active.steps[lang];
        return (
          <div>
            {/* Full-bleed photo hero */}
            <div style={{ position: 'relative', height: 240, overflow: 'hidden', background: theme.soft }}>
              <img
                src={recipeHero(active)}
                alt={active.title[lang]}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)',
              }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 20px 22px' }}>
                <div style={{
                  fontFamily: theme.mono, fontSize: 10, color: 'rgba(255,255,255,0.65)',
                  textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6,
                }}>{String(activeIdx + 1).padStart(2, '0')} · {active.tags[0]}</div>
                <div style={{
                  fontFamily: theme.display, fontWeight: theme.displayWeight,
                  fontSize: 28, letterSpacing: theme.displayTracking,
                  color: '#fff', lineHeight: 1.15,
                }}>{active.title[lang]}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  {[
                    `⏱ ${active.time}`,
                    `👤 ${T.serves} ${active.servings}`,
                    ...(active.missing ? [`+ ${active.missing[lang]}`] : []),
                  ].map((label, i) => (
                    <span key={i} style={{
                      background: i === 2 ? 'rgba(194,74,44,0.85)' : 'rgba(255,255,255,0.18)',
                      backdropFilter: 'blur(4px)',
                      color: '#fff', padding: '5px 12px', borderRadius: 999,
                      fontSize: 12, fontFamily: theme.mono,
                    }}>{label}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div style={{ padding: '24px 20px 0', background: theme.paper }}>
              <PublicSectionLabel theme={theme}>{T.ingredients}</PublicSectionLabel>
              <div style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${theme.line}`, marginTop: 12 }}>
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
                      <span style={{ width: 8, height: 8, borderRadius: 999, background: dotColor, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 15, color: theme.ink, lineHeight: 1.4 }}>
                        {ing.name[lang]}
                      </span>
                      <span style={{ fontFamily: theme.mono, fontSize: 13, color: theme.muted }}>
                        {ing.amount[lang]}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: theme.muted, fontStyle: 'italic', flexWrap: 'wrap' }}>
                <span><span style={{ color: theme.accent }}>●</span> {T.legend_box}</span>
                <span><span style={{ color: theme.muted }}>●</span> {T.legend_staple}</span>
                {active.missing && <span><span style={{ color: '#C24A2C' }}>●</span> {T.legend_missing}</span>}
              </div>
            </div>

            {/* Steps */}
            <div style={{ padding: '24px 20px 0', background: theme.paper }}>
              <PublicSectionLabel theme={theme}>{T.steps}</PublicSectionLabel>
              <ol style={{ margin: '14px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 18 }}>
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

            {/* Back to meals CTA */}
            <div style={{ padding: '0 20px 40px', background: theme.paper, borderTop: `1px solid ${theme.line}` }}>
              <button onClick={goHome} style={{
                width: '100%', padding: '16px', marginTop: 24,
                background: theme.ink, color: theme.paper, border: 'none',
                borderRadius: 14, fontFamily: theme.body, fontSize: 15,
                fontWeight: 600, cursor: 'pointer', letterSpacing: '-0.01em',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {T.back}
              </button>
            </div>
          </div>
        );
      })()}

    </div>
  );
}

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
