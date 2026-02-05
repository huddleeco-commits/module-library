/**
 * Menu Management API Routes
 *
 * Full CRUD operations for menu categories and items.
 * Broadcasts updates via SSE for real-time sync.
 *
 * Endpoints:
 *   GET    /api/admin/menu              - List all categories + items
 *   POST   /api/admin/menu/category     - Create category
 *   PUT    /api/admin/menu/category/:id - Update category
 *   DELETE /api/admin/menu/category/:id - Delete category
 *   POST   /api/admin/menu/item         - Create item
 *   PUT    /api/admin/menu/item/:id     - Update item
 *   DELETE /api/admin/menu/item/:id     - Delete item
 *   PATCH  /api/admin/menu/item/:id/availability - Toggle availability
 *   PUT    /api/admin/menu/reorder      - Reorder items/categories
 */

const express = require('express');
const router = express.Router();

// In-memory store for demo (replace with database in production)
let menuStore = {
  categories: [
    { id: 1, name: 'Appetizers', description: 'Start your meal right', display_order: 0, active: true },
    { id: 2, name: 'Entrees', description: 'Main courses', display_order: 1, active: true },
    { id: 3, name: 'Desserts', description: 'Sweet endings', display_order: 2, active: true },
    { id: 4, name: 'Beverages', description: 'Drinks', display_order: 3, active: true }
  ],
  items: [
    { id: 1, category_id: 1, name: 'Bruschetta', description: 'Toasted bread with tomatoes and basil', price: 8.99, available: true, popular: true, dietary_flags: { vegetarian: true }, display_order: 0 },
    { id: 2, category_id: 1, name: 'Calamari', description: 'Crispy fried squid with marinara', price: 12.99, available: true, popular: false, dietary_flags: {}, display_order: 1 },
    { id: 3, category_id: 2, name: 'Grilled Salmon', description: 'Atlantic salmon with lemon butter', price: 24.99, available: true, popular: true, dietary_flags: { gluten_free: true }, display_order: 0 },
    { id: 4, category_id: 2, name: 'Ribeye Steak', description: '12oz prime ribeye', price: 34.99, available: true, popular: true, dietary_flags: { gluten_free: true }, display_order: 1 },
    { id: 5, category_id: 3, name: 'Tiramisu', description: 'Classic Italian dessert', price: 9.99, available: true, popular: true, dietary_flags: { vegetarian: true }, display_order: 0 },
    { id: 6, category_id: 4, name: 'House Red Wine', description: 'Glass of our selected red', price: 8.99, available: true, popular: false, dietary_flags: { vegan: true }, display_order: 0 }
  ],
  nextCategoryId: 5,
  nextItemId: 7
};

// Get SSE broadcaster from app locals
function broadcast(req, type, data) {
  const broadcaster = req.app.locals.sseClients?.menu;
  if (broadcaster) {
    broadcaster.forEach(client => {
      client.write(`data: ${JSON.stringify({ type, data, timestamp: new Date().toISOString() })}\n\n`);
    });
  }
}

// GET /api/admin/menu - List all categories with items
router.get('/', (req, res) => {
  try {
    const categories = menuStore.categories
      .filter(c => c.active)
      .sort((a, b) => a.display_order - b.display_order)
      .map(category => ({
        ...category,
        items: menuStore.items
          .filter(item => item.category_id === category.id)
          .sort((a, b) => a.display_order - b.display_order)
      }));

    res.json({
      success: true,
      categories,
      totalItems: menuStore.items.length,
      availableItems: menuStore.items.filter(i => i.available).length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/menu/category - Create category
router.post('/category', (req, res) => {
  try {
    const { name, description, display_order } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }

    const newCategory = {
      id: menuStore.nextCategoryId++,
      name,
      description: description || '',
      display_order: display_order ?? menuStore.categories.length,
      active: true,
      created_at: new Date().toISOString()
    };

    menuStore.categories.push(newCategory);
    broadcast(req, 'category_created', newCategory);

    res.status(201).json({ success: true, category: newCategory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/admin/menu/category/:id - Update category
router.put('/category/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const categoryIndex = menuStore.categories.findIndex(c => c.id === id);

    if (categoryIndex === -1) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    const { name, description, display_order, active } = req.body;
    const category = menuStore.categories[categoryIndex];

    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (display_order !== undefined) category.display_order = display_order;
    if (active !== undefined) category.active = active;
    category.updated_at = new Date().toISOString();

    broadcast(req, 'category_updated', category);

    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/admin/menu/category/:id - Delete category
router.delete('/category/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const categoryIndex = menuStore.categories.findIndex(c => c.id === id);

    if (categoryIndex === -1) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    // Soft delete - set active to false
    menuStore.categories[categoryIndex].active = false;

    // Also mark items as unavailable
    menuStore.items
      .filter(item => item.category_id === id)
      .forEach(item => item.available = false);

    broadcast(req, 'category_deleted', { id });

    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/menu/item - Create item
router.post('/item', (req, res) => {
  try {
    const { category_id, name, description, price, image_url, dietary_flags, popular } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ success: false, error: 'Name and price are required' });
    }

    if (category_id) {
      const category = menuStore.categories.find(c => c.id === category_id);
      if (!category) {
        return res.status(400).json({ success: false, error: 'Category not found' });
      }
    }

    const newItem = {
      id: menuStore.nextItemId++,
      category_id: category_id || null,
      name,
      description: description || '',
      price: parseFloat(price),
      image_url: image_url || null,
      dietary_flags: dietary_flags || {},
      available: true,
      popular: popular || false,
      display_order: menuStore.items.filter(i => i.category_id === category_id).length,
      created_at: new Date().toISOString()
    };

    menuStore.items.push(newItem);
    broadcast(req, 'item_created', newItem);

    res.status(201).json({ success: true, item: newItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/admin/menu/item/:id - Update item
router.put('/item/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const itemIndex = menuStore.items.findIndex(i => i.id === id);

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    const item = menuStore.items[itemIndex];
    const { category_id, name, description, price, image_url, dietary_flags, available, popular, display_order } = req.body;

    if (category_id !== undefined) item.category_id = category_id;
    if (name !== undefined) item.name = name;
    if (description !== undefined) item.description = description;
    if (price !== undefined) item.price = parseFloat(price);
    if (image_url !== undefined) item.image_url = image_url;
    if (dietary_flags !== undefined) item.dietary_flags = dietary_flags;
    if (available !== undefined) item.available = available;
    if (popular !== undefined) item.popular = popular;
    if (display_order !== undefined) item.display_order = display_order;
    item.updated_at = new Date().toISOString();

    broadcast(req, 'item_updated', item);

    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/admin/menu/item/:id - Delete item
router.delete('/item/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const itemIndex = menuStore.items.findIndex(i => i.id === id);

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    menuStore.items.splice(itemIndex, 1);
    broadcast(req, 'item_deleted', { id });

    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/admin/menu/item/:id/availability - Toggle availability
router.patch('/item/:id/availability', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const item = menuStore.items.find(i => i.id === id);

    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    // Toggle or set explicit value
    item.available = req.body.available !== undefined ? req.body.available : !item.available;
    item.updated_at = new Date().toISOString();

    broadcast(req, 'item_availability_changed', { id, available: item.available });

    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/admin/menu/reorder - Reorder items or categories
router.put('/reorder', (req, res) => {
  try {
    const { type, items } = req.body;

    if (!type || !Array.isArray(items)) {
      return res.status(400).json({ success: false, error: 'Type and items array required' });
    }

    if (type === 'categories') {
      items.forEach(({ id, display_order }) => {
        const category = menuStore.categories.find(c => c.id === id);
        if (category) category.display_order = display_order;
      });
    } else if (type === 'items') {
      items.forEach(({ id, display_order, category_id }) => {
        const item = menuStore.items.find(i => i.id === id);
        if (item) {
          item.display_order = display_order;
          if (category_id !== undefined) item.category_id = category_id;
        }
      });
    }

    broadcast(req, 'menu_reordered', { type });

    res.json({ success: true, message: `${type} reordered` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export store for use by other modules (agent executor)
router.getStore = () => menuStore;
router.setStore = (store) => { menuStore = store; };

module.exports = router;
