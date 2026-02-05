/**
 * Agent Executor Service
 *
 * Parses AI agent output for [ACTION] blocks and executes them.
 * Connects agents to actual database/API operations.
 *
 * Supported Actions:
 *   Menu Manager:
 *     - add_item: Create new menu item
 *     - update_price: Change item price
 *     - toggle_availability: Enable/disable item
 *     - add_category: Create new category
 *     - remove_item: Delete menu item
 *
 *   Reservations:
 *     - confirm_reservation: Confirm and notify
 *     - cancel_reservation: Cancel and notify
 *     - send_reminder: Send reminder notification
 *
 *   Website Editor:
 *     - update_content: Edit website content
 *     - publish_content: Publish draft changes
 */

// Parse [ACTION] blocks from agent response
function parseActions(text) {
  const actionRegex = /\[ACTION\s+type="([^"]+)"\]([\s\S]*?)\[\/ACTION\]/g;
  const actions = [];
  let match;

  while ((match = actionRegex.exec(text)) !== null) {
    const type = match[1];
    const body = match[2].trim();

    // Parse key-value pairs from body
    const params = {};
    const lines = body.split('\n');
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        // Try to parse as JSON, number, or boolean
        try {
          params[key] = JSON.parse(value);
        } catch {
          if (value === 'true') params[key] = true;
          else if (value === 'false') params[key] = false;
          else if (!isNaN(parseFloat(value)) && isFinite(value)) params[key] = parseFloat(value);
          else params[key] = value;
        }
      }
    }

    actions.push({ type, params });
  }

  return actions;
}

// Create executor with access to app resources
function createExecutor(app) {
  const menuRoutes = app.locals.menuRoutes;
  const reservationRoutes = app.locals.reservationRoutes;
  const notificationService = app.locals.notificationService;

  // Get SSE broadcaster
  function broadcast(channel, type, data) {
    const clients = app.locals.sseClients?.[channel];
    if (clients) {
      clients.forEach(client => {
        client.write(`data: ${JSON.stringify({ type, data, timestamp: new Date().toISOString() })}\n\n`);
      });
    }
  }

  // Action handlers
  const handlers = {
    // ============================================
    // MENU ACTIONS
    // ============================================

    async add_item(params) {
      const store = menuRoutes?.getStore();
      if (!store) return { success: false, error: 'Menu store not available' };

      const { category, name, price, description, dietary_flags } = params;

      // Find or create category
      let categoryObj = store.categories.find(c =>
        c.name.toLowerCase() === (category || '').toLowerCase() && c.active
      );

      if (!categoryObj && category) {
        categoryObj = {
          id: store.nextCategoryId++,
          name: category,
          description: '',
          display_order: store.categories.length,
          active: true,
          created_at: new Date().toISOString()
        };
        store.categories.push(categoryObj);
        broadcast('menu', 'category_created', categoryObj);
      }

      const newItem = {
        id: store.nextItemId++,
        category_id: categoryObj?.id || null,
        name,
        description: description || '',
        price: parseFloat(price),
        dietary_flags: dietary_flags || {},
        available: true,
        popular: false,
        display_order: store.items.filter(i => i.category_id === categoryObj?.id).length,
        created_at: new Date().toISOString()
      };

      store.items.push(newItem);
      broadcast('menu', 'item_created', newItem);

      return {
        success: true,
        message: `Added "${name}" to ${categoryObj?.name || 'menu'} at $${price}`,
        item: newItem
      };
    },

    async update_price(params) {
      const store = menuRoutes?.getStore();
      if (!store) return { success: false, error: 'Menu store not available' };

      const { item_id, item_name, new_price } = params;

      let item;
      if (item_id) {
        item = store.items.find(i => i.id === item_id);
      } else if (item_name) {
        item = store.items.find(i =>
          i.name.toLowerCase().includes(item_name.toLowerCase())
        );
      }

      if (!item) return { success: false, error: 'Item not found' };

      const oldPrice = item.price;
      item.price = parseFloat(new_price);
      item.updated_at = new Date().toISOString();

      broadcast('menu', 'item_updated', item);

      return {
        success: true,
        message: `Updated "${item.name}" price from $${oldPrice} to $${item.price}`,
        item
      };
    },

    async toggle_availability(params) {
      const store = menuRoutes?.getStore();
      if (!store) return { success: false, error: 'Menu store not available' };

      const { item_id, item_name, available } = params;

      let item;
      if (item_id) {
        item = store.items.find(i => i.id === item_id);
      } else if (item_name) {
        item = store.items.find(i =>
          i.name.toLowerCase().includes(item_name.toLowerCase())
        );
      }

      if (!item) return { success: false, error: 'Item not found' };

      item.available = available !== undefined ? available : !item.available;
      item.updated_at = new Date().toISOString();

      broadcast('menu', 'item_availability_changed', { id: item.id, available: item.available });

      return {
        success: true,
        message: `"${item.name}" is now ${item.available ? 'available' : 'unavailable'}`,
        item
      };
    },

    async add_category(params) {
      const store = menuRoutes?.getStore();
      if (!store) return { success: false, error: 'Menu store not available' };

      const { name, description } = params;

      const newCategory = {
        id: store.nextCategoryId++,
        name,
        description: description || '',
        display_order: store.categories.length,
        active: true,
        created_at: new Date().toISOString()
      };

      store.categories.push(newCategory);
      broadcast('menu', 'category_created', newCategory);

      return {
        success: true,
        message: `Created category "${name}"`,
        category: newCategory
      };
    },

    async remove_item(params) {
      const store = menuRoutes?.getStore();
      if (!store) return { success: false, error: 'Menu store not available' };

      const { item_id, item_name } = params;

      let itemIndex;
      if (item_id) {
        itemIndex = store.items.findIndex(i => i.id === item_id);
      } else if (item_name) {
        itemIndex = store.items.findIndex(i =>
          i.name.toLowerCase().includes(item_name.toLowerCase())
        );
      }

      if (itemIndex === -1) return { success: false, error: 'Item not found' };

      const removed = store.items.splice(itemIndex, 1)[0];
      broadcast('menu', 'item_deleted', { id: removed.id });

      return {
        success: true,
        message: `Removed "${removed.name}" from menu`,
        item: removed
      };
    },

    // ============================================
    // RESERVATION ACTIONS
    // ============================================

    async confirm_reservation(params) {
      const store = reservationRoutes?.getStore();
      if (!store) return { success: false, error: 'Reservations store not available' };

      const { booking_id, reservation_id, send_notification } = params;
      const refCode = booking_id || reservation_id;

      let reservation;
      if (typeof refCode === 'string' && refCode.startsWith('RES-')) {
        reservation = store.reservations.find(r => r.reference_code === refCode);
      } else {
        reservation = store.reservations.find(r => r.id === parseInt(refCode));
      }

      if (!reservation) return { success: false, error: 'Reservation not found' };

      reservation.status = 'confirmed';
      reservation.confirmed_at = new Date().toISOString();
      reservation.updated_at = new Date().toISOString();

      // Send notification
      if (notificationService && send_notification !== false) {
        await notificationService.sendReservationConfirmation(reservation);
      }

      broadcast('reservations', 'reservation_confirmed', reservation);

      return {
        success: true,
        message: `Confirmed reservation for ${reservation.customer_name} on ${reservation.date} at ${reservation.time}`,
        reservation
      };
    },

    async cancel_reservation(params) {
      const store = reservationRoutes?.getStore();
      if (!store) return { success: false, error: 'Reservations store not available' };

      const { booking_id, reservation_id, reason, notify } = params;
      const refCode = booking_id || reservation_id;

      let reservation;
      if (typeof refCode === 'string' && refCode.startsWith('RES-')) {
        reservation = store.reservations.find(r => r.reference_code === refCode);
      } else {
        reservation = store.reservations.find(r => r.id === parseInt(refCode));
      }

      if (!reservation) return { success: false, error: 'Reservation not found' };

      reservation.status = 'cancelled';
      reservation.cancelled_at = new Date().toISOString();
      reservation.updated_at = new Date().toISOString();

      if (reason) {
        reservation.internal_notes = (reservation.internal_notes ? reservation.internal_notes + '\n' : '') +
          `Cancelled: ${reason}`;
      }

      // Send notification
      if (notificationService && notify !== false) {
        await notificationService.sendReservationCancellation(reservation, reason);
      }

      broadcast('reservations', 'reservation_cancelled', reservation);

      return {
        success: true,
        message: `Cancelled reservation for ${reservation.customer_name}`,
        reservation
      };
    },

    async send_reminder(params) {
      const store = reservationRoutes?.getStore();
      if (!store) return { success: false, error: 'Reservations store not available' };

      const { booking_id, reservation_id } = params;
      const refCode = booking_id || reservation_id;

      let reservation;
      if (typeof refCode === 'string' && refCode.startsWith('RES-')) {
        reservation = store.reservations.find(r => r.reference_code === refCode);
      } else {
        reservation = store.reservations.find(r => r.id === parseInt(refCode));
      }

      if (!reservation) return { success: false, error: 'Reservation not found' };

      if (notificationService) {
        await notificationService.sendReservationReminder(reservation);
      }

      return {
        success: true,
        message: `Sent reminder to ${reservation.customer_name} for ${reservation.date} at ${reservation.time}`,
        reservation
      };
    },

    // ============================================
    // WEBSITE CONTENT ACTIONS
    // ============================================

    async update_content(params) {
      const { section, field, content, draft } = params;

      // Store in app.locals for now (replace with database)
      if (!app.locals.websiteContent) {
        app.locals.websiteContent = {};
      }

      const key = `${section}.${field}`;
      app.locals.websiteContent[key] = {
        content,
        isDraft: draft === true,
        updatedAt: new Date().toISOString()
      };

      broadcast('content', 'content_updated', { section, field, isDraft: draft === true });

      return {
        success: true,
        message: `Updated ${section}.${field}${draft ? ' (draft)' : ''}`,
        content: app.locals.websiteContent[key]
      };
    },

    async publish_content(params) {
      const { section, field } = params;

      if (!app.locals.websiteContent) {
        return { success: false, error: 'No content to publish' };
      }

      const key = `${section}.${field}`;
      const content = app.locals.websiteContent[key];

      if (!content) {
        return { success: false, error: 'Content not found' };
      }

      content.isDraft = false;
      content.publishedAt = new Date().toISOString();

      broadcast('content', 'content_published', { section, field });

      return {
        success: true,
        message: `Published ${section}.${field}`,
        content
      };
    }
  };

  return {
    /**
     * Execute actions from agent response
     * @param {string} agentResponse - Full agent response text
     * @returns {object} - Results of executed actions
     */
    async execute(agentResponse) {
      const actions = parseActions(agentResponse);

      if (actions.length === 0) {
        return { executed: 0, results: [] };
      }

      const results = [];
      for (const action of actions) {
        const handler = handlers[action.type];
        if (handler) {
          try {
            const result = await handler(action.params);
            results.push({ type: action.type, ...result });
          } catch (error) {
            results.push({
              type: action.type,
              success: false,
              error: error.message
            });
          }
        } else {
          results.push({
            type: action.type,
            success: false,
            error: `Unknown action type: ${action.type}`
          });
        }
      }

      return {
        executed: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      };
    },

    /**
     * Parse actions without executing
     */
    parseActions,

    /**
     * Check if response contains executable actions
     */
    hasActions(text) {
      return /\[ACTION\s+type="[^"]+"\]/.test(text);
    }
  };
}

module.exports = { createExecutor, parseActions };
