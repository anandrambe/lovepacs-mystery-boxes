// picker.jsx — Step 2: recipe picker + Step 3: QR labels

function PickerStep({ theme, cardLayout, generating, candidates, selected, toggleRecipe, onBack, onConfirm }) {
  if (generating || !candidates) {
    return <GeneratingState theme={theme} />;
  }
  return (
    <div style={{ padding: '24px 28px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{
            fontFamily: theme.display, fontWeight: theme.displayWeight,
            fontSize: 28, letterSpacing: theme.displayTracking, lineHeight: 1.05,
          }}>Pick up to 3 recipes</div>
          <div style={{ fontSize: 13, color: theme.muted, marginTop: 6 }}>
            The Generator returned {candidates.length} candidates sized for ~4 people. All but Cowboy Soup use only items in the box.
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 12, color: theme.muted, fontFamily: theme.mono }}>
            {selected.length}/3 selected
          </div>
          <Button theme={theme} kind="ghost" size="sm" onClick={onBack}>← Back</Button>
          <Button theme={theme} kind="primary" size="md"
            onClick={onConfirm} disabled={selected.length === 0}
            icon={Icon.arrowR(theme.accentInk)}>
            Confirm selection
          </Button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: cardLayout === 'list' ? '1fr' : 'repeat(2, 1fr)',
        gap: 16,
      }}>
        {candidates.map(r => (
          <RecipeCard key={r.id} theme={theme} recipe={r}
            layout={cardLayout}
            selected={selected.includes(r.id)}
            disabled={!selected.includes(r.id) && selected.length >= 3}
            onToggle={() => toggleRecipe(r.id)} />
        ))}
      </div>

      <div style={{
        marginTop: 18, padding: 14, borderRadius: 12,
        background: theme.bg, border: `1px solid ${theme.line}`,
        display: 'flex', gap: 12, alignItems: 'flex-start',
        fontSize: 12, color: theme.muted, lineHeight: 1.5,
      }}>
        <div style={{
          width: 24, height: 24, borderRadius: 999, background: theme.soft,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, color: theme.ink,
        }}>i</div>
        <div>
          If a recipe is missing one ingredient, clients will see that call-out on the final card. Recipes requiring 2+ missing items are never proposed.
          Staples (salt, pepper, oil, water, etc.) are assumed to be on hand and may not appear as "missing."
        </div>
      </div>
    </div>
  );
}

function GeneratingState({ theme }) {
  return (
    <div style={{ padding: '90px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <div style={{
        width: 56, height: 56, borderRadius: 999,
        background: theme.soft, color: theme.accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'pulse 1.4s ease-in-out infinite',
      }}>
        {Icon.sparkle(theme.accent)}
      </div>
      <div style={{
        fontFamily: theme.display, fontSize: 24, fontWeight: theme.displayWeight,
        letterSpacing: theme.displayTracking,
      }}>Cooking up recipes…</div>
      <div style={{ fontSize: 13, color: theme.muted, fontFamily: theme.mono }}>
        Gemini 3 Flash · vector DB · avg 2.1s
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width: 48, height: 6, borderRadius: 999,
            background: theme.soft,
            animation: `fill 1.4s ${i*0.12}s ease-in-out infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

function RecipeCard({ theme, recipe, layout, selected, disabled, onToggle }) {
  const colors = ['#E9A87A', '#B5C181', '#D8B15E', '#B28A6A'];
  const hero = colors[Math.abs(Array.from(recipe.id).reduce((a,c) => a + c.charCodeAt(0), 0)) % colors.length];

  if (layout === 'list') {
    return (
      <div onClick={disabled ? undefined : onToggle} style={{
        display: 'flex', gap: 16, padding: 14,
        background: theme.paper, borderRadius: 14,
        border: `2px solid ${selected ? theme.accent : theme.line}`,
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1,
        transition: 'border-color 160ms ease',
      }}>
        <RecipeHero theme={theme} color={hero} recipe={recipe} size={120} layout="list" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <RecipeTitleRow theme={theme} recipe={recipe} selected={selected} />
          <RecipeTags theme={theme} recipe={recipe} />
          <RecipeIngredientSummary theme={theme} recipe={recipe} />
        </div>
      </div>
    );
  }

  if (layout === 'compact') {
    return (
      <div onClick={disabled ? undefined : onToggle} style={{
        padding: 16, background: theme.paper, borderRadius: 14,
        border: `2px solid ${selected ? theme.accent : theme.line}`,
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1,
      }}>
        <RecipeTitleRow theme={theme} recipe={recipe} selected={selected} />
        <RecipeTags theme={theme} recipe={recipe} />
        <RecipeIngredientSummary theme={theme} recipe={recipe} />
      </div>
    );
  }

  // magazine (default): big color hero with title overlay
  return (
    <div onClick={disabled ? undefined : onToggle} style={{
      background: theme.paper, borderRadius: 16,
      border: `2px solid ${selected ? theme.accent : theme.line}`,
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1,
      overflow: 'hidden', transition: 'border-color 160ms ease, transform 160ms ease',
      display: 'flex', flexDirection: 'column',
    }}
    onMouseEnter={e => { if (!disabled) e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
      <RecipeHero theme={theme} color={hero} recipe={recipe} size={160} layout="magazine" />
      <div style={{ padding: 18, flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <RecipeTitleRow theme={theme} recipe={recipe} selected={selected} />
        <RecipeTags theme={theme} recipe={recipe} />
        <div style={{ height: 1, background: theme.line, margin: '4px 0' }} />
        <RecipeIngredientSummary theme={theme} recipe={recipe} />
      </div>
    </div>
  );
}

function RecipeHero({ theme, color, recipe, size, layout }) {
  const isList = layout === 'list';
  return (
    <div style={{
      height: isList ? size : size,
      width: isList ? size : 'auto',
      borderRadius: isList ? 10 : 0,
      flexShrink: 0,
      background: `
        radial-gradient(at 30% 30%, ${color}ee, ${color}88 60%, ${color}44),
        repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0 10px, transparent 10px 20px)
      `,
      position: 'relative',
      display: 'flex', alignItems: 'flex-end',
      padding: 14,
    }}>
      <div style={{
        fontFamily: theme.mono, fontSize: 10, color: 'rgba(255,255,255,0.8)',
        letterSpacing: '0.1em', textTransform: 'uppercase',
      }}>{recipe.tags[2]}</div>
    </div>
  );
}

function RecipeTitleRow({ theme, recipe, selected }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
      <div>
        <div style={{
          fontFamily: theme.display, fontWeight: theme.displayWeight,
          fontSize: 20, letterSpacing: theme.displayTracking, lineHeight: 1.2, textWrap: 'pretty',
        }}>{recipe.title.en}</div>
        <div style={{ fontSize: 12, color: theme.muted, fontStyle: 'italic', marginTop: 4 }}>{recipe.title.es}</div>
      </div>
      <div style={{
        width: 28, height: 28, borderRadius: 999, flexShrink: 0,
        background: selected ? theme.accent : 'transparent',
        border: selected ? 'none' : `1.5px solid ${theme.line}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: theme.accentInk,
      }}>
        {selected && Icon.check(theme.accentInk)}
      </div>
    </div>
  );
}

function RecipeTags({ theme, recipe }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      <Chip theme={theme} tone="soft">{Icon.clock(theme.muted)} {recipe.time}</Chip>
      <Chip theme={theme} tone="soft">{recipe.tags[0]}</Chip>
      <Chip theme={theme} tone="soft">Serves {recipe.servings}</Chip>
      {recipe.missing && <Chip theme={theme} tone="missing">missing · {recipe.missing.en}</Chip>}
    </div>
  );
}

function RecipeIngredientSummary({ theme, recipe }) {
  const boxIngs = recipe.ingredients.filter(i => i.source === 'box');
  const staples = recipe.ingredients.filter(i => i.source === 'staple');
  const missing = recipe.ingredients.filter(i => i.source === 'missing');
  return (
    <div style={{ fontSize: 12.5, color: theme.ink, lineHeight: 1.5, marginTop: 6 }}>
      <span style={{ color: theme.muted }}>Uses </span>
      {boxIngs.map((i, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && ', '}
          <span style={{ fontWeight: 500 }}>{i.name.en.toLowerCase()}</span>
        </React.Fragment>
      ))}
      {staples.length > 0 && <span style={{ color: theme.muted }}> · staples: {staples.map(s => s.name.en.toLowerCase()).join(', ')}</span>}
      {missing.length > 0 && <span style={{ color: '#8B3A12' }}> · needs: {missing.map(s => s.name.en.toLowerCase()).join(', ')}</span>}
    </div>
  );
}

// ─── Step 3: Labels ─────────────────────────────────────────
function LabelsStep({ theme, box, boxKey, selected, onReset }) {
  const qrSeed = boxKey;
  const landingUrl = `lovepacs.org/b/${qrSeed.slice(0, 14)}`;
  return (
    <div style={{ padding: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{
            fontFamily: theme.display, fontWeight: theme.displayWeight,
            fontSize: 28, letterSpacing: theme.displayTracking, lineHeight: 1.05,
          }}>Print QR stickers</div>
          <div style={{ fontSize: 13, color: theme.muted, marginTop: 6 }}>
            {selected.length} recipe{selected.length === 1 ? '' : 's'} locked to box key
            <span style={{ fontFamily: theme.mono, color: theme.ink }}> {boxKey}</span>.
            One QR opens all of them in English or Spanish.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button theme={theme} kind="secondary" size="md" icon={Icon.reset(theme.ink)} onClick={onReset}>Start new box</Button>
          <Button theme={theme} kind="primary" size="md" icon={Icon.print(theme.accentInk)}>Print labels</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 20 }}>
        {/* Sticker preview */}
        <div style={{
          background: theme.bg, borderRadius: 14, padding: 28,
          border: `1px dashed ${theme.line}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        }}>
          <div style={{ fontSize: 11, color: theme.muted, fontFamily: theme.mono, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            ⎯⎯  4×4 in thermal sticker  ⎯⎯
          </div>
          <StickerPreview theme={theme} box={box} selected={selected} seed={qrSeed} url={landingUrl} />
        </div>

        {/* Summary */}
        <div>
          <SectionLabel theme={theme}>In this batch</SectionLabel>
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {selected.map(r => (
              <div key={r.id} style={{
                padding: 14, background: theme.paper, borderRadius: 12,
                border: `1px solid ${theme.line}`,
              }}>
                <div style={{
                  fontFamily: theme.display, fontWeight: theme.displayWeight,
                  fontSize: 16, letterSpacing: theme.displayTracking,
                }}>{r.title.en}</div>
                <div style={{ fontSize: 12, color: theme.muted, fontStyle: 'italic' }}>{r.title.es}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  <Chip theme={theme} tone="soft">{Icon.clock(theme.muted)} {r.time}</Chip>
                  <Chip theme={theme} tone="soft">Serves {r.servings}</Chip>
                  {r.missing && <Chip theme={theme} tone="missing">+ {r.missing.en}</Chip>}
                </div>
              </div>
            ))}
          </div>
          <SectionLabel theme={theme} style={{ marginTop: 20 }}>
            <div style={{ marginTop: 20 }}>Landing URL</div>
          </SectionLabel>
          <div style={{
            marginTop: 8, padding: 12, borderRadius: 10,
            background: theme.paper, border: `1px solid ${theme.line}`,
            fontFamily: theme.mono, fontSize: 13, wordBreak: 'break-all',
          }}>https://{landingUrl}</div>
        </div>
      </div>
    </div>
  );
}

function StickerPreview({ theme, box, selected, seed, url }) {
  return (
    <div style={{
      width: 380, padding: 22,
      background: '#fff', border: `1px solid ${theme.line}`,
      borderRadius: 8,
      boxShadow: '0 2px 0 rgba(0,0,0,0.04), 0 20px 40px -18px rgba(0,0,0,0.18)',
      color: '#1a1a1a', fontFamily: theme.body,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1.5px dashed #e4dcc9', paddingBottom: 10 }}>
        <LovepacsMark size={22} color="#1a1a1a" />
        <div style={{
          fontFamily: theme.display, fontSize: 18, fontWeight: theme.displayWeight,
          letterSpacing: theme.displayTracking,
        }}>Lovepacs</div>
        <div style={{ flex: 1, textAlign: 'right', fontFamily: theme.mono, fontSize: 10, color: '#777' }}>
          {box.warehouse.toUpperCase()} · {box.date}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
        <div style={{ padding: 6, background: '#fff', border: '1px solid #eee' }}>
          <QR size={140} seed={seed} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', fontFamily: theme.mono }}>
            Scan for recipes · EN / ES
          </div>
          <div style={{
            fontFamily: theme.display, fontWeight: theme.displayWeight,
            fontSize: 18, lineHeight: 1.15, marginTop: 6,
            letterSpacing: theme.displayTracking,
          }}>{selected.length} meals in this box</div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 6, lineHeight: 1.4 }}>
            {selected.map(r => r.title.en).join(' · ')}
          </div>
          <div style={{ fontFamily: theme.mono, fontSize: 9.5, color: '#888', marginTop: 10 }}>
            {url}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1.5px dashed #e4dcc9', fontSize: 9.5, color: '#888', textAlign: 'center', fontFamily: theme.mono }}>
        {box.event || 'Weekly distribution'} · Serves ~{box.servings}
      </div>
    </div>
  );
}

Object.assign(window, { PickerStep, LabelsStep });
