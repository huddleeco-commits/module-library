/**
 * BE1st Module Extraction Map
 * 
 * Based on devtools analysis of:
 * - SlabTrack (68 backend routes, 150+ frontend components)
 * - Huddle (43 backend routes, 70 pages, 53 services)
 * - HealthcareOS (41 backend routes)
 * - Family Huddle (29 backend routes)
 * 
 * This maps each module to its BEST source files for extraction
 */

const MODULE_EXTRACTION_MAP = {
  
  // ══════════════════════════════════════════════════════════════
  // BACKEND MODULES (28)
  // ══════════════════════════════════════════════════════════════
  
  backend: {
    
    // ─────────────────────────────────────────────────────────────
    // CORE / CRITICAL (Every platform needs these)
    // ─────────────────────────────────────────────────────────────
    
    'auth': {
      description: 'JWT authentication, login, register, password reset',
      bestSource: 'SlabTrack',
      confidence: '145%',
      files: {
        routes: ['backend/routes/auth.routes.js'],
        middleware: ['backend/middleware/auth.js'],
        models: ['backend/models/User.js'],
        services: ['backend/services/password-reset-email.js']
      },
      endpoints: [
        'POST /auth/register',
        'POST /auth/login',
        'POST /auth/logout',
        'POST /auth/forgot-password',
        'POST /auth/reset-password',
        'GET /auth/me',
        'GET /auth/verify-token'
      ],
      dependencies: ['bcryptjs', 'jsonwebtoken'],
      envVars: ['JWT_SECRET', 'JWT_EXPIRE']
    },
    
    'user-management': {
      description: 'User profiles, settings, preferences, roles',
      bestSource: 'SlabTrack',
      confidence: '200%',
      files: {
        routes: ['backend/routes/users.routes.js'],
        models: ['backend/models/User.js']
      },
      endpoints: [
        'GET /users/profile',
        'PUT /users/profile',
        'PUT /users/settings',
        'PUT /users/preferences',
        'GET /users/:id',
        'DELETE /users/:id'
      ]
    },
    
    'database': {
      description: 'PostgreSQL connection, migrations, pooling',
      bestSource: 'SlabTrack',
      confidence: '90%',
      files: {
        config: ['backend/database/db.js'],
        migrations: ['backend/database/migrate-postgres.js']
      },
      dependencies: ['pg', 'pg-pool'],
      envVars: ['DATABASE_URL', 'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']
    },
    
    // ─────────────────────────────────────────────────────────────
    // PAYMENTS & COMMERCE
    // ─────────────────────────────────────────────────────────────
    
    'stripe-payments': {
      description: 'Stripe subscriptions, one-time payments, webhooks',
      bestSource: 'SlabTrack',
      confidence: '180%',
      files: {
        routes: ['backend/routes/stripe.routes.js', 'backend/routes/subscription.routes.js'],
        services: ['backend/services/stripe-service.js'],
        config: ['backend/config/plans.js']
      },
      endpoints: [
        'POST /stripe/create-checkout-session',
        'POST /stripe/create-subscription',
        'POST /stripe/webhook',
        'GET /stripe/subscription-status',
        'POST /stripe/cancel-subscription',
        'POST /stripe/update-payment-method'
      ],
      dependencies: ['stripe'],
      envVars: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'STRIPE_PRICE_ID']
    },
    
    'vendor-system': {
      description: 'Multi-vendor marketplace, vendor profiles, payouts',
      bestSource: 'SlabTrack',
      confidence: '95%',
      files: {
        routes: [
          'backend/routes/vendor.routes.js',
          'backend/routes/vendor-sales-shows.routes.js',
          'backend/routes/vendor-collection-sync.routes.js'
        ]
      },
      endpoints: [
        'GET /vendor/profile',
        'PUT /vendor/profile',
        'GET /vendor/analytics',
        'GET /vendor/orders',
        'POST /vendor/payout-request'
      ]
    },
    
    'transfers': {
      description: 'Item transfers between users, transfer codes',
      bestSource: 'SlabTrack',
      confidence: '135%',
      files: {
        routes: ['backend/routes/transfer.routes.js']
      },
      endpoints: [
        'POST /transfers/create-code',
        'POST /transfers/claim',
        'GET /transfers/history',
        'DELETE /transfers/:id'
      ]
    },
    
    // ─────────────────────────────────────────────────────────────
    // COMMUNICATION
    // ─────────────────────────────────────────────────────────────
    
    'notifications': {
      description: 'Email, push, in-app notifications',
      bestSource: 'Huddle',
      confidence: '160%',
      files: {
        routes: ['backend/routes/notifications.js', 'backend/routes/notification.routes.js'],
        services: [
          'backend/services/notificationService.js',
          'backend/services/email-service.js',
          'backend/services/notification-scheduler.js'
        ],
        models: ['backend/models/Notification.js']
      },
      endpoints: [
        'GET /notifications',
        'PUT /notifications/:id/read',
        'PUT /notifications/read-all',
        'DELETE /notifications/:id',
        'GET /notifications/preferences',
        'PUT /notifications/preferences'
      ],
      dependencies: ['nodemailer', 'socket.io']
    },
    
    'chat': {
      description: 'Real-time messaging, conversations, socket.io',
      bestSource: 'Family Huddle',
      confidence: '150%',
      files: {
        routes: ['backend/routes/chat.js', 'backend/routes/messages.js'],
        services: ['backend/services/chat.service.js'],
        models: ['backend/models/LeagueMessage.js']
      },
      endpoints: [
        'GET /chat/conversations',
        'GET /chat/:conversationId/messages',
        'POST /chat/:conversationId/messages',
        'DELETE /chat/messages/:id'
      ],
      dependencies: ['socket.io']
    },
    
    'comments': {
      description: 'Comments on items, posts, threaded replies',
      bestSource: 'HealthcareOS',
      confidence: '120%',
      files: {
        models: ['backend/models/Comment.js']
      },
      endpoints: [
        'GET /comments/:itemId',
        'POST /comments/:itemId',
        'PUT /comments/:id',
        'DELETE /comments/:id'
      ]
    },
    
    // ─────────────────────────────────────────────────────────────
    // DASHBOARD & ANALYTICS
    // ─────────────────────────────────────────────────────────────
    
    'admin-dashboard': {
      description: 'Admin panel, user management, system stats',
      bestSource: 'HealthcareOS',
      confidence: '150%',
      files: {
        routes: ['backend/routes/admin.js', 'backend/routes/admin.routes.js']
      },
      endpoints: [
        'GET /admin/stats',
        'GET /admin/users',
        'PUT /admin/users/:id',
        'DELETE /admin/users/:id',
        'GET /admin/activity',
        'POST /admin/broadcast'
      ]
    },
    
    'analytics': {
      description: 'Usage tracking, revenue analytics, dashboards',
      bestSource: 'HealthcareOS',
      confidence: '210%',
      files: {
        routes: ['backend/routes/analytics.js', 'backend/routes/metrics.js'],
        services: ['backend/services/ai-analytics.js']
      },
      endpoints: [
        'GET /analytics/overview',
        'GET /analytics/revenue',
        'GET /analytics/users',
        'GET /analytics/activity'
      ]
    },
    
    // ─────────────────────────────────────────────────────────────
    // SCHEDULING & BOOKING
    // ─────────────────────────────────────────────────────────────
    
    'booking': {
      description: 'Appointment booking, reservation system',
      bestSource: 'HealthcareOS',
      confidence: '150%',
      files: {
        routes: ['backend/routes/appointments.js']
      },
      endpoints: [
        'GET /appointments',
        'POST /appointments',
        'PUT /appointments/:id',
        'DELETE /appointments/:id',
        'GET /appointments/available-slots'
      ]
    },
    
    'availability': {
      description: 'Time slots, schedules, capacity management',
      bestSource: 'HealthcareOS',
      confidence: '120%',
      files: {
        routes: ['backend/routes/services.js', 'backend/routes/providers.js']
      },
      endpoints: [
        'GET /availability/:providerId',
        'PUT /availability/:providerId',
        'GET /availability/slots'
      ]
    },
    
    // ─────────────────────────────────────────────────────────────
    // INVENTORY & COLLECTIONS
    // ─────────────────────────────────────────────────────────────
    
    'inventory': {
      description: 'Product/item inventory, stock management',
      bestSource: 'HealthcareOS',
      confidence: '150%',
      files: {
        routes: ['backend/routes/inventory.js']
      },
      endpoints: [
        'GET /inventory',
        'POST /inventory',
        'PUT /inventory/:id',
        'DELETE /inventory/:id',
        'PUT /inventory/:id/stock'
      ]
    },
    
    'collections': {
      description: 'Item collections, groupings, organization',
      bestSource: 'SlabTrack',
      confidence: '75%',
      files: {
        routes: ['backend/routes/collections.js']
      },
      endpoints: [
        'GET /collections',
        'POST /collections',
        'PUT /collections/:id',
        'DELETE /collections/:id',
        'POST /collections/:id/items',
        'DELETE /collections/:id/items/:itemId'
      ]
    },
    
    'showcase': {
      description: 'Public showcases, galleries, portfolios',
      bestSource: 'SlabTrack',
      confidence: '125%',
      files: {
        routes: ['backend/routes/showcase.routes.js']
      },
      endpoints: [
        'GET /showcase/:username',
        'PUT /showcase/settings',
        'POST /showcase/items',
        'DELETE /showcase/items/:id'
      ]
    },
    
    // ─────────────────────────────────────────────────────────────
    // AI & SCANNING
    // ─────────────────────────────────────────────────────────────
    
    'ai-scanner': {
      description: 'AI image recognition, item identification',
      bestSource: 'SlabTrack',
      confidence: '150%',
      files: {
        routes: ['backend/routes/scanner.routes.js'],
        services: ['backend/services/ai-scanner.js', 'backend/services/claude-scanner.js']
      },
      endpoints: [
        'POST /scanner/scan',
        'POST /scanner/bulk-scan',
        'GET /scanner/history'
      ],
      dependencies: ['@anthropic-ai/sdk'],
      envVars: ['ANTHROPIC_API_KEY']
    },
    
    'ai-content': {
      description: 'AI content generation, descriptions, analysis',
      bestSource: 'Huddle',
      confidence: '75%',
      files: {
        routes: ['backend/routes/analysis.js'],
        services: ['backend/services/ai-analytics.js', 'backend/services/AIAnalyticsService.js']
      }
    },
    
    // ─────────────────────────────────────────────────────────────
    // FILE HANDLING
    // ─────────────────────────────────────────────────────────────
    
    'file-upload': {
      description: 'Image/file uploads, Cloudinary integration',
      bestSource: 'SlabTrack',
      confidence: '175%',
      files: {
        middleware: ['backend/middleware/upload.js'],
        services: ['backend/services/cloudinary.js', 'backend/services/imageProcessor.js']
      },
      dependencies: ['multer', 'cloudinary'],
      envVars: ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']
    },
    
    // ─────────────────────────────────────────────────────────────
    // INTEGRATIONS
    // ─────────────────────────────────────────────────────────────
    
    'ebay-integration': {
      description: 'eBay API, listings, pricing, OAuth',
      bestSource: 'SlabTrack',
      confidence: '175%',
      files: {
        routes: [
          'backend/routes/ebay.routes.js',
          'backend/routes/ebayAuth.js',
          'backend/routes/ebay-listing.routes.js',
          'backend/routes/ebay-analytics.routes.js'
        ],
        services: [
          'backend/services/ebay-api.js',
          'backend/services/ebay-oauth.js',
          'backend/services/ebay-finding-service.js'
        ]
      },
      envVars: ['EBAY_APP_ID', 'EBAY_CERT_ID', 'EBAY_DEV_ID', 'EBAY_REDIRECT_URI']
    },
    
    'nfc-tags': {
      description: 'NFC tag writing/reading, physical-digital linking',
      bestSource: 'SlabTrack',
      confidence: '120%',
      files: {
        routes: ['backend/routes/nfc.routes.js']
      },
      endpoints: [
        'POST /nfc/write',
        'GET /nfc/:tagId',
        'PUT /nfc/:tagId',
        'GET /nfc/scan/:tagId'
      ]
    },
    
    // ─────────────────────────────────────────────────────────────
    // SPORTS & GAMING (Industry-specific)
    // ─────────────────────────────────────────────────────────────
    
    'fantasy': {
      description: 'Fantasy sports leagues, drafts, rosters',
      bestSource: 'Huddle',
      confidence: '210%',
      files: {
        routes: [
          'backend/routes/fantasy/fantasy-leagues.js',
          'backend/routes/fantasy/draft-management.js',
          'backend/routes/fantasy/fantasy-analytics.js',
          'backend/routes/fantasy/player-loans.js'
        ],
        services: [
          'backend/services/fantasy/DraftOptimizer.js',
          'backend/services/fantasy/FantasyAnalyzer.js',
          'backend/services/fantasy/TradeEngine.js',
          'backend/services/fantasy/LoanMarketplace.js'
        ]
      }
    },
    
    'betting': {
      description: 'Sports betting, odds, picks, side bets',
      bestSource: 'Huddle',
      confidence: '150%',
      files: {
        routes: [
          'backend/routes/betting-tools.js',
          'backend/routes/picks.routes.js',
          'backend/routes/sidebets.routes.js',
          'backend/routes/props.js'
        ],
        services: [
          'backend/services/SharpMoneyTracker.js',
          'backend/services/PlayerPropsAnalyzer.js'
        ],
        models: ['backend/models/Bet.js', 'backend/models/SideBet.js', 'backend/models/Pick.js']
      }
    },
    
    'leaderboard': {
      description: 'Leaderboards, rankings, scores',
      bestSource: 'Huddle',
      confidence: '120%',
      files: {
        models: ['backend/models/Leaderboard.js'],
        routes: ['backend/routes/reputation.js']
      },
      endpoints: [
        'GET /leaderboard',
        'GET /leaderboard/:type',
        'GET /leaderboard/user/:userId'
      ]
    },
    
    // ─────────────────────────────────────────────────────────────
    // HEALTHCARE (Industry-specific)
    // ─────────────────────────────────────────────────────────────
    
    'patient-portal': {
      description: 'Patient records, health history',
      bestSource: 'HealthcareOS',
      confidence: '120%',
      files: {
        routes: ['backend/routes/patients.js', 'backend/routes/medicalRecords.js']
      }
    },
    
    'telemedicine': {
      description: 'Video consultations, virtual visits',
      bestSource: 'HealthcareOS',
      confidence: '60%',
      files: {
        routes: ['backend/routes/treatments.js', 'backend/routes/prescriptions.js']
      }
    },
    
    // ─────────────────────────────────────────────────────────────
    // SOCIAL AUTH
    // ─────────────────────────────────────────────────────────────
    
    'social-auth': {
      description: 'Google, Facebook, social login',
      bestSource: 'SlabTrack',
      confidence: '60%',
      files: {
        routes: ['backend/routes/social.routes.js']
      },
      endpoints: [
        'GET /auth/google',
        'GET /auth/google/callback',
        'GET /auth/facebook',
        'GET /auth/facebook/callback'
      ],
      dependencies: ['passport', 'passport-google-oauth20', 'passport-facebook']
    }
  },
  
  // ══════════════════════════════════════════════════════════════
  // FRONTEND MODULES (46)
  // ══════════════════════════════════════════════════════════════
  
  frontend: {
    
    // ─────────────────────────────────────────────────────────────
    // LAYOUT / NAVIGATION
    // ─────────────────────────────────────────────────────────────
    
    'header-nav': {
      description: 'Top navigation, logo, menu, user dropdown',
      bestSource: 'SlabTrack',
      confidence: '200%',
      files: ['frontend/src/components/shared/Navbar.jsx']
    },
    
    'sidebar-nav': {
      description: 'Side navigation, collapsible menu',
      bestSource: 'SlabTrack',
      confidence: '84%',
      files: ['frontend/src/components/shared/Navbar.jsx'] // Part of navbar
    },
    
    'footer-section': {
      description: 'Footer with links, social, copyright',
      bestSource: 'SlabTrack',
      confidence: '151%',
      files: ['frontend/src/components/layout/Footer.jsx']
    },
    
    'breadcrumb': {
      description: 'Breadcrumb navigation',
      bestSource: 'SlabTrack',
      confidence: '76%',
      files: [] // Create from pattern
    },
    
    // ─────────────────────────────────────────────────────────────
    // HERO / LANDING
    // ─────────────────────────────────────────────────────────────
    
    'hero-section': {
      description: 'Hero banner with headline, CTA, background',
      bestSource: 'Huddle',
      confidence: '200%',
      files: [
        'src/core/pages/fantasy-platforms/essential/homepage.js',
        'src/core/pages/sports-platforms/premium/homepage.js'
      ]
    },
    
    'feature-grid': {
      description: '3-4 column feature highlights',
      bestSource: 'SlabTrack',
      confidence: '200%',
      files: ['frontend/src/pages/Landing.jsx']
    },
    
    'cta-section': {
      description: 'Call-to-action section with button',
      bestSource: 'SlabTrack',
      confidence: '118%',
      files: ['frontend/src/pages/Landing.jsx']
    },
    
    'testimonials': {
      description: 'Customer quotes, reviews slider',
      bestSource: 'SlabTrack',
      confidence: '104%',
      files: ['frontend/src/pages/Landing.jsx']
    },
    
    'pricing-table': {
      description: 'Pricing tiers, feature comparison',
      bestSource: 'SlabTrack',
      confidence: '146%',
      files: ['frontend/src/pages/Pricing.jsx']
    },
    
    // ─────────────────────────────────────────────────────────────
    // DASHBOARD
    // ─────────────────────────────────────────────────────────────
    
    'stat-cards': {
      description: 'Dashboard stat cards with icons',
      bestSource: 'HealthcareOS',
      confidence: '200%',
      files: [
        'frontend/src/components/dashboard/DashboardStats.jsx',
        'frontend/src/components/dashboard/UsageWidget.jsx'
      ]
    },
    
    'data-table': {
      description: 'Sortable, filterable data tables',
      bestSource: 'SlabTrack',
      confidence: '174%',
      files: ['frontend/src/components/cards/CardGrid.jsx']
    },
    
    'chart-widget': {
      description: 'Charts - line, bar, pie, area',
      bestSource: 'Huddle',
      confidence: '200%',
      files: [
        'frontend/src/components/analytics/EbayAnalytics.jsx',
        'src/core/pages/fantasy-platforms/premium/analytics.js'
      ]
    },
    
    'activity-feed': {
      description: 'Recent activity timeline',
      bestSource: 'Huddle',
      confidence: '148%',
      files: [
        'frontend/src/components/dashboard/RecentActivity.jsx',
        'src/core/pages/fantasy-platforms/essential/activity-feed.js'
      ]
    },
    
    'progress-tracker': {
      description: 'Progress bars, completion indicators',
      bestSource: 'SlabTrack',
      confidence: '84%',
      files: ['frontend/src/components/dashboard/UsageWidget.jsx']
    },
    
    // ─────────────────────────────────────────────────────────────
    // FORMS
    // ─────────────────────────────────────────────────────────────
    
    'form-wizard': {
      description: 'Multi-step form wizard',
      bestSource: 'SlabTrack',
      confidence: '77%',
      files: ['frontend/src/pages/ShopRegistration.jsx']
    },
    
    'form-input': {
      description: 'Styled form inputs, validation',
      bestSource: 'HealthcareOS',
      confidence: '145%',
      files: ['frontend/src/components/shared/Input.jsx']
    },
    
    'search-filter': {
      description: 'Search with filters, dropdowns',
      bestSource: 'SlabTrack',
      confidence: '119%',
      files: ['frontend/src/pages/MasterCardSearch.jsx']
    },
    
    'file-uploader': {
      description: 'Drag-drop file upload with preview',
      bestSource: 'SlabTrack',
      confidence: '109%',
      files: [
        'frontend/src/components/scanner/ImageUpload.jsx',
        'frontend/src/components/ImageUploadModal.jsx'
      ]
    },
    
    'date-picker': {
      description: 'Calendar date selection',
      bestSource: 'HealthcareOS',
      confidence: '58%',
      files: [] // Use library
    },
    
    'toggle-switch': {
      description: 'On/off toggle switches',
      bestSource: 'SlabTrack',
      confidence: '37%',
      files: ['frontend/src/pages/Settings.jsx']
    },
    
    // ─────────────────────────────────────────────────────────────
    // COMMERCE
    // ─────────────────────────────────────────────────────────────
    
    'product-card': {
      description: 'Product display card with image, price',
      bestSource: 'SlabTrack',
      confidence: '96%',
      files: ['frontend/src/components/cards/CardItem.jsx']
    },
    
    'cart-component': {
      description: 'Shopping cart with totals',
      bestSource: 'SlabTrack',
      confidence: '192%',
      files: [
        'frontend/src/components/bundle/BundleCart.jsx',
        'frontend/src/components/bundle/BundleSidebar.jsx'
      ]
    },
    
    'checkout-flow': {
      description: 'Checkout steps, payment form',
      bestSource: 'SlabTrack',
      confidence: '143%',
      files: ['frontend/src/pages/CheckoutPage.jsx']
    },
    
    // ─────────────────────────────────────────────────────────────
    // SOCIAL
    // ─────────────────────────────────────────────────────────────
    
    'social-feed': {
      description: 'Social media style feed',
      bestSource: 'Huddle',
      confidence: '200%',
      files: [
        'frontend/public/js/components/post-creator.js',
        'src/core/pages/fantasy-platforms/premium/social-feed.js'
      ]
    },
    
    'post-card': {
      description: 'Individual post display',
      bestSource: 'Huddle',
      confidence: '114%',
      files: ['frontend/public/js/components/post-interactions.js']
    },
    
    'comment-section': {
      description: 'Comments thread display',
      bestSource: 'Huddle',
      confidence: '96%',
      files: ['frontend/public/js/components/comment-system.js']
    },
    
    'user-profile': {
      description: 'User profile card/page',
      bestSource: 'Huddle',
      confidence: '101%',
      files: ['frontend/public/js/components/profile-component.js']
    },
    
    'follow-button': {
      description: 'Follow/unfollow button',
      bestSource: 'SlabTrack',
      confidence: '86%',
      files: [] // Simple component
    },
    
    'avatar-component': {
      description: 'User avatar with status',
      bestSource: 'Huddle',
      confidence: '73%',
      files: [] // Part of profile
    },
    
    // ─────────────────────────────────────────────────────────────
    // GAMING / SPORTS
    // ─────────────────────────────────────────────────────────────
    
    'leaderboard-widget': {
      description: 'Rankings leaderboard display',
      bestSource: 'Huddle',
      confidence: '184%',
      files: [
        'src/core/pages/championship-platforms/school/Leaderboard.js',
        'src/core/pages/fantasy-platforms/essential/standings.js'
      ]
    },
    
    'game-card': {
      description: 'Game/match display card',
      bestSource: 'Huddle',
      confidence: '111%',
      files: [
        'frontend/public/js/components/game-picker.js',
        'frontend/public/js/components/games-hub-component.js'
      ]
    },
    
    'betting-slip': {
      description: 'Betting slip/ticket',
      bestSource: 'Huddle',
      confidence: '82%',
      files: [
        'frontend/public/js/components/betting-hub.js',
        'frontend/public/js/components/challenge-bet.js'
      ]
    },
    
    'player-card': {
      description: 'Player stats card',
      bestSource: 'Huddle',
      confidence: '77%',
      files: ['src/core/pages/fantasy-platforms/essential/my-team.js']
    },
    
    // ─────────────────────────────────────────────────────────────
    // UI COMPONENTS
    // ─────────────────────────────────────────────────────────────
    
    'modal-system': {
      description: 'Modal dialogs, popups',
      bestSource: 'Huddle',
      confidence: '167%',
      files: ['frontend/src/components/shared/Modal.jsx']
    },
    
    'toast-notification': {
      description: 'Toast notifications, alerts',
      bestSource: 'SlabTrack',
      confidence: '99%',
      files: ['frontend/src/components/shared/NotificationBell.jsx']
    },
    
    'dropdown-menu': {
      description: 'Dropdown menus, selects',
      bestSource: 'SlabTrack',
      confidence: '84%',
      files: [] // Part of navbar
    },
    
    'tooltip': {
      description: 'Hover tooltips',
      bestSource: 'SlabTrack',
      confidence: '78%',
      files: [] // CSS only
    },
    
    // ─────────────────────────────────────────────────────────────
    // MEDIA
    // ─────────────────────────────────────────────────────────────
    
    'image-gallery': {
      description: 'Image gallery with lightbox',
      bestSource: 'SlabTrack',
      confidence: '52%',
      files: [
        'frontend/src/pages/Gallery.jsx',
        'frontend/src/pages/InspectionGallery.jsx'
      ]
    },
    
    'video-player': {
      description: 'Video player component',
      bestSource: 'Huddle',
      confidence: '65%',
      files: ['src/core/pages/fantasy-platforms/luxury/video-draft-room.js']
    },
    
    // ─────────────────────────────────────────────────────────────
    // HEALTHCARE
    // ─────────────────────────────────────────────────────────────
    
    'appointment-scheduler': {
      description: 'Appointment booking calendar',
      bestSource: 'HealthcareOS',
      confidence: '56%',
      files: [] // From HealthcareOS
    },
    
    'patient-card': {
      description: 'Patient info card',
      bestSource: 'HealthcareOS',
      confidence: '25%',
      files: [] // From HealthcareOS
    },
    
    // ─────────────────────────────────────────────────────────────
    // COLLECTIONS
    // ─────────────────────────────────────────────────────────────
    
    'collection-grid': {
      description: 'Collection items grid display',
      bestSource: 'SlabTrack',
      confidence: '46%',
      files: [
        'frontend/src/components/cards/CardGrid.jsx',
        'frontend/src/pages/CollectionViewer.jsx'
      ]
    },
    
    'item-detail': {
      description: 'Item detail modal/page',
      bestSource: 'SlabTrack',
      confidence: '55%',
      files: [
        'frontend/src/components/cards/CardDetailModal.jsx',
        'frontend/src/components/cards/CardDisplay.jsx'
      ]
    },
    
    // ─────────────────────────────────────────────────────────────
    // AUTH
    // ─────────────────────────────────────────────────────────────
    
    'login-form': {
      description: 'Login form component',
      bestSource: 'SlabTrack',
      confidence: '97%',
      files: [
        'frontend/src/components/auth/LoginForm.jsx',
        'frontend/src/pages/Login.jsx'
      ]
    },
    
    'register-form': {
      description: 'Registration form component',
      bestSource: 'SlabTrack',
      confidence: '102%',
      files: [
        'frontend/src/components/auth/RegisterForm.jsx',
        'frontend/src/pages/Register.jsx'
      ]
    },
    
    'settings-panel': {
      description: 'User settings panel',
      bestSource: 'SlabTrack',
      confidence: '69%',
      files: ['frontend/src/pages/Settings.jsx']
    }
  }
};

// ══════════════════════════════════════════════════════════════
// MODULE BUNDLES - Pre-configured combinations
// ══════════════════════════════════════════════════════════════

const MODULE_BUNDLES = {
  
  'core': {
    description: 'Essential modules every platform needs',
    backend: ['auth', 'user-management', 'database', 'file-upload'],
    frontend: ['header-nav', 'footer-section', 'login-form', 'register-form', 'modal-system', 'toast-notification']
  },
  
  'dashboard': {
    description: 'Admin dashboard with analytics',
    backend: ['admin-dashboard', 'analytics'],
    frontend: ['stat-cards', 'data-table', 'chart-widget', 'activity-feed', 'sidebar-nav']
  },
  
  'commerce': {
    description: 'E-commerce and payments',
    backend: ['stripe-payments', 'inventory', 'vendor-system', 'transfers'],
    frontend: ['product-card', 'cart-component', 'checkout-flow', 'pricing-table']
  },
  
  'social': {
    description: 'Social features',
    backend: ['notifications', 'chat', 'comments'],
    frontend: ['social-feed', 'post-card', 'comment-section', 'user-profile', 'follow-button']
  },
  
  'landing': {
    description: 'Marketing landing page',
    backend: [],
    frontend: ['hero-section', 'feature-grid', 'cta-section', 'testimonials', 'pricing-table']
  },
  
  'collectibles': {
    description: 'Collection management + AI scanning',
    backend: ['ai-scanner', 'collections', 'ebay-integration', 'nfc-tags'],
    frontend: ['collection-grid', 'item-detail', 'file-uploader', 'image-gallery']
  },
  
  'sports': {
    description: 'Sports/fantasy/betting features',
    backend: ['fantasy', 'betting', 'leaderboard'],
    frontend: ['leaderboard-widget', 'game-card', 'betting-slip', 'player-card']
  },
  
  'healthcare': {
    description: 'Healthcare/booking features',
    backend: ['booking', 'availability', 'patient-portal'],
    frontend: ['appointment-scheduler', 'patient-card', 'form-wizard']
  }
};

// ══════════════════════════════════════════════════════════════
// INDUSTRY PRESETS - What modules each industry needs
// ══════════════════════════════════════════════════════════════

const INDUSTRY_PRESETS = {
  
  'restaurant': {
    name: 'Restaurant / Food Service',
    bundles: ['core', 'landing', 'commerce'],
    additionalBackend: ['booking', 'availability', 'notifications'],
    additionalFrontend: ['image-gallery', 'search-filter'],
    variables: {
      itemName: 'menu_item',
      itemNamePlural: 'menu_items',
      bookingType: 'reservation'
    }
  },
  
  'healthcare': {
    name: 'Healthcare / Medical',
    bundles: ['core', 'dashboard', 'healthcare'],
    additionalBackend: ['notifications', 'chat'],
    additionalFrontend: ['form-input', 'date-picker'],
    variables: {
      itemName: 'appointment',
      itemNamePlural: 'appointments',
      bookingType: 'appointment'
    }
  },
  
  'ecommerce': {
    name: 'E-Commerce / Retail',
    bundles: ['core', 'landing', 'commerce', 'dashboard'],
    additionalBackend: ['notifications'],
    additionalFrontend: ['search-filter', 'image-gallery'],
    variables: {
      itemName: 'product',
      itemNamePlural: 'products'
    }
  },
  
  'collectibles': {
    name: 'Collectibles / Trading',
    bundles: ['core', 'landing', 'commerce', 'collectibles', 'dashboard'],
    additionalBackend: ['showcase'],
    additionalFrontend: ['search-filter'],
    variables: {
      itemName: 'card',
      itemNamePlural: 'cards'
    }
  },
  
  'sports': {
    name: 'Sports / Fantasy / Betting',
    bundles: ['core', 'landing', 'social', 'sports', 'dashboard'],
    additionalBackend: ['notifications'],
    additionalFrontend: ['chart-widget'],
    variables: {
      itemName: 'pick',
      itemNamePlural: 'picks'
    }
  },
  
  'saas': {
    name: 'SaaS / B2B Platform',
    bundles: ['core', 'landing', 'commerce', 'dashboard'],
    additionalBackend: ['notifications', 'analytics'],
    additionalFrontend: ['form-wizard', 'progress-tracker'],
    variables: {
      itemName: 'subscription',
      itemNamePlural: 'subscriptions'
    }
  },
  
  'community': {
    name: 'Community / Social',
    bundles: ['core', 'landing', 'social', 'dashboard'],
    additionalBackend: [],
    additionalFrontend: ['avatar-component', 'activity-feed'],
    variables: {
      itemName: 'post',
      itemNamePlural: 'posts'
    }
  }
};

module.exports = {
  MODULE_EXTRACTION_MAP,
  MODULE_BUNDLES,
  INDUSTRY_PRESETS
};
