export class DAO {
  constructor(db) { this.db = db; }

  async listProducts() {
    return this.db.all('SELECT * FROM products ORDER BY id ASC');
  }
  async getProduct(id) {
    return this.db.get('SELECT * FROM products WHERE id = ?', id);
  }

  async addOrUpdateCart(userId, productId, qty) {
    const existing = await this.db.get(
      'SELECT * FROM cart WHERE user_id=? AND product_id=?',
      userId, productId
    );
    if (existing) {
      const newQty = qty;
      await this.db.run('UPDATE cart SET qty=? WHERE id=?', newQty, existing.id);
      return this.db.get('SELECT * FROM cart WHERE id=?', existing.id);
    } else {
      const res = await this.db.run(
        'INSERT INTO cart (user_id, product_id, qty) VALUES (?,?,?)',
        userId, productId, qty
      );
      return this.db.get('SELECT * FROM cart WHERE id=?', res.lastID);
    }
  }

  async deleteCartItem(id, userId) {
    const row = await this.db.get('SELECT * FROM cart WHERE id=? AND user_id=?', id, userId);
    if (!row) return false;
    await this.db.run('DELETE FROM cart WHERE id=?', id);
    return true;
  }

  async getCartWithProducts(userId) {
    return this.db.all(`
      SELECT c.id, c.product_id as productId, c.qty, p.name, p.price, p.image
      FROM cart c
      JOIN products p ON p.id = c.product_id
      WHERE c.user_id = ?
      ORDER BY c.id ASC
    `, userId);
  }

  async clearCart(userId) {
    await this.db.run('DELETE FROM cart WHERE user_id=?', userId);
  }
}
