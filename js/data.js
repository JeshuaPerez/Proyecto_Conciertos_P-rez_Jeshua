/* =============================================
   DATA LAYER — seed defaults, CRUD helpers
   ============================================= */

const KEYS = {
  CATEGORIES: 'cc_categories',
  EVENTS:     'cc_events',
  SALES:      'cc_sales',
  CART:       'cc_cart',
};

const CITIES = [
  'Ciudad de Guatemala',
  'Quetzaltenango (Xela)',
  'Antigua Guatemala',
  'Mazatenango',
  'Cobán',
  'Fórum Majadas',
];

/* ---- Seed data ---- */
const DEFAULT_CATEGORIES = [
  { id: 'c1', name: 'Rock',        description: 'Conciertos de rock nacional e internacional' },
  { id: 'c2', name: 'Pop',         description: 'Los mejores artistas pop del momento' },
  { id: 'c3', name: 'Electrónica', description: 'Festivales y shows de música electrónica' },
  { id: 'c4', name: 'Reggaeton',   description: 'Urbano, trap y reggaeton' },
  { id: 'c5', name: 'Jazz & Blues', description: 'Veladas de jazz y blues en vivo' },
];

const DEFAULT_EVENTS = [
  {
    id: 'e1', code: 'CC-001', name: 'Fuerza Regida en Ciudad de Guatemala',
    categoryId: 'c4', price: 1200, date: '2026-05-15', time: '20:00',
    city: 'Ciudad de Guatemala', description: 'La agrupación mexicana llega con su gira "Pero No Te Enamores". Una noche épica de corridos tumbados y música urbana.',
    image: 'https://www.billboard.com/wp-content/uploads/2025/02/Fuerza-Regida-cr-Street-Mob-Records-press-2025-billboard-1548.jpg?w=942&h=628&crop=1'
  },
  {
    id: 'e2', code: 'CC-002', name: 'Festival Estéreo Picnic',
    categoryId: 'c1', price: 350, date: '2026-03-28', time: '14:00',
    city: 'Quetzaltenango (Xela)', description: 'El festival más importante de Xela regresa con un lineup internacional sorprendente.',
    image: 'https://i0.wp.com/plus.cusica.com/wp-content/uploads/2025/03/Estereo-Picnic.webp?fit=1280%2C720&ssl=1'
  },
  {
    id: 'e3', code: 'CC-003', name: 'Noche de Jazz en Antigua Guatemala',
    categoryId: 'c5', price: 800, date: '2026-04-10', time: '19:30',
    city: 'Antigua Guatemala', description: 'Una velada íntima con los mejores exponentes del jazz colombiano en el corazón de Ciudad Vieja.',
    image: 'https://www.guatemala.com/fotos/2026/03/Guatemala-Jazz-Festival-2026-885x500.webp'
  },
  {
    id: 'e4', code: 'CC-004', name: 'Electro Night Mazatenango',
    categoryId: 'c3', price: 950, date: '2026-06-20', time: '22:00',
    city: 'Mazatenango', description: 'Los mejores DJs internacionales toman el departamento de Mazate. Bass, techno y house toda la noche.',
    image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/12/40/6d/our-bar-on-a-busy-night.jpg?w=1200&h=-1&s=1'
  },
  {
    id: 'e5', code: 'CC-005', name: 'Juanes — Tour Vida Cotidiana',
    categoryId: 'c1', price: 200, date: '2026-07-05', time: '21:00',
    city: 'Cobán', description: 'El ícono del rock latino en un concierto íntimo y especial en Cobán.',
    image: 'https://elcafelatino.org/wp-content/uploads/2021/01/ROMPAN-TODO-image-couverture-article-1043x640.jpg'
  },
  {
    id: 'e6', code: 'CC-006', name: 'Karol G — Mañana Será Bonito',
    categoryId: 'c4', price: 280, date: '2025-08-12', time: '20:30',
    city: 'Fórum Majadas', description: 'La Bichota llega a Fórum Majadas en el tour más esperado del año.',
    image: 'https://www.guatemala.com/fotos/2023/09/Cuando-vendra-Karol-G-a-Guatemala-885x500.jpg'
  },
];

/* ---- Init ---- */
function initData() {
  if (!Storage.get(KEYS.CATEGORIES)) Storage.set(KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  if (!Storage.get(KEYS.EVENTS))     Storage.set(KEYS.EVENTS, DEFAULT_EVENTS);
  if (!Storage.get(KEYS.SALES))      Storage.set(KEYS.SALES, []);
  if (!Storage.get(KEYS.CART))       Storage.set(KEYS.CART, []);
}

/* ---- Categories CRUD ---- */
const CategoryDB = {
  getAll()         { return Storage.get(KEYS.CATEGORIES) || []; },
  getById(id)      { return this.getAll().find(c => c.id === id) || null; },
  add(data)        { const all = this.getAll(); const item = { id: 'c' + Date.now(), ...data }; Storage.set(KEYS.CATEGORIES, [...all, item]); return item; },
  update(id, data) { const all = this.getAll().map(c => c.id === id ? { ...c, ...data } : c); Storage.set(KEYS.CATEGORIES, all); },
  delete(id)       { Storage.set(KEYS.CATEGORIES, this.getAll().filter(c => c.id !== id)); },
};

/* ---- Events CRUD ---- */
const EventDB = {
  getAll()         { return Storage.get(KEYS.EVENTS) || []; },
  getById(id)      { return this.getAll().find(e => e.id === id) || null; },
  add(data)        { const all = this.getAll(); const item = { id: 'e' + Date.now(), ...data }; Storage.set(KEYS.EVENTS, [...all, item]); return item; },
  update(id, data) { const all = this.getAll().map(e => e.id === id ? { ...e, ...data } : e); Storage.set(KEYS.EVENTS, all); },
  delete(id)       { Storage.set(KEYS.EVENTS, this.getAll().filter(e => e.id !== id)); },
};

/* ---- Sales CRUD ---- */
const SaleDB = {
  getAll()    { return (Storage.get(KEYS.SALES) || []).sort((a, b) => new Date(b.date) - new Date(a.date)); },
  getById(id) { return this.getAll().find(s => s.id === id) || null; },
  add(data)   { const all = Storage.get(KEYS.SALES) || []; const item = { id: 's' + Date.now(), date: new Date().toISOString(), ...data }; Storage.set(KEYS.SALES, [...all, item]); return item; },
};

/* ---- Cart ---- */
const CartDB = {
  getAll()    { return Storage.get(KEYS.CART) || []; },
  add(eventId) {
    const cart = this.getAll();
    if (!cart.find(i => i.eventId === eventId)) {
      Storage.set(KEYS.CART, [...cart, { eventId, qty: 1 }]);
      return true;
    }
    return false; // already in cart
  },
  updateQty(eventId, qty) {
    const cart = this.getAll().map(i => i.eventId === eventId ? { ...i, qty } : i);
    Storage.set(KEYS.CART, cart);
  },
  remove(eventId) { Storage.set(KEYS.CART, this.getAll().filter(i => i.eventId !== eventId)); },
  clear()         { Storage.set(KEYS.CART, []); },
  count()         { return this.getAll().reduce((s, i) => s + i.qty, 0); },
};

/* ---- Helpers ---- */
function formatPrice(n) {
  return 'Q ' + new Intl.NumberFormat('es-GT').format(n);
}

function formatDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('es-GT', { day: '2-digit', month: 'long', year: 'numeric' });
}

initData();