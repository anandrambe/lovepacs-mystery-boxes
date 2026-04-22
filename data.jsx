// data.jsx — sample food items and recipes (EN/ES)

const FOOD_CATALOG = [
  { id: 'spaghetti', name: 'Barilla Spaghetti', nameEs: 'Espagueti Barilla', measure: '16 oz', category: 'Grains' },
  { id: 'marinara', name: 'Marinara Sauce', nameEs: 'Salsa marinara', measure: '24 oz jar', category: 'Canned' },
  { id: 'tuna', name: 'Chunk Light Tuna', nameEs: 'Atún en trozos', measure: '5 oz can', category: 'Protein' },
  { id: 'blackbeans', name: 'Black Beans', nameEs: 'Frijoles negros', measure: '15 oz can', category: 'Canned' },
  { id: 'ricewhite', name: 'Long-Grain White Rice', nameEs: 'Arroz blanco grano largo', measure: '2 lb bag', category: 'Grains' },
  { id: 'cornkernels', name: 'Sweet Corn', nameEs: 'Maíz dulce', measure: '15 oz can', category: 'Canned' },
  { id: 'chickenbroth', name: 'Chicken Broth', nameEs: 'Caldo de pollo', measure: '32 oz', category: 'Canned' },
  { id: 'tomatoes', name: 'Diced Tomatoes', nameEs: 'Tomates en cubos', measure: '14.5 oz can', category: 'Canned' },
  { id: 'peanutbutter', name: 'Peanut Butter', nameEs: 'Mantequilla de maní', measure: '16 oz jar', category: 'Pantry' },
  { id: 'oats', name: 'Rolled Oats', nameEs: 'Avena', measure: '18 oz', category: 'Grains' },
  { id: 'peaches', name: 'Sliced Peaches', nameEs: 'Duraznos en rodajas', measure: '15 oz can', category: 'Fruit' },
  { id: 'cornmeal', name: 'Yellow Cornmeal', nameEs: 'Harina de maíz amarilla', measure: '24 oz', category: 'Grains' },
];

// Sample "input" — what staff would have entered for this Dec 2026 Frisco box
const SAMPLE_BOX = {
  date: '2026-12-18',
  event: 'Christmas Distribution 2026',
  warehouse: 'Frisco',
  servings: 4,
  items: [
    { id: 'spaghetti', qty: 1 },
    { id: 'marinara', qty: 1 },
    { id: 'tuna', qty: 2 },
    { id: 'blackbeans', qty: 2 },
    { id: 'ricewhite', qty: 1 },
    { id: 'cornkernels', qty: 1 },
    { id: 'chickenbroth', qty: 1 },
    { id: 'tomatoes', qty: 1 },
  ],
};

// Candidate recipes — Generator returns up to 4; staff picks up to 3
const RECIPES = [
  {
    id: 'pantry-spag',
    title: { en: 'Pantry Spaghetti with Tuna & Tomato', es: 'Espagueti de despensa con atún y tomate' },
    time: '25 min',
    equipment: { en: 'Stovetop, 1 pot + 1 pan', es: 'Estufa, 1 olla + 1 sartén' },
    servings: 4,
    missing: null,
    tags: ['Stovetop', '25 min', '1 pot'],
    ingredients: [
      { name: { en: 'Spaghetti', es: 'Espagueti' }, amount: { en: '12 oz', es: '340 g' }, source: 'box' },
      { name: { en: 'Marinara sauce', es: 'Salsa marinara' }, amount: { en: '1 jar', es: '1 frasco' }, source: 'box' },
      { name: { en: 'Chunk light tuna, drained', es: 'Atún en trozos, escurrido' }, amount: { en: '2 cans', es: '2 latas' }, source: 'box' },
      { name: { en: 'Diced tomatoes', es: 'Tomates en cubos' }, amount: { en: '1 can', es: '1 lata' }, source: 'box' },
      { name: { en: 'Olive or cooking oil', es: 'Aceite de oliva o cocina' }, amount: { en: '2 tbsp', es: '2 cdas' }, source: 'staple' },
      { name: { en: 'Salt & pepper', es: 'Sal y pimienta' }, amount: { en: 'to taste', es: 'al gusto' }, source: 'staple' },
    ],
    steps: {
      en: [
        'Bring a pot of salted water to a boil. Cook spaghetti according to the package, then drain.',
        'While pasta cooks, warm oil in a pan over medium heat. Add the diced tomatoes and cook 3 minutes.',
        'Stir in the marinara and drained tuna. Simmer 5 minutes, breaking up the tuna gently.',
        'Season with salt and pepper. Toss with the drained spaghetti and serve warm.',
      ],
      es: [
        'Hierva agua con sal en una olla. Cocine el espagueti según el paquete y escurra.',
        'Mientras, caliente el aceite en una sartén a fuego medio. Agregue los tomates y cocine 3 minutos.',
        'Incorpore la salsa marinara y el atún escurrido. Cocine a fuego lento 5 minutos.',
        'Sazone con sal y pimienta. Mezcle con el espagueti y sirva caliente.',
      ],
    },
  },
  {
    id: 'arroz-frijol',
    title: { en: 'Black Bean & Corn Rice Bowl', es: 'Bowl de arroz con frijol negro y maíz' },
    time: '30 min',
    equipment: { en: 'Stovetop, 1 pot + 1 pan', es: 'Estufa, 1 olla + 1 sartén' },
    servings: 4,
    missing: null,
    tags: ['Stovetop', '30 min', 'Vegetarian'],
    ingredients: [
      { name: { en: 'Long-grain white rice', es: 'Arroz blanco grano largo' }, amount: { en: '1½ cups', es: '1½ tazas' }, source: 'box' },
      { name: { en: 'Chicken broth', es: 'Caldo de pollo' }, amount: { en: '3 cups', es: '3 tazas' }, source: 'box' },
      { name: { en: 'Black beans, drained', es: 'Frijoles negros escurridos' }, amount: { en: '2 cans', es: '2 latas' }, source: 'box' },
      { name: { en: 'Sweet corn, drained', es: 'Maíz dulce escurrido' }, amount: { en: '1 can', es: '1 lata' }, source: 'box' },
      { name: { en: 'Diced tomatoes', es: 'Tomates en cubos' }, amount: { en: '½ can', es: '½ lata' }, source: 'box' },
      { name: { en: 'Salt, pepper, any spice', es: 'Sal, pimienta, especias' }, amount: { en: 'to taste', es: 'al gusto' }, source: 'staple' },
    ],
    steps: {
      en: [
        'Rinse the rice under cold water until it runs clear.',
        'Combine rice and chicken broth in a pot. Bring to a boil, cover, reduce to low, and cook 18 minutes.',
        'While rice cooks, warm beans, corn, and diced tomatoes in a pan over medium heat for 5 minutes.',
        'Season to taste. Fluff the rice and spoon the bean mixture over the top.',
      ],
      es: [
        'Enjuague el arroz con agua fría hasta que salga clara.',
        'Combine arroz y caldo de pollo en una olla. Hierva, tape, baje el fuego y cocine 18 minutos.',
        'Mientras, caliente frijoles, maíz y tomates en una sartén a fuego medio por 5 minutos.',
        'Sazone al gusto. Afloje el arroz y sirva la mezcla por encima.',
      ],
    },
  },
  {
    id: 'oven-bake',
    title: { en: 'Tuna & Rice Skillet Bake', es: 'Arroz con atún al sartén' },
    time: '35 min',
    equipment: { en: 'Stovetop + oven-safe pan', es: 'Estufa + sartén para horno' },
    servings: 4,
    missing: null,
    tags: ['Stovetop + Oven', '35 min', 'One-pan'],
    ingredients: [
      { name: { en: 'White rice', es: 'Arroz blanco' }, amount: { en: '1 cup', es: '1 taza' }, source: 'box' },
      { name: { en: 'Chicken broth', es: 'Caldo de pollo' }, amount: { en: '2 cups', es: '2 tazas' }, source: 'box' },
      { name: { en: 'Tuna, drained', es: 'Atún escurrido' }, amount: { en: '2 cans', es: '2 latas' }, source: 'box' },
      { name: { en: 'Sweet corn', es: 'Maíz dulce' }, amount: { en: '1 can', es: '1 lata' }, source: 'box' },
      { name: { en: 'Diced tomatoes', es: 'Tomates en cubos' }, amount: { en: '1 can', es: '1 lata' }, source: 'box' },
    ],
    steps: {
      en: [
        'Preheat oven to 375°F (190°C).',
        'In an oven-safe pan, combine rice, broth, corn, and half the tomatoes. Cover and simmer 10 minutes.',
        'Stir in tuna and remaining tomatoes. Cover and transfer to the oven for 20 minutes.',
        'Let rest 5 minutes before serving.',
      ],
      es: [
        'Precaliente el horno a 190 °C (375 °F).',
        'En un sartén para horno, combine arroz, caldo, maíz y la mitad de los tomates. Tape y hierva 10 minutos.',
        'Incorpore el atún y el resto de los tomates. Tape y meta al horno por 20 minutos.',
        'Deje reposar 5 minutos antes de servir.',
      ],
    },
  },
  {
    id: 'cowboy',
    title: { en: 'Cowboy Black Bean Soup', es: 'Sopa vaquera de frijol negro' },
    time: '20 min',
    equipment: { en: 'Stovetop, 1 pot', es: 'Estufa, 1 olla' },
    servings: 4,
    missing: { en: 'Onion', es: 'Cebolla' },
    tags: ['Stovetop', '20 min', 'Soup'],
    ingredients: [
      { name: { en: 'Black beans, undrained', es: 'Frijoles negros sin escurrir' }, amount: { en: '2 cans', es: '2 latas' }, source: 'box' },
      { name: { en: 'Diced tomatoes', es: 'Tomates en cubos' }, amount: { en: '1 can', es: '1 lata' }, source: 'box' },
      { name: { en: 'Sweet corn', es: 'Maíz dulce' }, amount: { en: '1 can', es: '1 lata' }, source: 'box' },
      { name: { en: 'Chicken broth', es: 'Caldo de pollo' }, amount: { en: '2 cups', es: '2 tazas' }, source: 'box' },
      { name: { en: 'Onion, chopped', es: 'Cebolla picada' }, amount: { en: '1 small', es: '1 pequeña' }, source: 'missing' },
      { name: { en: 'Salt, pepper, cumin', es: 'Sal, pimienta, comino' }, amount: { en: 'to taste', es: 'al gusto' }, source: 'staple' },
    ],
    steps: {
      en: [
        'If using onion, sauté in a pot with a splash of oil until soft — about 4 minutes.',
        'Add beans (with their liquid), tomatoes, corn, and broth. Stir well.',
        'Simmer for 10–12 minutes until hot and slightly thickened.',
        'Season to taste. Serve warm.',
      ],
      es: [
        'Si tiene cebolla, saltéela con un poco de aceite unos 4 minutos.',
        'Agregue los frijoles con su líquido, los tomates, el maíz y el caldo.',
        'Cocine a fuego lento 10–12 minutos hasta espesar ligeramente.',
        'Sazone al gusto y sirva caliente.',
      ],
    },
  },
];

window.FOOD_CATALOG = FOOD_CATALOG;
window.SAMPLE_BOX = SAMPLE_BOX;
window.RECIPES = RECIPES;
