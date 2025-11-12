export interface ImageConfig {
  src: string;
  alt: string;
  objectFit: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  scale?: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
}

// Generate all 60 AnimImage entries with centered 100vh configuration
export const imageConfigs: ImageConfig[] = Array.from({ length: 60 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  return {
    src: `/AnimImage/AnimImage-${num}.jpg`,
    alt: `Voyager Golden Record Image ${num}`,
    objectFit: 'contain' as const,
    scale: 1,
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
  };
});
