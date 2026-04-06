'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, MapPin, TrendingUp } from 'lucide-react';
import SearchBar from './SearchBar';

const STATS = [
  { label: 'Cafes Listed', value: '12,000+' },
  { label: 'Cities Covered', value: '80+' },
  { label: 'Happy Visitors', value: '500K+' },
];

const FLOATING_TAGS = [
  { emoji: '💻', label: 'Work-friendly', delay: 0 },
  { emoji: '🌿', label: 'Outdoor seating', delay: 0.2 },
  { emoji: '🎵', label: 'Live music', delay: 0.4 },
  { emoji: '🐾', label: 'Pet-friendly', delay: 0.6 },
  { emoji: '📚', label: 'Quiet zone', delay: 0.8 },
  { emoji: '🌙', label: 'Late night', delay: 1.0 },
];

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[95vh] flex flex-col items-center justify-center px-4 pt-20 pb-32 overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-accent/3 rounded-full blur-[80px] pointer-events-none" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(212,168,83,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,83,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 flex flex-col items-center text-center max-w-4xl"
      >
        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2 bg-accent-light border border-accent/30 text-accent text-sm font-medium px-4 py-2 rounded-full mb-8"
        >
          <Sparkles size={14} />
          <span>AI-Powered Cafe Discovery</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold text-text-primary leading-[1.1] tracking-tight mb-6"
        >
          Find your{' '}
          <span className="relative">
            <span className="text-accent">perfect</span>
            <motion.svg
              className="absolute -bottom-2 left-0 w-full"
              viewBox="0 0 300 12"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              <path
                d="M2 8 Q75 2 150 8 Q225 14 298 8"
                stroke="#D4A853"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
            </motion.svg>
          </span>
          {' '}cafe{' '}
          <br className="hidden sm:block" />
          with AI
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="text-lg sm:text-xl text-text-secondary max-w-2xl leading-relaxed mb-10"
        >
          Tell us your mood, and our AI finds the cafe that matches — whether you need
          a quiet workspace, a romantic spot, or the best espresso in town.
        </motion.p>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="w-full max-w-2xl mb-10"
        >
          <SearchBar variant="hero" />
        </motion.div>

        {/* Floating suggestion tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-2 mb-14"
        >
          {FLOATING_TAGS.map(({ emoji, label, delay }) => (
            <motion.button
              key={label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.7 + delay }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="flex items-center gap-1.5 bg-surface/80 backdrop-blur-sm border border-border hover:border-accent/30 hover:bg-accent-light text-sm text-text-secondary hover:text-accent px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer"
              onClick={() => {
                const event = new CustomEvent('hero-search', { detail: label });
                window.dispatchEvent(event);
              }}
            >
              <span>{emoji}</span>
              {label}
            </motion.button>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="flex items-center gap-8 sm:gap-16"
        >
          {STATS.map(({ label, value }, i) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="text-2xl sm:text-3xl font-bold text-accent">{value}</span>
              <span className="text-xs text-text-muted">{label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-text-muted">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-5 h-8 border border-border-strong rounded-full flex items-start justify-center pt-1.5"
        >
          <div className="w-1 h-2 bg-accent rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
