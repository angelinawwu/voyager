'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface LandingPageProps {
  onEnter: () => void;
}

export default function LandingPage({ onEnter }: LandingPageProps) {
  return (
    <>
    {/* Background Image */}
    <div className="fixed w-full h-full z-50 scale-90">
        <Image src="/AnimImage/AnimImage-01.jpg" alt="Voyager Golden Record" fill className="object-contain" />
    </div>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.215, 0.61, 0.355, 1] }}
      className="fixed inset-0 flex bg-black/50 flex-col items-center justify-center z-50"
    >
      {/* Title */}
      {/* <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.215, 0.61, 0.355, 1] }}
        className="text-base font-light text-white text-center mb-6 tracking-wide"
      >
        The Voyager Golden Record
      </motion.h1> */}

      {/* Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease: [0.215, 0.61, 0.355, 1] }}
        onClick={onEnter}
        className="px-4 py-2 border border-white/50 text-white font-light tracking-wider
                   bg-black/50 hover:bg-black/20 hover:border-white/50 hover:backdrop-blur-xs hover:scale-[1.01] rounded-md transition-all duration-200 ease-out
                   backdrop-blur-[1px] text-xs active:scale-[0.98]"
      >
        enter here
      </motion.button>
    </motion.div>
    </>
  );
}

