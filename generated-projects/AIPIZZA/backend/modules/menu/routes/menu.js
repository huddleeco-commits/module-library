/**
 * Menu Routes
 * API endpoints for menu management
 *
 * Used by:
 * - Companion App (fetch menu items)
 * - Website (display menu)
 * - Admin Dashboard (manage menu)
 */

const express = require('express');
const router = express.Router();

// Helper to get database
const getDb = (req) => {
  return req.db || null;
};

// ============================================
// PUBLIC ROUTES
// ============================================

// GET /api/menu - Get full menu
router.get('/', async (req, res) => {
  try {
    const db = getDb(req);

    if (db && typeof db.query === 'function') {
      // Fetch from database
      const categoriesResult = await db.query('SELECT * FROM menu_categories ORDER BY sort_order, name');
      const itemsResult = await db.query('SELECT * FROM menu_items WHERE is_available = 1 ORDER BY sort_order, name');

      const categories = categoriesResult.rows || categoriesResult;
      const items = itemsResult.rows || itemsResult;

      // Build menu structure
      const menu = {
        categories: categories.map(cat => ({
          ...cat,
          items: items.filter(item => item.category_id === cat.id)
        }))
      };

      res.json({ success: true, menu });
    } else {
      // No database - return empty menu (app will use local fixture data)
      res.json({
        success: true,
        menu: { categories: [] },
        message: 'Using local menu data'
      });
    }
  } catch (error) {
    console.error('[Menu] Error fetching menu:', error);
    res.json({
      success: true,
      menu: { categories: [] },
      fallback: true
    });
  }
});

// GET /api/menu/categories - Get all categories
router.get('/categories', async (req, res) => {
  try {
    const db = getDb(req);

    if (db && typeof db.query === 'function') {
      const result = await db.query('SELECT * FROM menu_categories ORDER BY sort_order, name');
      res.json({ success: true, categories: result.rows || result });
    } else {
      res.json({ success: true, categories: [] });
    }
  } catch (error) {
    console.error('[Menu] Error fetching categories:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
});

// GET /api/menu/items - Get all items
router.get('/items', async (req, res) => {
  try {
    const db = getDb(req);
    const { category_id, available_only } = req.query;

    if (db && typeof db.query === 'function') {
      let query = 'SELECT * FROM menu_items';
      const params = [];
      const conditions = [];

      if (category_id) {
        params.push(parseInt(category_id));
        conditions.push(`category_id = $${params.length}`);
      }
      if (available_only === 'true') {
        conditions.push('is_available = 1');
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      query += ' ORDER BY sort_order, name';

      const result = await db.query(query, params);
      res.json({ success: true, items: result.rows || result });
    } else {
      res.json({ success: true, items: [] });
    }
  } catch (error) {
    console.error('[Menu] Error fetching items:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch items' });
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

// POST /api/menu/categories - Create category
router.post('/categories', async (req, res) => {
  try {
    const db = getDb(req);
    const { name, description, sort_order } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }

    if (db && typeof db.query === 'function') {
      const result = await db.query(
        'INSERT INTO menu_categories (name, description, sort_order) VALUES ($1, $2, $3) RETURNING id',
        [name, description || '', sort_order || 0]
      );
      const id = result.rows?.[0]?.id || result[0]?.id;
      res.json({ success: true, category: { id, name, description, sort_order } });
    } else {
      res.status(500).json({ success: false, error: 'Database not available' });
    }
  } catch (error) {
    console.error('[Menu] Error creating category:', error);
    res.status(500).json({ success: false, error: 'Failed to create category' });
  }
});

// POST /api/menu/items - Create item
router.post('/items', async (req, res) => {
  try {
    const db = getDb(req);
    const { category_id, name, description, price, image_url, is_available, is_popular, sort_order } = req.body;

    if (!name || !price) {
      return res.status(400).json({ success: false, error: 'Name and price are required' });
    }

    if (db && typeof db.query === 'function') {
      const result = await db.query(
        `INSERT INTO menu_items (category_id, name, description, price, image_url, is_available, is_popular, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [category_id || null, name, description || '', price, image_url || '', is_available !== false ? 1 : 0, is_popular ? 1 : 0, sort_order || 0]
      );
      const id = result.rows?.[0]?.id || result[0]?.id;
      res.json({ success: true, item: { id, name, price, category_id } });
    } else {
      res.status(500).json({ success: false, error: 'Database not available' });
    }
  } catch (error) {
    console.error('[Menu] Error creating item:', error);
    res.status(500).json({ success: false, error: 'Failed to create item' });
  }
});

// PUT /api/menu/items/:id - Update item
router.put('/items/:id', async (req, res) => {
  try {
    const db = getDb(req);
    const itemId = parseInt(req.params.id);
    const { name, description, price, image_url, is_available, is_popular, sort_order, category_id } = req.body;

    if (db && typeof db.query === 'function') {
      await db.query(
        `UPDATE menu_items SET
           name = COALESCE($1, name),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           image_url = COALESCE($4, image_url),
           is_available = COALESCE($5, is_available),
           is_popular = COALESCE($6, is_popular),
           sort_order = COALESCE($7, sort_order),
           category_id = COALESCE($8, category_id)
         WHERE id = $9`,
        [name, description, price, image_url, is_available, is_popular, sort_order, category_id, itemId]
      );
      res.json({ success: true, message: 'Item updated' });
    } else {
      res.status(500).json({ success: false, error: 'Database not available' });
    }
  } catch (error) {
    console.error('[Menu] Error updating item:', error);
    res.status(500).json({ success: false, error: 'Failed to update item' });
  }
});

// DELETE /api/menu/items/:id - Delete item
router.delete('/items/:id', async (req, res) => {
  try {
    const db = getDb(req);
    const itemId = parseInt(req.params.id);

    if (db && typeof db.query === 'function') {
      await db.query('DELETE FROM menu_items WHERE id = $1', [itemId]);
      res.json({ success: true, message: 'Item deleted' });
    } else {
      res.status(500).json({ success: false, error: 'Database not available' });
    }
  } catch (error) {
    console.error('[Menu] Error deleting item:', error);
    res.status(500).json({ success: false, error: 'Failed to delete item' });
  }
});

module.exports = router;
