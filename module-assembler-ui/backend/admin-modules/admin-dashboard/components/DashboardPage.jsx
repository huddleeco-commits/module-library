/**
 * Admin Dashboard Page
 * Business dashboard with key metrics, activity feed, and quick actions
 * Works with mock data when backend APIs aren't available
 */

import React, { useState, useEffect } from 'react';
import {
  Users, ShoppingCart, DollarSign, TrendingUp, Calendar, Package,
  Activity, Clock, AlertTriangle, BarChart2, RefreshCw
} from 'lucide-react';
import {
  StatCard, StatusBadge, LoadingSpinner, Card, BarChart
} from '../../_shared/components/index.jsx';
import { formatCurrency, formatNumber, formatRelativeTime } from '../../_shared/index.js';

// Mock data for when backend isn't available
const mockDashboardData = {
  stats: {
    totalCustomers: 156,
    customersToday: 8,
    totalOrders: 423,
    ordersToday: 12,
    revenue: 8450.00,
    revenueToday: 340.00,
    avgOrderValue: 42.50,
    conversionRate: 3.2
  },
  recentOrders: [
    { id: 1, customer: 'John Smith', items: 3, total: 45.00, status: 'completed', time: new Date(Date.now() - 15 * 60000) },
    { id: 2, customer: 'Sarah Johnson', items: 2, total: 28.50, status: 'pending', time: new Date(Date.now() - 45 * 60000) },
    { id: 3, customer: 'Mike Brown', items: 4, total: 62.00, status: 'completed', time: new Date(Date.now() - 90 * 60000) },
    { id: 4, customer: 'Emily Davis', items: 1, total: 18.00, status: 'completed', time: new Date(Date.now() - 180 * 60000) },
    { id: 5, customer: 'Chris Wilson', items: 5, total: 78.50, status: 'completed', time: new Date(Date.now() - 240 * 60000) }
  ],
  weeklyTrend: [
    { day: 'Mon', orders: 45, revenue: 1890 },
    { day: 'Tue', orders: 52, revenue: 2184 },
    { day: 'Wed', orders: 48, revenue: 2016 },
    { day: 'Thu', orders: 61, revenue: 2562 },
    { day: 'Fri', orders: 73, revenue: 3066 },
    { day: 'Sat', orders: 89, revenue: 3738 },
    { day: 'Sun', orders: 55, revenue: 2310 }
  ],
  topItems: [
    { name: 'Signature Special', orders: 89, revenue: 1780 },
    { name: 'Classic Favorite', orders: 67, revenue: 1005 },
    { name: 'House Special', orders: 54, revenue: 972 },
    { name: 'Premium Selection', orders: 45, revenue: 990 }
  ],
  alerts: [
    { id: 1, type: 'warning', message: 'Low stock on Premium Selection', time: '2h ago' },
    { id: 2, type: 'info', message: 'New review received (5 stars)', time: '3h ago' }
  ]
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from API first
      const token = localStorage.getItem('admin_token') || localStorage.getItem('blink_admin_token');
      const res = await fetch('/api/admin/overview', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success && result.overview) {
          // Transform API data to match component expectations
          setData({
            stats: {
              totalCustomers: result.overview.users?.total || 0,
              customersToday: result.overview.users?.signupsToday || 0,
              totalOrders: result.overview.generations?.total || 0,
              ordersToday: result.overview.generations?.today || 0,
              revenue: result.overview.revenue?.mrr || 0,
              revenueToday: 0,
              avgOrderValue: result.overview.costs?.perGeneration || 0,
              conversionRate: result.overview.users?.conversionRate || 0
            },
            recentOrders: (result.overview.recentGenerations || []).map(g => ({
              id: g.id,
              customer: g.user_email || 'Guest',
              items: 1,
              total: g.generation_time_ms / 1000 || 0,
              status: g.status || 'completed',
              time: new Date(g.created_at)
            })),
            weeklyTrend: result.overview.trends || mockDashboardData.weeklyTrend,
            topItems: mockDashboardData.topItems,
            alerts: result.overview.alerts?.active > 0
              ? [{ id: 1, type: 'warning', message: `${result.overview.alerts.active} active alerts`, time: 'now' }]
              : []
          });
          setUseMockData(false);
          return;
        }
      }

      // Fall back to mock data
      setData(mockDashboardData);
      setUseMockData(true);
    } catch (err) {
      console.log('Using mock dashboard data:', err.message);
      setData(mockDashboardData);
      setUseMockData(true);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;
  if (error) return <div className="admin-error">Error: {error}</div>;
  if (!data) return null;

  const { stats, recentOrders, weeklyTrend, topItems, alerts } = data;

  return (
    <div className="admin-page dashboard-page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          {useMockData && (
            <p className="page-subtitle" style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Showing sample data • Connect your backend for live metrics
            </p>
          )}
        </div>
        <button onClick={loadData} className="admin-btn secondary">
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Key Metrics Row */}
      <div className="stats-grid">
        <StatCard
          title="Total Customers"
          value={formatNumber(stats.totalCustomers)}
          subtitle={`+${stats.customersToday} today`}
          icon={<Users size={24} />}
          color="#6366f1"
        />
        <StatCard
          title="Total Orders"
          value={formatNumber(stats.totalOrders)}
          subtitle={`${stats.ordersToday} today`}
          icon={<ShoppingCart size={24} />}
          color="#10b981"
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(stats.revenue)}
          subtitle={`+${formatCurrency(stats.revenueToday)} today`}
          icon={<DollarSign size={24} />}
          color="#f59e0b"
        />
        <StatCard
          title="Avg Order Value"
          value={formatCurrency(stats.avgOrderValue)}
          subtitle={`${stats.conversionRate}% conversion`}
          icon={<TrendingUp size={24} />}
          color="#8b5cf6"
        />
      </div>

      {/* Alerts Section */}
      {alerts && alerts.length > 0 && (
        <Card title="Alerts">
          <div className="alerts-list">
            {alerts.map(alert => (
              <div key={alert.id} className={`alert-item ${alert.type}`}>
                <AlertTriangle size={18} />
                <span className="alert-message">{alert.message}</span>
                <span className="alert-time">{alert.time}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Charts Row */}
      <div className="dashboard-row">
        <Card title="Weekly Orders">
          {weeklyTrend && weeklyTrend.length > 0 ? (
            <BarChart
              data={weeklyTrend}
              xKey="day"
              yKey="orders"
              color="#6366f1"
            />
          ) : (
            <div className="admin-empty">No trend data available</div>
          )}
        </Card>

        <Card title="Top Items">
          {topItems && topItems.length > 0 ? (
            <div className="top-items-list">
              {topItems.map((item, index) => (
                <div key={index} className="top-item">
                  <span className="item-rank">#{index + 1}</span>
                  <span className="item-name">{item.name}</span>
                  <span className="item-orders">{item.orders} orders</span>
                  <span className="item-revenue">{formatCurrency(item.revenue)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-empty">No item data available</div>
          )}
        </Card>
      </div>

      {/* Recent Orders */}
      <Card title="Recent Orders">
        {recentOrders && recentOrders.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{order.items} items</td>
                  <td>{formatCurrency(order.total)}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td>{formatRelativeTime(order.time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="admin-empty">No recent orders</div>
        )}
      </Card>
    </div>
  );
}
