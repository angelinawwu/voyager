'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'

export default function Page() {
  const scrollRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ['start start', 'end end'],
  })

  // === Intro image and background transitions ===
  const introScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.15])
  const introOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0])
  const backgroundOpacity = useTransform(scrollYProgress, [0.35, 0.6], [0, 1])

  // === Scroll-based text opacity per section ===
  // Adjust thresholds so only one section shows clearly at a time
  const textSection1Opacity = useTransform(scrollYProgress, [0.00, 0.15, 0.25], [1, 1, 0])
  const textSection2Opacity = useTransform(scrollYProgress, [0.20, 0.35, 0.45], [0, 1, 0])
  const textSection3Opacity = useTransform(scrollYProgress, [0.40, 0.55, 0.65], [0, 1, 1])

  return (
    <div ref={scrollRef} className="relative h-[300vh] bg-black text-white overflow-x-hidden">
      {/* === Intro Image === */}
      <motion.div
        style={{ scale: introScale, opacity: introOpacity }}
        className="fixed inset-0 z-0 flex items-center justify-center"
      >
        <Image
          src="/earth-from-space.jpg"
          alt="Earth from space"
          fill
          className="object-cover"
          priority
        />
      </motion.div>

      {/* === Fading Background Layer === */}
      <motion.div
        className="fixed inset-0 z-10 bg-[#0a0a0a]"
        style={{ opacity: backgroundOpacity }}
      />

      {/* === Centered Scroll-Based Text === */}
      <div className="fixed inset-0 flex items-center justify-center z-20 text-3xl md:text-5xl text-center leading-snug pointer-events-none">
        <motion.p
          style={{ opacity: textSection1Opacity }}
          className="absolute max-w-3xl px-4"
        >
          We step out of the spacecraft and look back.
        </motion.p>

        <motion.p
          style={{ opacity: textSection2Opacity }}
          className="absolute max-w-3xl px-4"
        >
          The pale blue dot is suspended in the vast cosmic dark.
        </motion.p>

        <motion.p
          style={{ opacity: textSection3Opacity }}
          className="absolute max-w-3xl px-4"
        >
          This is a present from a small, distant world, humbly offering peace.
        </motion.p>
      </div>
    </div>
  )
}
