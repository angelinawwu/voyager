'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { imageConfigs } from './imageConfig';
import LandingPage from './LandingPage';

const INTRO_HEIGHT = 250; // 250vh for intro (first image rotates)
const OUTRO_HEIGHT = 250; // 250vh for outro (last image rotates)
const SCROLL_PER_IMAGE = 0.5; // 50vh per image for middle images

const TEXTS = [
  "This is the Voyager Golden Record.",
  "In 1977, it was launched into space with the intention of portraying humanity to intelligent extraterrestrial life.",
  '"This is a present from a small, distant world, a token of our sounds, our science, our images, our music, our thoughts and our feelings. We are attempting to survive our time so we may live into yours."',
];

export default function Home() {
  const [showLanding, setShowLanding] = useState(true);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Calculate total height for scroll container
  // Images: first (intro, index 0), middle (normal scroll, indices 1-58), last (outro, index 59)
  const middleImagesCount = imageConfigs.length - 2; // Exclude first and last
  const introHeight = INTRO_HEIGHT;
  const normalScrollHeight = middleImagesCount * SCROLL_PER_IMAGE * 100;
  const outroHeight = OUTRO_HEIGHT;
  const totalScrollHeight = introHeight + normalScrollHeight + outroHeight;

  // Scroll progress for entire container (0 to 1)
  // Only initialize when landing page is hidden
  const { scrollYProgress } = useScroll({
    target: showLanding ? undefined : scrollContainerRef,
    offset: ['start start', 'end end'],
  });
  
  // Map scroll progress to intro phase (0-1 over first 250vh)
  const introProgressRatio = introHeight / totalScrollHeight;
  const introScrollProgress = useTransform(
    scrollYProgress,
    [0, introProgressRatio],
    [0, 1],
    { clamp: true }
  );

  // Map scroll progress to outro phase (0-1 over last 250vh)
  const outroStart = (introHeight + normalScrollHeight) / totalScrollHeight;
  const outroScrollProgress = useTransform(
    scrollYProgress,
    [outroStart, 1],
    [0, 1],
    { clamp: true }
  );

  // Use intro scroll progress for animations (clamped to intro phase)
  // Background opacity: fades in early, stays visible, then fades out
  const introBackgroundOpacity = useTransform(
    introScrollProgress,
    [0.04, 0.08, 0.56, 0.8], // 10vh, 20vh, 140vh, 200vh out of 250vh
    [0, 0.5, 0.5, 0]
  );

  // Outro background opacity: fades in early, stays visible, then fades out
  const outroBackgroundOpacity = useTransform(
    outroScrollProgress,
    [0.04, 0.08, 0.80, 0.95], // Similar timing to intro
    [0, 0.5, 0.5, 0]
  );

  // Combined background opacity (intro + outro)
  const backgroundOpacity = useTransform(
    [introBackgroundOpacity, outroBackgroundOpacity],
    ([intro, outro]) => Math.max(intro as number, outro as number)
  );

  // Text sections with longer hold times and minimal overlap
  // Section 1: First 35% of intro
  const textSection1Opacity = useTransform(
    introScrollProgress,
    [0, 0.05, 0.30, 0.35], // 5% fade in, 25% hold, 5% fade out
    [0, 1, 1, 0]
  );

  // Section 2: Last part of intro (extends longer since section 3 moved to outro)
  const textSection2Opacity = useTransform(
    introScrollProgress,
    [0.30, 0.35, 0.90, 0.95], // Extended hold time, ends before intro completes
    [0, 1, 1, 0]
  );

  // Section 3: Outro text (appears with last rotating image)
  const textSection3Opacity = useTransform(
    outroScrollProgress,
    [0, 0.05, 0.90, 0.95], // Fades in early during outro, holds, then fades out near end
    [0, 1, 1, 0]
  );

  // Rotation for first image: 360 degrees over intro phase
  const introRotationAngle = useTransform(introScrollProgress, [0, 1], [0, 360]);
  const firstImageScale = imageConfigs[0]?.scale || 1;
  const firstImageTransform = useTransform(
    introRotationAngle,
    (angle) => `scale(${firstImageScale}) rotate(${angle}deg)`
  );

  // Rotation for last image: 360 degrees over outro phase
  const outroRotationAngle = useTransform(outroScrollProgress, [0, 1], [0, 360]);
  const lastImageScale = imageConfigs[imageConfigs.length - 1]?.scale || 1;
  const lastImageTransform = useTransform(
    outroRotationAngle,
    (angle) => `scale(${lastImageScale}) rotate(${angle}deg)`
  );

  // Handle scroll position for image visibility and phase tracking
  const [scrollState, setScrollState] = useState<{
    phase: 'intro' | 'normal' | 'outro';
    imageIndex: number;
    scrollVh: number;
  }>({
    phase: 'intro',
    imageIndex: 0,
    scrollVh: 0,
  });

  // Then extract the values:
  const { imageIndex: currentImageIndex } = scrollState;

  // Refs for audio functionality
  const previousImageIndexRef = useRef<number>(-1);
  const clickAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    clickAudioRef.current = new Audio('/Click.wav');
    clickAudioRef.current.volume = 0.5; // Set volume (0.0 to 1.0)
    return () => {
      if (clickAudioRef.current) {
        clickAudioRef.current.pause();
        clickAudioRef.current = null;
      }
    };
  }, []);

  // Play click sound when image index changes
  useEffect(() => {
    // Don't play sound on initial load
    if (previousImageIndexRef.current === -1) {
      previousImageIndexRef.current = currentImageIndex;
      return;
    }

    // Only play sound if image actually changed
    if (previousImageIndexRef.current !== currentImageIndex && clickAudioRef.current) {
      // Reset audio to start and play
      clickAudioRef.current.currentTime = 0;
      clickAudioRef.current.play().catch((error) => {
        // Ignore errors (e.g., user hasn't interacted with page yet)
        console.log('Audio play failed:', error);
      });
    }

    previousImageIndexRef.current = currentImageIndex;
  }, [currentImageIndex]);

  // Handle image switching and phase detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const currentScrollVh = (scrollPosition / windowHeight) * 100;

      // Determine current phase and image index
      const introEndVh = INTRO_HEIGHT;
      const normalEndVh = INTRO_HEIGHT + normalScrollHeight;
      let newImageIndex: number;
      let newScrollPhase: 'intro' | 'normal' | 'outro';

      // Add small epsilon for floating point comparison
      const epsilon = 0.01;

      if (currentScrollVh < introEndVh - epsilon) {
        newScrollPhase = 'intro';
        newImageIndex = 0; // First image during intro
      } else if (currentScrollVh < normalEndVh - epsilon) {
        newScrollPhase = 'normal';
        // Calculate image index for middle images (indices 1 to 58)
        const scrollAfterIntro = scrollPosition - (INTRO_HEIGHT / 100) * windowHeight;
        const scrollPerImage = windowHeight * SCROLL_PER_IMAGE;
        const middleImageIndex = Math.floor(scrollAfterIntro / scrollPerImage);
        // Map to actual image indices: 1 to 58
        // Clamp to valid range
        newImageIndex = Math.min(Math.max(1, middleImageIndex + 1), imageConfigs.length - 2);
      } else {
        newScrollPhase = 'outro';
        newImageIndex = imageConfigs.length - 1; // Last image
      }

      // Update all scroll state atomically
      setScrollState({
        phase: newScrollPhase,
        imageIndex: newImageIndex,
        scrollVh: currentScrollVh,
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [normalScrollHeight]);

  return (
    <>
      <AnimatePresence mode="wait">
        {showLanding && (
          <LandingPage onEnter={() => setShowLanding(false)} />
        )}
      </AnimatePresence>

      {!showLanding && (
        <>
          {/* Grain filter overlay */}
          <div className="fixed w-full h-full mix-blend-overlay z-999">
            <Image src="/GrainFilter.jpg" alt="Grain Filter" fill className="object-cover" />
          </div>

      {/* Scroll container - single container for useScroll to track */}
      <div
        ref={scrollContainerRef}
        className="relative"
        style={{ height: `${totalScrollHeight}vh` }}
      />

      {/* Fixed container that holds all overlaid images */}
      <div className="fixed inset-0 bg-black">
        {imageConfigs.map((config, index) => {
          // Determine visibility based on current image index (which is always synced with scroll)
          // This ensures images show correctly even when scrolling back up
          const isVisible = index === currentImageIndex;

          // Determine if this image should rotate
          // Important: Check if image is visible AND if it's the first/last image, regardless of exact phase
          const isFirstImage = index === 0;
          const isLastImage = index === imageConfigs.length - 1;
          const isFirstImageRotating = isFirstImage && isVisible;
          const isLastImageRotating = isLastImage && isVisible;
          const shouldRotate = isFirstImageRotating || isLastImageRotating;
          const scaleValue = config.scale || 1;
          
          // Apply filters to middle images (not first or last)
          const isMiddleImage = index > 0 && index < imageConfigs.length - 1;
          const filter = isMiddleImage 
            ? 'grayscale(80%) blur(1px)' // Combine multiple filters here if needed
            : 'none';

          if (shouldRotate) {
            // First or last image with rotation - use motion.div with MotionValue transform
            const transform = isFirstImageRotating ? firstImageTransform : lastImageTransform;
            return (
              <motion.div
                key={config.src}
                className="absolute"
                style={{
                  top: config.top,
                  left: config.left,
                  right: config.right,
                  bottom: config.bottom,
                  pointerEvents: isVisible ? 'auto' : 'none',
                  transform,
                  transformOrigin: 'center center',
                  filter, // Add filter here
                }}
                animate={{
                  opacity: isVisible ? 1 : 0,
                }}
                transition={{
                  duration: 0.05, // Very quick fade (50ms) to match middle images
                  ease: 'easeOut',
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
              </motion.div>
            );
          }

          // Middle images - no rotation
          return (
            <motion.div
              key={config.src}
              className="absolute"
              style={{
                top: config.top,
                left: config.left,
                right: config.right,
                bottom: config.bottom,
                pointerEvents: isVisible ? 'auto' : 'none',
                transform: `scale(${scaleValue})`,
                transformOrigin: 'center center',
                filter,
              }}
              animate={{
                opacity: isVisible ? 1 : 0,
              }}
              transition={{
                duration: 0.05, // Very quick fade (150ms)
                ease: 'easeOut', // Smooth but quick transition
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
            </motion.div>
          );
        })}
      </div>

      {/* Background overlay */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-30"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          opacity: backgroundOpacity,
        }}
      />

      {/* Introduction Text - All sections overlap in the same centered position */}
      <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center">
        <motion.p
          style={{ opacity: textSection1Opacity }}
          className="absolute text-lg md:text-xl leading-relaxed font-light text-center text-white max-w-3xl px-8"
        >
          {TEXTS[0]}
        </motion.p>

        <motion.p
          style={{ opacity: textSection2Opacity }}
          className="absolute text-base md:text-lg leading-relaxed font-light text-center text-white max-w-3xl px-8"
        >
          {TEXTS[1]}
        </motion.p>

        <motion.p
          style={{ opacity: textSection3Opacity }}
          className="absolute text-base md:text-lg leading-relaxed font-light italic text-center text-white max-w-3xl px-8"
        >
          {TEXTS[2]}
        </motion.p>
      </div>

      {/* Vignette effect - darken and blur outside 100vh circle */}
      <div
        className="fixed inset-0 pointer-events-none z-20"
        style={{
          background: 'radial-gradient(circle at center, transparent 45vh, rgba(0, 0, 0, 0.4) 48vh, rgba(0, 0, 0, 0.7) 52vh, black 65vh)',
        }}
      />
      
      {/* Blur effect only outside 100vh circle */}
      <div
        className="fixed inset-0 pointer-events-none z-20"
        style={{
          backdropFilter: 'blur(10px)',
          WebkitMaskImage: 'radial-gradient(circle at center, transparent 48vh, black 52vh)',
          maskImage: 'radial-gradient(circle at center, transparent 48vh, black 52vh)',
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
      )}
    </>
  );
}
