/**
 * Mock API Layer
 *
 * Simulates a real backend using localStorage as the data store.
 * Shared between website preview and companion app preview for
 * demonstrating full system integration with zero API costs.
 *
 * Key: All previews in the same browser share localStorage,
 * so orders placed on website appear in companion app, etc.
 */

const { getIndustryFixture, getDemoUsers } = require('./industry-fixtures.cjs');

// LocalStorage keys (namespaced to avoid conflicts)
const STORAGE_KEYS = {
  USER: 'demo_current_user',
  CART: 'demo_cart',
  ORDERS: 'demo_orders',
  RESERVATIONS: 'demo_reservations',
  POINTS_LOG: 'demo_points_log',
  FIXTURE: 'demo_fixture'
};

/**
 * Generate the Mock API JavaScript code to be injected into preview HTML
 * This runs in the browser and provides a full simulated backend
 */
function generateMockApiScript(industry, businessName) {
  const fixture = getIndustryFixture(industry);
  const demoUsers = getDemoUsers();

  // Customize fixture with business name
  const customizedFixture = {
    ...fixture,
    business: {
      ...fixture.business,
      name: businessName || fixture.business.name
    }
  };

  return `
<script>
// ============================================
// MOCK API - Zero Cost Backend Simulation
// ============================================

(function() {
  'use strict';

  // Storage keys
  const KEYS = {
    USER: 'demo_current_user',
    CART: 'demo_cart',
    ORDERS: 'demo_orders',
    RESERVATIONS: 'demo_reservations',
    POINTS_LOG: 'demo_points_log'
  };

  // Fixture data (injected at generation time)
  const FIXTURE = ${JSON.stringify(customizedFixture, null, 2)};

  // Demo users
  const DEMO_USERS = ${JSON.stringify(demoUsers, null, 2)};

  // Helper: Get from localStorage with default
  function getStorage(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }

  // Helper: Set to localStorage
  function setStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      // Dispatch event for cross-iframe communication
      window.dispatchEvent(new CustomEvent('mockapi-update', { detail: { key, value } }));
    } catch (e) {
      console.error('Storage error:', e);
    }
  }

  // Helper: Generate unique ID
  function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // ============================================
  // AUTH API
  // ============================================

  const AuthAPI = {
    login(email, password) {
      const user = DEMO_USERS[email];
      if (user && user.password === password) {
        const userData = { ...user };
        delete userData.password;
        setStorage(KEYS.USER, userData);
        return { success: true, user: userData, token: 'demo_token_' + Date.now() };
      }
      return { success: false, error: 'Invalid email or password' };
    },

    logout() {
      localStorage.removeItem(KEYS.USER);
      window.dispatchEvent(new CustomEvent('mockapi-update', { detail: { key: KEYS.USER, value: null } }));
      return { success: true };
    },

    getProfile() {
      const user = getStorage(KEYS.USER);
      if (user) {
        return { success: true, user };
      }
      return { success: false, error: 'Not authenticated' };
    },

    isAuthenticated() {
      return !!getStorage(KEYS.USER);
    },

    getCurrentUser() {
      return getStorage(KEYS.USER);
    }
  };

  // ============================================
  // MENU/SERVICES API
  // ============================================

  const MenuAPI = {
    getMenu() {
      return { success: true, menu: FIXTURE.menu || [], business: FIXTURE.business };
    },

    getServices() {
      return { success: true, services: FIXTURE.services || FIXTURE.menu || [], business: FIXTURE.business };
    },

    getItem(itemId) {
      const allItems = (FIXTURE.menu || FIXTURE.services || [])
        .flatMap(cat => cat.items || []);
      const item = allItems.find(i => i.id === itemId);
      return item ? { success: true, item } : { success: false, error: 'Item not found' };
    },

    getCategories() {
      const categories = (FIXTURE.menu || FIXTURE.services || []).map(cat => ({
        name: cat.category,
        itemCount: (cat.items || []).length
      }));
      return { success: true, categories };
    }
  };

  // ============================================
  // CART API
  // ============================================

  const CartAPI = {
    getCart() {
      const cart = getStorage(KEYS.CART, { items: [], total: 0 });
      return { success: true, cart };
    },

    addItem(item, quantity = 1) {
      const cart = getStorage(KEYS.CART, { items: [], total: 0 });

      // Check if item already in cart
      const existingIndex = cart.items.findIndex(i => i.id === item.id);
      if (existingIndex >= 0) {
        cart.items[existingIndex].quantity += quantity;
      } else {
        cart.items.push({ ...item, quantity });
      }

      // Recalculate total
      cart.total = cart.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

      setStorage(KEYS.CART, cart);
      return { success: true, cart };
    },

    removeItem(itemId) {
      const cart = getStorage(KEYS.CART, { items: [], total: 0 });
      cart.items = cart.items.filter(i => i.id !== itemId);
      cart.total = cart.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
      setStorage(KEYS.CART, cart);
      return { success: true, cart };
    },

    updateQuantity(itemId, quantity) {
      const cart = getStorage(KEYS.CART, { items: [], total: 0 });
      const item = cart.items.find(i => i.id === itemId);
      if (item) {
        if (quantity <= 0) {
          cart.items = cart.items.filter(i => i.id !== itemId);
        } else {
          item.quantity = quantity;
        }
        cart.total = cart.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        setStorage(KEYS.CART, cart);
      }
      return { success: true, cart };
    },

    clearCart() {
      setStorage(KEYS.CART, { items: [], total: 0 });
      return { success: true };
    }
  };

  // ============================================
  // ORDERS API
  // ============================================

  const OrdersAPI = {
    placeOrder(orderData = {}) {
      const user = AuthAPI.getCurrentUser();
      const cart = getStorage(KEYS.CART, { items: [], total: 0 });

      if (cart.items.length === 0) {
        return { success: false, error: 'Cart is empty' };
      }

      const order = {
        id: generateId(),
        items: [...cart.items],
        total: cart.total,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        customer: user ? { name: user.name, email: user.email } : orderData.customer,
        type: orderData.type || 'pickup', // pickup, delivery, dine-in
        notes: orderData.notes || ''
      };

      // Add to orders
      const orders = getStorage(KEYS.ORDERS, []);
      orders.unshift(order);
      setStorage(KEYS.ORDERS, orders);

      // Award loyalty points if logged in
      if (user) {
        const pointsEarned = Math.floor(cart.total * (FIXTURE.loyalty?.pointsPerDollar || 10));
        LoyaltyAPI.addPoints(pointsEarned, 'Order #' + order.id.slice(-6));
      }

      // Clear cart
      CartAPI.clearCart();

      return { success: true, order, pointsEarned: user ? Math.floor(cart.total * 10) : 0 };
    },

    getOrders() {
      const orders = getStorage(KEYS.ORDERS, []);
      return { success: true, orders };
    },

    getOrder(orderId) {
      const orders = getStorage(KEYS.ORDERS, []);
      const order = orders.find(o => o.id === orderId);
      return order ? { success: true, order } : { success: false, error: 'Order not found' };
    },

    // Admin: Update order status
    updateOrderStatus(orderId, status) {
      const orders = getStorage(KEYS.ORDERS, []);
      const order = orders.find(o => o.id === orderId);
      if (order) {
        order.status = status;
        order.updatedAt = new Date().toISOString();
        setStorage(KEYS.ORDERS, orders);
        return { success: true, order };
      }
      return { success: false, error: 'Order not found' };
    }
  };

  // ============================================
  // RESERVATIONS API
  // ============================================

  const ReservationsAPI = {
    createReservation(data) {
      const user = AuthAPI.getCurrentUser();

      const reservation = {
        id: generateId(),
        date: data.date,
        time: data.time,
        partySize: data.partySize || 2,
        name: data.name || user?.name || 'Guest',
        phone: data.phone || user?.phone || '',
        email: data.email || user?.email || '',
        notes: data.notes || '',
        status: 'confirmed',
        createdAt: new Date().toISOString()
      };

      const reservations = getStorage(KEYS.RESERVATIONS, []);
      reservations.unshift(reservation);
      setStorage(KEYS.RESERVATIONS, reservations);

      return { success: true, reservation };
    },

    getReservations() {
      const reservations = getStorage(KEYS.RESERVATIONS, []);
      return { success: true, reservations };
    },

    cancelReservation(reservationId) {
      const reservations = getStorage(KEYS.RESERVATIONS, []);
      const reservation = reservations.find(r => r.id === reservationId);
      if (reservation) {
        reservation.status = 'cancelled';
        setStorage(KEYS.RESERVATIONS, reservations);
        return { success: true };
      }
      return { success: false, error: 'Reservation not found' };
    }
  };

  // ============================================
  // LOYALTY API
  // ============================================

  const LoyaltyAPI = {
    getPoints() {
      const user = AuthAPI.getCurrentUser();
      if (!user) return { success: false, error: 'Not authenticated' };
      return { success: true, points: user.points || 0, tier: user.tier || 'Bronze' };
    },

    addPoints(amount, reason = 'Purchase') {
      const user = AuthAPI.getCurrentUser();
      if (!user) return { success: false, error: 'Not authenticated' };

      user.points = (user.points || 0) + amount;
      setStorage(KEYS.USER, user);

      // Log the transaction
      const log = getStorage(KEYS.POINTS_LOG, []);
      log.unshift({
        id: generateId(),
        type: 'earn',
        amount,
        reason,
        balance: user.points,
        createdAt: new Date().toISOString()
      });
      setStorage(KEYS.POINTS_LOG, log);

      return { success: true, points: user.points, earned: amount };
    },

    redeemReward(rewardId) {
      const user = AuthAPI.getCurrentUser();
      if (!user) return { success: false, error: 'Not authenticated' };

      const reward = (FIXTURE.loyalty?.rewards || []).find(r => r.id === rewardId);
      if (!reward) return { success: false, error: 'Reward not found' };
      if (user.points < reward.points) return { success: false, error: 'Insufficient points' };

      user.points -= reward.points;
      setStorage(KEYS.USER, user);

      // Log the redemption
      const log = getStorage(KEYS.POINTS_LOG, []);
      log.unshift({
        id: generateId(),
        type: 'redeem',
        amount: -reward.points,
        reason: 'Redeemed: ' + reward.name,
        balance: user.points,
        createdAt: new Date().toISOString()
      });
      setStorage(KEYS.POINTS_LOG, log);

      return { success: true, points: user.points, reward };
    },

    getRewards() {
      return { success: true, rewards: FIXTURE.loyalty?.rewards || [] };
    },

    getHistory() {
      const log = getStorage(KEYS.POINTS_LOG, []);
      return { success: true, history: log };
    }
  };

  // ============================================
  // BUSINESS API
  // ============================================

  const BusinessAPI = {
    getInfo() {
      return { success: true, business: FIXTURE.business };
    },

    getTeam() {
      return { success: true, team: FIXTURE.team || [] };
    },

    getTestimonials() {
      return { success: true, testimonials: FIXTURE.testimonials || [] };
    },

    getHours() {
      return { success: true, hours: FIXTURE.business?.hours || {} };
    }
  };

  // ============================================
  // EXPOSE GLOBAL API
  // ============================================

  window.MockAPI = {
    Auth: AuthAPI,
    Menu: MenuAPI,
    Cart: CartAPI,
    Orders: OrdersAPI,
    Reservations: ReservationsAPI,
    Loyalty: LoyaltyAPI,
    Business: BusinessAPI,

    // Direct access to fixture
    getFixture: () => FIXTURE,

    // Reset all demo data
    resetAll() {
      Object.values(KEYS).forEach(key => localStorage.removeItem(key));
      window.dispatchEvent(new CustomEvent('mockapi-reset'));
      return { success: true };
    }
  };

  // Listen for updates from other iframes/windows
  window.addEventListener('storage', (e) => {
    if (Object.values(KEYS).includes(e.key)) {
      window.dispatchEvent(new CustomEvent('mockapi-external-update', {
        detail: { key: e.key, value: e.newValue ? JSON.parse(e.newValue) : null }
      }));
    }
  });

  console.log('🔌 MockAPI initialized for ' + FIXTURE.business.name);
  console.log('   Available: MockAPI.Auth, MockAPI.Menu, MockAPI.Cart, MockAPI.Orders, MockAPI.Reservations, MockAPI.Loyalty, MockAPI.Business');

})();
</script>
`;
}

/**
 * Generate inline CSS for sandbox mode
 */
function generateSandboxStyles() {
  return `
<style>
  /* Sandbox indicator */
  .sandbox-banner {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(90deg, #f59e0b, #d97706);
    color: #000;
    text-align: center;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .sandbox-banner button {
    padding: 4px 10px;
    background: rgba(0,0,0,0.2);
    border: none;
    border-radius: 4px;
    color: #000;
    font-size: 11px;
    cursor: pointer;
    margin-left: 12px;
  }

  .sandbox-banner button:hover {
    background: rgba(0,0,0,0.3);
  }

  body.sandbox-mode {
    padding-top: 32px;
  }

  /* Toast notifications */
  .mock-toast {
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: #1a1a2e;
    color: #fff;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 10000;
    animation: toastIn 0.3s ease, toastOut 0.3s ease 2.7s;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }

  @keyframes toastIn {
    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  @keyframes toastOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
</style>
`;
}

/**
 * Generate sandbox banner HTML
 */
function generateSandboxBanner(businessName) {
  return `
<div class="sandbox-banner">
  <span>🧪</span>
  <span>SANDBOX MODE - ${businessName} Demo (No real orders are placed)</span>
  <button onclick="MockAPI.resetAll(); location.reload();">Reset Demo</button>
</div>
`;
}

/**
 * Generate toast notification helper
 */
function generateToastHelper() {
  return `
<script>
  window.showToast = function(message) {
    const toast = document.createElement('div');
    toast.className = 'mock-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };
</script>
`;
}

module.exports = {
  generateMockApiScript,
  generateSandboxStyles,
  generateSandboxBanner,
  generateToastHelper,
  STORAGE_KEYS
};
