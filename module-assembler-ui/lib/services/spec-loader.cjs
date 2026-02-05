/**
 * Spec Loader Service
 *
 * Reads and validates shared specification files for coordinated generation.
 * When a spec file is provided, it replaces the auto-generated business data
 * with the shared specification, ensuring consistency across all variants.
 */

const fs = require('fs');
const path = require('path');

/**
 * Schema for spec file validation
 */
const SPEC_SCHEMA = {
  business: {
    required: ['name', 'industry'],
    optional: ['id', 'tagline', 'description', 'contact', 'hours', 'branding']
  },
  database: {
    required: [],
    optional: ['tables', 'relationships', 'indexes']
  },
  api: {
    required: [],
    optional: ['endpoints', 'authentication', 'rateLimit']
  },
  features: {
    required: [],
    optional: ['enabled', 'disabled', 'config']
  },
  agents: {
    required: [],
    optional: ['definitions', 'workflows', 'triggers']
  },
  theme: {
    required: [],
    optional: ['colors', 'fonts', 'spacing', 'moodSliders']
  }
};

class SpecLoader {
  constructor(options = {}) {
    this.verbose = options.verbose !== false;
    this.strictValidation = options.strictValidation || false;
    this.spec = null;
    this.specPath = null;
    this.errors = [];
    this.warnings = [];
  }

  log(message, level = 'info') {
    if (!this.verbose) return;
    const prefix = {
      info: '📋',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      spec: '📄'
    }[level] || '📋';
    console.log(`${prefix} [SpecLoader] ${message}`);
  }

  /**
   * Load a spec file from disk
   * @param {string} specPath - Path to the spec JSON file
   * @returns {Object|null} Parsed spec or null if failed
   */
  load(specPath) {
    this.specPath = specPath;
    this.errors = [];
    this.warnings = [];

    // Resolve path
    const resolvedPath = path.isAbsolute(specPath)
      ? specPath
      : path.resolve(process.cwd(), specPath);

    this.log(`Loading spec file: ${resolvedPath}`, 'spec');

    // Check file exists
    if (!fs.existsSync(resolvedPath)) {
      this.errors.push(`Spec file not found: ${resolvedPath}`);
      this.log(`Spec file not found: ${resolvedPath}`, 'error');
      return null;
    }

    // Read and parse JSON
    try {
      const content = fs.readFileSync(resolvedPath, 'utf-8');
      this.spec = JSON.parse(content);
    } catch (err) {
      this.errors.push(`Failed to parse spec file: ${err.message}`);
      this.log(`Failed to parse spec file: ${err.message}`, 'error');
      return null;
    }

    // Validate structure
    if (!this.validate()) {
      if (this.strictValidation) {
        return null;
      }
      // Non-strict: continue with warnings
      this.warnings.forEach(w => this.log(w, 'warning'));
    }

    this.log(`Spec loaded successfully: ${this.spec.business?.name || 'Unknown'}`, 'success');
    return this.spec;
  }

  /**
   * Validate the spec structure
   * @returns {boolean} True if valid
   */
  validate() {
    if (!this.spec || typeof this.spec !== 'object') {
      this.errors.push('Spec must be a valid JSON object');
      return false;
    }

    let isValid = true;

    // Validate business section (required)
    if (!this.spec.business) {
      this.errors.push('Spec must include a "business" section');
      isValid = false;
    } else {
      for (const field of SPEC_SCHEMA.business.required) {
        if (!this.spec.business[field]) {
          this.errors.push(`business.${field} is required`);
          isValid = false;
        }
      }
    }

    // Validate optional sections
    for (const section of ['database', 'api', 'features', 'agents', 'theme']) {
      if (this.spec[section] && typeof this.spec[section] !== 'object') {
        this.warnings.push(`${section} should be an object`);
      }
    }

    // Validate database tables if present
    if (this.spec.database?.tables && Array.isArray(this.spec.database.tables)) {
      for (const table of this.spec.database.tables) {
        if (!table.name) {
          this.warnings.push('Database table missing name');
        }
        if (!table.columns || !Array.isArray(table.columns)) {
          this.warnings.push(`Database table "${table.name}" missing columns array`);
        }
      }
    }

    // Validate API endpoints if present
    if (this.spec.api?.endpoints && Array.isArray(this.spec.api.endpoints)) {
      for (const endpoint of this.spec.api.endpoints) {
        if (!endpoint.path) {
          this.warnings.push('API endpoint missing path');
        }
        if (!endpoint.methods || !Array.isArray(endpoint.methods)) {
          this.warnings.push(`API endpoint "${endpoint.path}" missing methods array`);
        }
      }
    }

    // Validate agents if present
    if (this.spec.agents?.definitions && Array.isArray(this.spec.agents.definitions)) {
      for (const agent of this.spec.agents.definitions) {
        if (!agent.id) {
          this.warnings.push('Agent definition missing id');
        }
        if (!agent.type) {
          this.warnings.push(`Agent "${agent.id}" missing type`);
        }
      }
    }

    return isValid;
  }

  /**
   * Get business data from spec, formatted for generation
   * @returns {Object} Business data
   */
  getBusinessData() {
    if (!this.spec?.business) {
      return null;
    }

    const b = this.spec.business;
    return {
      name: b.name,
      industry: b.industry,
      tagline: b.tagline || `Welcome to ${b.name}`,
      description: b.description || '',

      // Contact info
      email: b.contact?.email || '',
      phone: b.contact?.phone || '',
      address: b.contact?.address || '',
      website: b.contact?.website || '',

      // Location (parsed from address or explicit)
      location: b.location || this.parseLocation(b.contact?.address),

      // Hours
      hours: b.hours || null,

      // Branding
      branding: b.branding || {},

      // Business ID for tracking
      businessId: b.id || null
    };
  }

  /**
   * Parse location from address string
   */
  parseLocation(address) {
    if (!address) return null;

    // Try to extract city, state from address like "123 Main St, Dallas, TX 75201"
    const match = address.match(/,\s*([^,]+),\s*([A-Z]{2})/i);
    if (match) {
      return {
        city: match[1].trim(),
        state: match[2].trim()
      };
    }
    return null;
  }

  /**
   * Get database schema from spec
   * @returns {Object|null} Database schema
   */
  getDatabaseSchema() {
    return this.spec?.database || null;
  }

  /**
   * Get API contracts from spec
   * @returns {Object|null} API specification
   */
  getApiContracts() {
    return this.spec?.api || null;
  }

  /**
   * Get enabled features from spec
   * @returns {string[]} Array of enabled feature names
   */
  getFeatures() {
    if (!this.spec?.features) {
      return [];
    }
    return this.spec.features.enabled || [];
  }

  /**
   * Get feature config by name
   * @param {string} featureName - Feature name
   * @returns {Object|null} Feature configuration
   */
  getFeatureConfig(featureName) {
    return this.spec?.features?.config?.[featureName] || null;
  }

  /**
   * Get agent definitions from spec
   * @returns {Object[]} Array of agent definitions
   */
  getAgentDefinitions() {
    return this.spec?.agents?.definitions || [];
  }

  /**
   * Get theme configuration from spec
   * @returns {Object|null} Theme configuration
   */
  getTheme() {
    return this.spec?.theme || null;
  }

  /**
   * Get the full spec object
   * @returns {Object|null} Full spec
   */
  getFullSpec() {
    return this.spec;
  }

  /**
   * Check if spec is loaded
   * @returns {boolean}
   */
  isLoaded() {
    return this.spec !== null;
  }

  /**
   * Get validation errors
   * @returns {string[]}
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Get validation warnings
   * @returns {string[]}
   */
  getWarnings() {
    return this.warnings;
  }

  /**
   * Convert spec to brain.json format overlay
   * This returns data that should be merged into brain.json
   * @returns {Object} Brain.json compatible data
   */
  toBrainOverlay() {
    if (!this.spec) return {};

    const business = this.getBusinessData();
    const theme = this.getTheme();
    const features = this.getFeatures();

    return {
      // Business data overlay
      business: business ? {
        name: business.name,
        tagline: business.tagline,
        description: business.description,
        contact: {
          phone: business.phone,
          email: business.email,
          website: business.website
        },
        address: {
          full: business.address
        },
        hours: business.hours,
        branding: business.branding
      } : undefined,

      // Industry override
      industry: business?.industry ? {
        type: business.industry
      } : undefined,

      // Theme overlay
      theme: theme ? {
        colors: theme.colors,
        moodSliders: theme.moodSliders
      } : undefined,

      // Features
      features: features.length > 0 ? features : undefined,

      // Full spec reference (for downstream systems)
      sharedSpec: {
        version: this.spec.version || '1.0.0',
        loadedFrom: this.specPath,
        loadedAt: new Date().toISOString(),

        // Include full sections for admin/backend use
        database: this.spec.database || null,
        api: this.spec.api || null,
        agents: this.spec.agents || null,
        features: this.spec.features || null
      }
    };
  }

  /**
   * Create a sample spec file for reference
   * @param {string} outputPath - Where to write the sample
   */
  static createSampleSpec(outputPath) {
    const sample = {
      "version": "1.0.0",
      "business": {
        "id": "sample-business-001",
        "name": "Bloom Coffee",
        "industry": "coffee-shop",
        "tagline": "Artisan Coffee, Made Fresh Daily",
        "description": "A cozy neighborhood coffee shop specializing in single-origin beans and house-made pastries.",
        "contact": {
          "email": "hello@bloomcoffee.com",
          "phone": "(555) 123-4567",
          "address": "123 Main St, Dallas, TX 75201",
          "website": "https://bloomcoffee.com"
        },
        "hours": {
          "monday": { "open": "06:00", "close": "18:00" },
          "tuesday": { "open": "06:00", "close": "18:00" },
          "wednesday": { "open": "06:00", "close": "18:00" },
          "thursday": { "open": "06:00", "close": "18:00" },
          "friday": { "open": "06:00", "close": "20:00" },
          "saturday": { "open": "07:00", "close": "20:00" },
          "sunday": { "open": "08:00", "close": "16:00" }
        },
        "branding": {
          "logo": null,
          "primaryColor": "#6B4226",
          "accentColor": "#D4A574"
        }
      },
      "database": {
        "tables": [
          {
            "name": "customers",
            "columns": [
              { "name": "id", "type": "uuid", "primary": true },
              { "name": "email", "type": "string", "unique": true },
              { "name": "name", "type": "string" },
              { "name": "phone", "type": "string", "nullable": true },
              { "name": "loyalty_points", "type": "integer", "default": 0 },
              { "name": "created_at", "type": "timestamp" }
            ]
          },
          {
            "name": "orders",
            "columns": [
              { "name": "id", "type": "uuid", "primary": true },
              { "name": "customer_id", "type": "uuid", "references": "customers.id" },
              { "name": "status", "type": "enum", "values": ["pending", "preparing", "ready", "completed", "cancelled"] },
              { "name": "total", "type": "decimal", "precision": 10, "scale": 2 },
              { "name": "created_at", "type": "timestamp" }
            ]
          },
          {
            "name": "menu_items",
            "columns": [
              { "name": "id", "type": "uuid", "primary": true },
              { "name": "name", "type": "string" },
              { "name": "description", "type": "text", "nullable": true },
              { "name": "price", "type": "decimal", "precision": 10, "scale": 2 },
              { "name": "category", "type": "string" },
              { "name": "available", "type": "boolean", "default": true }
            ]
          }
        ]
      },
      "api": {
        "endpoints": [
          { "path": "/api/menu", "methods": ["GET"], "auth": false, "description": "Get menu items" },
          { "path": "/api/orders", "methods": ["GET", "POST"], "auth": true, "description": "Manage orders" },
          { "path": "/api/orders/:id", "methods": ["GET", "PATCH"], "auth": true, "description": "Single order operations" },
          { "path": "/api/customers/me", "methods": ["GET", "PATCH"], "auth": true, "description": "Current customer profile" },
          { "path": "/api/loyalty", "methods": ["GET"], "auth": true, "description": "Loyalty program status" }
        ],
        "authentication": {
          "type": "jwt",
          "expiresIn": "7d"
        }
      },
      "features": {
        "enabled": [
          "online-ordering",
          "loyalty-program",
          "gift-cards",
          "mobile-app",
          "push-notifications"
        ],
        "config": {
          "loyalty-program": {
            "pointsPerDollar": 10,
            "rewardThreshold": 100,
            "rewardValue": 5
          },
          "gift-cards": {
            "minAmount": 10,
            "maxAmount": 500
          }
        }
      },
      "agents": {
        "definitions": [
          {
            "id": "support-agent",
            "name": "Customer Support",
            "type": "support",
            "capabilities": ["handle-tickets", "answer-questions", "process-refunds"],
            "personality": "friendly and helpful"
          },
          {
            "id": "inventory-agent",
            "name": "Inventory Manager",
            "type": "inventory",
            "capabilities": ["track-stock", "order-supplies", "forecast-demand"],
            "triggers": ["low-stock", "daily-report"]
          }
        ]
      },
      "theme": {
        "colors": {
          "primary": "#6B4226",
          "secondary": "#F5E6D3",
          "accent": "#D4A574",
          "background": "#FFFBF5",
          "text": "#2D2D2D"
        },
        "moodSliders": {
          "vibe": 60,
          "energy": 40,
          "era": 50,
          "density": 30,
          "price": 50
        }
      }
    };

    fs.writeFileSync(outputPath, JSON.stringify(sample, null, 2));
    console.log(`Sample spec file created: ${outputPath}`);
    return sample;
  }
}

module.exports = { SpecLoader };
