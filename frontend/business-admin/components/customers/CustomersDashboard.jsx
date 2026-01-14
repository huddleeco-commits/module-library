/**
 * CustomerDashboard
 * 
 * CRM command center - customer insights at a glance.
 * - Total customers & growth
 * - Segment breakdown
 * - Lifetime value metrics
 * - Acquisition channels
 * - At-risk customers
 * - Top customers
 * - AI-powered insights
 * 
 * Foundation for loyalty/ecosystem features.
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Star,
  Heart,
  AlertTriangle,
  Gift,
  Award,
  Target,
  Zap,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Crown,
  Shield,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  Calendar,
  BarChart3,
  PieChart,
  RefreshCw
} from 'lucide-react';

export function CustomerDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');

  // Fetch customer data from API
  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch multiple endpoints in parallel
      const [segmentsRes, topRes, atRiskRes] = await Promise.all([
        fetch(`/api/admin/customers/segments?period=${timeRange}`),
        fetch(`/api/admin/customers/top?limit=5`),
        fetch(`/api/admin/customers/at-risk?limit=4`)
      ]);

      const segments = segmentsRes.ok ? await segmentsRes.json() : [];
      const topCustomers = topRes.ok ? await topRes.json() : [];
      const atRiskCustomers = atRiskRes.ok ? await atRiskRes.json() : [];

      // Calculate totals from segments
      const totalCustomers = segments.reduce((sum, s) => sum + (s.count || 0), 0);
      const totalValue = segments.reduce((sum, s) => sum + (s.value || 0), 0);

      setData({
        summary: {
          totalCustomers: totalCustomers,
          customersChange: 0,
          newThisMonth: segments.find(s => s.name === 'New')?.count || 0,
          newChange: 0,
          activeCustomers: segments.filter(s => s.name !== 'At-Risk').reduce((sum, s) => sum + (s.count || 0), 0),
          activePercent: totalCustomers > 0 ? Math.round((totalCustomers - (segments.find(s => s.name === 'At-Risk')?.count || 0)) / totalCustomers * 100) : 0,
          churnedThisMonth: 0,
          churnRate: 0
        },
        ltv: {
          average: totalCustomers > 0 ? Math.round(totalValue / totalCustomers) : 0,
          change: 0,
          median: 0,
          top10Percent: 0
        },
        segments: segments.map(s => ({
          name: s.name || 'Unknown',
          count: s.count || 0,
          percent: totalCustomers > 0 ? Math.round((s.count || 0) / totalCustomers * 100 * 10) / 10 : 0,
          value: s.value || 0,
          color: s.color || '#6b7280',
          icon: s.icon || 'user'
        })),
        acquisitionChannels: [],
        topCustomers: topCustomers.map(c => ({
          id: c.id,
          name: c.full_name || c.name || 'Unknown',
          email: c.email || '',
          totalSpent: c.lifetime_value || c.totalSpent || 0,
          orders: c.total_orders || c.orders || 0,
          segment: c.customer_type || c.segment || 'Regular',
          lastOrder: c.last_order_date ? formatRelativeDate(new Date(c.last_order_date)) : 'Never'
        })),
        atRiskCustomers: atRiskCustomers.map(c => ({
          id: c.id,
          name: c.full_name || c.name || 'Unknown',
          email: c.email || '',
          lastOrder: c.last_order_date ? formatRelativeDate(new Date(c.last_order_date)) : 'Unknown',
          previousFreq: c.previousFreq || 'Unknown',
          totalSpent: c.lifetime_value || c.totalSpent || 0,
          riskScore: c.risk_score || c.riskScore || 50
        })),
        loyalty: {
          enrolled: 0,
          enrolledPercent: 0,
          totalPointsIssued: 0,
          totalPointsRedeemed: 0,
          redemptionRate: 0,
          avgPointsPerCustomer: 0
        },
        recentActivity: [],
        aiInsights: []
      });
    } catch (err) {
      console.error('Error fetching customer data:', err);
      setError(err.message);
      // Set empty default data on error
      setData({
        summary: { totalCustomers: 0, customersChange: 0, newThisMonth: 0, newChange: 0, activeCustomers: 0, activePercent: 0, churnedThisMonth: 0, churnRate: 0 },
        ltv: { average: 0, change: 0, median: 0, top10Percent: 0 },
        segments: [],
        acquisitionChannels: [],
        topCustomers: [],
        atRiskCustomers: [],
        loyalty: { enrolled: 0, enrolledPercent: 0, totalPointsIssued: 0, totalPointsRedeemed: 0, redemptionRate: 0, avgPointsPerCustomer: 0 },
        recentActivity: [],
        aiInsights: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper to format relative dates
  const formatRelativeDate = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  };

  useEffect(() => {
    fetchCustomerData();
  }, [timeRange]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getSegmentIcon = (iconName) => {
    switch (iconName) {
      case 'crown': return Crown;
      case 'heart': return Heart;
      case 'user': return Users;
      case 'clock': return Clock;
      case 'alert': return AlertTriangle;
      case 'sparkle': return Zap;
      default: return Users;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'new': return <UserPlus size={16} color="#22c55e" />;
      case 'purchase': return <DollarSign size={16} color="#3b82f6" />;
      case 'loyalty': return <Gift size={16} color="#8b5cf6" />;
      case 'milestone': return <Award size={16} color="#f59e0b" />;
      case 'return': return <RefreshCw size={16} color="#ef4444" />;
      default: return <Users size={16} />;
    }
  };

  if (loading || !data) {
    return (
      <div style={styles.loadingContainer}>
        <Users size={32} style={{ animation: 'pulse 1s ease-in-out infinite' }} />
        <p>Loading customer insights...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Customers</h1>
          <span style={styles.subtitle}>CRM & relationship management</span>
        </div>
        <div style={styles.headerActions}>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={styles.timeSelect}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="12m">Last 12 months</option>
          </select>
          <button style={styles.actionBtn}>
            <Mail size={16} />
            Email Campaign
          </button>
          <button style={styles.primaryBtn}>
            <UserPlus size={16} />
            Add Customer
          </button>
        </div>
      </div>

      {/* AI Insights */}
      <div style={styles.aiInsightsRow}>
        {data.aiInsights.map((insight, index) => (
          <div key={index} style={{
            ...styles.aiInsightCard,
            borderLeftColor: insight.type === 'opportunity' ? '#22c55e' :
                            insight.type === 'warning' ? '#f97316' : '#3b82f6'
          }}>
            <Zap size={16} color={
              insight.type === 'opportunity' ? '#22c55e' :
              insight.type === 'warning' ? '#f97316' : '#3b82f6'
            } />
            <div style={styles.aiInsightContent}>
              <h4 style={styles.aiInsightTitle}>{insight.title}</h4>
              <p style={styles.aiInsightMessage}>{insight.message}</p>
              {insight.impact && (
                <span style={styles.aiInsightImpact}>{insight.impact}</span>
              )}
            </div>
            <button style={styles.aiInsightAction}>{insight.action}</button>
          </div>
        ))}
      </div>

      {/* Summary Metrics */}
      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <div style={{...styles.metricIcon, backgroundColor: 'rgba(59, 130, 246, 0.1)'}}>
              <Users size={22} color="#3b82f6" />
            </div>
          </div>
          <div style={styles.metricValue}>{formatNumber(data.summary.totalCustomers)}</div>
          <div style={styles.metricLabel}>Total Customers</div>
          <div style={styles.metricChange}>
            <ArrowUpRight size={14} color="#22c55e" />
            <span style={{ color: '#22c55e' }}>+{data.summary.customersChange}%</span>
            <span style={styles.changeLabel}>vs last period</span>
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <div style={{...styles.metricIcon, backgroundColor: 'rgba(34, 197, 94, 0.1)'}}>
              <UserPlus size={22} color="#22c55e" />
            </div>
          </div>
          <div style={styles.metricValue}>{formatNumber(data.summary.newThisMonth)}</div>
          <div style={styles.metricLabel}>New This Month</div>
          <div style={styles.metricChange}>
            <ArrowUpRight size={14} color="#22c55e" />
            <span style={{ color: '#22c55e' }}>+{data.summary.newChange}%</span>
            <span style={styles.changeLabel}>vs last month</span>
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <div style={{...styles.metricIcon, backgroundColor: 'rgba(139, 92, 246, 0.1)'}}>
              <DollarSign size={22} color="#8b5cf6" />
            </div>
          </div>
          <div style={styles.metricValue}>{formatCurrency(data.ltv.average)}</div>
          <div style={styles.metricLabel}>Avg. Lifetime Value</div>
          <div style={styles.metricChange}>
            <ArrowUpRight size={14} color="#22c55e" />
            <span style={{ color: '#22c55e' }}>+{data.ltv.change}%</span>
            <span style={styles.changeLabel}>improving</span>
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <div style={{...styles.metricIcon, backgroundColor: 'rgba(34, 197, 94, 0.1)'}}>
              <UserCheck size={22} color="#22c55e" />
            </div>
          </div>
          <div style={styles.metricValue}>{data.summary.activePercent}%</div>
          <div style={styles.metricLabel}>Active Rate</div>
          <div style={styles.metricBreakdown}>
            <span>{formatNumber(data.summary.activeCustomers)} active customers</span>
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <div style={{...styles.metricIcon, backgroundColor: 'rgba(239, 68, 68, 0.1)'}}>
              <UserX size={22} color="#ef4444" />
            </div>
          </div>
          <div style={styles.metricValue}>{data.summary.churnRate}%</div>
          <div style={styles.metricLabel}>Churn Rate</div>
          <div style={styles.metricBreakdown}>
            <span style={{ color: '#ef4444' }}>{data.summary.churnedThisMonth} lost this month</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={styles.mainGrid}>
        {/* Segments */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Customer Segments</h3>
            <button style={styles.viewAllBtn}>
              Manage <ChevronRight size={14} />
            </button>
          </div>
          <div style={styles.segmentsList}>
            {data.segments.map((segment, index) => {
              const SegmentIcon = getSegmentIcon(segment.icon);
              return (
                <div key={index} style={styles.segmentRow}>
                  <div style={{
                    ...styles.segmentIcon,
                    backgroundColor: `${segment.color}15`,
                    color: segment.color
                  }}>
                    <SegmentIcon size={16} />
                  </div>
                  <div style={styles.segmentInfo}>
                    <span style={styles.segmentName}>{segment.name}</span>
                    <span style={styles.segmentCount}>
                      {formatNumber(segment.count)} customers
                    </span>
                  </div>
                  <div style={styles.segmentValue}>
                    {formatCurrency(segment.value)}
                  </div>
                  <div style={styles.segmentBar}>
                    <div style={{
                      ...styles.segmentBarFill,
                      width: `${segment.percent}%`,
                      backgroundColor: segment.color
                    }} />
                  </div>
                  <span style={styles.segmentPercent}>{segment.percent}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Customers */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>
              <Crown size={18} color="#f59e0b" style={{ marginRight: '8px' }} />
              Top Customers
            </h3>
            <button style={styles.viewAllBtn}>
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div style={styles.topCustomersList}>
            {data.topCustomers.map((customer, index) => (
              <div key={customer.id} style={styles.topCustomerRow}>
                <div style={styles.customerRank}>#{index + 1}</div>
                <div style={styles.customerAvatar}>
                  {customer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div style={styles.customerInfo}>
                  <span style={styles.customerName}>{customer.name}</span>
                  <span style={styles.customerMeta}>
                    {customer.orders} orders • Last: {customer.lastOrder}
                  </span>
                </div>
                <div style={styles.customerSpent}>
                  {formatCurrency(customer.totalSpent)}
                </div>
                <span style={{
                  ...styles.segmentBadge,
                  backgroundColor: customer.segment === 'VIP' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                  color: customer.segment === 'VIP' ? '#f59e0b' : '#22c55e'
                }}>
                  {customer.segment}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div style={styles.secondGrid}>
        {/* At-Risk Customers */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>
              <AlertTriangle size={18} color="#ef4444" style={{ marginRight: '8px' }} />
              At-Risk Customers
            </h3>
            <button style={styles.viewAllBtn}>
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div style={styles.atRiskList}>
            {data.atRiskCustomers.map((customer) => (
              <div key={customer.id} style={styles.atRiskRow}>
                <div style={styles.customerInfo}>
                  <span style={styles.customerName}>{customer.name}</span>
                  <span style={styles.customerMeta}>
                    Last order: {customer.lastOrder} • Was: {customer.previousFreq}
                  </span>
                </div>
                <div style={styles.riskScoreContainer}>
                  <div style={styles.riskScoreBar}>
                    <div style={{
                      ...styles.riskScoreFill,
                      width: `${customer.riskScore}%`,
                      backgroundColor: customer.riskScore > 80 ? '#ef4444' :
                                       customer.riskScore > 60 ? '#f59e0b' : '#22c55e'
                    }} />
                  </div>
                  <span style={styles.riskScore}>{customer.riskScore}%</span>
                </div>
                <button style={styles.winbackBtn}>Win Back</button>
              </div>
            ))}
          </div>
        </div>

        {/* Acquisition Channels */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Acquisition Channels</h3>
            <Target size={18} color="var(--color-text-muted)" />
          </div>
          <div style={styles.channelsList}>
            {data.acquisitionChannels.map((channel, index) => (
              <div key={index} style={styles.channelRow}>
                <div style={styles.channelInfo}>
                  <span style={styles.channelName}>{channel.channel}</span>
                  <span style={styles.channelCount}>
                    {formatNumber(channel.customers)} customers
                  </span>
                </div>
                <div style={styles.channelBar}>
                  <div style={{
                    ...styles.channelBarFill,
                    width: `${channel.percent}%`
                  }} />
                </div>
                <div style={styles.channelTrend}>
                  {channel.trend > 0 ? (
                    <ArrowUpRight size={14} color="#22c55e" />
                  ) : (
                    <ArrowDownRight size={14} color="#ef4444" />
                  )}
                  <span style={{
                    color: channel.trend > 0 ? '#22c55e' : '#ef4444'
                  }}>
                    {channel.trend > 0 ? '+' : ''}{channel.trend}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Recent Activity</h3>
            <Clock size={18} color="var(--color-text-muted)" />
          </div>
          <div style={styles.activityList}>
            {data.recentActivity.map((activity, index) => (
              <div key={index} style={styles.activityRow}>
                <div style={styles.activityIcon}>
                  {getActivityIcon(activity.type)}
                </div>
                <div style={styles.activityContent}>
                  <span style={styles.activityMessage}>{activity.message}</span>
                  <span style={styles.activityTime}>{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Loyalty Overview (Ecosystem Foundation) */}
      <div style={styles.loyaltyCard}>
        <div style={styles.loyaltyHeader}>
          <div style={styles.loyaltyTitleRow}>
            <Gift size={24} color="#8b5cf6" />
            <div>
              <h3 style={styles.loyaltyTitle}>Loyalty Program</h3>
              <span style={styles.loyaltySubtitle}>Rewards & engagement</span>
            </div>
          </div>
          <button style={styles.manageLoyaltyBtn}>
            Manage Program <ChevronRight size={14} />
          </button>
        </div>
        <div style={styles.loyaltyStats}>
          <div style={styles.loyaltyStat}>
            <span style={styles.loyaltyStatValue}>
              {formatNumber(data.loyalty.enrolled)}
            </span>
            <span style={styles.loyaltyStatLabel}>Members Enrolled</span>
            <span style={styles.loyaltyStatPercent}>
              {data.loyalty.enrolledPercent}% of customers
            </span>
          </div>
          <div style={styles.loyaltyStat}>
            <span style={styles.loyaltyStatValue}>
              {formatNumber(data.loyalty.totalPointsIssued)}
            </span>
            <span style={styles.loyaltyStatLabel}>Points Issued</span>
            <span style={styles.loyaltyStatPercent}>All time</span>
          </div>
          <div style={styles.loyaltyStat}>
            <span style={styles.loyaltyStatValue}>
              {data.loyalty.redemptionRate}%
            </span>
            <span style={styles.loyaltyStatLabel}>Redemption Rate</span>
            <span style={styles.loyaltyStatPercent}>Points used</span>
          </div>
          <div style={styles.loyaltyStat}>
            <span style={styles.loyaltyStatValue}>
              {formatNumber(data.loyalty.avgPointsPerCustomer)}
            </span>
            <span style={styles.loyaltyStatLabel}>Avg Points/Member</span>
            <span style={styles.loyaltyStatPercent}>Current balance</span>
          </div>
        </div>
        <div style={styles.ecosystemTeaser}>
          <Zap size={16} color="#f59e0b" />
          <span>
            <strong>Coming Soon:</strong> Token-based loyalty ecosystem — 
            customers earn tradeable tokens with real value
          </span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '24px 32px',
    maxWidth: '100%'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    gap: '16px',
    color: 'var(--color-text-muted)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px'
  },
  headerLeft: {},
  title: {
    fontSize: '28px',
    fontWeight: 700,
    margin: '0 0 4px 0'
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--color-text-muted)'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  timeSelect: {
    padding: '10px 16px',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '10px',
    color: 'var(--color-text)',
    fontSize: '14px',
    cursor: 'pointer',
    outline: 'none'
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '10px',
    color: 'var(--color-text)',
    fontSize: '14px',
    cursor: 'pointer'
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: 'var(--color-primary)',
    border: 'none',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  aiInsightsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '24px'
  },
  aiInsightCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px 20px',
    backgroundColor: 'var(--color-surface)',
    borderRadius: '12px',
    border: '1px solid var(--color-border)',
    borderLeft: '4px solid'
  },
  aiInsightContent: {
    flex: 1
  },
  aiInsightTitle: {
    fontSize: '14px',
    fontWeight: 600,
    margin: '0 0 4px 0'
  },
  aiInsightMessage: {
    fontSize: '12px',
    color: 'var(--color-text-muted)',
    margin: 0,
    lineHeight: 1.5
  },
  aiInsightImpact: {
    display: 'inline-block',
    marginTop: '8px',
    padding: '4px 10px',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#22c55e'
  },
  aiInsightAction: {
    padding: '8px 14px',
    backgroundColor: 'var(--color-primary)',
    border: 'none',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '16px',
    marginBottom: '24px'
  },
  metricCard: {
    padding: '20px',
    backgroundColor: 'var(--color-surface)',
    borderRadius: '16px',
    border: '1px solid var(--color-border)'
  },
  metricHeader: {
    marginBottom: '12px'
  },
  metricIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  metricValue: {
    fontSize: '28px',
    fontWeight: 700,
    marginBottom: '4px'
  },
  metricLabel: {
    fontSize: '13px',
    color: 'var(--color-text-muted)',
    marginBottom: '8px'
  },
  metricChange: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px'
  },
  changeLabel: {
    color: 'var(--color-text-muted)',
    marginLeft: '4px'
  },
  metricBreakdown: {
    fontSize: '12px',
    color: 'var(--color-text-muted)'
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    marginBottom: '24px'
  },
  secondGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '24px',
    marginBottom: '24px'
  },
  card: {
    backgroundColor: 'var(--color-surface)',
    borderRadius: '16px',
    border: '1px solid var(--color-border)',
    overflow: 'hidden'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid var(--color-border)'
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '16px',
    fontWeight: 600,
    margin: 0
  },
  viewAllBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--color-primary)',
    fontSize: '13px',
    cursor: 'pointer'
  },
  segmentsList: {
    padding: '16px 24px'
  },
  segmentRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 0',
    borderBottom: '1px solid var(--color-border)'
  },
  segmentIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  segmentInfo: {
    flex: 1
  },
  segmentName: {
    display: 'block',
    fontWeight: 600
  },
  segmentCount: {
    fontSize: '12px',
    color: 'var(--color-text-muted)'
  },
  segmentValue: {
    fontWeight: 600,
    fontSize: '14px',
    marginRight: '16px'
  },
  segmentBar: {
    width: '80px',
    height: '6px',
    backgroundColor: 'var(--color-surface-2)',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  segmentBarFill: {
    height: '100%',
    borderRadius: '3px'
  },
  segmentPercent: {
    width: '45px',
    textAlign: 'right',
    fontSize: '13px',
    fontWeight: 600
  },
  topCustomersList: {
    padding: '16px 24px'
  },
  topCustomerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 0',
    borderBottom: '1px solid var(--color-border)'
  },
  customerRank: {
    width: '28px',
    fontWeight: 700,
    fontSize: '14px',
    color: 'var(--color-text-muted)'
  },
  customerAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 600
  },
  customerInfo: {
    flex: 1
  },
  customerName: {
    display: 'block',
    fontWeight: 600
  },
  customerMeta: {
    fontSize: '12px',
    color: 'var(--color-text-muted)'
  },
  customerSpent: {
    fontWeight: 700,
    fontSize: '16px'
  },
  segmentBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 600
  },
  atRiskList: {
    padding: '16px 24px'
  },
  atRiskRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '14px 0',
    borderBottom: '1px solid var(--color-border)'
  },
  riskScoreContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '120px'
  },
  riskScoreBar: {
    flex: 1,
    height: '6px',
    backgroundColor: 'var(--color-surface-2)',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  riskScoreFill: {
    height: '100%',
    borderRadius: '3px'
  },
  riskScore: {
    fontWeight: 700,
    fontSize: '13px'
  },
  winbackBtn: {
    padding: '8px 14px',
    backgroundColor: 'var(--color-primary)',
    border: 'none',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  channelsList: {
    padding: '16px 24px'
  },
  channelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 0',
    borderBottom: '1px solid var(--color-border)'
  },
  channelInfo: {
    width: '140px'
  },
  channelName: {
    display: 'block',
    fontWeight: 500,
    fontSize: '13px'
  },
  channelCount: {
    fontSize: '11px',
    color: 'var(--color-text-muted)'
  },
  channelBar: {
    flex: 1,
    height: '8px',
    backgroundColor: 'var(--color-surface-2)',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  channelBarFill: {
    height: '100%',
    backgroundColor: 'var(--color-primary)',
    borderRadius: '4px'
  },
  channelTrend: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    width: '70px',
    justifyContent: 'flex-end',
    fontSize: '12px',
    fontWeight: 600
  },
  activityList: {
    padding: '16px 24px'
  },
  activityRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px 0',
    borderBottom: '1px solid var(--color-border)'
  },
  activityIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: 'var(--color-surface-2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  activityContent: {
    flex: 1
  },
  activityMessage: {
    display: 'block',
    fontSize: '13px'
  },
  activityTime: {
    fontSize: '11px',
    color: 'var(--color-text-muted)'
  },
  loyaltyCard: {
    backgroundColor: 'var(--color-surface)',
    borderRadius: '16px',
    border: '1px solid var(--color-border)',
    padding: '24px',
    marginBottom: '24px'
  },
  loyaltyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  loyaltyTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  loyaltyTitle: {
    fontSize: '18px',
    fontWeight: 600,
    margin: 0
  },
  loyaltySubtitle: {
    fontSize: '13px',
    color: 'var(--color-text-muted)'
  },
  manageLoyaltyBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    border: 'none',
    borderRadius: '10px',
    color: '#8b5cf6',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  loyaltyStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '24px',
    marginBottom: '20px'
  },
  loyaltyStat: {
    textAlign: 'center'
  },
  loyaltyStatValue: {
    display: 'block',
    fontSize: '28px',
    fontWeight: 700,
    color: '#8b5cf6'
  },
  loyaltyStatLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    marginTop: '4px'
  },
  loyaltyStatPercent: {
    fontSize: '12px',
    color: 'var(--color-text-muted)'
  },
  ecosystemTeaser: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderRadius: '12px',
    fontSize: '13px',
    color: 'var(--color-text)'
  }
};

export default CustomerDashboard;