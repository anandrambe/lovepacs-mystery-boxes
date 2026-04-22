// client.jsx — Client mobile view (QR landing, EN/ES)

function ClientApp({ theme, initialLang = 'en' }) {
  const [lang, setLang] = useState(initialLang);
  const [openRecipe, setOpenRecipe] = useState(null);

  useEffect(() => { setLang(initialLang); }, [initialLang]);

  const recipes = RECIPES.slice(0, 3); // the 3 staff-picked

  const T = {
    en: {
      intro: 'Here are your recipes',
      box: 'Box',
      servings: 'Serves',
      tap: 'Tap a recipe to view steps',
      missing: 'This recipe is missing',
      ingredients: 'Ingredients',
      steps: 'Steps',
      box_items: 'from your box',
      staples: 'pantry staples',
      needed: 'you may need',
      back: 'Back to recipes',
    },
    es: {
      intro: 'Aquí están tus recetas',
      box: 'Caja',
      servings: 'Porciones',
      tap: 'Toca una receta para ver los pasos',
      missing: 'A esta receta le falta',
      ingredients: 'Ingredientes',
      steps: 'Pasos',
      box_items: 'de tu caja',
      staples: 'de la despensa',
      needed: 'podrías necesitar',
      back: 'Volver a las recetas',
    },
  }[lang];

  return (
    <IOSDevice width={390} height={820}>
      <div style={{
        minHeight: '100%',
        background: theme.bg, color: theme.ink, fontFamily: theme.body,
        paddingTop: 60,
      }}>
        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '10px 20px', gap: 10,
        }}>
          <LovepacsMark size={22} color={theme.ink} />
          <div style={{
            fontFamily: theme.display, fontSize: 17, fontWeight: theme.displayWeight,
            letterSpacing: theme.displayTracking,
          }}>Lovepacs</div>
          <div style={{ flex: 1 }} />
          <LanguageToggle theme={theme} lang={lang} setLang={setLang} />
        </div>

        {openRecipe ? (
          <RecipeDetail theme={theme} recipe={openRecipe} lang={lang} T={T} onBack={() => setOpenRecipe(null)} />
        ) : (
          <>
            {/* Hero */}
            <div style={{ padding: '18px 20px 8px' }}>
              <div style={{ fontSize: 12, color: theme.muted, fontFamily: theme.mono, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {T.box} · FRISCO · 12/18/2026
              </div>
              <div style={{
                fontFamily: theme.display, fontWeight: theme.displayWeight,
                fontSize: 30, lineHeight: 1.1, letterSpacing: theme.displayTracking,
                marginTop: 10, textWrap: 'pretty',
              }}>{T.intro}</div>
              <div style={{ fontSize: 13, color: theme.muted, marginTop: 8 }}>
                {T.tap}
              </div>
            </div>

            {/* Recipe cards */}
            <div style={{ padding: '16px 20px 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {recipes.map((r, i) => (
                <MobileRecipeCard key={r.id} theme={theme} recipe={r} lang={lang} T={T}
                  onOpen={() => setOpenRecipe(r)} accent={i} />
              ))}
            </div>

            {/* Footer */}
            <div style={{
              padding: '12px 20px 30px',
              fontSize: 11, color: theme.muted, fontFamily: theme.mono,
              textAlign: 'center', lineHeight: 1.5,
              borderTop: `1px solid ${theme.line}`,
            }}>
              lovepacs.org · {lang === 'en' ? 'serving North Texas families' : 'sirviendo a familias del norte de Texas'}
            </div>
          </>
        )}
      </div>
    </IOSDevice>
  );
}

function LanguageToggle({ theme, lang, setLang }) {
  return (
    <div style={{
      display: 'flex', background: theme.paper, borderRadius: 999,
      border: `1px solid ${theme.line}`, padding: 3, fontFamily: theme.mono, fontSize: 11,
    }}>
      {['en','es'].map(l => (
        <button key={l} onClick={() => setLang(l)} style={{
          padding: '5px 12px', borderRadius: 999, border: 'none',
          background: lang === l ? theme.ink : 'transparent',
          color: lang === l ? theme.paper : theme.muted,
          cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em',
          fontWeight: 600,
        }}>{l}</button>
      ))}
    </div>
  );
}

function MobileRecipeCard({ theme, recipe, lang, T, onOpen, accent }) {
  const colors = ['#E9A87A', '#B5C181', '#D8B15E'];
  const c = colors[accent % colors.length];
  return (
    <div onClick={onOpen} style={{
      background: theme.paper, borderRadius: 16,
      border: `1px solid ${theme.line}`,
      overflow: 'hidden', cursor: 'pointer',
      boxShadow: '0 1px 0 rgba(0,0,0,0.02)',
    }}>
      <div style={{
        height: 96,
        background: `
          radial-gradient(at 30% 40%, ${c}ee, ${c}99 70%),
          repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0 8px, transparent 8px 16px)
        `,
        position: 'relative',
        display: 'flex', alignItems: 'flex-end', padding: 12,
      }}>
        <div style={{
          fontFamily: theme.mono, fontSize: 10, color: 'rgba(255,255,255,0.85)',
          textTransform: 'uppercase', letterSpacing: '0.1em',
        }}>{recipe.tags[2]}</div>
      </div>
      <div style={{ padding: 14 }}>
        <div style={{
          fontFamily: theme.display, fontWeight: theme.displayWeight,
          fontSize: 17, lineHeight: 1.2, letterSpacing: theme.displayTracking, textWrap: 'pretty',
        }}>{recipe.title[lang]}</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          <Chip theme={theme} tone="soft">{Icon.clock(theme.muted)} {recipe.time}</Chip>
          <Chip theme={theme} tone="soft">{T.servings} {recipe.servings}</Chip>
          {recipe.missing && <Chip theme={theme} tone="missing">+ {recipe.missing[lang]}</Chip>}
        </div>
      </div>
    </div>
  );
}

function RecipeDetail({ theme, recipe, lang, T, onBack }) {
  const box = recipe.ingredients.filter(i => i.source === 'box');
  const staple = recipe.ingredients.filter(i => i.source === 'staple');
  const missing = recipe.ingredients.filter(i => i.source === 'missing');
  return (
    <div style={{ padding: '6px 0 40px' }}>
      <button onClick={onBack} style={{
        margin: '4px 16px 14px', padding: '8px 12px', borderRadius: 999,
        background: theme.paper, border: `1px solid ${theme.line}`, color: theme.ink,
        fontFamily: theme.body, fontSize: 13, cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 6,
      }}>← {T.back}</button>

      <div style={{ padding: '0 20px' }}>
        <div style={{
          fontFamily: theme.display, fontWeight: theme.displayWeight,
          fontSize: 26, lineHeight: 1.15, letterSpacing: theme.displayTracking, textWrap: 'pretty',
        }}>{recipe.title[lang]}</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          <Chip theme={theme} tone="soft">{Icon.clock(theme.muted)} {recipe.time}</Chip>
          <Chip theme={theme} tone="soft">{T.servings} {recipe.servings}</Chip>
          <Chip theme={theme} tone="soft">{recipe.equipment[lang]}</Chip>
        </div>

        {recipe.missing && (
          <div style={{
            marginTop: 14, padding: 12, borderRadius: 12,
            background: '#FCE6D4', color: '#8B3A12', fontSize: 13, lineHeight: 1.5,
          }}>
            <strong>{T.missing}:</strong> {recipe.missing[lang]}.
          </div>
        )}

        <div style={{ marginTop: 22 }}>
          <div style={{ fontFamily: theme.mono, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: theme.muted }}>{T.ingredients}</div>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 0 }}>
            {box.map((i, idx) => <IngredientRow key={idx} theme={theme} i={i} lang={lang} tone="box" label={T.box_items} />)}
            {staple.map((i, idx) => <IngredientRow key={`s${idx}`} theme={theme} i={i} lang={lang} tone="staple" label={T.staples} />)}
            {missing.map((i, idx) => <IngredientRow key={`m${idx}`} theme={theme} i={i} lang={lang} tone="missing" label={T.needed} />)}
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <div style={{ fontFamily: theme.mono, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: theme.muted }}>{T.steps}</div>
          <ol style={{ margin: '12px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {recipe.steps[lang].map((s, i) => (
              <li key={i} style={{ display: 'flex', gap: 12 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 999, flexShrink: 0,
                  background: theme.soft, color: theme.ink,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: theme.mono, fontSize: 12, fontWeight: 600,
                }}>{i + 1}</div>
                <div style={{ fontSize: 14.5, lineHeight: 1.5 }}>{s}</div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

function IngredientRow({ theme, i, lang, tone, label }) {
  const tones = {
    box: { dot: theme.green },
    staple: { dot: theme.muted },
    missing: { dot: '#8B3A12' },
  };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 0', borderBottom: `1px solid ${theme.line}`,
      fontSize: 14,
    }}>
      <div style={{ width: 7, height: 7, borderRadius: 999, background: tones[tone].dot, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>{i.name[lang]}</div>
      <div style={{ color: theme.muted, fontFamily: theme.mono, fontSize: 12 }}>{i.amount[lang]}</div>
    </div>
  );
}

Object.assign(window, { ClientApp });
