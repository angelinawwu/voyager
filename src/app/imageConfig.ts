// Image configuration with individual layout and scaling settings
export interface ImageConfig {
  src: string;
  alt: string;
  objectFit: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  scale?: number; // Scale factor (1 = 100%, 0.5 = 50%, 1.5 = 150%, etc.)
  top?: string; // e.g., '0px', '10%', '50px'
  left?: string; // e.g., '0px', '10%', '50px'
  right?: string; // e.g., '0px', '10%', '50px'
  bottom?: string; // e.g., '0px', '10%', '50px'
}

/*
  CONFIGURATION GUIDE:
  
  - objectFit: How the image fits within its container
    - 'contain': Scale to fit within container (maintains aspect ratio, may have empty space)
    - 'cover': Scale to fill entire container (maintains aspect ratio, may crop)
    - 'fill': Stretch to fill container (may distort)
    - 'scale-down': Same as contain but won't scale up beyond original size
    - 'none': Display at original size (may overflow or be too small)
  
  - scale: Multiplier for size (1 = 100%, 0.5 = 50%, 2 = 200%, etc.)
  
  - top/left/right/bottom: CSS positioning values
    - Use '0' to anchor to an edge
    - Combine top + bottom OR left + right to stretch the image
    - Examples:
      - top: '0', left: '0', right: '0', bottom: '0' → fills viewport
      - top: '0', left: '0' → anchors to top-left, natural size
      - left: '0', right: '0', bottom: '0' → fills width, anchors to bottom
      - top: '10%', left: '20%' → positioned 10% from top, 20% from left
    - Leave undefined to center on that axis
*/

export const imageConfigs: ImageConfig[] = [
  {
    src: '/images/Voyager_Golden_Record_fx.png',
    alt: 'Voyager Golden Record',
    objectFit: 'contain',
    scale: 1,
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
  },
  {
    src: '/images/007.png',
    alt: 'Image 007',
    objectFit: 'contain',
    scale: 2.65,
    top: '-65%',
    left: '48%',
    right: '-48%',
    bottom: '65%',
  },
  {
    src: '/images/029.png',
    alt: 'Image 029',
    objectFit: 'contain',
    scale: 2.24,
    top: '-11%',
    left: '-40%',
    right: '40%',
    bottom: '11%',
  },
  {
    src: '/images/calibration-circle-31325346536-o.webp',
    alt: 'Calibration Circle',
    objectFit: 'contain',
    scale: 1.05,
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
  },
  {
    src: '/images/chemical-definitions-31218371762-o.webp',
    alt: 'Chemical Definitions',
    objectFit: 'contain',
    scale: 4.25,
    top: '-136%',
    left: '98%',
    right: '-98%',
    bottom: '136%',
  },
  {
    src: '/images/earth-31326146966-o.webp',
    alt: 'Earth',
    objectFit: 'contain',
    scale: 1.4,
    top: '13%',
    left: '-3%',
    right: '3%',
    bottom: '-13%',
  },
  {
    src: '/images/jupiter-31325748356-o.webp',
    alt: 'Jupiter',
    objectFit: 'contain',
    scale: 1.45,
    top: '11%',
    left: '-3%',
    right: '3%',
    bottom: '-11%',
  },
  {
    src: '/images/page-of-book-newton-system-of-the-world-31297500982-o.webp',
    alt: 'Newton System of the World',
    objectFit: 'contain',
    scale: 4.65,
    top: '39%',
    left: '-48%',
    right: '48%',
    bottom: '-39%',
  },
  {
    src: '/images/structure-of-earth-31247834881-o.webp',
    alt: 'Structure of Earth',
    objectFit: 'contain',
    scale: 1,
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
  },
];

