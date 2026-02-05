/**
 * useReservations Hook
 *
 * Hook for creating reservations and checking availability.
 * For public-facing reservation forms on generated websites.
 *
 * Usage:
 *   const { createReservation, checkAvailability, loading, error } = useReservations();
 *
 * Features:
 *   - Create new reservations
 *   - Check available time slots
 *   - Look up existing reservation status
 *   - SSE subscription for real-time availability updates
 */

import { useState, useCallback, useRef, useEffect } from 'react';

// Default API URL
const API_BASE = typeof import.meta !== 'undefined'
  ? (import.meta.env?.VITE_API_URL || '/api')
  : '/api';

/**
 * Reservations hook for public forms
 * @param {object} options - Hook options
 * @returns {object} - Reservation functions and state
 */
export function useReservations(options = {}) {
  const {
    enableSSE = false, // Disabled by default for public sites
    onNewReservation = null // Callback when reservation is created
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [lastReservation, setLastReservation] = useState(null);

  const eventSourceRef = useRef(null);

  /**
   * Create a new reservation
   * @param {object} reservationData - Reservation details
   * @returns {object} - Created reservation with reference code
   */
  const createReservation = useCallback(async (reservationData) => {
    const {
      customerName,
      customerEmail,
      customerPhone,
      date,
      time,
      partySize,
      specialRequests
    } = reservationData;

    // Validate required fields
    if (!customerName || !customerEmail || !date || !time || !partySize) {
      const err = 'Please fill in all required fields';
      setError(err);
      throw new Error(err);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      const err = 'Please enter a valid email address';
      setError(err);
      throw new Error(err);
    }

    // Validate party size
    const size = parseInt(partySize);
    if (size < 1 || size > 20) {
      const err = 'Party size must be between 1 and 20';
      setError(err);
      throw new Error(err);
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone || '',
          date,
          time,
          party_size: size,
          special_requests: specialRequests || ''
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create reservation');
      }

      setLastReservation(result);

      if (onNewReservation) {
        onNewReservation(result);
      }

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onNewReservation]);

  /**
   * Check availability for a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {object} - Available time slots
   */
  const checkAvailability = useCallback(async (date) => {
    if (!date) {
      setError('Date is required');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/reservations/availability?date=${date}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to check availability');
      }

      setAvailability(result);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Look up an existing reservation by reference code
   * @param {string} referenceCode - Reservation reference code (e.g., RES-A7X9)
   * @returns {object} - Reservation details
   */
  const lookupReservation = useCallback(async (referenceCode) => {
    if (!referenceCode) {
      setError('Reference code is required');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/reservations/${referenceCode}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Reservation not found');
      }

      return result.reservation;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get available dates for the next N days
   * @param {number} days - Number of days to check
   * @returns {array} - Array of available dates
   */
  const getAvailableDates = useCallback(async (days = 30) => {
    const availableDates = [];
    const today = new Date();

    // Skip checking each day individually for performance
    // Instead, return all dates and let the UI show availability on select
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      // Skip past dates
      if (date >= today) {
        availableDates.push({
          date: date.toISOString().split('T')[0],
          dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' }),
          display: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        });
      }
    }

    return availableDates;
  }, []);

  // Setup SSE for real-time availability updates (optional)
  useEffect(() => {
    if (!enableSSE) return;

    try {
      const eventSource = new EventSource(`${API_BASE}/events/reservations`);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        const message = JSON.parse(event.data);

        // Refresh availability if viewing a date that was affected
        if (availability?.date && message.data?.date === availability.date) {
          checkAvailability(availability.date);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
      };
    } catch (err) {
      console.warn('[useReservations] SSE not available');
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [enableSSE, availability?.date, checkAvailability]);

  // Clear error after timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    // Actions
    createReservation,
    checkAvailability,
    lookupReservation,
    getAvailableDates,

    // State
    loading,
    error,
    availability,
    lastReservation,

    // Helpers
    clearError: () => setError(null),

    // Available time slots (from last availability check)
    availableSlots: availability?.slots?.filter(s => s.available) || []
  };
}

export default useReservations;
