import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let dbPromise = null;

export async function getDb() {
  if (!dbPromise) {
    dbPromise = open({
      filename: process.env.SQLITE_FILE || './data.sqlite',
      driver: sqlite3.Database
    });
    const db = await dbPromise;
    await db.exec(`
      PRAGMA foreign_keys = ON;
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        image TEXT
      );
      CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        qty INTEGER NOT NULL CHECK (qty >= 1),
        UNIQUE(user_id, product_id),
        FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
      );
    `);
  }
  return dbPromise;
}
