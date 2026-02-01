/**
 * Universal MenuPage Generator
 * Fetches menu from API, works for all food industries
 */
function generateMenuPage(fixture, options = {}) {
  const { business, theme } = fixture;
  const colors = options.colors || theme?.colors || {
    primary: '#D97706',
    secondary: '#92400E',
    background: '#FFFBEB',
    text: '#1F2937'
  };

  return `import React, { useState, useEffect } from 'react';
import { Search, Filter, ShoppingCart, Plus, Minus, X, Loader2 } from 'lucide-react';

const COLORS = ${JSON.stringify(colors, null, 2)};
const API_BASE = import.meta.env.VITE_API_URL || '';

export default function MenuPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menu, setMenu] = useState({ categories: [] });
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await fetch(\`\${API_BASE}/api/menu\`);
      const data = await res.json();
      if (data.success && data.menu) {
        setMenu(data.menu);
        if (data.menu.categories?.length > 0) {
          setActiveCategory(data.menu.categories[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch menu:', err);
      setError('Unable to load menu. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === itemId);
      if (existing?.quantity > 1) {
        return prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.id !== itemId);
    });
  };

  const getCartTotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const getCartCount = () => cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleOrder = async () => {
    if (cart.length === 0) return;

    try {
      const res = await fetch(\`\${API_BASE}/api/orders\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          total: getCartTotal(),
          source: 'website'
        })
      });

      const data = await res.json();
      if (data.success) {
        alert(\`Order placed! Order #\${data.order?.id || 'confirmed'}\`);
        setCart([]);
        setShowCart(false);
      } else {
        alert(data.error || 'Failed to place order');
      }
    } catch (err) {
      console.error('Order error:', err);
      alert('Unable to place order. Please try again.');
    }
  };

  const filteredItems = () => {
    let items = [];
    if (activeCategory) {
      const cat = menu.categories?.find(c => c.id === activeCategory);
      items = cat?.items || [];
    } else {
      items = menu.categories?.flatMap(c => c.items || []) || [];
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter(item =>
        item.name?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term)
      );
    }

    return items;
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: COLORS.background, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: COLORS.primary }} />
          <p style={{ marginTop: '16px', color: '#6B7280' }}>Loading menu...</p>
        </div>
        <style>{\`@keyframes spin { to { transform: rotate(360deg); } }\`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ backgroundColor: COLORS.background, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#DC2626', marginBottom: '16px' }}>{error}</p>
          <button onClick={fetchMenu} style={{ padding: '12px 24px', backgroundColor: COLORS.primary, color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: COLORS.background, minHeight: '100vh' }}>
      {/* Header */}
      <section style={{ padding: '60px 20px', backgroundColor: COLORS.primary, color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px' }}>Our Menu</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>${business?.name || 'Delicious food made with love'}</p>
      </section>

      {/* Search & Cart */}
      <section style={{ padding: '20px', backgroundColor: 'white', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 12px 12px 44px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '16px' }}
            />
          </div>
          <button
            onClick={() => setShowCart(true)}
            style={{
              position: 'relative', padding: '12px 20px',
              backgroundColor: cart.length > 0 ? COLORS.primary : '#F3F4F6',
              color: cart.length > 0 ? 'white' : '#6B7280',
              borderRadius: '8px', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600'
            }}
          >
            <ShoppingCart size={20} />
            {cart.length > 0 && (
              <>
                <span>\${getCartTotal().toFixed(2)}</span>
                <span style={{
                  position: 'absolute', top: '-8px', right: '-8px',
                  backgroundColor: '#DC2626', color: 'white',
                  borderRadius: '50%', width: '24px', height: '24px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: '700'
                }}>
                  {getCartCount()}
                </span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Categories */}
      {menu.categories?.length > 0 && (
        <section style={{ padding: '20px', backgroundColor: 'white', borderBottom: '1px solid #E5E7EB', overflowX: 'auto' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '12px' }}>
            {menu.categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '10px 20px', borderRadius: '20px', whiteSpace: 'nowrap',
                  backgroundColor: activeCategory === cat.id ? COLORS.primary : '#F3F4F6',
                  color: activeCategory === cat.id ? 'white' : '#374151',
                  border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '14px'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Menu Items */}
      <section style={{ padding: '40px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {filteredItems().length === 0 ? (
            <p style={{ textAlign: 'center', color: '#6B7280', padding: '40px' }}>
              {searchTerm ? 'No items match your search' : 'No items available'}
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
              {filteredItems().map(item => (
                <div key={item.id} style={{
                  backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)', transition: 'transform 0.2s'
                }}>
                  {item.image_url && (
                    <div style={{ height: '180px', backgroundImage: \`url(\${item.image_url})\`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  )}
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>{item.name}</h3>
                      <span style={{ fontWeight: '700', color: COLORS.primary, fontSize: '18px' }}>
                        \${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                      </span>
                    </div>
                    {item.description && (
                      <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '16px', lineHeight: '1.5' }}>
                        {item.description}
                      </p>
                    )}
                    <button
                      onClick={() => addToCart(item)}
                      style={{
                        width: '100%', padding: '12px',
                        backgroundColor: COLORS.primary, color: 'white',
                        borderRadius: '8px', border: 'none', cursor: 'pointer',
                        fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                      }}
                    >
                      <Plus size={18} /> Add to Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cart Sidebar */}
      {showCart && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000 }}>
          <div onClick={() => setShowCart(false)} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)' }} />
          <div style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: '100%', maxWidth: '400px',
            backgroundColor: 'white', boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
            display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Your Order</h2>
              <button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
              {cart.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#6B7280', padding: '40px' }}>Your cart is empty</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: '16px', padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{item.name}</div>
                        <div style={{ color: COLORS.primary, fontWeight: '600' }}>\${(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={() => removeFromCart(item.id)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Minus size={16} />
                        </button>
                        <span style={{ fontWeight: '600', minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => addToCart(item)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', backgroundColor: COLORS.primary, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ padding: '20px', borderTop: '1px solid #E5E7EB' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '18px' }}>
                  <span style={{ fontWeight: '600' }}>Total</span>
                  <span style={{ fontWeight: '700', color: COLORS.primary }}>\${getCartTotal().toFixed(2)}</span>
                </div>
                <button
                  onClick={handleOrder}
                  style={{
                    width: '100%', padding: '16px',
                    backgroundColor: COLORS.primary, color: 'white',
                    borderRadius: '12px', border: 'none', cursor: 'pointer',
                    fontWeight: '700', fontSize: '18px'
                  }}
                >
                  Place Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{\`@keyframes spin { to { transform: rotate(360deg); } }\`}</style>
    </div>
  );
}`;
}

module.exports = { generateMenuPage };
