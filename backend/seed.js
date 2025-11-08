import { getDb } from './db.js';

const LOCAL_SEED = [
  { id: 1, name: 'Wireless Headphones', price: 199.99, image: '' },
  { id: 2, name: 'Mechanical Keyboard', price: 89.5, image: '' },
  { id: 3, name: 'USB-C Hub 7-in-1', price: 39.99, image: '' },
  { id: 4, name: '1080p Webcam', price: 49.9, image: '' },
  { id: 5, name: 'Ergonomic Mouse', price: 34.25, image: '' },
  { id: 6, name: 'Laptop Stand', price: 29.0, image: '' },
  { id: 7, name: 'Portable SSD 1TB', price: 129.0, image: '' },
  { id: 8, name: 'Bluetooth Speaker', price: 59.0, image: '' }
];

async function maybeFetchFakeStore() {
  try {
    if (process.env.SEED_USE_FAKESTORE !== 'true') return null;
    const resp = await fetch('https://fakestoreapi.com/products?limit=8');
    const data = await resp.json();
    if (!Array.isArray(data) || !data.length) return null;
    return data.map((p, idx) => ({
      id: idx + 1,
      name: String(p.title).slice(0, 80),
      price: Number(p.price) || 10,
      image: p.image || ''
    }));
  } catch {
    return null;
  }
}

async function seed() {
  const db = await getDb();
  const cnt = await db.get('SELECT COUNT(*) as c FROM products');
  if (cnt.c > 0) return;
  const fetched = await maybeFetchFakeStore();
  const items = fetched && fetched.length ? fetched : LOCAL_SEED;
  const stmt = await db.prepare('INSERT INTO products (id, name, price, image) VALUES (?,?,?,?)');
  for (const p of items) {
    await stmt.run(p.id, p.name, p.price, p.image);
  }
  await stmt.finalize();
  console.log('Seeded products.');
}

seed().catch(console.error);
