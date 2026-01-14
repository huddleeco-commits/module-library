// backend/routes/meals.js - Meals Platform API Routes
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const mealsEngine = require('../services/mealsEngine');

// Models (will create next)
let Meal, ShoppingItem, Recipe, Inventory, Receipt, PriceHistory;

// Initialize models if MongoDB is connected
const initModels = () => {
    try {
        Meal = require('../models/Meal');
        ShoppingItem = require('../models/ShoppingItem');
        Recipe = require('../models/Recipe');
        Inventory = require('../models/Inventory');
        Receipt = require('../models/Receipt');
        PriceHistory = require('../models/PriceHistory');
        return true;
    } catch (error) {
        console.log('Meals models not available, using in-memory storage');
        return false;
    }
};

const hasModels = initModels();

// In-memory storage fallback
const memoryStorage = {
    meals: [],
    shoppingItems: [],
    recipes: [],
    inventory: [],
    receipts: [],
    priceHistory: [],
    familyPreferences: {}
};

// Get family data with dietary preferences
router.get('/family', async (req, res) => {
    try {
        const familyId = req.query.familyId || req.session?.familyId;
        
        if (hasModels) {
            const Family = require('../models/Family');
            const family = await Family.findById(familyId)
                .populate('members.dietary')
                .populate('members.allergens');
            res.json(family);
        } else {
            res.json({
                id: 'family-demo',
                name: 'Demo Family',
                members: [
                    {
                        id: 'member1',
                        name: 'Parent 1',
                        dietary: [],
                        allergens: [],
                        nutritionGoals: ['balanced']
                    }
                ]
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== NEW: MEAL ENGINE ROUTES ====================

// Get meal plan using mealsEngine
router.get('/:familyId/plan', (req, res) => {
  const { familyId } = req.params;
  const { startDate } = req.query; // Optional startDate query param
  
  const mealPlan = mealsEngine.initializeMealPlan(familyId, startDate);
  
  console.log(`🍽️ Fetching meal plan for family ${familyId}`, startDate ? `starting ${startDate}` : '(current week)');
  
  res.json({
    success: true,
    mealPlan,
    weekStart: mealPlan.currentWeek[0],
    weekEnd: mealPlan.currentWeek[6]
  });
});

// Add meal to day
router.post('/plan/add', (req, res) => {
  const { familyId, date, mealType, recipeId } = req.body;
  const updatedPlan = mealsEngine.addMealToDay(familyId, date, mealType, recipeId);
  
  console.log(`🍽️ Added ${mealType} meal for ${date}`);
  
  const io = req.app.get('io');
  if (io) {
    io.to(`family-${familyId}`).emit('meal_update', {
      action: 'meal_added',
      familyId,
      date,
      mealType,
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({ success: true, mealPlan: updatedPlan });
});

// Generate grocery list from meal plan
router.post('/grocery-list/generate', (req, res) => {
  const { familyId, startDate, endDate } = req.body;
  const groceryList = mealsEngine.generateGroceryList(familyId, startDate, endDate);
  
  if (!groceryList) {
    return res.status(404).json({ success: false, error: 'Meal plan not found' });
  }
  
  console.log(`🛒 Generated grocery list: ${groceryList.totalItems} items`);
  
  const io = req.app.get('io');
  if (io) {
    io.to(`family-${familyId}`).emit('grocery_list_update', {
      action: 'list_generated',
      groceryList,
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({ success: true, groceryList });
});

// Remove meal from day
router.post('/plan/remove', (req, res) => {
  const { familyId, date, mealType, snackIndex } = req.body;
  const updatedPlan = mealsEngine.removeMealFromDay(familyId, date, mealType, snackIndex);
  
  if (!updatedPlan) {
    return res.status(404).json({ success: false, error: 'Meal plan not found' });
  }
  
  console.log(`🍽️ Removed ${mealType} meal from ${date}`);
  
  const io = req.app.get('io');
  if (io) {
    io.to(`family-${familyId}`).emit('meal_update', {
      action: 'meal_removed',
      familyId,
      date,
      mealType,
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({ success: true, mealPlan: updatedPlan });
});

// Get recipes using mealsEngine
router.get('/recipes', (req, res) => {
  const { familyId } = req.query;
  const recipes = mealsEngine.getAllRecipes(familyId);
  
  console.log(`📖 Fetching recipes for family ${familyId}: ${recipes.length} found`);
  
  res.json({ success: true, recipes });
});

// Create recipe using mealsEngine
router.post('/recipes', (req, res) => {
  const recipeData = req.body;
  const newRecipe = mealsEngine.createRecipe(recipeData);
  
  console.log(`📖 Created recipe: ${newRecipe.name}`);
  
  const io = req.app.get('io');
  if (io) {
    io.to(`family-${recipeData.familyId}`).emit('recipe_update', {
      action: 'recipe_created',
      recipe: newRecipe,
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({ success: true, recipe: newRecipe });
});

// Get grocery list by ID
router.get('/grocery-list/:listId', (req, res) => {
  const { listId } = req.params;
  const groceryList = mealsEngine.getGroceryList(listId);
  
  if (!groceryList) {
    return res.status(404).json({ success: false, error: 'Grocery list not found' });
  }
  
  res.json({ success: true, groceryList });
});

// Check off grocery item
router.post('/grocery-list/check', (req, res) => {
  const { listId, itemName, checked } = req.body;
  const groceryList = mealsEngine.getGroceryList(listId);
  
  if (!groceryList) {
    return res.status(404).json({ success: false, error: 'Grocery list not found' });
  }
  
  // Update the checked status
  Object.keys(groceryList.items).forEach(category => {
    groceryList.items[category].forEach(item => {
      if (item.item === itemName) {
        item.checked = checked;
      }
    });
  });
  
  const io = req.app.get('io');
  if (io) {
    io.to(`family-${groceryList.familyId}`).emit('grocery_item_checked', {
      listId,
      itemName,
      checked,
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({ success: true, groceryList });
});

// Get pantry using mealsEngine
router.get('/pantry', (req, res) => {
  const { familyId } = req.query;
  const pantry = mealsEngine.getPantry(familyId);
  const pantryArray = Object.values(pantry);
  
  console.log(`🥫 Fetching pantry for family ${familyId}: ${pantryArray.length} items`);
  
  res.json({ success: true, pantry: pantryArray });
});

// Add to pantry
router.post('/pantry/add', (req, res) => {
  const { familyId, item } = req.body;
  const addedItem = mealsEngine.addToPantry(familyId, item);
  
  console.log(`🥫 Added to pantry: ${addedItem.name}`);
  
  const io = req.app.get('io');
  if (io) {
    io.to(`family-${familyId}`).emit('pantry_update', {
      action: 'item_added',
      item: addedItem,
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({ success: true, item: addedItem });
});

// Remove from pantry
router.post('/pantry/remove', (req, res) => {
  const { familyId, itemName } = req.body;
  const removed = mealsEngine.removeFromPantry(familyId, itemName);
  
  if (!removed) {
    return res.status(404).json({ success: false, error: 'Item not found' });
  }
  
  console.log(`🥫 Removed from pantry: ${itemName}`);
  
  const io = req.app.get('io');
  if (io) {
    io.to(`family-${familyId}`).emit('pantry_update', {
      action: 'item_removed',
      itemName,
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({ success: true });
});

// Update pantry quantity
router.put('/pantry/quantity', (req, res) => {
  const { familyId, itemName, quantity } = req.body;
  const updatedItem = mealsEngine.updatePantryQuantity(familyId, itemName, quantity);
  
  if (!updatedItem) {
    return res.status(404).json({ success: false, error: 'Item not found' });
  }
  
  console.log(`🥫 Updated pantry quantity: ${itemName} -> ${quantity}`);
  
  const io = req.app.get('io');
  if (io) {
    io.to(`family-${familyId}`).emit('pantry_update', {
      action: 'quantity_updated',
      item: updatedItem,
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({ success: true, item: updatedItem });
});

// Get expiring items
router.get('/pantry/expiring', (req, res) => {
  const { familyId, days } = req.query;
  const expiringItems = mealsEngine.getExpiringItems(familyId, parseInt(days) || 7);
  
  console.log(`⚠️ Found ${expiringItems.length} expiring items in next ${days} days`);
  
  res.json({ success: true, items: expiringItems });
});

// ==================== END NEW ROUTES ====================

// Get meal plans
router.get('/meals', async (req, res) => {
    try {
        const { familyId, startDate, endDate } = req.query;
        
        if (hasModels) {
            const meals = await Meal.find({
                familyId,
                date: { $gte: startDate, $lte: endDate }
            }).sort('date time');
            res.json(meals);
        } else {
            const filtered = memoryStorage.meals.filter(meal => {
                return meal.familyId === familyId &&
                       meal.date >= startDate &&
                       meal.date <= endDate;
            });
            res.json(filtered);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create/update meal plan
router.post('/meals', async (req, res) => {
    try {
        const mealData = req.body;
        
        if (hasModels) {
            const meal = await Meal.findOneAndUpdate(
                {
                    familyId: mealData.familyId,
                    date: mealData.date,
                    mealType: mealData.mealType
                },
                mealData,
                { upsert: true, new: true }
            );
            
            // Sync with calendar if integrated
            if (meal.syncToCalendar) {
                await syncMealToCalendar(meal);
            }
            
            res.json(meal);
        } else {
            mealData.id = Date.now().toString();
            memoryStorage.meals.push(mealData);
            res.json(mealData);
        }
        
        // Emit real-time update
        const io = req.app.get('io');
        if (io) {
            io.to(`family_${mealData.familyId}`).emit('meal_update', {
                action: 'created',
                meal: mealData
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// AI meal plan generation
router.post('/meals/generate-ai-plan', async (req, res) => {
    try {
        const { familyId, weekStart, preferences, nutritionGoals } = req.body;
        
        // Generate AI-powered meal plan
        const weekPlan = await generateAIMealPlan({
            familyId,
            weekStart,
            preferences,
            nutritionGoals
        });
        
        res.json(weekPlan);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get shopping list
router.get('/shopping', async (req, res) => {
    try {
        const { familyId } = req.query;
        
        if (hasModels) {
            const items = await ShoppingItem.find({ 
                familyId,
                purchased: false 
            }).sort('category name');
            res.json(items);
        } else {
            const filtered = memoryStorage.shoppingItems.filter(item => 
                item.familyId === familyId && !item.purchased
            );
            res.json(filtered);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add shopping item
router.post('/shopping', async (req, res) => {
    try {
        const itemData = req.body;
        
        if (hasModels) {
            const item = new ShoppingItem(itemData);
            await item.save();
            
            // Check for price alerts
            await checkPriceAlerts(item);
            
            res.json(item);
        } else {
            itemData.id = Date.now().toString();
            memoryStorage.shoppingItems.push(itemData);
            res.json(itemData);
        }
        
        // Emit update
        const io = req.app.get('io');
        if (io) {
            io.to(`family_${itemData.familyId}`).emit('shopping_update', {
                action: 'added',
                item: itemData
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update shopping item (check off)
router.put('/shopping/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        if (hasModels) {
            const item = await ShoppingItem.findByIdAndUpdate(id, updates, { new: true });
            res.json(item);
        } else {
            const index = memoryStorage.shoppingItems.findIndex(i => i.id === id);
            if (index >= 0) {
                Object.assign(memoryStorage.shoppingItems[index], updates);
                res.json(memoryStorage.shoppingItems[index]);
            } else {
                res.status(404).json({ error: 'Item not found' });
            }
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Voice shopping list
router.post('/shopping/voice', async (req, res) => {
    try {
        const { transcript, familyId } = req.body;
        
        // Parse voice input to extract items
        const items = await parseVoiceToItems(transcript);
        
        // Add items to shopping list
        const addedItems = [];
        for (const item of items) {
            item.familyId = familyId;
            
            if (hasModels) {
                const newItem = new ShoppingItem(item);
                await newItem.save();
                addedItems.push(newItem);
            } else {
                item.id = Date.now().toString();
                memoryStorage.shoppingItems.push(item);
                addedItems.push(item);
            }
        }
        
        res.json(addedItems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get inventory
router.get('/inventory', async (req, res) => {
    try {
        const { familyId } = req.query;
        
        if (hasModels) {
            const inventory = await Inventory.find({ familyId })
                .sort('category name');
            res.json(inventory);
        } else {
            const filtered = memoryStorage.inventory.filter(item => 
                item.familyId === familyId
            );
            res.json(filtered);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update inventory item
router.put('/inventory/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        if (hasModels) {
            const item = await Inventory.findByIdAndUpdate(id, updates, { new: true });
            
            // Check if running low
            if (item.quantity <= item.minQuantity) {
                await suggestReorder(item);
            }
            
            res.json(item);
        } else {
            const index = memoryStorage.inventory.findIndex(i => i.id === id);
            if (index >= 0) {
                Object.assign(memoryStorage.inventory[index], updates);
                res.json(memoryStorage.inventory[index]);
            } else {
                res.status(404).json({ error: 'Item not found' });
            }
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Smart fridge sync
router.post('/inventory/sync-fridge', async (req, res) => {
    try {
        const { familyId, items } = req.body;
        
        // Sync with smart fridge data
        for (const fridgeItem of items) {
            if (hasModels) {
                await Inventory.findOneAndUpdate(
                    { familyId, barcode: fridgeItem.barcode },
                    {
                        ...fridgeItem,
                        lastUpdated: new Date(),
                        source: 'smart_fridge'
                    },
                    { upsert: true }
                );
            }
        }
        
        res.json({ success: true, synced: items.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get recipes
router.get('/recipes', async (req, res) => {
    try {
        const { familyId, dietary, allergens, searchTerm } = req.query;
        
        if (hasModels) {
            const query = { familyId };
            
            if (dietary) {
                query.dietary = { $in: dietary.split(',') };
            }
            
            if (allergens) {
                query.allergens = { $nin: allergens.split(',') };
            }
            
            if (searchTerm) {
                query.$text = { $search: searchTerm };
            }
            
            const recipes = await Recipe.find(query).limit(20);
            res.json(recipes);
        } else {
            res.json(memoryStorage.recipes);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// AI recipe generation
router.post('/recipes/generate', async (req, res) => {
    try {
        const { ingredients, dietary, cuisine, mealType } = req.body;
        
        // Generate recipe using AI based on available ingredients
        const recipe = await generateAIRecipe({
            ingredients,
            dietary,
            cuisine,
            mealType
        });
        
        res.json(recipe);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Share recipe to community
router.post('/recipes/share', async (req, res) => {
    try {
        const recipe = req.body;
        
        if (hasModels) {
            recipe.shared = true;
            recipe.sharedAt = new Date();
            const saved = await Recipe.create(recipe);
            
            // Notify community members
            const io = req.app.get('io');
            if (io) {
                io.emit('recipe_shared', {
                    recipe: saved,
                    sharedBy: recipe.sharedBy
                });
            }
            
            res.json(saved);
        } else {
            recipe.id = Date.now().toString();
            memoryStorage.recipes.push(recipe);
            res.json(recipe);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Receipt scanning
router.post('/receipts/scan', upload.single('receipt'), async (req, res) => {
    try {
        const { familyId } = req.body;
        const file = req.file;
        
        // Process receipt with OCR
        const scannedData = await processReceiptOCR(file.path);
        
        // Extract items and prices
        const items = await extractReceiptItems(scannedData);
        
        // Save receipt
        if (hasModels) {
            const receipt = await Receipt.create({
                familyId,
                items,
                total: items.reduce((sum, item) => sum + item.price, 0),
                store: scannedData.store,
                date: scannedData.date || new Date(),
                imageUrl: file.path
            });
            
            // Update price history
            await updatePriceHistory(items, scannedData.store);
            
            // Auto-add to inventory
            await addReceiptToInventory(items, familyId);
            
            res.json(receipt);
        } else {
            const receipt = {
                id: Date.now().toString(),
                familyId,
                items,
                date: new Date()
            };
            memoryStorage.receipts.push(receipt);
            res.json(receipt);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get price history and comparisons
router.get('/prices', async (req, res) => {
    try {
        const { items, stores } = req.query;
        
        if (hasModels) {
            const itemList = items.split(',');
            const storeList = stores?.split(',') || ['walmart', 'target', 'costco'];
            
            const priceData = await PriceHistory.find({
                itemName: { $in: itemList },
                store: { $in: storeList }
            }).sort('-date').limit(100);
            
            res.json(priceData);
        } else {
            res.json(memoryStorage.priceHistory);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Price alerts
router.get('/prices/alerts', async (req, res) => {
    try {
        const { familyId } = req.query;
        
        // Get items with significant price drops
        const alerts = await findPriceAlerts(familyId);
        
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Nutrition analysis
router.post('/nutrition/analyze', async (req, res) => {
    try {
        const { meals, familyId, memberId, dateRange } = req.body;
        
        // Analyze nutrition for meals
        const analysis = await analyzeNutrition({
            meals,
            memberId,
            dateRange
        });
        
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get nutrition goals progress
router.get('/nutrition/goals', async (req, res) => {
    try {
        const { familyId, memberId } = req.query;
        
        // Calculate progress towards nutrition goals
        const progress = await calculateNutritionProgress({
            familyId,
            memberId
        });
        
        res.json(progress);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Community bulk buy
router.post('/community/bulk-buy', async (req, res) => {
    try {
        const { items, familyId, initiatorId } = req.body;
        
        // Create bulk buy opportunity
        const bulkBuy = {
            id: Date.now().toString(),
            items,
            families: [familyId],
            initiator: initiatorId,
            status: 'open',
            savings: calculateBulkSavings(items),
            createdAt: new Date()
        };
        
        // Notify nearby families
        const io = req.app.get('io');
        if (io) {
            io.emit('bulk_buy_opportunity', bulkBuy);
        }
        
        res.json(bulkBuy);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Sync with other platforms
router.post('/sync', async (req, res) => {
    try {
        const { platform, data, familyId } = req.body;
        
        switch(platform) {
            case 'calendar':
                await syncWithCalendar(data, familyId);
                break;
            case 'medical':
                await syncWithMedical(data, familyId);
                break;
            case 'home':
                await syncWithHome(data, familyId);
                break;
        }
        
        res.json({ success: true, platform });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Waste tracking
router.get('/waste/stats', async (req, res) => {
    try {
        const { familyId, period } = req.query;
        
        // Calculate waste statistics
        const stats = await calculateWasteStats(familyId, period);
        
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper functions
async function generateAIMealPlan(params) {
    // AI meal plan generation logic
    const weekPlan = {};
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const mealTypes = ['breakfast', 'lunch', 'dinner'];
    
    days.forEach(day => {
        weekPlan[day] = {};
        mealTypes.forEach(type => {
            weekPlan[day][type] = {
                name: `AI-Generated ${type}`,
                calories: Math.floor(Math.random() * 500 + 300),
                protein: Math.floor(Math.random() * 30 + 10),
                recipe: 'AI-optimized recipe based on your preferences'
            };
        });
    });
    
    return weekPlan;
}

async function parseVoiceToItems(transcript) {
    // Parse natural language to shopping items
    const items = [];
    const words = transcript.toLowerCase().split(' ');
    
    // Simple parsing - would use NLP in production
    const foodKeywords = ['milk', 'eggs', 'bread', 'chicken', 'apples'];
    
    foodKeywords.forEach(keyword => {
        if (words.includes(keyword)) {
            items.push({
                name: keyword,
                quantity: 1,
                category: detectCategory(keyword)
            });
        }
    });
    
    return items;
}

function detectCategory(itemName) {
    const categories = {
        dairy: ['milk', 'cheese', 'yogurt', 'butter'],
        proteins: ['chicken', 'beef', 'fish', 'eggs'],
        produce: ['apple', 'banana', 'tomato', 'lettuce'],
        grains: ['bread', 'rice', 'pasta', 'cereal']
    };
    
    for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => itemName.toLowerCase().includes(keyword))) {
            return category;
        }
    }
    
    return 'other';
}

async function processReceiptOCR(imagePath) {
    // Mock OCR processing - would use real OCR API
    return {
        store: 'Walmart',
        date: new Date(),
        text: 'Sample receipt text with items'
    };
}

async function extractReceiptItems(scannedData) {
    // Extract items from OCR text
    return [
        { name: 'Milk', price: 4.99, quantity: 1 },
        { name: 'Eggs', price: 3.99, quantity: 2 },
        { name: 'Bread', price: 2.99, quantity: 1 }
    ];
}

async function updatePriceHistory(items, store) {
    // Update price tracking database
    for (const item of items) {
        if (hasModels) {
            await PriceHistory.create({
                itemName: item.name,
                price: item.price,
                store: store,
                date: new Date()
            });
        }
    }
}

async function addReceiptToInventory(items, familyId) {
    // Auto-add scanned items to inventory
    for (const item of items) {
        if (hasModels) {
            await Inventory.findOneAndUpdate(
                { familyId, name: item.name },
                { $inc: { quantity: item.quantity } },
                { upsert: true }
            );
        }
    }
}

async function checkPriceAlerts(item) {
    // Check for price drops and deals
    if (hasModels) {
        const history = await PriceHistory.find({ itemName: item.name })
            .sort('-date')
            .limit(10);
        
        if (history.length > 1) {
            const currentPrice = history[0].price;
            const avgPrice = history.reduce((sum, h) => sum + h.price, 0) / history.length;
            
            if (currentPrice < avgPrice * 0.8) {
                // 20% below average - send alert
                return {
                    type: 'price_drop',
                    item: item.name,
                    discount: Math.round((1 - currentPrice/avgPrice) * 100)
                };
            }
        }
    }
    
    return null;
}

async function suggestReorder(item) {
    // Suggest reordering low inventory items
    const io = require('../services/socketService').io;
    if (io) {
        io.to(`family_${item.familyId}`).emit('inventory_low', {
            item: item.name,
            quantity: item.quantity,
            suggestion: 'Add to shopping list?'
        });
    }
}

async function findPriceAlerts(familyId) {
    // Find current deals and price drops
    const alerts = [];
    
    // Mock data - would query real price data
    alerts.push({
        item: 'Organic Chicken',
        store: 'Costco',
        originalPrice: 12.99,
        salePrice: 8.99,
        discount: 31,
        validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    });
    
    return alerts;
}

async function analyzeNutrition(params) {
    // Analyze nutritional content
    return {
        calories: {
            total: 2100,
            goal: 2000,
            percentage: 105
        },
        protein: {
            total: 95,
            goal: 80,
            percentage: 119
        },
        vitamins: {
            A: 85,
            C: 120,
            D: 65,
            E: 90
        }
    };
}

async function calculateNutritionProgress(params) {
    // Calculate progress towards goals
    return {
        weekly: {
            calories: 95,
            protein: 88,
            vegetables: 72,
            water: 80
        },
        monthly: {
            weightChange: -2.5,
            energyLevel: 85,
            goalsmet: 18
        }
    };
}

function calculateBulkSavings(items) {
    // Calculate potential savings from bulk buying
    const regularTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const bulkTotal = regularTotal * 0.7; // 30% discount for bulk
    
    return {
        regular: regularTotal,
        bulk: bulkTotal,
        savings: regularTotal - bulkTotal,
        percentage: 30
    };
}

async function syncWithCalendar(data, familyId) {
    // Sync meal events with calendar
    const calendarService = require('../services/calendarService');
    if (calendarService) {
        await calendarService.syncMealEvents(data, familyId);
    }
}

async function syncWithMedical(data, familyId) {
    // Sync dietary restrictions from medical platform
    if (data.restrictions) {
        // Update family dietary restrictions
        memoryStorage.familyPreferences[familyId] = {
            ...memoryStorage.familyPreferences[familyId],
            restrictions: data.restrictions
        };
    }
}

async function syncWithHome(data, familyId) {
    // Sync with smart home devices
    if (data.fridgeUpdate) {
        // Process smart fridge data
        console.log('Smart fridge update:', data.fridgeUpdate);
    }
}

async function syncMealToCalendar(meal) {
    // Create calendar event for meal
    try {
        const response = await fetch('http://localhost:5001/api/calendar/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: meal.name,
                date: meal.date,
                time: meal.time,
                type: 'meal',
                familyId: meal.familyId,
                description: `${meal.calories} cal | ${meal.protein}g protein`
            })
        });
        
        if (response.ok) {
            console.log('Meal synced to calendar');
        }
    } catch (error) {
        console.error('Failed to sync meal to calendar:', error);
    }
}

async function calculateWasteStats(familyId, period) {
    // Calculate food waste statistics
    return {
        totalWaste: 2.3, // kg
        wasteSaved: 8.7, // kg
        moneySaved: 127.50,
        itemsSaved: 42,
        percentage: 79
    };
}

async function generateAIRecipe(params) {
    // Generate recipe using AI
    return {
        name: 'AI-Generated Healthy Bowl',
        ingredients: params.ingredients,
        instructions: [
            'Prep all ingredients',
            'Cook according to AI-optimized timing',
            'Combine and serve'
        ],
        nutrition: {
            calories: 450,
            protein: 28,
            carbs: 45,
            fats: 18
        },
        prepTime: 15,
        cookTime: 20
    };
}

module.exports = router;