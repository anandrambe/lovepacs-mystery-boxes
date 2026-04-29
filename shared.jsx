// shared.jsx — primitives, icons, QR, logo

function useT(p, t) {
  // theme object for styles
  return useMemo(() => ({
    bg: p.bg, paper: p.paper, ink: p.ink, muted: p.muted, line: p.line,
    accent: p.accent, accentInk: p.accentInk, soft: p.soft,
    green: p.green, amber: p.amber,
    display: t.display, displayWeight: t.displayWeight, displayTracking: t.displayTracking,
    body: t.body, mono: t.mono,
  }), [p, t]);
}

// Lovepacs brand mark (the abstract square emblem used in the printed logo)
function LovepacsMark({ size = 32, color = '#0B3B2E', accent }) {
  // Keep a programmatic mark as a fallback for the small sticker/favicon use.
  const a = accent || color;
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 40 40" fill="none" aria-label="Lovepacs">
      <rect x="1.5" y="1.5" width="37" height="37" rx="9" fill={color} />
      <path d="M9 18.5 L20 14 L31 18.5 L31 29 L20 33.5 L9 29 Z"
        stroke={a} strokeWidth="1.6" strokeLinejoin="round" fill="none"/>
      <path d="M9 18.5 L20 23 L31 18.5" stroke={a} strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M20 23 L20 33.5" stroke={a} strokeWidth="1.6"/>
      <path d="M20 13.8 C18.5 11.4, 15.4 11.4, 15.4 14.2 C15.4 16.2, 17.6 17.8, 20 19.6 C22.4 17.8, 24.6 16.2, 24.6 14.2 C24.6 11.4, 21.5 11.4, 20 13.8 Z" fill={a}/>
      <path d="M20 11.4 C20 9.6, 21.2 8.6, 22.6 8.8 C22.4 10.4, 21.3 11.3, 20 11.4 Z" fill={a}/>
    </svg>
  );
}

// Full Lovepacs logo (official brand mark + wordmark PNG). Height-controlled.
function LovepacsLogo({ height = 44 }) {
  return (
    <img
      src="assets/lovepacs-logo.png"
      alt="Lovepacs"
      style={{ height, width: 'auto', display: 'block' }}
    />
  );
}

// Minimal line icons
const Icon = {
  plus: (c='currentColor') => <svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 3v10M3 8h10" stroke={c} strokeWidth="1.6" strokeLinecap="round"/></svg>,
  minus: (c='currentColor') => <svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 8h10" stroke={c} strokeWidth="1.6" strokeLinecap="round"/></svg>,
  search: (c='currentColor') => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke={c} strokeWidth="1.5"/><path d="M10.5 10.5L14 14" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  barcode: (c='currentColor') => <svg width="18" height="16" viewBox="0 0 18 16" fill={c}><rect x="1" y="2" width="1.5" height="12"/><rect x="3.5" y="2" width="1" height="12"/><rect x="5.5" y="2" width="2" height="12"/><rect x="8.5" y="2" width="1" height="12"/><rect x="10.5" y="2" width="1.5" height="12"/><rect x="13" y="2" width="1" height="12"/><rect x="15" y="2" width="2" height="12"/></svg>,
  close: (c='currentColor') => <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 3l8 8M11 3l-8 8" stroke={c} strokeWidth="1.6" strokeLinecap="round"/></svg>,
  check: (c='currentColor') => <svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 8.5l3.5 3.5L13 5" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>,
  clock: (c='currentColor') => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke={c} strokeWidth="1.3"/><path d="M7 4v3.5L9 9" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>,
  flame: (c='currentColor') => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1C7 3 4 3.5 4 6.5 4 9 6 11 7 13c1-2 3-4 3-6.5 0-1.5-1-2-2-2.5.3 1.3-.5 2-1 2 0-1.2.5-2.5 0-5Z" stroke={c} strokeWidth="1.2" strokeLinejoin="round"/></svg>,
  print: (c='currentColor') => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6V2h8v4M4 12H2V7h12v5h-2M4 9h8v5H4z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/></svg>,
  reset: (c='currentColor') => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M12 7a5 5 0 1 1-1.5-3.5L12 5M12 2v3H9" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  arrowR: (c='currentColor') => <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 7h10M8 3l4 4-4 4" stroke={c} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  sparkle: (c='currentColor') => <svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 1l1.2 3.3L11.5 5.5 8.2 6.7 7 10 5.8 6.7 2.5 5.5 5.8 4.3z" fill={c}/><circle cx="11.5" cy="11" r="1.2" fill={c}/></svg>,
};

// Real scannable QR code — generated via api.qrserver.com (free, no auth).
// Pass the public URL as `seed`; if no protocol prefix, https:// is added.
function QR({ size = 200, seed = 'LP', color = '#111', bg = '#fff' }) {
  const data = seed.startsWith('http') ? seed : `https://${seed}`;
  const hex  = (c) => c.replace('#', '');
  const src  = `https://api.qrserver.com/v1/create-qr-code/` +
    `?size=${size}x${size}` +
    `&data=${encodeURIComponent(data)}` +
    `&color=${hex(color)}` +
    `&bgcolor=${hex(bg)}` +
    `&format=png&qzone=1`;
  return (
    <img
      src={src}
      width={size}
      height={size}
      alt="QR code"
      style={{ display: 'block', imageRendering: 'pixelated' }}
    />
  );
}

// Small UI primitives
function Chip({ children, theme, tone = 'default', style }) {
  const tones = {
    default: { bg: theme.soft, color: theme.ink },
    missing: { bg: '#FCE6D4', color: '#8B3A12' },
    staple: { bg: 'transparent', color: theme.muted, border: `1px dashed ${theme.line}` },
    accent: { bg: theme.accent, color: theme.accentInk },
    soft:   { bg: 'rgba(0,0,0,0.04)', color: theme.muted },
  };
  const s = tones[tone] || tones.default;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 999, fontSize: 12,
      fontFamily: theme.body, fontWeight: 500,
      whiteSpace: 'nowrap', letterSpacing: '0.01em',
      border: s.border || 'none', background: s.bg, color: s.color, ...style,
    }}>{children}</span>
  );
}

function Button({ children, theme, kind = 'primary', size = 'md', icon, onClick, disabled, style }) {
  const kinds = {
    primary: { bg: theme.accent, color: theme.accentInk, border: 'transparent' },
    secondary: { bg: theme.paper, color: theme.ink, border: theme.line },
    ghost: { bg: 'transparent', color: theme.ink, border: 'transparent' },
    danger: { bg: 'transparent', color: '#8B3A12', border: 'transparent' },
  };
  const sizes = {
    sm: { h: 32, px: 12, fs: 13 },
    md: { h: 40, px: 16, fs: 14 },
    lg: { h: 48, px: 22, fs: 15 },
  };
  const k = kinds[kind], s = sizes[size];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      height: s.h, padding: `0 ${s.px}px`,
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: k.bg, color: k.color,
      border: `1px solid ${k.border}`, borderRadius: 10,
      fontFamily: theme.body, fontSize: s.fs, fontWeight: 600,
      letterSpacing: '-0.005em',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      transition: 'transform 120ms ease, box-shadow 120ms ease, background 120ms ease',
      boxShadow: kind === 'primary' ? '0 1px 0 rgba(0,0,0,0.06), 0 2px 8px rgba(11,59,46,0.22)' : 'none',
      ...style,
    }}
    onMouseDown={e => e.currentTarget.style.transform = 'translateY(1px)'}
    onMouseUp={e => e.currentTarget.style.transform = 'translateY(0)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {icon}{children}
    </button>
  );
}

Object.assign(window, { useT, LovepacsMark, LovepacsLogo, Icon, QR, Chip, Button });
