/**
 * Notification Center Component
 *
 * Central hub for managing notifications with:
 * - Recent notifications list
 * - Delivery status tracking
 * - Quick send with templates
 * - Channel selection (email/SMS)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell, Mail, Phone, Send, CheckCircle, XCircle, Clock, AlertCircle,
  ChevronDown, RefreshCw, X, User, Calendar, FileText, Filter
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/admin';

// Status icons and colors
const STATUS_CONFIG = {
  sent: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', label: 'Sent' },
  pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50', label: 'Pending' },
  failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Failed' },
  partial: { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50', label: 'Partial' }
};

// Notification templates
const TEMPLATES = [
  {
    id: 'reservation_confirmation',
    name: 'Reservation Confirmation',
    icon: Calendar,
    description: 'Confirm a reservation booking',
    channels: ['email', 'sms']
  },
  {
    id: 'reservation_reminder',
    name: 'Reservation Reminder',
    icon: Bell,
    description: 'Remind customer of upcoming reservation',
    channels: ['email', 'sms']
  },
  {
    id: 'reservation_cancellation',
    name: 'Reservation Cancellation',
    icon: XCircle,
    description: 'Notify customer of cancellation',
    channels: ['email', 'sms']
  },
  {
    id: 'custom',
    name: 'Custom Message',
    icon: FileText,
    description: 'Send a custom notification',
    channels: ['email', 'sms']
  }
];

// Notification Item Component
function NotificationItem({ notification }) {
  const status = STATUS_CONFIG[notification.status] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`${status.bg} border rounded-lg p-4 mb-3`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${status.bg}`}>
            <StatusIcon className={status.color} size={18} />
          </div>
          <div>
            <p className="font-medium text-gray-900">{notification.template?.replace(/_/g, ' ') || 'Notification'}</p>
            <p className="text-sm text-gray-600">
              To: {notification.recipient_email || notification.recipient_phone || 'Unknown'}
            </p>
            {notification.error_message && (
              <p className="text-sm text-red-600 mt-1">{notification.error_message}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className={`text-xs px-2 py-1 rounded-full ${status.bg} ${status.color} font-medium`}>
            {status.label}
          </span>
          <p className="text-xs text-gray-500 mt-1">{formatTime(notification.sent_at || notification.created_at)}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
        <span className="text-xs text-gray-500">Channels:</span>
        {notification.channels?.map(channel => (
          <span key={channel} className="flex items-center gap-1 text-xs text-gray-600">
            {channel === 'email' ? <Mail size={12} /> : <Phone size={12} />}
            {channel}
          </span>
        ))}
        {notification.related_type && (
          <span className="ml-auto text-xs text-gray-500">
            {notification.related_type} #{notification.related_id}
          </span>
        )}
      </div>
    </div>
  );
}

// Quick Send Modal
function QuickSendModal({ template, onClose, onSend }) {
  const [recipient, setRecipient] = useState({ email: '', phone: '' });
  const [channels, setChannels] = useState(['email']);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!recipient.email && !recipient.phone) {
      alert('Please enter an email or phone number');
      return;
    }

    setSending(true);
    try {
      await onSend({
        template: template.id,
        recipient,
        channels,
        subject,
        body
      });
      onClose();
    } catch (err) {
      alert('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const Icon = template.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center gap-3 px-6 py-4 border-b">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Icon className="text-blue-600" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{template.name}</h3>
            <p className="text-sm text-gray-500">{template.description}</p>
          </div>
          <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Recipient */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recipient</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-gray-400" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={recipient.email}
                  onChange={(e) => setRecipient({ ...recipient, email: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gray-400" />
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={recipient.phone}
                  onChange={(e) => setRecipient({ ...recipient, phone: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Channels */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Send via</label>
            <div className="flex gap-3">
              {template.channels.map(channel => (
                <label key={channel} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={channels.includes(channel)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setChannels([...channels, channel]);
                      } else {
                        setChannels(channels.filter(c => c !== channel));
                      }
                    }}
                    className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                  />
                  <span className="flex items-center gap-1 text-sm">
                    {channel === 'email' ? <Mail size={14} /> : <Phone size={14} />}
                    {channel.charAt(0).toUpperCase() + channel.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom message fields */}
          {template.id === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Your message..."
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </>
          )}
        </div>

        <div className="border-t px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || channels.length === 0}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Notification Center Component
export function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({ sent: 0, failed: 0, pending: 0 });

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      // In production, this would be a real API call
      // For now, we'll simulate with local data
      const mockNotifications = [
        {
          id: 1,
          template: 'reservation_confirmation',
          recipient_email: 'john@example.com',
          channels: ['email'],
          status: 'sent',
          related_type: 'reservation',
          related_id: 1,
          sent_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 2,
          template: 'reservation_reminder',
          recipient_email: 'sarah@example.com',
          recipient_phone: '(555) 123-4567',
          channels: ['email', 'sms'],
          status: 'sent',
          related_type: 'reservation',
          related_id: 2,
          sent_at: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: 3,
          template: 'reservation_cancellation',
          recipient_email: 'mike@example.com',
          channels: ['email'],
          status: 'failed',
          error_message: 'Email delivery failed',
          related_type: 'reservation',
          related_id: 3,
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ];

      let filtered = mockNotifications;
      if (statusFilter !== 'all') {
        filtered = filtered.filter(n => n.status === statusFilter);
      }

      setNotifications(filtered);
      setStats({
        sent: mockNotifications.filter(n => n.status === 'sent').length,
        failed: mockNotifications.filter(n => n.status === 'failed').length,
        pending: mockNotifications.filter(n => n.status === 'pending').length
      });
      setError(null);
    } catch (err) {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Handle send notification
  const handleSend = async (data) => {
    // In production, this would call the API
    console.log('Sending notification:', data);

    // Add to local list (simulation)
    const newNotification = {
      id: Date.now(),
      template: data.template,
      recipient_email: data.recipient.email,
      recipient_phone: data.recipient.phone,
      channels: data.channels,
      status: 'sent',
      sent_at: new Date().toISOString()
    };

    setNotifications([newNotification, ...notifications]);
    setStats({ ...stats, sent: stats.sent + 1 });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notification Center</h1>
          <p className="text-sm text-gray-500">
            Manage and send notifications to customers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="sent">Sent</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <button
            onClick={fetchNotifications}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="text-green-500" size={18} />
            <span className="text-green-800 text-sm font-medium">Sent</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{stats.sent}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="text-yellow-500" size={18} />
            <span className="text-yellow-800 text-sm font-medium">Pending</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="text-red-500" size={18} />
            <span className="text-red-800 text-sm font-medium">Failed</span>
          </div>
          <p className="text-2xl font-bold text-red-900">{stats.failed}</p>
        </div>
      </div>

      {/* Quick Send Templates */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Send</h2>
        <div className="grid grid-cols-2 gap-4">
          {TEMPLATES.map(template => {
            const Icon = template.icon;
            return (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className="flex items-start gap-3 p-4 bg-white border rounded-lg hover:border-blue-300 hover:shadow-md transition-all text-left"
              >
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Icon className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{template.name}</p>
                  <p className="text-sm text-gray-500">{template.description}</p>
                  <div className="flex gap-2 mt-2">
                    {template.channels.map(channel => (
                      <span key={channel} className="flex items-center gap-1 text-xs text-gray-400">
                        {channel === 'email' ? <Mail size={10} /> : <Phone size={10} />}
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Notifications */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Notifications</h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw size={32} className="animate-spin text-blue-500" />
          </div>
        ) : notifications.length > 0 ? (
          <div>
            {notifications.map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Bell size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No notifications yet</p>
            <p className="text-sm">Send your first notification using the templates above</p>
          </div>
        )}
      </div>

      {/* Quick Send Modal */}
      {selectedTemplate && (
        <QuickSendModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onSend={handleSend}
        />
      )}
    </div>
  );
}

export default NotificationCenter;
