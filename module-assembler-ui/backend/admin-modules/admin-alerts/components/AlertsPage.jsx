/**
 * Alerts Page
 * System alerts and notifications management
 */
import React, { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, Info, XCircle, Filter, Trash2 } from 'lucide-react';

export default function AlertsPage() {
  const [alerts] = useState([
    { id: 1, type: 'warning', title: 'Low stock alert', message: 'Product ABC is running low on stock (5 units remaining)', time: '5 min ago', read: false },
    { id: 2, type: 'error', title: 'Payment failed', message: 'Order #1234 payment processing failed', time: '1 hour ago', read: false },
    { id: 3, type: 'success', title: 'Order completed', message: 'Order #1233 has been successfully delivered', time: '2 hours ago', read: true },
    { id: 4, type: 'info', title: 'New feature available', message: 'Check out our new analytics dashboard', time: '1 day ago', read: true },
  ]);

  const typeConfig = {
    warning: { icon: AlertTriangle, bg: '#fef3c7', color: '#d97706' },
    error: { icon: XCircle, bg: '#fee2e2', color: '#dc2626' },
    success: { icon: CheckCircle, bg: '#dcfce7', color: '#16a34a' },
    info: { icon: Info, bg: '#dbeafe', color: '#2563eb' },
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', margin: 0 }}>Alerts</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0' }}>System notifications and alerts</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px', background: 'white', border: '1px solid #e2e8f0',
            borderRadius: '8px', cursor: 'pointer', color: '#475569'
          }}>
            <Filter size={16} /> Filter
          </button>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px', background: '#f1f5f9', border: 'none',
            borderRadius: '8px', cursor: 'pointer', color: '#475569'
          }}>
            Mark all read
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {alerts.map((alert) => {
          const config = typeConfig[alert.type];
          const Icon = config.icon;
          return (
            <div
              key={alert.id}
              style={{
                background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0',
                padding: '16px 20px', display: 'flex', alignItems: 'start', gap: '16px',
                opacity: alert.read ? 0.7 : 1
              }}
            >
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: config.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <Icon size={20} style={{ color: config.color }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1a1a2e', marginBottom: '4px' }}>{alert.title}</div>
                    <div style={{ color: '#64748b', fontSize: '14px' }}>{alert.message}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>{alert.time}</span>
                    {!alert.read && (
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }} />
                    )}
                  </div>
                </div>
              </div>
              <button style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
