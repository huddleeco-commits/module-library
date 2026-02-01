/**
 * Restaurant MenuPage Generator
 */

function generateMenuPage(fixture, options = {}) {
  const { business, theme, pages } = fixture;
  const colors = options.colors || theme?.colors;

  // Extract menu from fixture - check multiple possible locations
  const fixtureMenu = pages?.menu?.categories || fixture.menu?.categories || fixture.menu || [];

  // Convert fixture menu format to component format
  const menuCategories = fixtureMenu.length > 0
    ? fixtureMenu.map((cat, idx) => ({
        id: cat.name?.toLowerCase().replace(/\s+/g, '-') || `category-${idx}`,
        name: cat.name || 'Menu Items',
        description: cat.description || '',
        items: (cat.items || []).map(item => ({
          name: item.name,
          description: item.description || '',
          price: typeof item.price === 'number' ? `$${item.price.toFixed(2)}` : (item.price || ''),
          tags: item.tags || (item.popular ? ['Popular'] : [])
        }))
      }))
    : getDefaultMenuForIndustry(business?.industry);

  return `/**
 * MenuPage - ${business.name}
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Flame, Leaf, Star, Clock, Calendar } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};

const MENU_CATEGORIES = ${JSON.stringify(menuCategories, null, 2)};

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('appetizers');

  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{
        padding: '80px 20px',
        backgroundColor: COLORS.primary,
        color: 'white',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>Our Menu</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>Fresh ingredients, bold flavors</p>
      </section>

      {/* Category Tabs */}
      <section style={{
        backgroundColor: 'white',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        position: 'sticky',
        top: '72px',
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          gap: '8px',
          padding: '16px 20px',
          overflowX: 'auto'
        }}>
          {MENU_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '12px 24px',
                borderRadius: '50px',
                border: 'none',
                backgroundColor: activeCategory === cat.id ? COLORS.primary : 'transparent',
                color: activeCategory === cat.id ? 'white' : COLORS.text,
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Menu Items */}
      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {MENU_CATEGORIES.filter(cat => cat.id === activeCategory).map(category => (
            <div key={category.id}>
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '8px' }}>{category.name}</h2>
                <p style={{ opacity: 0.7, fontSize: '18px' }}>{category.description}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {category.items.map((item, idx) => (
                  <div key={idx} style={{
                    padding: '24px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
                          {item.name}
                          {item.tags?.map((tag, i) => (
                            <span key={i} style={{
                              marginLeft: '8px',
                              padding: '4px 10px',
                              backgroundColor: tag === 'Popular' ? '#F59E0B20' : tag === 'Vegetarian' ? '#22C55E20' : \`\${COLORS.primary}15\`,
                              color: tag === 'Popular' ? '#D97706' : tag === 'Vegetarian' ? '#16A34A' : COLORS.primary,
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}>
                              {tag}
                            </span>
                          ))}
                        </h3>
                      </div>
                      <span style={{ fontSize: '20px', fontWeight: '700', color: COLORS.primary }}>{item.price}</span>
                    </div>
                    <p style={{ opacity: 0.7, lineHeight: 1.6 }}>{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dietary Info */}
      <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>Dietary Information</h3>
          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Leaf size={20} color="#16A34A" />
              <span>Vegetarian options available</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: '600' }}>GF</span>
              <span>Gluten-free options available</span>
            </div>
          </div>
          <p style={{ marginTop: '24px', opacity: 0.7 }}>
            Please inform your server of any allergies or dietary restrictions
          </p>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '80px 20px',
        backgroundColor: COLORS.primary,
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '36px', fontWeight: '700', color: 'white', marginBottom: '24px' }}>
          Ready to Dine?
        </h2>
        <Link to="/reservations" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'white',
          color: COLORS.primary,
          padding: '16px 32px',
          borderRadius: '50px',
          fontWeight: '600',
          textDecoration: 'none'
        }}>
          <Calendar size={20} />
          Make a Reservation
        </Link>
      </section>
    </div>
  );
}
`;
}

/**
 * Get default menu items based on industry type
 */
function getDefaultMenuForIndustry(industry) {
  const industryMenus = {
    bakery: [
      {
        id: 'pastries',
        name: 'Pastries',
        description: 'Fresh baked daily',
        items: [
          { name: 'Butter Croissant', description: 'Flaky, buttery, 48-hour fermented dough', price: '$4.50', tags: ['Popular'] },
          { name: 'Almond Croissant', description: 'Filled with almond cream, toasted almonds', price: '$5.50', tags: [] },
          { name: 'Pain au Chocolat', description: 'Dark chocolate batons in flaky pastry', price: '$5.00', tags: [] },
          { name: 'Cinnamon Roll', description: 'Cream cheese frosted, gooey center', price: '$5.50', tags: ['Popular'] }
        ]
      },
      {
        id: 'breads',
        name: 'Artisan Breads',
        description: 'Handcrafted with love',
        items: [
          { name: 'Sourdough Loaf', description: 'Wild yeast, 24-hour ferment, crusty perfection', price: '$8.00', tags: ['Popular'] },
          { name: 'French Baguette', description: 'Traditional recipe, crispy crust', price: '$4.00', tags: [] },
          { name: 'Brioche Loaf', description: 'Rich, buttery, perfect for French toast', price: '$9.00', tags: [] },
          { name: 'Focaccia', description: 'Rosemary, sea salt, olive oil', price: '$7.00', tags: [] }
        ]
      },
      {
        id: 'cakes',
        name: 'Cakes & Sweets',
        description: 'Indulgent treats',
        items: [
          { name: 'Chocolate Layer Cake', description: 'Triple layer, dark chocolate ganache', price: '$6.00', tags: ['Popular'] },
          { name: 'Carrot Cake Slice', description: 'Cream cheese frosting, toasted walnuts', price: '$6.00', tags: [] },
          { name: 'Fruit Tart', description: 'Seasonal fruits, vanilla pastry cream', price: '$5.50', tags: [] },
          { name: 'Fudge Brownie', description: 'Decadent, sea salt topped', price: '$4.00', tags: [] }
        ]
      },
      {
        id: 'drinks',
        name: 'Beverages',
        description: 'Perfect pairings',
        items: [
          { name: 'Drip Coffee', description: 'Locally roasted, fresh brewed', price: '$3.00', tags: [] },
          { name: 'Latte', description: 'Espresso with steamed milk', price: '$5.00', tags: [] },
          { name: 'Hot Chocolate', description: 'Rich and creamy', price: '$4.00', tags: [] },
          { name: 'Fresh Orange Juice', description: 'Squeezed to order', price: '$4.50', tags: [] }
        ]
      }
    ],
    pizza: [
      {
        id: 'pizzas',
        name: 'Signature Pizzas',
        description: 'Hand-tossed, stone-fired',
        items: [
          { name: 'Margherita', description: 'Fresh mozzarella, San Marzano tomatoes, basil', price: '$16.00', tags: ['Popular'] },
          { name: 'Pepperoni', description: 'Classic pepperoni, mozzarella, house sauce', price: '$18.00', tags: ['Popular'] },
          { name: 'Supreme', description: 'Pepperoni, sausage, peppers, onions, mushrooms', price: '$22.00', tags: [] },
          { name: 'BBQ Chicken', description: 'Grilled chicken, BBQ sauce, red onion, cilantro', price: '$20.00', tags: [] }
        ]
      }
    ],
    cafe: [
      {
        id: 'coffee',
        name: 'Coffee & Espresso',
        description: 'Locally roasted beans',
        items: [
          { name: 'Espresso', description: 'Rich, bold single shot', price: '$3.00', tags: [] },
          { name: 'Cappuccino', description: 'Espresso, steamed milk, foam', price: '$5.00', tags: ['Popular'] },
          { name: 'Latte', description: 'Espresso with silky steamed milk', price: '$5.50', tags: ['Popular'] },
          { name: 'Cold Brew', description: '24-hour steeped, smooth finish', price: '$4.50', tags: [] }
        ]
      }
    ]
  };

  // Return industry-specific menu or generic restaurant menu
  return industryMenus[industry] || industryMenus['bakery'];
}

module.exports = { generateMenuPage };
