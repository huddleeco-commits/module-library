/**
 * MainPlatform.jsx
 * Main platform dashboard UI with navigation to all features
 */

import React, { useState, useEffect } from 'react';
import {
  Globe,
  Smartphone,
  Wrench,
  MessageSquare,
  Calendar,
  Share2,
  Users,
  Zap,
  Settings,
  BarChart3,
  FileText,
  Sparkles,
  LogOut,
  ChevronRight,
  Bell,
  Search,
  User,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
    color: '#e4e4e4',
    fontFamily: "'Inter', -apple-system, sans-serif",
  },

  // Header
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 32px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(0,0,0,0.2)',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '3px',
    background: 'linear-gradient(135deg, #22c55e, #3b82f6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  headerCenter: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    color: '#666',
    fontSize: '14px',
    minWidth: '320px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  iconBtn: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 16px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    cursor: 'pointer',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#e4e4e4',
  },

  // Main content
  main: {
    display: 'flex',
    minHeight: 'calc(100vh - 73px)',
  },

  // Sidebar
  sidebar: {
    width: '240px',
    borderRight: '1px solid rgba(255,255,255,0.08)',
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sidebarSection: {
    marginBottom: '24px',
  },
  sidebarLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    padding: '0 12px',
    marginBottom: '8px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '10px',
    color: '#888',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none',
    background: 'transparent',
    width: '100%',
    textAlign: 'left',
  },
  navItemActive: {
    background: 'rgba(34, 197, 94, 0.1)',
    color: '#22c55e',
  },
  navItemHover: {
    background: 'rgba(255,255,255,0.05)',
    color: '#e4e4e4',
  },
  navBadge: {
    marginLeft: 'auto',
    padding: '2px 8px',
    background: 'rgba(34, 197, 94, 0.2)',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#22c55e',
  },

  // Content area
  content: {
    flex: 1,
    padding: '32px',
    overflowY: 'auto',
  },

  // Welcome section
  welcomeSection: {
    marginBottom: '32px',
  },
  welcomeTitle: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '8px',
    color: '#fff',
  },
  welcomeSubtitle: {
    fontSize: '15px',
    color: '#888',
  },

  // Stats row
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '32px',
  },
  statCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    padding: '20px',
  },
  statLabel: {
    fontSize: '13px',
    color: '#888',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '4px',
  },
  statChange: {
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  statChangePositive: {
    color: '#22c55e',
  },
  statChangeNegative: {
    color: '#ef4444',
  },

  // Quick actions
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#fff',
  },
  sectionLink: {
    fontSize: '13px',
    color: '#3b82f6',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },

  // Feature cards grid
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '32px',
  },
  featureCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '2px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '24px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
    overflow: 'hidden',
  },
  featureCardHover: {
    borderColor: 'rgba(34, 197, 94, 0.3)',
    background: 'rgba(34, 197, 94, 0.05)',
  },
  featureIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  featureTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '8px',
  },
  featureDesc: {
    fontSize: '13px',
    color: '#888',
    lineHeight: '1.5',
    marginBottom: '16px',
  },
  featureAction: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#22c55e',
  },
  featureBadge: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: '600',
  },
  featureBadgeNew: {
    background: 'rgba(99, 102, 241, 0.2)',
    color: '#6366f1',
  },
  featureBadgePro: {
    background: 'rgba(168, 85, 247, 0.2)',
    color: '#a855f7',
  },
  featureBadgePopular: {
    background: 'rgba(34, 197, 94, 0.2)',
    color: '#22c55e',
  },

  // Recent activity
  activitySection: {
    marginBottom: '32px',
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
  },
  activityIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#e4e4e4',
    marginBottom: '4px',
  },
  activityMeta: {
    fontSize: '12px',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  activityTime: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  activityStatus: {
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
  },
  activityStatusSuccess: {
    background: 'rgba(34, 197, 94, 0.1)',
    color: '#22c55e',
  },
  activityStatusPending: {
    background: 'rgba(249, 115, 22, 0.1)',
    color: '#f97316',
  },
};

// Feature categories
const FEATURES = {
  create: [
    {
      id: 'website',
      title: 'Website Builder',
      description: 'Create stunning, responsive websites for any industry with AI assistance.',
      icon: Globe,
      color: '#22c55e',
      badge: 'Popular',
      badgeType: 'popular',
    },
    {
      id: 'app',
      title: 'App Builder',
      description: 'Build mobile-ready web applications with modern frameworks.',
      icon: Smartphone,
      color: '#3b82f6',
      badge: null,
    },
    {
      id: 'tools',
      title: 'Tool Suite',
      description: 'Generate internal tools, dashboards, and business utilities.',
      icon: Wrench,
      color: '#f59e0b',
      badge: 'Pro',
      badgeType: 'pro',
    },
  ],
  manage: [
    {
      id: 'content',
      title: 'Content Generator',
      description: 'Create engaging content for your website, blog, and social media.',
      icon: FileText,
      color: '#8b5cf6',
      badge: 'New',
      badgeType: 'new',
    },
    {
      id: 'scheduler',
      title: 'Content Scheduler',
      description: 'Schedule and automate content publishing across all platforms.',
      icon: Calendar,
      color: '#06b6d4',
      badge: null,
    },
    {
      id: 'social',
      title: 'Social Media',
      description: 'Manage all your social media accounts from one dashboard.',
      icon: Share2,
      color: '#ec4899',
      badge: null,
    },
  ],
  automate: [
    {
      id: 'customer-service',
      title: 'Customer Service AI',
      description: 'Deploy AI-powered customer support for your business.',
      icon: MessageSquare,
      color: '#22c55e',
      badge: null,
    },
    {
      id: 'cardflow',
      title: 'CardFlow Assistant',
      description: 'Smart card-based workflow automation and assistance.',
      icon: Zap,
      color: '#f59e0b',
      badge: 'New',
      badgeType: 'new',
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Track performance metrics and gain insights into your projects.',
      icon: BarChart3,
      color: '#3b82f6',
      badge: null,
    },
  ],
};

// Navigation items
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, badge: null },
  { id: 'projects', label: 'My Projects', icon: FileText, badge: '3' },
  { id: 'create', label: 'Create New', icon: Sparkles, badge: null },
];

const NAV_TOOLS = [
  { id: 'content', label: 'Content', icon: FileText, badge: null },
  { id: 'scheduler', label: 'Scheduler', icon: Calendar, badge: '2' },
  { id: 'social', label: 'Social Media', icon: Share2, badge: null },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null },
];

const NAV_SETTINGS = [
  { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  { id: 'users', label: 'Team', icon: Users, badge: null },
];

// Recent activity mock data
const RECENT_ACTIVITY = [
  {
    id: 1,
    title: 'Website generated for "Bella Vista Restaurant"',
    type: 'website',
    time: '2 hours ago',
    status: 'success',
    icon: Globe,
    color: '#22c55e',
  },
  {
    id: 2,
    title: 'Content scheduled for Instagram',
    type: 'scheduler',
    time: '4 hours ago',
    status: 'pending',
    icon: Calendar,
    color: '#06b6d4',
  },
  {
    id: 3,
    title: 'Customer Service AI deployed',
    type: 'customer-service',
    time: '1 day ago',
    status: 'success',
    icon: MessageSquare,
    color: '#22c55e',
  },
];

export default function MainPlatform({ onNavigate, onLogout, user }) {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [stats, setStats] = useState({
    projects: 12,
    content: 48,
    views: '2.4K',
    engagement: '18%',
  });

  const handleFeatureClick = (featureId) => {
    if (onNavigate) {
      onNavigate(featureId);
    }
  };

  const handleNavClick = (navId) => {
    setActiveNav(navId);
    if (onNavigate) {
      onNavigate(navId);
    }
  };

  const renderNavItem = (item) => (
    <button
      key={item.id}
      style={{
        ...styles.navItem,
        ...(activeNav === item.id ? styles.navItemActive : {}),
      }}
      onClick={() => handleNavClick(item.id)}
      onMouseEnter={(e) => {
        if (activeNav !== item.id) {
          e.target.style.background = 'rgba(255,255,255,0.05)';
          e.target.style.color = '#e4e4e4';
        }
      }}
      onMouseLeave={(e) => {
        if (activeNav !== item.id) {
          e.target.style.background = 'transparent';
          e.target.style.color = '#888';
        }
      }}
    >
      <item.icon size={18} />
      {item.label}
      {item.badge && <span style={styles.navBadge}>{item.badge}</span>}
    </button>
  );

  const renderFeatureCard = (feature) => (
    <div
      key={feature.id}
      style={{
        ...styles.featureCard,
        ...(hoveredCard === feature.id ? styles.featureCardHover : {}),
      }}
      onClick={() => handleFeatureClick(feature.id)}
      onMouseEnter={() => setHoveredCard(feature.id)}
      onMouseLeave={() => setHoveredCard(null)}
    >
      {feature.badge && (
        <span
          style={{
            ...styles.featureBadge,
            ...(feature.badgeType === 'new' ? styles.featureBadgeNew : {}),
            ...(feature.badgeType === 'pro' ? styles.featureBadgePro : {}),
            ...(feature.badgeType === 'popular' ? styles.featureBadgePopular : {}),
          }}
        >
          {feature.badge}
        </span>
      )}
      <div
        style={{
          ...styles.featureIcon,
          background: `${feature.color}20`,
        }}
      >
        <feature.icon size={24} style={{ color: feature.color }} />
      </div>
      <div style={styles.featureTitle}>{feature.title}</div>
      <div style={styles.featureDesc}>{feature.description}</div>
      <div style={styles.featureAction}>
        Get Started <ChevronRight size={16} />
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logoSection}>
          <div style={styles.logoText}>RALPH</div>
        </div>

        <div style={styles.headerCenter}>
          <Search size={16} />
          <span>Search projects, features, or help...</span>
        </div>

        <div style={styles.headerRight}>
          <button style={styles.iconBtn}>
            <Bell size={18} />
          </button>
          <div style={styles.userSection}>
            <div style={styles.avatar}>
              <User size={16} color="#fff" />
            </div>
            <span style={styles.userName}>{user?.name || 'User'}</span>
          </div>
          {onLogout && (
            <button
              style={styles.iconBtn}
              onClick={onLogout}
              title="Log out"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </header>

      <div style={styles.main}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarSection}>
            <div style={styles.sidebarLabel}>Main</div>
            {NAV_ITEMS.map(renderNavItem)}
          </div>

          <div style={styles.sidebarSection}>
            <div style={styles.sidebarLabel}>Tools</div>
            {NAV_TOOLS.map(renderNavItem)}
          </div>

          <div style={{ marginTop: 'auto' }}>
            <div style={styles.sidebarLabel}>Account</div>
            {NAV_SETTINGS.map(renderNavItem)}
          </div>
        </aside>

        {/* Content */}
        <main style={styles.content}>
          {/* Welcome */}
          <div style={styles.welcomeSection}>
            <h1 style={styles.welcomeTitle}>
              Welcome back{user?.name ? `, ${user.name}` : ''}
            </h1>
            <p style={styles.welcomeSubtitle}>
              Here's what's happening with your projects today.
            </p>
          </div>

          {/* Stats */}
          <div style={styles.statsRow}>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>
                <FileText size={16} /> Total Projects
              </div>
              <div style={styles.statValue}>{stats.projects}</div>
              <div style={{ ...styles.statChange, ...styles.statChangePositive }}>
                <TrendingUp size={14} /> +2 this week
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>
                <FileText size={16} /> Content Created
              </div>
              <div style={styles.statValue}>{stats.content}</div>
              <div style={{ ...styles.statChange, ...styles.statChangePositive }}>
                <TrendingUp size={14} /> +12 this week
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>
                <BarChart3 size={16} /> Total Views
              </div>
              <div style={styles.statValue}>{stats.views}</div>
              <div style={{ ...styles.statChange, ...styles.statChangePositive }}>
                <TrendingUp size={14} /> +18% vs last week
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>
                <Users size={16} /> Engagement Rate
              </div>
              <div style={styles.statValue}>{stats.engagement}</div>
              <div style={{ ...styles.statChange, ...styles.statChangePositive }}>
                <TrendingUp size={14} /> +3.2% vs last week
              </div>
            </div>
          </div>

          {/* Create Section */}
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Create</h2>
            <span style={styles.sectionLink}>
              View all <ChevronRight size={14} />
            </span>
          </div>
          <div style={styles.featureGrid}>
            {FEATURES.create.map(renderFeatureCard)}
          </div>

          {/* Manage Section */}
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Manage Content</h2>
            <span style={styles.sectionLink}>
              View all <ChevronRight size={14} />
            </span>
          </div>
          <div style={styles.featureGrid}>
            {FEATURES.manage.map(renderFeatureCard)}
          </div>

          {/* Automate Section */}
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Automate</h2>
            <span style={styles.sectionLink}>
              View all <ChevronRight size={14} />
            </span>
          </div>
          <div style={styles.featureGrid}>
            {FEATURES.automate.map(renderFeatureCard)}
          </div>

          {/* Recent Activity */}
          <div style={styles.activitySection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Recent Activity</h2>
              <span style={styles.sectionLink}>
                View all <ChevronRight size={14} />
              </span>
            </div>
            <div style={styles.activityList}>
              {RECENT_ACTIVITY.map((activity) => (
                <div key={activity.id} style={styles.activityItem}>
                  <div
                    style={{
                      ...styles.activityIcon,
                      background: `${activity.color}20`,
                    }}
                  >
                    <activity.icon size={20} style={{ color: activity.color }} />
                  </div>
                  <div style={styles.activityContent}>
                    <div style={styles.activityTitle}>{activity.title}</div>
                    <div style={styles.activityMeta}>
                      <span style={styles.activityTime}>
                        <Clock size={12} /> {activity.time}
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      ...styles.activityStatus,
                      ...(activity.status === 'success'
                        ? styles.activityStatusSuccess
                        : styles.activityStatusPending),
                    }}
                  >
                    {activity.status === 'success' ? (
                      <>
                        <CheckCircle2
                          size={12}
                          style={{ marginRight: '4px', verticalAlign: 'middle' }}
                        />
                        Completed
                      </>
                    ) : (
                      <>
                        <AlertCircle
                          size={12}
                          style={{ marginRight: '4px', verticalAlign: 'middle' }}
                        />
                        Pending
                      </>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
