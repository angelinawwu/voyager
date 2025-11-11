'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { imageConfigs } from './imageConfig';

export default function Home() {
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollPerImage = window.innerHeight * 0.5; // 25vh per image
      
      // Calculate which image should be shown based on scroll position
      const imageIndex = Math.min(
        Math.floor(scrollPosition / scrollPerImage),
        imageConfigs.length - 1
      );
      
      setCurrentImageIndex(imageIndex);

      // Hide indicator after any scroll
      if (scrollPosition > 50) {
        setShowScrollIndicator(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Spacer div to enable scrolling - adjust multiplier to match scrollPerImage above */}
      <div style={{ height: `${imageConfigs.length * 50}vh` }} />

      {/* Fixed container that holds all overlaid images */}
      <div className="fixed inset-0 bg-black">
        {imageConfigs.map((config, index) => {
          const isVisible = currentImageIndex === index;
          
          return (
          <div
            key={config.src}
            className="absolute"
            style={{
              top: config.top,
              left: config.left,
              right: config.right,
              bottom: config.bottom,
              opacity: isVisible ? 1 : 0,
              pointerEvents: isVisible ? 'auto' : 'none',
              transform: `scale(${config.scale || 1})`,
              transformOrigin: 'center center',
            }}
          >
            <Image
              src={config.src}
              alt={config.alt}
              fill
              style={{ objectFit: config.objectFit }}
              priority={index === 0}
              quality={100}
            />
          </div>
          );
        })}
      </div>

      {/* Temporary Guide Circle - 100vh diameter */}
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
        style={{
          width: '100vh',
          height: '100vh',
          border: '2px solid rgba(255, 0, 0, 0.5)',
          borderRadius: '50%',
        }}
      />
      {/* Scroll Indicator */}
      <AnimatePresence>
        {showScrollIndicator && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 text-white text-sm font-light tracking-wide pointer-events-none z-50"
          >
            Scroll ↓
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
