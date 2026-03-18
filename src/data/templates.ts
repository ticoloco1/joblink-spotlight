export interface MiniSiteTemplate {
  id: string;
  name: string;
  category: 'minimal' | 'bold' | 'creative' | 'corporate' | 'artistic' | 'dark' | 'videomaker';
  columns: 1 | 2 | 3;
  preview: string; // emoji preview
  colors: {
    bg: string;
    card: string;
    text: string;
    textMuted: string;
    accent: string;
    accentFg: string;
    border: string;
    skillBg: string;
    skillText: string;
  };
  style: {
    photoShape: 'circle' | 'rounded' | 'square' | 'hexagon';
    photoSize: 'sm' | 'md' | 'lg' | 'xl';
    cardStyle: 'flat' | 'elevated' | 'glass' | 'bordered' | 'gradient' | 'none';
    fontVibe: 'serif' | 'sans' | 'mono' | 'display';
    headerAlign: 'center' | 'left' | 'right';
    linkStyle: 'pill' | 'card' | 'underline' | 'button' | 'ghost';
    spacing: 'compact' | 'normal' | 'spacious';
    borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  };
}

export const templates: MiniSiteTemplate[] = [
  // ─── MINIMAL (1 col) ─────────────────────────────
  {
    id: 'clean-white',
    name: 'Clean White',
    category: 'minimal',
    columns: 1,
    preview: '⚪',
    colors: {
      bg: '#FAFAFA', card: '#FFFFFF', text: '#1A1A1A', textMuted: '#71717A',
      accent: '#18181B', accentFg: '#FFFFFF', border: '#E4E4E7',
      skillBg: '#F4F4F5', skillText: '#3F3F46',
    },
    style: {
      photoShape: 'circle', photoSize: 'md', cardStyle: 'bordered', fontVibe: 'sans',
      headerAlign: 'center', linkStyle: 'card', spacing: 'spacious', borderRadius: 'lg',
    },
  },
  {
    id: 'ivory-serif',
    name: 'Ivory Serif',
    category: 'minimal',
    columns: 1,
    preview: '📜',
    colors: {
      bg: '#FAF8F5', card: '#FFFFFF', text: '#2C2418', textMuted: '#8B7E6A',
      accent: '#8B6914', accentFg: '#FFFFFF', border: '#E8E0D4',
      skillBg: '#F5F0E8', skillText: '#5C4E36',
    },
    style: {
      photoShape: 'rounded', photoSize: 'lg', cardStyle: 'flat', fontVibe: 'serif',
      headerAlign: 'center', linkStyle: 'underline', spacing: 'spacious', borderRadius: 'md',
    },
  },
  {
    id: 'zen-stone',
    name: 'Zen Stone',
    category: 'minimal',
    columns: 1,
    preview: '🪨',
    colors: {
      bg: '#F5F5F0', card: '#EEEEE8', text: '#2D2D2D', textMuted: '#7A7A72',
      accent: '#5C6B5E', accentFg: '#FFFFFF', border: '#D5D5CC',
      skillBg: '#E5E5DC', skillText: '#4A4A42',
    },
    style: {
      photoShape: 'square', photoSize: 'lg', cardStyle: 'flat', fontVibe: 'sans',
      headerAlign: 'left', linkStyle: 'ghost', spacing: 'spacious', borderRadius: 'sm',
    },
  },
  {
    id: 'paper-minimal',
    name: 'Paper',
    category: 'minimal',
    columns: 1,
    preview: '📄',
    colors: {
      bg: '#FFFFFF', card: '#FAFAFA', text: '#111111', textMuted: '#888888',
      accent: '#111111', accentFg: '#FFFFFF', border: '#EEEEEE',
      skillBg: '#F0F0F0', skillText: '#333333',
    },
    style: {
      photoShape: 'circle', photoSize: 'sm', cardStyle: 'none', fontVibe: 'mono',
      headerAlign: 'left', linkStyle: 'underline', spacing: 'compact', borderRadius: 'none',
    },
  },
  {
    id: 'soft-blush',
    name: 'Soft Blush',
    category: 'minimal',
    columns: 1,
    preview: '🌸',
    colors: {
      bg: '#FFF5F5', card: '#FFFFFF', text: '#4A2C2A', textMuted: '#B08A87',
      accent: '#E8636F', accentFg: '#FFFFFF', border: '#F5D5D5',
      skillBg: '#FDE8E8', skillText: '#9B4D52',
    },
    style: {
      photoShape: 'circle', photoSize: 'lg', cardStyle: 'elevated', fontVibe: 'serif',
      headerAlign: 'center', linkStyle: 'pill', spacing: 'normal', borderRadius: 'full',
    },
  },

  // ─── BOLD (1–2 col) ──────────────────────────────
  {
    id: 'electric-blue',
    name: 'Electric Blue',
    category: 'bold',
    columns: 1,
    preview: '⚡',
    colors: {
      bg: '#0A1628', card: '#111D35', text: '#E8F0FE', textMuted: '#8BA3C7',
      accent: '#3B82F6', accentFg: '#FFFFFF', border: '#1E3050',
      skillBg: '#1A2A48', skillText: '#93C5FD',
    },
    style: {
      photoShape: 'rounded', photoSize: 'lg', cardStyle: 'glass', fontVibe: 'sans',
      headerAlign: 'center', linkStyle: 'button', spacing: 'normal', borderRadius: 'lg',
    },
  },
  {
    id: 'neon-green',
    name: 'Neon Matrix',
    category: 'bold',
    columns: 1,
    preview: '💚',
    colors: {
      bg: '#0A0F0A', card: '#0F1A0F', text: '#D4F5D4', textMuted: '#6DA86D',
      accent: '#22C55E', accentFg: '#000000', border: '#1A2E1A',
      skillBg: '#142814', skillText: '#4ADE80',
    },
    style: {
      photoShape: 'hexagon', photoSize: 'md', cardStyle: 'bordered', fontVibe: 'mono',
      headerAlign: 'center', linkStyle: 'button', spacing: 'compact', borderRadius: 'sm',
    },
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Fire',
    category: 'bold',
    columns: 2,
    preview: '🔥',
    colors: {
      bg: '#1A0A00', card: '#2A1508', text: '#FFE8D6', textMuted: '#C4956D',
      accent: '#F97316', accentFg: '#000000', border: '#3D2010',
      skillBg: '#2D1A0A', skillText: '#FDBA74',
    },
    style: {
      photoShape: 'rounded', photoSize: 'xl', cardStyle: 'gradient', fontVibe: 'display',
      headerAlign: 'left', linkStyle: 'button', spacing: 'normal', borderRadius: 'lg',
    },
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    category: 'bold',
    columns: 1,
    preview: '👑',
    colors: {
      bg: '#0D0520', card: '#15082E', text: '#E8D5FF', textMuted: '#A07DCF',
      accent: '#A855F7', accentFg: '#FFFFFF', border: '#2A1050',
      skillBg: '#1E0A3A', skillText: '#C084FC',
    },
    style: {
      photoShape: 'circle', photoSize: 'lg', cardStyle: 'glass', fontVibe: 'display',
      headerAlign: 'center', linkStyle: 'pill', spacing: 'spacious', borderRadius: 'full',
    },
  },
  {
    id: 'crimson-bold',
    name: 'Crimson',
    category: 'bold',
    columns: 1,
    preview: '❤️‍🔥',
    colors: {
      bg: '#1A0505', card: '#2A0A0A', text: '#FFD5D5', textMuted: '#C47070',
      accent: '#EF4444', accentFg: '#FFFFFF', border: '#3D1515',
      skillBg: '#2D0F0F', skillText: '#FCA5A5',
    },
    style: {
      photoShape: 'rounded', photoSize: 'md', cardStyle: 'bordered', fontVibe: 'sans',
      headerAlign: 'left', linkStyle: 'button', spacing: 'normal', borderRadius: 'md',
    },
  },

  // ─── CREATIVE (2–3 col) ──────────────────────────
  {
    id: 'gradient-dream',
    name: 'Gradient Dream',
    category: 'creative',
    columns: 2,
    preview: '🌈',
    colors: {
      bg: '#FAF5FF', card: '#FFFFFF', text: '#2E1065', textMuted: '#7C3AED',
      accent: '#8B5CF6', accentFg: '#FFFFFF', border: '#E9D5FF',
      skillBg: '#EDE9FE', skillText: '#6D28D9',
    },
    style: {
      photoShape: 'circle', photoSize: 'xl', cardStyle: 'elevated', fontVibe: 'display',
      headerAlign: 'center', linkStyle: 'pill', spacing: 'spacious', borderRadius: 'full',
    },
  },
  {
    id: 'retro-wave',
    name: 'Retro Wave',
    category: 'creative',
    columns: 2,
    preview: '🕹️',
    colors: {
      bg: '#0F0025', card: '#1A0038', text: '#FF6EC7', textMuted: '#B44E8D',
      accent: '#00FFFF', accentFg: '#000000', border: '#2A0055',
      skillBg: '#1F004A', skillText: '#00FFFF',
    },
    style: {
      photoShape: 'hexagon', photoSize: 'lg', cardStyle: 'glass', fontVibe: 'mono',
      headerAlign: 'center', linkStyle: 'button', spacing: 'normal', borderRadius: 'md',
    },
  },
  {
    id: 'candy-pop',
    name: 'Candy Pop',
    category: 'creative',
    columns: 3,
    preview: '🍬',
    colors: {
      bg: '#FFF0F5', card: '#FFFFFF', text: '#831843', textMuted: '#BE4D7E',
      accent: '#EC4899', accentFg: '#FFFFFF', border: '#FBCFE8',
      skillBg: '#FCE7F3', skillText: '#9D174D',
    },
    style: {
      photoShape: 'circle', photoSize: 'lg', cardStyle: 'elevated', fontVibe: 'display',
      headerAlign: 'center', linkStyle: 'pill', spacing: 'normal', borderRadius: 'full',
    },
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    category: 'creative',
    columns: 2,
    preview: '🌊',
    colors: {
      bg: '#F0F9FF', card: '#FFFFFF', text: '#0C4A6E', textMuted: '#0369A1',
      accent: '#0EA5E9', accentFg: '#FFFFFF', border: '#BAE6FD',
      skillBg: '#E0F2FE', skillText: '#0284C7',
    },
    style: {
      photoShape: 'rounded', photoSize: 'lg', cardStyle: 'elevated', fontVibe: 'sans',
      headerAlign: 'left', linkStyle: 'card', spacing: 'spacious', borderRadius: 'lg',
    },
  },
  {
    id: 'forest-moss',
    name: 'Forest Moss',
    category: 'creative',
    columns: 2,
    preview: '🌿',
    colors: {
      bg: '#F0FDF4', card: '#FFFFFF', text: '#14532D', textMuted: '#166534',
      accent: '#16A34A', accentFg: '#FFFFFF', border: '#BBF7D0',
      skillBg: '#DCFCE7', skillText: '#15803D',
    },
    style: {
      photoShape: 'rounded', photoSize: 'md', cardStyle: 'bordered', fontVibe: 'serif',
      headerAlign: 'left', linkStyle: 'card', spacing: 'normal', borderRadius: 'lg',
    },
  },

  // ─── CORPORATE (2–3 col) ─────────────────────────
  {
    id: 'executive-navy',
    name: 'Executive Navy',
    category: 'corporate',
    columns: 2,
    preview: '🏢',
    colors: {
      bg: '#F8FAFC', card: '#FFFFFF', text: '#0F172A', textMuted: '#475569',
      accent: '#1E40AF', accentFg: '#FFFFFF', border: '#CBD5E1',
      skillBg: '#DBEAFE', skillText: '#1E3A8A',
    },
    style: {
      photoShape: 'rounded', photoSize: 'md', cardStyle: 'bordered', fontVibe: 'sans',
      headerAlign: 'left', linkStyle: 'card', spacing: 'normal', borderRadius: 'md',
    },
  },
  {
    id: 'steel-gray',
    name: 'Steel Gray',
    category: 'corporate',
    columns: 2,
    preview: '⚙️',
    colors: {
      bg: '#F9FAFB', card: '#FFFFFF', text: '#111827', textMuted: '#6B7280',
      accent: '#4B5563', accentFg: '#FFFFFF', border: '#D1D5DB',
      skillBg: '#E5E7EB', skillText: '#374151',
    },
    style: {
      photoShape: 'square', photoSize: 'md', cardStyle: 'bordered', fontVibe: 'sans',
      headerAlign: 'left', linkStyle: 'card', spacing: 'compact', borderRadius: 'sm',
    },
  },
  {
    id: 'gold-prestige',
    name: 'Gold Prestige',
    category: 'corporate',
    columns: 2,
    preview: '✨',
    colors: {
      bg: '#FFFDF7', card: '#FFFFFF', text: '#1C1917', textMuted: '#78716C',
      accent: '#B45309', accentFg: '#FFFFFF', border: '#E7E5E4',
      skillBg: '#FEF3C7', skillText: '#92400E',
    },
    style: {
      photoShape: 'rounded', photoSize: 'lg', cardStyle: 'elevated', fontVibe: 'serif',
      headerAlign: 'center', linkStyle: 'card', spacing: 'spacious', borderRadius: 'lg',
    },
  },
  {
    id: 'consulting-pro',
    name: 'Consulting Pro',
    category: 'corporate',
    columns: 3,
    preview: '📊',
    colors: {
      bg: '#F1F5F9', card: '#FFFFFF', text: '#0F172A', textMuted: '#64748B',
      accent: '#0F766E', accentFg: '#FFFFFF', border: '#CBD5E1',
      skillBg: '#CCFBF1', skillText: '#115E59',
    },
    style: {
      photoShape: 'circle', photoSize: 'md', cardStyle: 'elevated', fontVibe: 'sans',
      headerAlign: 'left', linkStyle: 'card', spacing: 'normal', borderRadius: 'md',
    },
  },
  {
    id: 'law-firm',
    name: 'Law Firm',
    category: 'corporate',
    columns: 2,
    preview: '⚖️',
    colors: {
      bg: '#FAF9F6', card: '#FFFFFF', text: '#1C1917', textMuted: '#57534E',
      accent: '#44403C', accentFg: '#FFFFFF', border: '#D6D3D1',
      skillBg: '#E7E5E4', skillText: '#44403C',
    },
    style: {
      photoShape: 'rounded', photoSize: 'md', cardStyle: 'bordered', fontVibe: 'serif',
      headerAlign: 'left', linkStyle: 'underline', spacing: 'spacious', borderRadius: 'sm',
    },
  },

  // ─── ARTISTIC (1–3 col) ──────────────────────────
  {
    id: 'watercolor',
    name: 'Watercolor',
    category: 'artistic',
    columns: 1,
    preview: '🎨',
    colors: {
      bg: '#FFF8F0', card: '#FFFFFF', text: '#3D2914', textMuted: '#9B7A5A',
      accent: '#D97706', accentFg: '#FFFFFF', border: '#FDE68A',
      skillBg: '#FEF3C7', skillText: '#92400E',
    },
    style: {
      photoShape: 'circle', photoSize: 'xl', cardStyle: 'flat', fontVibe: 'display',
      headerAlign: 'center', linkStyle: 'pill', spacing: 'spacious', borderRadius: 'full',
    },
  },
  {
    id: 'brutalist',
    name: 'Brutalist',
    category: 'artistic',
    columns: 1,
    preview: '🏗️',
    colors: {
      bg: '#FFFFF0', card: '#FFFFFF', text: '#000000', textMuted: '#555555',
      accent: '#FF0000', accentFg: '#FFFFFF', border: '#000000',
      skillBg: '#FFFF00', skillText: '#000000',
    },
    style: {
      photoShape: 'square', photoSize: 'xl', cardStyle: 'bordered', fontVibe: 'mono',
      headerAlign: 'left', linkStyle: 'button', spacing: 'compact', borderRadius: 'none',
    },
  },
  {
    id: 'gallery-white',
    name: 'Gallery',
    category: 'artistic',
    columns: 3,
    preview: '🖼️',
    colors: {
      bg: '#FFFFFF', card: '#FAFAFA', text: '#1A1A1A', textMuted: '#757575',
      accent: '#1A1A1A', accentFg: '#FFFFFF', border: '#E0E0E0',
      skillBg: '#F5F5F5', skillText: '#424242',
    },
    style: {
      photoShape: 'rounded', photoSize: 'xl', cardStyle: 'flat', fontVibe: 'serif',
      headerAlign: 'center', linkStyle: 'underline', spacing: 'spacious', borderRadius: 'md',
    },
  },
  {
    id: 'pastel-dream',
    name: 'Pastel Dream',
    category: 'artistic',
    columns: 2,
    preview: '🧁',
    colors: {
      bg: '#FDF4FF', card: '#FFFFFF', text: '#581C87', textMuted: '#9333EA',
      accent: '#D946EF', accentFg: '#FFFFFF', border: '#F0ABFC',
      skillBg: '#FAE8FF', skillText: '#7E22CE',
    },
    style: {
      photoShape: 'circle', photoSize: 'lg', cardStyle: 'elevated', fontVibe: 'display',
      headerAlign: 'center', linkStyle: 'pill', spacing: 'normal', borderRadius: 'full',
    },
  },
  {
    id: 'terracotta',
    name: 'Terracotta',
    category: 'artistic',
    columns: 2,
    preview: '🏺',
    colors: {
      bg: '#FEF7ED', card: '#FFFFFF', text: '#431407', textMuted: '#9A3412',
      accent: '#C2410C', accentFg: '#FFFFFF', border: '#FDBA74',
      skillBg: '#FFEDD5', skillText: '#9A3412',
    },
    style: {
      photoShape: 'rounded', photoSize: 'lg', cardStyle: 'flat', fontVibe: 'serif',
      headerAlign: 'left', linkStyle: 'card', spacing: 'spacious', borderRadius: 'lg',
    },
  },

  // ─── DARK (1–2 col) ──────────────────────────────
  {
    id: 'midnight-dark',
    name: 'Midnight',
    category: 'dark',
    columns: 1,
    preview: '🌙',
    colors: {
      bg: '#09090B', card: '#18181B', text: '#FAFAFA', textMuted: '#A1A1AA',
      accent: '#F59E0B', accentFg: '#000000', border: '#27272A',
      skillBg: '#27272A', skillText: '#FDE68A',
    },
    style: {
      photoShape: 'circle', photoSize: 'lg', cardStyle: 'bordered', fontVibe: 'sans',
      headerAlign: 'center', linkStyle: 'card', spacing: 'normal', borderRadius: 'lg',
    },
  },
  {
    id: 'dark-ocean',
    name: 'Dark Ocean',
    category: 'dark',
    columns: 2,
    preview: '🐋',
    colors: {
      bg: '#020617', card: '#0F172A', text: '#E2E8F0', textMuted: '#64748B',
      accent: '#06B6D4', accentFg: '#000000', border: '#1E293B',
      skillBg: '#0C1A2E', skillText: '#22D3EE',
    },
    style: {
      photoShape: 'rounded', photoSize: 'lg', cardStyle: 'glass', fontVibe: 'sans',
      headerAlign: 'left', linkStyle: 'button', spacing: 'normal', borderRadius: 'lg',
    },
  },
  {
    id: 'dark-rose',
    name: 'Dark Rose',
    category: 'dark',
    columns: 1,
    preview: '🥀',
    colors: {
      bg: '#0C0008', card: '#1A0012', text: '#FFE4E6', textMuted: '#FB7185',
      accent: '#F43F5E', accentFg: '#FFFFFF', border: '#2D001A',
      skillBg: '#1F000F', skillText: '#FDA4AF',
    },
    style: {
      photoShape: 'circle', photoSize: 'lg', cardStyle: 'glass', fontVibe: 'serif',
      headerAlign: 'center', linkStyle: 'pill', spacing: 'spacious', borderRadius: 'full',
    },
  },
  {
    id: 'carbon-fiber',
    name: 'Carbon Fiber',
    category: 'dark',
    columns: 2,
    preview: '🖤',
    colors: {
      bg: '#0A0A0A', card: '#141414', text: '#E5E5E5', textMuted: '#737373',
      accent: '#FFFFFF', accentFg: '#000000', border: '#262626',
      skillBg: '#1A1A1A', skillText: '#D4D4D4',
    },
    style: {
      photoShape: 'square', photoSize: 'md', cardStyle: 'bordered', fontVibe: 'mono',
      headerAlign: 'left', linkStyle: 'button', spacing: 'compact', borderRadius: 'sm',
    },
  },
  {
    id: 'aurora-dark',
    name: 'Aurora',
    category: 'dark',
    columns: 1,
    preview: '🌌',
    colors: {
      bg: '#020014', card: '#0A0028', text: '#E0E7FF', textMuted: '#818CF8',
      accent: '#6366F1', accentFg: '#FFFFFF', border: '#1E1B4B',
      skillBg: '#1E1B4B', skillText: '#A5B4FC',
    },
    style: {
      photoShape: 'hexagon', photoSize: 'lg', cardStyle: 'glass', fontVibe: 'sans',
      headerAlign: 'center', linkStyle: 'pill', spacing: 'spacious', borderRadius: 'lg',
    },
  },


  // ─── VIDEOMAKER / CINEMA (1–2 col) ───────────────
  {
    id: 'netflix-dark',
    name: 'Netflix Dark',
    category: 'videomaker',
    columns: 1,
    preview: '🎬',
    colors: {
      bg: '#141414', card: '#1F1F1F', text: '#FFFFFF', textMuted: '#B3B3B3',
      accent: '#E50914', accentFg: '#FFFFFF', border: '#2A2A2A',
      skillBg: '#2A2A2A', skillText: '#E5E5E5',
    },
    style: {
      photoShape: 'rounded', photoSize: 'xl', cardStyle: 'glass', fontVibe: 'sans',
      headerAlign: 'left', linkStyle: 'button', spacing: 'spacious', borderRadius: 'md',
    },
  },
  {
    id: 'cinema-gold',
    name: 'Cinema Gold',
    category: 'videomaker',
    columns: 1,
    preview: '🏆',
    colors: {
      bg: '#0A0800', card: '#16120A', text: '#F5E6C8', textMuted: '#A89060',
      accent: '#D4AF37', accentFg: '#000000', border: '#2C2410',
      skillBg: '#1E1A0C', skillText: '#D4AF37',
    },
    style: {
      photoShape: 'rounded', photoSize: 'xl', cardStyle: 'bordered', fontVibe: 'display',
      headerAlign: 'left', linkStyle: 'button', spacing: 'spacious', borderRadius: 'lg',
    },
  },
  {
    id: 'director-cut',
    name: 'Director\'s Cut',
    category: 'videomaker',
    columns: 2,
    preview: '🎥',
    colors: {
      bg: '#0C0C0C', card: '#181818', text: '#F0F0F0', textMuted: '#888888',
      accent: '#FFFFFF', accentFg: '#000000', border: '#303030',
      skillBg: '#252525', skillText: '#E0E0E0',
    },
    style: {
      photoShape: 'square', photoSize: 'xl', cardStyle: 'bordered', fontVibe: 'mono',
      headerAlign: 'left', linkStyle: 'button', spacing: 'normal', borderRadius: 'none',
    },
  },
  {
    id: 'vhs-retro',
    name: 'VHS Retro',
    category: 'videomaker',
    columns: 1,
    preview: '📼',
    colors: {
      bg: '#120020', card: '#1E0030', text: '#FF66FF', textMuted: '#CC44CC',
      accent: '#00FFCC', accentFg: '#000000', border: '#330055',
      skillBg: '#2A0040', skillText: '#00FFCC',
    },
    style: {
      photoShape: 'rounded', photoSize: 'lg', cardStyle: 'glass', fontVibe: 'mono',
      headerAlign: 'center', linkStyle: 'button', spacing: 'normal', borderRadius: 'sm',
    },
  },
  {
    id: 'blockbuster',
    name: 'Blockbuster',
    category: 'videomaker',
    columns: 2,
    preview: '🎞️',
    colors: {
      bg: '#0E0E0E', card: '#1A1A1A', text: '#EEEEEE', textMuted: '#999999',
      accent: '#FF6B00', accentFg: '#FFFFFF', border: '#2D2D2D',
      skillBg: '#222222', skillText: '#FF9944',
    },
    style: {
      photoShape: 'rounded', photoSize: 'xl', cardStyle: 'elevated', fontVibe: 'display',
      headerAlign: 'left', linkStyle: 'button', spacing: 'spacious', borderRadius: 'lg',
    },
  },
];

export const templateCategories = [
  { id: 'minimal', label: 'Minimal', emoji: '⚪' },
  { id: 'bold', label: 'Bold', emoji: '⚡' },
  { id: 'creative', label: 'Creative', emoji: '🎨' },
  { id: 'corporate', label: 'Corporate', emoji: '🏢' },
  { id: 'artistic', label: 'Artistic', emoji: '🖼️' },
  { id: 'dark', label: 'Dark', emoji: '🌙' },
  { id: 'videomaker', label: 'Videomaker', emoji: '🎬' },
] as const;

export function getTemplateById(id: string): MiniSiteTemplate | undefined {
  return templates.find((t) => t.id === id);
}
