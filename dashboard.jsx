// dashboard.jsx — Dashboard + Love Boxes screens (exports to window)

function DashboardScreen({ theme, warehouse, onStartMenu }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const recentBoxes = [
    { id: 'MB-2026-1284', event: 'Spring Distribution', recipes: 4, items: 8, time: '12 min ago', state: 'Dispatched', tone: 'dispatched' },
    { id: 'MB-2026-1283', event: 'Spring Distribution', recipes: 4, items: 7, time: '28 min ago', state: 'Printed',    tone: 'ok' },
    { id: 'MB-2026-1282', event: 'Spring Distribution', recipes: 3, items: 6, time: '45 min ago', state: 'Printed',    tone: 'ok' },
    { id: 'MB-2026-1281', event: 'School — Plano ISD',  recipes: 4, items: 9, time: '1h 10m ago', state: 'Draft',      tone: 'draft' },
  ];

  const schedule = [
    { day: 'MON', label: 'Spring Distribution — Frisco',  boxes: 32, done: true },
    { day: 'TUE', label: 'Community pack — McKinney',     boxes: 14, done: true },
    { day: 'WED', label: 'School partnership — Plano ISD',boxes: 22, done: true },
    { day: 'THU', label: 'Standard Love Boxes',           boxes: 16, done: false, today: true },
    { day: 'FRI', label: 'Weekend prep pack',             boxes: 0,  done: false, upcoming: true },
  ];

  const stateStyle = (tone) => ({
    fontSize: 11, fontFamily: theme.mono, textTransform: 'uppercase', letterSpacing: '0.1em',
    padding: '4px 10px', borderRadius: 999,
    background: tone === 'ok' || tone === 'dispatched' ? theme.soft : theme.bg,
    color: tone === 'ok' || tone === 'dispatched' ? theme.accent : theme.muted,
    border: tone === 'draft' ? `1px dashed ${theme.line}` : 'none',
  });

  return (
    <div style={{ padding: '28px 36px 48px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: theme.mono }}>
          {today} · {warehouse} Warehouse
        </div>
        <div style={{
          fontFamily: theme.display, fontWeight: theme.displayWeight,
          fontSize: 36, letterSpacing: theme.displayTracking, lineHeight: 1.05,
          marginTop: 8,
        }}>Good morning, Kai.</div>
        <div style={{ fontSize: 15, color: theme.muted, marginTop: 8, lineHeight: 1.6 }}>
          Every box you pack today carries a home-cooked meal to a family that needs it.{' '}
          <span style={{ color: theme.ink, fontWeight: 500 }}>7 families are still waiting on their box</span> — let's finish strong.
        </div>
      </div>

      {/* Primary CTA */}
      <div onClick={onStartMenu} style={{
        cursor: 'pointer',
        background: theme.ink, color: theme.paper,
        borderRadius: 18, padding: '28px 32px',
        display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center',
        gap: 24, marginBottom: 24,
      }}>
        <div>
          <div style={{
            fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em',
            fontFamily: theme.mono, opacity: 0.6,
          }}>Start here</div>
          <div style={{
            fontFamily: theme.display, fontWeight: theme.displayWeight,
            fontSize: 28, letterSpacing: theme.displayTracking, lineHeight: 1.1,
            marginTop: 6,
          }}>Pack a New Love Box</div>
          <div style={{ fontSize: 14, opacity: 0.75, marginTop: 8, maxWidth: 560, lineHeight: 1.6 }}>
            A family will open this box and find recipes written just for what's inside.
            Log the ingredients, generate their meals, and send them off with a QR code that turns groceries into dinner.
          </div>
        </div>
        <div style={{
          width: 64, height: 64, borderRadius: 16, flexShrink: 0,
          background: theme.accent, color: theme.paper,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="5" y="9" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M5 13h18M11 9V7a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M11 17h6M14 15v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <DashKpi theme={theme} label="Boxes out today"     value="16"    meta="9 on their way · 7 to go" />
        <DashKpi theme={theme} label="Meals this week"    value="336"   meta="84 boxes · 4 recipes each" />
        <DashKpi theme={theme} label="Running low"        value="3"     meta="Tuna · Broth · Cornmeal" tone="warn" />
        <DashKpi theme={theme} label="Families nourished" value="1,280" meta="so far this year" tone="accent" />
      </div>

      {/* Bottom two-column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>

        {/* Recent Love Boxes */}
        <div style={{ background: theme.paper, border: `1px solid ${theme.line}`, borderRadius: 14, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <div style={{ fontFamily: theme.display, fontWeight: theme.displayWeight, fontSize: 18, letterSpacing: theme.displayTracking }}>
              Boxes out the door
            </div>
            <div style={{ fontSize: 12, color: theme.muted, fontFamily: theme.mono, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Last 24h</div>
          </div>
          {recentBoxes.map((b, i, arr) => (
            <div key={b.id} style={{
              display: 'grid', gridTemplateColumns: '1.3fr 1.1fr 0.7fr 0.9fr auto',
              alignItems: 'center', gap: 12,
              padding: '11px 0', borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${theme.line}`,
            }}>
              <div style={{ fontFamily: theme.mono, fontSize: 12, color: theme.ink, fontWeight: 600 }}>{b.id}</div>
              <div style={{ fontSize: 12, color: theme.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.event}</div>
              <div style={{ fontSize: 12, color: theme.muted }}>{b.recipes} recipes</div>
              <div style={{ fontSize: 12, color: theme.muted }}>{b.time}</div>
              <div style={stateStyle(b.tone)}>{b.state}</div>
            </div>
          ))}
        </div>

        {/* Distribution schedule */}
        <div style={{ background: theme.paper, border: `1px solid ${theme.line}`, borderRadius: 14, padding: 20 }}>
          <div style={{ fontFamily: theme.display, fontWeight: theme.displayWeight, fontSize: 18, letterSpacing: theme.displayTracking, marginBottom: 14 }}>
            Families we're reaching
          </div>
          {schedule.map((d, i, arr) => (
            <div key={d.day} style={{
              display: 'grid', gridTemplateColumns: '42px 1fr auto',
              alignItems: 'center', gap: 12,
              padding: '10px 0', borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${theme.line}`,
              opacity: d.upcoming ? 0.45 : 1,
            }}>
              <div style={{
                fontFamily: theme.mono, fontSize: 11, letterSpacing: '0.1em',
                color: d.today ? theme.accent : theme.muted,
                fontWeight: d.today ? 700 : 400,
              }}>{d.day}</div>
              <div style={{
                fontSize: 13, color: theme.ink,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                {d.today && (
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: theme.accent, flexShrink: 0 }} />
                )}
                {d.done && !d.today && (
                  <svg width="12" height="12" viewBox="0 0 12 12" style={{ flexShrink: 0 }}>
                    <circle cx="6" cy="6" r="5" stroke={theme.muted} strokeWidth="1.2" fill="none"/>
                    <path d="M3.5 6l2 2 3-3" stroke={theme.muted} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {d.label}
              </div>
              <div style={{ fontFamily: theme.mono, fontSize: 13, color: d.today ? theme.accent : theme.ink, fontWeight: 600 }}>
                {d.boxes || '—'}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

function DashKpi({ theme, label, value, meta, tone }) {
  const tones = { warn: '#8B3A12', accent: theme.accent, default: theme.ink };
  return (
    <div style={{
      padding: 18, background: theme.paper, border: `1px solid ${theme.line}`, borderRadius: 14,
    }}>
      <div style={{ fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: theme.mono }}>
        {label}
      </div>
      <div style={{
        fontFamily: theme.display, fontWeight: theme.displayWeight,
        fontSize: 32, letterSpacing: theme.displayTracking, lineHeight: 1,
        marginTop: 10, color: tones[tone] || tones.default,
      }}>{value}</div>
      <div style={{ fontSize: 12, color: theme.muted, marginTop: 8 }}>{meta}</div>
    </div>
  );
}

function PackedBoxesScreen({ theme, warehouse }) {
  const boxes = [
    { id: 'BX-2026-1284', event: 'Christmas Distribution 2026', date: 'Dec 18, 2026', family: '~4 people', recipes: ['Spaghetti Marinara','Black Bean & Rice','Chicken Soup'], state: 'Printed' },
    { id: 'BX-2026-1283', event: 'Christmas Distribution 2026', date: 'Dec 18, 2026', family: '~4 people', recipes: ['Tuna Pasta','Bean Chili','Oat Porridge'], state: 'Printed' },
    { id: 'BX-2026-1282', event: '—',                           date: 'Dec 18, 2026', family: '~2 people', recipes: ['Spaghetti Marinara','Peanut Butter Oats'], state: 'Draft' },
    { id: 'BX-2026-1281', event: 'Christmas Distribution 2026', date: 'Dec 18, 2026', family: '~4 people', recipes: ['Black Bean & Rice','Chicken Soup','Corn Pudding'], state: 'Printed' },
    { id: 'BX-2026-1280', event: 'Christmas Distribution 2026', date: 'Dec 17, 2026', family: '~6 people', recipes: ['Spaghetti Marinara','Tuna Pasta','Peach Oats'], state: 'Printed' },
  ];
  return (
    <div style={{ padding: '28px 36px 48px' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: theme.mono }}>
          {warehouse} warehouse
        </div>
        <div style={{
          fontFamily: theme.display, fontWeight: theme.displayWeight,
          fontSize: 32, letterSpacing: theme.displayTracking, lineHeight: 1.05,
          marginTop: 6,
        }}>Love Boxes</div>
      </div>

      <div style={{
        background: theme.paper, border: `1px solid ${theme.line}`,
        borderRadius: 14, overflow: 'hidden',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 1.5fr 1fr 0.9fr 2fr 0.8fr',
          padding: '12px 18px', gap: 14,
          fontFamily: theme.mono, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em',
          color: theme.muted, borderBottom: `1px solid ${theme.line}`, background: theme.bg,
        }}>
          <div>Box ID</div>
          <div>Event</div>
          <div>Date</div>
          <div>Family</div>
          <div>Recipes</div>
          <div>Status</div>
        </div>
        {boxes.map((b, i) => (
          <div key={b.id} style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 1.5fr 1fr 0.9fr 2fr 0.8fr',
            padding: '14px 18px', gap: 14, alignItems: 'center',
            borderBottom: i === boxes.length - 1 ? 'none' : `1px solid ${theme.line}`,
          }}>
            <div style={{ fontFamily: theme.mono, fontSize: 13, color: theme.ink, fontWeight: 600 }}>{b.id}</div>
            <div style={{ fontSize: 13, color: theme.ink }}>{b.event}</div>
            <div style={{ fontSize: 13, color: theme.muted }}>{b.date}</div>
            <div style={{ fontSize: 13, color: theme.muted }}>{b.family}</div>
            <div style={{ fontSize: 13, color: theme.ink }}>{b.recipes.join(' · ')}</div>
            <div>
              <span style={{
                fontSize: 11, fontFamily: theme.mono, textTransform: 'uppercase', letterSpacing: '0.1em',
                padding: '4px 10px', borderRadius: 999,
                background: b.state === 'Printed' ? theme.soft : 'transparent',
                color: b.state === 'Printed' ? theme.accent : theme.muted,
                border: b.state === 'Draft' ? `1px dashed ${theme.line}` : 'none',
              }}>{b.state}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { DashboardScreen, PackedBoxesScreen });
