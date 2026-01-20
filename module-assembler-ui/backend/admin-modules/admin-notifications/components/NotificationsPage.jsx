import React, { useState } from 'react';
import { Bell, Check, Trash2, Mail, ShoppingCart, Users, AlertCircle } from 'lucide-react';

const mockNotifications = [
  { id: 1, type: 'order', title: 'New Order Received', message: 'Order #1234 from John Smith - $45.00', time: '5 min ago', read: false },
  { id: 2, type: 'customer', title: 'New Customer', message: 'Sarah Johnson just registered', time: '15 min ago', read: false },
  { id: 3, type: 'alert', title: 'Low Inventory Alert', message: 'Margherita Pizza is running low (5 remaining)', time: '1 hour ago', read: false },
  { id: 4, type: 'order', title: 'Order Completed', message: 'Order #1233 has been delivered', time: '2 hours ago', read: true },
  { id: 5, type: 'message', title: 'New Contact Message', message: 'Question about catering services', time: '3 hours ago', read: true },
];

const getIcon = (type) => {
  switch(type) {
    case 'order': return ShoppingCart;
    case 'customer': return Users;
    case 'alert': return AlertCircle;
    case 'message': return Mail;
    default: return Bell;
  }
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAsRead = (id) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button className="btn-secondary" onClick={markAllAsRead}>
            <Check size={18} />
            Mark All Read
          </button>
        )}
      </div>

      <div className="card">
        <div className="notifications-list">
          {notifications.length === 0 ? (
            <div className="empty-state">
              <Bell size={48} />
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map(notification => {
              const Icon = getIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                >
                  <div className={`notification-icon ${notification.type}`}>
                    <Icon size={20} />
                  </div>
                  <div className="notification-content">
                    <h3 className="notification-title">{notification.title}</h3>
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">{notification.time}</span>
                  </div>
                  <div className="notification-actions">
                    {!notification.read && (
                      <button
                        className="btn-icon"
                        onClick={() => markAsRead(notification.id)}
                        title="Mark as read"
                      >
                        <Check size={18} />
                      </button>
                    )}
                    <button
                      className="btn-icon danger"
                      onClick={() => deleteNotification(notification.id)}
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
