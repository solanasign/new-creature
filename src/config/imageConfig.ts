// Image configuration for responsive loading and optimization
export interface ImageConfig {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  placeholder?: string;
}

// Responsive image breakpoints
export const IMAGE_SIZES = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Image quality settings
export const IMAGE_QUALITY = {
  low: 0.6,
  medium: 0.8,
  high: 0.9,
} as const;

// Critical images that should be loaded with high priority
export const PRIORITY_IMAGES = [
  'logo',
  'logowide',
  'home',
] as const;

// Generate responsive sizes string
export const generateSizes = (breakpoints: Record<string, string>): string => {
  return Object.entries(breakpoints)
    .map(([size, width]) => `(min-width: ${width}) ${width}`)
    .join(', ') + ', 100vw';
};

// Default responsive sizes for different image types
export const RESPONSIVE_SIZES = {
  hero: generateSizes({
    xs: '100vw',
    sm: '100vw',
    md: '50vw',
    lg: '40vw',
  }),
  card: generateSizes({
    xs: '100vw',
    sm: '50vw',
    md: '33vw',
    lg: '25vw',
  }),
  thumbnail: generateSizes({
    xs: '100vw',
    sm: '50vw',
    md: '25vw',
    lg: '20vw',
  }),
  logo: generateSizes({
    xs: '60px',
    sm: '80px',
    md: '100px',
    lg: '120px',
  }),
} as const;

// Image loading strategies
export const LOADING_STRATEGIES = {
  EAGER: 'eager', // Load immediately
  LAZY: 'lazy', // Load when in viewport
  PRIORITY: 'priority', // Load with high priority
} as const;

// Image format preferences (WebP first, then fallback)
export const IMAGE_FORMATS = ['webp', 'avif', 'jpg', 'png'] as const; 