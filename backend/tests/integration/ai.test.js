/**
 * AI/Claude Integration Tests (with Mock)
 *
 * Tests for Claude Vision API integration:
 * - Card scanning
 * - Image processing
 * - Response parsing
 * - Multi-slab detection
 *
 * ALL CLAUDE API CALLS ARE MOCKED - NO REAL API CALLS
 */

const claudeMock = require('../mocks/claude');

// Mock Anthropic SDK before importing
jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn(() => claudeMock);
});

describe('Claude AI Integration Tests', () => {
  beforeEach(() => {
    claudeMock._reset();
  });

  describe('Card Scanning', () => {
    // Simulate ClaudeScanner methods for testing
    const scanner = {
      async scanCard(frontImageBase64, backImageBase64 = null, setIntelligence = null) {
        try {
          const images = [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: frontImageBase64
              }
            }
          ];

          if (backImageBase64) {
            images.push({
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: backImageBase64
              }
            });
          }

          const message = await claudeMock.messages.create({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 1024,
            messages: [{
              role: 'user',
              content: [
                { type: 'text', text: 'Extract card data from ALL images provided.' },
                ...images
              ]
            }]
          });

          const responseText = message.content[0].text;
          const cardData = JSON.parse(responseText);

          return {
            success: true,
            card: cardData,
            usage: message.usage
          };
        } catch (error) {
          return {
            success: false,
            error: error.message,
            card: this.getEmptyCard()
          };
        }
      },

      getEmptyCard() {
        return {
          player: '',
          year: new Date().getFullYear(),
          set_name: '',
          card_number: '',
          parallel: 'Base',
          is_autographed: false,
          numbered: 'false',
          team: '',
          sport: 'Football',
          condition: 'Near Mint'
        };
      }
    };

    test('should scan card successfully', async () => {
      const result = await scanner.scanCard('base64_image_data');

      expect(result.success).toBe(true);
      expect(result.card).toBeDefined();
      expect(result.card.player).toBe('Patrick Mahomes');
      expect(result.card.year).toBe(2020);
      expect(result.card.set_name).toBe('Panini Prizm');
    });

    test('should include token usage in response', async () => {
      const result = await scanner.scanCard('base64_image_data');

      expect(result.usage).toBeDefined();
      expect(result.usage.input_tokens).toBeDefined();
      expect(result.usage.output_tokens).toBeDefined();
    });

    test('should handle front and back images', async () => {
      const result = await scanner.scanCard('front_image', 'back_image');

      expect(result.success).toBe(true);

      // Verify two images were sent
      const lastCall = claudeMock._getLastCallParams();
      const images = lastCall.messages[0].content.filter(c => c.type === 'image');
      expect(images).toHaveLength(2);
    });

    test('should handle API errors gracefully', async () => {
      claudeMock._setFailure(new Error('API rate limit exceeded'));

      const result = await scanner.scanCard('base64_image_data');

      expect(result.success).toBe(false);
      expect(result.error).toBe('API rate limit exceeded');
      expect(result.card).toBeDefined(); // Should return empty card
    });

    test('should extract graded card data', async () => {
      claudeMock._setGradedCardResponse({
        player: 'Tom Brady',
        grading_company: 'BGS',
        grade: '9.5'
      });

      const result = await scanner.scanCard('graded_card_image');

      expect(result.success).toBe(true);
      expect(result.card.is_graded).toBe(true);
      expect(result.card.grading_company).toBe('BGS');
      expect(result.card.grade).toBe('9.5');
    });

    test('should extract autographed card data', async () => {
      claudeMock._setCardResponse({
        player: 'Justin Herbert',
        is_autographed: true,
        numbered: 'true',
        serial_number: '25',
        numbered_to: '99'
      });

      const result = await scanner.scanCard('auto_card_image');

      expect(result.card.is_autographed).toBe(true);
      expect(result.card.numbered).toBe('true');
      expect(result.card.serial_number).toBe('25');
      expect(result.card.numbered_to).toBe('99');
    });
  });

  describe('Response Parsing', () => {
    const parseResponse = (responseText) => {
      try {
        let cleaned = responseText.trim();

        // Remove markdown code blocks
        if (cleaned.startsWith('```json')) {
          cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        }
        if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/```\n?/g, '');
        }

        const parsed = JSON.parse(cleaned);

        return {
          player: parsed.player || '',
          year: parsed.year || new Date().getFullYear(),
          set_name: parsed.set_name || '',
          card_number: parsed.card_number || '',
          parallel: cleanParallelName(parsed.parallel),
          is_autographed: parsed.is_autographed === true,
          numbered: parsed.numbered === true ? 'true' : 'false',
          serial_number: parsed.serial_number || null,
          numbered_to: parsed.numbered_to || null,
          team: parsed.team || '',
          sport: parsed.sport || 'Football',
          condition: parsed.condition || 'Near Mint',
          is_graded: parsed.is_graded === true,
          grading_company: parsed.grading_company || null,
          grade: parsed.grade || null,
          cert_number: parsed.cert_number || null,
          ebay_search_string: parsed.ebay_search_string || ''
        };
      } catch (error) {
        return null;
      }
    };

    const cleanParallelName = (parallel) => {
      if (!parallel) return 'Base';

      // Remove player names and card numbers from parallel
      if (parallel.includes('[') && parallel.includes(']')) {
        const match = parallel.match(/\[([^\]]+)\]/);
        if (match) return match[1].trim();
      }

      return parallel.replace(/#\d+/g, '').trim() || 'Base';
    };

    test('should parse clean JSON response', () => {
      const response = JSON.stringify({
        player: 'Joe Burrow',
        year: 2020,
        set_name: 'Panini Prizm',
        card_number: '307',
        parallel: 'Base'
      });

      const result = parseResponse(response);

      expect(result.player).toBe('Joe Burrow');
      expect(result.year).toBe(2020);
      expect(result.set_name).toBe('Panini Prizm');
    });

    test('should parse JSON with markdown code blocks', () => {
      const response = '```json\n{"player": "Josh Allen", "year": 2018}\n```';

      const result = parseResponse(response);

      expect(result.player).toBe('Josh Allen');
      expect(result.year).toBe(2018);
    });

    test('should clean parallel names with brackets', () => {
      const parallel = 'Josh Allen [Green Shock] #205';
      const cleaned = cleanParallelName(parallel);

      expect(cleaned).toBe('Green Shock');
    });

    test('should clean parallel names with card numbers', () => {
      const parallel = 'Silver Prizm #127';
      const cleaned = cleanParallelName(parallel);

      expect(cleaned).toBe('Silver Prizm');
    });

    test('should return Base for null parallel', () => {
      expect(cleanParallelName(null)).toBe('Base');
      expect(cleanParallelName(undefined)).toBe('Base');
      expect(cleanParallelName('')).toBe('Base');
    });

    test('should handle malformed JSON', () => {
      const result = parseResponse('not valid json');

      expect(result).toBeNull();
    });

    test('should provide defaults for missing fields', () => {
      const response = JSON.stringify({ player: 'Test Player' });
      const result = parseResponse(response);

      expect(result.parallel).toBe('Base');
      expect(result.sport).toBe('Football');
      expect(result.condition).toBe('Near Mint');
      expect(result.is_autographed).toBe(false);
      expect(result.numbered).toBe('false');
    });
  });

  describe('Multi-Slab Detection', () => {
    test('should detect multiple slabs in image', async () => {
      claudeMock._setMultiSlabResponse([
        { player: 'Patrick Mahomes', cert_number: '12345678', grade: '10' },
        { player: 'Josh Allen', cert_number: '87654321', grade: '9' }
      ]);

      const message = await claudeMock.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'Detect MULTIPLE slabs in this image' },
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: 'multi_slab_image' } }
          ]
        }]
      });

      const result = JSON.parse(message.content[0].text);

      expect(result.cards).toHaveLength(2);
      expect(result.cards[0].player).toBe('Patrick Mahomes');
      expect(result.cards[1].player).toBe('Josh Allen');
    });

    test('should extract cert numbers from each slab', async () => {
      claudeMock._setMultiSlabResponse([
        { player: 'Card 1', cert_number: '11111111' },
        { player: 'Card 2', cert_number: '22222222' },
        { player: 'Card 3', cert_number: '33333333' }
      ]);

      const message = await claudeMock.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'Detect MULTIPLE slabs' }
          ]
        }]
      });

      const result = JSON.parse(message.content[0].text);

      expect(result.cards[0].cert_number).toBe('11111111');
      expect(result.cards[1].cert_number).toBe('22222222');
      expect(result.cards[2].cert_number).toBe('33333333');
    });
  });

  describe('Slab Position Detection', () => {
    test('should detect slab positions with bounding boxes', async () => {
      claudeMock._setCustomResponse({
        slabs: [
          { boundingBox: { x: 10, y: 10, width: 30, height: 40 }, gradingCompany: 'PSA' },
          { boundingBox: { x: 50, y: 10, width: 30, height: 40 }, gradingCompany: 'BGS' }
        ]
      });

      const message = await claudeMock.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'Detect slab positions with boundingBox' }
          ]
        }]
      });

      const result = JSON.parse(message.content[0].text);

      expect(result.slabs).toHaveLength(2);
      expect(result.slabs[0].boundingBox.x).toBe(10);
      expect(result.slabs[0].gradingCompany).toBe('PSA');
      expect(result.slabs[1].boundingBox.x).toBe(50);
      expect(result.slabs[1].gradingCompany).toBe('BGS');
    });
  });

  describe('Cert Number Extraction', () => {
    test('should extract cert number with high accuracy', async () => {
      claudeMock._setCustomResponse({
        cert_number: '98765432',
        grading_company: 'PSA',
        grade: '10',
        player: 'Patrick Mahomes'
      });

      const message = await claudeMock.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 512,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'Extract CERTIFICATION NUMBER from this slab' }
          ]
        }]
      });

      const result = JSON.parse(message.content[0].text);

      expect(result.cert_number).toBe('98765432');
      expect(result.grading_company).toBe('PSA');
    });

    test('should handle unreadable cert numbers', async () => {
      claudeMock._setCustomResponse({
        cert_number: null,
        grading_company: 'PSA',
        grade: '10'
      });

      const message = await claudeMock.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 512,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'Extract cert number' }
          ]
        }]
      });

      const result = JSON.parse(message.content[0].text);

      expect(result.cert_number).toBeNull();
    });
  });

  describe('Image Processing', () => {
    // Image processing helpers
    const getMediaType = (base64String) => {
      if (base64String.includes('data:image/png')) return 'image/png';
      if (base64String.includes('data:image/jpeg')) return 'image/jpeg';
      if (base64String.includes('data:image/webp')) return 'image/webp';
      return 'image/jpeg';
    };

    const cleanBase64 = (base64String) => {
      if (base64String.includes('base64,')) {
        return base64String.split('base64,')[1];
      }
      return base64String;
    };

    test('should detect PNG media type', () => {
      const base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...';
      expect(getMediaType(base64)).toBe('image/png');
    });

    test('should detect JPEG media type', () => {
      const base64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRg...';
      expect(getMediaType(base64)).toBe('image/jpeg');
    });

    test('should detect WebP media type', () => {
      const base64 = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4...';
      expect(getMediaType(base64)).toBe('image/webp');
    });

    test('should default to JPEG for unknown types', () => {
      const base64 = 'random_base64_string_without_prefix';
      expect(getMediaType(base64)).toBe('image/jpeg');
    });

    test('should clean base64 data URL prefix', () => {
      const withPrefix = 'data:image/jpeg;base64,/9j/4AAQSkZJRg...';
      expect(cleanBase64(withPrefix)).toBe('/9j/4AAQSkZJRg...');
    });

    test('should return raw base64 without prefix', () => {
      const withoutPrefix = '/9j/4AAQSkZJRg...';
      expect(cleanBase64(withoutPrefix)).toBe('/9j/4AAQSkZJRg...');
    });
  });

  describe('eBay Search String Generation', () => {
    const buildSearchString = (cardData) => {
      let searchString = '';

      // Check if year is already in set_name
      const hasYearInSet = cardData.set_name && (
        /^\d{4}\s+/.test(cardData.set_name) ||
        cardData.set_name.includes(String(cardData.year))
      );

      if (cardData.year && !hasYearInSet) searchString += `${cardData.year} `;
      if (cardData.set_name) searchString += `${cardData.set_name} `;
      if (cardData.player) searchString += `${cardData.player} `;
      if (cardData.card_number) searchString += `#${cardData.card_number} `;

      if (!cardData.is_graded) {
        if (cardData.numbered === 'true' && cardData.numbered_to) {
          searchString += `/${cardData.numbered_to} `;
        }
        if (cardData.parallel && cardData.parallel !== 'Base') {
          searchString += `${cardData.parallel} `;
        }
        if (cardData.is_autographed) {
          searchString += `Auto `;
        }
      }

      if (cardData.is_graded) {
        if (cardData.grading_company) searchString += `${cardData.grading_company} `;
        if (cardData.grade) searchString += `${cardData.grade} `;
        if (cardData.is_autographed) searchString += `Auto `;
      }

      return searchString.trim();
    };

    test('should build basic search string', () => {
      const card = {
        year: 2020,
        set_name: 'Panini Prizm',
        player: 'Patrick Mahomes',
        card_number: '127'
      };

      const result = buildSearchString(card);
      expect(result).toBe('2020 Panini Prizm Patrick Mahomes #127');
    });

    test('should include parallel for non-base cards', () => {
      const card = {
        year: 2020,
        set_name: 'Prizm',
        player: 'Josh Allen',
        parallel: 'Silver'
      };

      const result = buildSearchString(card);
      expect(result).toContain('Silver');
    });

    test('should include numbered info', () => {
      const card = {
        year: 2020,
        set_name: 'Prizm',
        player: 'Joe Burrow',
        numbered: 'true',
        numbered_to: '99'
      };

      const result = buildSearchString(card);
      expect(result).toContain('/99');
    });

    test('should include Auto for autographed cards', () => {
      const card = {
        year: 2020,
        set_name: 'Prizm',
        player: 'Justin Herbert',
        is_autographed: true
      };

      const result = buildSearchString(card);
      expect(result).toContain('Auto');
    });

    test('should include grading info for graded cards', () => {
      const card = {
        year: 2020,
        set_name: 'Prizm',
        player: 'Patrick Mahomes',
        is_graded: true,
        grading_company: 'PSA',
        grade: '10'
      };

      const result = buildSearchString(card);
      expect(result).toContain('PSA');
      expect(result).toContain('10');
    });

    test('should not duplicate year if in set name', () => {
      const card = {
        year: 2020,
        set_name: '2020 Panini Prizm',
        player: 'Patrick Mahomes'
      };

      const result = buildSearchString(card);
      expect(result).toBe('2020 Panini Prizm Patrick Mahomes');
      expect((result.match(/2020/g) || []).length).toBe(1);
    });
  });

  describe('API Call Tracking', () => {
    test('should track number of API calls', async () => {
      const initialCount = claudeMock._getCallCount();

      await claudeMock.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        messages: [{ role: 'user', content: [{ type: 'text', text: 'Test' }] }]
      });

      await claudeMock.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        messages: [{ role: 'user', content: [{ type: 'text', text: 'Test 2' }] }]
      });

      expect(claudeMock._getCallCount()).toBe(initialCount + 2);
    });

    test('should store last call parameters', async () => {
      await claudeMock.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 2048,
        messages: [{ role: 'user', content: [{ type: 'text', text: 'Custom prompt' }] }]
      });

      const lastParams = claudeMock._getLastCallParams();

      expect(lastParams.model).toBe('claude-sonnet-4-5-20250929');
      expect(lastParams.max_tokens).toBe(2048);
    });
  });
});
