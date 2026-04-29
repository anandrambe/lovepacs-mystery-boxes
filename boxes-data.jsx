// boxes-data.jsx — Love Box sample fixtures
// ─────────────────────────────────────────────────────────────────
// Box ID format:  LB-{YYYY}-{WH3}-{NNNN}
//
//   LB   = Love Box prefix
//   YYYY = dispatch year (e.g. 2026)
//   WH3  = 3-letter warehouse code:
//            FRS = Frisco       DAL = Dallas       PLN = Plano
//            MCK = McKinney     ALN = Allen        PRS = Prosper
//            LEL = Little Elm   LWS = Lewisville
//            (unknown → first 3 uppercase letters of warehouse name)
//   NNNN = zero-padded sequence per warehouse per year (0001, 0002 …)
//
//   Examples:  LB-2026-FRS-0001  LB-2026-PLN-0003  LB-2026-DAL-0012
// ─────────────────────────────────────────────────────────────────

const STATUSES = ['Draft', 'Finalized', 'Printed', 'Dispatched'];

// Warehouse name → 3-letter code used in every box ID
function warehouseCode(w) {
  const table = {
    'Frisco':     'FRS',
    'Dallas':     'DAL',
    'Plano':      'PLN',
    'McKinney':   'MCK',
    'Allen':      'ALN',
    'Prosper':    'PRS',
    'Little Elm': 'LEL',
    'Lewisville': 'LWS',
  };
  return table[w] || w.replace(/\s+/g, '').slice(0, 3).toUpperCase();
}

// Sample boxes — previously dispatched / in progress
// Listed newest-first; sequence numbers are per-warehouse (oldest = 0001)
const LOVE_BOXES = [
  {
    id: 'LB-2026-FRS-0002',
    region: 'Frisco',
    address: '1420 Legacy Dr · Frisco, TX 75034',
    dispatchDate: '2026-04-18',
    families: 32,
    meals4p: 3,
    meals2p: 1,
    recipesCount: 4,
    status: 'Dispatched',
    qrUrl: 'lovepacs.org/b/LB-2026-FRS-0002',
    event: 'Christmas Distribution 2026',
    items: [
      { id: 'spaghetti', qty: 2 }, { id: 'marinara', qty: 2 }, { id: 'tuna', qty: 4 },
      { id: 'blackbeans', qty: 3 }, { id: 'ricewhite', qty: 1 }, { id: 'cornkernels', qty: 2 },
      { id: 'chickenbroth', qty: 2 }, { id: 'tomatoes', qty: 2 },
    ],
    recipes: ['pantry-spag', 'oven-bake'],
    printed: true,
    dispatchedAt: '2026-04-18 09:14',
  },
  {
    id: 'LB-2026-PLN-0002',
    region: 'Plano',
    address: '3801 W Parker Rd · Plano, TX 75023',
    dispatchDate: '2026-04-18',
    families: 18,
    meals4p: 2,
    meals2p: 2,
    recipesCount: 4,
    status: 'Dispatched',
    qrUrl: 'lovepacs.org/b/LB-2026-PLN-0002',
    event: 'Christmas Distribution 2026',
    items: [
      { id: 'spaghetti', qty: 1 }, { id: 'marinara', qty: 1 }, { id: 'tuna', qty: 2 },
      { id: 'blackbeans', qty: 2 }, { id: 'ricewhite', qty: 1 }, { id: 'cornkernels', qty: 1 },
      { id: 'chickenbroth', qty: 1 }, { id: 'tomatoes', qty: 1 }, { id: 'peaches', qty: 1 },
    ],
    recipes: ['arroz-frijol', 'cowboy'],
    printed: true,
    dispatchedAt: '2026-04-18 08:41',
  },
  {
    id: 'LB-2026-MCK-0001',
    region: 'McKinney',
    address: '2200 W White Ave · McKinney, TX 75071',
    dispatchDate: '2026-04-17',
    families: 24,
    meals4p: 3,
    meals2p: 1,
    recipesCount: 4,
    status: 'Printed',
    qrUrl: 'lovepacs.org/b/LB-2026-MCK-0001',
    event: 'School partnership',
    items: [
      { id: 'spaghetti', qty: 1 }, { id: 'marinara', qty: 1 }, { id: 'tuna', qty: 2 },
      { id: 'blackbeans', qty: 2 }, { id: 'ricewhite', qty: 2 }, { id: 'cornkernels', qty: 1 },
      { id: 'chickenbroth', qty: 1 }, { id: 'oats', qty: 1 }, { id: 'peanutbutter', qty: 1 },
    ],
    recipes: ['pantry-spag', 'arroz-frijol'],
    printed: true,
  },
  {
    id: 'LB-2026-LEL-0001',
    region: 'Little Elm',
    address: '301 S Main St · Little Elm, TX 75068',
    dispatchDate: '2026-04-17',
    families: 14,
    meals4p: 2,
    meals2p: 2,
    recipesCount: 4,
    status: 'Finalized',
    qrUrl: 'lovepacs.org/b/LB-2026-LEL-0001',
    event: 'Standard packs',
    items: [
      { id: 'spaghetti', qty: 1 }, { id: 'marinara', qty: 1 }, { id: 'tuna', qty: 2 },
      { id: 'blackbeans', qty: 1 }, { id: 'ricewhite', qty: 1 }, { id: 'cornkernels', qty: 1 },
    ],
    recipes: ['oven-bake', 'cowboy'],
    printed: false,
  },
  {
    id: 'LB-2026-FRS-0001',
    region: 'Frisco',
    address: '—',
    dispatchDate: '2026-04-19',
    families: 20,
    meals4p: 3,
    meals2p: 0,
    recipesCount: 3,
    status: 'Draft',
    qrUrl: null,
    event: 'Standard packs',
    items: [
      { id: 'spaghetti', qty: 1 }, { id: 'marinara', qty: 1 }, { id: 'blackbeans', qty: 1 },
      { id: 'ricewhite', qty: 1 }, { id: 'cornkernels', qty: 1 },
    ],
    recipes: ['pantry-spag', 'arroz-frijol'],
    printed: false,
  },
  {
    id: 'LB-2026-PRS-0001',
    region: 'Prosper',
    address: '605 E First St · Prosper, TX 75078',
    dispatchDate: '2026-04-16',
    families: 11,
    meals4p: 1,
    meals2p: 3,
    recipesCount: 4,
    status: 'Dispatched',
    qrUrl: 'lovepacs.org/b/LB-2026-PRS-0001',
    event: 'Church partnership',
    items: [
      { id: 'spaghetti', qty: 1 }, { id: 'marinara', qty: 1 }, { id: 'tuna', qty: 2 },
      { id: 'oats', qty: 1 }, { id: 'peanutbutter', qty: 1 }, { id: 'peaches', qty: 1 },
    ],
    recipes: ['pantry-spag', 'cowboy'],
    printed: true,
    dispatchedAt: '2026-04-16 11:02',
  },
  {
    id: 'LB-2026-ALN-0001',
    region: 'Allen',
    address: '900 Central Expy S · Allen, TX 75013',
    dispatchDate: '2026-04-15',
    families: 28,
    meals4p: 2,
    meals2p: 2,
    recipesCount: 4,
    status: 'Dispatched',
    qrUrl: 'lovepacs.org/b/LB-2026-ALN-0001',
    event: 'Standard packs',
    items: [
      { id: 'spaghetti', qty: 2 }, { id: 'marinara', qty: 2 }, { id: 'tuna', qty: 3 },
      { id: 'blackbeans', qty: 2 }, { id: 'ricewhite', qty: 2 }, { id: 'cornkernels', qty: 2 },
    ],
    recipes: ['arroz-frijol', 'oven-bake'],
    printed: true,
    dispatchedAt: '2026-04-15 10:30',
  },
  {
    id: 'LB-2026-PLN-0001',
    region: 'Plano',
    address: '1600 Preston Rd · Plano, TX 75093',
    dispatchDate: '2026-04-15',
    families: 9,
    meals4p: 2,
    meals2p: 1,
    recipesCount: 3,
    status: 'Dispatched',
    qrUrl: 'lovepacs.org/b/LB-2026-PLN-0001',
    event: 'Standard packs',
    items: [
      { id: 'spaghetti', qty: 1 }, { id: 'marinara', qty: 1 }, { id: 'blackbeans', qty: 1 },
      { id: 'ricewhite', qty: 1 },
    ],
    recipes: ['pantry-spag', 'oven-bake'],
    printed: true,
    dispatchedAt: '2026-04-15 09:02',
  },
];

window.STATUSES     = STATUSES;
window.warehouseCode = warehouseCode;
window.LOVE_BOXES   = LOVE_BOXES;
