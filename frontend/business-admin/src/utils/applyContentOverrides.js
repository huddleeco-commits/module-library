/**
 * Content Override Utility
 *
 * Fetches and applies content overrides from the staging API.
 * Used by the generated site to display edited content.
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 * Removes dangerous tags and attributes
 * @param {string} html - Raw HTML content
 * @returns {string} Sanitized HTML
 */
function sanitizeHtml(html) {
  if (!html || typeof html !== 'string') return '';

  // Create a temporary element to parse HTML
  const temp = document.createElement('div');
  temp.textContent = html; // This escapes all HTML

  // For true HTML sanitization, use DOMPurify library
  // This basic version just escapes everything for safety
  // If rich HTML is needed, install DOMPurify: npm install dompurify
  // Then use: import DOMPurify from 'dompurify'; return DOMPurify.sanitize(html);

  return temp.innerHTML;
}

/**
 * Fetch content overrides from the API
 * @param {string} mode - 'production' or 'draft'
 * @returns {Promise<{overrides: Array, theme: Object|null}>}
 */
export async function fetchContentOverrides(mode = 'production') {
  try {
    const response = await fetch(`/api/admin/staging/preview?mode=${mode}`);
    if (!response.ok) {
      console.warn('Failed to fetch content overrides');
      return { overrides: [], theme: null };
    }
    return await response.json();
  } catch (error) {
    console.warn('Error fetching content overrides:', error);
    return { overrides: [], theme: null };
  }
}

/**
 * Apply content overrides to the DOM
 * @param {Array} overrides - Array of {selector, element_type, content, styles}
 */
export function applyContentOverrides(overrides) {
  if (!overrides || !Array.isArray(overrides)) return;

  overrides.forEach(override => {
    const { selector, element_type, content, styles } = override;

    try {
      const elements = document.querySelectorAll(selector);

      elements.forEach(element => {
        // Apply content based on element type
        if (element_type === 'text' || element_type === 'heading') {
          element.textContent = content;
        } else if (element_type === 'html') {
          // Sanitize HTML to prevent XSS attacks
          element.innerHTML = sanitizeHtml(content);
        } else if (element_type === 'image') {
          if (element.tagName === 'IMG') {
            element.src = content;
          } else {
            element.style.backgroundImage = `url(${content})`;
          }
        } else if (element_type === 'link') {
          if (element.tagName === 'A') {
            element.href = content;
          }
        }

        // Apply styles if provided
        if (styles && typeof styles === 'object') {
          Object.entries(styles).forEach(([prop, value]) => {
            element.style[prop] = value;
          });
        }
      });
    } catch (error) {
      console.warn(`Failed to apply override for selector: ${selector}`, error);
    }
  });
}

/**
 * Apply theme overrides (colors, fonts)
 * @param {Object} theme - Theme settings object
 */
export function applyThemeOverrides(theme) {
  if (!theme) return;

  const root = document.documentElement;

  if (theme.primary_color) {
    root.style.setProperty('--primary-color', theme.primary_color);
    root.style.setProperty('--color-primary', theme.primary_color);
  }
  if (theme.secondary_color) {
    root.style.setProperty('--secondary-color', theme.secondary_color);
    root.style.setProperty('--color-secondary', theme.secondary_color);
  }
  if (theme.accent_color) {
    root.style.setProperty('--accent-color', theme.accent_color);
    root.style.setProperty('--color-accent', theme.accent_color);
  }
  if (theme.font_family) {
    root.style.setProperty('--font-family', theme.font_family);
    document.body.style.fontFamily = theme.font_family;
  }
}

/**
 * Initialize content overrides on page load
 * @param {string} mode - 'production' or 'draft'
 */
export async function initContentOverrides(mode = 'production') {
  const { overrides, theme } = await fetchContentOverrides(mode);
  applyContentOverrides(overrides);
  applyThemeOverrides(theme);
}

/**
 * Generate a unique selector for an element
 * Used by the editor to identify elements for editing
 * @param {HTMLElement} element
 * @returns {string}
 */
export function generateSelector(element) {
  // If element has data-editable attribute, use that
  if (element.dataset.editable) {
    return `[data-editable="${element.dataset.editable}"]`;
  }

  // If element has a unique ID, use it
  if (element.id) {
    return `#${element.id}`;
  }

  // Build a path-based selector
  const path = [];
  let current = element;

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();

    if (current.id) {
      selector = `#${current.id}`;
      path.unshift(selector);
      break;
    }

    if (current.className && typeof current.className === 'string') {
      const classes = current.className.trim().split(/\s+/).filter(c => c && !c.startsWith('hover:'));
      if (classes.length > 0) {
        selector += `.${classes.slice(0, 2).join('.')}`;
      }
    }

    // Add nth-child if needed for uniqueness
    const parent = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(el => el.tagName === current.tagName);
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }

    path.unshift(selector);
    current = current.parentElement;
  }

  return path.join(' > ');
}

/**
 * Determine element type for an element
 * @param {HTMLElement} element
 * @returns {string}
 */
export function getElementType(element) {
  const tag = element.tagName.toLowerCase();

  if (tag === 'img') return 'image';
  if (tag === 'a') return 'link';
  if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) return 'heading';
  if (['p', 'span', 'label', 'li'].includes(tag)) return 'text';
  if (['div', 'section', 'article'].includes(tag)) {
    // Check if it has only text content
    if (element.children.length === 0 && element.textContent.trim()) {
      return 'text';
    }
    return 'html';
  }

  return 'text';
}

/**
 * Check if an element should be editable
 * @param {HTMLElement} element
 * @returns {boolean}
 */
export function isEditableElement(element) {
  // Skip script, style, and other non-content elements
  const skipTags = ['script', 'style', 'link', 'meta', 'noscript', 'svg', 'path'];
  if (skipTags.includes(element.tagName.toLowerCase())) {
    return false;
  }

  // Skip hidden elements
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false;
  }

  // Check for data-editable or data-no-edit attributes
  if (element.dataset.noEdit) return false;
  if (element.dataset.editable) return true;

  // Editable tags
  const editableTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'img', 'button', 'label', 'li'];
  if (editableTags.includes(element.tagName.toLowerCase())) {
    return true;
  }

  // Divs with direct text content (not just whitespace)
  if (element.tagName.toLowerCase() === 'div') {
    const hasDirectText = Array.from(element.childNodes).some(
      node => node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0
    );
    return hasDirectText;
  }

  return false;
}

export default {
  fetchContentOverrides,
  applyContentOverrides,
  applyThemeOverrides,
  initContentOverrides,
  generateSelector,
  getElementType,
  isEditableElement
};
