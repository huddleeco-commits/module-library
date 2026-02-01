/**
 * Orders Management Page
 * View and manage customer orders
 */
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Filter, Eye, CheckCircle, Clock, Truck, Package } from 'lucide-react';

const statusConfig = {
  pending: { bg: '#fef3c7', color: '#d97706', icon: Clock, label: 'Pending' },
  processing: { bg: '#dbeafe', color: '#2563eb', icon: Package, label: 'Processing' },
  shipped: { bg: '#e0e7ff', color: '#4f46e5', icon: Truck, label: 'Shipped' },
  delivered: { bg: '#dcfce7', color: '#16a34a', icon: CheckCircle, label: 'Delivered' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    setOrders([
      { id: 'ORD-001', customer: 'John Doe', email: 'john@example.com', total: 89.99, status: 'pending', date: '2026-01-22', items: 3 },
      { id: 'ORD-002', customer: 'Jane Smith', email: 'jane@example.com', total: 149.99, status: 'processing', date: '2026-01-21', items: 5 },
      { id: 'ORD-003', customer: 'Bob Wilson', email: 'bob@example.com', total: 29.99, status: 'shipped', date: '2026-01-20', items: 1 },
      { id: 'ORD-004', customer: 'Alice Brown', email: 'alice@example.com', total: 199.99, status: 'delivered', date: '2026-01-19', items: 4 },
    ]);
  }, []);

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.customer.toLowerCase().includes(searchTerm.toLowerCase()) || o.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', margin: 0 }}>Orders</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0' }}>Manage and track customer orders</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {Object.entries(statusConfig).map(([key, config]) => {
          const count = orders.filter(o => o.status === key).length;
          const Icon = config.icon;
          return (
            <div key={key} style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: config.bg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} style={{ color: config.color }} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e' }}>{count}</div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>{config.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 40px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: '10px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', cursor: 'pointer' }}
        >
          <option value="all">All Status</option>
          {Object.entries(statusConfig).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Order ID</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Customer</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Items</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Total</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Status</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Date</th>
              <th style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => {
              const status = statusConfig[order.status];
              const StatusIcon = status.icon;
              return (
                <tr key={order.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '14px 16px', fontWeight: '500', color: '#6366f1' }}>{order.id}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: '500', color: '#1a1a2e' }}>{order.customer}</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>{order.email}</div>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#475569' }}>{order.items} items</td>
                  <td style={{ padding: '14px 16px', fontWeight: '500', color: '#1a1a2e' }}>${order.total.toFixed(2)}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: '500',
                      background: status.bg, color: status.color
                    }}>
                      <StatusIcon size={14} /> {status.label}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#475569' }}>{order.date}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button style={{ padding: '6px 12px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#475569', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
