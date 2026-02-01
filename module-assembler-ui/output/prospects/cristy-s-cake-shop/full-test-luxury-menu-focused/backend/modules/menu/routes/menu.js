/**
 * Menu Routes
 * API endpoints for menu management
 *
 * Used by:
 * - Companion App (fetch menu items)
 * - Website (display menu)
 * - Admin Dashboard (manage menu)
 *
 * Features:
 * - Database mode: Uses PostgreSQL when DATABASE_URL is set
 * - Test mode: Returns industry-specific mock data when no database
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Helper to get database
const getDb = (req) => {
  return req.db || null;
};

// ============================================
// INDUSTRY-SPECIFIC TEST DATA
// ============================================

const TEST_MENUS = {
  'pizza': {
    categories: [
      { id: 1, name: 'Pizzas', description: 'Hand-tossed, stone-baked pizzas', sort_order: 1 },
      { id: 2, name: 'Sides', description: 'Perfect companions', sort_order: 2 },
      { id: 3, name: 'Drinks', description: 'Refreshing beverages', sort_order: 3 }
    ],
    items: [
      { id: 1, category_id: 1, name: 'Margherita', description: 'Fresh mozzarella, tomato sauce, basil', price: 14.99, image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', is_available: 1, is_popular: 1 },
      { id: 2, category_id: 1, name: 'Pepperoni', description: 'Classic pepperoni with extra cheese', price: 16.99, image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400', is_available: 1, is_popular: 1 },
      { id: 3, category_id: 1, name: 'Supreme', description: 'Pepperoni, sausage, peppers, onions, olives', price: 18.99, image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', is_available: 1, is_popular: 0 },
      { id: 4, category_id: 1, name: 'BBQ Chicken', description: 'Grilled chicken, BBQ sauce, red onions', price: 17.99, image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400', is_available: 1, is_popular: 0 },
      { id: 5, category_id: 2, name: 'Garlic Knots', description: '6 pieces with marinara', price: 6.99, image_url: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=400', is_available: 1 },
      { id: 6, category_id: 2, name: 'Wings', description: '8 crispy wings, choice of sauce', price: 12.99, image_url: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400', is_available: 1 },
      { id: 7, category_id: 3, name: 'Soda', description: 'Coke, Sprite, or Fanta', price: 2.99, is_available: 1 },
      { id: 8, category_id: 3, name: 'Iced Tea', description: 'Fresh brewed', price: 3.49, is_available: 1 }
    ]
  },

  'restaurant': {
    categories: [
      { id: 1, name: 'Starters', description: 'Begin your meal', sort_order: 1 },
      { id: 2, name: 'Mains', description: 'Signature dishes', sort_order: 2 },
      { id: 3, name: 'Desserts', description: 'Sweet endings', sort_order: 3 }
    ],
    items: [
      { id: 1, category_id: 1, name: 'Soup of the Day', description: "Chef's daily creation", price: 8.99, is_available: 1 },
      { id: 2, category_id: 1, name: 'Caesar Salad', description: 'Romaine, parmesan, croutons', price: 12.99, is_available: 1, is_popular: 1 },
      { id: 3, category_id: 2, name: 'Grilled Salmon', description: 'Atlantic salmon, seasonal vegetables', price: 28.99, is_available: 1, is_popular: 1 },
      { id: 4, category_id: 2, name: 'Filet Mignon', description: '8oz prime cut, truffle mash', price: 42.99, is_available: 1 },
      { id: 5, category_id: 2, name: 'Pasta Primavera', description: 'Fresh vegetables, light cream sauce', price: 18.99, is_available: 1 },
      { id: 6, category_id: 3, name: 'Chocolate Lava Cake', description: 'Warm, with vanilla ice cream', price: 10.99, is_available: 1, is_popular: 1 },
      { id: 7, category_id: 3, name: 'Tiramisu', description: 'Classic Italian', price: 9.99, is_available: 1 }
    ]
  },

  'cafe': {
    categories: [
      { id: 1, name: 'Coffee', description: 'Freshly roasted', sort_order: 1 },
      { id: 2, name: 'Pastries', description: 'Baked fresh daily', sort_order: 2 },
      { id: 3, name: 'Breakfast', description: 'Start your day right', sort_order: 3 }
    ],
    items: [
      { id: 1, category_id: 1, name: 'Espresso', description: 'Double shot', price: 3.50, is_available: 1 },
      { id: 2, category_id: 1, name: 'Latte', description: 'Espresso with steamed milk', price: 5.50, is_available: 1, is_popular: 1 },
      { id: 3, category_id: 1, name: 'Cappuccino', description: 'Espresso, steamed milk, foam', price: 5.00, is_available: 1, is_popular: 1 },
      { id: 4, category_id: 1, name: 'Cold Brew', description: '16oz smooth cold brew', price: 4.50, is_available: 1 },
      { id: 5, category_id: 2, name: 'Croissant', description: 'Butter croissant', price: 4.00, is_available: 1, is_popular: 1 },
      { id: 6, category_id: 2, name: 'Blueberry Muffin', description: 'Fresh baked', price: 3.50, is_available: 1 },
      { id: 7, category_id: 3, name: 'Avocado Toast', description: 'Sourdough, poached egg', price: 12.99, is_available: 1, is_popular: 1 },
      { id: 8, category_id: 3, name: 'Breakfast Sandwich', description: 'Egg, cheese, bacon', price: 9.99, is_available: 1 }
    ]
  },

  'bakery': {
    categories: [
      { id: 1, name: 'Breads', description: 'Fresh baked loaves', sort_order: 1 },
      { id: 2, name: 'Pastries', description: 'Sweet treats', sort_order: 2 },
      { id: 3, name: 'Cakes', description: 'Special occasion cakes', sort_order: 3 }
    ],
    items: [
      { id: 1, category_id: 1, name: 'Sourdough Loaf', description: '24-hour ferment', price: 8.00, is_available: 1, is_popular: 1 },
      { id: 2, category_id: 1, name: 'Baguette', description: 'Crusty French style', price: 4.50, is_available: 1 },
      { id: 3, category_id: 2, name: 'Butter Croissant', description: 'Flaky, golden', price: 4.50, is_available: 1, is_popular: 1 },
      { id: 4, category_id: 2, name: 'Pain au Chocolat', description: 'Chocolate filled', price: 5.00, is_available: 1 },
      { id: 5, category_id: 2, name: 'Cinnamon Roll', description: 'With cream cheese frosting', price: 5.50, is_available: 1, is_popular: 1 },
      { id: 6, category_id: 3, name: 'Custom Cake', description: 'Starting at (serves 10)', price: 45.00, is_available: 1 },
      { id: 7, category_id: 3, name: 'Cupcakes (6)', description: 'Assorted flavors', price: 24.00, is_available: 1 }
    ]
  }
};

// Get industry from brain.json or environment
function getIndustry() {
  try {
    // Try to read from brain.json in project root
    const brainPath = path.join(__dirname, '../../../brain.json');
    if (fs.existsSync(brainPath)) {
      const brain = JSON.parse(fs.readFileSync(brainPath, 'utf8'));
      return brain.industry || 'restaurant';
    }
    // Fallback to environment
    return process.env.INDUSTRY || 'restaurant';
  } catch (e) {
    return 'restaurant';
  }
}

// Get test menu data for the current industry
function getTestMenu() {
  const industry = getIndustry().toLowerCase();

  // Direct match
  if (TEST_MENUS[industry]) {
    return TEST_MENUS[industry];
  }

  // Fuzzy match
  if (industry.includes('pizza')) return TEST_MENUS['pizza'];
  if (industry.includes('cafe') || industry.includes('coffee')) return TEST_MENUS['cafe'];
  if (industry.includes('bakery') || industry.includes('cake')) return TEST_MENUS['bakery'];

  // Default to restaurant
  return TEST_MENUS['restaurant'];
}

// Build menu structure from categories and items
function buildMenuStructure(categories, items) {
  return {
    categories: categories.map(cat => ({
      ...cat,
      items: items.filter(item => item.category_id === cat.id)
    }))
  };
}

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

      const menu = buildMenuStructure(categories, items);
      res.json({ success: true, menu, source: 'database' });
    } else {
      // No database - return industry-specific test menu
      const testData = getTestMenu();
      const menu = buildMenuStructure(testData.categories, testData.items);
      res.json({
        success: true,
        menu,
        source: 'test-data',
        industry: getIndustry()
      });
    }
  } catch (error) {
    console.error('[Menu] Error fetching menu:', error);
    // Fallback to test data on error
    const testData = getTestMenu();
    const menu = buildMenuStructure(testData.categories, testData.items);
    res.json({
      success: true,
      menu,
      source: 'fallback',
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
      res.json({ success: true, categories: result.rows || result, source: 'database' });
    } else {
      const testData = getTestMenu();
      res.json({ success: true, categories: testData.categories, source: 'test-data' });
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
      res.json({ success: true, items: result.rows || result, source: 'database' });
    } else {
      // Filter test data
      let items = getTestMenu().items;

      if (category_id) {
        items = items.filter(item => item.category_id === parseInt(category_id));
      }
      if (available_only === 'true') {
        items = items.filter(item => item.is_available === 1);
      }

      res.json({ success: true, items, source: 'test-data' });
    }
  } catch (error) {
    console.error('[Menu] Error fetching items:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch items' });
  }
});

// GET /api/menu/popular - Get popular items
router.get('/popular', async (req, res) => {
  try {
    const db = getDb(req);

    if (db && typeof db.query === 'function') {
      const result = await db.query('SELECT * FROM menu_items WHERE is_popular = 1 AND is_available = 1 ORDER BY name');
      res.json({ success: true, items: result.rows || result, source: 'database' });
    } else {
      const items = getTestMenu().items.filter(item => item.is_popular === 1);
      res.json({ success: true, items, source: 'test-data' });
    }
  } catch (error) {
    console.error('[Menu] Error fetching popular items:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch popular items' });
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
      // Test mode - simulate creation
      res.json({
        success: true,
        category: { id: Date.now(), name, description, sort_order },
        source: 'test-mode',
        message: 'Created in test mode (not persisted)'
      });
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

    if (!name || price === undefined) {
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
      // Test mode - simulate creation
      res.json({
        success: true,
        item: { id: Date.now(), name, price, category_id },
        source: 'test-mode',
        message: 'Created in test mode (not persisted)'
      });
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
      // Test mode - simulate update
      res.json({
        success: true,
        message: 'Item updated (test mode - not persisted)',
        source: 'test-mode'
      });
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
      // Test mode - simulate delete
      res.json({
        success: true,
        message: 'Item deleted (test mode - not persisted)',
        source: 'test-mode'
      });
    }
  } catch (error) {
    console.error('[Menu] Error deleting item:', error);
    res.status(500).json({ success: false, error: 'Failed to delete item' });
  }
});

module.exports = router;
