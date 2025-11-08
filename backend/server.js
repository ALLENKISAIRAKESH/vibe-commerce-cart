import './seed.js';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { getDb } from './db.js';
import { DAO } from './dao.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 4000;
const MOCK_USER_ID = 1;

function error(res, code, message, status=400) {
  return res.status(status).json({ error: { code, message } });
}

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/products', async (_req, res) => {
  try {
    const db = await getDb();
    const dao = new DAO(db);
    const products = await dao.listProducts();
    res.json(products);
  } catch (e) {
    console.error(e);
    return error(res, 'SERVER_ERROR', 'Failed to fetch products', 500);
  }
});

app.get('/api/cart', async (_req, res) => {
  try {
    const db = await getDb();
    const dao = new DAO(db);
    const items = await dao.getCartWithProducts(MOCK_USER_ID);
    const total = items.reduce((sum, x) => sum + x.price * x.qty, 0);
    res.json({ items, total });
  } catch (e) {
    console.error(e);
    return error(res, 'SERVER_ERROR', 'Failed to fetch cart', 500);
  }
});

app.post('/api/cart', async (req, res) => {
  try {
    const { productId, qty } = req.body || {};
    if (!productId || typeof productId !== 'number') {
      return error(res, 'BAD_REQUEST', 'productId is required and must be a number');
    }
    if (!qty || typeof qty !== 'number' || qty < 1) {
      return error(res, 'BAD_REQUEST', 'qty must be a number >= 1');
    }
    const db = await getDb();
    const dao = new DAO(db);
    const product = await dao.getProduct(productId);
    if (!product) return error(res, 'NOT_FOUND', 'Product not found', 404);
    const cartRow = await dao.addOrUpdateCart(MOCK_USER_ID, productId, qty);
    res.status(201).json(cartRow);
  } catch (e) {
    console.error(e);
    return error(res, 'SERVER_ERROR', 'Failed to modify cart', 500);
  }
});

app.delete('/api/cart/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return error(res, 'BAD_REQUEST', 'Invalid id');
    const db = await getDb();
    const dao = new DAO(db);
    const ok = await dao.deleteCartItem(id, MOCK_USER_ID);
    if (!ok) return error(res, 'NOT_FOUND', 'Cart item not found', 404);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return error(res, 'SERVER_ERROR', 'Failed to delete cart item', 500);
  }
});

app.post('/api/checkout', async (req, res) => {
  try {
    const { name, email } = req.body || {};
    if (!name || !email) return error(res, 'BAD_REQUEST', 'name and email are required');
    const db = await getDb();
    const dao = new DAO(db);
    const items = await dao.getCartWithProducts(MOCK_USER_ID);
    const total = items.reduce((sum, x) => sum + x.price * x.qty, 0);
    const receipt = { total, timestamp: new Date().toISOString(), name, email, items };
    await dao.clearCart(MOCK_USER_ID);
    res.json({ receipt });
  } catch (e) {
    console.error(e);
    return error(res, 'SERVER_ERROR', 'Checkout failed', 500);
  }
});

// Serve frontend in production
const __dirname = path.resolve();
if (process.env.NODE_ENV === 'production') {
  const staticPath = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(staticPath));
  app.get('*', (_req, res) => res.sendFile(path.join(staticPath, 'index.html')));
}

app.listen(PORT, async () => {
  await getDb();
  console.log(`Backend listening on http://localhost:${PORT}`);
});
