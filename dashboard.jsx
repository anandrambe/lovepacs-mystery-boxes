// dashboard.jsx — Dashboard + Love Boxes screens (exports to window)

function DashboardScreen({ theme, warehouse, onStartMenu }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div style={{ padding: '28px 36px 48px' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: theme.mono }}>
          {today} · {warehouse}
        </div>
        <div style={{
          fontFamily: theme.display, fontWeight: theme.displayWeight,
          fontSize: 36, letterSpacing: theme.displayTracking, lineHeight: 1.05,
          marginTop: 8,
        }}>Good morning, Kai.</div>
        <div style={{ fontSize: 15, color: theme.muted, marginTop: 8 }}>
          12 boxes scheduled to ship today. Inventory on track.
        </div>
      </div>

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
          }}>Primary workflow</div>
          <div style={{
            fontFamily: theme.display, fontWeight: theme.displayWeight,
            fontSize: 28, letterSpacing: theme.displayTracking, lineHeight: 1.1,
            marginTop: 6,
          }}>Start the Menu Generator</div>
          <div style={{ fontSize: 14, opacity: 0.75, marginTop: 8, maxWidth: 560 }}>
            Record what's going in a new box, pick three recipes from the generator,
            and print the QR label — in under 90 seconds.
          </div>
        </div>
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: theme.accent, color: theme.paper,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="26" height="26" viewBox="0 0 26 26">
            <path d="M5 13h16M14 6l7 7-7 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <DashKpi theme={theme} label="Boxes today" value="12" meta="4 packed · 8 to go" />
        <DashKpi theme={theme} label="This week" value="84" meta="+18 vs. last" />
        <DashKpi theme={theme} label="Low-stock SKUs" value="3" meta="Tuna, Broth, Cornmeal" tone="warn" />
        <DashKpi theme={theme} label="Families reached" value="1,280" meta="YTD 2026" tone="accent" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        <div style={{
          background: theme.paper, border: `1px solid ${theme.line}`,
          borderRadius: 14, padding: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <div style={{
              fontFamily: theme.display, fontWeight: theme.displayWeight,
              fontSize: 18, letterSpacing: theme.displayTracking,
            }}>Recent boxes</div>
            <div style={{ fontSize: 12, color: theme.muted, fontFamily: theme.mono, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Last 24h</div>
          </div>
          {[
            { id: 'BX-2026-1284', recipes: 3, time: '12 min ago', state: 'Printed', tone: 'ok' },
            { id: 'BX-2026-1283', recipes: 3, time: '24 min ago', state: 'Printed', tone: 'ok' },
            { id: 'BX-2026-1282', recipes: 2, time: '41 min ago', state: 'Draft', tone: 'draft' },
            { id: 'BX-2026-1281', recipes: 3, time: '1h 3m ago',  state: 'Printed', tone: 'ok' },
          ].map((b, i, arr) => (
            <div key={b.id} style={{
              display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr auto',
              alignItems: 'center', gap: 14,
              padding: '12px 0', borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${theme.line}`,
            }}>
              <div style={{ fontFamily: theme.mono, fontSize: 13, color: theme.ink }}>{b.id}</div>
              <div style={{ fontSize: 13, color: theme.muted }}>{b.recipes} recipes</div>
              <div style={{ fontSize: 13, color: theme.muted }}>{b.time}</div>
              <div style={{
                fontSize: 11, fontFamily: theme.mono, textTransform: 'uppercase', letterSpacing: '0.1em',
                padding: '4px 10px', borderRadius: 999,
                background: b.tone === 'ok' ? theme.soft : theme.bg,
                color: b.tone === 'ok' ? theme.accent : theme.muted,
                border: b.tone === 'draft' ? `1px dashed ${theme.line}` : 'none',
              }}>{b.state}</div>
            </div>
          ))}
        </div>

        <div style={{
          background: theme.paper, border: `1px solid ${theme.line}`,
          borderRadius: 14, padding: 20,
        }}>
          <div style={{
            fontFamily: theme.display, fontWeight: theme.displayWeight,
            fontSize: 18, letterSpacing: theme.displayTracking, marginBottom: 14,
          }}>This week</div>
          {[
            { day: 'MON', label: 'Christmas Distribution', count: 32 },
            { day: 'TUE', label: 'Standard packs', count: 14 },
            { day: 'WED', label: 'Standard packs', count: 16 },
            { day: 'THU', label: 'School partnership — Plano', count: 22 },
            { day: 'FRI', label: 'Standard packs', count: 0, upcoming: true },
          ].map((d, i, arr) => (
            <div key={d.day} style={{
              display: 'grid', gridTemplateColumns: '42px 1fr auto',
              alignItems: 'center', gap: 12,
              padding: '10px 0', borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${theme.line}`,
              opacity: d.upcoming ? 0.55 : 1,
            }}>
              <div style={{ fontFamily: theme.mono, fontSize: 11, color: theme.muted, letterSpacing: '0.1em' }}>{d.day}</div>
              <div style={{ fontSize: 13, color: theme.ink }}>{d.label}</div>
              <div style={{ fontFamily: theme.mono, fontSize: 13, color: theme.ink, fontWeight: 600 }}>
                {d.count || '—'}
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
