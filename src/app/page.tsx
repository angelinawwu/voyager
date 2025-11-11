'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { imageConfigs } from './imageConfig';

const INTRO_TRANSITION_HEIGHT = 250; // 250vh for intro + transition
const SCROLL_PER_IMAGE = 0.5; // 50vh per image after intro

const TEXTS = [
  "This is the Voyager Golden Record.",
  "In 1977, it was launched into space, with the intention of portraying humanity to intelligent extraterrestrial life.",
  '"This is a present from a small, distant world, a token of our sounds, our science, our images, our music, our thoughts and our feelings. We are attempting to survive our time so we may live into yours."',
];

export default function Home() {
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Calculate total height for scroll container
  const introTransitionHeight = INTRO_TRANSITION_HEIGHT;
  const normalScrollHeight = imageConfigs.length * SCROLL_PER_IMAGE * 100;
  const totalScrollHeight = introTransitionHeight + normalScrollHeight;

  // Scroll progress for entire container (0 to 1)
  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
    offset: ['start start', 'end end'],
  });
  
  // Map scroll progress to intro/transition phase (0-1 over first 250vh)
  // When scrollYProgress reaches (introTransitionHeight / totalScrollHeight), intro is complete
  const introProgressRatio = introTransitionHeight / totalScrollHeight;
  const introScrollProgress = useTransform(
    scrollYProgress,
    [0, introProgressRatio],
    [0, 1],
    { clamp: true }
  );

  // Use intro scroll progress for animations (clamped to intro phase)
  // Background opacity: fades in early, stays visible, then fades out
  const backgroundOpacity = useTransform(
    introScrollProgress,
    [0.04, 0.08, 0.56, 0.8], // 10vh, 20vh, 140vh, 200vh out of 250vh
    [0, 0.5, 0.5, 0]
  );

  // Text section opacities - only one visible at a time
  // === Equal-duration scroll-based fades for all three text sections ===
  const sectionCount = 3;
  const sectionDuration = 1 / sectionCount; // each gets 1/3 of intro progress

  // helper to make uniform fade in/out ranges
  const fadeRange = (start: number) => [
    start,
    start + sectionDuration * 0.25,
    start + sectionDuration * 0.75,
    start + sectionDuration,
  ];

  const fadeValues = [0, 1, 1, 0]; // fade in, hold, fade out

  const textSection1Opacity = useTransform(introScrollProgress, fadeRange(0.0), fadeValues);
  const textSection2Opacity = useTransform(introScrollProgress, fadeRange(sectionDuration), fadeValues);
  const textSection3Opacity = useTransform(introScrollProgress, fadeRange(sectionDuration * 2), fadeValues);

  // Rotation: 360 degrees over intro/transition (0 to 1 scroll progress)
  const rotationAngle = useTransform(introScrollProgress, [0, 1], [0, 360]);
  
  // Transform for first image: combine scale and rotation
  const firstImageScale = imageConfigs[0]?.scale || 1;
  const firstImageTransform = useTransform(
    rotationAngle,
    (angle) => `scale(${firstImageScale}) rotate(${angle}deg)`
  );

  // Handle scroll position for image visibility
  const [scrollVh, setScrollVh] = useState(0);

  // Handle image switching after intro/transition
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const currentScrollVh = (scrollPosition / windowHeight) * 100;
      setScrollVh(currentScrollVh);

      // Hide indicator after any scroll
      if (scrollPosition > 50) {
        setShowScrollIndicator(false);
      }

      // Calculate image index after intro/transition
      if (currentScrollVh >= INTRO_TRANSITION_HEIGHT) {
        const scrollAfterIntro = scrollPosition - (INTRO_TRANSITION_HEIGHT / 100) * windowHeight;
        const scrollPerImage = windowHeight * SCROLL_PER_IMAGE;
        const imageIndex = Math.min(
          Math.floor(scrollAfterIntro / scrollPerImage),
          imageConfigs.length - 1
        );
        setCurrentImageIndex(imageIndex);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Scroll container - single container for useScroll to track */}
      <div
        ref={scrollContainerRef}
        className="relative"
        style={{ height: `${totalScrollHeight}vh` }}
      />

      {/* Fixed container that holds all overlaid images */}
      <div className="fixed inset-0 bg-black">
        {imageConfigs.map((config, index) => {
          const isInIntroPhase = scrollVh < INTRO_TRANSITION_HEIGHT;
          const isVisible = isInIntroPhase
            ? index === 0
            : currentImageIndex === index;

          // Apply rotation only to first image during intro/transition
          const shouldRotate = index === 0 && isInIntroPhase;
          const scaleValue = config.scale || 1;

          if (shouldRotate) {
            // First image with rotation - use motion.div with MotionValue transform
            return (
              <motion.div
                key={config.src}
                className="absolute"
                style={{
                  top: config.top,
                  left: config.left,
                  right: config.right,
                  bottom: config.bottom,
                  opacity: isVisible ? 1 : 0,
                  pointerEvents: isVisible ? 'auto' : 'none',
                  transform: firstImageTransform,
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
              </motion.div>
            );
          }

          // Other images - no rotation
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
                transform: `scale(${scaleValue})`,
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

      {/* Background overlay */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-30"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
