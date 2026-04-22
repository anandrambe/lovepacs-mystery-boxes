// boxes-public.jsx — Public (QR-linked) recipe landing page

function PublicRecipePage({ theme, box, onClose, isPreview = true }) {
  const [lang, setLang] = useState('en');
  const [activeIdx, setActiveIdx] = useState(0);
  if (!box) return null;
  const recipes = (box.recipes || []).map(id => RECIPES.find(r => r.id === id)).filter(Boolean);
  const active = recipes[activeIdx] || recipes[0];
  const steps = active ? active.steps[lang] : [];

  const t = {
    en: {
      kicker: 'Love Box recipes',
      hello: 'In your box',
      intro: "Here are the meals we put together from the ingredients in your Love Box. Everything here cooks on a standard stove — no special equipment needed.",
      contents: 'Contents of your box',
      recipes: 'Recipes in this box',
      ingredients: 'Ingredients',
      steps: 'Cooking instructions',
      notes: 'Serving notes',
      legend_box: 'from your box',
      legend_staple: 'common pantry',
      legend_missing: "you'll need this",
      serves: 'Serves',
      footer: "Questions? Reach out to your local Lovepacs volunteer. Thanks for cooking with us.",
      pickTitle: 'Pick a recipe below to get cooking',
    },
    es: {
      kicker: 'Recetas de Love Box',
      hello: 'En tu caja',
      intro: 'Estas son las comidas que preparamos con los ingredientes de tu Love Box. Todo se cocina en estufa común — sin equipo especial.',
      contents: 'Contenido de tu caja',
      recipes: 'Recetas en esta caja',
      ingredients: 'Ingredientes',
      steps: 'Instrucciones',
      notes: 'Notas de porción',
      legend_box: 'de tu caja',
      legend_staple: 'despensa común',
      legend_missing: 'necesitarás esto',
      serves: 'Porciones',
      footer: '¿Preguntas? Contacta a tu voluntario Lovepacs local. Gracias por cocinar con nosotros.',
      pickTitle: 'Elige una receta para empezar',
    },
  }[lang];

  return (
    <div style={{
      background: theme.bg, minHeight: '100vh',
      padding: '0', fontFamily: theme.body, color: theme.ink,
    }}>
      {/* Staff-only preview bar — only visible inside the staff app */}
      {isPreview && (
        <div style={{
          background: theme.ink, color: theme.paper,
          padding: '10px 24px',
          display: 'flex', alignItems: 'center', gap: 14,
          fontFamily: theme.mono, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em',
        }}>
          <span style={{ opacity: 0.55 }}>Preview · public recipe page</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{getPublicUrl(box.id)}</span>
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={{
            background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
            color: theme.paper, padding: '5px 12px', borderRadius: 6,
            cursor: 'pointer', fontFamily: theme.mono, fontSize: 11,
            textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>Close preview ×</button>
        </div>
      )}

      {/* Mobile-first content centered in a card */}
      <div style={{
        maxWidth: 460, margin: '0 auto', padding: '28px 16px 40px',
      }}>
        <div style={{
          background: theme.paper, borderRadius: 20,
          overflow: 'hidden', border: `1px solid ${theme.line}`,
          boxShadow: '0 20px 60px -28px rgba(0,0,0,0.18)',
        }}>
          {/* Hero */}
          <div style={{
            padding: '22px 22px 26px',
            background: `
              radial-gradient(at 90% 0%, ${theme.soft}, transparent 55%),
              linear-gradient(to bottom, ${theme.paper}, ${theme.bg})
            `,
            borderBottom: `1px solid ${theme.line}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <LovepacsMark size={32} color={theme.ink} accent={theme.accent} />
              <div style={{
                display: 'inline-flex', background: theme.paper, borderRadius: 999, padding: 2,
                border: `1px solid ${theme.line}`,
              }}>
                {['en', 'es'].map(l => (
                  <button key={l} onClick={() => setLang(l)} style={{
                    padding: '4px 12px', borderRadius: 999, border: 'none',
                    background: lang === l ? theme.ink : 'transparent',
                    color: lang === l ? theme.paper : theme.muted,
                    fontFamily: theme.mono, fontSize: 11, textTransform: 'uppercase',
                    letterSpacing: '0.1em', cursor: 'pointer', fontWeight: 600,
                  }}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{
              fontFamily: theme.mono, fontSize: 11, color: theme.muted,
              textTransform: 'uppercase', letterSpacing: '0.14em',
            }}>{t.kicker} · {box.id}</div>
            <div style={{
              fontFamily: theme.display, fontWeight: theme.displayWeight,
              fontSize: 32, letterSpacing: theme.displayTracking, lineHeight: 1.1,
              marginTop: 10, textWrap: 'pretty',
            }}>{t.hello}: {recipes.length} {lang === 'en' ? 'meals' : 'comidas'}</div>
            <div style={{ fontSize: 13.5, color: theme.muted, marginTop: 10, lineHeight: 1.6 }}>
              {t.intro}
            </div>
          </div>

          {/* Contents */}
          <div style={{ padding: '22px 22px 14px' }}>
            <div style={{
              fontFamily: theme.mono, fontSize: 10.5, color: theme.muted,
              textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10,
            }}>{t.contents}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {box.items.map(i => {
                const f = FOOD_CATALOG.find(x => x.id === i.id);
                if (!f) return null;
                return (
                  <span key={i.id} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '4px 10px 4px 6px', borderRadius: 999,
                    background: theme.bg, border: `1px solid ${theme.line}`,
                    fontSize: 12, color: theme.ink,
                  }}>
                    <FoodThumb theme={theme} id={i.id} size={18} />
                    {lang === 'en' ? f.name : f.nameEs} ×{i.qty}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Recipe picker */}
          <div style={{ padding: '14px 22px 0' }}>
            <div style={{
              fontFamily: theme.mono, fontSize: 10.5, color: theme.muted,
              textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10,
            }}>{t.pickTitle}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recipes.map((r, i) => {
                const isActive = i === activeIdx;
                const colors = ['#E9A87A', '#B5C181', '#D8B15E', '#B28A6A'];
                const hero = colors[i % colors.length];
                return (
                  <button key={r.id} onClick={() => setActiveIdx(i)} style={{
                    textAlign: 'left', padding: 0, borderRadius: 12,
                    border: `2px solid ${isActive ? theme.accent : theme.line}`,
                    background: theme.paper, cursor: 'pointer',
                    display: 'flex', alignItems: 'stretch', overflow: 'hidden',
                    transition: 'border-color 140ms ease',
                  }}>
                    <div style={{
                      width: 64, flexShrink: 0,
                      background: `radial-gradient(at 30% 30%, ${hero}ee, ${hero}99 70%)`,
                    }} />
                    <div style={{ padding: '10px 12px', flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: theme.display, fontWeight: theme.displayWeight,
                        fontSize: 15, letterSpacing: theme.displayTracking, lineHeight: 1.2,
                      }}>{r.title[lang]}</div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: theme.mono, fontSize: 10.5, color: theme.muted }}>
                          {r.time} · {t.serves} {r.servings}
                        </span>
                      </div>
                    </div>
                    <div style={{
                      width: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isActive ? theme.accent : theme.muted, fontSize: 16,
                    }}>{isActive ? '●' : '›'}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active recipe body */}
          {active && (
            <div style={{ padding: '22px 22px 24px' }}>
              <div style={{ height: 1, background: theme.line, margin: '0 0 20px' }} />
              <div style={{ fontFamily: theme.mono, fontSize: 10.5, color: theme.accent, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                {String(activeIdx + 1).padStart(2, '0')} · {active.tags[0]}
              </div>
              <div style={{
                fontFamily: theme.display, fontWeight: theme.displayWeight,
                fontSize: 26, letterSpacing: theme.displayTracking, lineHeight: 1.1,
                marginTop: 6, textWrap: 'pretty',
              }}>{active.title[lang]}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                <Chip theme={theme} tone="soft">{active.time}</Chip>
                <Chip theme={theme} tone="soft">{t.serves} {active.servings}</Chip>
                {active.missing && <Chip theme={theme} tone="missing">+ {active.missing[lang]}</Chip>}
              </div>

              {/* Ingredients */}
              <div style={{ marginTop: 20 }}>
                <div style={{
                  fontFamily: theme.mono, fontSize: 10.5, color: theme.muted,
                  textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8,
                }}>{t.ingredients}</div>
                <div style={{ background: theme.bg, border: `1px solid ${theme.line}`, borderRadius: 12, padding: 14 }}>
                  {active.ingredients.map((ing, i) => {
                    const dotColor = ing.source === 'missing' ? '#C24A2C' : ing.source === 'staple' ? theme.muted : theme.accent;
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '7px 0',
                        borderBottom: i < active.ingredients.length - 1 ? `1px dashed ${theme.line}` : 'none',
                      }}>
                        <span style={{ width: 7, height: 7, borderRadius: 999, background: dotColor, flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 13.5, color: theme.ink }}>{ing.name[lang]}</span>
                        <span style={{ fontFamily: theme.mono, fontSize: 12, color: theme.muted }}>{ing.amount[lang]}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{
                  display: 'flex', gap: 12, flexWrap: 'wrap',
                  marginTop: 8, fontSize: 11, color: theme.muted, fontStyle: 'italic',
                }}>
                  <span><span style={{ color: theme.accent }}>●</span> {t.legend_box}</span>
                  <span><span style={{ color: theme.muted }}>●</span> {t.legend_staple}</span>
                  {active.missing && <span><span style={{ color: '#C24A2C' }}>●</span> {t.legend_missing}</span>}
                </div>
              </div>

              {/* Steps */}
              <div style={{ marginTop: 22 }}>
                <div style={{
                  fontFamily: theme.mono, fontSize: 10.5, color: theme.muted,
                  textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10,
                }}>{t.steps}</div>
                <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {steps.map((s, i) => (
                    <li key={i} style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: 999, flexShrink: 0,
                        background: theme.ink, color: theme.paper,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: theme.mono, fontSize: 12, fontWeight: 600,
                      }}>{i + 1}</div>
                      <div style={{ fontSize: 14, lineHeight: 1.55, color: theme.ink, paddingTop: 3, textWrap: 'pretty' }}>
                        {s}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Serving notes */}
              <div style={{
                marginTop: 18, padding: 14, background: theme.soft,
                border: `1px solid ${theme.line}`, borderRadius: 12,
              }}>
                <div style={{
                  fontFamily: theme.mono, fontSize: 10, color: theme.accent,
                  textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6,
                }}>{t.notes}</div>
                <div style={{ fontSize: 13, color: theme.ink, lineHeight: 1.55 }}>
                  {lang === 'en'
                    ? `Serves ${active.servings}. ${active.equipment.en}. Scale down by half for a 2-person portion.`
                    : `Para ${active.servings}. ${active.equipment.es}. Reduzca a la mitad para 2 personas.`}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{
            padding: '18px 22px 22px', borderTop: `1px solid ${theme.line}`, background: theme.bg,
            fontSize: 12, color: theme.muted, lineHeight: 1.5, textAlign: 'center',
          }}>
            <div>{t.footer}</div>
            <div style={{ fontFamily: theme.mono, fontSize: 10, marginTop: 8, letterSpacing: '0.08em' }}>
              {getPublicUrl(box.id)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PublicRecipePage });
