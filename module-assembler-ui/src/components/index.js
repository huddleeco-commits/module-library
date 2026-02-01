/**
 * Components Index
 * Re-exports all components for easy importing
 */

export { PasswordGate, DevPasswordModal } from './auth';
export {
  Tooltip,
  CollapsibleSection,
  WizardBreadcrumb,
  WhatYouGetCard,
  IndustryBanner,
  wizardStyles,
  collapsibleStyles,
  tooltipStyles,
  whatYouGetStyles,
  industryBannerStyles
} from './wizard';
export {
  LayoutThumbnail,
  LayoutStyleSelector,
  LivePreviewRenderer,
  layoutSelectorStyles,
  layoutThumbnailStyles,
  livePreviewStyles
} from './layout';

// Full Control Mode components
export { default as ModeSelector } from './ModeSelector.jsx';
export { default as LayoutPicker } from './LayoutPicker.jsx';
export { default as SectionToggles } from './SectionToggles.jsx';
export { default as AIPageChat } from './AIPageChat.jsx';
export { default as PageCustomizer } from './PageCustomizer.jsx';

// CardFlow AI Assistant
export { default as CardFlowAssistant } from './CardFlowAssistant.jsx';

// Customer Service Setup Wizard
export { CustomerServiceSetupWizard, default as CustomerServiceSetupWizardDefault } from './CustomerServiceSetupWizard.jsx';
export { default as CustomerServiceAssistant } from './CustomerServiceAssistant.jsx';

// Social Media Setup Wizard
export { SocialMediaSetupWizard, default as SocialMediaSetupWizardDefault } from './SocialMediaSetupWizard.jsx';
export { default as SocialMediaAssistant } from './SocialMediaAssistant.jsx';

// Chat Widget
export { default as ChatWidget } from './ChatWidget.jsx';

// Dev Tools
export { TestGenerator } from './TestGenerator.jsx';

// Layout Intelligence
export { LayoutSelector } from './LayoutSelector.jsx';

// Content Generation
export { default as ContentGenerator } from './ContentGenerator.jsx';

// Content Scheduling
export { default as ContentScheduler } from './ContentScheduler.jsx';

// Multi-Platform Publishing
export { default as PlatformConnections } from './PlatformConnections.jsx';
export { default as MultiPlatformPublisher } from './MultiPlatformPublisher.jsx';

// Main Platform Dashboard
export { default as MainPlatform } from './MainPlatform.jsx';

// One-Click Deploy
export { default as OneClickDeploy, OneClickDeploy as OneClickDeployNamed } from './OneClickDeploy.jsx';
