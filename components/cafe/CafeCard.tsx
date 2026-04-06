'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, MapPin, Wifi, Trees, Zap } from 'lucide-react';
import { cn, getCafePrimaryPhoto, formatDistance, formatPriceLevel } from '@/lib/utils/helpers';
import { Rating } from '@/components/ui/Rating';
import { Badge, OpenBadge, TrendingBadge } from '@/components/ui/Badge';
import { useAppStore } from '@/store/useAppStore';
import type { Cafe } from '@/types';
import toast from 'react-hot-toast';

interface CafeCardProps {
  cafe: Cafe;
  compact?: boolean;
  highlighted?: boolean;
  onSelect?: (cafe: Cafe) => void;
}

export default function CafeCard({ cafe, compact = false, highlighted = false, onSelect }: CafeCardProps) {
  const { toggleFavorite, isFavorite } = useAppStore();
  const [imgError, setImgError] = useState(false);
  const isFav = isFavorite(cafe.place_id);
  const photoUrl = imgError
    ? 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80'
    : getCafePrimaryPhoto(cafe);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(cafe.place_id);
    toast.success(isFav ? 'Removed from favorites' : 'Saved to favorites!', {
      duration: 2000,
      style: {
        background: '#1A1A1A',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.08)',
      },
    });
  };

  const content = (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.25 }}
      onClick={() => onSelect?.(cafe)}
      className={cn(
        'group relative bg-surface border rounded-3xl overflow-hidden transition-all duration-300',
        highlighted
          ? 'border-accent/50 shadow-accent'
          : 'border-border hover:border-accent/30 hover:shadow-card-hover shadow-card',
        compact ? 'flex gap-3 p-3' : ''
      )}
    >
      {/* Image */}
      <div className={cn('relative overflow-hidden flex-shrink-0', compact ? 'w-20 h-20 rounded-2xl' : 'h-52 w-full')}>
        <Image
          src={photoUrl}
          alt={cafe.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          onError={() => setImgError(true)}
          sizes={compact ? '80px' : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
        />
        {!compact && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}

        {/* Badges on image */}
        {!compact && (
          <div className="absolute top-3 left-3 flex gap-1.5">
            {cafe.is_trending && <TrendingBadge />}
            {cafe.is_featured && <Badge variant="accent">✦ Featured</Badge>}
          </div>
        )}

        {/* AI score badge */}
        {cafe.ai_score && cafe.ai_score >= 90 && !compact && (
          <div className="absolute top-3 right-3">
            <Badge variant="accent" className="gap-1">
              <Zap size={10} fill="currentColor" />
              Top match
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={cn('flex flex-col', compact ? 'flex-1 min-w-0 justify-center' : 'p-5')}>
        {/* Name & Favorite */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3
            className={cn(
              'font-semibold text-text-primary group-hover:text-accent transition-colors leading-tight',
              compact ? 'text-sm' : 'text-base',
              'line-clamp-1'
            )}
          >
            {cafe.name}
          </h3>
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={handleFavorite}
            className={cn(
              'flex-shrink-0 p-1.5 rounded-lg transition-all duration-200',
              isFav
                ? 'text-red-400 bg-red-500/10'
                : 'text-text-muted hover:text-red-400 hover:bg-red-500/10'
            )}
          >
            <Heart size={compact ? 14 : 16} fill={isFav ? 'currentColor' : 'none'} />
          </motion.button>
        </div>

        {/* Address */}
        <div className="flex items-center gap-1 mb-2">
          <MapPin size={11} className="text-text-muted flex-shrink-0" />
          <span className="text-xs text-text-muted truncate">{cafe.address}</span>
        </div>

        {/* Rating & price */}
        <div className="flex items-center gap-3 mb-3">
          <Rating rating={cafe.rating} count={compact ? undefined : cafe.user_ratings_total} size="sm" />
          <span className="text-xs text-text-muted">
            {formatPriceLevel(cafe.price_level)}
          </span>
          {cafe.distance && (
            <span className="text-xs text-text-muted">{formatDistance(cafe.distance)}</span>
          )}
        </div>

        {/* Tags */}
        {!compact && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {cafe.hours && <OpenBadge isOpen={cafe.hours.open_now} />}
            {cafe.amenities.wifi && (
              <Badge variant="outline" className="gap-1">
                <Wifi size={10} />
                WiFi
              </Badge>
            )}
            {cafe.amenities.outdoor_seating && (
              <Badge variant="outline" className="gap-1">
                <Trees size={10} />
                Outdoor
              </Badge>
            )}
          </div>
        )}

        {/* AI summary */}
        {cafe.ai_summary && !compact && (
          <p className="mt-3 text-xs text-text-muted line-clamp-2 leading-relaxed">
            {cafe.ai_summary}
          </p>
        )}
      </div>

      {/* Hover glow */}
      <div className="absolute inset-0 rounded-3xl bg-card-glow opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );

  if (onSelect) return content;

  return (
    <Link href={`/cafe/${cafe.place_id}`} className="block">
      {content}
    </Link>
  );
}
