// app.jsx — Lovepacs Recipe Generator
// Staff desktop + Client mobile, warm & human aesthetic

const { useState, useEffect, useMemo, useRef } = React;

// ─────────────────────────────────────────────────────────────
// TWEAKS (editable via toolbar)
// ─────────────────────────────────────────────────────────────
const TWEAKS = /*EDITMODE-BEGIN*/{
  "palette": "sweetgreen",
  "typography": "serif-sans",
  "density": "roomy",
  "cardLayout": "magazine",
  "clientLanguage": "en"
}/*EDITMODE-END*/;

const PALETTES = {
  sweetgreen: {
    name: 'Sweetgreen',
    bg: '#F6F4EE',
    paper: '#FFFFFF',
    ink: '#0F1A14',
    muted: '#6E7570',
    line: '#E6E3D8',
    accent: '#0B3B2E',
    accentInk: '#FFFFFF',
    soft: '#E4EBDE',
    green: '#0B3B2E',
    amber: '#C89A3C',
  },
  terracotta: {
    name: 'Terracotta',
    bg: '#F6F1E8',
    paper: '#FBF7F0',
    ink: '#2B1F17',
    muted: '#7A6A5C',
    line: '#E7DDCB',
    accent: '#C85A3B',
    accentInk: '#fff',
    soft: '#EED9CC',
    green: '#6B7A3A',
    amber: '#C98A1E',
  },
  olive: {
    name: 'Olive & Clay',
    bg: '#F1EFE6',
    paper: '#F8F6EE',
    ink: '#24281A',
    muted: '#6F7263',
    line: '#DDDBCB',
    accent: '#5C6B3C',
    accentInk: '#fff',
    soft: '#D8DCBF',
    green: '#5C6B3C',
    amber: '#B8832C',
  },
  paprika: {
    name: 'Paprika',
    bg: '#FBF3EC',
    paper: '#FFFAF3',
    ink: '#321912',
    muted: '#8A6A5A',
    line: '#EBDACB',
    accent: '#A23E1E',
    accentInk: '#fff',
    soft: '#F3D6C0',
    green: '#7A7A33',
    amber: '#D08A1C',
  },
};

const TYPE = {
  'serif-sans': {
    name: 'Serif display + sans text',
    display: '"Fraunces", Georgia, serif',
    displayWeight: 600,
    displayTracking: '-0.02em',
    body: '"Inter", system-ui, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, monospace',
  },
  'all-sans': {
    name: 'All sans (utility)',
    display: '"Inter", system-ui, sans-serif',
    displayWeight: 700,
    displayTracking: '-0.03em',
    body: '"Inter", system-ui, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, monospace',
  },
  'editorial': {
    name: 'Editorial (serif)',
    display: '"DM Serif Display", Georgia, serif',
    displayWeight: 400,
    displayTracking: '-0.01em',
    body: '"DM Sans", system-ui, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, monospace',
  },
};

// Regions (used by the Mystery Boxes listing + new-box wizard)
const REGIONS = ['Frisco', 'Little Elm', 'Plano', 'McKinney', 'Allen', 'Prosper'];

window.TWEAKS = TWEAKS;
window.PALETTES = PALETTES;
window.TYPE = TYPE;
window.REGIONS = REGIONS;
