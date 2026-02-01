/**
 * Social Media Setup Wizard
 * Initial onboarding wizard for setting up social media management operations
 *
 * Steps:
 * 1. Welcome - Introduction to the social media platform
 * 2. Platforms - Which social networks to manage
 * 3. Business Info - Brand and business details
 * 4. Content Strategy - Content types and posting preferences
 * 5. Scheduling - Posting schedule and automation
 * 6. Review - Summary and launch
 */

import React, { useState, useEffect } from 'react';
import { WizardBreadcrumb, CollapsibleSection } from './wizard';
import SocialMediaAssistant from './SocialMediaAssistant';

const STEPS = [
  { id: 'welcome', name: 'Welcome', icon: '👋' },
  { id: 'platforms', name: 'Platforms', icon: '📱' },
  { id: 'business', name: 'Business', icon: '🏢' },
  { id: 'content', name: 'Content', icon: '📝' },
  { id: 'scheduling', name: 'Scheduling', icon: '📅' },
  { id: 'review', name: 'Review', icon: '✅' }
];

const PLATFORM_OPTIONS = [
  {
    id: 'instagram',
    icon: '📸',
    name: 'Instagram',
    desc: 'Photo & video sharing, Stories, Reels',
    features: ['Feed posts', 'Stories', 'Reels', 'Carousels'],
    color: '#E4405F',
    recommended: true
  },
  {
    id: 'tiktok',
    icon: '🎵',
    name: 'TikTok',
    desc: 'Short-form video content',
    features: ['Videos', 'Duets', 'Trends', 'Sounds'],
    color: '#000000'
  },
  {
    id: 'facebook',
    icon: '📘',
    name: 'Facebook',
    desc: 'Social networking, Groups, Pages',
    features: ['Posts', 'Stories', 'Events', 'Groups'],
    color: '#1877F2'
  },
  {
    id: 'twitter',
    icon: '🐦',
    name: 'X / Twitter',
    desc: 'Microblogging and real-time updates',
    features: ['Tweets', 'Threads', 'Spaces', 'Polls'],
    color: '#1DA1F2'
  },
  {
    id: 'linkedin',
    icon: '💼',
    name: 'LinkedIn',
    desc: 'Professional networking and B2B',
    features: ['Posts', 'Articles', 'Newsletters', 'Events'],
    color: '#0A66C2'
  },
  {
    id: 'youtube',
    icon: '▶️',
    name: 'YouTube',
    desc: 'Long-form video content and Shorts',
    features: ['Videos', 'Shorts', 'Livestreams', 'Community'],
    color: '#FF0000'
  },
  {
    id: 'pinterest',
    icon: '📌',
    name: 'Pinterest',
    desc: 'Visual discovery and inspiration',
    features: ['Pins', 'Boards', 'Idea Pins', 'Shopping'],
    color: '#E60023'
  },
  {
    id: 'threads',
    icon: '🧵',
    name: 'Threads',
    desc: 'Text-based conversations',
    features: ['Posts', 'Replies', 'Reposts', 'Quotes'],
    color: '#000000'
  }
];

const CONTENT_TYPES = [
  { id: 'educational', icon: '📚', name: 'Educational', desc: 'Tips, tutorials, how-tos' },
  { id: 'promotional', icon: '📣', name: 'Promotional', desc: 'Products, services, offers' },
  { id: 'entertainment', icon: '🎭', name: 'Entertainment', desc: 'Fun, engaging, viral content' },
  { id: 'behind-scenes', icon: '🎬', name: 'Behind the Scenes', desc: 'Authentic, personal content' },
  { id: 'user-generated', icon: '👥', name: 'User Generated', desc: 'Reposts, testimonials, reviews' },
  { id: 'news', icon: '📰', name: 'News & Updates', desc: 'Industry news, announcements' }
];

const AUDIENCE_TYPES = [
  { id: 'gen-z', name: 'Gen Z', desc: '18-24 years', icon: '🎮' },
  { id: 'millennials', name: 'Millennials', desc: '25-40 years', icon: '💻' },
  { id: 'gen-x', name: 'Gen X', desc: '41-56 years', icon: '📺' },
  { id: 'boomers', name: 'Boomers', desc: '57-75 years', icon: '📻' },
  { id: 'mixed', name: 'Mixed', desc: 'All demographics', icon: '🌍' }
];

const POSTING_FREQUENCIES = [
  { id: 'daily', name: 'Daily', desc: '1-2 posts per day' },
  { id: 'multiple-daily', name: 'Multiple Daily', desc: '3+ posts per day' },
  { id: '3x-week', name: '3x Per Week', desc: 'Regular but balanced' },
  { id: 'weekly', name: 'Weekly', desc: 'Quality over quantity' }
];

const BEST_TIMES = [
  { id: 'auto', name: 'Auto-optimize', desc: 'AI determines best times', icon: '🤖' },
  { id: 'morning', name: 'Morning', desc: '6 AM - 12 PM', icon: '🌅' },
  { id: 'afternoon', name: 'Afternoon', desc: '12 PM - 5 PM', icon: '☀️' },
  { id: 'evening', name: 'Evening', desc: '5 PM - 9 PM', icon: '🌆' },
  { id: 'custom', name: 'Custom Times', desc: 'Set specific hours', icon: '⏰' }
];

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '80vh',
    maxWidth: '900px',
    margin: '0 auto',
    padding: '32px 24px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  stepIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  stepDot: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '2px solid rgba(255, 255, 255, 0.15)',
    color: '#666',
    transition: 'all 0.3s ease'
  },
  stepDotActive: {
    background: 'rgba(236, 72, 153, 0.2)',
    borderColor: '#ec4899',
    color: '#f9a8d4',
    boxShadow: '0 0 0 4px rgba(236, 72, 153, 0.15)'
  },
  stepDotComplete: {
    background: 'rgba(34, 197, 94, 0.2)',
    borderColor: '#22c55e',
    color: '#22c55e'
  },
  stepLine: {
    width: '32px',
    height: '2px',
    background: 'rgba(255, 255, 255, 0.1)'
  },
  stepLineComplete: {
    background: '#22c55e'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '8px',
    background: 'linear-gradient(135deg, #fff 0%, #f9a8d4 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#888',
    marginBottom: '0'
  },
  content: {
    flex: 1,
    marginBottom: '24px'
  },
  section: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '28px',
    marginBottom: '20px'
  },
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  // Welcome step styles
  welcomeHero: {
    textAlign: 'center',
    padding: '40px 20px'
  },
  welcomeIcon: {
    fontSize: '4rem',
    marginBottom: '20px',
    display: 'block'
  },
  welcomeTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '16px',
    background: 'linear-gradient(135deg, #fff 0%, #f9a8d4 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  welcomeDesc: {
    fontSize: '1.15rem',
    color: '#888',
    maxWidth: '600px',
    margin: '0 auto 32px auto',
    lineHeight: 1.6
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginTop: '32px'
  },
  featureCard: {
    padding: '24px 20px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '14px',
    textAlign: 'center'
  },
  featureIcon: {
    fontSize: '2rem',
    marginBottom: '12px',
    display: 'block'
  },
  featureTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '6px'
  },
  featureDesc: {
    fontSize: '0.85rem',
    color: '#888',
    margin: 0
  },
  // Platform cards
  platformGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px'
  },
  platformCard: {
    position: 'relative',
    padding: '20px 16px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '2px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center'
  },
  platformCardSelected: {
    borderColor: '#ec4899',
    background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.12), rgba(168, 85, 247, 0.08))',
    boxShadow: '0 0 0 1px rgba(236, 72, 153, 0.3), 0 8px 24px rgba(236, 72, 153, 0.2)'
  },
  platformIcon: {
    fontSize: '2rem',
    marginBottom: '10px',
    display: 'block'
  },
  platformName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '4px'
  },
  platformDesc: {
    fontSize: '0.7rem',
    color: '#888'
  },
  platformCheck: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '20px',
    height: '20px',
    background: 'linear-gradient(135deg, #ec4899, #a855f7)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    color: '#fff'
  },
  recommendedBadge: {
    position: 'absolute',
    top: '-10px',
    right: '8px',
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: '#fff',
    padding: '4px 10px',
    borderRadius: '10px',
    fontSize: '8px',
    fontWeight: '700',
    letterSpacing: '0.5px'
  },
  // Input styles
  inputGroup: {
    marginBottom: '20px'
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#aaa',
    marginBottom: '8px',
    display: 'block'
  },
  required: {
    color: '#ef4444',
    marginLeft: '4px'
  },
  input: {
    width: '100%',
    padding: '14px 18px',
    fontSize: '1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#fff',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box'
  },
  inputHint: {
    fontSize: '0.8rem',
    color: '#666',
    marginTop: '8px',
    fontStyle: 'italic'
  },
  inputRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  textarea: {
    width: '100%',
    padding: '14px 18px',
    fontSize: '1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#fff',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
    resize: 'vertical',
    minHeight: '80px',
    fontFamily: 'inherit'
  },
  // Content type selection
  contentTypeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px'
  },
  contentTypeCard: {
    position: 'relative',
    padding: '18px 16px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '2px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center'
  },
  contentTypeSelected: {
    borderColor: '#ec4899',
    background: 'rgba(236, 72, 153, 0.1)'
  },
  contentTypeIcon: {
    fontSize: '1.8rem',
    marginBottom: '10px',
    display: 'block'
  },
  contentTypeName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '4px'
  },
  contentTypeDesc: {
    fontSize: '0.7rem',
    color: '#888'
  },
  contentTypeCheck: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '18px',
    height: '18px',
    background: 'linear-gradient(135deg, #ec4899, #a855f7)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    color: '#fff'
  },
  // Audience selection
  audienceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '12px',
    marginBottom: '24px'
  },
  audienceCard: {
    padding: '16px 12px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '2px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center'
  },
  audienceSelected: {
    borderColor: '#ec4899',
    background: 'rgba(236, 72, 153, 0.1)'
  },
  audienceIcon: {
    fontSize: '1.5rem',
    marginBottom: '8px',
    display: 'block'
  },
  audienceName: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '2px'
  },
  audienceDesc: {
    fontSize: '0.7rem',
    color: '#888'
  },
  // Frequency selection
  frequencyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '24px'
  },
  frequencyCard: {
    padding: '18px 16px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '2px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  frequencySelected: {
    borderColor: '#ec4899',
    background: 'rgba(236, 72, 153, 0.1)'
  },
  frequencyRadio: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  frequencyRadioSelected: {
    borderColor: '#ec4899',
    background: '#ec4899'
  },
  frequencyContent: {
    flex: 1
  },
  frequencyName: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '2px'
  },
  frequencyDesc: {
    fontSize: '0.8rem',
    color: '#888'
  },
  // Best times grid
  timesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '10px'
  },
  timeCard: {
    padding: '14px 10px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '2px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center'
  },
  timeSelected: {
    borderColor: '#ec4899',
    background: 'rgba(236, 72, 153, 0.1)'
  },
  timeIcon: {
    fontSize: '1.3rem',
    marginBottom: '6px',
    display: 'block'
  },
  timeName: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '2px'
  },
  timeDesc: {
    fontSize: '0.65rem',
    color: '#888'
  },
  // Review step styles
  reviewSection: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px'
  },
  reviewTitle: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#ec4899',
    marginBottom: '14px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  reviewItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
  },
  reviewLabel: {
    fontSize: '0.9rem',
    color: '#888'
  },
  reviewValue: {
    fontSize: '0.9rem',
    color: '#fff',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  reviewTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    justifyContent: 'flex-end'
  },
  reviewTag: {
    padding: '4px 10px',
    background: 'rgba(236, 72, 153, 0.15)',
    borderRadius: '8px',
    fontSize: '0.75rem',
    color: '#f9a8d4'
  },
  readyBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px 24px',
    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.1))',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    borderRadius: '14px',
    marginTop: '20px'
  },
  readyIcon: {
    fontSize: '2.5rem'
  },
  readyContent: {
    flex: 1
  },
  readyTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#22c55e',
    marginBottom: '4px'
  },
  readyDesc: {
    fontSize: '0.9rem',
    color: '#888',
    margin: 0
  },
  // Actions
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)'
  },
  backBtn: {
    padding: '14px 28px',
    fontSize: '0.95rem',
    background: 'transparent',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    cursor: 'pointer',
    color: '#888',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  nextBtn: {
    padding: '14px 36px',
    fontSize: '1rem',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 14px rgba(236, 72, 153, 0.35)'
  },
  nextBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  launchBtn: {
    padding: '16px 44px',
    fontSize: '1.1rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)'
  },
  skipBtn: {
    padding: '8px 16px',
    fontSize: '0.85rem',
    background: 'transparent',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    textDecoration: 'underline'
  }
};

export function SocialMediaSetupWizard({
  onComplete,
  onSkip,
  onBack,
  initialData = {}
}) {
  const [currentStep, setCurrentStep] = useState(0);

  // Wizard state
  const [platforms, setPlatforms] = useState(initialData.platforms || ['instagram']);
  const [brandName, setBrandName] = useState(initialData.brandName || '');
  const [industry, setIndustry] = useState(initialData.industry || '');
  const [website, setWebsite] = useState(initialData.website || '');
  const [brandVoice, setBrandVoice] = useState(initialData.brandVoice || '');
  const [contentTypes, setContentTypes] = useState(initialData.contentTypes || ['educational']);
  const [targetAudience, setTargetAudience] = useState(initialData.targetAudience || 'mixed');
  const [postingFrequency, setPostingFrequency] = useState(initialData.postingFrequency || 'daily');
  const [bestTimes, setBestTimes] = useState(initialData.bestTimes || 'auto');
  const [enableAI, setEnableAI] = useState(initialData.enableAI !== false);
  const [enableAnalytics, setEnableAnalytics] = useState(initialData.enableAnalytics !== false);
  const [enableAutoHashtags, setEnableAutoHashtags] = useState(initialData.enableAutoHashtags !== false);

  // Hover states
  const [hoveredPlatform, setHoveredPlatform] = useState(null);
  const [hoveredContent, setHoveredContent] = useState(null);

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Welcome
        return true;
      case 1: // Platforms
        return platforms.length > 0;
      case 2: // Business
        return brandName.trim().length > 0;
      case 3: // Content
        return contentTypes.length > 0 && targetAudience !== null;
      case 4: // Scheduling
        return postingFrequency !== null && bestTimes !== null;
      case 5: // Review
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else if (onBack) {
      onBack();
    }
  };

  const togglePlatform = (platformId) => {
    setPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const toggleContentType = (typeId) => {
    setContentTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    );
  };

  const handleComplete = () => {
    const setupData = {
      platforms,
      brandName,
      industry,
      website,
      brandVoice,
      contentTypes,
      targetAudience,
      postingFrequency,
      bestTimes,
      enableAI,
      enableAnalytics,
      enableAutoHashtags,
      completedAt: new Date().toISOString()
    };

    // Save to localStorage for persistence
    localStorage.setItem('social_media_setup_complete', 'true');
    localStorage.setItem('social_media_setup_data', JSON.stringify(setupData));

    if (onComplete) {
      onComplete(setupData);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderWelcomeStep();
      case 1:
        return renderPlatformsStep();
      case 2:
        return renderBusinessStep();
      case 3:
        return renderContentStep();
      case 4:
        return renderSchedulingStep();
      case 5:
        return renderReviewStep();
      default:
        return null;
    }
  };

  const renderWelcomeStep = () => (
    <div style={styles.welcomeHero}>
      <span style={styles.welcomeIcon}>📱</span>
      <h1 style={styles.welcomeTitle}>Social Media Hub</h1>
      <p style={styles.welcomeDesc}>
        Manage all your social media accounts from one place. Schedule posts,
        generate AI-powered content, and track performance across platforms.
      </p>

      <div style={styles.featureGrid}>
        <div style={styles.featureCard}>
          <span style={styles.featureIcon}>📅</span>
          <div style={styles.featureTitle}>Smart Scheduling</div>
          <p style={styles.featureDesc}>AI-optimized posting times for max engagement</p>
        </div>
        <div style={styles.featureCard}>
          <span style={styles.featureIcon}>✨</span>
          <div style={styles.featureTitle}>AI Content</div>
          <p style={styles.featureDesc}>Generate captions, hashtags, and ideas instantly</p>
        </div>
        <div style={styles.featureCard}>
          <span style={styles.featureIcon}>📊</span>
          <div style={styles.featureTitle}>Analytics</div>
          <p style={styles.featureDesc}>Track growth and engagement across all platforms</p>
        </div>
      </div>
    </div>
  );

  const renderPlatformsStep = () => (
    <div>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>📱</span> Select your social media platforms
        </div>
        <p style={{ color: '#888', marginBottom: '20px', marginTop: '-10px' }}>
          Choose the platforms you want to manage. You can add more later.
        </p>

        <div style={styles.platformGrid}>
          {PLATFORM_OPTIONS.map(platform => (
            <div
              key={platform.id}
              style={{
                ...styles.platformCard,
                ...(platforms.includes(platform.id) ? styles.platformCardSelected : {}),
                ...(hoveredPlatform === platform.id && !platforms.includes(platform.id) ? {
                  borderColor: `${platform.color}60`,
                  background: `${platform.color}08`,
                  transform: 'translateY(-2px)'
                } : {})
              }}
              onClick={() => togglePlatform(platform.id)}
              onMouseEnter={() => setHoveredPlatform(platform.id)}
              onMouseLeave={() => setHoveredPlatform(null)}
            >
              {platform.recommended && (
                <div style={styles.recommendedBadge}>POPULAR</div>
              )}
              {platforms.includes(platform.id) && (
                <div style={styles.platformCheck}>✓</div>
              )}
              <span style={styles.platformIcon}>{platform.icon}</span>
              <div style={styles.platformName}>{platform.name}</div>
              <div style={styles.platformDesc}>{platform.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBusinessStep = () => (
    <div>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>🏢</span> Tell us about your brand
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Brand / Business Name
            <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Acme Corp, My Personal Brand"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            style={styles.input}
            autoFocus
          />
          <div style={styles.inputHint}>
            This will be used for personalized content suggestions
          </div>
        </div>

        <div style={styles.inputRow}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Industry (optional)</label>
            <input
              type="text"
              placeholder="e.g., Fashion, Tech, Food, Fitness"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Website (optional)</label>
            <input
              type="url"
              placeholder="e.g., https://yoursite.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Brand Voice (optional)</label>
          <textarea
            placeholder="Describe your brand's tone and personality. e.g., Professional yet friendly, witty and playful, inspiring and motivational..."
            value={brandVoice}
            onChange={(e) => setBrandVoice(e.target.value)}
            style={styles.textarea}
          />
          <div style={styles.inputHint}>
            This helps AI generate content that matches your brand's personality
          </div>
        </div>
      </div>
    </div>
  );

  const renderContentStep = () => (
    <div>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>📝</span> What type of content will you share?
        </div>
        <p style={{ color: '#888', marginBottom: '20px', marginTop: '-10px' }}>
          Select all that apply. This helps us suggest content ideas.
        </p>

        <div style={styles.contentTypeGrid}>
          {CONTENT_TYPES.map(type => (
            <div
              key={type.id}
              style={{
                ...styles.contentTypeCard,
                ...(contentTypes.includes(type.id) ? styles.contentTypeSelected : {}),
                ...(hoveredContent === type.id && !contentTypes.includes(type.id) ? {
                  borderColor: 'rgba(236, 72, 153, 0.4)',
                  transform: 'translateY(-2px)'
                } : {})
              }}
              onClick={() => toggleContentType(type.id)}
              onMouseEnter={() => setHoveredContent(type.id)}
              onMouseLeave={() => setHoveredContent(null)}
            >
              {contentTypes.includes(type.id) && (
                <div style={styles.contentTypeCheck}>✓</div>
              )}
              <span style={styles.contentTypeIcon}>{type.icon}</span>
              <div style={styles.contentTypeName}>{type.name}</div>
              <div style={styles.contentTypeDesc}>{type.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>👥</span> Who is your target audience?
        </div>

        <div style={styles.audienceGrid}>
          {AUDIENCE_TYPES.map(audience => (
            <div
              key={audience.id}
              style={{
                ...styles.audienceCard,
                ...(targetAudience === audience.id ? styles.audienceSelected : {})
              }}
              onClick={() => setTargetAudience(audience.id)}
            >
              <span style={styles.audienceIcon}>{audience.icon}</span>
              <div style={styles.audienceName}>{audience.name}</div>
              <div style={styles.audienceDesc}>{audience.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSchedulingStep = () => (
    <div>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>📅</span> How often do you want to post?
        </div>

        <div style={styles.frequencyGrid}>
          {POSTING_FREQUENCIES.map(freq => (
            <div
              key={freq.id}
              style={{
                ...styles.frequencyCard,
                ...(postingFrequency === freq.id ? styles.frequencySelected : {})
              }}
              onClick={() => setPostingFrequency(freq.id)}
            >
              <div style={{
                ...styles.frequencyRadio,
                ...(postingFrequency === freq.id ? styles.frequencyRadioSelected : {})
              }}>
                {postingFrequency === freq.id && (
                  <span style={{ color: '#fff', fontSize: '10px' }}>✓</span>
                )}
              </div>
              <div style={styles.frequencyContent}>
                <div style={styles.frequencyName}>{freq.name}</div>
                <div style={styles.frequencyDesc}>{freq.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>⏰</span> Best posting times
        </div>

        <div style={styles.timesGrid}>
          {BEST_TIMES.map(time => (
            <div
              key={time.id}
              style={{
                ...styles.timeCard,
                ...(bestTimes === time.id ? styles.timeSelected : {})
              }}
              onClick={() => setBestTimes(time.id)}
            >
              <span style={styles.timeIcon}>{time.icon}</span>
              <div style={styles.timeName}>{time.name}</div>
              <div style={styles.timeDesc}>{time.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>⚙️</span> Smart Features
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            padding: '14px 18px',
            background: enableAI ? 'rgba(236, 72, 153, 0.1)' : 'transparent',
            border: '1px solid',
            borderColor: enableAI ? 'rgba(236, 72, 153, 0.3)' : 'rgba(255,255,255,0.1)',
            borderRadius: '10px',
            transition: 'all 0.2s ease'
          }}>
            <input
              type="checkbox"
              checked={enableAI}
              onChange={(e) => setEnableAI(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: '#ec4899' }}
            />
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: '500', color: '#fff' }}>
                Enable AI Content Generation
              </div>
              <div style={{ fontSize: '0.8rem', color: '#888' }}>
                Get AI-powered captions, post ideas, and content suggestions
              </div>
            </div>
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            padding: '14px 18px',
            background: enableAutoHashtags ? 'rgba(236, 72, 153, 0.1)' : 'transparent',
            border: '1px solid',
            borderColor: enableAutoHashtags ? 'rgba(236, 72, 153, 0.3)' : 'rgba(255,255,255,0.1)',
            borderRadius: '10px',
            transition: 'all 0.2s ease'
          }}>
            <input
              type="checkbox"
              checked={enableAutoHashtags}
              onChange={(e) => setEnableAutoHashtags(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: '#ec4899' }}
            />
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: '500', color: '#fff' }}>
                Auto-generate Hashtags
              </div>
              <div style={{ fontSize: '0.8rem', color: '#888' }}>
                Automatically suggest relevant hashtags for each post
              </div>
            </div>
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            padding: '14px 18px',
            background: enableAnalytics ? 'rgba(236, 72, 153, 0.1)' : 'transparent',
            border: '1px solid',
            borderColor: enableAnalytics ? 'rgba(236, 72, 153, 0.3)' : 'rgba(255,255,255,0.1)',
            borderRadius: '10px',
            transition: 'all 0.2s ease'
          }}>
            <input
              type="checkbox"
              checked={enableAnalytics}
              onChange={(e) => setEnableAnalytics(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: '#ec4899' }}
            />
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: '500', color: '#fff' }}>
                Enable Analytics Tracking
              </div>
              <div style={{ fontSize: '0.8rem', color: '#888' }}>
                Track engagement, reach, and follower growth across platforms
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => {
    const selectedPlatforms = PLATFORM_OPTIONS.filter(p => platforms.includes(p.id));
    const selectedContentTypes = CONTENT_TYPES.filter(t => contentTypes.includes(t.id));
    const selectedAudience = AUDIENCE_TYPES.find(a => a.id === targetAudience);
    const selectedFrequency = POSTING_FREQUENCIES.find(f => f.id === postingFrequency);
    const selectedTimes = BEST_TIMES.find(t => t.id === bestTimes);

    return (
      <div>
        <div style={styles.reviewSection}>
          <div style={styles.reviewTitle}>Brand Information</div>
          <div style={styles.reviewItem}>
            <span style={styles.reviewLabel}>Brand Name</span>
            <span style={styles.reviewValue}>{brandName}</span>
          </div>
          {industry && (
            <div style={styles.reviewItem}>
              <span style={styles.reviewLabel}>Industry</span>
              <span style={styles.reviewValue}>{industry}</span>
            </div>
          )}
          {website && (
            <div style={styles.reviewItem}>
              <span style={styles.reviewLabel}>Website</span>
              <span style={styles.reviewValue}>{website}</span>
            </div>
          )}
        </div>

        <div style={styles.reviewSection}>
          <div style={styles.reviewTitle}>Connected Platforms</div>
          <div style={{ ...styles.reviewItem, borderBottom: 'none' }}>
            <span style={styles.reviewLabel}>Platforms</span>
            <div style={styles.reviewTags}>
              {selectedPlatforms.map(platform => (
                <span key={platform.id} style={styles.reviewTag}>
                  {platform.icon} {platform.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.reviewSection}>
          <div style={styles.reviewTitle}>Content Strategy</div>
          <div style={styles.reviewItem}>
            <span style={styles.reviewLabel}>Content Types</span>
            <div style={styles.reviewTags}>
              {selectedContentTypes.map(type => (
                <span key={type.id} style={styles.reviewTag}>
                  {type.icon} {type.name}
                </span>
              ))}
            </div>
          </div>
          <div style={styles.reviewItem}>
            <span style={styles.reviewLabel}>Target Audience</span>
            <span style={styles.reviewValue}>
              <span>{selectedAudience?.icon}</span>
              {selectedAudience?.name}
            </span>
          </div>
        </div>

        <div style={styles.reviewSection}>
          <div style={styles.reviewTitle}>Scheduling</div>
          <div style={styles.reviewItem}>
            <span style={styles.reviewLabel}>Posting Frequency</span>
            <span style={styles.reviewValue}>{selectedFrequency?.name}</span>
          </div>
          <div style={styles.reviewItem}>
            <span style={styles.reviewLabel}>Best Times</span>
            <span style={styles.reviewValue}>
              <span>{selectedTimes?.icon}</span>
              {selectedTimes?.name}
            </span>
          </div>
          <div style={styles.reviewItem}>
            <span style={styles.reviewLabel}>AI Content</span>
            <span style={styles.reviewValue}>
              {enableAI ? '✅ Enabled' : '❌ Disabled'}
            </span>
          </div>
          <div style={styles.reviewItem}>
            <span style={styles.reviewLabel}>Auto Hashtags</span>
            <span style={styles.reviewValue}>
              {enableAutoHashtags ? '✅ Enabled' : '❌ Disabled'}
            </span>
          </div>
          <div style={styles.reviewItem}>
            <span style={styles.reviewLabel}>Analytics</span>
            <span style={styles.reviewValue}>
              {enableAnalytics ? '✅ Enabled' : '❌ Disabled'}
            </span>
          </div>
        </div>

        <div style={styles.readyBanner}>
          <span style={styles.readyIcon}>🎉</span>
          <div style={styles.readyContent}>
            <div style={styles.readyTitle}>You're all set!</div>
            <p style={styles.readyDesc}>
              Click "Launch Social Hub" to start managing your social media presence.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header with Step Indicator */}
      <div style={styles.header}>
        <div style={styles.stepIndicator}>
          {STEPS.map((step, idx) => (
            <React.Fragment key={step.id}>
              <div
                style={{
                  ...styles.stepDot,
                  ...(idx === currentStep ? styles.stepDotActive : {}),
                  ...(idx < currentStep ? styles.stepDotComplete : {})
                }}
                title={step.name}
              >
                {idx < currentStep ? '✓' : step.icon}
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  style={{
                    ...styles.stepLine,
                    ...(idx < currentStep ? styles.stepLineComplete : {})
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <h1 style={styles.title}>
          {STEPS[currentStep].icon} {STEPS[currentStep].name}
        </h1>
        <p style={styles.subtitle}>
          {currentStep === 0 && 'Set up your social media command center'}
          {currentStep === 1 && 'Choose your social platforms'}
          {currentStep === 2 && 'Tell us about your brand'}
          {currentStep === 3 && 'Define your content strategy'}
          {currentStep === 4 && 'Configure posting schedule'}
          {currentStep === 5 && 'Review your setup and launch'}
        </p>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {renderStepContent()}
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        <div>
          {currentStep > 0 ? (
            <button style={styles.backBtn} onClick={handleBack}>
              ← Back
            </button>
          ) : onSkip ? (
            <button style={styles.skipBtn} onClick={onSkip}>
              Skip setup
            </button>
          ) : (
            <div />
          )}
        </div>

        {currentStep < STEPS.length - 1 ? (
          <button
            style={{
              ...styles.nextBtn,
              ...(!canProceed() ? styles.nextBtnDisabled : {})
            }}
            onClick={handleNext}
            disabled={!canProceed()}
          >
            Continue <span>→</span>
          </button>
        ) : (
          <button
            style={styles.launchBtn}
            onClick={handleComplete}
          >
            <span>🚀</span> Launch Social Hub
          </button>
        )}
      </div>

      {/* AI Assistant */}
      <SocialMediaAssistant
        currentStep={STEPS[currentStep].id}
        wizardContext={{
          platforms,
          brandName,
          industry,
          website,
          brandVoice,
          contentTypes,
          targetAudience,
          postingFrequency,
          bestTimes,
          enableAI,
          enableAnalytics,
          enableAutoHashtags
        }}
        onSuggestion={(suggestion) => {
          if (suggestion.platforms) setPlatforms(suggestion.platforms);
          if (suggestion.brandName) setBrandName(suggestion.brandName);
          if (suggestion.industry) setIndustry(suggestion.industry);
          if (suggestion.contentTypes) setContentTypes(suggestion.contentTypes);
          if (suggestion.targetAudience) setTargetAudience(suggestion.targetAudience);
          if (suggestion.postingFrequency) setPostingFrequency(suggestion.postingFrequency);
          if (suggestion.bestTimes) setBestTimes(suggestion.bestTimes);
        }}
      />

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .feature-grid {
            grid-template-columns: 1fr !important;
          }
          .platform-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .content-type-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .audience-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          .times-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          .frequency-grid,
          .input-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default SocialMediaSetupWizard;
