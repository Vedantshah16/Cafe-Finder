'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { DEMO_CAFES } from '@/lib/utils/helpers';
import CafeCard from '@/components/cafe/CafeCard';
import { CafeCardSkeleton } from '@/components/ui/Skeleton';
import type { Cafe } from '@/types';

export default function TrendingSection() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get('/api/cafes/trending');
        setCafes(data.data || DEMO_CAFES.filter((c) => c.is_trending || c.is_featured));
      } catch {
        setCafes(DEMO_CAFES.filter((c) => c.is_trending || c.is_featured));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section className="py-20 px-4 bg-surface/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <div className="flex items-center gap-2 text-accent text-sm font-medium mb-3">
              <TrendingUp size={16} />
              <span className="tracking-wider uppercase">Trending now</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">
              Cafes everyone's talking about
            </h2>
          </div>
          <Link
            href="/explore"
            className="hidden sm:flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors"
          >
            View all <ArrowRight size={14} />
          </Link>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <CafeCardSkeleton />
                </motion.div>
              ))
            : cafes.slice(0, 3).map((cafe, index) => (
                <motion.div
                  key={cafe.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <CafeCard cafe={cafe} />
                </motion.div>
              ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8 sm:hidden"
        >
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent-hover transition-colors"
          >
            View all cafes <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
