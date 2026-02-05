/**
 * Reservation Calendar Component
 *
 * Calendar view for managing reservations with:
 * - Month/week/day views
 * - Color-coded status (pending=yellow, confirmed=green, cancelled=red)
 * - Quick confirm/cancel actions
 * - Send reminder functionality
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, Calendar, Clock, Users, Phone, Mail,
  Check, X, Bell, MessageSquare, AlertCircle, RefreshCw, Filter
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/admin';

// Status colors
const STATUS_COLORS = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', dot: 'bg-yellow-500' },
  confirmed: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', dot: 'bg-green-500' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', dot: 'bg-red-500' }
};

// Format date
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

// Format time
function formatTime(timeStr) {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

// Reservation Card Component
function ReservationCard({ reservation, onConfirm, onCancel, onReminder, onClick }) {
  const colors = STATUS_COLORS[reservation.status] || STATUS_COLORS.pending;

  return (
    <div
      onClick={() => onClick(reservation)}
      className={`${colors.bg} ${colors.border} border rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${colors.dot}`}></span>
          <span className="font-medium text-gray-900">{reservation.customer_name}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} font-medium`}>
          {reservation.status}
        </span>
      </div>

      <div className="space-y-1 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Clock size={14} />
          <span>{formatTime(reservation.time)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users size={14} />
          <span>{reservation.party_size} guests</span>
        </div>
      </div>

      {reservation.status === 'pending' && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={(e) => { e.stopPropagation(); onConfirm(reservation); }}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
          >
            <Check size={12} />
            Confirm
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onCancel(reservation); }}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
          >
            <X size={12} />
            Cancel
          </button>
        </div>
      )}

      {reservation.status === 'confirmed' && (
        <button
          onClick={(e) => { e.stopPropagation(); onReminder(reservation); }}
          className="w-full flex items-center justify-center gap-1 mt-3 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
        >
          <Bell size={12} />
          Send Reminder
        </button>
      )}
    </div>
  );
}

// Reservation Detail Modal
function ReservationDetail({ reservation, onClose, onConfirm, onCancel, onReminder }) {
  if (!reservation) return null;

  const colors = STATUS_COLORS[reservation.status] || STATUS_COLORS.pending;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className={`${colors.bg} px-6 py-4 rounded-t-xl border-b ${colors.border}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{reservation.customer_name}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}>
              {reservation.status}
            </span>
          </div>
          <p className="text-sm text-gray-600">{reservation.reference_code}</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{formatDate(reservation.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium">{formatTime(reservation.time)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-500">Party Size</p>
                <p className="font-medium">{reservation.party_size} guests</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="text-gray-400" size={18} />
              <span className="text-gray-700">{reservation.customer_email}</span>
            </div>
            {reservation.customer_phone && (
              <div className="flex items-center gap-3">
                <Phone className="text-gray-400" size={18} />
                <span className="text-gray-700">{reservation.customer_phone}</span>
              </div>
            )}
          </div>

          {reservation.special_requests && (
            <div className="border-t pt-4">
              <div className="flex items-start gap-3">
                <MessageSquare className="text-gray-400 mt-0.5" size={18} />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Special Requests</p>
                  <p className="text-gray-700">{reservation.special_requests}</p>
                </div>
              </div>
            </div>
          )}

          {reservation.internal_notes && (
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500 mb-1">Internal Notes</p>
              <p className="text-gray-600 text-sm bg-gray-50 p-2 rounded">{reservation.internal_notes}</p>
            </div>
          )}
        </div>

        <div className="border-t px-6 py-4 flex gap-3">
          {reservation.status === 'pending' && (
            <>
              <button
                onClick={() => { onConfirm(reservation); onClose(); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Check size={18} />
                Confirm
              </button>
              <button
                onClick={() => { onCancel(reservation); onClose(); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <X size={18} />
                Cancel
              </button>
            </>
          )}
          {reservation.status === 'confirmed' && (
            <button
              onClick={() => { onReminder(reservation); onClose(); }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Bell size={18} />
              Send Reminder
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Calendar Component
export function ReservationCalendar() {
  const [view, setView] = useState('week'); // 'day', 'week', 'month'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState(null);

  // Get date range based on view
  const getDateRange = useCallback(() => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    if (view === 'day') {
      // Just today
    } else if (view === 'week') {
      start.setDate(start.getDate() - start.getDay());
      end.setDate(start.getDate() + 6);
    } else {
      start.setDate(1);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
    }

    return {
      from: start.toISOString().split('T')[0],
      to: end.toISOString().split('T')[0]
    };
  }, [currentDate, view]);

  // Fetch reservations
  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      const { from, to } = getDateRange();
      const params = new URLSearchParams({ from, to });
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await fetch(`${API_BASE}/reservations?${params}`);
      const data = await res.json();

      if (data.success) {
        setReservations(data.reservations);
        setError(null);
      } else {
        setError(data.error);
      }

      // Also fetch stats
      const statsRes = await fetch(`${API_BASE}/reservations/stats`);
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (err) {
      setError('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  }, [getDateRange, statusFilter]);

  // Subscribe to SSE updates
  useEffect(() => {
    fetchReservations();

    const eventSource = new EventSource(`${API_BASE.replace('/admin', '')}/events/reservations`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_reservation' || data.type === 'reservation_confirmed' ||
          data.type === 'reservation_cancelled' || data.type === 'reservation_updated') {
        fetchReservations();
      }
    };

    return () => eventSource.close();
  }, [fetchReservations]);

  // Navigation
  const navigate = (direction) => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Actions
  const handleConfirm = async (reservation) => {
    try {
      await fetch(`${API_BASE}/reservations/${reservation.id}/confirm`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ send_notification: true })
      });
    } catch (err) {
      setError('Failed to confirm reservation');
    }
  };

  const handleCancel = async (reservation) => {
    const reason = prompt('Cancellation reason (optional):');
    try {
      await fetch(`${API_BASE}/reservations/${reservation.id}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, notify: true })
      });
    } catch (err) {
      setError('Failed to cancel reservation');
    }
  };

  const handleReminder = async (reservation) => {
    try {
      await fetch(`${API_BASE}/reservations/${reservation.id}/reminder`, {
        method: 'POST'
      });
      alert('Reminder sent!');
    } catch (err) {
      setError('Failed to send reminder');
    }
  };

  // Group reservations by date
  const groupedReservations = reservations.reduce((acc, res) => {
    if (!acc[res.date]) acc[res.date] = [];
    acc[res.date].push(res);
    return acc;
  }, {});

  // Generate days array for week/month view
  const getDays = () => {
    const { from, to } = getDateRange();
    const days = [];
    const current = new Date(from);
    const end = new Date(to);

    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const days = getDays();

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservations</h1>
          {stats && (
            <p className="text-sm text-gray-500">
              {stats.needsAction} pending | {stats.today.confirmed} confirmed today
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* View toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['day', 'week', 'month'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  view === v ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          <button
            onClick={fetchReservations}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            title="Refresh"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <span className="text-red-700">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">Needs Action</p>
            <p className="text-2xl font-bold text-yellow-900">{stats.needsAction}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">Confirmed Today</p>
            <p className="text-2xl font-bold text-green-900">{stats.today.confirmed}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">This Week</p>
            <p className="text-2xl font-bold text-blue-900">{stats.thisWeek.total}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-purple-800 text-sm">Tomorrow</p>
            <p className="text-2xl font-bold text-purple-900">{stats.tomorrow.total}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => navigate(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>

        <h2 className="text-lg font-semibold text-gray-900">
          {view === 'month'
            ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            : view === 'week'
              ? `${formatDate(days[0]?.toISOString())} - ${formatDate(days[days.length - 1]?.toISOString())}`
              : formatDate(currentDate.toISOString())
          }
        </h2>

        <div className="w-32"></div>
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw size={32} className="animate-spin text-emerald-500" />
        </div>
      ) : view === 'month' ? (
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
          {days.map((day, idx) => {
            const dateStr = day.toISOString().split('T')[0];
            const dayReservations = groupedReservations[dateStr] || [];
            const isToday = dateStr === new Date().toISOString().split('T')[0];

            return (
              <div
                key={idx}
                className={`min-h-[100px] border rounded-lg p-2 ${
                  isToday ? 'bg-emerald-50 border-emerald-300' : 'bg-white'
                }`}
              >
                <p className={`text-sm font-medium mb-2 ${isToday ? 'text-emerald-700' : 'text-gray-700'}`}>
                  {day.getDate()}
                </p>
                <div className="space-y-1">
                  {dayReservations.slice(0, 3).map(res => (
                    <div
                      key={res.id}
                      onClick={() => setSelectedReservation(res)}
                      className={`text-xs p-1 rounded cursor-pointer truncate ${
                        STATUS_COLORS[res.status].bg
                      } ${STATUS_COLORS[res.status].text}`}
                    >
                      {formatTime(res.time)} - {res.customer_name}
                    </div>
                  ))}
                  {dayReservations.length > 3 && (
                    <p className="text-xs text-gray-500">+{dayReservations.length - 3} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={`grid ${view === 'week' ? 'grid-cols-7' : 'grid-cols-1'} gap-4`}>
          {days.map((day, idx) => {
            const dateStr = day.toISOString().split('T')[0];
            const dayReservations = (groupedReservations[dateStr] || [])
              .sort((a, b) => a.time.localeCompare(b.time));
            const isToday = dateStr === new Date().toISOString().split('T')[0];

            return (
              <div
                key={idx}
                className={`border rounded-xl p-4 ${isToday ? 'bg-emerald-50 border-emerald-300' : 'bg-white'}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className={`text-sm ${isToday ? 'text-emerald-700' : 'text-gray-500'}`}>
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className={`text-2xl font-bold ${isToday ? 'text-emerald-800' : 'text-gray-900'}`}>
                      {day.getDate()}
                    </p>
                  </div>
                  {dayReservations.length > 0 && (
                    <span className="text-sm text-gray-500">{dayReservations.length} reservations</span>
                  )}
                </div>

                <div className="space-y-3">
                  {dayReservations.map(res => (
                    <ReservationCard
                      key={res.id}
                      reservation={res}
                      onConfirm={handleConfirm}
                      onCancel={handleCancel}
                      onReminder={handleReminder}
                      onClick={setSelectedReservation}
                    />
                  ))}
                  {dayReservations.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-4">No reservations</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedReservation && (
        <ReservationDetail
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          onReminder={handleReminder}
        />
      )}
    </div>
  );
}

export default ReservationCalendar;
