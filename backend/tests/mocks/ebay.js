/**
 * eBay API Mock
 *
 * Mocks all eBay API calls for testing without making real API requests.
 * Covers OAuth, Browse API, Inventory API, and Trading API.
 */

// Default mock data
const defaultListings = [
  {
    itemId: '123456789',
    title: '2020 Panini Prizm Patrick Mahomes #127 Base Card PSA 10',
    price: { value: 250.00, currency: 'USD' },
    condition: 'Brand New',
    image: { imageUrl: 'https://i.ebayimg.com/images/test1.jpg' },
    itemWebUrl: 'https://www.ebay.com/itm/123456789',
    seller: { username: 'carddealer1', feedbackPercentage: '99.8' }
  },
  {
    itemId: '987654321',
    title: '2020 Panini Prizm Patrick Mahomes Silver Prizm PSA 9',
    price: { value: 175.00, currency: 'USD' },
    condition: 'Brand New',
    image: { imageUrl: 'https://i.ebayimg.com/images/test2.jpg' },
    itemWebUrl: 'https://www.ebay.com/itm/987654321',
    seller: { username: 'sportscards2024', feedbackPercentage: '100' }
  }
];

const defaultCompletedSales = [
  {
    itemId: '111111111',
    title: '2020 Panini Prizm Patrick Mahomes #127 PSA 10',
    sellingStatus: {
      currentPrice: { value: 245.00, currencyId: 'USD' },
      sellingState: 'EndedWithSales'
    },
    listingInfo: {
      endTime: new Date(Date.now() - 86400000).toISOString()
    }
  },
  {
    itemId: '222222222',
    title: '2020 Panini Prizm Patrick Mahomes Base PSA 10',
    sellingStatus: {
      currentPrice: { value: 260.00, currencyId: 'USD' },
      sellingState: 'EndedWithSales'
    },
    listingInfo: {
      endTime: new Date(Date.now() - 172800000).toISOString()
    }
  }
];

// Mock state
let mockTokens = {
  accessToken: 'test_access_token_123',
  refreshToken: 'test_refresh_token_456',
  expiresAt: Date.now() + 7200000
};
let customListings = null;
let customCompletedSales = null;
let shouldFail = false;
let failureError = null;
let callCount = {
  oauth: 0,
  browse: 0,
  inventory: 0,
  trading: 0
};

/**
 * Mock OAuth token exchange
 */
const getAccessToken = jest.fn().mockImplementation(async (code) => {
  callCount.oauth++;

  if (shouldFail) {
    throw failureError || new Error('eBay OAuth failed');
  }

  return {
    access_token: mockTokens.accessToken,
    refresh_token: mockTokens.refreshToken,
    expires_in: 7200,
    token_type: 'Bearer'
  };
});

/**
 * Mock OAuth token refresh
 */
const refreshAccessToken = jest.fn().mockImplementation(async (refreshToken) => {
  callCount.oauth++;

  if (shouldFail) {
    throw failureError || new Error('eBay token refresh failed');
  }

  mockTokens.accessToken = `refreshed_token_${Date.now()}`;
  mockTokens.expiresAt = Date.now() + 7200000;

  return {
    access_token: mockTokens.accessToken,
    refresh_token: mockTokens.refreshToken,
    expires_in: 7200,
    token_type: 'Bearer'
  };
});

/**
 * Mock Browse API search
 */
const searchItems = jest.fn().mockImplementation(async (query, options = {}) => {
  callCount.browse++;

  if (shouldFail) {
    throw failureError || new Error('eBay search failed');
  }

  const listings = customListings || defaultListings;

  return {
    total: listings.length,
    limit: options.limit || 10,
    offset: options.offset || 0,
    itemSummaries: listings
  };
});

/**
 * Mock Browse API get item
 */
const getItem = jest.fn().mockImplementation(async (itemId) => {
  callCount.browse++;

  if (shouldFail) {
    throw failureError || new Error('eBay get item failed');
  }

  const listings = customListings || defaultListings;
  const item = listings.find(l => l.itemId === itemId) || listings[0];

  return {
    ...item,
    itemId,
    description: 'Test item description',
    shortDescription: 'Test item',
    categoryPath: 'Collectibles|Sports Memorabilia|Trading Cards',
    categoryId: '212'
  };
});

/**
 * Mock Finding API - completed sales
 */
const findCompletedItems = jest.fn().mockImplementation(async (query, options = {}) => {
  callCount.trading++;

  if (shouldFail) {
    throw failureError || new Error('eBay completed items search failed');
  }

  const sales = customCompletedSales || defaultCompletedSales;

  return {
    findCompletedItemsResponse: [{
      searchResult: [{
        count: sales.length,
        item: sales
      }],
      paginationOutput: [{
        totalEntries: sales.length,
        totalPages: 1
      }]
    }]
  };
});

/**
 * Mock Inventory API - create/update listing
 */
const createOrReplaceInventoryItem = jest.fn().mockImplementation(async (sku, itemData) => {
  callCount.inventory++;

  if (shouldFail) {
    throw failureError || new Error('eBay inventory creation failed');
  }

  return {
    statusCode: 204,
    sku: sku
  };
});

/**
 * Mock Inventory API - create offer
 */
const createOffer = jest.fn().mockImplementation(async (offerData) => {
  callCount.inventory++;

  if (shouldFail) {
    throw failureError || new Error('eBay offer creation failed');
  }

  return {
    offerId: `offer_${Date.now()}`,
    statusCode: 201
  };
});

/**
 * Mock Inventory API - publish offer
 */
const publishOffer = jest.fn().mockImplementation(async (offerId) => {
  callCount.inventory++;

  if (shouldFail) {
    throw failureError || new Error('eBay publish failed');
  }

  return {
    listingId: `listing_${Date.now()}`,
    statusCode: 200
  };
});

/**
 * The main mock object
 */
const ebayMock = {
  oauth: {
    getAccessToken,
    refreshAccessToken,
    getAuthUrl: jest.fn().mockReturnValue('https://auth.ebay.com/oauth2/authorize?test=1')
  },
  browse: {
    search: searchItems,
    getItem,
    getItemsByGroup: jest.fn().mockResolvedValue({ items: defaultListings })
  },
  finding: {
    findCompletedItems,
    findItemsAdvanced: jest.fn().mockResolvedValue({ items: defaultListings })
  },
  inventory: {
    createOrReplaceInventoryItem,
    getInventoryItem: jest.fn().mockResolvedValue({ sku: 'test-sku', availability: { quantity: 1 } }),
    deleteInventoryItem: jest.fn().mockResolvedValue({ statusCode: 204 }),
    createOffer,
    publishOffer,
    withdrawOffer: jest.fn().mockResolvedValue({ statusCode: 200 })
  },

  // Test utilities
  _reset: () => {
    customListings = null;
    customCompletedSales = null;
    shouldFail = false;
    failureError = null;
    callCount = { oauth: 0, browse: 0, inventory: 0, trading: 0 };
    mockTokens = {
      accessToken: 'test_access_token_123',
      refreshToken: 'test_refresh_token_456',
      expiresAt: Date.now() + 7200000
    };
    jest.clearAllMocks();
  },

  _setCustomListings: (listings) => {
    customListings = listings;
  },

  _setCustomCompletedSales: (sales) => {
    customCompletedSales = sales;
  },

  _setFailure: (error = null) => {
    shouldFail = true;
    failureError = error;
  },

  _clearFailure: () => {
    shouldFail = false;
    failureError = null;
  },

  _getCallCounts: () => ({ ...callCount }),

  _setMockTokens: (tokens) => {
    mockTokens = { ...mockTokens, ...tokens };
  },

  // Default data for reference in tests
  defaultData: {
    listings: defaultListings,
    completedSales: defaultCompletedSales
  }
};

module.exports = ebayMock;
