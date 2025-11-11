'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { imageConfigs } from './imageConfig';

const INTRO_PHASE_END = 100; // 100vh
const TRANSITION_PHASE_END = 200; // 200vh
const SCROLL_PER_IMAGE = 0.5; // 50vh per image after intro
// Rotate exactly 360 degrees over intro + transition phases (200vh)
const ROTATION_SPEED = 360 / TRANSITION_PHASE_END; // 1.8 degrees per vh

export default function Home() {
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [scrollPhase, setScrollPhase] = useState<'intro' | 'transition' | 'normal'>('intro');
  const [textOpacity, setTextOpacity] = useState(0);
  const [rotationAngle, setRotationAngle] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const scrollVh = (scrollPosition / windowHeight) * 100;

      // Determine scroll phase
      if (scrollVh < INTRO_PHASE_END) {
        setScrollPhase('intro');
        // Text fades in during intro phase (starts at 10vh, fully visible by 50vh)
        const textProgress = Math.max(0, Math.min(1, (scrollVh - 10) / 40));
        setTextOpacity(textProgress);
        // Rotation starts from first scroll
        setRotationAngle(scrollVh * ROTATION_SPEED);
      } else if (scrollVh < TRANSITION_PHASE_END) {
        setScrollPhase('transition');
        // Text fades out during transition (starts at 150vh, complete by 200vh)
        const textProgress = Math.max(0, Math.min(1, 1 - (scrollVh - 150) / 50));
        setTextOpacity(textProgress);
        // Rotation continues
        setRotationAngle(scrollVh * ROTATION_SPEED);
      } else {
        setScrollPhase('normal');
        setTextOpacity(0);
        // Normal scroll behavior - calculate image index
        const scrollAfterIntro = scrollPosition - (TRANSITION_PHASE_END / 100) * windowHeight;
        const scrollPerImage = windowHeight * SCROLL_PER_IMAGE;
        const imageIndex = Math.min(
          Math.floor(scrollAfterIntro / scrollPerImage),
          imageConfigs.length - 1
        );
        setCurrentImageIndex(imageIndex);
      }

      // Hide indicator after any scroll
      if (scrollPosition > 50) {
        setShowScrollIndicator(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Call once to set initial state
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate total spacer height: intro + transition + normal scroll
  const introHeight = TRANSITION_PHASE_END; // 200vh for intro + transition
  const normalScrollHeight = imageConfigs.length * SCROLL_PER_IMAGE * 100; // vh for images
  const totalHeight = introHeight + normalScrollHeight;

  return (
    <>
      {/* Spacer div to enable scrolling */}
      <div style={{ height: `${totalHeight}vh` }} />

      {/* Fixed container that holds all overlaid images */}
      <div className="fixed inset-0 bg-black">
        {imageConfigs.map((config, index) => {
          const isVisible = scrollPhase === 'normal' 
            ? currentImageIndex === index 
            : index === 0; // Show first image during intro/transition
          
          // Apply rotation only to first image during intro/transition phases
          const shouldRotate = index === 0 && scrollPhase !== 'normal';
          const transform = shouldRotate
            ? `scale(${config.scale || 1}) rotate(${rotationAngle}deg)`
            : `scale(${config.scale || 1})`;
          
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
                transform,
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

      {/* Introduction Text Background Overlay */}
      <AnimatePresence>
        {textOpacity > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: textOpacity }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 pointer-events-none z-30"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          />
        )}
      </AnimatePresence>

      {/* Introduction Text */}
      <AnimatePresence>
        {textOpacity > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: textOpacity }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-40 px-8"
          >
            <div className="max-w-3xl text-center text-white space-y-6">
              <p className="text-lg md:text-xl leading-relaxed font-light">
                This is the Voyager Golden Record.
              </p>
              <p className="text-base md:text-lg leading-relaxed font-light">
                In 1977, it was launched into space, with the intention of portraying humanity to intelligent extraterrestrial life.
              </p>
              <p className="text-base md:text-lg leading-relaxed font-light italic">
                &ldquo;This is a present from a small, distant world, a token of our sounds, our science, our images, our music, our thoughts and our feelings. We are attempting to survive our time so we may live into yours.&rdquo;
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
