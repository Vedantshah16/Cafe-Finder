'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { DEMO_CAFES, getCafePrimaryPhoto, formatDistance } from '@/lib/utils/helpers';
import { Rating } from '@/components/ui/Rating';
import { Badge, OpenBadge } from '@/components/ui/Badge';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils/helpers';

const featuredCafes = DEMO_CAFES.filter((c) => c.is_featured);

export default function FeaturedCafes() {
  const { favorites, toggleFavorite } = useAppStore();

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <div className="flex items-center gap-2 text-accent text-sm font-medium mb-3">
              <Sparkles size={16} />
              <span className="tracking-wider uppercase">AI Picks</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">
              Handpicked by our AI
            </h2>
            <p className="text-text-secondary mt-2 max-w-md">
              Expertly curated cafes based on thousands of real reviews and vibes.
            </p>
          </div>
          <Link
            href="/explore"
            className="hidden sm:flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors"
          >
            Explore all <ArrowRight size={14} />
          </Link>
        </motion.div>

        {/* Featured grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Large card */}
          {featuredCafes[0] && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Link href={`/cafe/${featuredCafes[0].place_id}`}>
                <div className="group relative h-[400px] rounded-3xl overflow-hidden bg-surface border border-border">
                  <Image
                    src={getCafePrimaryPhoto(featuredCafes[0])}
                    alt={featuredCafes[0].name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex gap-2 mb-3">
                      <Badge variant="accent">✦ AI Pick</Badge>
                      {featuredCafes[0].hours && (
                        <OpenBadge isOpen={featuredCafes[0].hours.open_now} />
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {featuredCafes[0].name}
                    </h3>
                    <p className="text-white/70 text-sm mb-3 line-clamp-1">
                      {featuredCafes[0].address}
                    </p>
                    <div className="flex items-center justify-between">
                      <Rating
                        rating={featuredCafes[0].rating}
                        count={featuredCafes[0].user_ratings_total}
                        size="md"
                      />
                      {featuredCafes[0].ai_summary && (
                        <p className="text-white/60 text-xs max-w-[200px] text-right hidden sm:block line-clamp-2">
                          {featuredCafes[0].ai_summary}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </Link>
            </motion.div>
          )}

          {/* Small cards */}
          <div className="flex flex-col gap-4">
            {featuredCafes.slice(1, 4).map((cafe, index) => (
              <motion.div
                key={cafe.id}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/cafe/${cafe.place_id}`}>
                  <div className="group flex gap-4 p-4 bg-surface border border-border rounded-2xl hover:border-accent/30 hover:bg-surface-elevated transition-all duration-300">
                    {/* Thumbnail */}
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden">
                      <Image
                        src={getCafePrimaryPhoto(cafe)}
                        alt={cafe.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
                          {cafe.name}
                        </h3>
                        {cafe.hours && <OpenBadge isOpen={cafe.hours.open_now} />}
                      </div>
                      <p className="text-text-muted text-xs truncate mb-2">{cafe.address}</p>
                      <div className="flex items-center gap-3">
                        <Rating rating={cafe.rating} count={cafe.user_ratings_total} size="sm" />
                        {cafe.distance && (
                          <span className="text-xs text-text-muted">
                            {formatDistance(cafe.distance)}
                          </span>
                        )}
                      </div>
                    </div>

                    <ArrowRight
                      size={16}
                      className="text-text-muted group-hover:text-accent flex-shrink-0 mt-1 transition-colors"
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
