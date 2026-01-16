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
  'invoice-generator': (config) => generateInvoiceGenerator(config),
  'password-generator': (config) => generatePasswordGenerator(config),
  'countdown': (config) => generateCountdown(config),
  'word-counter': (config) => generateWordCounter(config)
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
// MAIN EXPORT
// ============================================

function generateStyledTool(toolType, config) {
  const generator = TOOL_GENERATORS[toolType];
  if (generator) {
    return generator(config);
  }
  return generateGenericTool({ ...config, name: config.name || toolType });
}

module.exports = {
  generateStyledTool,
  STYLE_PRESETS,
  TOOL_GENERATORS
};
