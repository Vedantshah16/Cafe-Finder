'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MOOD_CONFIG } from '@/lib/utils/helpers';
import { useAppStore } from '@/store/useAppStore';
import type { Mood } from '@/types';
import { cn } from '@/lib/utils/helpers';

const MOODS: Mood[] = ['romantic', 'work', 'chill', 'social', 'study', 'date', 'quick'];

export default function MoodSelector() {
  const { currentMood, setMood } = useAppStore();
  const router = useRouter();

  const handleMoodSelect = (mood: Mood) => {
    setMood(mood);
    const config = MOOD_CONFIG[mood];
    router.push(`/explore?mood=${mood}&q=${encodeURIComponent(config.searchHint)}`);
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-accent text-sm font-medium mb-3 tracking-wider uppercase">
            Discover by mood
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            What are you feeling today?
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Our AI adapts to your vibe — pick a mood and we'll surface cafes that match perfectly.
          </p>
        </motion.div>

        {/* Mood grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {MOODS.map((mood, index) => {
            const config = MOOD_CONFIG[mood];
            const isSelected = currentMood === mood;

            return (
              <motion.button
                key={mood}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.07 }}
                whileHover={{ scale: 1.04, y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleMoodSelect(mood)}
                className={cn(
                  'relative flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-300 overflow-hidden group',
                  isSelected
                    ? 'border-transparent shadow-lg'
                    : 'border-border bg-surface hover:border-border-strong hover:bg-surface-elevated'
                )}
                style={
                  isSelected
                    ? {
                        background: `linear-gradient(135deg, ${config.color}20, ${config.color}10)`,
                        borderColor: `${config.color}40`,
                        boxShadow: `0 0 20px ${config.color}20`,
                      }
                    : {}
                }
              >
                {/* Background glow on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${config.color}15, transparent 70%)`,
                  }}
                />

                {/* Emoji */}
                <motion.span
                  animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.4 }}
                  className="text-3xl relative z-10"
                >
                  {config.emoji}
                </motion.span>

                {/* Label */}
                <span
                  className={cn(
                    'text-sm font-medium relative z-10 transition-colors duration-200',
                    isSelected ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'
                  )}
                  style={isSelected ? { color: config.color } : {}}
                >
                  {config.label}
                </span>

                {/* Active indicator */}
                {isSelected && (
                  <motion.div
                    layoutId="mood-indicator"
                    className="absolute bottom-2 w-4 h-0.5 rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
