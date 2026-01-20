import React from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, ShoppingCart, Eye } from 'lucide-react';

const stats = [
  { label: 'Total Revenue', value: '$12,450', change: '+12%', icon: DollarSign, positive: true },
  { label: 'Orders', value: '156', change: '+8%', icon: ShoppingCart, positive: true },
  { label: 'Customers', value: '89', change: '+15%', icon: Users, positive: true },
  { label: 'Page Views', value: '2,340', change: '-3%', icon: Eye, positive: false },
];

const recentActivity = [
  { type: 'order', message: 'New order #1234 received', time: '5 min ago' },
  { type: 'customer', message: 'New customer registration', time: '12 min ago' },
  { type: 'order', message: 'Order #1233 completed', time: '25 min ago' },
  { type: 'review', message: 'New 5-star review received', time: '1 hour ago' },
  { type: 'order', message: 'New order #1232 received', time: '2 hours ago' },
];

export default function AnalyticsPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Track your business performance</p>
        </div>
        <select className="form-select">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
          <option>This year</option>
        </select>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon">
              <stat.icon size={24} />
            </div>
            <div className="stat-content">
              <p className="stat-label">{stat.label}</p>
              <p className="stat-value">{stat.value}</p>
              <p className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>
                <TrendingUp size={14} />
                {stat.change} vs last period
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="analytics-grid">
        <div className="card">
          <div className="card-header">
            <BarChart3 size={20} />
            <h2>Revenue Overview</h2>
          </div>
          <div className="card-body chart-placeholder">
            <div className="chart-bars">
              {[65, 45, 75, 50, 80, 60, 90].map((height, i) => (
                <div key={i} className="chart-bar" style={{ height: `${height}%` }} />
              ))}
            </div>
            <div className="chart-labels">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <span key={i}>{day}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Recent Activity</h2>
          </div>
          <div className="activity-list">
            {recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className={`activity-dot ${activity.type}`} />
                <div className="activity-content">
                  <p className="activity-message">{activity.message}</p>
                  <p className="activity-time">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
