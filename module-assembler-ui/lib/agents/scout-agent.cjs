/**
 * Scout Agent
 *
 * Finds local businesses without websites and prepares them for generation.
 *
 * Data Sources (all have free tiers):
 *   - Yelp Fusion API: 5,000 requests/day free
 *   - Google Places API: $200 free credit/month
 *   - Manual CSV import: Truly zero cost
 *
 * This is ADDITIVE - doesn't modify any existing code.
 *
 * Usage:
 *   const { ScoutAgent } = require('./lib/agents/scout-agent.cjs');
 *   const scout = new ScoutAgent({ yelpApiKey: '...' });
 *   const prospects = await scout.scan({ location: 'Dallas, TX', industry: 'salon' });
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Industry mapping: search terms -> fixture IDs
const INDUSTRY_MAP = {
  // Food & Beverage
  'pizza': 'pizza-restaurant',
  'pizzeria': 'pizza-restaurant',
  'steakhouse': 'steakhouse',
  'fine dining': 'steakhouse',
  'coffee': 'coffee-cafe',
  'cafe': 'coffee-cafe',
  'coffee shop': 'coffee-cafe',
  'restaurant': 'restaurant',
  'bakery': 'bakery',
  'bar': 'restaurant',
  'grill': 'restaurant',

  // Beauty & Wellness
  'salon': 'salon-spa',
  'spa': 'salon-spa',
  'hair salon': 'salon-spa',
  'nail salon': 'salon-spa',
  'nails': 'salon-spa',
  'barbershop': 'barbershop',
  'barber': 'barbershop',
  'barbers': 'barbershop',
  'barber_shop': 'barbershop',      // Google Places API format
  'hair_salon': 'salon-spa',        // Google Places API format
  'beauty_salon': 'salon-spa',      // Google Places API format
  'nail_salon': 'salon-spa',        // Google Places API format
  'hair_care': 'salon-spa',         // Google Places API format
  'yoga': 'yoga',
  'yoga studio': 'yoga',
  'pilates': 'yoga',
  'gym': 'fitness-gym',
  'fitness': 'fitness-gym',
  'crossfit': 'fitness-gym',

  // Healthcare
  'dentist': 'dental',
  'dental': 'dental',
  'doctor': 'healthcare',
  'clinic': 'healthcare',
  'medical': 'healthcare',
  'chiropractor': 'healthcare',
  'physical therapy': 'healthcare',

  // Professional Services
  'lawyer': 'law-firm',
  'law firm': 'law-firm',
  'attorney': 'law-firm',
  'real estate': 'real-estate',
  'realtor': 'real-estate',

  // Home Services
  'plumber': 'plumber',
  'plumbing': 'plumber',
  'cleaning': 'cleaning',
  'maid': 'cleaning',
  'auto': 'auto-shop',
  'mechanic': 'auto-shop',
  'auto repair': 'auto-shop',
  'car repair': 'auto-shop',
  'car_repair': 'auto-shop',           // Google Places API format
  'auto_repair': 'auto-shop',          // Google Places API format
  'automotive': 'auto-shop',
  'auto shop': 'auto-shop',
  'auto_shop': 'auto-shop',            // Google Places API format
  'car_dealer': 'auto-shop',           // Google Places API format
  'car_wash': 'auto-shop',             // Google Places API format
  'tire_shop': 'auto-shop',            // Google Places API format
  'tire shop': 'auto-shop',
  'oil change': 'auto-shop',
  'body shop': 'auto-shop',

  // Other
  'school': 'school',
  'academy': 'school',
  'tutoring': 'school',
  'retail': 'ecommerce',
  'shop': 'ecommerce',
  'store': 'ecommerce'
};

class ScoutAgent {
  constructor(options = {}) {
    this.name = 'Scout Agent';
    this.verbose = options.verbose !== false;

    // API Keys (optional - can work without them using CSV)
    this.yelpApiKey = options.yelpApiKey || process.env.YELP_API_KEY;
    this.googleApiKey = options.googleApiKey || process.env.GOOGLE_PLACES_API_KEY;

    // Output paths
    this.prospectsDir = options.prospectsDir || path.join(__dirname, '../../output/prospects');

    // Stats
    this.stats = {
      scanned: 0,
      withWebsite: 0,
      withoutWebsite: 0,
      researched: 0,
      errors: 0
    };
  }

  log(message, level = 'info') {
    if (!this.verbose) return;

    const prefix = {
      info: '🔍',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      prospect: '🎯'
    }[level] || '📋';

    console.log(`${prefix} [${this.name}] ${message}`);
  }

  /**
   * Scan for businesses in a location
   *
   * Discovery uses Google Places (more accurate for finding businesses without websites)
   * Research uses Yelp Fusion (richer data for enrichment)
   */
  async scan(options = {}) {
    const {
      location,           // "Dallas, TX" or "75201"
      industry,           // "salon", "restaurant", etc.
      radius = 10000,     // meters (10km default)
      limit = 50,         // max results
      source = 'google',  // 'google' for discovery (default), 'yelp' for alternative
      includeWithWebsite = false,  // Set true to return all businesses
      enrichWithYelp = false       // NEW: Research prospects via Yelp after discovery
    } = options;

    this.log(`Scanning ${location} for ${industry || 'all'} businesses...`);

    let businesses = [];

    // DISCOVERY PHASE: Use Google (more accurate for website detection)
    if (source === 'google' && this.googleApiKey) {
      businesses = await this.scanGoogle({ location, industry, radius, limit });
    } else if (source === 'yelp' && this.yelpApiKey) {
      businesses = await this.scanYelp({ location, industry, limit });
    } else if (this.googleApiKey) {
      // Default to Google for discovery
      businesses = await this.scanGoogle({ location, industry, radius, limit });
    } else if (this.yelpApiKey) {
      // Fallback to Yelp if no Google key
      businesses = await this.scanYelp({ location, industry, limit });
    } else {
      this.log('No API keys configured. Use CSV import or set YELP_API_KEY / GOOGLE_PLACES_API_KEY', 'warning');
      return { prospects: [], stats: this.stats };
    }

    // Log website detection results
    const withWebsite = businesses.filter(b => b.hasWebsite);
    const withoutWebsite = businesses.filter(b => !b.hasWebsite);

    this.log(`Results: ${withWebsite.length} WITH websites, ${withoutWebsite.length} WITHOUT websites`, 'info');

    if (withWebsite.length > 0) {
      this.log(`Businesses with websites:`, 'info');
      withWebsite.forEach(b => this.log(`  - ${b.name}: ${b.website}`, 'info'));
    }

    // Filter to those without websites (unless includeWithWebsite is true)
    let prospects = includeWithWebsite ? businesses : withoutWebsite;

    // RESEARCH PHASE: Enrich with Yelp data (if enabled)
    if (enrichWithYelp && this.yelpApiKey && prospects.length > 0) {
      this.log(`\nEnriching ${prospects.length} prospects with Yelp research...`);
      prospects = await this.researchProspects(prospects);
    }

    // Initialize CRM status for all prospects
    prospects = prospects.map(p => ({
      ...p,
      crm: p.crm || {
        status: enrichWithYelp && p.research ? 'researched' : 'discovered',
        history: [{
          activity: 'discovered',
          details: `Found via ${source} search in ${location}`,
          timestamp: new Date().toISOString()
        }],
        notes: '',
        nextAction: null,
        assignedTo: null
      }
    }));

    this.log(`Returning ${prospects.length} prospects`, 'success');

    return {
      prospects,
      stats: this.stats,
      location,
      industry,
      scannedAt: new Date().toISOString(),
      totalScanned: businesses.length,
      withWebsite: withWebsite.length,
      withoutWebsite: withoutWebsite.length,
      enrichedWithYelp: enrichWithYelp
    };
  }

  /**
   * Scan using Yelp Fusion API (5,000 free/day)
   * Note: Requires details call for each business to check website
   */
  async scanYelp(options = {}) {
    const { location, industry, limit = 50 } = options;

    if (!this.yelpApiKey) {
      this.log('Yelp API key not configured', 'error');
      return [];
    }

    const searchTerm = industry || 'business';
    const url = `https://api.yelp.com/v3/businesses/search?location=${encodeURIComponent(location)}&term=${encodeURIComponent(searchTerm)}&limit=${Math.min(limit, 50)}`;

    try {
      const data = await this.httpGet(url, {
        'Authorization': `Bearer ${this.yelpApiKey}`
      });

      const parsed = JSON.parse(data);

      if (parsed.error) {
        this.log(`Yelp API error: ${parsed.error.description}`, 'error');
        return [];
      }

      // Get basic business info first
      const basicBusinesses = (parsed.businesses || []).map(b => this.normalizeYelpBusiness(b, industry));

      this.log(`Found ${basicBusinesses.length} businesses, checking for websites...`);

      // Check each business for website (requires details API call)
      const businesses = [];
      for (const business of basicBusinesses) {
        const detailed = await this.getYelpDetails(business);
        businesses.push(detailed);
        this.stats.scanned++;

        if (detailed.hasWebsite) {
          this.stats.withWebsite++;
          this.log(`  ${business.name}: has website ✗`, 'info');
        } else {
          this.stats.withoutWebsite++;
          this.log(`  ${business.name}: NO website ✓`, 'prospect');
        }
      }

      return businesses;

    } catch (err) {
      this.log(`Yelp scan failed: ${err.message}`, 'error');
      this.stats.errors++;
      return [];
    }
  }

  /**
   * Scan using Google Places API (New) - Text Search
   * This returns businesses and we then get details to check for websites
   */
  async scanGoogle(options = {}) {
    const { location, industry, radius = 10000, limit = 50 } = options;

    if (!this.googleApiKey) {
      this.log('Google Places API key not configured', 'error');
      return [];
    }

    const searchQuery = industry ? `${industry} in ${location}` : `businesses in ${location}`;
    this.log(`Searching Google Places: "${searchQuery}"`);

    try {
      // Use Text Search (New) API
      const searchUrl = 'https://places.googleapis.com/v1/places:searchText';

      const searchBody = JSON.stringify({
        textQuery: searchQuery,
        maxResultCount: Math.min(limit, 20), // Max 20 per request
        languageCode: "en"
      });

      const searchResponse = await this.httpPost(searchUrl, searchBody, {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': this.googleApiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.types,places.rating,places.userRatingCount,places.websiteUri,places.googleMapsUri,places.location,places.photos,places.primaryType'
      });

      const parsed = JSON.parse(searchResponse);

      if (parsed.error) {
        this.log(`Google API error: ${parsed.error.message}`, 'error');
        return [];
      }

      const places = parsed.places || [];
      this.log(`Found ${places.length} businesses, checking websites...`);

      const businesses = [];

      for (const place of places) {
        const hasWebsite = !!(place.websiteUri && place.websiteUri.trim());

        // Build photo URL from Google Places photo reference
        const photoRef = place.photos?.[0]?.name;
        const photoUrl = photoRef
          ? `https://places.googleapis.com/v1/${photoRef}/media?maxHeightPx=400&maxWidthPx=400&key=${this.googleApiKey}`
          : null;

        const business = {
          id: place.id,
          name: place.displayName?.text || 'Unknown',
          address: place.formattedAddress || '',
          phone: place.nationalPhoneNumber || '',
          category: place.primaryType || place.types?.[0] || '',
          website: place.websiteUri || null,
          hasWebsite,
          rating: place.rating,
          reviewCount: place.userRatingCount,
          photo: photoUrl,  // Single thumbnail URL
          photos: place.photos?.map(p => `https://places.googleapis.com/v1/${p.name}/media?maxHeightPx=400&maxWidthPx=400&key=${this.googleApiKey}`) || [],
          fixtureId: this.mapToFixture(place.primaryType || place.types?.[0] || industry || ''),
          source: 'google',
          googleMapsUrl: place.googleMapsUri,
          coordinates: place.location ? {
            latitude: place.location.latitude,
            longitude: place.location.longitude
          } : null,
          raw: place
        };

        businesses.push(business);
        this.stats.scanned++;

        if (hasWebsite) {
          this.stats.withWebsite++;
          this.log(`  ${business.name}: has website (${place.websiteUri}) ✗`, 'info');
        } else {
          this.stats.withoutWebsite++;
          this.log(`  ${business.name}: NO website ✓`, 'prospect');
        }
      }

      return businesses;

    } catch (err) {
      this.log(`Google scan failed: ${err.message}`, 'error');
      this.stats.errors++;
      return [];
    }
  }

  // ================================================================
  // RESEARCH & ENRICHMENT (Phase 2: After Discovery)
  // ================================================================

  /**
   * Research and enrich prospects using Yelp Fusion API
   * Call this AFTER discovery to add ratings, reviews, price level
   *
   * @param {Array} prospects - Array of prospects from scan()
   * @param {Object} options - Research options
   * @returns {Array} - Enriched prospects with research data
   */
  async researchProspects(prospects, options = {}) {
    const { skipWithResearch = true } = options;

    if (!this.yelpApiKey) {
      this.log('Yelp API key not configured - skipping research enrichment', 'warning');
      return prospects;
    }

    this.log(`Researching ${prospects.length} prospects via Yelp...`);

    const enriched = [];

    for (const prospect of prospects) {
      // Skip if already researched
      if (skipWithResearch && prospect.research?.enrichedAt) {
        enriched.push(prospect);
        continue;
      }

      try {
        const research = await this.researchSingleProspect(prospect);
        const { score, breakdown } = this.calculateOpportunityScore(prospect, research);
        const city = this.extractCity(prospect.address);
        enriched.push({
          ...prospect,
          research,
          opportunityScore: score,
          scoreBreakdown: breakdown,
          city  // Store extracted city
        });
        this.stats.researched++;
      } catch (err) {
        this.log(`Research failed for ${prospect.name}: ${err.message}`, 'warning');
        enriched.push(prospect);
      }

      // Small delay to avoid rate limiting
      await this.sleep(200);
    }

    // Sort by opportunity score (highest first)
    enriched.sort((a, b) => (b.opportunityScore || 0) - (a.opportunityScore || 0));

    this.log(`Research complete: ${this.stats.researched} prospects enriched`, 'success');
    return enriched;
  }

  /**
   * Research a single prospect using Yelp Business Match + Details
   */
  async researchSingleProspect(prospect) {
    const research = {
      source: 'yelp',
      enrichedAt: new Date().toISOString(),
      matched: false
    };

    // Try to match this business on Yelp
    const yelpMatch = await this.findYelpMatch(prospect);

    if (!yelpMatch) {
      research.matchStatus = 'not_found';
      research.notes = 'No Yelp listing found - may be very new or unlisted';
      return research;
    }

    research.matched = true;
    research.yelpId = yelpMatch.id;
    research.yelpUrl = yelpMatch.url;
    research.matchStatus = 'found';

    // Get detailed info
    const details = await this.getYelpBusinessDetails(yelpMatch.id);

    if (details) {
      research.rating = details.rating;
      research.reviewCount = details.review_count;
      research.priceLevel = details.price; // $, $$, $$$, $$$$
      research.categories = details.categories?.map(c => c.title) || [];
      research.photos = details.photos || [];
      research.hours = details.hours?.[0]?.open || null;
      research.isOpen = details.hours?.[0]?.is_open_now;
      research.transactions = details.transactions || []; // delivery, pickup, etc.

      // Review highlights (if available)
      if (details.reviews) {
        research.reviewHighlights = details.reviews.slice(0, 3).map(r => ({
          rating: r.rating,
          text: r.text?.substring(0, 200),
          time: r.time_created
        }));
      }
    }

    return research;
  }

  /**
   * Find a Yelp business matching our prospect
   * Uses Yelp Business Match API
   */
  async findYelpMatch(prospect) {
    // Try Business Match first (most accurate)
    const matchUrl = 'https://api.yelp.com/v3/businesses/matches';
    const params = new URLSearchParams({
      name: prospect.name,
      city: this.extractCity(prospect.address),
      state: this.extractState(prospect.address),
      country: 'US'
    });

    if (prospect.address) {
      const streetAddress = this.extractStreetAddress(prospect.address);
      if (streetAddress) params.append('address1', streetAddress);
    }

    if (prospect.phone) {
      // Clean phone for Yelp format
      const cleanPhone = prospect.phone.replace(/\D/g, '');
      if (cleanPhone.length >= 10) {
        params.append('phone', '+1' + cleanPhone.slice(-10));
      }
    }

    try {
      const data = await this.httpGet(`${matchUrl}?${params}`, {
        'Authorization': `Bearer ${this.yelpApiKey}`
      });

      const parsed = JSON.parse(data);

      if (parsed.businesses && parsed.businesses.length > 0) {
        return parsed.businesses[0];
      }
    } catch (err) {
      // Match API might fail, fall back to search
    }

    // Fallback: Search by name + location
    return this.searchYelpFallback(prospect);
  }

  /**
   * Fallback search if Business Match fails
   */
  async searchYelpFallback(prospect) {
    const searchUrl = 'https://api.yelp.com/v3/businesses/search';
    const location = this.extractCity(prospect.address) + ', ' + this.extractState(prospect.address);

    const params = new URLSearchParams({
      term: prospect.name,
      location: location,
      limit: '3'
    });

    try {
      const data = await this.httpGet(`${searchUrl}?${params}`, {
        'Authorization': `Bearer ${this.yelpApiKey}`
      });

      const parsed = JSON.parse(data);

      if (parsed.businesses && parsed.businesses.length > 0) {
        // Find best match by name similarity
        const match = parsed.businesses.find(b =>
          this.normalizeBusinessName(b.name) === this.normalizeBusinessName(prospect.name)
        ) || parsed.businesses[0];

        return match;
      }
    } catch (err) {
      this.log(`Yelp search fallback failed: ${err.message}`, 'warning');
    }

    return null;
  }

  /**
   * Get detailed Yelp business info
   */
  async getYelpBusinessDetails(yelpId) {
    const url = `https://api.yelp.com/v3/businesses/${yelpId}`;

    try {
      const data = await this.httpGet(url, {
        'Authorization': `Bearer ${this.yelpApiKey}`
      });
      return JSON.parse(data);
    } catch (err) {
      return null;
    }
  }

  // ================================================================
  // OPPORTUNITY SCORING (Phase 3: Rank Prospects)
  // ================================================================

  /**
   * Calculate opportunity score (0-100) for a prospect
   * Higher = better opportunity for outreach
   * Returns { score, breakdown } with reasoning
   */
  calculateOpportunityScore(prospect, research = {}) {
    const breakdown = [];
    let score = 50;
    breakdown.push({ factor: 'No website (base)', points: 50, source: 'Google' });

    // Rating factors
    if (research.rating) {
      if (research.rating >= 4.5) {
        score += 15;
        breakdown.push({ factor: `Excellent rating (${research.rating}★)`, points: 15, source: 'Yelp' });
      } else if (research.rating >= 4.0) {
        score += 10;
        breakdown.push({ factor: `Good rating (${research.rating}★)`, points: 10, source: 'Yelp' });
      } else if (research.rating >= 3.5) {
        score += 5;
        breakdown.push({ factor: `Decent rating (${research.rating}★)`, points: 5, source: 'Yelp' });
      } else if (research.rating < 3.0) {
        score -= 10;
        breakdown.push({ factor: `Low rating (${research.rating}★)`, points: -10, source: 'Yelp' });
      }
    }

    // Review count factors
    if (research.reviewCount) {
      if (research.reviewCount > 100) {
        score += 10;
        breakdown.push({ factor: `Many reviews (${research.reviewCount})`, points: 10, source: 'Yelp' });
      } else if (research.reviewCount > 50) {
        score += 8;
        breakdown.push({ factor: `Good reviews (${research.reviewCount})`, points: 8, source: 'Yelp' });
      } else if (research.reviewCount > 20) {
        score += 5;
        breakdown.push({ factor: `Some reviews (${research.reviewCount})`, points: 5, source: 'Yelp' });
      } else if (research.reviewCount < 5) {
        score -= 5;
        breakdown.push({ factor: `Few reviews (${research.reviewCount})`, points: -5, source: 'Yelp' });
      }
    }

    // Price level (higher price = more budget for website)
    if (research.priceLevel) {
      const priceLevels = { '$': 0, '$$': 5, '$$$': 10, '$$$$': 15 };
      const pts = priceLevels[research.priceLevel] || 0;
      if (pts > 0) {
        score += pts;
        breakdown.push({ factor: `Price level (${research.priceLevel})`, points: pts, source: 'Yelp' });
      }
    }

    // No Yelp listing at all = very low online presence
    if (!research.matched) {
      score += 5;
      breakdown.push({ factor: 'No Yelp listing (low online presence)', points: 5, source: 'Yelp' });
    }

    // Has photos on Yelp = cares about presentation
    if (research.photos?.length > 3) {
      score += 5;
      breakdown.push({ factor: `Has photos (${research.photos.length})`, points: 5, source: 'Yelp' });
    }

    // Industry bonus (some industries convert better)
    const highValueIndustries = ['dental', 'law-firm', 'real-estate', 'healthcare', 'auto-shop'];
    if (highValueIndustries.includes(prospect.fixtureId)) {
      score += 10;
      breakdown.push({ factor: `High-value industry (${prospect.fixtureId})`, points: 10, source: 'Industry' });
    }

    // Cap score between 0-100
    const finalScore = Math.max(0, Math.min(100, score));

    return { score: finalScore, breakdown };
  }

  /**
   * Get score breakdown explanation
   * Returns saved breakdown if available, otherwise recalculates
   */
  getScoreBreakdown(prospect) {
    // Use saved breakdown if available
    if (prospect.scoreBreakdown) {
      return prospect.scoreBreakdown;
    }

    // Otherwise recalculate
    const { breakdown } = this.calculateOpportunityScore(prospect, prospect.research || {});
    return breakdown;
  }

  // ================================================================
  // SIMPLE CRM (Phase 4: Track Outreach)
  // ================================================================

  /**
   * CRM Status values
   */
  static CRM_STATUSES = [
    'discovered',      // Just found by scout
    'researched',      // Enriched with Yelp data
    'queued',          // Ready for outreach
    'contacted',       // Email/call sent
    'responded',       // They replied
    'meeting',         // Demo/call scheduled
    'proposal',        // Quote sent
    'won',             // Converted to customer!
    'lost',            // Said no
    'not_interested',  // Explicitly declined
    'bad_fit'          // We decided not to pursue
  ];

  /**
   * Update prospect CRM status
   */
  updateProspectStatus(prospect, status, note = '') {
    if (!ScoutAgent.CRM_STATUSES.includes(status)) {
      throw new Error(`Invalid status: ${status}. Valid: ${ScoutAgent.CRM_STATUSES.join(', ')}`);
    }

    // Initialize CRM if needed
    if (!prospect.crm) {
      prospect.crm = {
        status: 'discovered',
        history: [],
        notes: '',
        nextAction: null,
        assignedTo: null
      };
    }

    // Add to history
    prospect.crm.history.push({
      from: prospect.crm.status,
      to: status,
      note,
      timestamp: new Date().toISOString()
    });

    prospect.crm.status = status;

    return prospect;
  }

  /**
   * Add activity to prospect history
   */
  addActivity(prospect, activity, details = '') {
    if (!prospect.crm) {
      prospect.crm = {
        status: 'discovered',
        history: [],
        notes: '',
        nextAction: null,
        assignedTo: null
      };
    }

    prospect.crm.history.push({
      activity,
      details,
      timestamp: new Date().toISOString()
    });

    return prospect;
  }

  /**
   * Set next action for follow-up
   */
  setNextAction(prospect, action, dueDate) {
    if (!prospect.crm) {
      prospect.crm = { status: 'discovered', history: [], notes: '', nextAction: null, assignedTo: null };
    }

    prospect.crm.nextAction = {
      action,
      dueDate: dueDate instanceof Date ? dueDate.toISOString() : dueDate
    };

    return prospect;
  }

  /**
   * Get prospects by CRM status
   */
  getProspectsByStatus(prospects, status) {
    return prospects.filter(p => p.crm?.status === status);
  }

  /**
   * Get prospects needing follow-up
   */
  getProspectsNeedingFollowUp(prospects) {
    const now = new Date();
    return prospects.filter(p => {
      if (!p.crm?.nextAction?.dueDate) return false;
      return new Date(p.crm.nextAction.dueDate) <= now;
    });
  }

  // ================================================================
  // OUTREACH DRAFTS (Phase 5: Email Templates)
  // ================================================================

  /**
   * Generate personalized outreach email draft
   */
  generateOutreachDraft(prospect) {
    const research = prospect.research || {};
    const businessName = prospect.name;
    const industry = this.getIndustryDisplayName(prospect.fixtureId);

    // Personalization elements
    const hasGoodRating = research.rating >= 4.0;
    const hasReviews = research.reviewCount > 10;
    const priceLevel = research.priceLevel;

    let subject = `Quick question about ${businessName}'s online presence`;
    let opener = '';
    let middleParagraph = '';

    // Personalize based on research
    if (hasGoodRating && hasReviews) {
      opener = `I came across ${businessName} and was impressed by your ${research.rating}-star rating with ${research.reviewCount} reviews. Your customers clearly love what you do!`;
      middleParagraph = `With such great reviews, it's surprising you don't have a website to showcase them. A professional site could help convert even more potential customers who search for "${industry} near me."`;
    } else if (hasGoodRating) {
      opener = `I noticed ${businessName} has a great ${research.rating}-star rating on Yelp. Quality like that deserves to be seen!`;
      middleParagraph = `Right now, potential customers searching online might not find you. A simple, professional website could change that.`;
    } else {
      opener = `I'm reaching out to local ${industry} businesses in the area, and ${businessName} caught my attention.`;
      middleParagraph = `In today's world, most customers search online before visiting. Having a professional website can make all the difference.`;
    }

    const email = {
      subject,
      body: `Hi there,

${opener}

${middleParagraph}

I help local businesses like yours get online quickly with professional websites that:
• Look great on phones (where most searches happen)
• Show up in Google searches
• Let customers book appointments or contact you easily

Would you be open to a quick 10-minute call to see if this might be a fit? No pressure, just a conversation.

Best,
[Your Name]

P.S. I can show you exactly what a site for ${businessName} could look like - no commitment required.`,
      personalizations: {
        usedRating: hasGoodRating,
        usedReviews: hasReviews,
        usedPriceLevel: !!priceLevel
      }
    };

    return email;
  }

  /**
   * Get display name for industry
   */
  getIndustryDisplayName(fixtureId) {
    const names = {
      'barbershop': 'barbershop',
      'salon-spa': 'salon',
      'dental': 'dental practice',
      'restaurant': 'restaurant',
      'pizza-restaurant': 'pizzeria',
      'coffee-cafe': 'coffee shop',
      'bakery': 'bakery',
      'law-firm': 'law firm',
      'real-estate': 'real estate agency',
      'plumber': 'plumbing service',
      'auto-shop': 'auto shop',
      'healthcare': 'healthcare provider',
      'yoga': 'yoga studio',
      'fitness-gym': 'fitness center',
      'cleaning': 'cleaning service',
      'school': 'school',
      'ecommerce': 'retail business'
    };
    return names[fixtureId] || 'business';
  }

  // ================================================================
  // HELPER METHODS
  // ================================================================

  /**
   * Extract city from address string
   * Handles various formats:
   *   - "123 Main St, Dallas, TX 75201"
   *   - "123 Main St, Dallas TX"
   *   - "Dallas, TX"
   *   - "75067" (zipcode only - uses lookup)
   */
  extractCity(address) {
    if (!address) return '';

    // Check if it's just a zipcode
    const zipOnly = address.trim().match(/^(\d{5})(-\d{4})?$/);
    if (zipOnly) {
      return this.zipToCity(zipOnly[1]) || address;
    }

    // Try to extract zipcode and look up city
    // Look for patterns like "TX 75252" or "75252, USA" or ", 75252" (more specific than just any 5 digits)
    const zipPatterns = [
      /[A-Z]{2}\s+(\d{5})(?:\s|,|$)/,     // State abbreviation + zip: "TX 75252"
      /,\s*(\d{5})(?:\s|,|$)/,             // After comma: ", 75252"
      /(\d{5})(?:,?\s*USA)?$/i             // At end, possibly with USA: "75252, USA" or "75252"
    ];

    for (const pattern of zipPatterns) {
      const zipMatch = address.match(pattern);
      if (zipMatch) {
        const cityFromZip = this.zipToCity(zipMatch[1]);
        if (cityFromZip) return cityFromZip;
      }
    }

    // Common patterns: "123 Main St, Dallas, TX 75201" or "123 Main St, Dallas TX"
    const parts = address.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      // Second to last part often has city
      const cityPart = parts[parts.length - 2] || parts[parts.length - 1];
      // Remove state abbreviation and zipcode if present
      const cleaned = cityPart.replace(/\s+[A-Z]{2}(\s+\d{5}(-\d{4})?)?$/, '').trim();
      if (cleaned && cleaned.length > 1) return cleaned;
    }

    return address;
  }

  /**
   * Zipcode to city lookup (DFW area focused, expandable)
   */
  zipToCity(zip) {
    const zipCityMap = {
      // Lewisville
      '75029': 'Lewisville', '75056': 'Lewisville', '75057': 'Lewisville',
      '75067': 'Lewisville', '75077': 'Lewisville',
      // Plano
      '75023': 'Plano', '75024': 'Plano', '75025': 'Plano', '75026': 'Plano',
      '75074': 'Plano', '75075': 'Plano', '75086': 'Plano', '75093': 'Plano',
      '75094': 'Plano',
      // Frisco
      '75033': 'Frisco', '75034': 'Frisco', '75035': 'Frisco',
      // Allen
      '75002': 'Allen', '75013': 'Allen',
      // McKinney
      '75069': 'McKinney', '75070': 'McKinney', '75071': 'McKinney',
      '75072': 'McKinney',
      // Dallas
      '75201': 'Dallas', '75202': 'Dallas', '75203': 'Dallas', '75204': 'Dallas',
      '75205': 'Dallas', '75206': 'Dallas', '75207': 'Dallas', '75208': 'Dallas',
      '75209': 'Dallas', '75210': 'Dallas', '75211': 'Dallas', '75212': 'Dallas',
      '75214': 'Dallas', '75215': 'Dallas', '75216': 'Dallas', '75217': 'Dallas',
      '75218': 'Dallas', '75219': 'Dallas', '75220': 'Dallas', '75223': 'Dallas',
      '75224': 'Dallas', '75225': 'Dallas', '75226': 'Dallas', '75227': 'Dallas',
      '75228': 'Dallas', '75229': 'Dallas', '75230': 'Dallas', '75231': 'Dallas',
      '75232': 'Dallas', '75233': 'Dallas', '75234': 'Dallas', '75235': 'Dallas',
      '75236': 'Dallas', '75237': 'Dallas', '75238': 'Dallas', '75240': 'Dallas',
      '75241': 'Dallas', '75242': 'Dallas', '75243': 'Dallas', '75244': 'Dallas',
      '75246': 'Dallas', '75247': 'Dallas', '75248': 'Dallas', '75249': 'Dallas',
      '75250': 'Dallas', '75251': 'Dallas', '75252': 'Dallas', '75253': 'Dallas',
      '75254': 'Dallas',
      // Fort Worth
      '76101': 'Fort Worth', '76102': 'Fort Worth', '76103': 'Fort Worth',
      '76104': 'Fort Worth', '76105': 'Fort Worth', '76106': 'Fort Worth',
      '76107': 'Fort Worth', '76108': 'Fort Worth', '76109': 'Fort Worth',
      '76110': 'Fort Worth', '76111': 'Fort Worth', '76112': 'Fort Worth',
      '76113': 'Fort Worth', '76114': 'Fort Worth', '76115': 'Fort Worth',
      '76116': 'Fort Worth', '76117': 'Fort Worth', '76118': 'Fort Worth',
      '76119': 'Fort Worth', '76120': 'Fort Worth', '76121': 'Fort Worth',
      '76122': 'Fort Worth', '76123': 'Fort Worth', '76124': 'Fort Worth',
      '76126': 'Fort Worth', '76127': 'Fort Worth', '76129': 'Fort Worth',
      '76130': 'Fort Worth', '76131': 'Fort Worth', '76132': 'Fort Worth',
      '76133': 'Fort Worth', '76134': 'Fort Worth', '76135': 'Fort Worth',
      '76136': 'Fort Worth', '76137': 'Fort Worth', '76140': 'Fort Worth',
      // Arlington
      '76001': 'Arlington', '76002': 'Arlington', '76003': 'Arlington',
      '76004': 'Arlington', '76005': 'Arlington', '76006': 'Arlington',
      '76010': 'Arlington', '76011': 'Arlington', '76012': 'Arlington',
      '76013': 'Arlington', '76014': 'Arlington', '76015': 'Arlington',
      '76016': 'Arlington', '76017': 'Arlington', '76018': 'Arlington',
      '76019': 'Arlington',
      // Irving
      '75014': 'Irving', '75015': 'Irving', '75016': 'Irving', '75017': 'Irving',
      '75038': 'Irving', '75039': 'Irving', '75060': 'Irving', '75061': 'Irving',
      '75062': 'Irving', '75063': 'Irving',
      // Carrollton
      '75006': 'Carrollton', '75007': 'Carrollton', '75010': 'Carrollton',
      '75011': 'Carrollton',
      // Richardson
      '75080': 'Richardson', '75081': 'Richardson', '75082': 'Richardson',
      '75083': 'Richardson', '75085': 'Richardson',
      // Garland
      '75040': 'Garland', '75041': 'Garland', '75042': 'Garland',
      '75043': 'Garland', '75044': 'Garland', '75045': 'Garland',
      '75046': 'Garland', '75047': 'Garland', '75048': 'Garland',
      '75049': 'Garland',
      // Denton
      '76201': 'Denton', '76202': 'Denton', '76203': 'Denton',
      '76204': 'Denton', '76205': 'Denton', '76206': 'Denton',
      '76207': 'Denton', '76208': 'Denton', '76209': 'Denton',
      '76210': 'Denton',
      // Flower Mound
      '75022': 'Flower Mound', '75028': 'Flower Mound',
      // The Colony
      '75056': 'The Colony',
      // Coppell
      '75019': 'Coppell',
      // Grapevine
      '76051': 'Grapevine', '76099': 'Grapevine',
      // Southlake
      '76092': 'Southlake',
      // Keller
      '76244': 'Keller', '76248': 'Keller',
      // Mesquite
      '75149': 'Mesquite', '75150': 'Mesquite', '75180': 'Mesquite',
      '75181': 'Mesquite', '75182': 'Mesquite', '75185': 'Mesquite',
      // Grand Prairie
      '75050': 'Grand Prairie', '75051': 'Grand Prairie', '75052': 'Grand Prairie',
      '75053': 'Grand Prairie', '75054': 'Grand Prairie',
      // Euless
      '76039': 'Euless', '76040': 'Euless',
      // Bedford
      '76021': 'Bedford', '76022': 'Bedford', '76095': 'Bedford',
      // Hurst
      '76053': 'Hurst', '76054': 'Hurst',
      // Colleyville
      '76034': 'Colleyville',
      // Mansfield
      '76063': 'Mansfield',
      // Cedar Hill
      '75104': 'Cedar Hill', '75106': 'Cedar Hill',
      // DeSoto
      '75115': 'DeSoto',
      // Duncanville
      '75116': 'Duncanville', '75137': 'Duncanville', '75138': 'Duncanville',
      // Lancaster
      '75134': 'Lancaster', '75146': 'Lancaster',
      // Rowlett
      '75030': 'Rowlett', '75088': 'Rowlett', '75089': 'Rowlett',
      // Rockwall
      '75032': 'Rockwall', '75087': 'Rockwall',
      // Wylie
      '75098': 'Wylie'
    };

    return zipCityMap[zip] || null;
  }

  /**
   * Extract state from address string
   */
  extractState(address) {
    if (!address) return 'TX'; // Default
    const match = address.match(/\b([A-Z]{2})\b(?:\s+\d{5})?/);
    return match ? match[1] : 'TX';
  }

  /**
   * Extract street address from full address
   */
  extractStreetAddress(address) {
    if (!address) return '';
    const parts = address.split(',');
    return parts[0]?.trim() || '';
  }

  /**
   * Normalize business name for comparison
   */
  normalizeBusinessName(name) {
    return (name || '')
      .toLowerCase()
      .replace(/[''`]/g, '')
      .replace(/&/g, 'and')
      .replace(/\s+/g, ' ')
      .replace(/[^a-z0-9 ]/g, '')
      .trim();
  }

  /**
   * Sleep helper for rate limiting
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * HTTP POST helper for Google Places API (New)
   */
  httpPost(url, body, headers = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);

      const options = {
        hostname: urlObj.hostname,
        port: 443,
        path: urlObj.pathname + urlObj.search,
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          ...headers
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });

      req.on('error', reject);
      req.setTimeout(15000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.write(body);
      req.end();
    });
  }

  /**
   * Geocode location using Google
   */
  async geocodeGoogle(location) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${this.googleApiKey}`;

    try {
      const data = await this.httpGet(url);
      const parsed = JSON.parse(data);

      if (parsed.results && parsed.results[0]) {
        const loc = parsed.results[0].geometry.location;
        return { lat: loc.lat, lng: loc.lng };
      }
      return null;
    } catch (err) {
      this.log(`Geocoding failed: ${err.message}`, 'error');
      return null;
    }
  }

  /**
   * Import from CSV (truly zero cost)
   *
   * Expected CSV format:
   * name,address,phone,category,website
   * "Joe's Barber","123 Main St, Dallas TX","555-1234","barbershop",""
   */
  async importCSV(csvPath) {
    this.log(`Importing from CSV: ${csvPath}`);

    try {
      const content = fs.readFileSync(csvPath, 'utf-8');
      const lines = content.split('\n').filter(l => l.trim());

      // Parse header
      const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));

      const businesses = [];

      for (let i = 1; i < lines.length; i++) {
        const values = this.parseCSVLine(lines[i]);
        const business = {};

        header.forEach((h, idx) => {
          business[h] = values[idx] || '';
        });

        const normalized = {
          id: `csv-${i}`,
          name: business.name || business.business_name || '',
          address: business.address || business.location || '',
          phone: business.phone || business.telephone || '',
          category: business.category || business.type || business.industry || '',
          website: business.website || business.url || '',
          hasWebsite: !!(business.website || business.url),
          fixtureId: this.mapToFixture(business.category || ''),
          source: 'csv',
          raw: business
        };

        if (normalized.name) {
          businesses.push(normalized);
          this.stats.scanned++;
          if (normalized.hasWebsite) this.stats.withWebsite++;
          else this.stats.withoutWebsite++;
        }
      }

      const prospects = businesses.filter(b => !b.hasWebsite);
      this.log(`Imported ${businesses.length} businesses, ${prospects.length} without websites`, 'success');

      return {
        prospects,
        stats: this.stats,
        source: csvPath
      };

    } catch (err) {
      this.log(`CSV import failed: ${err.message}`, 'error');
      return { prospects: [], stats: this.stats };
    }
  }

  /**
   * Parse a CSV line handling quoted fields
   */
  parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    return values;
  }

  /**
   * Normalize Yelp business data
   */
  normalizeYelpBusiness(b, searchIndustry) {
    const category = b.categories?.[0]?.alias || searchIndustry || '';

    return {
      id: b.id,
      name: b.name,
      address: [
        b.location?.address1,
        b.location?.city,
        b.location?.state,
        b.location?.zip_code
      ].filter(Boolean).join(', '),
      phone: b.phone || b.display_phone || '',
      category: category,
      website: null, // Yelp search doesn't include website - getYelpDetails() will check
      hasWebsite: false, // Will be updated by getYelpDetails() call
      rating: b.rating,
      reviewCount: b.review_count,
      photos: b.photos || (b.image_url ? [b.image_url] : []),
      hours: null, // Need details call
      fixtureId: this.mapToFixture(category),
      source: 'yelp',
      yelpUrl: b.url,
      raw: b
    };
  }

  /**
   * Normalize Google Places business data
   */
  normalizeGoogleBusiness(b, searchIndustry) {
    const category = b.types?.[0] || searchIndustry || '';

    return {
      id: b.place_id,
      name: b.name,
      address: b.vicinity || '',
      phone: '', // Need details call
      category: category,
      website: null, // Need details call
      hasWebsite: false, // Will check in details
      rating: b.rating,
      reviewCount: b.user_ratings_total,
      photos: b.photos?.map(p => p.photo_reference) || [],
      hours: b.opening_hours?.weekday_text || null,
      fixtureId: this.mapToFixture(category),
      source: 'google',
      placeId: b.place_id,
      raw: b
    };
  }

  /**
   * Get detailed info for a business (checks if website exists)
   */
  async getDetails(business) {
    if (business.source === 'yelp' && this.yelpApiKey) {
      return this.getYelpDetails(business);
    } else if (business.source === 'google' && this.googleApiKey) {
      return this.getGoogleDetails(business);
    }
    return business;
  }

  /**
   * Get Yelp business details and verify if business has a website
   */
  async getYelpDetails(business) {
    const url = `https://api.yelp.com/v3/businesses/${business.id}`;

    try {
      const data = await this.httpGet(url, {
        'Authorization': `Bearer ${this.yelpApiKey}`
      });

      const details = JSON.parse(data);

      // First check Yelp's website field
      let website = details.website || null;
      let hasWebsite = !!(website && website.trim());

      // If Yelp doesn't have website, try to find one ourselves
      if (!hasWebsite) {
        const detected = await this.detectWebsite(business.name, business.address);
        if (detected) {
          website = detected;
          hasWebsite = true;
        }
      }

      return {
        ...business,
        phone: details.phone || details.display_phone || business.phone,
        hours: details.hours?.[0]?.open || null,
        photos: details.photos || business.photos,
        website,
        hasWebsite
      };

    } catch (err) {
      // If details call fails, still try to detect website
      const detected = await this.detectWebsite(business.name, business.address);
      return {
        ...business,
        hasWebsite: !!detected,
        website: detected || null
      };
    }
  }

  /**
   * Try to detect if a business has a website by checking common domain patterns
   */
  async detectWebsite(businessName, address) {
    if (!businessName) return null;

    // Clean the business name for domain guessing
    const cleaned = businessName
      .toLowerCase()
      .replace(/[''`]/g, '')           // Remove apostrophes
      .replace(/&/g, 'and')            // & -> and
      .replace(/[^a-z0-9\s]/g, '')     // Remove special chars
      .replace(/\s+/g, '')             // Remove spaces
      .substring(0, 30);               // Limit length

    // Also try with hyphens
    const withHyphens = businessName
      .toLowerCase()
      .replace(/[''`]/g, '')
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);

    // Common domain patterns to try
    const patterns = [
      `${cleaned}.com`,
      `${withHyphens}.com`,
      `www.${cleaned}.com`,
      `${cleaned}tx.com`,              // State suffix common for local biz
      `${cleaned}texas.com`,
      `the${cleaned}.com`,
      `${cleaned}online.com`,
    ];

    // Try each pattern
    for (const domain of patterns) {
      try {
        const exists = await this.checkDomainExists(domain);
        if (exists) {
          return `https://${domain}`;
        }
      } catch (err) {
        // Continue to next pattern
      }
    }

    return null;
  }

  /**
   * Check if a domain exists and responds
   */
  async checkDomainExists(domain) {
    return new Promise((resolve) => {
      const options = {
        hostname: domain,
        port: 443,
        path: '/',
        method: 'HEAD',
        timeout: 3000,
        rejectUnauthorized: false
      };

      const req = https.request(options, (res) => {
        // Any response (even redirect) means the domain exists
        resolve(res.statusCode < 500);
      });

      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });

      req.end();
    });
  }

  /**
   * Get Google Place details
   */
  async getGoogleDetails(business) {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${business.placeId}&fields=website,formatted_phone_number,opening_hours&key=${this.googleApiKey}`;

    try {
      const data = await this.httpGet(url);
      const parsed = JSON.parse(data);

      if (parsed.result) {
        const hasWebsite = !!parsed.result.website;

        return {
          ...business,
          phone: parsed.result.formatted_phone_number || business.phone,
          hours: parsed.result.opening_hours?.weekday_text || business.hours,
          website: parsed.result.website || null,
          hasWebsite
        };
      }

      return business;

    } catch (err) {
      return business;
    }
  }

  /**
   * Validate that a website actually works
   */
  async validateWebsite(url) {
    if (!url) return false;

    try {
      // Quick HEAD request to check if site is up
      return new Promise((resolve) => {
        const urlObj = new URL(url);
        const options = {
          hostname: urlObj.hostname,
          port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
          path: urlObj.pathname,
          method: 'HEAD',
          timeout: 5000
        };

        const req = https.request(options, (res) => {
          resolve(res.statusCode >= 200 && res.statusCode < 400);
        });

        req.on('error', () => resolve(false));
        req.on('timeout', () => {
          req.destroy();
          resolve(false);
        });

        req.end();
      });
    } catch {
      return false;
    }
  }

  /**
   * Map category/industry to fixture ID
   */
  mapToFixture(category) {
    const normalized = (category || '').toLowerCase().trim();

    // Direct match
    if (INDUSTRY_MAP[normalized]) {
      return INDUSTRY_MAP[normalized];
    }

    // Partial match
    for (const [key, fixture] of Object.entries(INDUSTRY_MAP)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return fixture;
      }
    }

    // Default
    return 'restaurant'; // Most common fallback
  }

  /**
   * Save prospects to output folder
   */
  async saveProspects(scanResult, options = {}) {
    const { createFolders = true } = options;

    // Ensure prospects directory exists
    if (!fs.existsSync(this.prospectsDir)) {
      fs.mkdirSync(this.prospectsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const scanFile = path.join(this.prospectsDir, `scan-${timestamp}.json`);

    // Save full scan results
    fs.writeFileSync(scanFile, JSON.stringify(scanResult, null, 2));
    this.log(`Saved scan results to: ${scanFile}`);

    // Create individual prospect folders if requested
    if (createFolders) {
      for (const prospect of scanResult.prospects) {
        const folderName = this.slugify(prospect.name);
        const prospectDir = path.join(this.prospectsDir, folderName);

        if (!fs.existsSync(prospectDir)) {
          fs.mkdirSync(prospectDir, { recursive: true });
        }

        // Save prospect data
        fs.writeFileSync(
          path.join(prospectDir, 'prospect.json'),
          JSON.stringify({
            ...prospect,
            scannedAt: scanResult.scannedAt,
            readyForGeneration: true
          }, null, 2)
        );

        this.log(`Created prospect folder: ${folderName}`, 'prospect');
      }
    }

    return {
      scanFile,
      prospectFolders: scanResult.prospects.map(p => this.slugify(p.name))
    };
  }

  /**
   * Generate projects for all prospects
   */
  async generateFromProspects(options = {}) {
    const { limit = 10, useAI = false } = options;

    // Find all prospect.json files
    const prospects = [];

    if (fs.existsSync(this.prospectsDir)) {
      const folders = fs.readdirSync(this.prospectsDir);

      for (const folder of folders) {
        const prospectFile = path.join(this.prospectsDir, folder, 'prospect.json');
        if (fs.existsSync(prospectFile)) {
          const data = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));
          if (data.readyForGeneration && !data.generated) {
            prospects.push({ folder, data, path: path.join(this.prospectsDir, folder) });
          }
        }
      }
    }

    this.log(`Found ${prospects.length} prospects ready for generation`);

    const toGenerate = prospects.slice(0, limit);
    const results = [];

    for (const prospect of toGenerate) {
      this.log(`Generating project for: ${prospect.data.name}`);

      // This would call the MasterAgent or fixture generator
      // For now, just mark as ready
      results.push({
        name: prospect.data.name,
        fixtureId: prospect.data.fixtureId,
        prospectPath: prospect.path,
        status: 'ready'
      });
    }

    return results;
  }

  /**
   * Simple HTTP GET helper
   */
  httpGet(url, headers = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...headers
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });

      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  /**
   * Convert string to URL-safe slug
   */
  slugify(str) {
    return (str || 'unknown')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  }

  /**
   * Get available industries
   */
  getIndustries() {
    return [...new Set(Object.values(INDUSTRY_MAP))];
  }

  /**
   * Get stats
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Reset stats
   */
  reset() {
    this.stats = {
      scanned: 0,
      withWebsite: 0,
      withoutWebsite: 0,
      researched: 0,
      errors: 0
    };
  }

  /**
   * Full pipeline: Discover → Research → Score → Return ranked list
   */
  async discoverAndResearch(options = {}) {
    const { location, industry, limit = 20 } = options;

    this.log(`\n${'='.repeat(50)}`);
    this.log(`SCOUT PIPELINE: ${industry || 'all'} in ${location}`);
    this.log(`${'='.repeat(50)}\n`);

    // Step 1: Discovery (Google)
    this.log('PHASE 1: DISCOVERY (Google Places)', 'info');
    const scanResult = await this.scan({
      location,
      industry,
      limit,
      source: 'google',
      enrichWithYelp: false // We'll do it separately for better logging
    });

    if (scanResult.prospects.length === 0) {
      this.log('No prospects found without websites', 'warning');
      return scanResult;
    }

    // Step 2: Research (Yelp)
    this.log('\nPHASE 2: RESEARCH (Yelp Fusion)', 'info');
    const enrichedProspects = await this.researchProspects(scanResult.prospects);

    // Step 3: Score & Rank
    this.log('\nPHASE 3: SCORING & RANKING', 'info');
    enrichedProspects.forEach((p, i) => {
      const score = p.opportunityScore || 0;
      const scoreBar = '█'.repeat(Math.floor(score / 10)) + '░'.repeat(10 - Math.floor(score / 10));
      this.log(`  ${i + 1}. ${p.name} [${scoreBar}] ${score}/100`, score >= 70 ? 'prospect' : 'info');
    });

    // Summary
    this.log(`\n${'='.repeat(50)}`);
    this.log('PIPELINE SUMMARY', 'success');
    this.log(`  Scanned: ${scanResult.totalScanned}`);
    this.log(`  With websites: ${scanResult.withWebsite} (filtered out)`);
    this.log(`  Prospects: ${enrichedProspects.length}`);
    this.log(`  Researched: ${this.stats.researched}`);
    this.log(`  Top opportunity: ${enrichedProspects[0]?.name || 'N/A'} (${enrichedProspects[0]?.opportunityScore || 0}/100)`);
    this.log(`${'='.repeat(50)}\n`);

    return {
      ...scanResult,
      prospects: enrichedProspects,
      pipeline: 'discover-and-research'
    };
  }
}

// Export CRM statuses for external use
const CRM_STATUSES = ScoutAgent.CRM_STATUSES;

module.exports = { ScoutAgent, INDUSTRY_MAP, CRM_STATUSES };
