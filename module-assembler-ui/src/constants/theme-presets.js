/**
 * Theme Presets - Color schemes and mood configurations
 */

export const THEME_PRESETS = {
  // Energetic themes
  energetic: {
    id: 'energetic',
    name: 'Energetic',
    description: 'Bold, high-energy colors that motivate and excite',
    mood: 'energetic',
    colors: {
      primary: '#DC2626',
      secondary: '#EA580C',
      accent: '#FBBF24',
      background: '#FEF2F2',
      text: '#1F2937'
    },
    industries: ['fitness', 'restaurant']
  },

  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'Classic, trustworthy colors that inspire confidence',
    mood: 'professional',
    colors: {
      primary: '#1E40AF',
      secondary: '#3B82F6',
      accent: '#F59E0B',
      background: '#F8FAFC',
      text: '#1E293B'
    },
    industries: ['professional', 'healthcare', 'education']
  },

  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary colors with gradient vibes',
    mood: 'modern',
    colors: {
      primary: '#6366F1',
      secondary: '#8B5CF6',
      accent: '#EC4899',
      background: '#F8FAFC',
      text: '#1E293B'
    },
    industries: ['tech', 'salon']
  },

  natural: {
    id: 'natural',
    name: 'Natural',
    description: 'Earthy, organic tones that feel grounded',
    mood: 'natural',
    colors: {
      primary: '#059669',
      secondary: '#10B981',
      accent: '#84CC16',
      background: '#F0FDF4',
      text: '#1F2937'
    },
    industries: ['healthcare', 'restaurant', 'fitness']
  },

  luxury: {
    id: 'luxury',
    name: 'Luxury',
    description: 'Sophisticated, premium color palette',
    mood: 'luxury',
    colors: {
      primary: '#1F2937',
      secondary: '#374151',
      accent: '#D4AF37',
      background: '#FAFAFA',
      text: '#1F2937'
    },
    industries: ['salon', 'restaurant', 'professional']
  },

  warm: {
    id: 'warm',
    name: 'Warm & Friendly',
    description: 'Inviting, approachable warm tones',
    mood: 'warm',
    colors: {
      primary: '#EA580C',
      secondary: '#F97316',
      accent: '#FBBF24',
      background: '#FFFBEB',
      text: '#1F2937'
    },
    industries: ['restaurant', 'salon', 'education']
  },

  cool: {
    id: 'cool',
    name: 'Cool & Calm',
    description: 'Serene, calming blue tones',
    mood: 'cool',
    colors: {
      primary: '#0891B2',
      secondary: '#06B6D4',
      accent: '#2DD4BF',
      background: '#F0FDFA',
      text: '#1E293B'
    },
    industries: ['healthcare', 'tech', 'fitness']
  },

  bold: {
    id: 'bold',
    name: 'Bold & Vibrant',
    description: 'Eye-catching, attention-grabbing colors',
    mood: 'bold',
    colors: {
      primary: '#BE185D',
      secondary: '#EC4899',
      accent: '#F472B6',
      background: '#FDF2F8',
      text: '#1F2937'
    },
    industries: ['salon', 'fitness', 'tech']
  },

  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean, understated black and white',
    mood: 'minimal',
    colors: {
      primary: '#18181B',
      secondary: '#3F3F46',
      accent: '#71717A',
      background: '#FFFFFF',
      text: '#18181B'
    },
    industries: ['tech', 'professional', 'salon']
  },

  ocean: {
    id: 'ocean',
    name: 'Ocean',
    description: 'Deep blue tones inspired by the sea',
    mood: 'ocean',
    colors: {
      primary: '#0C4A6E',
      secondary: '#0369A1',
      accent: '#38BDF8',
      background: '#F0F9FF',
      text: '#1E293B'
    },
    industries: ['healthcare', 'professional', 'education']
  },

  forest: {
    id: 'forest',
    name: 'Forest',
    description: 'Rich greens inspired by nature',
    mood: 'forest',
    colors: {
      primary: '#14532D',
      secondary: '#166534',
      accent: '#4ADE80',
      background: '#F0FDF4',
      text: '#1F2937'
    },
    industries: ['healthcare', 'restaurant', 'education']
  },

  sunset: {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm gradient from orange to pink',
    mood: 'sunset',
    colors: {
      primary: '#C2410C',
      secondary: '#EA580C',
      accent: '#FB7185',
      background: '#FFF7ED',
      text: '#1F2937'
    },
    industries: ['restaurant', 'fitness', 'salon']
  }
};

// Get recommended themes for an industry
export function getThemesForIndustry(industry) {
  return Object.values(THEME_PRESETS).filter(theme =>
    theme.industries.includes(industry)
  );
}

// Get all themes
export function getAllThemes() {
  return Object.values(THEME_PRESETS);
}

export default THEME_PRESETS;
