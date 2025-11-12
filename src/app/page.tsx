'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { imageConfigs } from './imageConfig';

const INTRO_HEIGHT = 250; // 250vh for intro (first image rotates)
const OUTRO_HEIGHT = 250; // 250vh for outro (last image rotates)
const SCROLL_PER_IMAGE = 0.5; // 50vh per image for middle images

const TEXTS = [
  "This is the Voyager Golden Record.",
  "In 1977, it was launched into space with the intention of portraying humanity to intelligent extraterrestrial life.",
  '"This is a present from a small, distant world, a token of our sounds, our science, our images, our music, our thoughts and our feelings. We are attempting to survive our time so we may live into yours."',
];

export default function Home() {
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Calculate total height for scroll container
  // Images: first (intro, index 0), middle (normal scroll, indices 1-58), last (outro, index 59)
  const middleImagesCount = imageConfigs.length - 2; // Exclude first and last
  const introHeight = INTRO_HEIGHT;
  const normalScrollHeight = middleImagesCount * SCROLL_PER_IMAGE * 100;
  const outroHeight = OUTRO_HEIGHT;
  const totalScrollHeight = introHeight + normalScrollHeight + outroHeight;

  // Scroll progress for entire container (0 to 1)
  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
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
  const backgroundOpacity = useTransform(
    introScrollProgress,
    [0.04, 0.08, 0.56, 0.8], // 10vh, 20vh, 140vh, 200vh out of 250vh
    [0, 0.5, 0.5, 0]
  );

  // Text sections with longer hold times and minimal overlap
  // Section 1: First 35% of intro
  const textSection1Opacity = useTransform(
    introScrollProgress,
    [0, 0.05, 0.30, 0.35], // 5% fade in, 25% hold, 5% fade out
    [0, 1, 1, 0]
  );

  // Section 2: Middle 35% of intro (30% to 65%)
  const textSection2Opacity = useTransform(
    introScrollProgress,
    [0.30, 0.35, 0.60, 0.65], // Overlaps slightly with section 1/3 for smooth transition
    [0, 1, 1, 0]
  );

  // Section 3: Last 35% of intro (60% to 95%)
  const textSection3Opacity = useTransform(
    introScrollProgress,
    [0.60, 0.65, 0.90, 0.95], // Ends before intro completes to avoid overlap with image sequence
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
  const [scrollVh, setScrollVh] = useState(0);
  const [scrollPhase, setScrollPhase] = useState<'intro' | 'normal' | 'outro'>('intro');

  // Handle image switching and phase detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const currentScrollVh = (scrollPosition / windowHeight) * 100;
      setScrollVh(currentScrollVh);

      // Hide indicator after any scroll
      // if (scrollPosition > 50) {
      //   setShowScrollIndicator(false);
      // }

      // Determine current phase
      const introEndVh = INTRO_HEIGHT;
      const normalEndVh = INTRO_HEIGHT + normalScrollHeight;

      if (currentScrollVh < introEndVh) {
        setScrollPhase('intro');
      } else if (currentScrollVh < normalEndVh) {
        setScrollPhase('normal');
        // Calculate image index for middle images (indices 1 to 58)
        const scrollAfterIntro = scrollPosition - (INTRO_HEIGHT / 100) * windowHeight;
        const scrollPerImage = windowHeight * SCROLL_PER_IMAGE;
        const middleImageIndex = Math.floor(scrollAfterIntro / scrollPerImage);
        // Map to actual image indices: 1 to 58
        const imageIndex = Math.min(middleImageIndex + 1, imageConfigs.length - 2);
        setCurrentImageIndex(imageIndex);
      } else {
        setScrollPhase('outro');
        setCurrentImageIndex(imageConfigs.length - 1); // Last image
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [normalScrollHeight]);

  return (
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
          // Determine visibility based on phase
          let isVisible = false;
          if (scrollPhase === 'intro' && index === 0) {
            isVisible = true; // First image during intro
          } else if (scrollPhase === 'normal' && index === currentImageIndex) {
            isVisible = true; // Middle images during normal scroll
          } else if (scrollPhase === 'outro' && index === imageConfigs.length - 1) {
            isVisible = true; // Last image during outro
          }

          // Determine if this image should rotate
          const isFirstImageRotating = index === 0 && scrollPhase === 'intro';
          const isLastImageRotating = index === imageConfigs.length - 1 && scrollPhase === 'outro';
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
                  opacity: isVisible ? 1 : 0,
                  pointerEvents: isVisible ? 'auto' : 'none',
                  transform,
                  transformOrigin: 'center center',
                  filter, // Add filter here
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
  );
}
