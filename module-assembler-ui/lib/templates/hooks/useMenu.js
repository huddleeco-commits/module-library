/**
 * useMenu Hook
 *
 * Hook for fetching and subscribing to menu updates from the admin API.
 * Includes SSE subscription for real-time sync.
 *
 * Usage:
 *   const { categories, items, loading, error, refetch } = useMenu();
 *
 * Features:
 *   - Fetches menu data on mount
 *   - Subscribes to SSE for real-time updates
 *   - Falls back to embedded data if API unavailable
 *   - Automatic reconnection on SSE disconnect
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Default API URL (can be overridden by environment variable)
const API_BASE = typeof import.meta !== 'undefined'
  ? (import.meta.env?.VITE_API_URL || '/api')
  : '/api';

/**
 * Menu sync hook
 * @param {object} fallbackData - Embedded menu data to use if API unavailable
 * @param {object} options - Hook options
 * @returns {object} - Menu data and state
 */
export function useMenu(fallbackData = null, options = {}) {
  const {
    enableSSE = true,
    retryDelay = 5000,
    maxRetries = 3
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);

  const eventSourceRef = useRef(null);
  const retryCountRef = useRef(0);

  // Fetch menu data from API
  const fetchMenu = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/menu`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setData(result);
        retryCountRef.current = 0; // Reset retry count on success
      } else {
        throw new Error(result.error || 'Failed to fetch menu');
      }
    } catch (err) {
      console.warn('[useMenu] API fetch failed:', err.message);
      setError(err.message);

      // Use fallback data if available
      if (fallbackData && !data) {
        console.log('[useMenu] Using fallback data');
        setData({
          categories: fallbackData.categories || [],
          success: true,
          fallback: true
        });
      }
    } finally {
      setLoading(false);
    }
  }, [fallbackData, data]);

  // Setup SSE connection
  const setupSSE = useCallback(() => {
    if (!enableSSE) return;

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const eventSource = new EventSource(`${API_BASE}/events/menu`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('[useMenu] SSE connected');
        setConnected(true);
        retryCountRef.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          // Handle different message types
          switch (message.type) {
            case 'connected':
              console.log('[useMenu] SSE handshake complete');
              break;

            case 'initial_state':
              // Server sent current state on connect
              if (message.data) {
                setData(prev => ({
                  ...prev,
                  categories: message.data.categories || [],
                  items: message.data.items || [],
                  success: true
                }));
              }
              break;

            case 'item_created':
            case 'item_updated':
            case 'item_deleted':
            case 'item_availability_changed':
            case 'category_created':
            case 'category_updated':
            case 'category_deleted':
            case 'menu_reordered':
              // Refetch on any menu change
              console.log('[useMenu] Menu updated:', message.type);
              fetchMenu();
              break;

            default:
              // Unknown message type, refetch to be safe
              if (message.type && !message.type.startsWith(':')) {
                fetchMenu();
              }
          }
        } catch (parseErr) {
          console.warn('[useMenu] Failed to parse SSE message:', parseErr);
        }
      };

      eventSource.onerror = (err) => {
        console.warn('[useMenu] SSE error, reconnecting...');
        setConnected(false);
        eventSource.close();

        // Retry with backoff
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          setTimeout(setupSSE, retryDelay * retryCountRef.current);
        }
      };
    } catch (err) {
      console.warn('[useMenu] Failed to setup SSE:', err.message);
    }
  }, [enableSSE, fetchMenu, maxRetries, retryDelay]);

  // Initial fetch and SSE setup
  useEffect(() => {
    fetchMenu();
    setupSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [fetchMenu, setupSSE]);

  // Parse data into useful format
  const categories = data?.categories || fallbackData?.categories || [];

  // Flatten items from categories if needed
  const items = categories.flatMap(cat => cat.items || []);

  // Filter available items only
  const availableItems = items.filter(item => item.available !== false);

  // Get items by category
  const getItemsByCategory = useCallback((categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.items || [];
  }, [categories]);

  // Get popular items
  const popularItems = items.filter(item => item.popular && item.available !== false);

  return {
    // Data
    categories,
    items,
    availableItems,
    popularItems,

    // State
    loading,
    error,
    connected,
    isFallback: data?.fallback || false,

    // Actions
    refetch: fetchMenu,
    getItemsByCategory,

    // Raw response
    raw: data
  };
}

export default useMenu;
