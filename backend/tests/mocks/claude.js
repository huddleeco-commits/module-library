/**
 * Claude/Anthropic API Mock
 *
 * Mocks all Claude API calls for testing without making real API requests.
 * Provides configurable responses for card scanning and image analysis.
 */

// Default mock responses
const defaultCardResponse = {
  player: 'Patrick Mahomes',
  year: 2020,
  set_name: 'Panini Prizm',
  card_number: '127',
  parallel: 'Base',
  is_autographed: false,
  numbered: 'false',
  serial_number: null,
  numbered_to: null,
  team: 'Kansas City Chiefs',
  sport: 'Football',
  condition: 'Near Mint',
  is_graded: false,
  grading_company: null,
  grade: null,
  cert_number: null,
  ebay_search_string: '2020 Panini Prizm Patrick Mahomes #127 Chiefs'
};

const defaultGradedCardResponse = {
  ...defaultCardResponse,
  is_graded: true,
  grading_company: 'PSA',
  grade: '10',
  cert_number: '12345678',
  condition: 'Gem Mint',
  ebay_search_string: '2020 Panini Prizm Patrick Mahomes #127 PSA 10'
};

const defaultMultiSlabResponse = {
  cards: [
    {
      player: 'Patrick Mahomes',
      year: 2017,
      set_name: 'Panini Prizm',
      card_number: '127',
      parallel: 'Base',
      sport: 'Football',
      grading_company: 'PSA',
      grade: '10',
      cert_number: '12345678',
      ebay_search_string: '2017 Panini Prizm Patrick Mahomes 127 PSA 10'
    },
    {
      player: 'Josh Allen',
      year: 2018,
      set_name: 'Panini Prizm',
      card_number: '205',
      parallel: 'Silver',
      sport: 'Football',
      grading_company: 'PSA',
      grade: '9',
      cert_number: '87654321',
      ebay_search_string: '2018 Panini Prizm Josh Allen 205 Silver PSA 9'
    }
  ]
};

// Mock state
let customResponse = null;
let shouldFail = false;
let failureError = null;
let callCount = 0;
let lastCallParams = null;

/**
 * Mock messages.create method
 */
const messagesCreate = jest.fn().mockImplementation(async (params) => {
  callCount++;
  lastCallParams = params;

  if (shouldFail) {
    throw failureError || new Error('Claude API error');
  }

  // Determine response type based on prompt content
  const prompt = params.messages?.[0]?.content?.find(c => c.type === 'text')?.text || '';
  let responseText;

  if (customResponse) {
    responseText = typeof customResponse === 'string'
      ? customResponse
      : JSON.stringify(customResponse);
  } else if (prompt.includes('MULTIPLE') || prompt.includes('multi-slab')) {
    responseText = JSON.stringify(defaultMultiSlabResponse);
  } else if (prompt.includes('CERTIFICATION NUMBER') || prompt.includes('cert number')) {
    responseText = JSON.stringify({
      cert_number: '12345678',
      grading_company: 'PSA',
      grade: '10',
      player: 'Patrick Mahomes',
      year: 2020,
      set_name: 'Panini Prizm',
      sport: 'Football'
    });
  } else if (prompt.includes('position') || prompt.includes('boundingBox')) {
    responseText = JSON.stringify({
      slabs: [
        { boundingBox: { x: 10, y: 10, width: 30, height: 40 }, gradingCompany: 'PSA' },
        { boundingBox: { x: 50, y: 10, width: 30, height: 40 }, gradingCompany: 'BGS' }
      ]
    });
  } else {
    // Default card scan response
    responseText = JSON.stringify(defaultCardResponse);
  }

  return {
    id: `msg_test_${Date.now()}`,
    type: 'message',
    role: 'assistant',
    content: [{
      type: 'text',
      text: responseText
    }],
    model: params.model || 'claude-sonnet-4-5-20250929',
    stop_reason: 'end_turn',
    usage: {
      input_tokens: 1500,
      output_tokens: 350
    }
  };
});

/**
 * The main mock object that mimics the Anthropic SDK structure
 */
const claudeMock = {
  messages: {
    create: messagesCreate
  },

  // Test utilities
  _reset: () => {
    customResponse = null;
    shouldFail = false;
    failureError = null;
    callCount = 0;
    lastCallParams = null;
    jest.clearAllMocks();
  },

  _setCustomResponse: (response) => {
    customResponse = response;
  },

  _setCardResponse: (cardData) => {
    customResponse = { ...defaultCardResponse, ...cardData };
  },

  _setGradedCardResponse: (cardData) => {
    customResponse = { ...defaultGradedCardResponse, ...cardData };
  },

  _setMultiSlabResponse: (cards) => {
    customResponse = { cards };
  },

  _setFailure: (error = null) => {
    shouldFail = true;
    failureError = error;
  },

  _clearFailure: () => {
    shouldFail = false;
    failureError = null;
  },

  _getCallCount: () => callCount,

  _getLastCallParams: () => lastCallParams,

  // Default responses for reference in tests
  defaultResponses: {
    card: defaultCardResponse,
    gradedCard: defaultGradedCardResponse,
    multiSlab: defaultMultiSlabResponse
  }
};

module.exports = claudeMock;
