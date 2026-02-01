/**
 * BLINK Template Configuration Schema v1.0.0
 *
 * This schema defines the structure for all template configurations in BLINK,
 * supporting business websites, admin dashboards, and SaaS applications.
 */

// =============================================================================
// METADATA
// =============================================================================

/**
 * Template metadata for identification and discovery
 */
export interface TemplateMeta {
  /** Unique template identifier (kebab-case) */
  id: string;
  /** Human-readable template name */
  name: string;
  /** Semantic version (semver) */
  version: string;
  /** Template description */
  description: string;
  /** Template author or organization */
  author?: string;
  /** ISO 8601 creation timestamp */
  createdAt?: string;
  /** ISO 8601 last update timestamp */
  updatedAt?: string;
  /** Template category */
  category: TemplateCategory;
  /** Industries this template supports */
  industries: IndustryType[];
  /** Tags for discovery */
  tags?: string[];
  /** Preview image URL */
  previewImage?: string;
  /** Live demo URL */
  demoUrl?: string;
}

export type TemplateCategory =
  | 'business-website'
  | 'admin-dashboard'
  | 'customer-portal'
  | 'saas-application'
  | 'companion-app'
  | 'landing-page';

export type IndustryType =
  | 'cafe'
  | 'restaurant'
  | 'healthcare'
  | 'fitness'
  | 'salon'
  | 'professional'
  | 'retail'
  | 'realestate'
  | 'automotive'
  | 'education'
  | 'hospitality'
  | 'creative'
  | 'nonprofit'
  | 'technology'
  | 'food-delivery'
  | 'ecommerce'
  | 'universal';

// =============================================================================
// VISUAL SYSTEM
// =============================================================================

/**
 * Complete visual/style configuration
 */
export interface StyleConfig {
  /** Color palette definition */
  colors: ColorPalette;
  /** Typography settings */
  typography: Typography;
  /** Spacing and layout tokens */
  spacing: SpacingTokens;
  /** Visual effects */
  effects: Effects;
  /** Additional CSS custom properties */
  cssVariables?: Record<string, string>;
}

export interface ColorPalette {
  /** Primary brand color */
  primary: string;
  /** Secondary brand color */
  secondary?: string;
  /** Accent/highlight color */
  accent: string;
  /** Main background color */
  background: string;
  /** Alternative backgrounds for contrast */
  backgroundAlt?: string;
  /** Surface color (cards, modals) */
  surface?: string;
  /** Primary text color */
  text: string;
  /** Muted/secondary text color */
  textMuted?: string;
  /** Text on primary color */
  textOnPrimary?: string;
  /** Success state color */
  success?: string;
  /** Warning state color */
  warning?: string;
  /** Error state color */
  error?: string;
  /** Info state color */
  info?: string;
  /** Border color */
  border?: string;
  /** Divider color */
  divider?: string;
}

export interface Typography {
  /** Heading font family */
  headingFont: string;
  /** Body text font family */
  bodyFont: string;
  /** Font weight definitions */
  weights: {
    light?: number;
    normal: number;
    medium?: number;
    semibold?: number;
    bold: number;
  };
  /** Font size scale */
  sizes: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl'?: string;
    '6xl'?: string;
  };
  /** Line height scale */
  lineHeights: {
    tight: string;
    normal: string;
    relaxed: string;
  };
  /** Letter spacing */
  letterSpacing?: {
    tight: string;
    normal: string;
    wide: string;
  };
}

export interface SpacingTokens {
  /** Base spacing unit (e.g., '4px', '0.25rem') */
  unit: string;
  /** Spacing scale multipliers */
  scale: {
    0: string;
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
    8: string;
    10: string;
    12: string;
    16: string;
    20: string;
    24: string;
  };
  /** Section padding */
  sectionPadding: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  /** Container max widths */
  containerMaxWidth: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  /** Border radius tokens */
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
}

export interface Effects {
  /** Box shadow definitions */
  shadows: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  /** Animation/transition settings */
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
  /** Blur effects */
  blur?: {
    sm: string;
    md: string;
    lg: string;
  };
  /** Hover state transformations */
  hoverEffects?: {
    scale?: string;
    lift?: string;
    glow?: string;
  };
}

// =============================================================================
// MOOD SLIDERS (BLINK-SPECIFIC)
// =============================================================================

/**
 * Mood slider configuration for non-technical style customization
 * Values range from 0-100
 */
export interface MoodSliders {
  /** Professional (0) to Playful (100) */
  vibe: number;
  /** Calm (0) to Energetic (100) */
  energy: number;
  /** Classic (0) to Modern (100) */
  era: number;
  /** Minimalist (0) to Dense (100) */
  density: number;
  /** Budget (0) to Premium (100) */
  price: number;
}

/**
 * Mapping of mood slider values to style properties
 */
export interface MoodSliderMapping {
  /** CSS property or token to affect */
  property: string;
  /** Minimum value at slider 0 */
  minValue: string;
  /** Maximum value at slider 100 */
  maxValue: string;
  /** Interpolation type */
  interpolation?: 'linear' | 'ease' | 'step';
}

// =============================================================================
// PAGE STRUCTURE
// =============================================================================

/**
 * Complete page definitions for the template
 */
export interface PageConfig {
  /** Page type identifier */
  type: PageType;
  /** Page route/path */
  path: string;
  /** Page title (supports {{variables}}) */
  title: string;
  /** Meta description */
  description?: string;
  /** Page layout type */
  layout: LayoutType;
  /** Ordered list of sections */
  sections: SectionConfig[];
  /** Page-level options */
  options?: PageOptions;
}

export type PageType =
  | 'home'
  | 'about'
  | 'menu'
  | 'services'
  | 'gallery'
  | 'contact'
  | 'team'
  | 'testimonials'
  | 'pricing'
  | 'faq'
  | 'blog'
  | 'blog-post'
  | 'reservations'
  | 'booking'
  | 'events'
  | 'catering'
  | 'careers'
  | 'privacy'
  | 'terms'
  // Portal pages
  | 'dashboard'
  | 'profile'
  | 'rewards'
  | 'wallet'
  | 'orders'
  | 'appointments'
  | 'leaderboard'
  // Admin pages
  | 'admin-dashboard'
  | 'admin-orders'
  | 'admin-inventory'
  | 'admin-customers'
  | 'admin-analytics'
  | 'admin-settings';

export type LayoutType =
  | 'default'
  | 'fullwidth'
  | 'sidebar-left'
  | 'sidebar-right'
  | 'centered'
  | 'split'
  | 'dashboard';

export interface PageOptions {
  /** Show header on this page */
  showHeader?: boolean;
  /** Show footer on this page */
  showFooter?: boolean;
  /** Requires authentication */
  requiresAuth?: boolean;
  /** Required user role */
  requiredRole?: string;
  /** Page transition animation */
  transition?: string;
}

// =============================================================================
// SECTION DEFINITIONS
// =============================================================================

/**
 * Section configuration within a page
 */
export interface SectionConfig {
  /** Section type identifier */
  type: SectionType;
  /** Unique section ID (auto-generated if not provided) */
  id?: string;
  /** Section variant/style */
  variant?: string;
  /** Content schema for this section */
  content: ContentSchema;
  /** Section-specific options */
  options?: SectionOptions;
  /** Visibility conditions */
  conditions?: SectionConditions;
}

export type SectionType =
  // Hero sections
  | 'hero'
  | 'hero-split'
  | 'hero-fullscreen'
  | 'hero-video'
  | 'hero-carousel'
  // Content sections
  | 'intro'
  | 'about'
  | 'features'
  | 'services'
  | 'how-it-works'
  | 'process'
  | 'benefits'
  // Social proof
  | 'testimonials'
  | 'reviews'
  | 'trust-strip'
  | 'logo-cloud'
  | 'stats'
  | 'case-studies'
  // Product/service display
  | 'menu'
  | 'menu-categories'
  | 'product-grid'
  | 'product-featured'
  | 'pricing-table'
  | 'comparison'
  // Media
  | 'gallery'
  | 'gallery-masonry'
  | 'video'
  | 'instagram-feed'
  // Team & contact
  | 'team'
  | 'team-grid'
  | 'contact-form'
  | 'contact-info'
  | 'map'
  | 'location'
  // CTA & conversion
  | 'cta'
  | 'cta-banner'
  | 'newsletter'
  | 'promo'
  | 'announcement'
  // Utility
  | 'faq'
  | 'faq-accordion'
  | 'blog-grid'
  | 'blog-featured'
  | 'events'
  | 'timeline'
  | 'custom';

export interface SectionOptions {
  /** Background style */
  background?: 'default' | 'primary' | 'secondary' | 'dark' | 'light' | 'gradient' | 'image';
  /** Background image URL */
  backgroundImage?: string;
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Animation on scroll */
  animation?: 'none' | 'fade-in' | 'slide-up' | 'slide-in' | 'zoom';
  /** Container width */
  containerWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Text alignment */
  textAlign?: 'left' | 'center' | 'right';
  /** Section divider style */
  divider?: 'none' | 'line' | 'wave' | 'angle' | 'curve';
}

export interface SectionConditions {
  /** Only show on certain screen sizes */
  breakpoints?: ('mobile' | 'tablet' | 'desktop')[];
  /** Only show for certain user roles */
  roles?: string[];
  /** Feature flag dependency */
  featureFlag?: string;
  /** Show based on tier */
  tiers?: TierType[];
}

// =============================================================================
// CONTENT SCHEMA
// =============================================================================

/**
 * Content schema definition for sections
 */
export interface ContentSchema {
  /** Content fields */
  fields: ContentField[];
  /** Default/placeholder content */
  defaults?: Record<string, any>;
  /** AI generation prompt for this section */
  aiPrompt?: string;
}

export interface ContentField {
  /** Field key */
  key: string;
  /** Field label */
  label: string;
  /** Field type */
  type: ContentFieldType;
  /** Is this field required */
  required?: boolean;
  /** Validation rules */
  validation?: FieldValidation;
  /** Placeholder text */
  placeholder?: string;
  /** Help text */
  helpText?: string;
  /** Default value */
  defaultValue?: any;
  /** Options for select/radio fields */
  options?: { value: string; label: string }[];
  /** Nested fields for object/array types */
  fields?: ContentField[];
  /** Min/max items for array types */
  minItems?: number;
  maxItems?: number;
}

export type ContentFieldType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'image'
  | 'video'
  | 'icon'
  | 'color'
  | 'url'
  | 'email'
  | 'phone'
  | 'date'
  | 'time'
  | 'datetime'
  | 'object'
  | 'array';

export interface FieldValidation {
  /** Minimum length for strings */
  minLength?: number;
  /** Maximum length for strings */
  maxLength?: number;
  /** Minimum value for numbers */
  min?: number;
  /** Maximum value for numbers */
  max?: number;
  /** Regex pattern */
  pattern?: string;
  /** Custom validation message */
  message?: string;
}

// =============================================================================
// TIERS & VARIANTS
// =============================================================================

export type TierType = 'essential' | 'recommended' | 'premium';

/**
 * Tier configuration defining page/feature access
 */
export interface TierConfig {
  /** Tier identifier */
  id: TierType;
  /** Display name */
  name: string;
  /** Tier description */
  description: string;
  /** Price (for display purposes) */
  price?: number;
  /** Currency */
  currency?: string;
  /** Pages included in this tier */
  pages: PageType[];
  /** Features enabled in this tier */
  features: string[];
  /** Portal pages if applicable */
  portalPages?: PageType[];
}

/**
 * Industry variant configuration
 */
export interface VariantConfig {
  /** Variant identifier */
  id: string;
  /** Display name */
  name: string;
  /** Variant description */
  description?: string;
  /** Style overrides for this variant */
  styleOverrides?: Partial<StyleConfig>;
  /** Additional pages for this variant */
  additionalPages?: PageType[];
  /** Terminology overrides */
  terminology?: IndustryTerminology;
  /** Default mood slider values */
  defaultMoodSliders?: Partial<MoodSliders>;
}

/**
 * Industry-specific terminology mappings
 */
export interface IndustryTerminology {
  /** Label for services/products section */
  services?: string;
  /** Singular service/product */
  service?: string;
  /** Label for team section */
  team?: string;
  /** Singular team member */
  teamMember?: string;
  /** Label for booking/reservation */
  booking?: string;
  /** Label for customer */
  customer?: string;
  /** Label for location */
  location?: string;
  /** Additional custom terms */
  [key: string]: string | undefined;
}

// =============================================================================
// HEADER & FOOTER
// =============================================================================

export interface HeaderConfig {
  /** Header layout type */
  layout: 'standard' | 'centered' | 'split' | 'minimal' | 'mega';
  /** Sticky behavior */
  sticky?: boolean;
  /** Transparent on hero */
  transparent?: boolean;
  /** Logo configuration */
  logo: {
    type: 'image' | 'text' | 'both';
    image?: string;
    text?: string;
    width?: string;
    height?: string;
  };
  /** Navigation configuration */
  nav: {
    style: 'default' | 'pills' | 'underline' | 'minimal';
    position: 'left' | 'center' | 'right';
    items: NavItem[];
  };
  /** Call-to-action button */
  cta?: {
    text: string;
    href: string;
    style: 'primary' | 'secondary' | 'outline' | 'ghost';
  };
  /** Additional elements */
  elements?: ('search' | 'cart' | 'account' | 'language' | 'theme-toggle')[];
}

export interface NavItem {
  /** Display label */
  label: string;
  /** Link href */
  href: string;
  /** Nested items for dropdowns */
  children?: NavItem[];
  /** Icon name */
  icon?: string;
  /** Highlight this item */
  highlight?: boolean;
}

export interface FooterConfig {
  /** Footer layout type */
  layout: 'standard' | 'centered' | 'minimal' | 'mega';
  /** Footer columns */
  columns: FooterColumn[];
  /** Social links */
  social?: SocialLink[];
  /** Copyright text */
  copyright?: string;
  /** Bottom links (privacy, terms, etc.) */
  bottomLinks?: { label: string; href: string }[];
  /** Newsletter signup */
  newsletter?: {
    enabled: boolean;
    title?: string;
    description?: string;
    placeholder?: string;
    buttonText?: string;
  };
}

export interface FooterColumn {
  /** Column title */
  title: string;
  /** Links in this column */
  links: { label: string; href: string }[];
}

export interface SocialLink {
  /** Platform name */
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'tiktok' | 'pinterest' | 'yelp' | 'tripadvisor';
  /** Profile URL */
  url: string;
}

// =============================================================================
// SAAS/APPLICATION CONFIGURATION
// =============================================================================

/**
 * Database schema configuration for SaaS templates
 */
export interface DatabaseConfig {
  /** Database type */
  type: 'postgresql' | 'mysql' | 'sqlite' | 'mongodb';
  /** Table/collection definitions */
  tables: TableDefinition[];
  /** Relationships */
  relationships?: RelationshipDefinition[];
  /** Database triggers */
  triggers?: TriggerDefinition[];
  /** Seed data configuration */
  seedData?: SeedDataConfig;
}

export interface TableDefinition {
  /** Table name */
  name: string;
  /** Table description */
  description?: string;
  /** Column definitions */
  columns: ColumnDefinition[];
  /** Indexes */
  indexes?: IndexDefinition[];
  /** Row-level security enabled */
  rls?: boolean;
}

export interface ColumnDefinition {
  /** Column name */
  name: string;
  /** Data type */
  type: string;
  /** Is nullable */
  nullable?: boolean;
  /** Is primary key */
  primaryKey?: boolean;
  /** Default value */
  default?: string;
  /** Is unique */
  unique?: boolean;
  /** Foreign key reference */
  references?: {
    table: string;
    column: string;
    onDelete?: 'cascade' | 'set null' | 'restrict';
  };
  /** Column description */
  description?: string;
}

export interface IndexDefinition {
  /** Index name */
  name: string;
  /** Columns in index */
  columns: string[];
  /** Is unique index */
  unique?: boolean;
}

export interface RelationshipDefinition {
  /** Relationship type */
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  /** Source table */
  from: { table: string; column: string };
  /** Target table */
  to: { table: string; column: string };
  /** Junction table for many-to-many */
  through?: string;
}

export interface TriggerDefinition {
  /** Trigger name */
  name: string;
  /** Table this trigger applies to */
  table: string;
  /** Trigger event */
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  /** Trigger timing */
  timing: 'BEFORE' | 'AFTER';
  /** Trigger function/procedure name */
  function: string;
}

export interface SeedDataConfig {
  /** Tables to seed */
  tables: {
    table: string;
    count?: number;
    data?: Record<string, any>[];
  }[];
}

/**
 * API configuration for SaaS templates
 */
export interface APIConfig {
  /** API base path */
  basePath: string;
  /** API version */
  version?: string;
  /** Authentication type */
  auth: {
    type: 'jwt' | 'session' | 'api-key' | 'oauth' | 'none';
    provider?: string;
  };
  /** Route groups */
  routes: RouteGroup[];
  /** Global middleware */
  middleware?: string[];
  /** Rate limiting */
  rateLimit?: {
    enabled: boolean;
    windowMs: number;
    max: number;
  };
}

export interface RouteGroup {
  /** Group name */
  name: string;
  /** Group prefix */
  prefix: string;
  /** Routes in this group */
  routes: RouteDefinition[];
  /** Group-level middleware */
  middleware?: string[];
}

export interface RouteDefinition {
  /** HTTP method */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Route path */
  path: string;
  /** Route description */
  description?: string;
  /** Handler function name */
  handler: string;
  /** Route-level middleware */
  middleware?: string[];
  /** Request body schema */
  body?: Record<string, any>;
  /** Query parameters */
  query?: Record<string, any>;
  /** Response schema */
  response?: Record<string, any>;
}

/**
 * Third-party integrations configuration
 */
export interface IntegrationsConfig {
  /** Payment processing */
  payments?: {
    provider: 'stripe' | 'paypal' | 'square';
    features: ('checkout' | 'subscriptions' | 'invoicing')[];
    webhookEvents?: string[];
  };
  /** Email service */
  email?: {
    provider: 'sendgrid' | 'mailgun' | 'ses' | 'resend';
    templates?: string[];
  };
  /** File storage */
  storage?: {
    provider: 's3' | 'cloudinary' | 'uploadthing' | 'local';
    maxFileSize?: number;
    allowedTypes?: string[];
  };
  /** Analytics */
  analytics?: {
    providers: ('google' | 'mixpanel' | 'amplitude' | 'posthog')[];
  };
  /** Maps */
  maps?: {
    provider: 'google' | 'mapbox';
  };
}

// =============================================================================
// DEPLOYMENT CONFIGURATION
// =============================================================================

export interface DeploymentConfig {
  /** Deployment platform */
  platform: 'vercel' | 'netlify' | 'railway' | 'fly' | 'docker' | 'custom';
  /** Required environment variables */
  envVars: EnvVarDefinition[];
  /** Build configuration */
  build?: {
    command: string;
    outputDir: string;
  };
  /** Health check endpoint */
  healthCheck?: string;
}

export interface EnvVarDefinition {
  /** Variable name */
  name: string;
  /** Description */
  description: string;
  /** Is required */
  required: boolean;
  /** Default value */
  default?: string;
  /** Is secret (should not be logged) */
  secret?: boolean;
}

// =============================================================================
// MAIN TEMPLATE CONFIGURATION
// =============================================================================

/**
 * Complete template configuration
 */
export interface TemplateConfig {
  /** Schema version */
  $schema?: string;
  /** Template metadata */
  meta: TemplateMeta;
  /** Visual/style configuration */
  style: StyleConfig;
  /** Default mood sliders */
  defaultMoodSliders?: MoodSliders;
  /** Mood slider to style mappings */
  moodSliderMappings?: Record<keyof MoodSliders, MoodSliderMapping[]>;
  /** Header configuration */
  header: HeaderConfig;
  /** Footer configuration */
  footer: FooterConfig;
  /** Page definitions */
  pages: PageConfig[];
  /** Tier configurations */
  tiers: TierConfig[];
  /** Industry variants */
  variants?: Record<string, VariantConfig>;
  /** Industry terminology */
  terminology?: IndustryTerminology;
  /** Feature flags */
  features?: string[];
  /** Database configuration (SaaS only) */
  database?: DatabaseConfig;
  /** API configuration (SaaS only) */
  api?: APIConfig;
  /** Third-party integrations */
  integrations?: IntegrationsConfig;
  /** Deployment configuration */
  deployment?: DeploymentConfig;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Template with resolved content (after AI generation)
 */
export interface ResolvedTemplate extends TemplateConfig {
  /** All content has been generated */
  contentResolved: true;
  /** Resolved page content */
  resolvedPages: (PageConfig & {
    resolvedSections: (SectionConfig & {
      resolvedContent: Record<string, any>;
    })[];
  })[];
}

/**
 * Partial template for AI composition
 */
export type PartialTemplateConfig = Partial<TemplateConfig> & {
  meta: TemplateMeta;
};

/**
 * Template generation options
 */
export interface TemplateGenerationOptions {
  /** Industry type */
  industry: IndustryType;
  /** Specific variant */
  variant?: string;
  /** Selected tier */
  tier: TierType;
  /** Business information */
  businessInfo: {
    name: string;
    description: string;
    location?: string;
    tagline?: string;
  };
  /** Color preferences */
  colors?: Partial<ColorPalette>;
  /** Mood slider values */
  moodSliders?: Partial<MoodSliders>;
  /** Include customer portal */
  includePortal?: boolean;
  /** Portal tier if included */
  portalTier?: 'basic' | 'loyalty' | 'full';
  /** AI enhancement level (0-4) */
  aiLevel?: number;
}
