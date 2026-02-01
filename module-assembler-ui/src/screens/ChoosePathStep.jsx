/**
 * ChoosePathStep Screen
 * Premium landing page with parallel structures for Websites, Apps, and Tool Suites
 *
 * LAYOUT:
 * 1. BUILD A WEBSITE
 *    - Featured GUIDED card
 *    - Secondary: INSTANT | INSPIRED | CUSTOM
 *
 * 2. BUILD AN APP (NEW)
 *    - Featured GUIDED card (pre-made app templates)
 *    - Secondary: INSTANT (AI picks app) | CUSTOM (configure from scratch)
 *    - App grid: Expense Tracker, Habit Tracker, Project Timer, etc.
 *
 * 3. BUILD A TOOL SUITE
 *    - Featured GUIDED card (pre-made business bundles)
 *    - Secondary: INSTANT (AI picks tools) | CUSTOM (mix & match)
 *    - Bundle grid: Freelancer, Restaurant, Fitness, Real Estate, etc.
 *
 * 4. BROWSE INDIVIDUAL TOOLS
 *    - Collapsible grid for single tools
 *
 * NOTE: Dev Tools are in the unified floating panel (App.jsx)
 */

import React, { useState } from 'react';
import { styles } from '../styles';

export function ChoosePathStep({ onSelect, isDevUnlocked }) {

  const [toolFilter, setToolFilter] = useState('all');
  const [showIndividualTools, setShowIndividualTools] = useState(false);

  // Pre-made business bundles for Tool Suite
  const toolBundles = [
    {
      id: 'freelancer',
      icon: '💼',
      name: 'Freelancer Pack',
      desc: 'Invoice, time tracking & expenses',
      tools: ['invoice-generator', 'time-tracker', 'expense-tracker', 'receipt-generator'],
      color: '#3b82f6',
      popular: true,
    },
    {
      id: 'developer',
      icon: '👨‍💻',
      name: 'Developer Pack',
      desc: 'UUID, JSON, Base64 & more',
      tools: ['uuid-generator', 'json-formatter', 'base64-encoder', 'hash-generator', 'regex-tester'],
      color: '#06b6d4',
      popular: true,
    },
    {
      id: 'restaurant',
      icon: '🍽️',
      name: 'Restaurant Pack',
      desc: 'Tips, recipes & reservations',
      tools: ['tip-calculator', 'recipe-scaler', 'countdown', 'qr-generator'],
      color: '#ef4444',
      popular: true,
    },
    {
      id: 'fitness',
      icon: '💪',
      name: 'Fitness Pack',
      desc: 'BMI, calories & habit tracking',
      tools: ['bmi-calculator', 'calorie-calculator', 'habit-tracker', 'pomodoro'],
      color: '#10b981',
    },
    {
      id: 'real-estate',
      icon: '🏠',
      name: 'Real Estate Pack',
      desc: 'Mortgage, ROI & appointments',
      tools: ['calculator', 'countdown', 'qr-generator', 'unit-converter'],
      color: '#8b5cf6',
    },
    {
      id: 'creator',
      icon: '🎨',
      name: 'Creator Pack',
      desc: 'Colors, images & productivity',
      tools: ['color-picker', 'image-resizer', 'password-generator', 'pomodoro'],
      color: '#ec4899',
    },
    {
      id: 'retail',
      icon: '🛒',
      name: 'Retail Pack',
      desc: 'Receipts, inventory & pricing',
      tools: ['receipt-generator', 'calculator', 'qr-generator', 'unit-converter'],
      color: '#f59e0b',
    },
  ];

  // App templates - focused applications with real functionality
  const appTemplates = [
    {
      id: 'expense-tracker',
      icon: '💰',
      name: 'Expense Tracker',
      desc: 'Track spending, categories & budgets',
      features: ['Add expenses', 'Categories', 'Monthly charts', 'CSV export'],
      color: '#10b981',
      popular: true,
    },
    {
      id: 'habit-tracker',
      icon: '✅',
      name: 'Habit Tracker',
      desc: 'Daily habits, streaks & calendar',
      features: ['Daily check-ins', 'Streaks', 'Calendar view', 'Statistics'],
      color: '#8b5cf6',
      popular: true,
    },
    {
      id: 'project-timer',
      icon: '⏱️',
      name: 'Project Timer',
      desc: 'Track time across projects',
      features: ['Multiple projects', 'Start/stop', 'Time logs', 'Reports'],
      color: '#3b82f6',
      popular: true,
    },
    {
      id: 'bookmark-manager',
      icon: '🔖',
      name: 'Bookmark Manager',
      desc: 'Save links, tags & folders',
      features: ['Save URLs', 'Tags & folders', 'Search', 'Import/export'],
      color: '#f59e0b',
    },
  ];

  // Complete tool library - organized by category
  const toolLibrary = {
    business: [
      { id: 'invoice-generator', icon: '📄', name: 'Invoice Generator', desc: 'Create professional invoices', popular: true },
      { id: 'receipt-generator', icon: '🧾', name: 'Receipt Generator', desc: 'Generate receipts instantly' },
      { id: 'expense-tracker', icon: '💰', name: 'Expense Tracker', desc: 'Track spending & budgets' },
      { id: 'time-tracker', icon: '⏰', name: 'Time Tracker', desc: 'Log hours & projects' },
    ],
    developer: [
      { id: 'uuid-generator', icon: '🔑', name: 'UUID Generator', desc: 'Generate unique identifiers', popular: true },
      { id: 'json-formatter', icon: '📋', name: 'JSON Formatter', desc: 'Format & validate JSON', popular: true },
      { id: 'base64-encoder', icon: '🔐', name: 'Base64 Encoder', desc: 'Encode & decode Base64' },
      { id: 'hash-generator', icon: '🔒', name: 'Hash Generator', desc: 'MD5, SHA256 & more' },
      { id: 'regex-tester', icon: '🔍', name: 'Regex Tester', desc: 'Test regular expressions' },
    ],
    utilities: [
      { id: 'qr-generator', icon: '📱', name: 'QR Code Generator', desc: 'Generate QR codes instantly', popular: true },
      { id: 'password-generator', icon: '🔐', name: 'Password Generator', desc: 'Secure random passwords' },
      { id: 'countdown', icon: '⏱️', name: 'Countdown Timer', desc: 'Event countdowns & timers', popular: true },
      { id: 'pomodoro', icon: '🍅', name: 'Pomodoro Timer', desc: 'Focus & productivity timer' },
      { id: 'image-resizer', icon: '🖼️', name: 'Image Resizer', desc: 'Resize & compress images', popular: true },
      { id: 'word-counter', icon: '📝', name: 'Word Counter', desc: 'Count words & characters' },
    ],
    calculators: [
      { id: 'calculator', icon: '🧮', name: 'Calculator', desc: 'Build custom calculators', popular: true },
      { id: 'tip-calculator', icon: '💵', name: 'Tip Calculator', desc: 'Split bills & calculate tips' },
      { id: 'bmi-calculator', icon: '⚖️', name: 'BMI Calculator', desc: 'Health & fitness metrics' },
      { id: 'calorie-calculator', icon: '🍎', name: 'Calorie Calculator', desc: 'Nutrition & diet planning' },
      { id: 'age-calculator', icon: '🎂', name: 'Age Calculator', desc: 'Calculate exact age' },
    ],
    converters: [
      { id: 'unit-converter', icon: '🔄', name: 'Unit Converter', desc: 'Convert any measurements' },
      { id: 'json-csv-converter', icon: '📊', name: 'JSON/CSV Converter', desc: 'Convert between formats' },
    ],
    lifestyle: [
      { id: 'habit-tracker', icon: '✅', name: 'Habit Tracker', desc: 'Build better habits daily' },
      { id: 'recipe-scaler', icon: '🍳', name: 'Recipe Scaler', desc: 'Adjust recipe portions' },
      { id: 'color-picker', icon: '🎨', name: 'Color Picker', desc: 'Find perfect color palettes' },
    ],
  };

  // Get tools based on filter
  const getFilteredTools = () => {
    if (toolFilter === 'all') {
      return Object.values(toolLibrary).flat();
    }
    if (toolFilter === 'popular') {
      return Object.values(toolLibrary).flat().filter(t => t.popular);
    }
    return toolLibrary[toolFilter] || [];
  };

  const filteredTools = getFilteredTools();

  // Premium styles for the redesigned layout
  const premiumStyles = {
    // Main container with better spacing
    container: {
      ...styles.stepContainer,
      maxWidth: '1200px',
      padding: '40px 24px',
    },
    // Hero title styling
    heroTitle: {
      ...styles.heroTitle,
      fontSize: '2.8rem',
      marginBottom: '8px',
      background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    heroSubtitle: {
      ...styles.heroSubtitle,
      fontSize: '1.1rem',
      opacity: 0.7,
      marginBottom: '48px',
    },

    // Section styling
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '8px',
    },
    sectionTitle: {
      fontSize: '1.4rem',
      fontWeight: '700',
      color: '#fff',
      margin: 0,
    },
    sectionIcon: {
      fontSize: '1.5rem',
    },
    sectionSubtitle: {
      fontSize: '0.95rem',
      color: 'rgba(255,255,255,0.5)',
      marginBottom: '24px',
    },
    sectionDivider: {
      height: '1px',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
      margin: '48px 0',
    },

    // Featured GUIDED card - Full width, prominent
    featuredCard: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: '32px',
      padding: '32px 40px',
      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(22, 163, 74, 0.08) 100%)',
      border: '2px solid rgba(34, 197, 94, 0.4)',
      borderRadius: '20px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textAlign: 'left',
      marginBottom: '24px',
    },
    featuredIconContainer: {
      width: '100px',
      height: '100px',
      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.1))',
      borderRadius: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '3rem',
      flexShrink: 0,
    },
    featuredContent: {
      flex: 1,
    },
    featuredBadge: {
      display: 'inline-block',
      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
      color: '#fff',
      padding: '6px 16px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '700',
      letterSpacing: '1px',
      marginBottom: '12px',
    },
    featuredTitle: {
      fontSize: '1.8rem',
      fontWeight: '700',
      color: '#fff',
      margin: '0 0 8px 0',
    },
    featuredDesc: {
      fontSize: '1rem',
      color: 'rgba(255,255,255,0.7)',
      margin: '0 0 8px 0',
    },
    featuredDetails: {
      fontSize: '0.9rem',
      color: 'rgba(255,255,255,0.5)',
      margin: 0,
      lineHeight: 1.5,
    },
    featuredArrow: {
      fontSize: '2rem',
      color: 'rgba(34, 197, 94, 0.6)',
      transition: 'transform 0.3s ease',
    },

    // Tool Suite featured card (orange theme)
    toolSuiteFeaturedCard: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: '32px',
      padding: '32px 40px',
      background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.12) 0%, rgba(234, 88, 12, 0.08) 100%)',
      border: '2px solid rgba(249, 115, 22, 0.4)',
      borderRadius: '20px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textAlign: 'left',
      marginBottom: '24px',
    },
    toolSuiteIconContainer: {
      width: '100px',
      height: '100px',
      background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(234, 88, 12, 0.1))',
      borderRadius: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '3rem',
      flexShrink: 0,
    },
    toolSuiteBadge: {
      display: 'inline-block',
      background: 'linear-gradient(135deg, #f97316, #ea580c)',
      color: '#fff',
      padding: '6px 16px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '700',
      letterSpacing: '1px',
      marginBottom: '12px',
    },
    toolSuiteArrow: {
      fontSize: '2rem',
      color: 'rgba(249, 115, 22, 0.6)',
      transition: 'transform 0.3s ease',
    },

    // Secondary modes - 3 column grid for websites
    secondaryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px',
      marginBottom: '16px',
    },
    // Secondary modes - 2 column grid for tools
    secondaryGridTwo: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
      marginBottom: '24px',
    },
    secondaryCard: {
      position: 'relative',
      padding: '24px 20px',
      borderRadius: '16px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textAlign: 'center',
      border: '1px solid',
    },
    // INSTANT card style
    instantCard: {
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.06))',
      borderColor: 'rgba(102, 126, 234, 0.3)',
    },
    // INSPIRED card style
    inspiredCard: {
      background: 'rgba(255, 255, 255, 0.03)',
      borderColor: 'rgba(255, 255, 255, 0.12)',
    },
    // CUSTOM card style
    customCard: {
      background: 'rgba(99, 102, 241, 0.06)',
      borderColor: 'rgba(99, 102, 241, 0.25)',
    },
    secondaryIcon: {
      fontSize: '2rem',
      marginBottom: '12px',
    },
    secondaryBadge: {
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '10px',
      fontSize: '10px',
      fontWeight: '700',
      letterSpacing: '0.5px',
      marginBottom: '8px',
    },
    secondaryTitle: {
      fontSize: '1.1rem',
      fontWeight: '700',
      color: '#fff',
      margin: '0 0 4px 0',
    },
    secondaryDesc: {
      fontSize: '0.85rem',
      color: 'rgba(255,255,255,0.5)',
      margin: 0,
    },

    // Bundle grid
    bundleGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '16px',
    },
    bundleCard: {
      position: 'relative',
      padding: '24px 20px',
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '16px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textAlign: 'center',
    },
    bundleIcon: {
      fontSize: '2.5rem',
      marginBottom: '12px',
    },
    bundleName: {
      fontSize: '1rem',
      fontWeight: '700',
      color: '#fff',
      margin: '0 0 4px 0',
    },
    bundleDesc: {
      fontSize: '0.8rem',
      color: 'rgba(255,255,255,0.5)',
      margin: '0 0 12px 0',
    },
    bundleToolCount: {
      fontSize: '0.75rem',
      color: 'rgba(255,255,255,0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px',
    },
    bundlePopularBadge: {
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
      color: '#fff',
      padding: '4px 10px',
      borderRadius: '10px',
      fontSize: '9px',
      fontWeight: '700',
    },

    // Collapsible Individual Tools section
    individualToolsHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 24px',
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      marginTop: '24px',
    },
    individualToolsTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    individualToolsArrow: {
      fontSize: '1.2rem',
      color: 'rgba(255,255,255,0.4)',
      transition: 'transform 0.3s ease',
    },
    toolLibraryHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginBottom: '24px',
      marginTop: '24px',
      flexWrap: 'wrap',
      gap: '16px',
    },
    toolFilters: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
    },
    filterButton: {
      padding: '8px 16px',
      borderRadius: '20px',
      border: '1px solid rgba(255,255,255,0.15)',
      background: 'transparent',
      color: 'rgba(255,255,255,0.6)',
      fontSize: '13px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    filterButtonActive: {
      background: 'rgba(168, 85, 247, 0.15)',
      borderColor: 'rgba(168, 85, 247, 0.4)',
      color: '#a855f7',
    },
    toolGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
      gap: '12px',
      marginBottom: '16px',
    },
    toolCard: {
      position: 'relative',
      padding: '16px 12px',
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textAlign: 'center',
    },
    toolIcon: {
      fontSize: '1.8rem',
      marginBottom: '8px',
    },
    toolName: {
      fontSize: '0.85rem',
      fontWeight: '600',
      color: '#fff',
      margin: '0 0 2px 0',
    },
    toolDesc: {
      fontSize: '0.7rem',
      color: 'rgba(255,255,255,0.4)',
      margin: 0,
      lineHeight: 1.3,
    },
    popularBadge: {
      position: 'absolute',
      top: '-5px',
      right: '-5px',
      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
      color: '#fff',
      padding: '2px 6px',
      borderRadius: '6px',
      fontSize: '8px',
      fontWeight: '700',
    },
    customToolCard: {
      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(139, 92, 246, 0.05))',
      borderColor: 'rgba(168, 85, 247, 0.3)',
    },
    customToolBadge: {
      position: 'absolute',
      top: '-5px',
      right: '-5px',
      background: 'linear-gradient(135deg, #a855f7, #8b5cf6)',
      color: '#fff',
      padding: '2px 6px',
      borderRadius: '6px',
      fontSize: '8px',
      fontWeight: '700',
    },

    // Bottom hint
    bottomHint: {
      textAlign: 'center',
      fontSize: '0.85rem',
      color: 'rgba(255,255,255,0.4)',
      marginTop: '32px',
    },

    // App section styles (purple/cyan theme)
    appFeaturedCard: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: '32px',
      padding: '32px 40px',
      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
      border: '2px solid rgba(139, 92, 246, 0.4)',
      borderRadius: '20px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textAlign: 'left',
      marginBottom: '24px',
    },
    appIconContainer: {
      width: '100px',
      height: '100px',
      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.1))',
      borderRadius: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '3rem',
      flexShrink: 0,
    },
    appBadge: {
      display: 'inline-block',
      background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
      color: '#fff',
      padding: '6px 16px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '700',
      letterSpacing: '1px',
      marginBottom: '12px',
    },
    appArrow: {
      fontSize: '2rem',
      color: 'rgba(139, 92, 246, 0.6)',
      transition: 'transform 0.3s ease',
    },
    appGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
      gap: '16px',
    },
    appCard: {
      position: 'relative',
      padding: '24px 20px',
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '16px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textAlign: 'left',
    },
    appCardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '12px',
    },
    appCardIcon: {
      fontSize: '2rem',
    },
    appCardName: {
      fontSize: '1.1rem',
      fontWeight: '700',
      color: '#fff',
      margin: 0,
    },
    appCardDesc: {
      fontSize: '0.85rem',
      color: 'rgba(255,255,255,0.5)',
      margin: '0 0 12px 0',
    },
    appFeatureList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
    },
    appFeatureTag: {
      padding: '4px 10px',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '12px',
      fontSize: '0.7rem',
      color: 'rgba(255,255,255,0.6)',
    },
    appPopularBadge: {
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
      color: '#fff',
      padding: '4px 10px',
      borderRadius: '10px',
      fontSize: '9px',
      fontWeight: '700',
    },

    // Advanced Apps section styles (pink/gold premium theme)
    advancedFeaturedCard: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: '32px',
      padding: '32px 40px',
      background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.12) 0%, rgba(245, 158, 11, 0.08) 100%)',
      border: '2px solid rgba(236, 72, 153, 0.4)',
      borderRadius: '20px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textAlign: 'left',
      marginBottom: '24px',
    },
    advancedIconContainer: {
      width: '100px',
      height: '100px',
      background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(245, 158, 11, 0.1))',
      borderRadius: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '3rem',
      flexShrink: 0,
    },
    advancedBadge: {
      display: 'inline-block',
      background: 'linear-gradient(135deg, #ec4899, #f59e0b)',
      color: '#fff',
      padding: '6px 16px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '700',
      letterSpacing: '1px',
      marginBottom: '12px',
    },
    advancedArrow: {
      fontSize: '2rem',
      color: 'rgba(236, 72, 153, 0.6)',
      transition: 'transform 0.3s ease',
    },
    advancedGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '20px',
    },
    advancedCard: {
      position: 'relative',
      padding: '28px 24px',
      background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.06) 0%, rgba(245, 158, 11, 0.04) 100%)',
      border: '2px solid rgba(236, 72, 153, 0.25)',
      borderRadius: '20px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textAlign: 'left',
    },
    advancedCardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      marginBottom: '14px',
    },
    advancedCardIcon: {
      fontSize: '2.5rem',
    },
    advancedCardName: {
      fontSize: '1.2rem',
      fontWeight: '700',
      color: '#fff',
      margin: 0,
    },
    advancedCardDesc: {
      fontSize: '0.9rem',
      color: 'rgba(255,255,255,0.6)',
      margin: '0 0 16px 0',
      lineHeight: 1.5,
    },
    advancedFeatureList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginBottom: '16px',
    },
    advancedFeatureTag: {
      padding: '5px 12px',
      background: 'rgba(236, 72, 153, 0.15)',
      border: '1px solid rgba(236, 72, 153, 0.25)',
      borderRadius: '14px',
      fontSize: '0.75rem',
      color: 'rgba(255,255,255,0.8)',
    },
    advancedCostBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 14px',
      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(236, 72, 153, 0.15))',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      borderRadius: '12px',
      fontSize: '0.8rem',
      fontWeight: '600',
      color: '#f59e0b',
    },
    fullStackBadge: {
      position: 'absolute',
      top: '-10px',
      right: '-10px',
      background: 'linear-gradient(135deg, #ec4899, #f59e0b)',
      color: '#fff',
      padding: '6px 14px',
      borderRadius: '12px',
      fontSize: '10px',
      fontWeight: '700',
      letterSpacing: '0.5px',
      boxShadow: '0 4px 12px rgba(236, 72, 153, 0.4)',
    },
  };

  return (
    <div style={premiumStyles.container}>
      <h1 style={premiumStyles.heroTitle}>What would you like to build?</h1>
      <p style={premiumStyles.heroSubtitle}>Create professional websites or powerful tool dashboards</p>

      {/* Platform Dashboard Quick Access */}
      <button
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          width: '100%',
          padding: '16px 24px',
          marginBottom: '32px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.08))',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '14px',
          color: '#a5b4fc',
          fontSize: '15px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onClick={() => onSelect('platform')}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.12))';
          e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.08))';
          e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <span style={{ fontSize: '20px' }}>🏠</span>
        Open Platform Dashboard
        <span style={{
          padding: '4px 10px',
          background: 'rgba(99, 102, 241, 0.2)',
          borderRadius: '8px',
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '0.5px',
        }}>
          NEW
        </span>
      </button>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1: BUILD A WEBSITE
          ═══════════════════════════════════════════════════════════════ */}
      <div>
        <div style={premiumStyles.sectionHeader}>
          <span style={premiumStyles.sectionIcon}>🌐</span>
          <h2 style={premiumStyles.sectionTitle}>Build a Website</h2>
        </div>
        <p style={premiumStyles.sectionSubtitle}>Multi-page websites with full business functionality</p>

        {/* Featured GUIDED Card */}
        <button
          style={premiumStyles.featuredCard}
          onClick={() => onSelect('quick')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(34, 197, 94, 0.25)';
            e.currentTarget.querySelector('.arrow').style.transform = 'translateX(8px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.querySelector('.arrow').style.transform = 'translateX(0)';
          }}
        >
          <div style={premiumStyles.featuredIconContainer}>✨</div>
          <div style={premiumStyles.featuredContent}>
            <div style={premiumStyles.featuredBadge}>RECOMMENDED</div>
            <h2 style={premiumStyles.featuredTitle}>GUIDED</h2>
            <p style={premiumStyles.featuredDesc}>Step-by-step wizard for reliable results</p>
            <p style={premiumStyles.featuredDetails}>
              Pick your industry, upload your assets, customize colors and content.
              Our most battle-tested path with predictable, professional results.
            </p>
          </div>
          <div className="arrow" style={premiumStyles.featuredArrow}>→</div>
        </button>

        {/* Secondary Mode Cards */}
        <div style={premiumStyles.secondaryGrid}>
          {/* INSTANT */}
          <button
            style={{...premiumStyles.secondaryCard, ...premiumStyles.instantCard}}
            onClick={() => onSelect('orchestrator')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={premiumStyles.secondaryIcon}>🚀</div>
            <div style={{...premiumStyles.secondaryBadge, background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff'}}>
              AI-POWERED
            </div>
            <h3 style={premiumStyles.secondaryTitle}>INSTANT</h3>
            <p style={premiumStyles.secondaryDesc}>Describe it, we build it</p>
          </button>

          {/* INSPIRED */}
          <button
            style={{
              ...premiumStyles.secondaryCard,
              ...premiumStyles.inspiredCard,
              ...(isDevUnlocked ? {} : { opacity: 0.5, cursor: 'not-allowed' })
            }}
            onClick={() => isDevUnlocked ? onSelect('reference') : null}
            onMouseEnter={(e) => {
              if (isDevUnlocked) {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 255, 255, 0.08)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={premiumStyles.secondaryIcon}>🎨</div>
            <div style={{...premiumStyles.secondaryBadge, background: 'linear-gradient(135deg, #6b7280, #4b5563)', color: '#fff'}}>
              {isDevUnlocked ? 'BETA' : 'COMING SOON'}
            </div>
            <h3 style={premiumStyles.secondaryTitle}>INSPIRED</h3>
            <p style={premiumStyles.secondaryDesc}>Start from designs you like</p>
          </button>

          {/* CUSTOM */}
          <button
            style={{...premiumStyles.secondaryCard, ...premiumStyles.customCard}}
            onClick={() => onSelect('full-control')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={premiumStyles.secondaryIcon}>⚙️</div>
            <div style={{...premiumStyles.secondaryBadge, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff'}}>
              ADVANCED
            </div>
            <h3 style={premiumStyles.secondaryTitle}>CUSTOM</h3>
            <p style={premiumStyles.secondaryDesc}>Configure every detail</p>
          </button>
        </div>
      </div>

      {/* Divider */}
      <div style={premiumStyles.sectionDivider} />

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2: BUILD AN APP
          ═══════════════════════════════════════════════════════════════ */}
      <div>
        <div style={premiumStyles.sectionHeader}>
          <span style={premiumStyles.sectionIcon}>📱</span>
          <h2 style={premiumStyles.sectionTitle}>Build an App</h2>
        </div>
        <p style={premiumStyles.sectionSubtitle}>Focused applications with real functionality - state, data persistence, charts</p>

        {/* Featured GUIDED Card for Apps */}
        <button
          style={premiumStyles.appFeaturedCard}
          onClick={() => onSelect('app-guided')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(139, 92, 246, 0.25)';
            e.currentTarget.querySelector('.arrow').style.transform = 'translateX(8px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.querySelector('.arrow').style.transform = 'translateX(0)';
          }}
        >
          <div style={premiumStyles.appIconContainer}>📱</div>
          <div style={premiumStyles.featuredContent}>
            <div style={premiumStyles.appBadge}>RECOMMENDED</div>
            <h2 style={premiumStyles.featuredTitle}>GUIDED</h2>
            <p style={premiumStyles.featuredDesc}>Pick a pre-made app template</p>
            <p style={premiumStyles.featuredDetails}>
              Choose from polished app templates with state management, data persistence,
              and beautiful charts. Expense trackers, habit trackers, and more.
            </p>
          </div>
          <div className="arrow" style={premiumStyles.appArrow}>→</div>
        </button>

        {/* Secondary Mode Cards for Apps */}
        <div style={premiumStyles.secondaryGridTwo}>
          {/* AI BUILDER - Describe and generate custom app */}
          <button
            style={{...premiumStyles.secondaryCard, ...premiumStyles.instantCard}}
            onClick={() => onSelect('app-ai-builder')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={premiumStyles.secondaryIcon}>✨</div>
            <div style={{...premiumStyles.secondaryBadge, background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff'}}>
              AI-POWERED
            </div>
            <h3 style={premiumStyles.secondaryTitle}>AI BUILDER</h3>
            <p style={premiumStyles.secondaryDesc}>Describe your app, AI builds it (~$0.05-0.15)</p>
          </button>

          {/* CUSTOM - Configure from scratch */}
          <button
            style={{
              ...premiumStyles.secondaryCard,
              ...premiumStyles.customCard,
              opacity: 0.5,
              cursor: 'not-allowed'
            }}
            onClick={() => null}
          >
            <div style={premiumStyles.secondaryIcon}>⚙️</div>
            <div style={{...premiumStyles.secondaryBadge, background: 'linear-gradient(135deg, #6b7280, #4b5563)', color: '#fff'}}>
              COMING SOON
            </div>
            <h3 style={premiumStyles.secondaryTitle}>CUSTOM</h3>
            <p style={premiumStyles.secondaryDesc}>Build from components</p>
          </button>
        </div>

        {/* App Template Grid */}
        <p style={{...premiumStyles.sectionSubtitle, marginBottom: '16px', marginTop: '8px'}}>
          Or quick-select a template:
        </p>
        <div style={premiumStyles.appGrid}>
          {appTemplates.map(app => (
            <button
              key={app.id}
              style={{
                ...premiumStyles.appCard,
                borderColor: `${app.color}30`,
              }}
              onClick={() => onSelect('app-template', app.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = `${app.color}60`;
                e.currentTarget.style.background = `${app.color}10`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = `${app.color}30`;
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              }}
            >
              {app.popular && <div style={premiumStyles.appPopularBadge}>POPULAR</div>}
              <div style={premiumStyles.appCardHeader}>
                <div style={premiumStyles.appCardIcon}>{app.icon}</div>
                <h3 style={premiumStyles.appCardName}>{app.name}</h3>
              </div>
              <p style={premiumStyles.appCardDesc}>{app.desc}</p>
              <div style={premiumStyles.appFeatureList}>
                {app.features.map((feature, i) => (
                  <span key={i} style={premiumStyles.appFeatureTag}>{feature}</span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={premiumStyles.sectionDivider} />

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2.5: ADVANCED APPS (Full Stack Production Apps)
          ═══════════════════════════════════════════════════════════════ */}
      <div>
        <div style={premiumStyles.sectionHeader}>
          <span style={premiumStyles.sectionIcon}>🚀</span>
          <h2 style={premiumStyles.sectionTitle}>Advanced Apps</h2>
        </div>
        <p style={premiumStyles.sectionSubtitle}>Full-stack production apps with authentication, databases, and admin panels</p>

        {/* Featured Card for Advanced Apps */}
        <button
          style={premiumStyles.advancedFeaturedCard}
          onClick={() => onSelect('app-advanced')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(236, 72, 153, 0.25)';
            e.currentTarget.querySelector('.arrow').style.transform = 'translateX(8px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.querySelector('.arrow').style.transform = 'translateX(0)';
          }}
        >
          <div style={premiumStyles.advancedIconContainer}>⚡</div>
          <div style={premiumStyles.featuredContent}>
            <div style={premiumStyles.advancedBadge}>FULL STACK</div>
            <h2 style={premiumStyles.featuredTitle}>Production-Ready Apps</h2>
            <p style={premiumStyles.featuredDesc}>Complete projects with backend, database, and authentication</p>
            <p style={premiumStyles.featuredDetails}>
              Generate full React + Node.js applications with user management,
              admin dashboards, and Docker deployment. Estimated cost: $0.30-0.50
            </p>
          </div>
          <div className="arrow" style={premiumStyles.advancedArrow}>→</div>
        </button>

        {/* Advanced App Templates */}
        <p style={{...premiumStyles.sectionSubtitle, marginBottom: '16px', marginTop: '8px'}}>
          Available templates:
        </p>
        <div style={premiumStyles.advancedGrid}>
          {/* Loyalty Program Card */}
          <button
            style={premiumStyles.advancedCard}
            onClick={() => onSelect('app-advanced-template', 'loyalty-program')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.5)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(236, 72, 153, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.25)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={premiumStyles.fullStackBadge}>FULL STACK</div>
            <div style={premiumStyles.advancedCardHeader}>
              <div style={premiumStyles.advancedCardIcon}>🏆</div>
              <h3 style={premiumStyles.advancedCardName}>Loyalty Program</h3>
            </div>
            <p style={premiumStyles.advancedCardDesc}>
              Complete customer loyalty system with points, tiers, and rewards tracking
            </p>
            <div style={premiumStyles.advancedFeatureList}>
              <span style={premiumStyles.advancedFeatureTag}>User Auth</span>
              <span style={premiumStyles.advancedFeatureTag}>Points System</span>
              <span style={premiumStyles.advancedFeatureTag}>Reward Tiers</span>
              <span style={premiumStyles.advancedFeatureTag}>Admin Dashboard</span>
              <span style={premiumStyles.advancedFeatureTag}>SQLite DB</span>
            </div>
            <div style={premiumStyles.advancedCostBadge}>
              <span>💰</span> ~$0.30-0.50
            </div>
          </button>

          {/* Appointment Booking Card */}
          <button
            style={premiumStyles.advancedCard}
            onClick={() => onSelect('app-advanced-template', 'appointment-booking')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.5)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(236, 72, 153, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.25)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={premiumStyles.fullStackBadge}>FULL STACK</div>
            <div style={premiumStyles.advancedCardHeader}>
              <div style={premiumStyles.advancedCardIcon}>📅</div>
              <h3 style={premiumStyles.advancedCardName}>Appointment Booking</h3>
            </div>
            <p style={premiumStyles.advancedCardDesc}>
              Online booking system with calendar, staff scheduling, and customer management
            </p>
            <div style={premiumStyles.advancedFeatureList}>
              <span style={premiumStyles.advancedFeatureTag}>Online Booking</span>
              <span style={premiumStyles.advancedFeatureTag}>Calendar View</span>
              <span style={premiumStyles.advancedFeatureTag}>Staff Schedules</span>
              <span style={premiumStyles.advancedFeatureTag}>Admin Dashboard</span>
              <span style={premiumStyles.advancedFeatureTag}>SQLite DB</span>
            </div>
            <div style={premiumStyles.advancedCostBadge}>
              <span>💰</span> ~$0.30-0.50
            </div>
          </button>

          {/* Admin Dashboard Card */}
          <button
            style={premiumStyles.advancedCard}
            onClick={() => onSelect('app-advanced-template', 'admin-dashboard')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.5)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(236, 72, 153, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.25)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={premiumStyles.fullStackBadge}>FULL STACK</div>
            <div style={premiumStyles.advancedCardHeader}>
              <div style={premiumStyles.advancedCardIcon}>🎛️</div>
              <h3 style={premiumStyles.advancedCardName}>Admin Dashboard</h3>
            </div>
            <p style={premiumStyles.advancedCardDesc}>
              Universal command center - manage customers, analytics, and connected apps
            </p>
            <div style={premiumStyles.advancedFeatureList}>
              <span style={premiumStyles.advancedFeatureTag}>Command Center</span>
              <span style={premiumStyles.advancedFeatureTag}>Customer CRM</span>
              <span style={premiumStyles.advancedFeatureTag}>Analytics</span>
              <span style={premiumStyles.advancedFeatureTag}>App Integrations</span>
              <span style={premiumStyles.advancedFeatureTag}>SQLite DB</span>
            </div>
            <div style={premiumStyles.advancedCostBadge}>
              <span>💰</span> ~$0.40-0.60
            </div>
          </button>
        </div>
      </div>

      {/* Divider */}
      <div style={premiumStyles.sectionDivider} />

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3: BUILD A TOOL SUITE
          ═══════════════════════════════════════════════════════════════ */}
      <div>
        <div style={premiumStyles.sectionHeader}>
          <span style={premiumStyles.sectionIcon}>🛠️</span>
          <h2 style={premiumStyles.sectionTitle}>Build a Tool Suite</h2>
        </div>
        <p style={premiumStyles.sectionSubtitle}>Multi-tool dashboards tailored to your business</p>

        {/* Featured GUIDED Card for Tool Suites */}
        <button
          style={premiumStyles.toolSuiteFeaturedCard}
          onClick={() => onSelect('tool-suite-guided')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(249, 115, 22, 0.25)';
            e.currentTarget.querySelector('.arrow').style.transform = 'translateX(8px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.querySelector('.arrow').style.transform = 'translateX(0)';
          }}
        >
          <div style={premiumStyles.toolSuiteIconContainer}>📦</div>
          <div style={premiumStyles.featuredContent}>
            <div style={premiumStyles.toolSuiteBadge}>RECOMMENDED</div>
            <h2 style={premiumStyles.featuredTitle}>GUIDED</h2>
            <p style={premiumStyles.featuredDesc}>Pick a pre-made business bundle</p>
            <p style={premiumStyles.featuredDetails}>
              Choose from curated tool packs designed for specific industries.
              Freelancers, restaurants, fitness, real estate, and more.
            </p>
          </div>
          <div className="arrow" style={premiumStyles.toolSuiteArrow}>→</div>
        </button>

        {/* Secondary Mode Cards for Tool Suites */}
        <div style={premiumStyles.secondaryGridTwo}>
          {/* INSTANT - AI picks tools */}
          <button
            style={{...premiumStyles.secondaryCard, ...premiumStyles.instantCard}}
            onClick={() => onSelect('tool-suite-instant')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={premiumStyles.secondaryIcon}>🚀</div>
            <div style={{...premiumStyles.secondaryBadge, background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff'}}>
              AI-POWERED
            </div>
            <h3 style={premiumStyles.secondaryTitle}>INSTANT</h3>
            <p style={premiumStyles.secondaryDesc}>Describe your business, AI picks the tools</p>
          </button>

          {/* CUSTOM - Mix and match */}
          <button
            style={{...premiumStyles.secondaryCard, ...premiumStyles.customCard}}
            onClick={() => onSelect('tool-suite-custom')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={premiumStyles.secondaryIcon}>🧩</div>
            <div style={{...premiumStyles.secondaryBadge, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff'}}>
              MIX & MATCH
            </div>
            <h3 style={premiumStyles.secondaryTitle}>CUSTOM</h3>
            <p style={premiumStyles.secondaryDesc}>Pick individual tools yourself</p>
          </button>
        </div>

        {/* Business Bundle Grid */}
        <p style={{...premiumStyles.sectionSubtitle, marginBottom: '16px', marginTop: '8px'}}>
          Or quick-select a bundle:
        </p>
        <div style={premiumStyles.bundleGrid}>
          {toolBundles.map(bundle => (
            <button
              key={bundle.id}
              style={{
                ...premiumStyles.bundleCard,
                borderColor: `${bundle.color}30`,
              }}
              onClick={() => onSelect('tool-suite-bundle', bundle.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = `${bundle.color}60`;
                e.currentTarget.style.background = `${bundle.color}10`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = `${bundle.color}30`;
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              }}
            >
              {bundle.popular && <div style={premiumStyles.bundlePopularBadge}>POPULAR</div>}
              <div style={premiumStyles.bundleIcon}>{bundle.icon}</div>
              <h3 style={premiumStyles.bundleName}>{bundle.name}</h3>
              <p style={premiumStyles.bundleDesc}>{bundle.desc}</p>
              <div style={premiumStyles.bundleToolCount}>
                <span>🔧</span> {bundle.tools.length} tools included
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 4: BROWSE INDIVIDUAL TOOLS (Collapsible)
          ═══════════════════════════════════════════════════════════════ */}
      <div
        style={premiumStyles.individualToolsHeader}
        onClick={() => setShowIndividualTools(!showIndividualTools)}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
        }}
      >
        <div style={premiumStyles.individualToolsTitle}>
          <span style={premiumStyles.sectionIcon}>🔧</span>
          <div>
            <h3 style={{...premiumStyles.sectionTitle, fontSize: '1.1rem'}}>Browse Individual Tools</h3>
            <p style={{...premiumStyles.sectionSubtitle, marginBottom: 0, fontSize: '0.85rem'}}>
              Just need one quick tool? Browse our library
            </p>
          </div>
        </div>
        <div style={{
          ...premiumStyles.individualToolsArrow,
          transform: showIndividualTools ? 'rotate(180deg)' : 'rotate(0deg)'
        }}>
          ▼
        </div>
      </div>

      {showIndividualTools && (
        <div>
          <div style={premiumStyles.toolLibraryHeader}>
            <div style={premiumStyles.toolFilters}>
              {[
                { id: 'all', label: 'All' },
                { id: 'popular', label: '⭐ Popular' },
                { id: 'developer', label: '👨‍💻 Developer' },
                { id: 'business', label: 'Business' },
                { id: 'utilities', label: 'Utilities' },
                { id: 'calculators', label: 'Calculators' },
                { id: 'converters', label: 'Converters' },
                { id: 'lifestyle', label: 'Lifestyle' },
              ].map(filter => (
                <button
                  key={filter.id}
                  style={{
                    ...premiumStyles.filterButton,
                    ...(toolFilter === filter.id ? premiumStyles.filterButtonActive : {})
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setToolFilter(filter.id);
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div style={premiumStyles.toolGrid}>
            {filteredTools.map(tool => (
              <button
                key={tool.id}
                style={premiumStyles.toolCard}
                onClick={() => onSelect('tool', tool.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                }}
              >
                {tool.popular && <div style={premiumStyles.popularBadge}>POPULAR</div>}
                <div style={premiumStyles.toolIcon}>{tool.icon}</div>
                <h3 style={premiumStyles.toolName}>{tool.name}</h3>
                <p style={premiumStyles.toolDesc}>{tool.desc}</p>
              </button>
            ))}

            {/* Custom Tool Card */}
            <button
              style={{...premiumStyles.toolCard, ...premiumStyles.customToolCard}}
              onClick={() => onSelect('tool-custom')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(168, 85, 247, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={premiumStyles.customToolBadge}>AI</div>
              <div style={premiumStyles.toolIcon}>✨</div>
              <h3 style={premiumStyles.toolName}>Custom Tool</h3>
              <p style={premiumStyles.toolDesc}>Describe any tool</p>
            </button>
          </div>
        </div>
      )}

      <p style={premiumStyles.bottomHint}>
        💡 New here? Start with <strong>GUIDED</strong> in either section for the best experience.
      </p>

      {/* Start Fresh / Setup Wizard Button */}
      <button
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          margin: '24px auto 0',
          padding: '12px 28px',
          background: 'transparent',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '12px',
          color: '#a5b4fc',
          fontSize: '0.9rem',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onClick={() => onSelect('setup-wizard')}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
        }}
      >
        <span>🎯</span> Start New Project with Setup Wizard
      </button>
    </div>
  );
}
