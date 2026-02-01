import React, { useState } from 'react';
import { Phone, Clock, MapPin, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';

export default function OrderPage() {
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('pickup');

  const menuItems = [
    { id: 1, name: 'Butter Croissant', price: 4.50, category: 'Pastries' },
    { id: 2, name: 'Sourdough Loaf', price: 8.00, category: 'Breads' },
    { id: 3, name: 'Chocolate Cake Slice', price: 6.00, category: 'Cakes' },
    { id: 4, name: 'Cinnamon Roll', price: 5.00, category: 'Pastries' },
    { id: 5, name: 'Baguette', price: 6.00, category: 'Breads' },
    { id: 6, name: 'Coffee', price: 3.50, category: 'Drinks' }
  ];

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? {...c, qty: c.qty + 1} : c));
    } else {
      setCart([...cart, {...item, qty: 1}]);
    }
  };

  const updateQty = (id, delta) => {
    setCart(cart.map(c => c.id === id ? {...c, qty: Math.max(0, c.qty + delta)} : c).filter(c => c.qty > 0));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Order Online</h1>
        <p style={styles.subtitle}>Fresh baked goods ready when you are</p>
      </header>

      <section style={styles.orderOptions}>
        <div style={styles.optionBtns}>
          <button onClick={() => setOrderType('pickup')} style={{...styles.optionBtn, ...(orderType === 'pickup' ? styles.optionActive : {})}}>
            <MapPin size={18} /> Pickup
          </button>
          <button onClick={() => setOrderType('delivery')} style={{...styles.optionBtn, ...(orderType === 'delivery' ? styles.optionActive : {})}}>
            <Clock size={18} /> Delivery
          </button>
        </div>
        <p style={styles.infoText}>
          {orderType === 'pickup' ? 'Ready in 15-20 minutes' : 'Delivered in 30-45 minutes'}
        </p>
      </section>

      <section style={styles.content}>
        <div style={styles.container}>
          <div style={styles.grid}>
            <div style={styles.menu}>
              <h2 style={styles.sectionTitle}>Menu</h2>
              <div style={styles.menuGrid}>
                {menuItems.map(item => (
                  <div key={item.id} style={styles.menuCard}>
                    <div style={styles.menuInfo}>
                      <h3 style={styles.menuName}>{item.name}</h3>
                      <p style={styles.menuCategory}>{item.category}</p>
                      <p style={styles.menuPrice}>${item.price.toFixed(2)}</p>
                    </div>
                    <button onClick={() => addToCart(item)} style={styles.addBtn}><Plus size={18} /></button>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.cartSection}>
              <h2 style={styles.sectionTitle}>Your Order</h2>
              {cart.length === 0 ? (
                <p style={styles.emptyCart}>Your cart is empty</p>
              ) : (
                <>
                  {cart.map(item => (
                    <div key={item.id} style={styles.cartItem}>
                      <div style={styles.cartInfo}>
                        <span style={styles.cartName}>{item.name}</span>
                        <span style={styles.cartPrice}>${(item.price * item.qty).toFixed(2)}</span>
                      </div>
                      <div style={styles.cartControls}>
                        <button onClick={() => updateQty(item.id, -1)} style={styles.qtyBtn}><Minus size={14} /></button>
                        <span style={styles.qty}>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} style={styles.qtyBtn}><Plus size={14} /></button>
                      </div>
                    </div>
                  ))}
                  <div style={styles.cartTotal}>
                    <span>Total</span>
                    <span style={styles.totalAmount}>${total.toFixed(2)}</span>
                  </div>
                  <button style={styles.checkoutBtn}><ShoppingBag size={18} /> Checkout</button>
                </>
              )}
              <div style={styles.callOption}>
                <p style={styles.callText}>Prefer to call?</p>
                <a href="tel:(214) 513-2253" style={styles.callBtn}><Phone size={16} /> (214) 513-2253</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: { background: '#FFF8F0', minHeight: '100vh' },
  header: { padding: '48px 24px', textAlign: 'center', background: '#FFF8F0' },
  title: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: '2rem', fontWeight: '700', color: '#3E2723', marginBottom: '8px' },
  subtitle: { color: '#64748b' },
  orderOptions: { padding: '24px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' },
  optionBtns: { display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '12px' },
  optionBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', border: '2px solid #e5e7eb', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontWeight: '500', color: '#3E2723' },
  optionActive: { borderColor: '#8B4513', background: '#8B4513', color: '#fff' },
  infoText: { color: '#64748b', fontSize: '0.9rem' },
  content: { padding: '120px 20px' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '0 24px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 350px', gap: '48px' },
  menu: {},
  sectionTitle: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontSize: '1.5rem', fontWeight: '600', color: '#3E2723', marginBottom: '24px' },
  menuGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
  menuCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  menuInfo: {},
  menuName: { fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", fontWeight: '600', color: '#3E2723', marginBottom: '2px' },
  menuCategory: { color: '#64748b', fontSize: '0.85rem', marginBottom: '4px' },
  menuPrice: { color: '#8B4513', fontWeight: '700' },
  addBtn: { width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: '#8B4513', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cartSection: { background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', height: 'fit-content', position: 'sticky', top: '24px' },
  emptyCart: { color: '#64748b', textAlign: 'center', padding: '32px 0' },
  cartItem: { padding: '12px 0', borderBottom: '1px solid #e5e7eb' },
  cartInfo: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
  cartName: { fontWeight: '500', color: '#3E2723' },
  cartPrice: { color: '#8B4513', fontWeight: '600' },
  cartControls: { display: 'flex', alignItems: 'center', gap: '12px' },
  qtyBtn: { width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #e5e7eb', background: '#FFF8F0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3E2723' },
  qty: { fontWeight: '600', color: '#3E2723' },
  cartTotal: { display: 'flex', justifyContent: 'space-between', padding: '16px 0', fontWeight: '600', fontSize: '1.1rem', color: '#3E2723' },
  totalAmount: { color: '#8B4513' },
  checkoutBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', background: '#8B4513', color: '#fff', border: 'none', padding: '16px', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  callOption: { marginTop: '24px', textAlign: 'center', paddingTop: '24px', borderTop: '1px solid #e5e7eb' },
  callText: { color: '#64748b', marginBottom: '8px', fontSize: '0.9rem' },
  callBtn: { display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#8B4513', textDecoration: 'none', fontWeight: '600' }
};
