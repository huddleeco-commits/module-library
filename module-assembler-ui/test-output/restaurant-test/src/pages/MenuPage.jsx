/**
 * MenuPage - Test Pizza Co
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Flame, Leaf, Star, Clock, Calendar } from 'lucide-react';

const COLORS = {
  "primary": "#E63946",
  "secondary": "#F4A261",
  "accent": "#2A9D8F",
  "background": "#1D3557",
  "text": "#F1FAEE"
};

const MENU_CATEGORIES = [
  {
    "id": "appetizers",
    "name": "Appetizers",
    "description": "Start your meal with our delicious starters",
    "items": [
      {
        "name": "Crispy Calamari",
        "description": "Lightly breaded and served with marinara",
        "price": "$14",
        "tags": [
          "Popular"
        ]
      },
      {
        "name": "Bruschetta",
        "description": "Toasted bread with tomatoes, basil, garlic",
        "price": "$11",
        "tags": [
          "Vegetarian"
        ]
      },
      {
        "name": "Soup of the Day",
        "description": "Ask your server for today's selection",
        "price": "$8",
        "tags": []
      },
      {
        "name": "Charcuterie Board",
        "description": "Selection of cured meats and cheeses",
        "price": "$22",
        "tags": [
          "Shareable"
        ]
      }
    ]
  },
  {
    "id": "mains",
    "name": "Main Courses",
    "description": "Our signature entrees",
    "items": [
      {
        "name": "Grilled Salmon",
        "description": "Atlantic salmon with seasonal vegetables",
        "price": "$32",
        "tags": [
          "Popular",
          "Gluten-Free"
        ]
      },
      {
        "name": "Ribeye Steak",
        "description": "12oz USDA Prime, herb butter",
        "price": "$45",
        "tags": [
          "Popular"
        ]
      },
      {
        "name": "Chicken Parmesan",
        "description": "Breaded chicken, marinara, fresh mozzarella",
        "price": "$26",
        "tags": []
      },
      {
        "name": "Vegetable Risotto",
        "description": "Arborio rice, seasonal vegetables, parmesan",
        "price": "$24",
        "tags": [
          "Vegetarian"
        ]
      },
      {
        "name": "Seafood Pasta",
        "description": "Shrimp, mussels, clams in white wine sauce",
        "price": "$34",
        "tags": []
      }
    ]
  },
  {
    "id": "desserts",
    "name": "Desserts",
    "description": "Sweet endings to your meal",
    "items": [
      {
        "name": "Tiramisu",
        "description": "Classic Italian coffee-flavored dessert",
        "price": "$12",
        "tags": [
          "Popular"
        ]
      },
      {
        "name": "Chocolate Lava Cake",
        "description": "Warm chocolate cake with vanilla ice cream",
        "price": "$14",
        "tags": []
      },
      {
        "name": "Cheesecake",
        "description": "New York style with berry compote",
        "price": "$11",
        "tags": []
      }
    ]
  },
  {
    "id": "drinks",
    "name": "Beverages",
    "description": "Craft cocktails, wine, and more",
    "items": [
      {
        "name": "House Red Wine",
        "description": "Glass of our featured red",
        "price": "$12",
        "tags": []
      },
      {
        "name": "House White Wine",
        "description": "Glass of our featured white",
        "price": "$11",
        "tags": []
      },
      {
        "name": "Signature Cocktail",
        "description": "Ask about our seasonal creation",
        "price": "$15",
        "tags": [
          "Popular"
        ]
      },
      {
        "name": "Craft Beer",
        "description": "Selection of local brews",
        "price": "$8",
        "tags": []
      }
    ]
  }
];

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
                              backgroundColor: tag === 'Popular' ? '#F59E0B20' : tag === 'Vegetarian' ? '#22C55E20' : `${COLORS.primary}15`,
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
