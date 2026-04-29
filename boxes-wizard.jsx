// boxes-wizard.jsx — Create a new Mystery Box (4-step wizard)
// Flow: 1) Inventory (catalog + cart)  2) Recipes  3) Finalize  4) Box identity

// ─────────────────────────────────────────────────────────────
// Live backend — Gemini recipe generation via Railway
// ─────────────────────────────────────────────────────────────
const API_BASE = 'https://lovepacs.up.railway.app';

// Convert the backend's Recipe domain object into the UI recipe shape.
// Supports bilingual output: Spanish fields (name_es, instructions_es,
// equipment_es, ingredient name_es) are provided by Gemini and persist in DB.
function normalizeApiRecipe(r) {
  function parseSteps(raw) {
    if (!raw) return [];
    const lines = raw.split(/\n+/).map(s => s.trim()).filter(Boolean);
    if (lines.length > 1) return lines.map(s => s.replace(/^\d+[\.\)\-]\s*/, '')).filter(Boolean);
    // Sentence-split fallback (handles both English & Spanish sentence endings)
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

function BoxWizard({ theme, onCancel, onSave }) {
  const [step, setStep] = useState(1);
  const [finalizedBox, setFinalizedBox] = useState(null);
  // Identity moved to step 4
  const [region, setRegion] = useState('Frisco');
  const [address, setAddress] = useState('');
  const [event, setEvent] = useState('Standard packs');
  const [dispatchDate, setDispatchDate] = useState('2026-04-25');
  const [families, setFamilies] = useState(16);
  const [meals4p, setMeals4p] = useState(3);
  const [meals2p, setMeals2p] = useState(1);
  const [boxLabel, setBoxLabel] = useState('');
  const [boxNotes, setBoxNotes] = useState('');

  // Inventory
  const [items, setItems] = useState([
    { id: 'spaghetti', qty: 1 }, { id: 'marinara', qty: 1 },
    { id: 'blackbeans', qty: 2 }, { id: 'ricewhite', qty: 1 },
    { id: 'cornkernels', qty: 1 }, { id: 'chickenbroth', qty: 1 },
  ]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  // Recipes
  const [generating, setGenerating] = useState(false);
  const [candidates, setCandidates] = useState(null);
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [cuisine, setCuisine] = useState(null);
  const [dietary, setDietary] = useState(null);
  const [timePref, setTimePref] = useState(null);
  const [custom, setCustom] = useState('');
  const [detailRecipeId, setDetailRecipeId] = useState(null);

  // API state — tracks the backend box ID so we can re-generate and select
  const [apiBoxId, setApiBoxId] = useState(null);
  const [apiError, setApiError] = useState(null);

  // Look up a recipe by ID: check live candidates first, then static RECIPES
  const getRecipeObj = (id) => {
    if (candidates) {
      const c = candidates.find(r => r.id === id);
      if (c) return c;
    }
    return RECIPES.find(r => r.id === id);
  };

  const stock = {
    spaghetti: 184, marinara: 212, tuna: 96, blackbeans: 340, ricewhite: 142,
    cornkernels: 228, chickenbroth: 76, tomatoes: 198, peanutbutter: 54, oats: 120,
    peaches: 88, cornmeal: 64,
  };

  const addItem = (id) => setItems(is => {
    const e = is.find(i => i.id === id);
    if (e) {
      const avail = stock[id] || 0;
      if (e.qty >= avail) return is;
      return is.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i);
    }
    return [...is, { id, qty: 1 }];
  });
  const setQty = (id, qty) => setItems(is => is.map(i => i.id === id ? { ...i, qty: Math.max(0, Math.min(stock[id] || 0, qty)) } : i).filter(i => i.qty > 0));
  const removeItem = (id) => setItems(is => is.filter(i => i.id !== id));

  const generate = async () => {
    setGenerating(true);
    setApiError(null);
    setStep(2);

    try {
      // Build item list using FOOD_CATALOG names (what the AI needs to reason about)
      const apiItems = items.map(i => {
        const f = FOOD_CATALOG.find(x => x.id === i.id);
        return { name: f ? f.name : i.id, measure: f ? f.measure : '', quantity: i.qty };
      });

      // 1 — Create box in backend
      const boxRes = await fetch(`${API_BASE}/api/v1/boxes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dispatchDate || new Date().toISOString().slice(0, 10),
          event_name: event || 'standard',
          warehouse: region,
          servings: Math.max(families, 1),
          items: apiItems,
        }),
      });
      if (!boxRes.ok) throw new Error(`Box creation: ${boxRes.status}`);
      const boxData = await boxRes.json();
      setApiBoxId(boxData.id);

      // 2 — Generate recipes with Gemini
      const genRes = await fetch(`${API_BASE}/api/v1/boxes/${boxData.id}/recipes/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cuisine_type: cuisine || '',
          language: 'en',
          allergies: [],
          system_prompt: custom || '',
        }),
      });
      if (!genRes.ok) throw new Error(`Recipe generation: ${genRes.status}`);
      const genData = await genRes.json();
      const normalized = (genData.recipes || []).slice(0, 4).map(normalizeApiRecipe);
      if (normalized.length === 0) throw new Error('No recipes returned from API');

      setCandidates(normalized);
      setSelectedRecipes([normalized[0]?.id, normalized[2]?.id].filter(Boolean));
    } catch (err) {
      console.warn('API error — falling back to static recipes:', err.message);
      setApiError(err.message);
      // Graceful fallback to static recipe set
      let rset = RECIPES.slice(0, 4);
      if (dietary === 'Vegetarian') rset = rset.filter(r => !r.ingredients.some(i => i.name.en.toLowerCase().includes('tuna')));
      if (timePref === 'Under 30 min') rset = rset.filter(r => parseInt(r.time) < 30);
      if (rset.length < 4) rset = RECIPES.slice(0, 4);
      const four = rset.slice(0, 4);
      setCandidates(four);
      setSelectedRecipes([four[0]?.id, four[2]?.id].filter(Boolean));
    } finally {
      setGenerating(false);
    }
  };

  const toggleRecipe = (id) => setSelectedRecipes(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const regenerate = async () => {
    setGenerating(true);
    setCandidates(null);

    try {
      if (!apiBoxId) throw new Error('No API box to regenerate for');

      const genRes = await fetch(`${API_BASE}/api/v1/boxes/${apiBoxId}/recipes/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cuisine_type: cuisine || '',
          language: 'en',
          allergies: [],
          system_prompt: custom || '',
        }),
      });
      if (!genRes.ok) throw new Error(`Regenerate: ${genRes.status}`);
      const data = await genRes.json();
      const normalized = (data.recipes || []).slice(0, 4).map(normalizeApiRecipe);
      if (normalized.length === 0) throw new Error('No recipes');
      setCandidates(normalized);
      setSelectedRecipes([normalized[0]?.id, normalized[2]?.id].filter(Boolean));
    } catch (err) {
      console.warn('Regenerate fallback:', err.message);
      const rset = [...RECIPES].reverse().slice(0, 4);
      setCandidates(rset);
      setSelectedRecipes([rset[0]?.id, rset[2]?.id].filter(Boolean));
    } finally {
      setGenerating(false);
    }
  };

  const finalize = async () => {
    // Prefer the API-generated box ID (e.g. 20260428_spring_frisco)
    const yr  = new Date().getFullYear();
    const wh  = warehouseCode(region || 'Frisco');
    const seq = String(LOVE_BOXES.filter(b => b.id.startsWith(`LB-${yr}-${wh}-`)).length + 1).padStart(4, '0');
    const id  = apiBoxId || boxLabel.trim() || `LB-${yr}-${wh}-${seq}`;

    // Persist the staff's recipe selection to the backend.
    // NOTE: fetch() only throws on network failure, NOT on 4xx/5xx HTTP errors,
    // so we must explicitly check res.ok to catch server-side failures.
    if (apiBoxId && selectedRecipes.length > 0) {
      try {
        const selectRes = await fetch(`${API_BASE}/api/v1/boxes/${apiBoxId}/recipes/select`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipe_ids: selectedRecipes }),
        });
        if (!selectRes.ok) {
          throw new Error(`Recipe select returned HTTP ${selectRes.status}`);
        }
      } catch (e) {
        console.warn('Recipe select API error (QR page may not reflect selection):', e.message);
        // Surface the warning but don't block finalization —
        // the box is created; staff can re-select later if needed.
        setApiError(`Warning: recipe selection may not have saved (${e.message}). The QR page will show all recipes until this is resolved.`);
      }
    }

    // Store full recipe objects so the QR page can render without an extra fetch
    const recipeObjs = selectedRecipes
      .map(rid => getRecipeObj(rid))
      .filter(Boolean);

    const box = {
      id, region, address: address || '—', event, dispatchDate,
      families, meals4p, meals2p,
      recipesCount: recipeObjs.length,
      status: 'Finalized',
      items, recipes: recipeObjs,
      notes: boxNotes, printed: false,
    };
    onSave(box);
    setFinalizedBox(box);
    setStep(5);
  };

  const titleMap = {
    1: 'Select inventory',
    2: 'Pick the recipes',
    3: 'Finalize',
    4: 'Preview & confirm',
  };

  // Step 5: label print screen — full takeover, no wizard chrome
  if (step === 5 && finalizedBox) {
    return <LabelScreen theme={theme} box={finalizedBox} onDone={onCancel} />;
  }

  return (
    <div style={{ padding: '28px 36px 48px', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <button onClick={onCancel} style={{
          background: 'transparent', border: `1px solid ${theme.line}`,
          borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
          fontFamily: theme.body, fontSize: 13, color: theme.muted,
        }}>← Cancel</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: theme.mono }}>
            New Love Box · Step {step} of 4 {step === 1 && '· Select'}
          </div>
          <div style={{
            fontFamily: theme.display, fontWeight: theme.displayWeight,
            fontSize: 28, letterSpacing: theme.displayTracking, lineHeight: 1.1,
          }}>{titleMap[step]}</div>
        </div>
        <WizardStepper theme={theme} step={step} />
      </div>

      {step === 1 && (
        <Step1Inventory
          theme={theme} items={items} stock={stock}
          addItem={addItem} setQty={setQty} removeItem={removeItem}
          query={query} setQuery={setQuery}
          category={category} setCategory={setCategory}
          onNext={generate} />
      )}

      {step === 2 && (
        <Step2Recipes
          theme={theme} generating={generating} candidates={candidates}
          selected={selectedRecipes} toggleRecipe={toggleRecipe}
          cuisine={cuisine} setCuisine={setCuisine}
          dietary={dietary} setDietary={setDietary}
          timePref={timePref} setTimePref={setTimePref}
          custom={custom} setCustom={setCustom}
          onRegenerate={regenerate}
          onDetail={setDetailRecipeId}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
          items={items} />
      )}

      {step === 3 && (
        <Step3Finalize
          theme={theme}
          region={region} setRegion={setRegion}
          address={address} setAddress={setAddress}
          event={event} setEvent={setEvent}
          dispatchDate={dispatchDate} setDispatchDate={setDispatchDate}
          families={families} setFamilies={setFamilies}
          meals4p={meals4p} setMeals4p={setMeals4p}
          meals2p={meals2p} setMeals2p={setMeals2p}
          boxLabel={boxLabel} setBoxLabel={setBoxLabel}
          boxNotes={boxNotes} setBoxNotes={setBoxNotes}
          items={items}
          selectedRecipes={selectedRecipes.map(id => getRecipeObj(id)).filter(Boolean)}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)} />
      )}

      {step === 4 && (
        <Step4Preview
          theme={theme}
          region={region} address={address} event={event}
          dispatchDate={dispatchDate} families={families}
          meals4p={meals4p} meals2p={meals2p}
          boxLabel={boxLabel} boxNotes={boxNotes}
          items={items}
          selectedRecipes={selectedRecipes.map(id => getRecipeObj(id)).filter(Boolean)}
          onBack={() => setStep(3)} onFinalize={finalize} />
      )}

      {detailRecipeId && (
        <RecipeDetailSubPanel theme={theme}
          recipe={getRecipeObj(detailRecipeId)}
          onClose={() => setDetailRecipeId(null)} />
      )}
    </div>
  );
}

function WizardStepper({ theme, step }) {
  const labels = ['Select', 'Recipes', 'Finalize', 'Preview'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {labels.map((l, i) => {
        const idx = i + 1, done = idx < step, current = idx === step;
        return (
          <React.Fragment key={l}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 12px', borderRadius: 8,
              background: current ? theme.ink : 'transparent',
              color: current ? theme.paper : (done ? theme.ink : theme.muted),
              border: done ? `1px solid ${theme.line}` : 'none',
              fontFamily: theme.mono, fontSize: 11,
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              <span style={{ opacity: 0.7 }}>{idx}</span>
              <span>{l}</span>
            </div>
            {i < labels.length - 1 && <div style={{ width: 12, height: 1, background: theme.line }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Step 1: Inventory catalog + cart ──────────────────────────────────────
function Step1Inventory({
  theme, items, stock, addItem, setQty, removeItem,
  query, setQuery, category, setCategory, onNext,
}) {
  const categories = useMemo(() => {
    const set = new Set(['All']);
    FOOD_CATALOG.forEach(f => set.add(f.category));
    return Array.from(set);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FOOD_CATALOG.filter(f => {
      if (category !== 'All' && f.category !== category) return false;
      if (q && !(f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [query, category]);

  const cartCount = items.reduce((a, i) => a + i.qty, 0);
  const canNext = items.length >= 2;

  return (
    <div style={{
      background: theme.paper, border: `1px solid ${theme.line}`, borderRadius: 16,
      display: 'grid', gridTemplateColumns: '1fr 380px',
      alignItems: 'start',
    }}>
      {/* LEFT — Catalog listing */}
      <div style={{
        padding: 24, borderRight: `1px solid ${theme.line}`,
        display: 'flex', flexDirection: 'column', minHeight: 620,
        borderTopLeftRadius: 16, borderBottomLeftRadius: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{
            fontFamily: theme.display, fontWeight: theme.displayWeight,
            fontSize: 20, letterSpacing: theme.displayTracking,
          }}>Warehouse inventory</div>
          <div style={{ fontSize: 12, color: theme.muted }}>
            {filtered.length} of {FOOD_CATALOG.length} items
          </div>
        </div>

        {/* Search + categories */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '0 14px', height: 44, marginBottom: 10,
          border: `1px solid ${theme.line}`, borderRadius: 12, background: theme.bg,
        }}>
          {Icon.search(theme.muted)}
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search inventory — e.g. rice, beans, oats…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: theme.body, fontSize: 14, color: theme.ink }} />
          {query && <button onClick={() => setQuery('')} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: theme.muted, padding: 4,
          }}>{Icon.close(theme.muted)}</button>}
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {categories.map(c => {
            const active = c === category;
            return (
              <button key={c} onClick={() => setCategory(c)} style={{
                padding: '5px 11px', borderRadius: 999,
                border: `1px solid ${active ? theme.ink : theme.line}`,
                background: active ? theme.ink : 'transparent',
                color: active ? theme.paper : theme.ink,
                fontFamily: theme.body, fontSize: 12, fontWeight: 500,
                cursor: 'pointer',
              }}>{c}</button>
            );
          })}
        </div>

        {/* Listing */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filtered.map(f => {
              const avail = stock[f.id] || 0;
              const inCart = items.find(i => i.id === f.id);
              const qty = inCart ? inCart.qty : 0;
              const maxed = qty >= avail;
              const lowStock = avail < 80;
              return (
                <div key={f.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 10,
                  border: `1px solid ${inCart ? theme.accent : theme.line}`,
                  background: inCart ? theme.soft : theme.paper,
                  transition: 'border-color 140ms, background 140ms',
                }}>
                  <FoodThumb theme={theme} id={f.id} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: theme.ink,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</div>
                    <div style={{ fontSize: 11.5, color: theme.muted, display: 'flex', gap: 10 }}>
                      <span>{f.measure}</span>
                      <span style={{ opacity: 0.4 }}>·</span>
                      <span>{f.category}</span>
                    </div>
                  </div>
                  <div style={{
                    fontFamily: theme.mono, fontSize: 11,
                    color: lowStock ? '#C24A2C' : theme.muted, fontWeight: 500,
                    whiteSpace: 'nowrap',
                  }}>
                    {qty > 0 && <span style={{ color: theme.accent, fontWeight: 600 }}>{qty}/</span>}
                    {avail} in stock
                  </div>
                  {qty === 0 ? (
                    <button onClick={() => addItem(f.id)} style={{
                      padding: '6px 12px', borderRadius: 8,
                      background: theme.ink, color: theme.paper, border: 'none',
                      cursor: 'pointer', fontFamily: theme.body, fontSize: 12, fontWeight: 600,
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}>{Icon.plus(theme.paper)} Add</button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <button onClick={() => setQty(f.id, qty - 1)} style={tinyBtn(theme)}>{Icon.minus(theme.muted)}</button>
                      <div style={{ width: 26, textAlign: 'center', fontFamily: theme.mono, fontSize: 13, fontWeight: 600 }}>{qty}</div>
                      <button onClick={() => setQty(f.id, qty + 1)} disabled={maxed}
                        style={{ ...tinyBtn(theme), opacity: maxed ? 0.4 : 1, cursor: maxed ? 'not-allowed' : 'pointer' }}>{Icon.plus(theme.muted)}</button>
                    </div>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{
                padding: 40, textAlign: 'center', color: theme.muted, fontSize: 13,
                border: `1px dashed ${theme.line}`, borderRadius: 12,
              }}>No items match. Try a different search or category.</div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT — Cart (sticky) */}
      <div style={{
        position: 'sticky', top: 16,
        alignSelf: 'start',
        background: theme.bg,
        display: 'flex', flexDirection: 'column',
        height: 'calc(100vh - 32px)',
        maxHeight: 780,
        borderTopRightRadius: 16, borderBottomRightRadius: 16,
        overflow: 'hidden',
      }}>
        <div style={{ padding: '22px 22px 14px', borderBottom: `1px solid ${theme.line}` }}>
          <div style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4,
          }}>
            <div style={{
              fontFamily: theme.display, fontWeight: theme.displayWeight,
              fontSize: 20, letterSpacing: theme.displayTracking,
            }}>Box cart</div>
            <div style={{
              fontFamily: theme.mono, fontSize: 11, color: theme.muted,
              textTransform: 'uppercase', letterSpacing: '0.1em',
            }}>{items.length} SKUs · {cartCount} units</div>
          </div>
          <div style={{ fontSize: 12, color: theme.muted, lineHeight: 1.5 }}>
            Items you add here go into the Love Box. You can adjust quantities any time before finalizing.
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '14px 18px', minHeight: 0 }}>
          {items.length === 0 ? (
            <div style={{
              border: `1px dashed ${theme.line}`, borderRadius: 12,
              padding: 40, textAlign: 'center', color: theme.muted, fontSize: 13,
              marginTop: 20,
            }}>
              <div style={{ fontFamily: theme.mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Empty</div>
              Add items from the inventory list on the left to build your box.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map(i => {
                const f = FOOD_CATALOG.find(x => x.id === i.id);
                if (!f) return null;
                const avail = stock[i.id] || 0;
                const maxed = i.qty >= avail;
                return (
                  <div key={i.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: 10, borderRadius: 10,
                    border: `1px solid ${theme.line}`, background: theme.paper,
                  }}>
                    <FoodThumb theme={theme} id={i.id} size={34} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</div>
                      <div style={{ fontSize: 11, color: theme.muted, fontFamily: theme.mono }}>{f.measure}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <button onClick={() => setQty(i.id, i.qty - 1)} style={tinyBtn(theme)}>{Icon.minus(theme.muted)}</button>
                      <div style={{ width: 24, textAlign: 'center', fontFamily: theme.mono, fontSize: 13, fontWeight: 600 }}>{i.qty}</div>
                      <button onClick={() => setQty(i.id, i.qty + 1)} disabled={maxed}
                        style={{ ...tinyBtn(theme), opacity: maxed ? 0.4 : 1, cursor: maxed ? 'not-allowed' : 'pointer' }}>{Icon.plus(theme.muted)}</button>
                    </div>
                    <button onClick={() => removeItem(i.id)} style={{
                      ...tinyBtn(theme), border: 'none', background: 'transparent',
                    }}>{Icon.close(theme.muted)}</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{
          padding: '16px 20px 20px', borderTop: `1px solid ${theme.line}`,
          background: theme.paper,
        }}>
          <div style={{
            fontSize: 12, color: theme.muted, lineHeight: 1.45,
            marginBottom: 14,
          }}>
            Availability checked live against warehouse stock.
          </div>
          <Button theme={theme} kind="primary" size="md"
            icon={Icon.arrowR(theme.accentInk)}
            onClick={onNext}
            disabled={!canNext}
            style={{ width: '100%', justifyContent: 'center' }}>
            {canNext
              ? `Generate recipes · ${items.length} item${items.length === 1 ? '' : 's'}`
              : 'Add at least 2 items'}
          </Button>
        </div>
      </div>

    </div>
  );
}

function tinyBtn(theme) {
  return {
    width: 26, height: 26, borderRadius: 6,
    border: `1px solid ${theme.line}`, background: theme.paper,
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  };
}

// ── Step 2: Recipes ───────────────────────────────────────────────────────
function Step2Recipes({
  theme, generating, candidates, selected, toggleRecipe,
  cuisine, setCuisine, dietary, setDietary, timePref, setTimePref,
  custom, setCustom, onRegenerate, onDetail, onBack, onNext,
  items,
}) {
  // ── Smooth completion: detect when Gemini finishes and show recipe-reveal phase ──
  const [completing, setCompleting] = useState(false);
  const wasGenerating = React.useRef(generating);
  useEffect(() => {
    if (wasGenerating.current && !generating && candidates?.length > 0) {
      setCompleting(true);  // hand off to GeneratingCard's "done" phase
    }
    wasGenerating.current = generating;
  }, [generating, candidates]);

  return (
    <div>
      <div style={{
        background: theme.paper, border: `1px solid ${theme.line}`, borderRadius: 14,
        padding: '18px 20px 20px', marginBottom: 18,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 24, height: 24, borderRadius: 6,
              background: theme.soft, color: theme.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{Icon.sparkle(theme.accent)}</div>
            <div>
              <div style={{
                fontFamily: theme.display, fontWeight: theme.displayWeight,
                fontSize: 15, letterSpacing: theme.displayTracking, lineHeight: 1.1,
              }}>Refine the mix</div>
              <div style={{ fontSize: 11.5, color: theme.muted, marginTop: 2 }}>
                Optional filters to guide the generator.
              </div>
            </div>
          </div>
          {(cuisine || dietary || timePref || custom) && (
            <button onClick={() => { setCuisine(null); setDietary(null); setTimePref(null); setCustom(''); }}
              style={{
                background: 'transparent', border: `1px solid ${theme.line}`,
                borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
                fontSize: 11, fontFamily: theme.mono, color: theme.muted,
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = theme.ink; e.currentTarget.style.borderColor = theme.ink + '55'; }}
              onMouseLeave={e => { e.currentTarget.style.color = theme.muted; e.currentTarget.style.borderColor = theme.line; }}
            >Clear all</button>
          )}
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20,
          paddingBottom: 18, marginBottom: 18,
          borderBottom: `1px dashed ${theme.line}`,
        }}>
          <RefineField theme={theme} label="Cuisine" value={cuisine} onChange={setCuisine}
            options={['Mexican', 'Italian', 'American', 'Asian', 'Any']} />
          <RefineField theme={theme} label="Dietary" value={dietary} onChange={setDietary}
            options={['Vegetarian', 'Low-sodium', 'Kid-friendly', 'Any']} />
          <RefineField theme={theme} label="Cook time" value={timePref} onChange={setTimePref}
            options={['Under 30 min', 'Under 45 min', 'Any']} />
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 10,
            padding: '0 14px', height: 44,
            border: `1px solid ${theme.line}`, borderRadius: 10, background: theme.bg,
            transition: 'border-color 140ms, background 140ms',
          }}
            onFocus={e => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.background = theme.paper; }}
            onBlur={e => { e.currentTarget.style.borderColor = theme.line; e.currentTarget.style.background = theme.bg; }}
          >
            <span style={{
              fontFamily: theme.mono, fontSize: 10, color: theme.muted,
              textTransform: 'uppercase', letterSpacing: '0.1em',
              paddingRight: 10, borderRight: `1px solid ${theme.line}`,
            }}>Prompt</span>
            <input value={custom} onChange={e => setCustom(e.target.value)}
              placeholder="e.g. one soup for kids, keep it simple"
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontFamily: theme.body, fontSize: 13.5, color: theme.ink,
                height: '100%',
              }} />
          </div>
          <Button theme={theme} kind="primary" size="md" icon={Icon.reset(theme.accentInk)} onClick={onRegenerate}>
            Regenerate
          </Button>
        </div>
      </div>

      {(generating || completing || !candidates) ? (
        <GeneratingCard
          theme={theme}
          items={items || []}
          completingRecipes={completing ? candidates.map(r => r.title.en) : null}
          onComplete={() => setCompleting(false)}
        />
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{
                fontFamily: theme.display, fontWeight: theme.displayWeight,
                fontSize: 20, letterSpacing: theme.displayTracking, lineHeight: 1.15,
              }}>Suggested recipes</div>
              <div style={{ fontSize: 12.5, color: theme.muted, marginTop: 4 }}>
                4 variations generated from your box. Select which to include.
              </div>
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 12px', borderRadius: 999,
              background: selected.length > 0 ? theme.accent : theme.soft,
              color: selected.length > 0 ? theme.accentInk : theme.muted,
              fontFamily: theme.mono, fontSize: 11, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: 999,
                background: selected.length > 0 ? theme.accentInk : theme.muted,
              }} />
              {selected.length} selected
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {candidates.map((r, i) => (
              <RecipeCandidateCard key={r.id} theme={theme} recipe={r} size={i < 2 ? 4 : 2}
                selected={selected.includes(r.id)}
                onToggle={() => toggleRecipe(r.id)}
                onView={() => onDetail(r.id)} />
            ))}
          </div>
        </>
      )}

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 20, padding: 14, background: theme.paper,
        border: `1px solid ${theme.line}`, borderRadius: 12,
      }}>
        <Button theme={theme} kind="ghost" size="md" onClick={onBack}>← Back to inventory</Button>
        <div style={{ fontSize: 12, color: theme.muted, fontFamily: theme.mono }}>
          {selected.length} of {candidates ? candidates.length : 0} selected
        </div>
        <Button theme={theme} kind="primary" size="md" icon={Icon.arrowR(theme.accentInk)}
          onClick={onNext} disabled={selected.length === 0}>
          Continue to finalize
        </Button>
      </div>
    </div>
  );
}

function RefineField({ theme, label, value, onChange, options }) {
  return (
    <div>
      <div style={{
        fontFamily: theme.mono, fontSize: 10, color: theme.muted,
        textTransform: 'uppercase', letterSpacing: '0.1em',
        marginBottom: 8,
      }}>{label}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {options.map(o => {
          const active = value === o;
          return (
            <button key={o} onClick={() => onChange(active ? null : o)} style={{
              padding: '6px 12px', borderRadius: 999,
              border: `1px solid ${active ? theme.ink : theme.line}`,
              background: active ? theme.ink : theme.paper,
              color: active ? theme.paper : theme.ink,
              fontFamily: theme.body, fontSize: 12.5, fontWeight: active ? 600 : 500,
              cursor: 'pointer', transition: 'all 140ms',
              whiteSpace: 'nowrap',
            }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = theme.ink + '55'; e.currentTarget.style.background = theme.soft; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = theme.line; e.currentTarget.style.background = theme.paper; } }}
            >{o}</button>
          );
        })}
      </div>
    </div>
  );
}

function ChipGroup({ theme, label, value, onChange, options }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 11, color: theme.muted, fontFamily: theme.mono, textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 4 }}>{label}</span>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {options.map(o => {
          const active = value === o;
          return (
            <button key={o} onClick={() => onChange(active ? null : o)} style={{
              padding: '5px 11px', borderRadius: 999,
              border: `1px solid ${active ? theme.ink : theme.line}`,
              background: active ? theme.ink : 'transparent',
              color: active ? theme.paper : theme.ink,
              fontFamily: theme.body, fontSize: 12, fontWeight: 500,
              cursor: 'pointer', transition: 'all 140ms',
            }}>{o}</button>
          );
        })}
      </div>
    </div>
  );
}

function RecipeCandidateCard({ theme, recipe, size, selected, onToggle, onView }) {
  const [justSelected, setJustSelected] = useState(false);
  const prev = React.useRef(selected);

  useEffect(() => {
    // Trigger the "pop" animation only on the transition unselected → selected.
    if (!prev.current && selected) {
      setJustSelected(true);
      const t = setTimeout(() => setJustSelected(false), 420);
      prev.current = selected;
      return () => clearTimeout(t);
    }
    prev.current = selected;
  }, [selected]);

  const heroSrc = recipeHeroUrl(recipe);

  const boxIngredients = recipe.ingredients.filter(i => i.source === 'box');
  const extraCount = Math.max(0, boxIngredients.length - 3);

  return (
    <div onClick={onToggle} style={{
      position: 'relative',
      background: theme.paper,
      borderRadius: 16,
      border: `1px solid ${selected ? theme.accent + '55' : theme.line}`,
      boxShadow: selected
        ? `0 0 0 3px ${theme.accent}22, 0 22px 44px -18px rgba(193, 107, 34, 0.45), 0 6px 14px rgba(0,0,0,0.06)`
        : '0 1px 2px rgba(0,0,0,0.02)',
      overflow: 'hidden',
      transition: 'transform 260ms cubic-bezier(0.2, 0.9, 0.25, 1.35), box-shadow 240ms ease, border-color 180ms ease, background 200ms',
      display: 'flex', flexDirection: 'column',
      cursor: 'pointer',
      transform: selected
        ? (justSelected ? 'translateY(-8px) scale(1.025)' : 'translateY(-4px) scale(1.01)')
        : 'translateY(0) scale(1)',
      willChange: 'transform',
      zIndex: selected ? 2 : 1,
    }}>
      {/* Hero image */}
      <div style={{
        height: 180, position: 'relative', overflow: 'hidden',
        background: '#1f1a14',
      }}>
        <img src={heroSrc} alt={recipe.title.en}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', display: 'block',
            transform: selected ? 'scale(1.03)' : 'scale(1)',
            transition: 'transform 400ms ease',
          }} />
        {/* Top-left: serving badge */}
        <div style={{
          position: 'absolute', top: 12, left: 12,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 10px 5px 8px', borderRadius: 999,
          background: 'rgba(255,255,255,0.96)', color: theme.ink,
          fontFamily: theme.mono, fontSize: 10.5, fontWeight: 700,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="4" r="2" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M2 10 Q 6 7, 10 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
          </svg>
          Serves {size}
        </div>
        {/* Top-right: selection toggle */}
        <button onClick={e => { e.stopPropagation(); onToggle(); }} style={{
          position: 'absolute', top: 12, right: 12,
          width: 32, height: 32, borderRadius: 999,
          background: selected ? theme.accent : 'rgba(255,255,255,0.96)',
          border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: selected
            ? `0 0 0 3px ${theme.accent}44, 0 4px 12px rgba(0,0,0,0.2)`
            : '0 2px 8px rgba(0,0,0,0.15)',
          color: selected ? theme.accentInk : theme.muted,
          transition: 'all 160ms',
        }}>
          {selected ? Icon.check(theme.accentInk) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          )}
        </button>
        {/* Missing-ingredient warning pill, if any */}
        {recipe.missing && (
          <div style={{
            position: 'absolute', bottom: 12, left: 12,
            padding: '5px 10px', borderRadius: 999,
            background: '#FFF4D9', color: '#7A4A0F',
            fontFamily: theme.mono, fontSize: 10.5, fontWeight: 700,
            letterSpacing: '0.04em', textTransform: 'uppercase',
            border: '1px solid #E9B14A44',
          }}>
            + needs {recipe.missing.en}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '18px 18px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Title */}
        <div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 3,
          }}>
            {selected && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '2px 8px', borderRadius: 999,
                background: theme.accent, color: theme.accentInk,
                fontFamily: theme.mono, fontSize: 9.5, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                  <path d="M1.5 4.5 L 3.5 6.5 L 7.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                In box
              </span>
            )}
          </div>
          <div style={{
            fontFamily: theme.display, fontWeight: theme.displayWeight,
            fontSize: 19, letterSpacing: theme.displayTracking, lineHeight: 1.2,
            color: theme.ink,
          }}>{recipe.title.en}</div>
          <div style={{
            fontSize: 12.5, color: theme.muted, fontStyle: 'italic',
            marginTop: 3, lineHeight: 1.3,
          }}>{recipe.title.es}</div>
        </div>

        {/* Meta row — time · method */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 12, color: theme.muted, fontFamily: theme.mono,
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            {Icon.clock(theme.muted)} {recipe.time}
          </span>
          <span style={{ width: 3, height: 3, background: theme.line, borderRadius: 999 }} />
          <span>{recipe.tags[0]}</span>
          {recipe.tags[2] && (
            <>
              <span style={{ width: 3, height: 3, background: theme.line, borderRadius: 999 }} />
              <span>{recipe.tags[2]}</span>
            </>
          )}
        </div>

        {/* Uses from box — small thumbnails */}
        <div style={{
          padding: '10px 12px',
          background: selected ? theme.accent + '10' : theme.bg,
          borderRadius: 10,
          border: `1px solid ${selected ? theme.accent + '33' : theme.line}`,
          transition: 'background 200ms, border-color 200ms',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 8,
          }}>
            <div style={{
              fontFamily: theme.mono, fontSize: 10, color: theme.muted,
              textTransform: 'uppercase', letterSpacing: '0.1em',
            }}>From the box</div>
            <button
              onClick={e => { e.stopPropagation(); onView(); }}
              title="View full recipe"
              aria-label="View full recipe"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '4px 9px 4px 10px', borderRadius: 999,
                background: 'transparent',
                border: `1px solid ${theme.line}`,
                color: theme.ink,
                fontFamily: theme.body, fontSize: 11.5, fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 140ms',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = theme.ink;
                e.currentTarget.style.borderColor = theme.ink;
                e.currentTarget.style.color = theme.paper;
                const arr = e.currentTarget.querySelector('svg');
                if (arr) arr.style.transform = 'translateX(2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = theme.line;
                e.currentTarget.style.color = theme.ink;
                const arr = e.currentTarget.querySelector('svg');
                if (arr) arr.style.transform = 'translateX(0)';
              }}
            >
              View recipe
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"
                style={{ transition: 'transform 160ms' }}>
                <path d="M3 6h6M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {boxIngredients.slice(0, 3).map(i => {
              const name = i.name.en.toLowerCase();
              const match = FOOD_CATALOG.find(f =>
                name.includes(f.name.toLowerCase().split(' ')[0].toLowerCase()) || name.includes(f.id));
              return (
                <div key={i.name.en} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '3px 10px 3px 3px', borderRadius: 999,
                  background: theme.paper, border: `1px solid ${theme.line}`,
                  fontSize: 12, color: theme.ink,
                }}>
                  {match ? <FoodThumb theme={theme} id={match.id} size={22} /> : (
                    <span style={{ width: 22, height: 22, borderRadius: 999, background: theme.soft }} />
                  )}
                  <span style={{ whiteSpace: 'nowrap' }}>{i.name.en.split(',')[0]}</span>
                </div>
              );
            })}
            {extraCount > 0 && (
              <span style={{
                fontFamily: theme.mono, fontSize: 11, color: theme.muted,
                padding: '4px 8px',
              }}>+{extraCount} more</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GeneratingCard — three-phase loading experience:
//
//  Phase 1 "ingredients"  Ingredient chips float into the pot (~3 s)
//  Phase 2 "stages"       Gemini is thinking; staged progress labels (adaptive)
//  Phase 3 "done"         Actual recipe titles check in one-by-one → 100%
//                         then calls onComplete() to hand off to the recipe grid
// ─────────────────────────────────────────────────────────────────────────────
function GeneratingCard({ theme, items, completingRecipes = null, onComplete }) {
  const [phase,       setPhase]       = useState('ingredients');
  const [visible,     setVisible]     = useState(0);   // # ingredient chips shown
  const [stageIdx,    setStageIdx]    = useState(0);   // active stage (0-3)
  const [doneVisible, setDoneVisible] = useState(0);   // # recipe names revealed

  const STAGES = [
    { label: 'Scanning your pantry items',         pct: 22 },
    { label: 'Crafting recipe combinations',        pct: 48 },
    { label: 'Writing step-by-step instructions',  pct: 72 },
    { label: 'Checking allergens & portion sizes', pct: 90 },
  ];

  const chips = (items || []).slice(0, 7).map(i => {
    const f = FOOD_CATALOG.find(x => x.id === i.id);
    return { id: i.id, label: f ? f.name : i.id };
  });

  // ── Phase 1: reveal ingredient chips ──────────────────────────────────────
  useEffect(() => {
    if (chips.length === 0) { setPhase('stages'); return; }
    let count = 0;
    const iv = setInterval(() => {
      count++;
      setVisible(count);
      if (count >= chips.length) {
        clearInterval(iv);
        setTimeout(() => setPhase('stages'), 900);
      }
    }, 390);
    return () => clearInterval(iv);
  }, []);

  // ── Phase 2: advance stages on a timer (continues until Gemini responds) ──
  useEffect(() => {
    if (phase !== 'stages') return;
    const gaps = [2600, 3000, 3400];
    let idx = 0;
    const tick = () => {
      // Only advance if we haven't entered the done phase yet
      if (idx < STAGES.length - 1) {
        idx++;
        setStageIdx(idx);
        if (idx < gaps.length) setTimeout(tick, gaps[idx]);
      }
    };
    const t = setTimeout(tick, gaps[0]);
    return () => clearTimeout(t);
  }, [phase]);

  // ── Phase 3: completingRecipes arrives → switch to "done" immediately ─────
  useEffect(() => {
    if (!completingRecipes) return;
    setPhase('done');
  }, [completingRecipes]);

  // Reveal recipe names one-by-one, then call onComplete
  useEffect(() => {
    if (phase !== 'done' || !completingRecipes?.length) return;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDoneVisible(i);
      if (i >= completingRecipes.length) {
        clearInterval(iv);
        // Brief pause so user can read the last name, then hand off
        setTimeout(() => onComplete?.(), 900);
      }
    }, 310);
    return () => clearInterval(iv);
  }, [phase]);

  // Progress: 3% → 22/48/72/90% → 100%
  const progress = phase === 'ingredients' ? 3
    : phase === 'done' ? 100
    : STAGES[stageIdx].pct;

  return (
    <div style={{
      background: theme.paper, border: `1px solid ${theme.line}`,
      borderRadius: 14, overflow: 'hidden',
    }}>
      <style>{`
        @keyframes chipIn {
          from { opacity:0; transform:translateY(12px) scale(0.82); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes stageFadeUp {
          from { opacity:0; transform:translateY(7px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes potBounce {
          0%,100% { transform:rotate(-1.5deg) scale(1); }
          45%     { transform:rotate(2deg) scale(1.08) translateY(-5px); }
        }
        @keyframes checkPop {
          from { opacity:0; transform:scale(0.78) translateY(6px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes pulse {
          0%,100% { opacity:1; }
          50%     { opacity:0.55; }
        }
      `}</style>

      {/* ── Hairline progress bar ───────────────────────────────────── */}
      <div style={{ height: 3, background: theme.bg }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: `linear-gradient(90deg, ${theme.accent}cc, ${theme.accent})`,
          borderRadius: '0 999px 999px 0',
          transition: phase === 'done'
            ? 'width 0.65s cubic-bezier(0.22,1,0.36,1)'
            : 'width 1.6s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>

      <div style={{
        padding: '44px 40px 52px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26,
      }}>

        {/* ══════════════════════════════════════════════════════════════
            PHASE 1 — Ingredients floating into the pot
        ══════════════════════════════════════════════════════════════ */}
        {phase === 'ingredients' && (
          <>
            <div style={{
              width: 68, height: 68, borderRadius: 999,
              background: theme.soft, border: `2px solid ${theme.line}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30,
              animation: visible >= chips.length ? 'potBounce 1.1s ease-in-out infinite' : 'none',
            }}>🍲</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 400 }}>
              {chips.map((chip, i) => i < visible && (
                <div key={chip.id} style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '5px 13px 5px 7px', borderRadius: 999,
                  background: theme.bg, border: `1px solid ${theme.line}`,
                  fontSize: 13, color: theme.ink, fontFamily: theme.body,
                  animation: 'chipIn 0.42s cubic-bezier(0.34,1.56,0.64,1) forwards',
                }}>
                  <FoodThumb theme={theme} id={chip.id} size={19} />
                  {chip.label}
                </div>
              ))}
            </div>
            <div style={{ fontFamily: theme.mono, fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.13em' }}>
              Tossing {chips.length} ingredient{chips.length !== 1 ? 's' : ''} into the mix…
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════
            PHASE 2 — Gemini is thinking; staged progress labels
        ══════════════════════════════════════════════════════════════ */}
        {phase === 'stages' && (
          <>
            <div style={{
              width: 52, height: 52, borderRadius: 999, background: theme.soft,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'pulse 1.4s ease-in-out infinite',
            }}>{Icon.sparkle(theme.accent)}</div>
            <div style={{
              fontFamily: theme.display, fontWeight: theme.displayWeight,
              fontSize: 20, letterSpacing: theme.displayTracking, textAlign: 'center',
            }}>Generating recipes with AI</div>
            <div key={stageIdx} style={{ textAlign: 'center', animation: 'stageFadeUp 0.35s ease-out forwards' }}>
              <div style={{ fontFamily: theme.mono, fontSize: 10, color: theme.accent, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 8 }}>
                {String(stageIdx + 1).padStart(2, '0')} / {String(STAGES.length).padStart(2, '0')}
              </div>
              <div style={{ fontSize: 14.5, color: theme.muted, lineHeight: 1.55 }}>{STAGES[stageIdx].label}</div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {STAGES.map((_, i) => (
                <div key={i} style={{
                  height: 8, borderRadius: 999,
                  width: i === stageIdx ? 26 : 8,
                  background: i <= stageIdx ? theme.accent : theme.line,
                  transition: 'all 0.38s cubic-bezier(0.34,1.56,0.64,1)',
                }} />
              ))}
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════
            PHASE 3 — Recipes ready: real names check in one-by-one
        ══════════════════════════════════════════════════════════════ */}
        {phase === 'done' && (
          <>
            <div style={{
              width: 52, height: 52, borderRadius: 999,
              background: theme.accent + '18', border: `1.5px solid ${theme.accent}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{Icon.sparkle(theme.accent)}</div>

            <div style={{
              fontFamily: theme.display, fontWeight: theme.displayWeight,
              fontSize: 20, letterSpacing: theme.displayTracking, textAlign: 'center',
            }}>
              {doneVisible < (completingRecipes || []).length
                ? 'Recipes incoming…'
                : '✨ Your recipes are ready!'}
            </div>

            {/* Recipe names check in with a spring pop */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, width: '100%', maxWidth: 390 }}>
              {(completingRecipes || []).map((name, i) => i < doneVisible && (
                <div key={name} style={{
                  display: 'flex', alignItems: 'center', gap: 11,
                  padding: '10px 15px', borderRadius: 11,
                  background: theme.soft, border: `1px solid ${theme.accent}33`,
                  animation: 'checkPop 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards',
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 999, flexShrink: 0,
                    background: theme.accent,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{Icon.check(theme.accentInk)}</div>
                  <div style={{ fontSize: 13.5, fontFamily: theme.body, color: theme.ink }}>{name}</div>
                </div>
              ))}
            </div>

            {/* All-ready pill dots — all lit */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {STAGES.map((_, i) => (
                <div key={i} style={{
                  height: 8, borderRadius: 999, width: 8,
                  background: theme.accent,
                  transition: 'background 0.3s ease',
                }} />
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

// ── Step 3: Finalize — identity form + locked recipes/contents summary ───
function Step3Finalize({
  theme, region, setRegion, address, setAddress, event, setEvent,
  dispatchDate, setDispatchDate, families, setFamilies,
  meals4p, setMeals4p, meals2p, setMeals2p,
  boxLabel, setBoxLabel, boxNotes, setBoxNotes,
  items, selectedRecipes, onBack, onNext,
}) {
  const canNext = region && dispatchDate;
  const yr3     = new Date().getFullYear();
  const wh3     = warehouseCode(region || 'Frisco');
  const seq3    = String(LOVE_BOXES.filter(b => b.id.startsWith(`LB-${yr3}-${wh3}-`)).length + 1).padStart(4, '0');
  const autoId  = `LB-${yr3}-${wh3}-${seq3}`;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 16, alignItems: 'start' }}>
      {/* LEFT — Identity form */}
      <div style={{ background: theme.paper, border: `1px solid ${theme.line}`, borderRadius: 14, padding: 24 }}>
        <div style={{ marginBottom: 18 }}>
          <div style={{
            fontFamily: theme.display, fontWeight: theme.displayWeight,
            fontSize: 22, letterSpacing: theme.displayTracking, lineHeight: 1.2,
          }}>Identify this package</div>
          <div style={{ fontSize: 13, color: theme.muted, marginTop: 6, lineHeight: 1.55 }}>
            Who receives it, where it's headed, and how many mouths it feeds.
            This is what shows up on the Love Boxes list once finalized.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <WField theme={theme} label="Batch Number (optional)">
            <input type="text" value={boxLabel}
              onChange={e => setBoxLabel(e.target.value)}
              placeholder={autoId}
              style={wInput(theme)} />
            <span style={{ fontSize: 11, color: theme.muted, fontFamily: theme.mono, marginTop: 2 }}>
              Leave blank to auto-assign <span style={{ color: theme.ink }}>{autoId}</span>
            </span>
          </WField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <WField theme={theme} label="Warehouse">
              <select value={region} onChange={e => setRegion(e.target.value)} style={wInput(theme)}>
                {REGIONS.map(r => <option key={r}>{r}</option>)}
              </select>
            </WField>
            <WField theme={theme} label="Dispatch date">
              <input type="date" value={dispatchDate}
                onChange={e => setDispatchDate(e.target.value)} style={wInput(theme)} />
            </WField>
          </div>

          <WField theme={theme} label="Address dispatched">
            <input type="text" value={address} placeholder="e.g. 1420 Legacy Dr · Frisco, TX 75034"
              onChange={e => setAddress(e.target.value)} style={wInput(theme)} />
          </WField>

          <WField theme={theme} label="Event / occasion">
            <input type="text" value={event}
              onChange={e => setEvent(e.target.value)}
              placeholder="Standard packs"
              style={wInput(theme)} />
          </WField>

          <WField theme={theme} label="Notes for volunteers (optional)">
            <textarea value={boxNotes}
              onChange={e => setBoxNotes(e.target.value)}
              placeholder="Anything volunteers should know about this batch…"
              rows={3}
              style={{ ...wInput(theme), height: 'auto', paddingTop: 10, resize: 'vertical', minHeight: 70 }} />
          </WField>
        </div>
      </div>

      {/* RIGHT — Locked recipes + contents summary */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: theme.paper, border: `1px solid ${theme.line}`, borderRadius: 14, padding: 20 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12,
          }}>
            <div style={{
              fontFamily: theme.display, fontWeight: theme.displayWeight,
              fontSize: 15, letterSpacing: theme.displayTracking,
            }}>Locked recipes ({selectedRecipes.length})</div>
            <span style={{
              fontFamily: theme.mono, fontSize: 10, fontWeight: 700,
              color: theme.accent, textTransform: 'uppercase', letterSpacing: '0.1em',
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <rect x="2" y="4.5" width="6" height="4" rx="0.8" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M3.5 4.5V3.2 Q 3.5 1.5, 5 1.5 Q 6.5 1.5, 6.5 3.2 V4.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
              </svg>
              Frozen
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {selectedRecipes.map(r => {
              const heroSrc = recipeHeroUrl(r);
              return (
                <div key={r.id} style={{
                  borderRadius: 10,
                  border: `1px solid ${theme.line}`, background: theme.bg,
                  display: 'flex', alignItems: 'center', overflow: 'hidden',
                }}>
                  {/* Fixed-size thumbnail — same proportions as the Step 2 card hero */}
                  <div style={{ width: 96, height: 72, flexShrink: 0, overflow: 'hidden', background: '#1f1a14' }}>
                    <img src={heroSrc} alt={r.title.en} style={{
                      width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block',
                    }} />
                  </div>
                  <div style={{
                    flex: 1, minWidth: 0, padding: '10px 12px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8,
                  }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{
                        fontFamily: theme.display, fontSize: 14, fontWeight: theme.displayWeight,
                        letterSpacing: theme.displayTracking, lineHeight: 1.2,
                      }}>{r.title.en}</div>
                      <div style={{ fontSize: 11, color: theme.muted, fontStyle: 'italic', marginTop: 2 }}>
                        {r.title.es}
                      </div>
                    </div>
                    <Chip theme={theme} tone="soft">{r.time}</Chip>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ background: theme.paper, border: `1px solid ${theme.line}`, borderRadius: 14, padding: 20 }}>
          <div style={{
            fontFamily: theme.display, fontWeight: theme.displayWeight,
            fontSize: 15, letterSpacing: theme.displayTracking, marginBottom: 10,
          }}>Box contents ({items.length} items · {items.reduce((a, i) => a + i.qty, 0)} units)</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {items.map(i => {
              const f = FOOD_CATALOG.find(x => x.id === i.id);
              if (!f) return null;
              return <Chip key={i.id} theme={theme} tone="soft">{f.name} ×{i.qty}</Chip>;
            })}
          </div>
        </div>

        {/* Status lifecycle indicator */}
        <div style={{
          background: theme.soft, borderRadius: 12, padding: '12px 14px',
          border: `1px solid ${theme.line}`,
        }}>
          <div style={{
            fontFamily: theme.mono, fontSize: 10, color: theme.muted,
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8,
          }}>Status after this step</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {['Draft', 'Finalized', 'Printed', 'Dispatched'].map((s, i) => (
              <React.Fragment key={s}>
                <span style={{
                  padding: '4px 10px', borderRadius: 999,
                  background: i === 1 ? theme.accent : 'transparent',
                  color: i === 1 ? theme.accentInk : (i === 0 ? theme.ink : theme.muted),
                  border: i === 1 ? 'none' : `1px solid ${theme.line}`,
                  fontFamily: theme.mono, fontSize: 10, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                }}>{s}</span>
                {i < 3 && <span style={{ color: theme.muted, fontSize: 11 }}>→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER — full-width, spans both columns */}
      <div style={{
        gridColumn: '1 / -1',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: 14, background: theme.paper,
        border: `1px solid ${theme.line}`, borderRadius: 12,
      }}>
        <Button theme={theme} kind="ghost" size="md" onClick={onBack}>← Back to recipes</Button>
        <div style={{ fontSize: 12, color: theme.muted, fontFamily: theme.mono }}>
          {canNext ? 'Ready to preview' : 'Warehouse and dispatch date are required'}
        </div>
        <Button theme={theme} kind="primary" size="md" icon={Icon.arrowR(theme.accentInk)}
          onClick={onNext} disabled={!canNext}>
          Preview & confirm
        </Button>
      </div>
    </div>
  );
}

// ── Step 4: Preview & confirm ─────────────────────────────────────────────
function Step4Preview({
  theme, region, address, event, dispatchDate, families,
  meals4p, meals2p, boxLabel, boxNotes,
  items, selectedRecipes, onBack, onFinalize,
}) {
  const yr4     = new Date().getFullYear();
  const wh4     = warehouseCode(region || 'Frisco');
  const seq4    = String(LOVE_BOXES.filter(b => b.id.startsWith(`LB-${yr4}-${wh4}-`)).length + 1).padStart(4, '0');
  const autoId  = `LB-${yr4}-${wh4}-${seq4}`;
  const finalId = boxLabel.trim() || autoId;
  const publicUrl = `${window.location.origin}/public.html?box=${encodeURIComponent(finalId)}`;
  const niceDate = new Date(dispatchDate + 'T00:00').toLocaleDateString('en-US',
    { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  // Hero images resolved per-recipe via shared recipeHeroUrl()

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
      {/* Status banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 18px',
        background: theme.soft, border: `1px solid ${theme.accent}33`,
        borderRadius: 12,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 999,
          background: theme.accent, color: theme.accentInk,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 0 3px ${theme.accent}22`,
        }}>{Icon.check(theme.accentInk)}</div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: theme.display, fontWeight: theme.displayWeight,
            fontSize: 16, letterSpacing: theme.displayTracking, lineHeight: 1.2,
          }}>Ready to dispatch</div>
          <div style={{ fontSize: 12.5, color: theme.muted, marginTop: 3 }}>
            Review the final package below. Saving will generate a QR code, stamp it Finalized, and post it to the Love Boxes list.
          </div>
        </div>
        <span style={{
          fontFamily: theme.mono, fontSize: 10, fontWeight: 700,
          color: theme.ink,
          padding: '6px 12px', borderRadius: 999,
          background: theme.paper, border: `1px solid ${theme.line}`,
          textTransform: 'uppercase', letterSpacing: '0.1em',
        }}>Read-only preview</span>
      </div>

      {/* Main preview card — looks like the public box page / printed label */}
      <div style={{
        background: theme.paper, border: `1px solid ${theme.line}`, borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 6px 28px -16px rgba(0,0,0,0.15)',
      }}>
        {/* Masthead — batch ID, region, date */}
        <div style={{
          padding: '22px 28px 20px',
          borderBottom: `1px solid ${theme.line}`,
          display: 'flex', alignItems: 'flex-start', gap: 20,
          background: `linear-gradient(180deg, ${theme.soft} 0%, ${theme.paper} 100%)`,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '3px 10px', borderRadius: 999,
              background: theme.paper, border: `1px solid ${theme.line}`,
              fontFamily: theme.mono, fontSize: 10.5, fontWeight: 700,
              color: theme.muted,
              textTransform: 'uppercase', letterSpacing: '0.1em',
              marginBottom: 10,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: theme.accent }} />
              {event || 'Standard packs'}
            </div>
            <div style={{
              fontFamily: theme.display, fontWeight: theme.displayWeight,
              fontSize: 32, letterSpacing: theme.displayTracking, lineHeight: 1.05,
              color: theme.ink,
            }}>{finalId}</div>
            <div style={{
              marginTop: 8,
              fontSize: 14, color: theme.muted, lineHeight: 1.5,
            }}>
              <strong style={{ color: theme.ink, fontWeight: 600 }}>{region}</strong> · {niceDate}
              {address && <> · <span style={{ fontStyle: 'italic' }}>{address}</span></>}
            </div>
          </div>
          <div style={{
            padding: 8, background: theme.paper, borderRadius: 10,
            border: `1px solid ${theme.line}`,
            textAlign: 'center',
          }}>
            <QR size={78} seed={finalId} />
            <div style={{
              fontFamily: theme.mono, fontSize: 8.5, color: theme.muted,
              textTransform: 'uppercase', letterSpacing: '0.1em',
              marginTop: 6,
            }}>Scan to view</div>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
          borderBottom: `1px solid ${theme.line}`,
        }}>
          {[
            { label: 'Recipes', value: selectedRecipes.length, suffix: 'locked in this box' },
            { label: 'Box contents', value: items.length, suffix: `items · ${items.reduce((a,i)=>a+i.qty,0)} total units` },
          ].map((s, i) => (
            <div key={s.label} style={{
              padding: '22px 24px',
              borderRight: i < 1 ? `1px solid ${theme.line}` : 'none',
            }}>
              <div style={{
                fontFamily: theme.mono, fontSize: 10, color: theme.muted,
                textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>{s.label}</div>
              <div style={{
                fontFamily: theme.display, fontWeight: theme.displayWeight,
                fontSize: 30, letterSpacing: theme.displayTracking,
                color: theme.ink, marginTop: 4, lineHeight: 1,
              }}>{s.value}</div>
              <div style={{
                fontSize: 11.5, color: theme.muted, marginTop: 6,
              }}>{s.suffix}</div>
            </div>
          ))}
        </div>

        {/* Recipe lineup */}
        <div style={{ padding: '22px 28px' }}>
          <div style={{
            fontFamily: theme.mono, fontSize: 10.5, color: theme.muted,
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12,
          }}>Recipe lineup</div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(4, Math.max(1, selectedRecipes.length))}, 1fr)`,
            gap: 10,
          }}>
            {selectedRecipes.map(r => {
              const heroSrc = recipeHeroUrl(r);
              return (
                <div key={r.id} style={{
                  border: `1px solid ${theme.line}`, borderRadius: 10,
                  overflow: 'hidden', background: theme.paper,
                }}>
                  {/* Fixed-height hero — <img> for consistent rendering across all recipes */}
                  <div style={{ height: 110, overflow: 'hidden', background: '#1f1a14' }}>
                    <img src={heroSrc} alt={r.title.en} style={{
                      width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block',
                    }} />
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{
                      fontFamily: theme.display, fontSize: 13, fontWeight: theme.displayWeight,
                      letterSpacing: theme.displayTracking, lineHeight: 1.2,
                    }}>{r.title.en}</div>
                    <div style={{
                      fontFamily: theme.mono, fontSize: 10, color: theme.muted,
                      textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4,
                    }}>{r.time} · Serves {r.servings || 4}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Box contents */}
        <div style={{ padding: '0 28px 22px' }}>
          <div style={{
            fontFamily: theme.mono, fontSize: 10.5, color: theme.muted,
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10,
          }}>Box contents ({items.length} items · {items.reduce((a,i)=>a+i.qty,0)} units)</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {items.map(i => {
              const f = FOOD_CATALOG.find(x => x.id === i.id);
              if (!f) return null;
              return (
                <div key={i.id} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '4px 12px 4px 4px', borderRadius: 999,
                  background: theme.bg, border: `1px solid ${theme.line}`,
                  fontSize: 12.5, color: theme.ink,
                }}>
                  <FoodThumb theme={theme} id={f.id} size={22} />
                  <span>{f.name}</span>
                  <span style={{ fontFamily: theme.mono, color: theme.muted, fontSize: 11 }}>×{i.qty}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notes + public URL footer */}
        <div style={{
          padding: '16px 28px',
          borderTop: `1px solid ${theme.line}`,
          background: theme.bg,
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20,
        }}>
          <div>
            <div style={{
              fontFamily: theme.mono, fontSize: 10, color: theme.muted,
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6,
            }}>Volunteer notes</div>
            <div style={{ fontSize: 13, color: theme.ink, lineHeight: 1.5 }}>
              {boxNotes.trim() || <span style={{ color: theme.muted, fontStyle: 'italic' }}>No notes added.</span>}
            </div>
          </div>
          <div>
            <div style={{
              fontFamily: theme.mono, fontSize: 10, color: theme.muted,
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6,
            }}>Public URL</div>
            <div style={{
              fontFamily: theme.mono, fontSize: 12.5, color: theme.ink,
              wordBreak: 'break-all', lineHeight: 1.4,
            }}>{publicUrl}</div>
          </div>
        </div>
      </div>

      {/* Action footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: 14, background: theme.paper,
        border: `1px solid ${theme.line}`, borderRadius: 12,
      }}>
        <Button theme={theme} kind="ghost" size="md" onClick={onBack}>← Back to edit</Button>
        <div style={{ fontSize: 12, color: theme.muted, fontFamily: theme.mono }}>
          Saving will move status from Draft → Finalized
        </div>
        <Button theme={theme} kind="primary" size="md"
          onClick={onFinalize}
          icon={Icon.check(theme.accentInk)}>
          Save & finalize box
        </Button>
      </div>
    </div>
  );
}

// ── Shared form bits ──────────────────────────────────────────────────────
function WField({ theme, label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontSize: 10.5, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: theme.mono }}>{label}</span>
      {children}
    </label>
  );
}
function wInput(theme) {
  return {
    height: 38, padding: '0 10px',
    border: `1px solid ${theme.line}`, borderRadius: 10,
    background: theme.paper, color: theme.ink,
    fontFamily: theme.body, fontSize: 13.5, outline: 'none', width: '100%',
  };
}
function QtyField({ theme, value, setValue, min = 0, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <button onClick={() => setValue(Math.max(min, value - 1))} style={tinyBtn(theme)}>{Icon.minus(theme.ink)}</button>
      <div style={{
        flex: 1, height: 38, borderRadius: 10, border: `1px solid ${theme.line}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: theme.display, fontSize: 18, fontWeight: theme.displayWeight,
        background: theme.paper, color: accent ? theme.accent : theme.ink,
      }}>{value}</div>
      <button onClick={() => setValue(value + 1)} style={tinyBtn(theme)}>{Icon.plus(theme.ink)}</button>
    </div>
  );
}

// ── Barcode SVG (deterministic pseudo-barcode from string) ───────────────────
function Barcode({ value, width = 280, height = 56 }) {
  const rects = useMemo(() => {
    const segs = [];
    // Left quiet zone
    segs.push({ black: false, u: 7 });
    // Start guard: |||·||·
    [true,false,true,false,true,false,false].forEach((b,i) => segs.push({ black: b, u: i===0||i===2||i===4?2:1 }));
    // Character data
    for (let ci = 0; ci < value.length; ci++) {
      const c = value.charCodeAt(ci);
      for (let bi = 0; bi < 6; bi++) {
        segs.push({ black: bi % 2 === 0, u: ((c >> bi) & 1) ? 2 : 1 });
      }
      segs.push({ black: false, u: 1 }); // inter-char gap
    }
    // Stop guard: |||·|·|||
    [true,false,true,false,true,false,true,false,true].forEach((b,i) => segs.push({ black: b, u: i===8?3:i===4?2:1 }));
    // Right quiet zone
    segs.push({ black: false, u: 7 });

    const totalU = segs.reduce((a, s) => a + s.u, 0);
    const uw = width / totalU;
    let x = 0;
    const out = [];
    segs.forEach(s => {
      if (s.black) out.push({ x, w: s.u * uw });
      x += s.u * uw;
    });
    return out;
  }, [value, width]);

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={0} width={Math.max(0.6, r.w - 0.3)} height={height} fill="#111" />
      ))}
    </svg>
  );
}

// ── Physical label sheet ──────────────────────────────────────────────────────
function LabelPrintSheet({ box }) {
  const niceDate = box.dispatchDate
    ? new Date(box.dispatchDate + 'T00:00').toLocaleDateString('en-US',
        { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : '—';
  const recipeNames = (box.recipes || [])
    .map(r => {
      if (typeof r === 'string') {
        const x = RECIPES.find(x => x.id === r);
        return x ? x.title.en : r;
      }
      return r?.title?.en || r?.name || r?.id || null;
    })
    .filter(Boolean);
  const itemNames = (box.items || [])
    .map(i => { const f = FOOD_CATALOG.find(x => x.id === i.id); return f ? `${f.name} ×${i.qty}` : null; })
    .filter(Boolean);
  const recipesCount = recipeNames.length || box.recipesCount || 0;

  const row = (label, value) => (
    <div key={label}>
      <div style={{ fontSize: 8.5, color: '#888', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'monospace' }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#000', marginTop: 3 }}>{value}</div>
    </div>
  );

  return (
    <div id="label-print-sheet" style={{
      width: 440, background: '#fff', color: '#111',
      fontFamily: '"Inter", system-ui, sans-serif',
      border: '1.5px solid #d0d0d0', borderRadius: 12, overflow: 'hidden',
      boxShadow: '0 4px 24px -8px rgba(0,0,0,0.14)',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1.5px solid #e0e0e0', background: '#f5f5f5',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LovepacsMark size={30} color="#0B3B2E" />
          <div>
            <div style={{ fontSize: 9.5, color: '#777', textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: 'monospace' }}>LOVEPACS</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#000', letterSpacing: '-0.01em' }}>Love Box Label</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 9.5, color: '#777', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{box.event || 'Standard packs'}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0B3B2E', fontFamily: 'monospace', letterSpacing: '0.04em' }}>{box.id}</div>
        </div>
      </div>

      {/* Barcode */}
      <div style={{ padding: '14px 18px 10px', textAlign: 'center', borderBottom: '1px solid #ebebeb' }}>
        <Barcode value={box.id} width={400} height={54} />
        <div style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.22em', marginTop: 7, color: '#444', textTransform: 'uppercase' }}>
          {box.id}
        </div>
      </div>

      {/* Metadata — full width, no QR here so barcode area stays clean */}
      <div style={{ padding: '14px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px 20px', borderBottom: '1px solid #ebebeb' }}>
        {row('WAREHOUSE',     box.region || '—')}
        {row('DISPATCH DATE', niceDate)}
        {row('RECIPES',       `${recipesCount} included`)}
        {box.address && box.address !== '—' && (
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: 8.5, color: '#888', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'monospace' }}>ADDRESS DISPATCHED</div>
            <div style={{ fontSize: 12, color: '#333', marginTop: 3 }}>{box.address}</div>
          </div>
        )}
      </div>

      {/* Box contents */}
      {itemNames.length > 0 && (
        <div style={{ padding: '10px 18px', borderBottom: '1px solid #ebebeb', background: '#fafafa' }}>
          <div style={{ fontSize: 8.5, color: '#888', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'monospace', marginBottom: 6 }}>
            Box contents
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 0' }}>
            {itemNames.map((item, i) => (
              <span key={i} style={{ fontSize: 11, color: '#444', fontFamily: 'monospace', marginRight: 14 }}>{item}</span>
            ))}
          </div>
        </div>
      )}

      {/* Recipes + QR at bottom-right — QR is contextually tied to the recipe link */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'stretch', borderBottom: '1px solid #ebebeb' }}>
        {/* Recipe list */}
        <div style={{ padding: '12px 18px' }}>
          <div style={{ fontSize: 8.5, color: '#888', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'monospace', marginBottom: 8 }}>
            Recipes in this box
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {recipeNames.length > 0 ? recipeNames.map((r, i) => (
              <div key={i} style={{ fontSize: 12.5, color: '#000', display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: '#0B3B2E', display: 'inline-block', flexShrink: 0 }} />
                {r}
              </div>
            )) : (
              <div style={{ fontSize: 12, color: '#999', fontStyle: 'italic' }}>No recipes assigned</div>
            )}
          </div>
        </div>

        {/* QR code — right side, anchored to the recipe section */}
        <div style={{
          padding: '12px 14px',
          borderLeft: '1px solid #ebebeb',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5,
          background: '#ffffff',
        }}>
          <div style={{ padding: 5, border: '1.5px solid #e0e0e0', borderRadius: 8, background: '#fff' }}>
            <QR size={86} seed={getPublicUrl(box.id)} color="#000" bg="#fff" />
          </div>
          <div style={{ fontSize: 8, color: '#888', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>Scan for recipes</div>
          <div style={{ fontSize: 7.5, color: '#666', fontFamily: 'monospace', textAlign: 'center', wordBreak: 'break-all', maxWidth: 100 }}>
            {getPublicUrl(box.id)}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '8px 18px', borderTop: '1.5px solid #e0e0e0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: '#f0f0f0',
      }}>
        <div style={{ fontSize: 9, color: '#999', fontFamily: 'monospace' }}>lovepacs.org · Serving North Texas families</div>
        <div style={{ fontSize: 9, color: '#999', fontFamily: 'monospace' }}>
          Printed {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>
    </div>
  );
}

// ── Label screen (full-page wrapper with Print button) ────────────────────────
function LabelScreen({ theme, box, onDone, fromList }) {
  const handlePrint = () => {
    let styleEl = document.getElementById('__lp_print_css');
    if (!styleEl) { styleEl = document.createElement('style'); styleEl.id = '__lp_print_css'; document.head.appendChild(styleEl); }
    styleEl.textContent = `@media print {
      body > * { display: none !important; }
      #__lp_print_portal { display: block !important; }
      #label-print-sheet { margin: 20px auto !important; border-radius: 0 !important; box-shadow: none !important; border: 1px solid #ccc !important; }
    }`;
    let portal = document.getElementById('__lp_print_portal');
    if (!portal) { portal = document.createElement('div'); portal.id = '__lp_print_portal'; portal.style.display = 'none'; document.body.appendChild(portal); }
    const sheet = document.getElementById('label-print-sheet');
    if (sheet) portal.innerHTML = sheet.outerHTML;
    window.print();
  };

  return (
    <div style={{ padding: '28px 36px 48px' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: theme.mono }}>
            Love Box · Label ready
          </div>
          <div style={{
            fontFamily: theme.display, fontWeight: theme.displayWeight,
            fontSize: 30, letterSpacing: theme.displayTracking, lineHeight: 1.1, marginTop: 6,
          }}>Print label</div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
          <Button theme={theme} kind="secondary" size="md" onClick={onDone}>
            {fromList ? '← Back to order' : 'Go to Love Boxes →'}
          </Button>
          <Button theme={theme} kind="primary" size="md" icon={Icon.print(theme.accentInk)} onClick={handlePrint}>
            Print Label
          </Button>
        </div>
      </div>

      {/* Banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28,
        padding: '14px 18px', background: theme.soft, border: `1px solid ${theme.accent}33`, borderRadius: 12,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 999, background: theme.accent, color: theme.accentInk,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>{Icon.check(theme.accentInk)}</div>
        <div>
          <div style={{ fontFamily: theme.display, fontWeight: theme.displayWeight, fontSize: 16, letterSpacing: theme.displayTracking }}>
            {fromList ? `Label for ${box.id}` : `Box ${box.id} created`}
          </div>
          <div style={{ fontSize: 12.5, color: theme.muted, marginTop: 3 }}>
            Label includes the Order ID barcode, QR recipe link, warehouse, dispatch date, recipes, and box contents. Click Print Label to send to your printer.
          </div>
        </div>
      </div>

      {/* Label preview */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <LabelPrintSheet box={box} />
      </div>
    </div>
  );
}

Object.assign(window, { BoxWizard, Barcode, LabelPrintSheet, LabelScreen });
