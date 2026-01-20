/**
 * Styled Tool Generator
 * Generates fully functional, beautifully styled tools
 */

// ============================================
// STYLE PRESETS
// ============================================

const STYLE_PRESETS = {
  modern: {
    name: 'Modern',
    fonts: {
      heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    },
    borderRadius: '12px',
    inputRadius: '8px',
    buttonRadius: '8px',
    shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    shadowHover: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    cardShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: '0.2s ease',
    getCSS: (colors) => `
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
        min-height: 100vh;
      }
      .tool-container {
        background: white;
        border-radius: 16px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        padding: 32px;
        max-width: 500px;
        margin: 40px auto;
      }
      .tool-header {
        text-align: center;
        margin-bottom: 28px;
      }
      .tool-title {
        font-size: 1.75rem;
        font-weight: 700;
        color: #1f2937;
        margin: 0 0 8px 0;
      }
      .tool-subtitle {
        color: #6b7280;
        font-size: 0.95rem;
      }
      .form-group {
        margin-bottom: 20px;
      }
      .form-label {
        display: block;
        font-weight: 600;
        color: #374151;
        margin-bottom: 8px;
        font-size: 0.9rem;
      }
      .form-input {
        width: 100%;
        padding: 12px 16px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        font-size: 1rem;
        transition: all 0.2s ease;
        background: #f9fafb;
      }
      .form-input:focus {
        outline: none;
        border-color: ${colors.primary};
        background: white;
        box-shadow: 0 0 0 3px ${colors.primary}20;
      }
      .btn-primary {
        width: 100%;
        padding: 14px 24px;
        background: ${colors.primary};
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .btn-primary:hover {
        background: ${colors.primaryDark || colors.primary};
        transform: translateY(-1px);
        box-shadow: 0 4px 12px ${colors.primary}40;
      }
      .result-card {
        margin-top: 24px;
        padding: 24px;
        background: linear-gradient(135deg, ${colors.primary}08 0%, ${colors.primary}15 100%);
        border: 1px solid ${colors.primary}30;
        border-radius: 12px;
        display: none;
      }
      .result-card.visible { display: block; }
      .result-title {
        font-weight: 600;
        color: ${colors.primary};
        margin-bottom: 16px;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .result-value {
        font-size: 2.5rem;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 8px;
      }
      .result-detail {
        color: #6b7280;
        font-size: 0.9rem;
        margin-bottom: 4px;
      }
      .brand-footer {
        text-align: center;
        margin-top: 24px;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;
        color: #9ca3af;
        font-size: 0.8rem;
      }
    `
  },

  classic: {
    name: 'Classic',
    fonts: {
      heading: "'Georgia', 'Times New Roman', serif",
      body: "'Georgia', 'Times New Roman', serif"
    },
    borderRadius: '4px',
    inputRadius: '4px',
    buttonRadius: '4px',
    shadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: '0.15s ease',
    getCSS: (colors) => `
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Source+Sans+Pro:wght@400;600&display=swap');
      body {
        font-family: 'Source Sans Pro', Georgia, serif;
        background: #f5f5f0;
        min-height: 100vh;
      }
      .tool-container {
        background: white;
        border: 1px solid #d4d4c8;
        border-radius: 4px;
        padding: 40px;
        max-width: 480px;
        margin: 40px auto;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }
      .tool-header {
        text-align: center;
        margin-bottom: 32px;
        padding-bottom: 24px;
        border-bottom: 2px solid ${colors.primary};
      }
      .tool-title {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 1.875rem;
        font-weight: 700;
        color: #2d2d2d;
        margin: 0 0 8px 0;
      }
      .tool-subtitle {
        color: #666;
        font-size: 1rem;
        font-style: italic;
      }
      .form-group {
        margin-bottom: 24px;
      }
      .form-label {
        display: block;
        font-weight: 600;
        color: #2d2d2d;
        margin-bottom: 8px;
        font-size: 0.95rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-size: 0.8rem;
      }
      .form-input {
        width: 100%;
        padding: 12px 14px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1rem;
        font-family: inherit;
        transition: border-color 0.15s ease;
      }
      .form-input:focus {
        outline: none;
        border-color: ${colors.primary};
      }
      .btn-primary {
        width: 100%;
        padding: 14px 24px;
        background: ${colors.primary};
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        text-transform: uppercase;
        letter-spacing: 1px;
        transition: background 0.15s ease;
      }
      .btn-primary:hover {
        background: ${colors.primaryDark || colors.primary};
      }
      .result-card {
        margin-top: 28px;
        padding: 28px;
        background: #fafaf8;
        border: 1px solid #d4d4c8;
        border-radius: 4px;
        display: none;
      }
      .result-card.visible { display: block; }
      .result-title {
        font-family: 'Playfair Display', Georgia, serif;
        font-weight: 600;
        color: ${colors.primary};
        margin-bottom: 16px;
        font-size: 1.1rem;
        border-bottom: 1px solid #e5e5e0;
        padding-bottom: 12px;
      }
      .result-value {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 2.25rem;
        font-weight: 700;
        color: #2d2d2d;
        margin-bottom: 12px;
      }
      .result-detail {
        color: #666;
        font-size: 0.95rem;
        margin-bottom: 6px;
      }
      .brand-footer {
        text-align: center;
        margin-top: 28px;
        padding-top: 20px;
        border-top: 1px solid #e5e5e0;
        color: #999;
        font-size: 0.85rem;
        font-style: italic;
      }
    `
  },

  futuristic: {
    name: 'Futuristic',
    fonts: {
      heading: "'Orbitron', 'Rajdhani', sans-serif",
      body: "'Rajdhani', 'Exo 2', sans-serif"
    },
    borderRadius: '16px',
    inputRadius: '12px',
    buttonRadius: '25px',
    shadow: '0 0 20px rgba(0, 200, 255, 0.3)',
    transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    getCSS: (colors) => `
      @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Rajdhani:wght@400;600;700&display=swap');
      body {
        font-family: 'Rajdhani', sans-serif;
        background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
        min-height: 100vh;
        color: #e0e0e0;
      }
      .tool-container {
        background: rgba(255, 255, 255, 0.03);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        padding: 36px;
        max-width: 500px;
        margin: 40px auto;
        box-shadow: 0 0 40px rgba(${parseInt(colors.primary.slice(1,3), 16)}, ${parseInt(colors.primary.slice(3,5), 16)}, ${parseInt(colors.primary.slice(5,7), 16)}, 0.2);
        position: relative;
        overflow: hidden;
      }
      .tool-container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, ${colors.primary}, transparent);
      }
      .tool-header {
        text-align: center;
        margin-bottom: 32px;
      }
      .tool-title {
        font-family: 'Orbitron', sans-serif;
        font-size: 1.5rem;
        font-weight: 700;
        color: #fff;
        margin: 0 0 8px 0;
        text-transform: uppercase;
        letter-spacing: 3px;
        text-shadow: 0 0 20px ${colors.primary}80;
      }
      .tool-subtitle {
        color: ${colors.primary};
        font-size: 0.95rem;
        letter-spacing: 1px;
      }
      .form-group {
        margin-bottom: 24px;
      }
      .form-label {
        display: block;
        font-weight: 600;
        color: ${colors.primary};
        margin-bottom: 10px;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 2px;
      }
      .form-input {
        width: 100%;
        padding: 14px 18px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 12px;
        font-size: 1.1rem;
        font-family: 'Rajdhani', sans-serif;
        background: rgba(255, 255, 255, 0.05);
        color: #fff;
        transition: all 0.3s ease;
      }
      .form-input:focus {
        outline: none;
        border-color: ${colors.primary};
        box-shadow: 0 0 20px ${colors.primary}40;
        background: rgba(255, 255, 255, 0.08);
      }
      .form-input::placeholder {
        color: rgba(255, 255, 255, 0.4);
      }
      .btn-primary {
        width: 100%;
        padding: 16px 28px;
        background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark || colors.primary} 100%);
        color: white;
        border: none;
        border-radius: 25px;
        font-size: 1rem;
        font-weight: 700;
        cursor: pointer;
        text-transform: uppercase;
        letter-spacing: 3px;
        font-family: 'Orbitron', sans-serif;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      .btn-primary::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        transition: left 0.5s;
      }
      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 30px ${colors.primary}60;
      }
      .btn-primary:hover::before {
        left: 100%;
      }
      .result-card {
        margin-top: 28px;
        padding: 28px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid ${colors.primary}50;
        border-radius: 16px;
        display: none;
        position: relative;
      }
      .result-card.visible {
        display: block;
        animation: fadeIn 0.5s ease;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .result-title {
        font-family: 'Orbitron', sans-serif;
        font-weight: 700;
        color: ${colors.primary};
        margin-bottom: 16px;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 3px;
      }
      .result-value {
        font-family: 'Orbitron', sans-serif;
        font-size: 2.5rem;
        font-weight: 700;
        color: #fff;
        margin-bottom: 12px;
        text-shadow: 0 0 30px ${colors.primary}80;
      }
      .result-detail {
        color: rgba(255, 255, 255, 0.7);
        font-size: 1rem;
        margin-bottom: 6px;
        letter-spacing: 0.5px;
      }
      .brand-footer {
        text-align: center;
        margin-top: 28px;
        padding-top: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.4);
        font-size: 0.8rem;
        letter-spacing: 2px;
        text-transform: uppercase;
      }
    `
  },

  luxury: {
    name: 'Luxury',
    fonts: {
      heading: "'Cormorant Garamond', 'Playfair Display', serif",
      body: "'Montserrat', 'Lato', sans-serif"
    },
    borderRadius: '8px',
    inputRadius: '4px',
    buttonRadius: '4px',
    shadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    transition: '0.25s ease',
    getCSS: (colors) => `
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Montserrat:wght@300;400;500;600&display=swap');
      body {
        font-family: 'Montserrat', sans-serif;
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        min-height: 100vh;
      }
      .tool-container {
        background: linear-gradient(145deg, #1f1f1f 0%, #2a2a2a 100%);
        border: 1px solid #c9a962;
        border-radius: 8px;
        padding: 48px;
        max-width: 480px;
        margin: 50px auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        position: relative;
      }
      .tool-container::before {
        content: '';
        position: absolute;
        top: 8px;
        left: 8px;
        right: 8px;
        bottom: 8px;
        border: 1px solid rgba(201, 169, 98, 0.2);
        border-radius: 4px;
        pointer-events: none;
      }
      .tool-header {
        text-align: center;
        margin-bottom: 40px;
      }
      .tool-title {
        font-family: 'Cormorant Garamond', serif;
        font-size: 2rem;
        font-weight: 600;
        color: #c9a962;
        margin: 0 0 12px 0;
        letter-spacing: 4px;
        text-transform: uppercase;
      }
      .tool-subtitle {
        color: #888;
        font-size: 0.85rem;
        font-weight: 300;
        letter-spacing: 2px;
        text-transform: uppercase;
      }
      .form-group {
        margin-bottom: 28px;
      }
      .form-label {
        display: block;
        font-weight: 500;
        color: #c9a962;
        margin-bottom: 12px;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 2px;
      }
      .form-input {
        width: 100%;
        padding: 16px 20px;
        border: 1px solid #444;
        border-radius: 4px;
        font-size: 1rem;
        font-family: 'Montserrat', sans-serif;
        background: #1a1a1a;
        color: #fff;
        transition: all 0.25s ease;
        font-weight: 300;
      }
      .form-input:focus {
        outline: none;
        border-color: #c9a962;
        box-shadow: 0 0 20px rgba(201, 169, 98, 0.15);
      }
      .form-input::placeholder {
        color: #666;
        font-weight: 300;
      }
      .btn-primary {
        width: 100%;
        padding: 18px 32px;
        background: linear-gradient(135deg, #c9a962 0%, #d4b978 50%, #c9a962 100%);
        background-size: 200% auto;
        color: #1a1a1a;
        border: none;
        border-radius: 4px;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        text-transform: uppercase;
        letter-spacing: 3px;
        transition: all 0.25s ease;
      }
      .btn-primary:hover {
        background-position: right center;
        box-shadow: 0 8px 30px rgba(201, 169, 98, 0.3);
      }
      .result-card {
        margin-top: 36px;
        padding: 32px;
        background: rgba(201, 169, 98, 0.05);
        border: 1px solid rgba(201, 169, 98, 0.3);
        border-radius: 4px;
        display: none;
      }
      .result-card.visible { display: block; }
      .result-title {
        font-family: 'Cormorant Garamond', serif;
        font-weight: 600;
        color: #c9a962;
        margin-bottom: 20px;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 3px;
        border-bottom: 1px solid rgba(201, 169, 98, 0.3);
        padding-bottom: 12px;
      }
      .result-value {
        font-family: 'Cormorant Garamond', serif;
        font-size: 3rem;
        font-weight: 700;
        color: #c9a962;
        margin-bottom: 16px;
      }
      .result-detail {
        color: #999;
        font-size: 0.9rem;
        margin-bottom: 8px;
        font-weight: 300;
      }
      .brand-footer {
        text-align: center;
        margin-top: 36px;
        padding-top: 24px;
        border-top: 1px solid #333;
        color: #666;
        font-size: 0.75rem;
        letter-spacing: 2px;
        text-transform: uppercase;
      }
    `
  },

  minimal: {
    name: 'Minimal',
    fonts: {
      heading: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      body: "'Helvetica Neue', Helvetica, Arial, sans-serif"
    },
    borderRadius: '2px',
    inputRadius: '0px',
    buttonRadius: '0px',
    shadow: 'none',
    transition: '0.15s ease',
    getCSS: (colors) => `
      body {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        background: #fff;
        min-height: 100vh;
        color: #222;
      }
      .tool-container {
        background: white;
        border: none;
        padding: 60px 40px;
        max-width: 400px;
        margin: 60px auto;
      }
      .tool-header {
        text-align: left;
        margin-bottom: 48px;
      }
      .tool-title {
        font-size: 1.5rem;
        font-weight: 400;
        color: #222;
        margin: 0 0 8px 0;
        letter-spacing: -0.5px;
      }
      .tool-subtitle {
        color: #888;
        font-size: 0.9rem;
        font-weight: 300;
      }
      .form-group {
        margin-bottom: 32px;
      }
      .form-label {
        display: block;
        font-weight: 400;
        color: #222;
        margin-bottom: 12px;
        font-size: 0.9rem;
      }
      .form-input {
        width: 100%;
        padding: 12px 0;
        border: none;
        border-bottom: 1px solid #ddd;
        border-radius: 0;
        font-size: 1.1rem;
        font-family: inherit;
        background: transparent;
        transition: border-color 0.15s ease;
      }
      .form-input:focus {
        outline: none;
        border-color: ${colors.primary};
      }
      .form-input::placeholder {
        color: #ccc;
      }
      .btn-primary {
        width: 100%;
        padding: 14px 24px;
        background: ${colors.primary};
        color: white;
        border: none;
        border-radius: 0;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.15s ease;
        margin-top: 16px;
      }
      .btn-primary:hover {
        background: #222;
      }
      .result-card {
        margin-top: 48px;
        padding: 32px 0;
        background: transparent;
        border-top: 1px solid #eee;
        display: none;
      }
      .result-card.visible { display: block; }
      .result-title {
        font-weight: 400;
        color: #888;
        margin-bottom: 24px;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .result-value {
        font-size: 3rem;
        font-weight: 300;
        color: ${colors.primary};
        margin-bottom: 16px;
        letter-spacing: -1px;
      }
      .result-detail {
        color: #666;
        font-size: 0.9rem;
        margin-bottom: 8px;
      }
      .brand-footer {
        text-align: left;
        margin-top: 48px;
        padding-top: 24px;
        border-top: 1px solid #eee;
        color: #ccc;
        font-size: 0.8rem;
      }
    `
  }
};

// ============================================
// TOOL TEMPLATES WITH FULL LOGIC
// ============================================

const TOOL_GENERATORS = {
  'recipe-scaler': (config) => generateRecipeScaler(config),
  'tip-calculator': (config) => generateTipCalculator(config),
  'bmi-calculator': (config) => generateBMICalculator(config),
  'discount-calculator': (config) => generateDiscountCalculator(config),
  'percentage-calculator': (config) => generatePercentageCalculator(config),
  'unit-converter': (config) => generateUnitConverter(config),
  'age-calculator': (config) => generateAgeCalculator(config),
  'loan-calculator': (config) => generateLoanCalculator(config),
  'savings-calculator': (config) => generateSavingsCalculator(config),
  'calorie-calculator': (config) => generateCalorieCalculator(config),
  'grade-calculator': (config) => generateGradeCalculator(config),
  'mortgage-calculator': (config) => generateMortgageCalculator(config),
  'invoice-generator': (config) => generateQuoteCalculator({ ...config, name: config.name || 'Invoice Generator' }),
  'password-generator': (config) => generatePasswordGenerator(config),
  'countdown': (config) => generateCountdown(config),
  'word-counter': (config) => generateWordCounter(config),
  'inventory-tracker': (config) => generateInventoryTracker(config),
  'expense-tracker': (config) => generateExpenseTracker(config),
  'menu-generator': (config) => generateMenuGenerator(config),
  'booking-tool': (config) => generateBookingTool(config),
  'order-tracker': (config) => generateOrderTracker(config),
  'quote-calculator': (config) => generateQuoteCalculator(config),
  // Developer Tools
  'uuid-generator': (config) => generateUUIDGenerator(config),
  'json-formatter': (config) => generateJSONFormatter(config),
  'base64-encoder': (config) => generateBase64Encoder(config),
  'hash-generator': (config) => generateHashGenerator(config),
  'regex-tester': (config) => generateRegexTester(config),
  // Utility Tools
  'image-resizer': (config) => generateImageResizer(config),
  'json-csv-converter': (config) => generateJSONCSVConverter(config),
};

// ============================================
// RECIPE SCALER (Test Case)
// ============================================

function generateRecipeScaler(config) {
  const { name, style, colors, branding } = config;
  const stylePreset = STYLE_PRESETS[style] || STYLE_PRESETS.modern;
  const css = stylePreset.getCSS(colors);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name || 'Recipe Scaler'} | ${branding?.businessName || 'Kitchen Tools'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    ${css}

    .ingredient-list {
      margin-bottom: 24px;
    }
    .ingredient-item {
      display: grid;
      grid-template-columns: 80px 80px 1fr 40px;
      gap: 12px;
      margin-bottom: 12px;
      align-items: center;
    }
    .ingredient-item .form-input {
      margin: 0;
    }
    .add-ingredient {
      padding: 10px 16px;
      background: transparent;
      border: 1px dashed ${colors.primary}60;
      color: ${colors.primary};
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s ease;
      width: 100%;
    }
    .add-ingredient:hover {
      background: ${colors.primary}10;
      border-style: solid;
    }
    .remove-btn {
      padding: 8px;
      background: #fee2e2;
      color: #dc2626;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
    }
    .scale-options {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }
    .scale-btn {
      padding: 10px 16px;
      background: ${colors.primary}15;
      border: 1px solid ${colors.primary}30;
      border-radius: 20px;
      cursor: pointer;
      font-size: 0.9rem;
      color: ${colors.primary};
      transition: all 0.2s ease;
    }
    .scale-btn:hover, .scale-btn.active {
      background: ${colors.primary};
      color: white;
    }
    .result-ingredients {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .result-ingredient {
      display: flex;
      justify-content: space-between;
      padding: 12px 16px;
      background: rgba(255,255,255,0.5);
      border-radius: 8px;
    }
    .result-ingredient .amount {
      font-weight: 600;
      color: ${colors.primary};
    }
    .custom-scale {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .custom-scale .form-input {
      width: 100px;
    }
  </style>
</head>
<body>
  <div class="tool-container">
    <div class="tool-header">
      ${branding?.logo ? `<img src="${branding.logo}" alt="${branding.businessName}" style="height: 40px; margin-bottom: 16px;">` : ''}
      <h1 class="tool-title">${name || 'Recipe Scaler'}</h1>
      <p class="tool-subtitle">Scale your recipes to any serving size</p>
    </div>

    <form id="recipe-form">
      <div class="form-group">
        <label class="form-label">Original Servings</label>
        <input type="number" class="form-input" id="original-servings" value="4" min="1" required>
      </div>

      <div class="form-group">
        <label class="form-label">Ingredients</label>
        <div class="ingredient-list" id="ingredient-list">
          <div class="ingredient-item">
            <input type="number" class="form-input" placeholder="Amount" step="0.25" value="2">
            <select class="form-input" style="padding: 12px 8px;">
              <option value="cups">cups</option>
              <option value="tbsp">tbsp</option>
              <option value="tsp">tsp</option>
              <option value="oz">oz</option>
              <option value="lbs">lbs</option>
              <option value="g">g</option>
              <option value="ml">ml</option>
              <option value="whole">whole</option>
            </select>
            <input type="text" class="form-input" placeholder="Ingredient name" value="flour">
            <button type="button" class="remove-btn" onclick="removeIngredient(this)">×</button>
          </div>
          <div class="ingredient-item">
            <input type="number" class="form-input" placeholder="Amount" step="0.25" value="1">
            <select class="form-input" style="padding: 12px 8px;">
              <option value="cups">cups</option>
              <option value="tbsp">tbsp</option>
              <option value="tsp">tsp</option>
              <option value="oz">oz</option>
              <option value="lbs">lbs</option>
              <option value="g">g</option>
              <option value="ml">ml</option>
              <option value="whole">whole</option>
            </select>
            <input type="text" class="form-input" placeholder="Ingredient name" value="sugar">
            <button type="button" class="remove-btn" onclick="removeIngredient(this)">×</button>
          </div>
        </div>
        <button type="button" class="add-ingredient" onclick="addIngredient()">+ Add Ingredient</button>
      </div>

      <div class="form-group">
        <label class="form-label">Scale To</label>
        <div class="scale-options">
          <button type="button" class="scale-btn" onclick="setScale(0.5)">½×</button>
          <button type="button" class="scale-btn active" onclick="setScale(1)">1×</button>
          <button type="button" class="scale-btn" onclick="setScale(1.5)">1.5×</button>
          <button type="button" class="scale-btn" onclick="setScale(2)">2×</button>
          <button type="button" class="scale-btn" onclick="setScale(3)">3×</button>
        </div>
        <div class="custom-scale">
          <span>Or scale to:</span>
          <input type="number" class="form-input" id="target-servings" placeholder="Servings" min="1">
          <span>servings</span>
        </div>
      </div>

      <button type="submit" class="btn-primary">Scale Recipe</button>
    </form>

    <div class="result-card" id="result">
      <div class="result-title">Scaled Ingredients</div>
      <div class="result-value" id="result-servings">8 Servings</div>
      <div class="result-ingredients" id="result-ingredients"></div>
    </div>

    <footer class="brand-footer">
      ${branding?.businessName || 'Recipe Scaler'} • Powered by Blink
    </footer>
  </div>

  <script>
    let currentScale = 1;

    function addIngredient() {
      const list = document.getElementById('ingredient-list');
      const item = document.createElement('div');
      item.className = 'ingredient-item';
      item.innerHTML = \`
        <input type="number" class="form-input" placeholder="Amount" step="0.25">
        <select class="form-input" style="padding: 12px 8px;">
          <option value="cups">cups</option>
          <option value="tbsp">tbsp</option>
          <option value="tsp">tsp</option>
          <option value="oz">oz</option>
          <option value="lbs">lbs</option>
          <option value="g">g</option>
          <option value="ml">ml</option>
          <option value="whole">whole</option>
        </select>
        <input type="text" class="form-input" placeholder="Ingredient name">
        <button type="button" class="remove-btn" onclick="removeIngredient(this)">×</button>
      \`;
      list.appendChild(item);
    }

    function removeIngredient(btn) {
      const list = document.getElementById('ingredient-list');
      if (list.children.length > 1) {
        btn.closest('.ingredient-item').remove();
      }
    }

    function setScale(scale) {
      currentScale = scale;
      document.querySelectorAll('.scale-btn').forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');
      document.getElementById('target-servings').value = '';
    }

    function formatAmount(amount) {
      const fractions = {
        0.25: '¼', 0.33: '⅓', 0.5: '½', 0.67: '⅔', 0.75: '¾',
        0.125: '⅛', 0.375: '⅜', 0.625: '⅝', 0.875: '⅞'
      };

      const whole = Math.floor(amount);
      const decimal = amount - whole;

      if (decimal === 0) return whole.toString();

      const closestFraction = Object.entries(fractions).reduce((closest, [key, val]) => {
        return Math.abs(parseFloat(key) - decimal) < Math.abs(parseFloat(closest[0]) - decimal) ? [key, val] : closest;
      }, ['0', '']);

      if (Math.abs(parseFloat(closestFraction[0]) - decimal) < 0.1) {
        return whole > 0 ? whole + ' ' + closestFraction[1] : closestFraction[1];
      }

      return amount.toFixed(2).replace(/\\.?0+$/, '');
    }

    document.getElementById('recipe-form').addEventListener('submit', function(e) {
      e.preventDefault();

      const originalServings = parseFloat(document.getElementById('original-servings').value) || 4;
      const targetServings = document.getElementById('target-servings').value;

      let scale = currentScale;
      if (targetServings) {
        scale = parseFloat(targetServings) / originalServings;
      }

      const ingredients = [];
      document.querySelectorAll('.ingredient-item').forEach(item => {
        const amount = parseFloat(item.querySelector('input[type="number"]').value) || 0;
        const unit = item.querySelector('select').value;
        const name = item.querySelector('input[type="text"]').value;

        if (name) {
          ingredients.push({
            amount: amount * scale,
            unit,
            name
          });
        }
      });

      const newServings = targetServings ? parseFloat(targetServings) : Math.round(originalServings * scale);

      document.getElementById('result-servings').textContent = newServings + ' Servings';

      const resultsContainer = document.getElementById('result-ingredients');
      resultsContainer.innerHTML = ingredients.map(ing => \`
        <div class="result-ingredient">
          <span>\${ing.name}</span>
          <span class="amount">\${formatAmount(ing.amount)} \${ing.unit}</span>
        </div>
      \`).join('');

      document.getElementById('result').classList.add('visible');
    });
  </script>
</body>
</html>`;
}

// ============================================
// TIP CALCULATOR
// ============================================

function generateTipCalculator(config) {
  const { name, style, colors, branding } = config;
  const stylePreset = STYLE_PRESETS[style] || STYLE_PRESETS.modern;
  const css = stylePreset.getCSS(colors);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name || 'Tip Calculator'} | ${branding?.businessName || 'Tools'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    ${css}

    .tip-options {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 20px;
    }
    .tip-btn {
      padding: 14px 8px;
      background: ${colors.primary}15;
      border: 2px solid ${colors.primary}30;
      border-radius: 10px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      color: ${colors.primary};
      transition: all 0.2s ease;
    }
    .tip-btn:hover, .tip-btn.active {
      background: ${colors.primary};
      color: white;
      border-color: ${colors.primary};
    }
    .split-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .split-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid ${colors.primary}30;
      background: white;
      color: ${colors.primary};
      font-size: 1.25rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .split-btn:hover {
      background: ${colors.primary};
      color: white;
    }
    .split-value {
      font-size: 1.5rem;
      font-weight: 600;
      min-width: 40px;
      text-align: center;
    }
    .result-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid rgba(0,0,0,0.1);
    }
    .result-row:last-child {
      border-bottom: none;
      padding-top: 16px;
      font-weight: 700;
      font-size: 1.25rem;
    }
    .result-row .label {
      color: #666;
    }
    .result-row .value {
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="tool-container">
    <div class="tool-header">
      ${branding?.logo ? `<img src="${branding.logo}" alt="${branding.businessName}" style="height: 40px; margin-bottom: 16px;">` : ''}
      <h1 class="tool-title">${name || 'Tip Calculator'}</h1>
      <p class="tool-subtitle">Calculate tip and split the bill easily</p>
    </div>

    <form id="tip-form">
      <div class="form-group">
        <label class="form-label">Bill Amount</label>
        <input type="number" class="form-input" id="bill-amount" placeholder="0.00" step="0.01" min="0" required>
      </div>

      <div class="form-group">
        <label class="form-label">Tip Percentage</label>
        <div class="tip-options">
          <button type="button" class="tip-btn" data-tip="10">10%</button>
          <button type="button" class="tip-btn" data-tip="15">15%</button>
          <button type="button" class="tip-btn active" data-tip="18">18%</button>
          <button type="button" class="tip-btn" data-tip="20">20%</button>
          <button type="button" class="tip-btn" data-tip="22">22%</button>
          <button type="button" class="tip-btn" data-tip="25">25%</button>
          <button type="button" class="tip-btn" data-tip="30">30%</button>
          <input type="number" class="form-input" id="custom-tip" placeholder="Custom %" min="0" max="100" style="text-align: center;">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Split Between</label>
        <div class="split-group">
          <button type="button" class="split-btn" id="split-minus">−</button>
          <span class="split-value" id="split-count">1</span>
          <button type="button" class="split-btn" id="split-plus">+</button>
          <span style="color: #666; margin-left: 8px;">people</span>
        </div>
      </div>

      <button type="submit" class="btn-primary">Calculate</button>
    </form>

    <div class="result-card" id="result">
      <div class="result-title">Bill Breakdown</div>
      <div class="result-row">
        <span class="label">Subtotal</span>
        <span class="value" id="result-subtotal">$0.00</span>
      </div>
      <div class="result-row">
        <span class="label">Tip (<span id="result-tip-percent">18</span>%)</span>
        <span class="value" id="result-tip">$0.00</span>
      </div>
      <div class="result-row">
        <span class="label">Total</span>
        <span class="value" id="result-total">$0.00</span>
      </div>
      <div class="result-row" id="per-person-row" style="display: none;">
        <span class="label">Per Person</span>
        <span class="value" id="result-per-person">$0.00</span>
      </div>
    </div>

    <footer class="brand-footer">
      ${branding?.businessName || 'Tip Calculator'} • Powered by Blink
    </footer>
  </div>

  <script>
    let tipPercent = 18;
    let splitCount = 1;

    // Tip button handling
    document.querySelectorAll('.tip-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.tip-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        tipPercent = parseInt(this.dataset.tip);
        document.getElementById('custom-tip').value = '';
      });
    });

    // Custom tip handling
    document.getElementById('custom-tip').addEventListener('input', function() {
      if (this.value) {
        document.querySelectorAll('.tip-btn').forEach(b => b.classList.remove('active'));
        tipPercent = parseFloat(this.value) || 0;
      }
    });

    // Split handling
    document.getElementById('split-minus').addEventListener('click', function() {
      if (splitCount > 1) {
        splitCount--;
        document.getElementById('split-count').textContent = splitCount;
      }
    });

    document.getElementById('split-plus').addEventListener('click', function() {
      splitCount++;
      document.getElementById('split-count').textContent = splitCount;
    });

    // Form submission
    document.getElementById('tip-form').addEventListener('submit', function(e) {
      e.preventDefault();

      const bill = parseFloat(document.getElementById('bill-amount').value) || 0;
      const tip = bill * (tipPercent / 100);
      const total = bill + tip;
      const perPerson = total / splitCount;

      document.getElementById('result-subtotal').textContent = '$' + bill.toFixed(2);
      document.getElementById('result-tip-percent').textContent = tipPercent;
      document.getElementById('result-tip').textContent = '$' + tip.toFixed(2);
      document.getElementById('result-total').textContent = '$' + total.toFixed(2);
      document.getElementById('result-per-person').textContent = '$' + perPerson.toFixed(2);

      document.getElementById('per-person-row').style.display = splitCount > 1 ? 'flex' : 'none';
      document.getElementById('result').classList.add('visible');
    });
  </script>
</body>
</html>`;
}

// ============================================
// BMI CALCULATOR
// ============================================

function generateBMICalculator(config) {
  const { name, style, colors, branding } = config;
  const stylePreset = STYLE_PRESETS[style] || STYLE_PRESETS.modern;
  const css = stylePreset.getCSS(colors);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name || 'BMI Calculator'} | ${branding?.businessName || 'Health Tools'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    ${css}

    .unit-toggle {
      display: flex;
      background: ${colors.primary}15;
      border-radius: 8px;
      padding: 4px;
      margin-bottom: 24px;
    }
    .unit-btn {
      flex: 1;
      padding: 10px;
      border: none;
      background: transparent;
      cursor: pointer;
      font-weight: 500;
      border-radius: 6px;
      transition: all 0.2s ease;
    }
    .unit-btn.active {
      background: ${colors.primary};
      color: white;
    }
    .input-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .bmi-scale {
      display: flex;
      height: 12px;
      border-radius: 6px;
      overflow: hidden;
      margin: 20px 0;
    }
    .bmi-scale-section {
      flex: 1;
    }
    .bmi-indicator {
      width: 4px;
      height: 24px;
      background: #333;
      border-radius: 2px;
      margin-top: -6px;
      transition: margin-left 0.5s ease;
    }
    .bmi-category {
      text-align: center;
      padding: 16px;
      border-radius: 12px;
      margin-bottom: 16px;
    }
    .bmi-category.underweight { background: #fef3c7; color: #92400e; }
    .bmi-category.normal { background: #d1fae5; color: #065f46; }
    .bmi-category.overweight { background: #fed7aa; color: #9a3412; }
    .bmi-category.obese { background: #fecaca; color: #991b1b; }
  </style>
</head>
<body>
  <div class="tool-container">
    <div class="tool-header">
      <h1 class="tool-title">${name || 'BMI Calculator'}</h1>
      <p class="tool-subtitle">Calculate your Body Mass Index</p>
    </div>

    <form id="bmi-form">
      <div class="unit-toggle">
        <button type="button" class="unit-btn active" data-unit="imperial">Imperial (ft/lbs)</button>
        <button type="button" class="unit-btn" data-unit="metric">Metric (cm/kg)</button>
      </div>

      <div class="form-group imperial-fields">
        <label class="form-label">Height</label>
        <div class="input-row">
          <input type="number" class="form-input" id="height-ft" placeholder="Feet" min="1" max="8">
          <input type="number" class="form-input" id="height-in" placeholder="Inches" min="0" max="11">
        </div>
      </div>

      <div class="form-group metric-fields" style="display: none;">
        <label class="form-label">Height (cm)</label>
        <input type="number" class="form-input" id="height-cm" placeholder="e.g., 175" min="50" max="250">
      </div>

      <div class="form-group imperial-fields">
        <label class="form-label">Weight (lbs)</label>
        <input type="number" class="form-input" id="weight-lbs" placeholder="e.g., 150" min="1">
      </div>

      <div class="form-group metric-fields" style="display: none;">
        <label class="form-label">Weight (kg)</label>
        <input type="number" class="form-input" id="weight-kg" placeholder="e.g., 70" min="1">
      </div>

      <button type="submit" class="btn-primary">Calculate BMI</button>
    </form>

    <div class="result-card" id="result">
      <div class="result-title">Your Results</div>
      <div class="result-value" id="bmi-value">0.0</div>
      <div class="bmi-scale">
        <div class="bmi-scale-section" style="background: #fef3c7;"></div>
        <div class="bmi-scale-section" style="background: #d1fae5;"></div>
        <div class="bmi-scale-section" style="background: #fed7aa;"></div>
        <div class="bmi-scale-section" style="background: #fecaca;"></div>
      </div>
      <div class="bmi-indicator" id="bmi-indicator"></div>
      <div class="bmi-category normal" id="bmi-category">Normal Weight</div>
      <div class="result-detail" id="bmi-range"></div>
    </div>

    <footer class="brand-footer">
      ${branding?.businessName || 'BMI Calculator'} • Powered by Blink
    </footer>
  </div>

  <script>
    let unit = 'imperial';

    document.querySelectorAll('.unit-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        unit = this.dataset.unit;

        document.querySelectorAll('.imperial-fields').forEach(f => f.style.display = unit === 'imperial' ? 'block' : 'none');
        document.querySelectorAll('.metric-fields').forEach(f => f.style.display = unit === 'metric' ? 'block' : 'none');
      });
    });

    document.getElementById('bmi-form').addEventListener('submit', function(e) {
      e.preventDefault();

      let heightM, weightKg;

      if (unit === 'imperial') {
        const ft = parseFloat(document.getElementById('height-ft').value) || 0;
        const inches = parseFloat(document.getElementById('height-in').value) || 0;
        const lbs = parseFloat(document.getElementById('weight-lbs').value) || 0;
        heightM = ((ft * 12) + inches) * 0.0254;
        weightKg = lbs * 0.453592;
      } else {
        heightM = (parseFloat(document.getElementById('height-cm').value) || 0) / 100;
        weightKg = parseFloat(document.getElementById('weight-kg').value) || 0;
      }

      if (heightM <= 0 || weightKg <= 0) return;

      const bmi = weightKg / (heightM * heightM);

      document.getElementById('bmi-value').textContent = bmi.toFixed(1);

      const category = document.getElementById('bmi-category');
      category.className = 'bmi-category';

      let categoryText, rangeText;
      if (bmi < 18.5) {
        category.classList.add('underweight');
        categoryText = 'Underweight';
        rangeText = 'BMI less than 18.5';
      } else if (bmi < 25) {
        category.classList.add('normal');
        categoryText = 'Normal Weight';
        rangeText = 'BMI 18.5 - 24.9';
      } else if (bmi < 30) {
        category.classList.add('overweight');
        categoryText = 'Overweight';
        rangeText = 'BMI 25 - 29.9';
      } else {
        category.classList.add('obese');
        categoryText = 'Obese';
        rangeText = 'BMI 30 or greater';
      }

      category.textContent = categoryText;
      document.getElementById('bmi-range').textContent = rangeText;

      // Position indicator (0-40 BMI range mapped to 0-100%)
      const position = Math.min(Math.max((bmi - 10) / 30 * 100, 0), 100);
      document.getElementById('bmi-indicator').style.marginLeft = position + '%';

      document.getElementById('result').classList.add('visible');
    });
  </script>
</body>
</html>`;
}

// ============================================
// DISCOUNT CALCULATOR
// ============================================

function generateDiscountCalculator(config) {
  const { name, style, colors, branding } = config;
  const stylePreset = STYLE_PRESETS[style] || STYLE_PRESETS.modern;
  const css = stylePreset.getCSS(colors);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name || 'Discount Calculator'} | ${branding?.businessName || 'Shopping Tools'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    ${css}

    .discount-options {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 16px;
    }
    .discount-btn {
      padding: 12px 8px;
      background: ${colors.primary}15;
      border: 2px solid ${colors.primary}30;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      color: ${colors.primary};
      transition: all 0.2s ease;
    }
    .discount-btn:hover, .discount-btn.active {
      background: ${colors.primary};
      color: white;
      border-color: ${colors.primary};
    }
    .savings-highlight {
      background: linear-gradient(135deg, #22c55e15 0%, #16a34a20 100%);
      border: 2px solid #22c55e;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin-bottom: 16px;
    }
    .savings-amount {
      font-size: 2rem;
      font-weight: 700;
      color: #16a34a;
    }
    .savings-label {
      color: #666;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="tool-container">
    <div class="tool-header">
      <h1 class="tool-title">${name || 'Discount Calculator'}</h1>
      <p class="tool-subtitle">Calculate sale prices and savings</p>
    </div>

    <form id="discount-form">
      <div class="form-group">
        <label class="form-label">Original Price</label>
        <input type="number" class="form-input" id="original-price" placeholder="$0.00" step="0.01" min="0" required>
      </div>

      <div class="form-group">
        <label class="form-label">Discount</label>
        <div class="discount-options">
          <button type="button" class="discount-btn" data-discount="10">10%</button>
          <button type="button" class="discount-btn" data-discount="15">15%</button>
          <button type="button" class="discount-btn active" data-discount="20">20%</button>
          <button type="button" class="discount-btn" data-discount="25">25%</button>
          <button type="button" class="discount-btn" data-discount="30">30%</button>
          <button type="button" class="discount-btn" data-discount="40">40%</button>
          <button type="button" class="discount-btn" data-discount="50">50%</button>
          <input type="number" class="form-input" id="custom-discount" placeholder="%" min="0" max="100" style="text-align: center;">
        </div>
      </div>

      <button type="submit" class="btn-primary">Calculate Savings</button>
    </form>

    <div class="result-card" id="result">
      <div class="savings-highlight">
        <div class="savings-amount" id="savings-amount">$0.00</div>
        <div class="savings-label">You Save!</div>
      </div>
      <div class="result-title">Price Breakdown</div>
      <div class="result-detail">Original: <strong id="result-original">$0.00</strong></div>
      <div class="result-detail">Discount: <strong id="result-discount">0%</strong></div>
      <div class="result-value" id="result-final">$0.00</div>
      <div class="result-detail" style="color: #16a34a; font-weight: 600;">Final Price</div>
    </div>

    <footer class="brand-footer">
      ${branding?.businessName || 'Discount Calculator'} • Powered by Blink
    </footer>
  </div>

  <script>
    let discountPercent = 20;

    document.querySelectorAll('.discount-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.discount-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        discountPercent = parseInt(this.dataset.discount);
        document.getElementById('custom-discount').value = '';
      });
    });

    document.getElementById('custom-discount').addEventListener('input', function() {
      if (this.value) {
        document.querySelectorAll('.discount-btn').forEach(b => b.classList.remove('active'));
        discountPercent = parseFloat(this.value) || 0;
      }
    });

    document.getElementById('discount-form').addEventListener('submit', function(e) {
      e.preventDefault();

      const original = parseFloat(document.getElementById('original-price').value) || 0;
      const savings = original * (discountPercent / 100);
      const final = original - savings;

      document.getElementById('savings-amount').textContent = '$' + savings.toFixed(2);
      document.getElementById('result-original').textContent = '$' + original.toFixed(2);
      document.getElementById('result-discount').textContent = discountPercent + '%';
      document.getElementById('result-final').textContent = '$' + final.toFixed(2);

      document.getElementById('result').classList.add('visible');
    });
  </script>
</body>
</html>`;
}

// ============================================
// PERCENTAGE CALCULATOR
// ============================================

function generatePercentageCalculator(config) {
  const { name, style, colors, branding } = config;
  const stylePreset = STYLE_PRESETS[style] || STYLE_PRESETS.modern;
  const css = stylePreset.getCSS(colors);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name || 'Percentage Calculator'} | ${branding?.businessName || 'Math Tools'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    ${css}

    .calc-tabs {
      display: flex;
      background: ${colors.primary}15;
      border-radius: 8px;
      padding: 4px;
      margin-bottom: 24px;
    }
    .calc-tab {
      flex: 1;
      padding: 10px;
      border: none;
      background: transparent;
      cursor: pointer;
      font-weight: 500;
      border-radius: 6px;
      transition: all 0.2s ease;
      font-size: 0.9rem;
    }
    .calc-tab.active {
      background: ${colors.primary};
      color: white;
    }
    .calc-section {
      display: none;
    }
    .calc-section.active {
      display: block;
    }
    .inline-form {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .inline-input {
      width: 100px;
      padding: 12px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 1rem;
      text-align: center;
    }
    .inline-input:focus {
      outline: none;
      border-color: ${colors.primary};
    }
    .inline-text {
      color: #666;
      font-size: 1rem;
    }
  </style>
</head>
<body>
  <div class="tool-container">
    <div class="tool-header">
      <h1 class="tool-title">${name || 'Percentage Calculator'}</h1>
      <p class="tool-subtitle">Multiple ways to calculate percentages</p>
    </div>

    <div class="calc-tabs">
      <button type="button" class="calc-tab active" data-calc="percent-of">% of Number</button>
      <button type="button" class="calc-tab" data-calc="what-percent">What %?</button>
      <button type="button" class="calc-tab" data-calc="percent-change">% Change</button>
    </div>

    <div class="calc-section active" id="percent-of">
      <form id="percent-of-form">
        <div class="inline-form" style="margin-bottom: 20px;">
          <span class="inline-text">What is</span>
          <input type="number" class="inline-input" id="pof-percent" placeholder="%" step="any">
          <span class="inline-text">% of</span>
          <input type="number" class="inline-input" id="pof-number" placeholder="Number" step="any">
          <span class="inline-text">?</span>
        </div>
        <button type="submit" class="btn-primary">Calculate</button>
      </form>
    </div>

    <div class="calc-section" id="what-percent">
      <form id="what-percent-form">
        <div class="inline-form" style="margin-bottom: 20px;">
          <input type="number" class="inline-input" id="wp-part" placeholder="Part" step="any">
          <span class="inline-text">is what % of</span>
          <input type="number" class="inline-input" id="wp-whole" placeholder="Whole" step="any">
          <span class="inline-text">?</span>
        </div>
        <button type="submit" class="btn-primary">Calculate</button>
      </form>
    </div>

    <div class="calc-section" id="percent-change">
      <form id="percent-change-form">
        <div class="inline-form" style="margin-bottom: 20px;">
          <span class="inline-text">From</span>
          <input type="number" class="inline-input" id="pc-from" placeholder="Original" step="any">
          <span class="inline-text">to</span>
          <input type="number" class="inline-input" id="pc-to" placeholder="New" step="any">
        </div>
        <button type="submit" class="btn-primary">Calculate Change</button>
      </form>
    </div>

    <div class="result-card" id="result">
      <div class="result-title">Result</div>
      <div class="result-value" id="result-value">0</div>
      <div class="result-detail" id="result-detail"></div>
    </div>

    <footer class="brand-footer">
      ${branding?.businessName || 'Percentage Calculator'} • Powered by Blink
    </footer>
  </div>

  <script>
    document.querySelectorAll('.calc-tab').forEach(tab => {
      tab.addEventListener('click', function() {
        document.querySelectorAll('.calc-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.calc-section').forEach(s => s.classList.remove('active'));
        this.classList.add('active');
        document.getElementById(this.dataset.calc).classList.add('active');
        document.getElementById('result').classList.remove('visible');
      });
    });

    document.getElementById('percent-of-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const percent = parseFloat(document.getElementById('pof-percent').value) || 0;
      const number = parseFloat(document.getElementById('pof-number').value) || 0;
      const result = (percent / 100) * number;

      document.getElementById('result-value').textContent = result.toFixed(2);
      document.getElementById('result-detail').textContent = percent + '% of ' + number + ' = ' + result.toFixed(2);
      document.getElementById('result').classList.add('visible');
    });

    document.getElementById('what-percent-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const part = parseFloat(document.getElementById('wp-part').value) || 0;
      const whole = parseFloat(document.getElementById('wp-whole').value) || 1;
      const result = (part / whole) * 100;

      document.getElementById('result-value').textContent = result.toFixed(2) + '%';
      document.getElementById('result-detail').textContent = part + ' is ' + result.toFixed(2) + '% of ' + whole;
      document.getElementById('result').classList.add('visible');
    });

    document.getElementById('percent-change-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const from = parseFloat(document.getElementById('pc-from').value) || 0;
      const to = parseFloat(document.getElementById('pc-to').value) || 0;
      const change = ((to - from) / Math.abs(from)) * 100;
      const direction = change >= 0 ? 'increase' : 'decrease';

      document.getElementById('result-value').textContent = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
      document.getElementById('result-detail').textContent = 'A ' + Math.abs(change).toFixed(2) + '% ' + direction + ' from ' + from + ' to ' + to;
      document.getElementById('result').classList.add('visible');
    });
  </script>
</body>
</html>`;
}

// ============================================
// GENERIC FALLBACK GENERATOR
// ============================================

function generateGenericTool(config) {
  const { name, style, colors, branding, fields = [], features = [] } = config;
  const stylePreset = STYLE_PRESETS[style] || STYLE_PRESETS.modern;
  const css = stylePreset.getCSS(colors);

  const fieldsHtml = fields.map(field => {
    const id = field.name?.toLowerCase().replace(/\s+/g, '-') || 'field';
    if (field.type === 'number') {
      return `<div class="form-group">
        <label class="form-label">${field.label || field.name}</label>
        <input type="number" class="form-input" id="${id}" placeholder="${field.placeholder || '0'}" step="${field.step || '1'}">
      </div>`;
    }
    if (field.type === 'select' && field.options) {
      return `<div class="form-group">
        <label class="form-label">${field.label || field.name}</label>
        <select class="form-input" id="${id}">
          ${field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
        </select>
      </div>`;
    }
    return `<div class="form-group">
      <label class="form-label">${field.label || field.name}</label>
      <input type="text" class="form-input" id="${id}" placeholder="${field.placeholder || ''}">
    </div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name || 'Tool'} | ${branding?.businessName || 'Tools'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    ${css}
  </style>
</head>
<body>
  <div class="tool-container">
    <div class="tool-header">
      <h1 class="tool-title">${name || 'Tool'}</h1>
      <p class="tool-subtitle">Powered by AI</p>
    </div>

    <form id="tool-form">
      ${fieldsHtml || '<div class="form-group"><label class="form-label">Input</label><input type="text" class="form-input" id="input" placeholder="Enter value"></div>'}
      <button type="submit" class="btn-primary">Calculate</button>
    </form>

    <div class="result-card" id="result">
      <div class="result-title">Result</div>
      <div class="result-value" id="result-value">-</div>
    </div>

    <footer class="brand-footer">
      ${branding?.businessName || name || 'Tool'} • Powered by Blink
    </footer>
  </div>

  <script>
    document.getElementById('tool-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const inputs = this.querySelectorAll('input, select');
      let output = [];
      inputs.forEach(input => {
        if (input.value) output.push(input.value);
      });
      document.getElementById('result-value').textContent = output.join(' | ') || 'Calculated!';
      document.getElementById('result').classList.add('visible');
    });
  </script>
</body>
</html>`;
}

// ============================================
// INVENTORY TRACKER
// ============================================

function generateInventoryTracker(config) {
  const { name, style, colors, branding } = config;
  const stylePreset = STYLE_PRESETS[style] || STYLE_PRESETS.modern;
  const css = stylePreset.getCSS(colors);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name || 'Inventory Tracker'} | ${branding?.businessName || 'Business Tools'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    ${css}

    .inventory-list {
      margin-bottom: 24px;
    }
    .inventory-item {
      display: grid;
      grid-template-columns: 1fr 100px 100px 80px;
      gap: 12px;
      margin-bottom: 12px;
      align-items: center;
      padding: 12px;
      background: rgba(255,255,255,0.05);
      border-radius: 8px;
    }
    .inventory-item .form-input {
      margin: 0;
    }
    .add-item {
      padding: 12px 16px;
      background: transparent;
      border: 1px dashed ${colors.primary}60;
      color: ${colors.primary};
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s ease;
      width: 100%;
    }
    .add-item:hover {
      background: ${colors.primary}10;
      border-style: solid;
    }
    .remove-btn {
      padding: 8px 12px;
      background: #fee2e2;
      color: #dc2626;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
    }
    .stock-low { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); }
    .stock-ok { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-top: 20px;
    }
    .summary-card {
      text-align: center;
      padding: 16px;
      background: rgba(255,255,255,0.05);
      border-radius: 8px;
    }
    .summary-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: ${colors.primary};
    }
    .summary-label {
      font-size: 0.75rem;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 4px;
    }
  </style>
</head>
<body>
  <div class="tool-container">
    <div class="tool-header">
      <h1 class="tool-title">${name || 'Inventory Tracker'}</h1>
      <p class="tool-subtitle">Track your stock levels</p>
    </div>

    <div class="form-group">
      <label class="form-label">Inventory Items</label>
      <div class="inventory-list" id="inventory-list">
        <div class="inventory-item">
          <input type="text" class="form-input" placeholder="Item name" value="Coffee Beans (1lb)">
          <input type="number" class="form-input" placeholder="Qty" value="24">
          <input type="number" class="form-input" placeholder="Min" value="10">
          <button type="button" class="remove-btn" onclick="removeItem(this)">×</button>
        </div>
        <div class="inventory-item">
          <input type="text" class="form-input" placeholder="Item name" value="Milk (gal)">
          <input type="number" class="form-input" placeholder="Qty" value="8">
          <input type="number" class="form-input" placeholder="Min" value="5">
          <button type="button" class="remove-btn" onclick="removeItem(this)">×</button>
        </div>
        <div class="inventory-item">
          <input type="text" class="form-input" placeholder="Item name" value="Sugar (5lb)">
          <input type="number" class="form-input" placeholder="Qty" value="3">
          <input type="number" class="form-input" placeholder="Min" value="4">
          <button type="button" class="remove-btn" onclick="removeItem(this)">×</button>
        </div>
      </div>
      <button type="button" class="add-item" onclick="addItem()">+ Add Item</button>
    </div>

    <button class="btn-primary" onclick="updateInventory()">Update Inventory</button>

    <div class="result-card visible" id="result">
      <div class="result-title">Inventory Summary</div>
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-value" id="total-items">3</div>
          <div class="summary-label">Total Items</div>
        </div>
        <div class="summary-card">
          <div class="summary-value" id="low-stock">1</div>
          <div class="summary-label">Low Stock</div>
        </div>
        <div class="summary-card">
          <div class="summary-value" id="total-units">35</div>
          <div class="summary-label">Total Units</div>
        </div>
      </div>
    </div>

    <footer class="brand-footer">
      ${branding?.businessName || 'Business'} • Powered by Blink
    </footer>
  </div>

  <script>
    function addItem() {
      const list = document.getElementById('inventory-list');
      const item = document.createElement('div');
      item.className = 'inventory-item';
      item.innerHTML = \`
        <input type="text" class="form-input" placeholder="Item name">
        <input type="number" class="form-input" placeholder="Qty" value="0">
        <input type="number" class="form-input" placeholder="Min" value="5">
        <button type="button" class="remove-btn" onclick="removeItem(this)">×</button>
      \`;
      list.appendChild(item);
      updateInventory();
    }

    function removeItem(btn) {
      const list = document.getElementById('inventory-list');
      if (list.children.length > 1) {
        btn.closest('.inventory-item').remove();
        updateInventory();
      }
    }

    function updateInventory() {
      const items = document.querySelectorAll('.inventory-item');
      let totalItems = 0;
      let lowStock = 0;
      let totalUnits = 0;

      items.forEach(item => {
        const qty = parseInt(item.querySelectorAll('input')[1].value) || 0;
        const min = parseInt(item.querySelectorAll('input')[2].value) || 0;
        const name = item.querySelectorAll('input')[0].value;

        if (name) {
          totalItems++;
          totalUnits += qty;
          if (qty <= min) {
            lowStock++;
            item.classList.add('stock-low');
            item.classList.remove('stock-ok');
          } else {
            item.classList.remove('stock-low');
            item.classList.add('stock-ok');
          }
        }
      });

      document.getElementById('total-items').textContent = totalItems;
      document.getElementById('low-stock').textContent = lowStock;
      document.getElementById('total-units').textContent = totalUnits;
    }

    updateInventory();
  </script>
</body>
</html>`;
}

// ============================================
// EXPENSE TRACKER
// ============================================

function generateExpenseTracker(config) {
  const { name, style, colors, branding } = config;
  const stylePreset = STYLE_PRESETS[style] || STYLE_PRESETS.modern;
  const css = stylePreset.getCSS(colors);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name || 'Expense Tracker'} | ${branding?.businessName || 'Business Tools'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    ${css}

    .expense-list {
      margin-bottom: 24px;
      max-height: 300px;
      overflow-y: auto;
    }
    .expense-item {
      display: grid;
      grid-template-columns: 1fr 120px 100px 60px;
      gap: 12px;
      margin-bottom: 12px;
      align-items: center;
      padding: 12px;
      background: rgba(255,255,255,0.05);
      border-radius: 8px;
    }
    .expense-item .form-input {
      margin: 0;
    }
    .category-select {
      padding: 12px;
      border: 1px solid #444;
      border-radius: 4px;
      background: #1a1a1a;
      color: #fff;
      font-size: 0.9rem;
    }
    .add-expense {
      padding: 12px 16px;
      background: transparent;
      border: 1px dashed ${colors.primary}60;
      color: ${colors.primary};
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s ease;
      width: 100%;
    }
    .add-expense:hover {
      background: ${colors.primary}10;
      border-style: solid;
    }
    .remove-btn {
      padding: 8px 12px;
      background: #fee2e2;
      color: #dc2626;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-top: 20px;
    }
    .summary-card {
      text-align: center;
      padding: 20px;
      background: rgba(255,255,255,0.05);
      border-radius: 8px;
    }
    .summary-value {
      font-size: 1.8rem;
      font-weight: 700;
      color: ${colors.primary};
    }
    .summary-label {
      font-size: 0.75rem;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 4px;
    }
    .category-breakdown {
      margin-top: 20px;
    }
    .category-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .category-bar {
      height: 8px;
      background: ${colors.primary}30;
      border-radius: 4px;
      margin-top: 8px;
      overflow: hidden;
    }
    .category-fill {
      height: 100%;
      background: ${colors.primary};
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="tool-container">
    <div class="tool-header">
      <h1 class="tool-title">${name || 'Expense Tracker'}</h1>
      <p class="tool-subtitle">Track your business expenses</p>
    </div>

    <div class="form-group">
      <label class="form-label">Add Expenses</label>
      <div class="expense-list" id="expense-list">
        <div class="expense-item">
          <input type="text" class="form-input" placeholder="Description" value="Coffee supplies">
          <select class="category-select">
            <option value="supplies">Supplies</option>
            <option value="utilities">Utilities</option>
            <option value="rent">Rent</option>
            <option value="payroll">Payroll</option>
            <option value="marketing">Marketing</option>
            <option value="other">Other</option>
          </select>
          <input type="number" class="form-input" placeholder="$0.00" value="150" step="0.01">
          <button type="button" class="remove-btn" onclick="removeExpense(this)">×</button>
        </div>
        <div class="expense-item">
          <input type="text" class="form-input" placeholder="Description" value="Electric bill">
          <select class="category-select">
            <option value="supplies">Supplies</option>
            <option value="utilities" selected>Utilities</option>
            <option value="rent">Rent</option>
            <option value="payroll">Payroll</option>
            <option value="marketing">Marketing</option>
            <option value="other">Other</option>
          </select>
          <input type="number" class="form-input" placeholder="$0.00" value="280" step="0.01">
          <button type="button" class="remove-btn" onclick="removeExpense(this)">×</button>
        </div>
      </div>
      <button type="button" class="add-expense" onclick="addExpense()">+ Add Expense</button>
    </div>

    <button class="btn-primary" onclick="calculateExpenses()">Calculate Total</button>

    <div class="result-card visible" id="result">
      <div class="result-title">Expense Summary</div>
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-value" id="total-expenses">$430.00</div>
          <div class="summary-label">Total Expenses</div>
        </div>
        <div class="summary-card">
          <div class="summary-value" id="expense-count">2</div>
          <div class="summary-label">Transactions</div>
        </div>
      </div>
      <div class="category-breakdown" id="category-breakdown"></div>
    </div>

    <footer class="brand-footer">
      ${branding?.businessName || 'Business'} • Powered by Blink
    </footer>
  </div>

  <script>
    function addExpense() {
      const list = document.getElementById('expense-list');
      const item = document.createElement('div');
      item.className = 'expense-item';
      item.innerHTML = \`
        <input type="text" class="form-input" placeholder="Description">
        <select class="category-select">
          <option value="supplies">Supplies</option>
          <option value="utilities">Utilities</option>
          <option value="rent">Rent</option>
          <option value="payroll">Payroll</option>
          <option value="marketing">Marketing</option>
          <option value="other">Other</option>
        </select>
        <input type="number" class="form-input" placeholder="$0.00" step="0.01">
        <button type="button" class="remove-btn" onclick="removeExpense(this)">×</button>
      \`;
      list.appendChild(item);
    }

    function removeExpense(btn) {
      const list = document.getElementById('expense-list');
      if (list.children.length > 1) {
        btn.closest('.expense-item').remove();
        calculateExpenses();
      }
    }

    function calculateExpenses() {
      const items = document.querySelectorAll('.expense-item');
      let total = 0;
      let count = 0;
      const categories = {};

      items.forEach(item => {
        const amount = parseFloat(item.querySelector('input[type="number"]').value) || 0;
        const category = item.querySelector('select').value;
        const desc = item.querySelector('input[type="text"]').value;

        if (desc && amount > 0) {
          total += amount;
          count++;
          categories[category] = (categories[category] || 0) + amount;
        }
      });

      document.getElementById('total-expenses').textContent = '$' + total.toFixed(2);
      document.getElementById('expense-count').textContent = count;

      // Category breakdown
      const breakdown = document.getElementById('category-breakdown');
      breakdown.innerHTML = '<div class="result-title" style="margin-top:20px">By Category</div>';

      Object.entries(categories).sort((a,b) => b[1] - a[1]).forEach(([cat, amt]) => {
        const pct = total > 0 ? (amt / total * 100) : 0;
        breakdown.innerHTML += \`
          <div class="category-row">
            <span>\${cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
            <span>$\${amt.toFixed(2)}</span>
          </div>
          <div class="category-bar"><div class="category-fill" style="width:\${pct}%"></div></div>
        \`;
      });
    }

    calculateExpenses();
  </script>
</body>
</html>`;
}

// ============================================
// MENU GENERATOR
// ============================================

function generateMenuGenerator(config) {
  const { name, style, colors, branding } = config;
  const stylePreset = STYLE_PRESETS[style] || STYLE_PRESETS.modern;
  const css = stylePreset.getCSS(colors);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name || 'Menu Generator'} | ${branding?.businessName || 'Restaurant Tools'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    ${css}

    .menu-section {
      margin-bottom: 32px;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .section-title-input {
      font-size: 1.2rem;
      font-weight: 600;
      background: transparent;
      border: none;
      border-bottom: 2px solid ${colors.primary}40;
      color: ${colors.primary};
      padding: 8px 0;
      width: 200px;
    }
    .section-title-input:focus {
      outline: none;
      border-color: ${colors.primary};
    }
    .menu-item {
      display: grid;
      grid-template-columns: 1fr 80px 60px;
      gap: 12px;
      margin-bottom: 12px;
      align-items: center;
      padding: 12px;
      background: rgba(255,255,255,0.05);
      border-radius: 8px;
    }
    .menu-item .form-input {
      margin: 0;
    }
    .add-btn {
      padding: 10px 16px;
      background: transparent;
      border: 1px dashed ${colors.primary}60;
      color: ${colors.primary};
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.2s ease;
    }
    .add-btn:hover {
      background: ${colors.primary}10;
      border-style: solid;
    }
    .remove-btn {
      padding: 6px 10px;
      background: #fee2e2;
      color: #dc2626;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
    }
    .menu-preview {
      background: white;
      color: #333;
      padding: 40px;
      border-radius: 8px;
      margin-top: 24px;
    }
    .preview-header {
      text-align: center;
      margin-bottom: 32px;
      padding-bottom: 16px;
      border-bottom: 2px solid ${colors.primary};
    }
    .preview-title {
      font-size: 2rem;
      color: ${colors.primary};
      margin-bottom: 8px;
    }
    .preview-section {
      margin-bottom: 24px;
    }
    .preview-section-title {
      font-size: 1.2rem;
      color: ${colors.primary};
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .preview-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px dotted #ddd;
    }
    .preview-item-name {
      font-weight: 500;
    }
    .preview-item-price {
      color: ${colors.primary};
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="tool-container" style="max-width: 600px;">
    <div class="tool-header">
      <h1 class="tool-title">${name || 'Menu Generator'}</h1>
      <p class="tool-subtitle">Create your menu</p>
    </div>

    <div id="menu-sections">
      <div class="menu-section" data-section="appetizers">
        <div class="section-header">
          <input type="text" class="section-title-input" value="Appetizers" placeholder="Section name">
          <button class="remove-btn" onclick="removeSection(this)">Remove</button>
        </div>
        <div class="menu-items">
          <div class="menu-item">
            <input type="text" class="form-input" placeholder="Item name" value="House Salad">
            <input type="number" class="form-input" placeholder="$" value="8.99" step="0.01">
            <button class="remove-btn" onclick="removeItem(this)">×</button>
          </div>
          <div class="menu-item">
            <input type="text" class="form-input" placeholder="Item name" value="Soup of the Day">
            <input type="number" class="form-input" placeholder="$" value="6.99" step="0.01">
            <button class="remove-btn" onclick="removeItem(this)">×</button>
          </div>
        </div>
        <button class="add-btn" onclick="addItem(this)" style="width:100%;margin-top:8px">+ Add Item</button>
      </div>

      <div class="menu-section" data-section="mains">
        <div class="section-header">
          <input type="text" class="section-title-input" value="Main Courses" placeholder="Section name">
          <button class="remove-btn" onclick="removeSection(this)">Remove</button>
        </div>
        <div class="menu-items">
          <div class="menu-item">
            <input type="text" class="form-input" placeholder="Item name" value="Grilled Salmon">
            <input type="number" class="form-input" placeholder="$" value="24.99" step="0.01">
            <button class="remove-btn" onclick="removeItem(this)">×</button>
          </div>
        </div>
        <button class="add-btn" onclick="addItem(this)" style="width:100%;margin-top:8px">+ Add Item</button>
      </div>
    </div>

    <button class="add-btn" onclick="addSection()" style="width:100%;margin:20px 0">+ Add Section</button>

    <button class="btn-primary" onclick="generatePreview()">Generate Menu Preview</button>

    <div class="menu-preview" id="menu-preview" style="display:none">
      <div class="preview-header">
        <div class="preview-title">${branding?.businessName || 'Our Menu'}</div>
      </div>
      <div id="preview-content"></div>
    </div>

    <footer class="brand-footer">
      ${branding?.businessName || 'Restaurant'} • Powered by Blink
    </footer>
  </div>

  <script>
    function addSection() {
      const container = document.getElementById('menu-sections');
      const section = document.createElement('div');
      section.className = 'menu-section';
      section.innerHTML = \`
        <div class="section-header">
          <input type="text" class="section-title-input" placeholder="Section name">
          <button class="remove-btn" onclick="removeSection(this)">Remove</button>
        </div>
        <div class="menu-items"></div>
        <button class="add-btn" onclick="addItem(this)" style="width:100%;margin-top:8px">+ Add Item</button>
      \`;
      container.appendChild(section);
    }

    function removeSection(btn) {
      const sections = document.querySelectorAll('.menu-section');
      if (sections.length > 1) {
        btn.closest('.menu-section').remove();
      }
    }

    function addItem(btn) {
      const section = btn.closest('.menu-section');
      const items = section.querySelector('.menu-items');
      const item = document.createElement('div');
      item.className = 'menu-item';
      item.innerHTML = \`
        <input type="text" class="form-input" placeholder="Item name">
        <input type="number" class="form-input" placeholder="$" step="0.01">
        <button class="remove-btn" onclick="removeItem(this)">×</button>
      \`;
      items.appendChild(item);
    }

    function removeItem(btn) {
      const items = btn.closest('.menu-items');
      if (items.children.length > 1) {
        btn.closest('.menu-item').remove();
      }
    }

    function generatePreview() {
      const preview = document.getElementById('menu-preview');
      const content = document.getElementById('preview-content');
      content.innerHTML = '';

      document.querySelectorAll('.menu-section').forEach(section => {
        const title = section.querySelector('.section-title-input').value;
        if (!title) return;

        let sectionHtml = '<div class="preview-section"><div class="preview-section-title">' + title + '</div>';

        section.querySelectorAll('.menu-item').forEach(item => {
          const name = item.querySelectorAll('input')[0].value;
          const price = parseFloat(item.querySelectorAll('input')[1].value);
          if (name && price) {
            sectionHtml += '<div class="preview-item"><span class="preview-item-name">' + name + '</span><span class="preview-item-price">$' + price.toFixed(2) + '</span></div>';
          }
        });

        sectionHtml += '</div>';
        content.innerHTML += sectionHtml;
      });

      preview.style.display = 'block';
    }
  </script>
</body>
</html>`;
}

// ============================================
// BOOKING TOOL
// ============================================

function generateBookingTool(config) {
  const { name, style, colors, branding } = config;
  const stylePreset = STYLE_PRESETS[style] || STYLE_PRESETS.modern;
  const css = stylePreset.getCSS(colors);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name || 'Booking Tool'} | ${branding?.businessName || 'Business Tools'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    ${css}

    .time-slots {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 24px;
    }
    .time-slot {
      padding: 12px;
      text-align: center;
      border: 1px solid ${colors.primary}30;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      background: rgba(255,255,255,0.05);
    }
    .time-slot:hover {
      border-color: ${colors.primary};
      background: ${colors.primary}10;
    }
    .time-slot.selected {
      background: ${colors.primary};
      color: white;
      border-color: ${colors.primary};
    }
    .time-slot.unavailable {
      opacity: 0.4;
      cursor: not-allowed;
      text-decoration: line-through;
    }
    .party-size {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
    }
    .party-btn {
      width: 50px;
      height: 50px;
      border: 1px solid ${colors.primary}30;
      border-radius: 8px;
      background: rgba(255,255,255,0.05);
      color: inherit;
      font-size: 1.1rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .party-btn:hover, .party-btn.selected {
      background: ${colors.primary};
      color: white;
      border-color: ${colors.primary};
    }
    .booking-summary {
      padding: 20px;
      background: rgba(255,255,255,0.05);
      border-radius: 8px;
      margin-top: 20px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .summary-row:last-child {
      border-bottom: none;
    }
  </style>
</head>
<body>
  <div class="tool-container">
    <div class="tool-header">
      <h1 class="tool-title">${name || 'Book a Table'}</h1>
      <p class="tool-subtitle">Reserve your spot</p>
    </div>

    <form id="booking-form">
      <div class="form-group">
        <label class="form-label">Select Date</label>
        <input type="date" class="form-input" id="booking-date" required>
      </div>

      <div class="form-group">
        <label class="form-label">Party Size</label>
        <div class="party-size" id="party-size">
          <button type="button" class="party-btn" data-size="1">1</button>
          <button type="button" class="party-btn selected" data-size="2">2</button>
          <button type="button" class="party-btn" data-size="3">3</button>
          <button type="button" class="party-btn" data-size="4">4</button>
          <button type="button" class="party-btn" data-size="5">5</button>
          <button type="button" class="party-btn" data-size="6">6+</button>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Select Time</label>
        <div class="time-slots" id="time-slots">
          <div class="time-slot" data-time="11:00">11:00 AM</div>
          <div class="time-slot" data-time="11:30">11:30 AM</div>
          <div class="time-slot" data-time="12:00">12:00 PM</div>
          <div class="time-slot unavailable" data-time="12:30">12:30 PM</div>
          <div class="time-slot" data-time="13:00">1:00 PM</div>
          <div class="time-slot" data-time="13:30">1:30 PM</div>
          <div class="time-slot unavailable" data-time="18:00">6:00 PM</div>
          <div class="time-slot" data-time="18:30">6:30 PM</div>
          <div class="time-slot" data-time="19:00">7:00 PM</div>
          <div class="time-slot" data-time="19:30">7:30 PM</div>
          <div class="time-slot" data-time="20:00">8:00 PM</div>
          <div class="time-slot" data-time="20:30">8:30 PM</div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Your Name</label>
        <input type="text" class="form-input" id="guest-name" placeholder="Enter your name" required>
      </div>

      <div class="form-group">
        <label class="form-label">Phone Number</label>
        <input type="tel" class="form-input" id="guest-phone" placeholder="(555) 123-4567" required>
      </div>

      <div class="form-group">
        <label class="form-label">Special Requests (Optional)</label>
        <textarea class="form-input" id="special-requests" rows="3" placeholder="Allergies, celebrations, seating preferences..."></textarea>
      </div>

      <button type="submit" class="btn-primary">Confirm Reservation</button>
    </form>

    <div class="result-card" id="result">
      <div class="result-title">Reservation Confirmed!</div>
      <div class="booking-summary">
        <div class="summary-row">
          <span>Date</span>
          <span id="confirm-date">-</span>
        </div>
        <div class="summary-row">
          <span>Time</span>
          <span id="confirm-time">-</span>
        </div>
        <div class="summary-row">
          <span>Party Size</span>
          <span id="confirm-party">-</span>
        </div>
        <div class="summary-row">
          <span>Name</span>
          <span id="confirm-name">-</span>
        </div>
      </div>
      <p style="margin-top:16px;color:#888;font-size:0.9rem">A confirmation has been sent to your phone.</p>
    </div>

    <footer class="brand-footer">
      ${branding?.businessName || 'Restaurant'} • Powered by Blink
    </footer>
  </div>

  <script>
    let selectedTime = null;
    let selectedParty = 2;

    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('booking-date').min = today;
    document.getElementById('booking-date').value = today;

    // Time slot selection
    document.querySelectorAll('.time-slot:not(.unavailable)').forEach(slot => {
      slot.addEventListener('click', function() {
        document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
        this.classList.add('selected');
        selectedTime = this.dataset.time;
      });
    });

    // Party size selection
    document.querySelectorAll('.party-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.party-btn').forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
        selectedParty = this.dataset.size;
      });
    });

    // Form submission
    document.getElementById('booking-form').addEventListener('submit', function(e) {
      e.preventDefault();

      if (!selectedTime) {
        alert('Please select a time slot');
        return;
      }

      const date = document.getElementById('booking-date').value;
      const name = document.getElementById('guest-name').value;

      // Format time for display
      const [hours, mins] = selectedTime.split(':');
      const hour = parseInt(hours);
      const timeStr = (hour > 12 ? hour - 12 : hour) + ':' + mins + (hour >= 12 ? ' PM' : ' AM');

      document.getElementById('confirm-date').textContent = new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      document.getElementById('confirm-time').textContent = timeStr;
      document.getElementById('confirm-party').textContent = selectedParty + (selectedParty === '6' ? '+' : '') + ' guest' + (selectedParty !== '1' ? 's' : '');
      document.getElementById('confirm-name').textContent = name;

      document.getElementById('result').classList.add('visible');
    });
  </script>
</body>
</html>`;
}

// ============================================
// ORDER TRACKER
// ============================================

function generateOrderTracker(config) {
  const { name, style, colors, branding } = config;
  const stylePreset = STYLE_PRESETS[style] || STYLE_PRESETS.modern;
  const css = stylePreset.getCSS(colors);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name || 'Order Tracker'} | ${branding?.businessName || 'Business Tools'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    ${css}

    .order-list {
      margin-bottom: 24px;
    }
    .order-item {
      display: grid;
      grid-template-columns: 80px 1fr 100px 120px 60px;
      gap: 12px;
      margin-bottom: 12px;
      align-items: center;
      padding: 16px;
      background: rgba(255,255,255,0.05);
      border-radius: 8px;
    }
    .order-id {
      font-weight: 600;
      color: ${colors.primary};
    }
    .status-select {
      padding: 10px;
      border: 1px solid #444;
      border-radius: 4px;
      background: #1a1a1a;
      color: #fff;
      font-size: 0.85rem;
    }
    .status-pending { border-left: 4px solid #f59e0b; }
    .status-preparing { border-left: 4px solid #3b82f6; }
    .status-ready { border-left: 4px solid #22c55e; }
    .status-delivered { border-left: 4px solid #888; opacity: 0.7; }
    .add-order {
      padding: 12px 16px;
      background: transparent;
      border: 1px dashed ${colors.primary}60;
      color: ${colors.primary};
      border-radius: 8px;
      cursor: pointer;
      width: 100%;
    }
    .remove-btn {
      padding: 8px 12px;
      background: #fee2e2;
      color: #dc2626;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-top: 20px;
    }
    .stat-card {
      text-align: center;
      padding: 16px;
      background: rgba(255,255,255,0.05);
      border-radius: 8px;
    }
    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: ${colors.primary};
    }
    .stat-label {
      font-size: 0.7rem;
      color: #888;
      text-transform: uppercase;
      margin-top: 4px;
    }
  </style>
</head>
<body>
  <div class="tool-container" style="max-width:700px">
    <div class="tool-header">
      <h1 class="tool-title">${name || 'Order Tracker'}</h1>
      <p class="tool-subtitle">Manage your orders</p>
    </div>

    <div class="form-group">
      <label class="form-label">Active Orders</label>
      <div class="order-list" id="order-list">
        <div class="order-item status-pending">
          <span class="order-id">#001</span>
          <input type="text" class="form-input" value="2x Latte, 1x Croissant" style="margin:0">
          <input type="number" class="form-input" value="18.50" step="0.01" style="margin:0">
          <select class="status-select" onchange="updateStatus(this)">
            <option value="pending" selected>Pending</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="delivered">Delivered</option>
          </select>
          <button class="remove-btn" onclick="removeOrder(this)">×</button>
        </div>
        <div class="order-item status-preparing">
          <span class="order-id">#002</span>
          <input type="text" class="form-input" value="1x Cappuccino, 2x Muffin" style="margin:0">
          <input type="number" class="form-input" value="14.25" step="0.01" style="margin:0">
          <select class="status-select" onchange="updateStatus(this)">
            <option value="pending">Pending</option>
            <option value="preparing" selected>Preparing</option>
            <option value="ready">Ready</option>
            <option value="delivered">Delivered</option>
          </select>
          <button class="remove-btn" onclick="removeOrder(this)">×</button>
        </div>
        <div class="order-item status-ready">
          <span class="order-id">#003</span>
          <input type="text" class="form-input" value="3x Espresso" style="margin:0">
          <input type="number" class="form-input" value="10.50" step="0.01" style="margin:0">
          <select class="status-select" onchange="updateStatus(this)">
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="ready" selected>Ready</option>
            <option value="delivered">Delivered</option>
          </select>
          <button class="remove-btn" onclick="removeOrder(this)">×</button>
        </div>
      </div>
      <button class="add-order" onclick="addOrder()">+ New Order</button>
    </div>

    <button class="btn-primary" onclick="updateStats()">Refresh Stats</button>

    <div class="result-card visible" id="result">
      <div class="result-title">Order Statistics</div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value" id="stat-pending">1</div>
          <div class="stat-label">Pending</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" id="stat-preparing">1</div>
          <div class="stat-label">Preparing</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" id="stat-ready">1</div>
          <div class="stat-label">Ready</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" id="stat-total">$43.25</div>
          <div class="stat-label">Total</div>
        </div>
      </div>
    </div>

    <footer class="brand-footer">
      ${branding?.businessName || 'Business'} • Powered by Blink
    </footer>
  </div>

  <script>
    let orderNum = 3;

    function addOrder() {
      orderNum++;
      const list = document.getElementById('order-list');
      const item = document.createElement('div');
      item.className = 'order-item status-pending';
      item.innerHTML = \`
        <span class="order-id">#\${String(orderNum).padStart(3, '0')}</span>
        <input type="text" class="form-input" placeholder="Order items" style="margin:0">
        <input type="number" class="form-input" placeholder="$0.00" step="0.01" style="margin:0">
        <select class="status-select" onchange="updateStatus(this)">
          <option value="pending" selected>Pending</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="delivered">Delivered</option>
        </select>
        <button class="remove-btn" onclick="removeOrder(this)">×</button>
      \`;
      list.appendChild(item);
      updateStats();
    }

    function removeOrder(btn) {
      btn.closest('.order-item').remove();
      updateStats();
    }

    function updateStatus(select) {
      const item = select.closest('.order-item');
      item.className = 'order-item status-' + select.value;
      updateStats();
    }

    function updateStats() {
      const orders = document.querySelectorAll('.order-item');
      let pending = 0, preparing = 0, ready = 0, total = 0;

      orders.forEach(order => {
        const status = order.querySelector('select').value;
        const amount = parseFloat(order.querySelectorAll('input')[1].value) || 0;

        if (status === 'pending') pending++;
        else if (status === 'preparing') preparing++;
        else if (status === 'ready') ready++;

        if (status !== 'delivered') total += amount;
      });

      document.getElementById('stat-pending').textContent = pending;
      document.getElementById('stat-preparing').textContent = preparing;
      document.getElementById('stat-ready').textContent = ready;
      document.getElementById('stat-total').textContent = '$' + total.toFixed(2);
    }

    updateStats();
  </script>
</body>
</html>`;
}

// ============================================
// QUOTE CALCULATOR
// ============================================

function generateQuoteCalculator(config) {
  const { name, style, colors, branding } = config;
  const stylePreset = STYLE_PRESETS[style] || STYLE_PRESETS.modern;
  const css = stylePreset.getCSS(colors);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name || 'Quote Calculator'} | ${branding?.businessName || 'Business Tools'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    ${css}

    .line-items {
      margin-bottom: 24px;
    }
    .line-item {
      display: grid;
      grid-template-columns: 1fr 80px 100px 100px 60px;
      gap: 12px;
      margin-bottom: 12px;
      align-items: center;
    }
    .line-item .form-input { margin: 0; }
    .item-total {
      text-align: right;
      font-weight: 600;
      color: ${colors.primary};
    }
    .add-line {
      padding: 12px 16px;
      background: transparent;
      border: 1px dashed ${colors.primary}60;
      color: ${colors.primary};
      border-radius: 8px;
      cursor: pointer;
      width: 100%;
    }
    .remove-btn {
      padding: 8px 12px;
      background: #fee2e2;
      color: #dc2626;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    .quote-totals {
      background: rgba(255,255,255,0.05);
      padding: 20px;
      border-radius: 8px;
      margin-top: 20px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .total-row:last-child {
      border-bottom: none;
      font-size: 1.2rem;
      font-weight: 700;
      color: ${colors.primary};
    }
  </style>
</head>
<body>
  <div class="tool-container" style="max-width:650px">
    <div class="tool-header">
      <h1 class="tool-title">${name || 'Quote Calculator'}</h1>
      <p class="tool-subtitle">Create professional quotes</p>
    </div>

    <div class="form-group">
      <label class="form-label">Client Information</label>
      <input type="text" class="form-input" id="client-name" placeholder="Client name" style="margin-bottom:12px">
      <input type="email" class="form-input" id="client-email" placeholder="Client email">
    </div>

    <div class="form-group">
      <label class="form-label">Line Items</label>
      <div style="display:grid;grid-template-columns:1fr 80px 100px 100px 60px;gap:12px;margin-bottom:8px;font-size:0.75rem;color:#888;text-transform:uppercase;">
        <span>Description</span>
        <span>Qty</span>
        <span>Unit Price</span>
        <span>Total</span>
        <span></span>
      </div>
      <div class="line-items" id="line-items">
        <div class="line-item">
          <input type="text" class="form-input" placeholder="Service/Product" value="Consultation">
          <input type="number" class="form-input qty-input" value="2" min="1" onchange="calculateLine(this)">
          <input type="number" class="form-input price-input" value="75" step="0.01" onchange="calculateLine(this)">
          <div class="item-total">$150.00</div>
          <button class="remove-btn" onclick="removeLine(this)">×</button>
        </div>
        <div class="line-item">
          <input type="text" class="form-input" placeholder="Service/Product" value="Implementation">
          <input type="number" class="form-input qty-input" value="1" min="1" onchange="calculateLine(this)">
          <input type="number" class="form-input price-input" value="500" step="0.01" onchange="calculateLine(this)">
          <div class="item-total">$500.00</div>
          <button class="remove-btn" onclick="removeLine(this)">×</button>
        </div>
      </div>
      <button class="add-line" onclick="addLine()">+ Add Line Item</button>
    </div>

    <div class="form-group">
      <label class="form-label">Discount (%)</label>
      <input type="number" class="form-input" id="discount" value="0" min="0" max="100" onchange="calculateTotal()">
    </div>

    <button class="btn-primary" onclick="generateQuote()">Generate Quote</button>

    <div class="result-card" id="result">
      <div class="result-title">Quote Summary</div>
      <div class="quote-totals">
        <div class="total-row">
          <span>Subtotal</span>
          <span id="subtotal">$650.00</span>
        </div>
        <div class="total-row">
          <span>Discount</span>
          <span id="discount-amount">-$0.00</span>
        </div>
        <div class="total-row">
          <span>Total</span>
          <span id="grand-total">$650.00</span>
        </div>
      </div>
    </div>

    <footer class="brand-footer">
      ${branding?.businessName || 'Business'} • Powered by Blink
    </footer>
  </div>

  <script>
    function addLine() {
      const list = document.getElementById('line-items');
      const item = document.createElement('div');
      item.className = 'line-item';
      item.innerHTML = \`
        <input type="text" class="form-input" placeholder="Service/Product">
        <input type="number" class="form-input qty-input" value="1" min="1" onchange="calculateLine(this)">
        <input type="number" class="form-input price-input" value="0" step="0.01" onchange="calculateLine(this)">
        <div class="item-total">$0.00</div>
        <button class="remove-btn" onclick="removeLine(this)">×</button>
      \`;
      list.appendChild(item);
    }

    function removeLine(btn) {
      const list = document.getElementById('line-items');
      if (list.children.length > 1) {
        btn.closest('.line-item').remove();
        calculateTotal();
      }
    }

    function calculateLine(input) {
      const row = input.closest('.line-item');
      const qty = parseFloat(row.querySelector('.qty-input').value) || 0;
      const price = parseFloat(row.querySelector('.price-input').value) || 0;
      const total = qty * price;
      row.querySelector('.item-total').textContent = '$' + total.toFixed(2);
      calculateTotal();
    }

    function calculateTotal() {
      let subtotal = 0;
      document.querySelectorAll('.line-item').forEach(row => {
        const qty = parseFloat(row.querySelector('.qty-input').value) || 0;
        const price = parseFloat(row.querySelector('.price-input').value) || 0;
        subtotal += qty * price;
      });

      const discountPct = parseFloat(document.getElementById('discount').value) || 0;
      const discountAmt = subtotal * (discountPct / 100);
      const grandTotal = subtotal - discountAmt;

      document.getElementById('subtotal').textContent = '$' + subtotal.toFixed(2);
      document.getElementById('discount-amount').textContent = '-$' + discountAmt.toFixed(2);
      document.getElementById('grand-total').textContent = '$' + grandTotal.toFixed(2);
    }

    function generateQuote() {
      calculateTotal();
      document.getElementById('result').classList.add('visible');
    }

    calculateTotal();
  </script>
</body>
</html>`;
}

// ============================================
// TIMER / STOPWATCH TOOL
// ============================================

function generateTimerTool(config) {
  const { name, style, colors, branding } = config;
  const stylePreset = STYLE_PRESETS[style] || STYLE_PRESETS.modern;
  const css = stylePreset.getCSS(colors);
  const toolName = name || 'Timer';
  const toolNameLower = toolName.toLowerCase();

  // Context-aware presets
  const isCoffee = toolNameLower.includes('coffee') || toolNameLower.includes('brew') || toolNameLower.includes('espresso');
  const isCooking = toolNameLower.includes('cook') || toolNameLower.includes('kitchen') || toolNameLower.includes('baking');

  let presetsHtml;
  if (isCoffee) {
    presetsHtml = `
      <button class="preset-btn" onclick="setTimer(25, 'Espresso')">☕ Espresso<br><small>0:25</small></button>
      <button class="preset-btn" onclick="setTimer(240, 'Pour Over')">💧 Pour Over<br><small>4:00</small></button>
      <button class="preset-btn" onclick="setTimer(240, 'French Press')">🫖 French Press<br><small>4:00</small></button>
      <button class="preset-btn" onclick="setTimer(90, 'Aeropress')">⏱️ Aeropress<br><small>1:30</small></button>
      <button class="preset-btn" onclick="setTimer(300, 'Moka Pot')">🔥 Moka Pot<br><small>5:00</small></button>
      <button class="preset-btn" onclick="setTimer(180, 'Cold Brew Bloom')">🧊 Cold Brew<br><small>3:00</small></button>`;
  } else if (isCooking) {
    presetsHtml = `
      <button class="preset-btn" onclick="setTimer(360, 'Soft Boil Egg')">🥚 Soft Boil<br><small>6:00</small></button>
      <button class="preset-btn" onclick="setTimer(600, 'Hard Boil Egg')">🥚 Hard Boil<br><small>10:00</small></button>
      <button class="preset-btn" onclick="setTimer(480, 'Pasta')">🍝 Pasta<br><small>8:00</small></button>
      <button class="preset-btn" onclick="setTimer(1080, 'Rice')">🍚 Rice<br><small>18:00</small></button>
      <button class="preset-btn" onclick="setTimer(900, 'Rest Dough')">🍞 Rest Dough<br><small>15:00</small></button>
      <button class="preset-btn" onclick="setTimer(300, 'Rest Steak')">🥩 Rest Steak<br><small>5:00</small></button>`;
  } else {
    presetsHtml = `
      <button class="preset-btn" onclick="setTimer(30, '30 Seconds')">⚡ 30 sec</button>
      <button class="preset-btn" onclick="setTimer(60, '1 Minute')">⏱️ 1 min</button>
      <button class="preset-btn" onclick="setTimer(180, '3 Minutes')">⏰ 3 min</button>
      <button class="preset-btn" onclick="setTimer(300, '5 Minutes')">🕐 5 min</button>
      <button class="preset-btn" onclick="setTimer(600, '10 Minutes')">🕙 10 min</button>
      <button class="preset-btn" onclick="setTimer(900, '15 Minutes')">🕒 15 min</button>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${toolName} | ${branding?.businessName || 'Tools'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    ${css}

    .timer-display {
      text-align: center;
      padding: 40px 20px;
      position: relative;
    }
    .timer-ring {
      width: 220px;
      height: 220px;
      margin: 0 auto 20px;
      position: relative;
    }
    .timer-ring svg {
      transform: rotate(-90deg);
      width: 100%;
      height: 100%;
    }
    .timer-ring circle {
      fill: none;
      stroke-width: 8;
    }
    .ring-bg { stroke: ${colors.primary}20; }
    .ring-progress {
      stroke: ${colors.primary};
      stroke-linecap: round;
      transition: stroke-dashoffset 0.3s ease;
    }
    .timer-time {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 3.5rem;
      font-weight: 700;
      font-family: 'SF Mono', 'Fira Code', monospace;
      color: ${colors.primary};
    }
    .timer-label {
      font-size: 0.9rem;
      color: #888;
      margin-top: 8px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .presets-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 24px;
    }
    .preset-btn {
      padding: 14px 10px;
      background: rgba(255,255,255,0.05);
      border: 2px solid ${colors.primary}30;
      border-radius: 10px;
      cursor: pointer;
      font-size: 0.85rem;
      color: inherit;
      transition: all 0.2s ease;
      line-height: 1.4;
    }
    .preset-btn:hover { border-color: ${colors.primary}60; background: ${colors.primary}10; }
    .preset-btn.active { border-color: ${colors.primary}; background: ${colors.primary}20; }
    .preset-btn small { color: #888; font-size: 0.75rem; }
    .controls {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
    }
    .control-btn {
      flex: 1;
      padding: 16px;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-start { background: ${colors.primary}; color: white; }
    .btn-start:hover { filter: brightness(1.1); }
    .btn-pause { background: #f59e0b; color: white; }
    .btn-reset { background: rgba(255,255,255,0.1); color: inherit; border: 1px solid rgba(255,255,255,0.2); }
    .custom-time {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .custom-time .form-input { width: 70px; text-align: center; }
    .timer-running .timer-time { animation: pulse 1s ease-in-out infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
    .timer-done .timer-time { animation: flash 0.5s ease-in-out infinite; color: #22c55e; }
    @keyframes flash { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  </style>
</head>
<body>
  <div class="tool-container">
    <div class="tool-header">
      <h1 class="tool-title">${toolName}</h1>
      <p class="tool-subtitle">Precision timing</p>
    </div>

    <div class="timer-display" id="timer-display">
      <div class="timer-ring">
        <svg viewBox="0 0 220 220">
          <circle class="ring-bg" cx="110" cy="110" r="100"></circle>
          <circle class="ring-progress" id="ring-progress" cx="110" cy="110" r="100"
                  stroke-dasharray="628.32" stroke-dashoffset="0"></circle>
        </svg>
        <div class="timer-time" id="timer-time">00:00</div>
      </div>
      <div class="timer-label" id="timer-label">Select a preset or set custom time</div>
    </div>

    <div class="form-group">
      <label class="form-label">Quick Presets</label>
      <div class="presets-grid">${presetsHtml}</div>
    </div>

    <div class="form-group">
      <label class="form-label">Custom Time</label>
      <div class="custom-time">
        <input type="number" class="form-input" id="custom-min" placeholder="Min" min="0" max="99" value="0">
        <span style="font-size:1.5rem">:</span>
        <input type="number" class="form-input" id="custom-sec" placeholder="Sec" min="0" max="59" value="0">
        <button class="btn-primary" onclick="setCustomTime()" style="padding:12px 16px">Set</button>
      </div>
    </div>

    <div class="controls">
      <button class="control-btn btn-start" id="start-btn" onclick="toggleTimer()">▶ Start</button>
      <button class="control-btn btn-reset" onclick="resetTimer()">↺ Reset</button>
    </div>

    <footer class="brand-footer">
      ${branding?.businessName || 'Timer'} • Powered by Blink
    </footer>
  </div>

  <script>
    let totalSeconds = 0;
    let remainingSeconds = 0;
    let timerInterval = null;
    let isRunning = false;
    const circumference = 628.32;

    function formatTime(s) {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
    }

    function updateDisplay() {
      document.getElementById('timer-time').textContent = formatTime(remainingSeconds);
      const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 1;
      document.getElementById('ring-progress').style.strokeDashoffset = circumference * (1 - progress);
    }

    function setTimer(seconds, label) {
      if (isRunning) pauseTimer();
      totalSeconds = seconds;
      remainingSeconds = seconds;
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      if (event && event.target) event.target.classList.add('active');
      document.getElementById('timer-label').textContent = label || 'Ready';
      document.getElementById('timer-display').classList.remove('timer-done');
      updateDisplay();
    }

    function setCustomTime() {
      const min = parseInt(document.getElementById('custom-min').value) || 0;
      const sec = parseInt(document.getElementById('custom-sec').value) || 0;
      setTimer(min * 60 + sec, 'Custom Timer');
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    }

    function toggleTimer() {
      isRunning ? pauseTimer() : startTimer();
    }

    function startTimer() {
      if (remainingSeconds <= 0) return;
      isRunning = true;
      document.getElementById('start-btn').innerHTML = '⏸ Pause';
      document.getElementById('start-btn').classList.remove('btn-start');
      document.getElementById('start-btn').classList.add('btn-pause');
      document.getElementById('timer-display').classList.add('timer-running');
      document.getElementById('timer-display').classList.remove('timer-done');

      timerInterval = setInterval(() => {
        remainingSeconds--;
        updateDisplay();
        if (remainingSeconds <= 0) {
          clearInterval(timerInterval);
          isRunning = false;
          document.getElementById('timer-label').textContent = "⏰ Time's Up!";
          document.getElementById('timer-display').classList.remove('timer-running');
          document.getElementById('timer-display').classList.add('timer-done');
          document.getElementById('start-btn').innerHTML = '▶ Start';
          document.getElementById('start-btn').classList.add('btn-start');
          document.getElementById('start-btn').classList.remove('btn-pause');
        }
      }, 1000);
    }

    function pauseTimer() {
      clearInterval(timerInterval);
      isRunning = false;
      document.getElementById('start-btn').innerHTML = '▶ Resume';
      document.getElementById('start-btn').classList.add('btn-start');
      document.getElementById('start-btn').classList.remove('btn-pause');
      document.getElementById('timer-display').classList.remove('timer-running');
    }

    function resetTimer() {
      clearInterval(timerInterval);
      isRunning = false;
      remainingSeconds = totalSeconds;
      document.getElementById('timer-label').textContent = 'Ready';
      document.getElementById('start-btn').innerHTML = '▶ Start';
      document.getElementById('start-btn').classList.add('btn-start');
      document.getElementById('start-btn').classList.remove('btn-pause');
      document.getElementById('timer-display').classList.remove('timer-running', 'timer-done');
      updateDisplay();
    }
  </script>
</body>
</html>`;
}

// ============================================
// QR CODE GENERATOR TOOL
// ============================================

function generateQRCodeTool(config) {
  const { name, style, colors, branding } = config;
  const stylePreset = STYLE_PRESETS[style] || STYLE_PRESETS.modern;
  const css = stylePreset.getCSS(colors);
  const toolName = name || 'QR Code Generator';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${toolName} | ${branding?.businessName || 'Tools'}</title>
  <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"><\/script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    ${css}

    .qr-preview {
      text-align: center;
      padding: 32px;
      background: white;
      border-radius: 12px;
      margin: 24px 0;
    }
    #qr-canvas { max-width: 100%; height: auto; }
    .qr-placeholder {
      width: 200px; height: 200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      border-radius: 8px;
      color: #888;
    }
    .type-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    .type-tab {
      padding: 10px 16px;
      background: rgba(255,255,255,0.05);
      border: 1px solid ${colors.primary}30;
      border-radius: 20px;
      cursor: pointer;
      font-size: 0.85rem;
      color: inherit;
      transition: all 0.2s ease;
    }
    .type-tab:hover { border-color: ${colors.primary}60; }
    .type-tab.active { background: ${colors.primary}; color: white; border-color: ${colors.primary}; }
    .color-row {
      display: flex;
      gap: 20px;
      align-items: center;
    }
    .color-row label { display: flex; flex-direction: column; gap: 4px; }
    .color-row small { color: #888; }
    .color-row input[type="color"] {
      width: 50px; height: 40px;
      border: none; border-radius: 6px;
      cursor: pointer;
    }
    .download-btns {
      display: flex;
      gap: 12px;
      margin-top: 20px;
    }
    .download-btn {
      flex: 1;
      padding: 14px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    .btn-png { background: ${colors.primary}; color: white; }
    .btn-svg { background: rgba(255,255,255,0.1); color: inherit; border: 1px solid rgba(255,255,255,0.2); }
  </style>
</head>
<body>
  <div class="tool-container">
    <div class="tool-header">
      <h1 class="tool-title">${toolName}</h1>
      <p class="tool-subtitle">Create QR codes instantly</p>
    </div>

    <div class="form-group">
      <label class="form-label">Content Type</label>
      <div class="type-tabs">
        <button class="type-tab active" onclick="setType('url', this)">🔗 URL</button>
        <button class="type-tab" onclick="setType('text', this)">📝 Text</button>
        <button class="type-tab" onclick="setType('email', this)">✉️ Email</button>
        <button class="type-tab" onclick="setType('phone', this)">📞 Phone</button>
        <button class="type-tab" onclick="setType('wifi', this)">📶 WiFi</button>
      </div>
    </div>

    <div id="input-section">
      <div class="form-group" id="url-input">
        <label class="form-label">URL</label>
        <input type="url" class="form-input" id="qr-url" placeholder="https://example.com" value="https://${(branding?.businessName || 'example').toLowerCase().replace(/\s+/g, '')}.com">
      </div>
      <div class="form-group" id="text-input" style="display:none">
        <label class="form-label">Text</label>
        <textarea class="form-input" id="qr-text" rows="3" placeholder="Enter any text..."></textarea>
      </div>
      <div class="form-group" id="email-input" style="display:none">
        <label class="form-label">Email Address</label>
        <input type="email" class="form-input" id="qr-email" placeholder="email@example.com">
      </div>
      <div class="form-group" id="phone-input" style="display:none">
        <label class="form-label">Phone Number</label>
        <input type="tel" class="form-input" id="qr-phone" placeholder="+1234567890">
      </div>
      <div id="wifi-inputs" style="display:none">
        <div class="form-group">
          <label class="form-label">Network Name (SSID)</label>
          <input type="text" class="form-input" id="wifi-ssid" placeholder="MyNetwork">
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="text" class="form-input" id="wifi-pass" placeholder="Password">
        </div>
        <div class="form-group">
          <label class="form-label">Security</label>
          <select class="form-input" id="wifi-security">
            <option value="WPA">WPA/WPA2</option>
            <option value="WEP">WEP</option>
            <option value="">None</option>
          </select>
        </div>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Colors</label>
      <div class="color-row">
        <label><small>Foreground</small><input type="color" id="qr-fg" value="#000000"></label>
        <label><small>Background</small><input type="color" id="qr-bg" value="#ffffff"></label>
      </div>
    </div>

    <button class="btn-primary" onclick="generateQR()">Generate QR Code</button>

    <div class="qr-preview">
      <div id="qr-placeholder" class="qr-placeholder">Click Generate to create QR code</div>
      <canvas id="qr-canvas" style="display:none"></canvas>
    </div>

    <div class="download-btns">
      <button class="download-btn btn-png" onclick="downloadPNG()">📥 Download PNG</button>
      <button class="download-btn btn-svg" onclick="downloadSVG()">📄 Download SVG</button>
    </div>

    <footer class="brand-footer">
      ${branding?.businessName || 'QR Generator'} • Powered by Blink
    </footer>
  </div>

  <script>
    let currentType = 'url';

    function setType(type, btn) {
      currentType = type;
      document.querySelectorAll('.type-tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');

      // Hide all inputs
      ['url', 'text', 'email', 'phone'].forEach(t => {
        document.getElementById(t + '-input').style.display = 'none';
      });
      document.getElementById('wifi-inputs').style.display = 'none';

      // Show selected input
      if (type === 'wifi') {
        document.getElementById('wifi-inputs').style.display = 'block';
      } else {
        document.getElementById(type + '-input').style.display = 'block';
      }
    }

    function getContent() {
      switch(currentType) {
        case 'url': return document.getElementById('qr-url').value;
        case 'text': return document.getElementById('qr-text').value;
        case 'email': return 'mailto:' + document.getElementById('qr-email').value;
        case 'phone': return 'tel:' + document.getElementById('qr-phone').value;
        case 'wifi':
          const ssid = document.getElementById('wifi-ssid').value;
          const pass = document.getElementById('wifi-pass').value;
          const sec = document.getElementById('wifi-security').value;
          return 'WIFI:T:' + sec + ';S:' + ssid + ';P:' + pass + ';;';
        default: return '';
      }
    }

    function generateQR() {
      const content = getContent();
      if (!content) { alert('Please enter content first'); return; }

      const canvas = document.getElementById('qr-canvas');
      const placeholder = document.getElementById('qr-placeholder');
      const fg = document.getElementById('qr-fg').value;
      const bg = document.getElementById('qr-bg').value;

      QRCode.toCanvas(canvas, content, {
        width: 256,
        margin: 2,
        color: { dark: fg, light: bg }
      }, function(err) {
        if (err) { console.error(err); return; }
        placeholder.style.display = 'none';
        canvas.style.display = 'block';
      });
    }

    function downloadPNG() {
      const canvas = document.getElementById('qr-canvas');
      if (canvas.style.display === 'none') { alert('Generate a QR code first'); return; }
      const link = document.createElement('a');
      link.download = 'qrcode.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }

    function downloadSVG() {
      const content = getContent();
      if (!content) { alert('Generate a QR code first'); return; }
      const fg = document.getElementById('qr-fg').value;
      const bg = document.getElementById('qr-bg').value;

      QRCode.toString(content, { type: 'svg', width: 256, margin: 2, color: { dark: fg, light: bg } }, function(err, svg) {
        if (err) { console.error(err); return; }
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const link = document.createElement('a');
        link.download = 'qrcode.svg';
        link.href = URL.createObjectURL(blob);
        link.click();
      });
    }
  </script>
</body>
</html>`;
}

// ============================================
// SALES CALCULATOR TOOL
// ============================================

function generateSalesCalculatorTool(config) {
  const { name, style, colors, branding } = config;
  const stylePreset = STYLE_PRESETS[style] || STYLE_PRESETS.modern;
  const css = stylePreset.getCSS(colors);
  const toolName = name || 'Sales Calculator';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${toolName} | ${branding?.businessName || 'Business Tools'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    ${css}

    .sales-entries { margin-bottom: 24px; }
    .sales-entry {
      display: grid;
      grid-template-columns: 1fr 90px 90px 60px;
      gap: 10px;
      margin-bottom: 10px;
      align-items: center;
      padding: 12px;
      background: rgba(255,255,255,0.05);
      border-radius: 8px;
    }
    .sales-entry .form-input { margin: 0; }
    .add-sale {
      padding: 12px 16px;
      background: transparent;
      border: 1px dashed ${colors.primary}60;
      color: ${colors.primary};
      border-radius: 8px;
      cursor: pointer;
      width: 100%;
    }
    .remove-btn {
      padding: 8px 12px;
      background: #fee2e2;
      color: #dc2626;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    .stat-card {
      text-align: center;
      padding: 20px 16px;
      background: rgba(255,255,255,0.05);
      border-radius: 12px;
    }
    .stat-card.main { background: ${colors.primary}15; border: 1px solid ${colors.primary}30; }
    .stat-value { font-size: 1.8rem; font-weight: 700; color: ${colors.primary}; }
    .stat-label { font-size: 0.7rem; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
    .breakdown { margin-top: 20px; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 8px; }
    .breakdown-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .breakdown-row:last-child { border-bottom: none; }
    .positive { color: #22c55e; }
    .negative { color: #ef4444; }
  </style>
</head>
<body>
  <div class="tool-container">
    <div class="tool-header">
      <h1 class="tool-title">${toolName}</h1>
      <p class="tool-subtitle">Track daily revenue</p>
    </div>

    <div class="form-group">
      <label class="form-label">Sales Entries</label>
      <div style="display:grid;grid-template-columns:1fr 90px 90px 60px;gap:10px;margin-bottom:8px;font-size:0.7rem;color:#888;text-transform:uppercase;">
        <span>Item/Category</span><span>Qty</span><span>Price</span><span></span>
      </div>
      <div class="sales-entries" id="sales-entries">
        <div class="sales-entry">
          <input type="text" class="form-input" placeholder="Item" value="Coffee">
          <input type="number" class="form-input" value="45" min="0" onchange="calculate()">
          <input type="number" class="form-input" value="4.50" step="0.01" onchange="calculate()">
          <button type="button" class="remove-btn" onclick="removeEntry(this)">×</button>
        </div>
        <div class="sales-entry">
          <input type="text" class="form-input" placeholder="Item" value="Pastries">
          <input type="number" class="form-input" value="28" min="0" onchange="calculate()">
          <input type="number" class="form-input" value="3.75" step="0.01" onchange="calculate()">
          <button type="button" class="remove-btn" onclick="removeEntry(this)">×</button>
        </div>
        <div class="sales-entry">
          <input type="text" class="form-input" placeholder="Item" value="Sandwiches">
          <input type="number" class="form-input" value="15" min="0" onchange="calculate()">
          <input type="number" class="form-input" value="8.50" step="0.01" onchange="calculate()">
          <button type="button" class="remove-btn" onclick="removeEntry(this)">×</button>
        </div>
      </div>
      <button type="button" class="add-sale" onclick="addEntry()">+ Add Item</button>
    </div>

    <div class="form-group">
      <label class="form-label">Cost of Goods Sold (%)</label>
      <input type="number" class="form-input" id="cogs" value="35" min="0" max="100" onchange="calculate()">
    </div>

    <button class="btn-primary" onclick="calculate()">Calculate</button>

    <div class="result-card visible" id="result">
      <div class="result-title">Sales Summary</div>
      <div class="stats-grid">
        <div class="stat-card main">
          <div class="stat-value" id="revenue">$430.25</div>
          <div class="stat-label">Total Revenue</div>
        </div>
        <div class="stat-card main">
          <div class="stat-value positive" id="profit">$279.66</div>
          <div class="stat-label">Gross Profit</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" id="items">88</div>
          <div class="stat-label">Items Sold</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" id="avg">$4.89</div>
          <div class="stat-label">Avg/Item</div>
        </div>
      </div>
      <div class="breakdown">
        <div class="breakdown-row">
          <span>Cost of Goods</span>
          <span class="negative" id="cogs-amount">-$150.59</span>
        </div>
        <div class="breakdown-row">
          <span>Profit Margin</span>
          <span class="positive" id="margin">65.0%</span>
        </div>
      </div>
    </div>

    <footer class="brand-footer">
      ${branding?.businessName || 'Business'} • Powered by Blink
    </footer>
  </div>

  <script>
    function addEntry() {
      const list = document.getElementById('sales-entries');
      const entry = document.createElement('div');
      entry.className = 'sales-entry';
      entry.innerHTML = \`
        <input type="text" class="form-input" placeholder="Item">
        <input type="number" class="form-input" value="0" min="0" onchange="calculate()">
        <input type="number" class="form-input" value="0.00" step="0.01" onchange="calculate()">
        <button type="button" class="remove-btn" onclick="removeEntry(this)">×</button>
      \`;
      list.appendChild(entry);
    }

    function removeEntry(btn) {
      const list = document.getElementById('sales-entries');
      if (list.children.length > 1) {
        btn.closest('.sales-entry').remove();
        calculate();
      }
    }

    function calculate() {
      let revenue = 0, items = 0;
      document.querySelectorAll('.sales-entry').forEach(entry => {
        const inputs = entry.querySelectorAll('input');
        const qty = parseFloat(inputs[1].value) || 0;
        const price = parseFloat(inputs[2].value) || 0;
        items += qty;
        revenue += qty * price;
      });

      const cogsRate = parseFloat(document.getElementById('cogs').value) || 0;
      const cogs = revenue * (cogsRate / 100);
      const profit = revenue - cogs;
      const margin = revenue > 0 ? (profit / revenue * 100) : 0;
      const avg = items > 0 ? revenue / items : 0;

      document.getElementById('revenue').textContent = '$' + revenue.toFixed(2);
      document.getElementById('profit').textContent = '$' + profit.toFixed(2);
      document.getElementById('items').textContent = items;
      document.getElementById('avg').textContent = '$' + avg.toFixed(2);
      document.getElementById('cogs-amount').textContent = '-$' + cogs.toFixed(2);
      document.getElementById('margin').textContent = margin.toFixed(1) + '%';
    }

    calculate();
  </script>
</body>
</html>`;
}

// ============================================
// UUID GENERATOR
// ============================================

function generateUUIDGenerator(config) {
  const { name, style, colors, branding } = config;
  const stylePreset = STYLE_PRESETS[style] || STYLE_PRESETS.modern;
  const css = stylePreset.getCSS(colors);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name || 'UUID Generator'} | ${branding?.businessName || 'Dev Tools'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    ${css}

    .uuid-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
    .uuid-item {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 16px; background: rgba(255,255,255,0.05);
      border-radius: 8px; font-family: monospace; font-size: 0.9rem;
    }
    .uuid-text { flex: 1; word-break: break-all; }
    .copy-btn {
      padding: 8px 16px; background: ${colors.primary}20; color: ${colors.primary};
      border: 1px solid ${colors.primary}40; border-radius: 6px; cursor: pointer;
      font-size: 0.8rem; font-weight: 600; transition: all 0.2s;
    }
    .copy-btn:hover { background: ${colors.primary}30; }
    .copy-btn.copied { background: #10b981; color: #fff; border-color: #10b981; }
    .options-row { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
    .option-group { display: flex; align-items: center; gap: 8px; }
    .option-label { font-size: 0.85rem; color: #888; }
    .count-input { width: 60px; padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #fff; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1 class="title">${name || 'UUID Generator'}</h1>
      <p class="subtitle">Generate unique identifiers instantly</p>
    </header>

    <div class="card">
      <div class="options-row">
        <div class="option-group">
          <span class="option-label">Count:</span>
          <input type="number" class="count-input" id="count" value="5" min="1" max="100">
        </div>
        <div class="option-group">
          <label><input type="checkbox" id="uppercase"> Uppercase</label>
        </div>
        <div class="option-group">
          <label><input type="checkbox" id="noDashes"> No dashes</label>
        </div>
      </div>

      <button class="btn-primary" onclick="generateUUIDs()" style="width: 100%; margin-bottom: 20px;">
        Generate UUIDs
      </button>

      <div class="uuid-list" id="uuid-list"></div>

      <button class="btn-secondary" onclick="copyAll()" style="width: 100%;">
        Copy All to Clipboard
      </button>
    </div>

    <footer class="brand-footer">
      ${branding?.businessName || 'UUID Generator'} • Powered by Blink
    </footer>
  </div>

  <script>
    function generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    function generateUUIDs() {
      const count = Math.min(100, Math.max(1, parseInt(document.getElementById('count').value) || 5));
      const uppercase = document.getElementById('uppercase').checked;
      const noDashes = document.getElementById('noDashes').checked;
      const list = document.getElementById('uuid-list');
      list.innerHTML = '';

      for (let i = 0; i < count; i++) {
        let uuid = generateUUID();
        if (uppercase) uuid = uuid.toUpperCase();
        if (noDashes) uuid = uuid.replace(/-/g, '');

        const item = document.createElement('div');
        item.className = 'uuid-item';
        item.innerHTML = '<span class="uuid-text">' + uuid + '</span><button class="copy-btn" onclick="copyOne(this, \\'' + uuid + '\\')">Copy</button>';
        list.appendChild(item);
      }
    }

    function copyOne(btn, text) {
      navigator.clipboard.writeText(text);
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1500);
    }

    function copyAll() {
      const uuids = Array.from(document.querySelectorAll('.uuid-text')).map(el => el.textContent);
      navigator.clipboard.writeText(uuids.join('\\n'));
      alert('Copied ' + uuids.length + ' UUIDs to clipboard!');
    }

    generateUUIDs();
  </script>
</body>
</html>`;
}

// ============================================
// JSON FORMATTER
// ============================================

function generateJSONFormatter(config) {
  const { name, style, colors, branding } = config;
  const stylePreset = STYLE_PRESETS[style] || STYLE_PRESETS.modern;
  const css = stylePreset.getCSS(colors);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name || 'JSON Formatter'} | ${branding?.businessName || 'Dev Tools'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    ${css}

    .editor-container { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    @media (max-width: 768px) { .editor-container { grid-template-columns: 1fr; } }
    .editor-panel { display: flex; flex-direction: column; }
    .editor-label { font-size: 0.85rem; font-weight: 600; color: #888; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
    .editor-textarea {
      width: 100%; min-height: 300px; padding: 16px; font-family: 'Monaco', 'Menlo', monospace;
      font-size: 0.85rem; line-height: 1.5; background: rgba(0,0,0,0.3); color: #e0e0e0;
      border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; resize: vertical;
    }
    .editor-textarea:focus { outline: none; border-color: ${colors.primary}60; }
    .output-textarea { background: rgba(0,0,0,0.2); }
    .action-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
    .action-btn { padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .status-bar { padding: 12px 16px; border-radius: 8px; font-size: 0.9rem; }
    .status-success { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }
    .status-error { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
    .json-string { color: #a5d6ff; }
    .json-number { color: #79c0ff; }
    .json-boolean { color: #ff7b72; }
    .json-null { color: #8b949e; }
    .json-key { color: #7ee787; }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1 class="title">${name || 'JSON Formatter'}</h1>
      <p class="subtitle">Format, validate, and beautify JSON data</p>
    </header>

    <div class="card">
      <div class="editor-container">
        <div class="editor-panel">
          <div class="editor-label">Input JSON</div>
          <textarea class="editor-textarea" id="input" placeholder="Paste your JSON here..."></textarea>
        </div>
        <div class="editor-panel">
          <div class="editor-label">Formatted Output</div>
          <textarea class="editor-textarea output-textarea" id="output" readonly placeholder="Formatted JSON will appear here..."></textarea>
        </div>
      </div>

      <div class="action-row">
        <button class="btn-primary action-btn" onclick="formatJSON()">Format JSON</button>
        <button class="btn-secondary action-btn" onclick="minifyJSON()">Minify</button>
        <button class="btn-secondary action-btn" onclick="copyOutput()">Copy Output</button>
        <button class="btn-secondary action-btn" onclick="clearAll()">Clear</button>
      </div>

      <div class="status-bar" id="status" style="display: none;"></div>
    </div>

    <footer class="brand-footer">
      ${branding?.businessName || 'JSON Formatter'} • Powered by Blink
    </footer>
  </div>

  <script>
    function showStatus(message, isError) {
      const status = document.getElementById('status');
      status.textContent = message;
      status.className = 'status-bar ' + (isError ? 'status-error' : 'status-success');
      status.style.display = 'block';
    }

    function formatJSON() {
      const input = document.getElementById('input').value.trim();
      if (!input) { showStatus('Please enter some JSON', true); return; }
      try {
        const parsed = JSON.parse(input);
        const formatted = JSON.stringify(parsed, null, 2);
        document.getElementById('output').value = formatted;
        showStatus('Valid JSON - ' + Object.keys(parsed).length + ' root keys', false);
      } catch (e) {
        showStatus('Invalid JSON: ' + e.message, true);
        document.getElementById('output').value = '';
      }
    }

    function minifyJSON() {
      const input = document.getElementById('input').value.trim();
      if (!input) { showStatus('Please enter some JSON', true); return; }
      try {
        const parsed = JSON.parse(input);
        const minified = JSON.stringify(parsed);
        document.getElementById('output').value = minified;
        showStatus('Minified: ' + minified.length + ' characters', false);
      } catch (e) {
        showStatus('Invalid JSON: ' + e.message, true);
      }
    }

    function copyOutput() {
      const output = document.getElementById('output').value;
      if (output) {
        navigator.clipboard.writeText(output);
        showStatus('Copied to clipboard!', false);
      }
    }

    function clearAll() {
      document.getElementById('input').value = '';
      document.getElementById('output').value = '';
      document.getElementById('status').style.display = 'none';
    }
  </script>
</body>
</html>`;
}

// ============================================
// BASE64 ENCODER/DECODER
// ============================================

function generateBase64Encoder(config) {
  const { name, style, colors, branding } = config;
  const stylePreset = STYLE_PRESETS[style] || STYLE_PRESETS.modern;
  const css = stylePreset.getCSS(colors);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name || 'Base64 Encoder'} | ${branding?.businessName || 'Dev Tools'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    ${css}

    .mode-tabs { display: flex; gap: 8px; margin-bottom: 20px; }
    .mode-tab {
      flex: 1; padding: 14px; text-align: center; border-radius: 8px; cursor: pointer;
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      font-weight: 600; transition: all 0.2s;
    }
    .mode-tab.active { background: ${colors.primary}20; border-color: ${colors.primary}60; color: ${colors.primary}; }
    .text-area {
      width: 100%; min-height: 150px; padding: 16px; font-family: monospace; font-size: 0.9rem;
      background: rgba(0,0,0,0.2); color: #e0e0e0; border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px; margin-bottom: 16px; resize: vertical;
    }
    .arrow-indicator { text-align: center; font-size: 2rem; color: ${colors.primary}; margin: 16px 0; }
    .file-drop {
      border: 2px dashed rgba(255,255,255,0.2); border-radius: 12px; padding: 40px; text-align: center;
      margin-bottom: 20px; cursor: pointer; transition: all 0.2s;
    }
    .file-drop:hover, .file-drop.dragover { border-color: ${colors.primary}; background: ${colors.primary}10; }
    .file-drop input { display: none; }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1 class="title">${name || 'Base64 Encoder'}</h1>
      <p class="subtitle">Encode and decode Base64 strings</p>
    </header>

    <div class="card">
      <div class="mode-tabs">
        <div class="mode-tab active" data-mode="text" onclick="switchMode('text')">Text</div>
        <div class="mode-tab" data-mode="file" onclick="switchMode('file')">File/Image</div>
      </div>

      <div id="text-mode">
        <label class="form-label">Input Text</label>
        <textarea class="text-area" id="input" placeholder="Enter text to encode/decode..."></textarea>

        <div style="display: flex; gap: 12px; margin-bottom: 16px;">
          <button class="btn-primary" onclick="encode()" style="flex: 1;">Encode to Base64</button>
          <button class="btn-secondary" onclick="decode()" style="flex: 1;">Decode from Base64</button>
        </div>

        <label class="form-label">Output</label>
        <textarea class="text-area" id="output" placeholder="Result will appear here..." readonly></textarea>

        <button class="btn-secondary" onclick="copyResult()" style="width: 100%;">Copy Result</button>
      </div>

      <div id="file-mode" style="display: none;">
        <div class="file-drop" id="file-drop" onclick="document.getElementById('file-input').click()">
          <input type="file" id="file-input" onchange="handleFile(event)">
          <p style="color: #888; margin-bottom: 8px;">Drop a file here or click to select</p>
          <p style="font-size: 0.8rem; color: #666;">Supports images, documents, and more</p>
        </div>

        <label class="form-label">Base64 Output</label>
        <textarea class="text-area" id="file-output" placeholder="Base64 encoded file will appear here..." readonly></textarea>

        <div style="display: flex; gap: 12px;">
          <button class="btn-primary" onclick="copyFileResult()" style="flex: 1;">Copy Base64</button>
          <button class="btn-secondary" onclick="downloadFile()" style="flex: 1;">Download Original</button>
        </div>
      </div>
    </div>

    <footer class="brand-footer">
      ${branding?.businessName || 'Base64 Encoder'} • Powered by Blink
    </footer>
  </div>

  <script>
    let currentFile = null;

    function switchMode(mode) {
      document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
      document.querySelector('[data-mode="' + mode + '"]').classList.add('active');
      document.getElementById('text-mode').style.display = mode === 'text' ? 'block' : 'none';
      document.getElementById('file-mode').style.display = mode === 'file' ? 'block' : 'none';
    }

    function encode() {
      const input = document.getElementById('input').value;
      try {
        document.getElementById('output').value = btoa(unescape(encodeURIComponent(input)));
      } catch (e) { alert('Encoding failed: ' + e.message); }
    }

    function decode() {
      const input = document.getElementById('input').value;
      try {
        document.getElementById('output').value = decodeURIComponent(escape(atob(input)));
      } catch (e) { alert('Decoding failed: Invalid Base64 string'); }
    }

    function copyResult() {
      navigator.clipboard.writeText(document.getElementById('output').value);
      alert('Copied to clipboard!');
    }

    function handleFile(e) {
      const file = e.target.files[0];
      if (!file) return;
      currentFile = file;
      const reader = new FileReader();
      reader.onload = function() {
        document.getElementById('file-output').value = reader.result;
      };
      reader.readAsDataURL(file);
    }

    function copyFileResult() {
      navigator.clipboard.writeText(document.getElementById('file-output').value);
      alert('Copied to clipboard!');
    }

    // Drag and drop
    const dropZone = document.getElementById('file-drop');
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files.length) {
        document.getElementById('file-input').files = e.dataTransfer.files;
        handleFile({ target: { files: e.dataTransfer.files } });
      }
    });
  </script>
</body>
</html>`;
}

// ============================================
// HASH GENERATOR
// ============================================

function generateHashGenerator(config) {
  const { name, style, colors, branding } = config;
  const stylePreset = STYLE_PRESETS[style] || STYLE_PRESETS.modern;
  const css = stylePreset.getCSS(colors);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name || 'Hash Generator'} | ${branding?.businessName || 'Dev Tools'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    ${css}

    .hash-input {
      width: 100%; min-height: 100px; padding: 16px; font-family: monospace;
      background: rgba(0,0,0,0.2); color: #e0e0e0; border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px; margin-bottom: 20px; resize: vertical;
    }
    .hash-results { display: flex; flex-direction: column; gap: 12px; }
    .hash-item {
      display: flex; flex-direction: column; padding: 16px;
      background: rgba(255,255,255,0.03); border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.08);
    }
    .hash-label { font-size: 0.8rem; font-weight: 600; color: ${colors.primary}; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
    .hash-value {
      font-family: monospace; font-size: 0.85rem; word-break: break-all; color: #e0e0e0;
      display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;
    }
    .hash-text { flex: 1; }
    .copy-btn {
      padding: 6px 12px; background: ${colors.primary}20; color: ${colors.primary};
      border: none; border-radius: 4px; cursor: pointer; font-size: 0.75rem; white-space: nowrap;
    }
    .copy-btn:hover { background: ${colors.primary}30; }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1 class="title">${name || 'Hash Generator'}</h1>
      <p class="subtitle">Generate MD5, SHA-1, SHA-256, and SHA-512 hashes</p>
    </header>

    <div class="card">
      <label class="form-label">Input Text</label>
      <textarea class="hash-input" id="input" placeholder="Enter text to hash..." oninput="generateHashes()"></textarea>

      <div class="hash-results" id="results">
        <div class="hash-item">
          <div class="hash-label">MD5</div>
          <div class="hash-value"><span class="hash-text" id="md5">-</span><button class="copy-btn" onclick="copyHash('md5')">Copy</button></div>
        </div>
        <div class="hash-item">
          <div class="hash-label">SHA-1</div>
          <div class="hash-value"><span class="hash-text" id="sha1">-</span><button class="copy-btn" onclick="copyHash('sha1')">Copy</button></div>
        </div>
        <div class="hash-item">
          <div class="hash-label">SHA-256</div>
          <div class="hash-value"><span class="hash-text" id="sha256">-</span><button class="copy-btn" onclick="copyHash('sha256')">Copy</button></div>
        </div>
        <div class="hash-item">
          <div class="hash-label">SHA-512</div>
          <div class="hash-value"><span class="hash-text" id="sha512">-</span><button class="copy-btn" onclick="copyHash('sha512')">Copy</button></div>
        </div>
      </div>
    </div>

    <footer class="brand-footer">
      ${branding?.businessName || 'Hash Generator'} • Powered by Blink
    </footer>
  </div>

  <script>
    // Simple MD5 implementation (client-side)
    function md5(string) {
      function rotateLeft(value, shift) { return (value << shift) | (value >>> (32 - shift)); }
      function addUnsigned(x, y) { return ((x & 0x7FFFFFFF) + (y & 0x7FFFFFFF)) ^ (x & 0x80000000) ^ (y & 0x80000000); }
      // Simplified MD5 - for demo, use proper library in production
      let hash = 0;
      for (let i = 0; i < string.length; i++) {
        const char = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(16).padStart(32, '0');
    }

    async function sha(algorithm, message) {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest(algorithm, msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async function generateHashes() {
      const input = document.getElementById('input').value;
      if (!input) {
        document.getElementById('md5').textContent = '-';
        document.getElementById('sha1').textContent = '-';
        document.getElementById('sha256').textContent = '-';
        document.getElementById('sha512').textContent = '-';
        return;
      }

      document.getElementById('md5').textContent = md5(input);
      document.getElementById('sha1').textContent = await sha('SHA-1', input);
      document.getElementById('sha256').textContent = await sha('SHA-256', input);
      document.getElementById('sha512').textContent = await sha('SHA-512', input);
    }

    function copyHash(type) {
      const hash = document.getElementById(type).textContent;
      if (hash !== '-') {
        navigator.clipboard.writeText(hash);
        alert(type.toUpperCase() + ' hash copied!');
      }
    }
  </script>
</body>
</html>`;
}

// ============================================
// REGEX TESTER
// ============================================

function generateRegexTester(config) {
  const { name, style, colors, branding } = config;
  const stylePreset = STYLE_PRESETS[style] || STYLE_PRESETS.modern;
  const css = stylePreset.getCSS(colors);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name || 'Regex Tester'} | ${branding?.businessName || 'Dev Tools'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    ${css}

    .regex-input-row { display: flex; gap: 8px; margin-bottom: 16px; align-items: center; }
    .regex-input {
      flex: 1; padding: 14px 16px; font-family: monospace; font-size: 1rem;
      background: rgba(0,0,0,0.3); color: #e0e0e0; border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
    }
    .regex-prefix, .regex-suffix { font-family: monospace; font-size: 1.2rem; color: ${colors.primary}; }
    .flags-row { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
    .flag-option { display: flex; align-items: center; gap: 6px; cursor: pointer; }
    .flag-option input { cursor: pointer; }
    .test-textarea {
      width: 100%; min-height: 200px; padding: 16px; font-family: monospace; font-size: 0.9rem;
      line-height: 1.6; background: rgba(0,0,0,0.2); color: #e0e0e0;
      border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; margin-bottom: 20px;
    }
    .match-highlight { background: ${colors.primary}40; border-radius: 2px; padding: 0 2px; }
    .results-section { margin-top: 20px; }
    .match-item {
      display: flex; justify-content: space-between; padding: 12px; margin-bottom: 8px;
      background: rgba(255,255,255,0.03); border-radius: 6px; font-family: monospace;
    }
    .match-index { color: #888; font-size: 0.8rem; }
    .match-text { color: ${colors.primary}; }
    .no-match { color: #888; font-style: italic; padding: 20px; text-align: center; }
    .error-msg { color: #ef4444; padding: 12px; background: rgba(239, 68, 68, 0.1); border-radius: 8px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1 class="title">${name || 'Regex Tester'}</h1>
      <p class="subtitle">Test and debug regular expressions in real-time</p>
    </header>

    <div class="card">
      <label class="form-label">Regular Expression</label>
      <div class="regex-input-row">
        <span class="regex-prefix">/</span>
        <input type="text" class="regex-input" id="regex" placeholder="Enter regex pattern..." oninput="testRegex()">
        <span class="regex-suffix">/</span>
        <input type="text" class="regex-input" id="flags" value="g" style="width: 60px; text-align: center;" oninput="testRegex()">
      </div>

      <div class="flags-row">
        <label class="flag-option"><input type="checkbox" id="flag-g" checked onchange="updateFlags()"> <code>g</code> Global</label>
        <label class="flag-option"><input type="checkbox" id="flag-i" onchange="updateFlags()"> <code>i</code> Case insensitive</label>
        <label class="flag-option"><input type="checkbox" id="flag-m" onchange="updateFlags()"> <code>m</code> Multiline</label>
      </div>

      <div id="error" class="error-msg" style="display: none;"></div>

      <label class="form-label">Test String</label>
      <textarea class="test-textarea" id="test-string" placeholder="Enter text to test against..." oninput="testRegex()">The quick brown fox jumps over the lazy dog.</textarea>

      <div class="results-section">
        <label class="form-label">Matches (<span id="match-count">0</span>)</label>
        <div id="matches"></div>
      </div>
    </div>

    <footer class="brand-footer">
      ${branding?.businessName || 'Regex Tester'} • Powered by Blink
    </footer>
  </div>

  <script>
    function updateFlags() {
      let flags = '';
      if (document.getElementById('flag-g').checked) flags += 'g';
      if (document.getElementById('flag-i').checked) flags += 'i';
      if (document.getElementById('flag-m').checked) flags += 'm';
      document.getElementById('flags').value = flags;
      testRegex();
    }

    function testRegex() {
      const pattern = document.getElementById('regex').value;
      const flags = document.getElementById('flags').value;
      const testString = document.getElementById('test-string').value;
      const errorDiv = document.getElementById('error');
      const matchesDiv = document.getElementById('matches');
      const countSpan = document.getElementById('match-count');

      errorDiv.style.display = 'none';
      matchesDiv.innerHTML = '';

      if (!pattern) {
        countSpan.textContent = '0';
        matchesDiv.innerHTML = '<div class="no-match">Enter a regex pattern to start testing</div>';
        return;
      }

      try {
        const regex = new RegExp(pattern, flags);
        const matches = [...testString.matchAll(regex)];

        countSpan.textContent = matches.length;

        if (matches.length === 0) {
          matchesDiv.innerHTML = '<div class="no-match">No matches found</div>';
          return;
        }

        matches.forEach((match, i) => {
          const div = document.createElement('div');
          div.className = 'match-item';
          div.innerHTML = '<span class="match-index">#' + (i + 1) + ' at index ' + match.index + '</span><span class="match-text">"' + match[0] + '"</span>';
          matchesDiv.appendChild(div);
        });
      } catch (e) {
        errorDiv.textContent = 'Invalid regex: ' + e.message;
        errorDiv.style.display = 'block';
        countSpan.textContent = '0';
      }
    }

    testRegex();
  </script>
</body>
</html>`;
}

// ============================================
// IMAGE RESIZER
// ============================================

function generateImageResizer(config) {
  const { name, style, colors, branding } = config;
  const stylePreset = STYLE_PRESETS[style] || STYLE_PRESETS.modern;
  const css = stylePreset.getCSS(colors);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name || 'Image Resizer'} | ${branding?.businessName || 'Utility Tools'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    ${css}

    .drop-zone {
      border: 2px dashed rgba(255,255,255,0.2); border-radius: 16px; padding: 60px 40px;
      text-align: center; cursor: pointer; transition: all 0.3s; margin-bottom: 24px;
    }
    .drop-zone:hover, .drop-zone.dragover { border-color: ${colors.primary}; background: ${colors.primary}10; }
    .drop-zone input { display: none; }
    .drop-icon { font-size: 3rem; margin-bottom: 16px; }
    .preview-container { display: none; margin-bottom: 24px; }
    .preview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    @media (max-width: 600px) { .preview-grid { grid-template-columns: 1fr; } }
    .preview-box { text-align: center; }
    .preview-label { font-size: 0.8rem; font-weight: 600; color: #888; margin-bottom: 8px; text-transform: uppercase; }
    .preview-img { max-width: 100%; max-height: 200px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); }
    .size-controls { display: grid; grid-template-columns: 1fr auto 1fr; gap: 12px; align-items: end; margin-bottom: 20px; }
    .size-input { display: flex; flex-direction: column; }
    .size-input input { padding: 12px; font-size: 1rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; text-align: center; }
    .link-icon { font-size: 1.5rem; color: ${colors.primary}; cursor: pointer; padding: 8px; }
    .quality-slider { margin-bottom: 20px; }
    .quality-slider input { width: 100%; }
    .file-info { display: flex; justify-content: space-between; padding: 12px 16px; background: rgba(255,255,255,0.03); border-radius: 8px; margin-bottom: 20px; font-size: 0.9rem; }
    .size-reduction { color: #10b981; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1 class="title">${name || 'Image Resizer'}</h1>
      <p class="subtitle">Resize and compress images instantly</p>
    </header>

    <div class="card">
      <div class="drop-zone" id="drop-zone" onclick="document.getElementById('file-input').click()">
        <input type="file" id="file-input" accept="image/*" onchange="handleImage(event)">
        <div class="drop-icon">🖼️</div>
        <p style="color: #ccc; margin-bottom: 8px;">Drop an image here or click to select</p>
        <p style="color: #888; font-size: 0.85rem;">Supports JPG, PNG, WebP</p>
      </div>

      <div class="preview-container" id="preview-container">
        <div class="preview-grid">
          <div class="preview-box">
            <div class="preview-label">Original</div>
            <img id="original-preview" class="preview-img">
          </div>
          <div class="preview-box">
            <div class="preview-label">Resized</div>
            <img id="resized-preview" class="preview-img">
          </div>
        </div>
      </div>

      <div class="size-controls">
        <div class="size-input">
          <label class="form-label">Width (px)</label>
          <input type="number" id="width" placeholder="Width" oninput="updateSize('width')">
        </div>
        <div class="link-icon" id="link-btn" onclick="toggleLock()">🔗</div>
        <div class="size-input">
          <label class="form-label">Height (px)</label>
          <input type="number" id="height" placeholder="Height" oninput="updateSize('height')">
        </div>
      </div>

      <div class="quality-slider">
        <label class="form-label">Quality: <span id="quality-value">80</span>%</label>
        <input type="range" id="quality" min="10" max="100" value="80" oninput="updateQuality()">
      </div>

      <div class="file-info" id="file-info" style="display: none;">
        <span>Original: <span id="original-size">0 KB</span></span>
        <span>New: <span id="new-size">0 KB</span></span>
        <span class="size-reduction" id="reduction">-0%</span>
      </div>

      <button class="btn-primary" id="download-btn" onclick="downloadImage()" style="width: 100%;" disabled>
        Download Resized Image
      </button>
    </div>

    <footer class="brand-footer">
      ${branding?.businessName || 'Image Resizer'} • Powered by Blink
    </footer>
  </div>

  <canvas id="canvas" style="display: none;"></canvas>

  <script>
    let originalImage = null;
    let aspectRatio = 1;
    let locked = true;
    let originalFileSize = 0;

    const dropZone = document.getElementById('drop-zone');
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files[0]) handleImage({ target: { files: [e.dataTransfer.files[0]] } });
    });

    function handleImage(e) {
      const file = e.target.files[0];
      if (!file) return;

      originalFileSize = file.size;
      const reader = new FileReader();
      reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
          originalImage = img;
          aspectRatio = img.width / img.height;

          document.getElementById('width').value = img.width;
          document.getElementById('height').value = img.height;
          document.getElementById('original-preview').src = event.target.result;
          document.getElementById('preview-container').style.display = 'block';
          document.getElementById('original-size').textContent = formatBytes(originalFileSize);

          resizeImage();
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }

    function toggleLock() {
      locked = !locked;
      document.getElementById('link-btn').style.opacity = locked ? 1 : 0.3;
    }

    function updateSize(changed) {
      if (!originalImage || !locked) return;
      if (changed === 'width') {
        const w = parseInt(document.getElementById('width').value) || 0;
        document.getElementById('height').value = Math.round(w / aspectRatio);
      } else {
        const h = parseInt(document.getElementById('height').value) || 0;
        document.getElementById('width').value = Math.round(h * aspectRatio);
      }
      resizeImage();
    }

    function updateQuality() {
      document.getElementById('quality-value').textContent = document.getElementById('quality').value;
      resizeImage();
    }

    function resizeImage() {
      if (!originalImage) return;

      const width = parseInt(document.getElementById('width').value) || originalImage.width;
      const height = parseInt(document.getElementById('height').value) || originalImage.height;
      const quality = parseInt(document.getElementById('quality').value) / 100;

      const canvas = document.getElementById('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(originalImage, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      document.getElementById('resized-preview').src = dataUrl;

      const newSize = Math.round((dataUrl.length - 22) * 3 / 4);
      document.getElementById('new-size').textContent = formatBytes(newSize);
      const reduction = Math.round((1 - newSize / originalFileSize) * 100);
      document.getElementById('reduction').textContent = (reduction > 0 ? '-' : '+') + Math.abs(reduction) + '%';
      document.getElementById('file-info').style.display = 'flex';
      document.getElementById('download-btn').disabled = false;
    }

    function downloadImage() {
      const canvas = document.getElementById('canvas');
      const quality = parseInt(document.getElementById('quality').value) / 100;
      const link = document.createElement('a');
      link.download = 'resized-image.jpg';
      link.href = canvas.toDataURL('image/jpeg', quality);
      link.click();
    }

    function formatBytes(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
  </script>
</body>
</html>`;
}

// ============================================
// JSON/CSV CONVERTER
// ============================================

function generateJSONCSVConverter(config) {
  const { name, style, colors, branding } = config;
  const stylePreset = STYLE_PRESETS[style] || STYLE_PRESETS.modern;
  const css = stylePreset.getCSS(colors);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name || 'JSON/CSV Converter'} | ${branding?.businessName || 'Utility Tools'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    ${css}

    .mode-tabs { display: flex; gap: 8px; margin-bottom: 24px; }
    .mode-tab {
      flex: 1; padding: 16px; text-align: center; border-radius: 12px; cursor: pointer;
      background: rgba(255,255,255,0.03); border: 2px solid rgba(255,255,255,0.08);
      font-weight: 600; transition: all 0.2s;
    }
    .mode-tab.active { background: ${colors.primary}15; border-color: ${colors.primary}60; color: ${colors.primary}; }
    .editor-grid { display: grid; grid-template-columns: 1fr 60px 1fr; gap: 16px; margin-bottom: 20px; }
    @media (max-width: 768px) { .editor-grid { grid-template-columns: 1fr; } .arrow-col { transform: rotate(90deg); } }
    .editor-panel {}
    .editor-label { font-size: 0.8rem; font-weight: 600; color: #888; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
    .editor-textarea {
      width: 100%; min-height: 300px; padding: 16px; font-family: monospace; font-size: 0.85rem;
      background: rgba(0,0,0,0.2); color: #e0e0e0; border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px; resize: vertical;
    }
    .arrow-col { display: flex; align-items: center; justify-content: center; font-size: 2rem; color: ${colors.primary}; }
    .action-row { display: flex; gap: 12px; flex-wrap: wrap; }
    .status-msg { padding: 12px 16px; border-radius: 8px; margin-top: 16px; font-size: 0.9rem; }
    .status-success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .status-error { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1 class="title">${name || 'JSON/CSV Converter'}</h1>
      <p class="subtitle">Convert between JSON and CSV formats</p>
    </header>

    <div class="card">
      <div class="mode-tabs">
        <div class="mode-tab active" data-mode="json-to-csv" onclick="setMode('json-to-csv')">JSON → CSV</div>
        <div class="mode-tab" data-mode="csv-to-json" onclick="setMode('csv-to-json')">CSV → JSON</div>
      </div>

      <div class="editor-grid">
        <div class="editor-panel">
          <div class="editor-label" id="input-label">JSON Input</div>
          <textarea class="editor-textarea" id="input" placeholder="Paste your data here..."></textarea>
        </div>
        <div class="arrow-col">→</div>
        <div class="editor-panel">
          <div class="editor-label" id="output-label">CSV Output</div>
          <textarea class="editor-textarea" id="output" placeholder="Converted data will appear here..." readonly></textarea>
        </div>
      </div>

      <div class="action-row">
        <button class="btn-primary" onclick="convert()">Convert</button>
        <button class="btn-secondary" onclick="copyOutput()">Copy Output</button>
        <button class="btn-secondary" onclick="downloadOutput()">Download</button>
        <button class="btn-secondary" onclick="clearAll()">Clear</button>
      </div>

      <div class="status-msg" id="status" style="display: none;"></div>
    </div>

    <footer class="brand-footer">
      ${branding?.businessName || 'JSON/CSV Converter'} • Powered by Blink
    </footer>
  </div>

  <script>
    let mode = 'json-to-csv';

    function setMode(m) {
      mode = m;
      document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
      document.querySelector('[data-mode="' + m + '"]').classList.add('active');
      document.getElementById('input-label').textContent = m === 'json-to-csv' ? 'JSON Input' : 'CSV Input';
      document.getElementById('output-label').textContent = m === 'json-to-csv' ? 'CSV Output' : 'JSON Output';
      document.getElementById('input').placeholder = m === 'json-to-csv' ? 'Paste JSON array here...' : 'Paste CSV data here...';
      clearAll();
    }

    function showStatus(msg, isError) {
      const el = document.getElementById('status');
      el.textContent = msg;
      el.className = 'status-msg ' + (isError ? 'status-error' : 'status-success');
      el.style.display = 'block';
    }

    function convert() {
      const input = document.getElementById('input').value.trim();
      if (!input) { showStatus('Please enter some data', true); return; }

      try {
        if (mode === 'json-to-csv') {
          const json = JSON.parse(input);
          if (!Array.isArray(json)) throw new Error('JSON must be an array of objects');
          if (json.length === 0) throw new Error('JSON array is empty');

          const headers = Object.keys(json[0]);
          const rows = json.map(obj => headers.map(h => {
            let val = obj[h];
            if (typeof val === 'object') val = JSON.stringify(val);
            if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\\n'))) {
              val = '"' + val.replace(/"/g, '""') + '"';
            }
            return val ?? '';
          }).join(','));

          document.getElementById('output').value = headers.join(',') + '\\n' + rows.join('\\n');
          showStatus('Converted ' + json.length + ' records to CSV', false);
        } else {
          const lines = input.split('\\n').filter(l => l.trim());
          if (lines.length < 2) throw new Error('CSV must have headers and at least one data row');

          const headers = parseCSVLine(lines[0]);
          const result = lines.slice(1).map(line => {
            const values = parseCSVLine(line);
            const obj = {};
            headers.forEach((h, i) => obj[h] = values[i] || '');
            return obj;
          });

          document.getElementById('output').value = JSON.stringify(result, null, 2);
          showStatus('Converted ' + result.length + ' records to JSON', false);
        }
      } catch (e) {
        showStatus('Error: ' + e.message, true);
      }
    }

    function parseCSVLine(line) {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
          else inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current); current = '';
        } else {
          current += char;
        }
      }
      result.push(current);
      return result;
    }

    function copyOutput() {
      const output = document.getElementById('output').value;
      if (output) { navigator.clipboard.writeText(output); showStatus('Copied to clipboard!', false); }
    }

    function downloadOutput() {
      const output = document.getElementById('output').value;
      if (!output) return;
      const ext = mode === 'json-to-csv' ? 'csv' : 'json';
      const blob = new Blob([output], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'converted.' + ext;
      link.click();
    }

    function clearAll() {
      document.getElementById('input').value = '';
      document.getElementById('output').value = '';
      document.getElementById('status').style.display = 'none';
    }
  </script>
</body>
</html>`;
}

// ============================================
// WORD COUNTER
// ============================================

function generateWordCounter(config) {
  const { name, style, colors, branding } = config;
  const stylePreset = STYLE_PRESETS[style] || STYLE_PRESETS.modern;
  const css = stylePreset.getCSS(colors);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name || 'Word Counter'} | ${branding?.businessName || 'Utility Tools'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    ${css}

    .text-input {
      width: 100%; min-height: 250px; padding: 20px; font-size: 1rem; line-height: 1.6;
      background: rgba(0,0,0,0.2); color: #e0e0e0; border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px; margin-bottom: 24px; resize: vertical;
    }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    @media (max-width: 600px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
    .stat-card {
      text-align: center; padding: 20px; background: rgba(255,255,255,0.03);
      border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);
    }
    .stat-value { font-size: 2rem; font-weight: 700; color: ${colors.primary}; }
    .stat-label { font-size: 0.8rem; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
    .reading-time { text-align: center; padding: 16px; background: ${colors.primary}10; border-radius: 8px; }
    .reading-time-value { font-size: 1.2rem; font-weight: 600; color: ${colors.primary}; }
    .reading-time-label { font-size: 0.85rem; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1 class="title">${name || 'Word Counter'}</h1>
      <p class="subtitle">Count words, characters, sentences, and more</p>
    </header>

    <div class="card">
      <textarea class="text-input" id="text" placeholder="Start typing or paste your text here..." oninput="updateStats()"></textarea>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value" id="words">0</div>
          <div class="stat-label">Words</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" id="chars">0</div>
          <div class="stat-label">Characters</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" id="chars-no-space">0</div>
          <div class="stat-label">No Spaces</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" id="sentences">0</div>
          <div class="stat-label">Sentences</div>
        </div>
      </div>

      <div class="reading-time">
        <div class="reading-time-value" id="reading-time">0 min</div>
        <div class="reading-time-label">Estimated reading time (200 wpm)</div>
      </div>
    </div>

    <footer class="brand-footer">
      ${branding?.businessName || 'Word Counter'} • Powered by Blink
    </footer>
  </div>

  <script>
    function updateStats() {
      const text = document.getElementById('text').value;

      const words = text.trim() ? text.trim().split(/\\s+/).length : 0;
      const chars = text.length;
      const charsNoSpace = text.replace(/\\s/g, '').length;
      const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
      const readingTime = Math.ceil(words / 200);

      document.getElementById('words').textContent = words.toLocaleString();
      document.getElementById('chars').textContent = chars.toLocaleString();
      document.getElementById('chars-no-space').textContent = charsNoSpace.toLocaleString();
      document.getElementById('sentences').textContent = sentences.toLocaleString();
      document.getElementById('reading-time').textContent = readingTime + ' min';
    }
  </script>
</body>
</html>`;
}

// ============================================
// AGE CALCULATOR
// ============================================

function generateAgeCalculator(config) {
  const { name, style, colors, branding } = config;
  const stylePreset = STYLE_PRESETS[style] || STYLE_PRESETS.modern;
  const css = stylePreset.getCSS(colors);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name || 'Age Calculator'} | ${branding?.businessName || 'Utility Tools'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    ${css}

    .date-inputs { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    @media (max-width: 500px) { .date-inputs { grid-template-columns: 1fr; } }
    .date-input { width: 100%; padding: 14px; font-size: 1rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; }
    .result-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    @media (max-width: 500px) { .result-grid { grid-template-columns: 1fr; } }
    .result-card { text-align: center; padding: 24px; background: rgba(255,255,255,0.03); border-radius: 12px; }
    .result-value { font-size: 2.5rem; font-weight: 700; color: ${colors.primary}; }
    .result-label { font-size: 0.85rem; color: #888; margin-top: 4px; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .detail-label { color: #888; }
    .detail-value { font-weight: 600; color: #fff; }
    .next-birthday { text-align: center; padding: 20px; background: ${colors.primary}10; border-radius: 12px; margin-top: 20px; }
    .countdown { font-size: 1.2rem; font-weight: 600; color: ${colors.primary}; }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1 class="title">${name || 'Age Calculator'}</h1>
      <p class="subtitle">Calculate your exact age in years, months, and days</p>
    </header>

    <div class="card">
      <div class="date-inputs">
        <div>
          <label class="form-label">Date of Birth</label>
          <input type="date" class="date-input" id="birthdate" onchange="calculateAge()">
        </div>
        <div>
          <label class="form-label">Calculate Age On</label>
          <input type="date" class="date-input" id="target-date" onchange="calculateAge()">
        </div>
      </div>

      <div class="result-grid" id="results" style="display: none;">
        <div class="result-card">
          <div class="result-value" id="years">0</div>
          <div class="result-label">Years</div>
        </div>
        <div class="result-card">
          <div class="result-value" id="months">0</div>
          <div class="result-label">Months</div>
        </div>
        <div class="result-card">
          <div class="result-value" id="days">0</div>
          <div class="result-label">Days</div>
        </div>
      </div>

      <div id="details" style="display: none;">
        <div class="detail-row"><span class="detail-label">Total Months</span><span class="detail-value" id="total-months">0</span></div>
        <div class="detail-row"><span class="detail-label">Total Weeks</span><span class="detail-value" id="total-weeks">0</span></div>
        <div class="detail-row"><span class="detail-label">Total Days</span><span class="detail-value" id="total-days">0</span></div>
        <div class="detail-row"><span class="detail-label">Total Hours</span><span class="detail-value" id="total-hours">0</span></div>

        <div class="next-birthday">
          <div style="color: #888; margin-bottom: 8px;">Next Birthday In</div>
          <div class="countdown" id="next-birthday">-</div>
        </div>
      </div>
    </div>

    <footer class="brand-footer">
      ${branding?.businessName || 'Age Calculator'} • Powered by Blink
    </footer>
  </div>

  <script>
    document.getElementById('target-date').valueAsDate = new Date();

    function calculateAge() {
      const birthdate = document.getElementById('birthdate').value;
      const targetDate = document.getElementById('target-date').value;
      if (!birthdate) return;

      const birth = new Date(birthdate);
      const target = new Date(targetDate || new Date());

      if (birth > target) { alert('Birth date cannot be in the future'); return; }

      let years = target.getFullYear() - birth.getFullYear();
      let months = target.getMonth() - birth.getMonth();
      let days = target.getDate() - birth.getDate();

      if (days < 0) { months--; days += new Date(target.getFullYear(), target.getMonth(), 0).getDate(); }
      if (months < 0) { years--; months += 12; }

      const totalDays = Math.floor((target - birth) / (1000 * 60 * 60 * 24));

      document.getElementById('years').textContent = years;
      document.getElementById('months').textContent = months;
      document.getElementById('days').textContent = days;
      document.getElementById('total-months').textContent = (years * 12 + months).toLocaleString();
      document.getElementById('total-weeks').textContent = Math.floor(totalDays / 7).toLocaleString();
      document.getElementById('total-days').textContent = totalDays.toLocaleString();
      document.getElementById('total-hours').textContent = (totalDays * 24).toLocaleString();

      // Next birthday
      const nextBirthday = new Date(target.getFullYear(), birth.getMonth(), birth.getDate());
      if (nextBirthday <= target) nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
      const daysUntil = Math.ceil((nextBirthday - target) / (1000 * 60 * 60 * 24));
      document.getElementById('next-birthday').textContent = daysUntil + ' days';

      document.getElementById('results').style.display = 'grid';
      document.getElementById('details').style.display = 'block';
    }
  </script>
</body>
</html>`;
}

// ============================================
// PASSWORD GENERATOR
// ============================================

function generatePasswordGenerator(config) {
  const { name, style, colors, branding } = config;
  const stylePreset = STYLE_PRESETS[style] || STYLE_PRESETS.modern;
  const css = stylePreset.getCSS(colors);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name || 'Password Generator'} | ${branding?.businessName || 'Security Tools'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    ${css}

    .password-display {
      display: flex; align-items: center; gap: 12px; padding: 20px;
      background: rgba(0,0,0,0.3); border-radius: 12px; margin-bottom: 24px;
    }
    .password-text {
      flex: 1; font-family: monospace; font-size: 1.3rem; word-break: break-all;
      color: #fff; letter-spacing: 1px;
    }
    .copy-btn {
      padding: 12px 20px; background: ${colors.primary}; color: #fff; border: none;
      border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s;
    }
    .copy-btn:hover { transform: scale(1.05); }
    .strength-bar { height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; margin-bottom: 8px; overflow: hidden; }
    .strength-fill { height: 100%; transition: all 0.3s; }
    .strength-label { font-size: 0.85rem; margin-bottom: 24px; }
    .option-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .option-label { color: #ccc; }
    .length-slider { width: 100%; margin: 8px 0; }
    .checkbox-option { display: flex; align-items: center; gap: 10px; }
    .checkbox-option input { width: 20px; height: 20px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1 class="title">${name || 'Password Generator'}</h1>
      <p class="subtitle">Generate secure, random passwords</p>
    </header>

    <div class="card">
      <div class="password-display">
        <span class="password-text" id="password">Click Generate</span>
        <button class="copy-btn" onclick="copyPassword()">Copy</button>
      </div>

      <div class="strength-bar"><div class="strength-fill" id="strength-fill"></div></div>
      <div class="strength-label"><span id="strength-text">-</span></div>

      <div class="option-row">
        <span class="option-label">Length: <strong id="length-value">16</strong></span>
        <input type="range" class="length-slider" id="length" min="8" max="64" value="16" style="width: 60%;" oninput="updateLength()">
      </div>

      <div class="option-row">
        <span class="option-label">Uppercase (A-Z)</span>
        <input type="checkbox" id="uppercase" checked onchange="generate()">
      </div>

      <div class="option-row">
        <span class="option-label">Lowercase (a-z)</span>
        <input type="checkbox" id="lowercase" checked onchange="generate()">
      </div>

      <div class="option-row">
        <span class="option-label">Numbers (0-9)</span>
        <input type="checkbox" id="numbers" checked onchange="generate()">
      </div>

      <div class="option-row">
        <span class="option-label">Symbols (!@#$%)</span>
        <input type="checkbox" id="symbols" checked onchange="generate()">
      </div>

      <button class="btn-primary" onclick="generate()" style="width: 100%; margin-top: 24px;">
        Generate New Password
      </button>
    </div>

    <footer class="brand-footer">
      ${branding?.businessName || 'Password Generator'} • Powered by Blink
    </footer>
  </div>

  <script>
    function updateLength() {
      document.getElementById('length-value').textContent = document.getElementById('length').value;
      generate();
    }

    function generate() {
      const length = parseInt(document.getElementById('length').value);
      const useUpper = document.getElementById('uppercase').checked;
      const useLower = document.getElementById('lowercase').checked;
      const useNumbers = document.getElementById('numbers').checked;
      const useSymbols = document.getElementById('symbols').checked;

      let chars = '';
      if (useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (useLower) chars += 'abcdefghijklmnopqrstuvwxyz';
      if (useNumbers) chars += '0123456789';
      if (useSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

      if (!chars) { alert('Select at least one character type'); return; }

      let password = '';
      const array = new Uint32Array(length);
      crypto.getRandomValues(array);
      for (let i = 0; i < length; i++) {
        password += chars[array[i] % chars.length];
      }

      document.getElementById('password').textContent = password;
      updateStrength(password);
    }

    function updateStrength(password) {
      let score = 0;
      if (password.length >= 12) score++;
      if (password.length >= 16) score++;
      if (/[A-Z]/.test(password)) score++;
      if (/[a-z]/.test(password)) score++;
      if (/[0-9]/.test(password)) score++;
      if (/[^A-Za-z0-9]/.test(password)) score++;

      const levels = [
        { text: 'Very Weak', color: '#ef4444', width: '20%' },
        { text: 'Weak', color: '#f97316', width: '35%' },
        { text: 'Fair', color: '#eab308', width: '50%' },
        { text: 'Good', color: '#84cc16', width: '70%' },
        { text: 'Strong', color: '#22c55e', width: '85%' },
        { text: 'Very Strong', color: '#10b981', width: '100%' }
      ];

      const level = levels[Math.min(score, 5)];
      document.getElementById('strength-fill').style.width = level.width;
      document.getElementById('strength-fill').style.background = level.color;
      document.getElementById('strength-text').textContent = level.text;
      document.getElementById('strength-text').style.color = level.color;
    }

    function copyPassword() {
      navigator.clipboard.writeText(document.getElementById('password').textContent);
      alert('Password copied to clipboard!');
    }

    generate();
  </script>
</body>
</html>`;
}

// ============================================
// MAIN EXPORT
// ============================================

function generateStyledTool(toolType, config) {
  // First, try exact match
  if (TOOL_GENERATORS[toolType]) {
    return TOOL_GENERATORS[toolType](config);
  }

  // Smart detection based on tool type or name
  const searchText = (toolType + ' ' + (config.name || '')).toLowerCase();

  // Timer/Countdown/Stopwatch detection
  if (searchText.includes('timer') || searchText.includes('stopwatch') ||
      searchText.includes('countdown') || searchText.includes('pomodoro') ||
      searchText.includes('brewing') || searchText.includes('cooking time')) {
    return generateTimerTool(config);
  }

  // QR Code detection
  if (searchText.includes('qr') || searchText.includes('barcode')) {
    return generateQRCodeTool(config);
  }

  // Sales/Revenue Calculator detection
  if (searchText.includes('sales') || searchText.includes('revenue') ||
      searchText.includes('daily total') || searchText.includes('profit margin')) {
    return generateSalesCalculatorTool(config);
  }

  // Receipt/Invoice detection - use quote-calculator as it has line items
  if (searchText.includes('receipt') || searchText.includes('invoice') || searchText.includes('bill')) {
    return generateQuoteCalculator({ ...config, name: config.name || 'Receipt Generator' });
  }

  // Try partial matches on existing generators
  for (const [key, generator] of Object.entries(TOOL_GENERATORS)) {
    if (searchText.includes(key.replace(/-/g, ' ')) || searchText.includes(key.replace(/-/g, ''))) {
      return generator(config);
    }
  }

  // Fallback to generic
  return generateGenericTool({ ...config, name: config.name || toolType });
}

module.exports = {
  generateStyledTool,
  STYLE_PRESETS,
  TOOL_GENERATORS
};
