'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ThumbsUp, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';
import { StarRow } from '@/components/ui/Rating';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/helpers';
import type { CafeReview } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface CafeReviewsProps {
  reviews: CafeReview[];
  sentimentScore?: number;
  highlights?: string[];
  concerns?: string[];
}

export default function CafeReviews({
  reviews,
  sentimentScore,
  highlights = [],
  concerns = [],
}: CafeReviewsProps) {
  const [expanded, setExpanded] = useState(false);
  const displayReviews = expanded ? reviews : reviews.slice(0, 3);

  const sentimentLabel =
    sentimentScore !== undefined
      ? sentimentScore > 0.5
        ? 'Very Positive'
        : sentimentScore > 0
        ? 'Mostly Positive'
        : sentimentScore < -0.3
        ? 'Mixed'
        : 'Neutral'
      : null;

  return (
    <div className="space-y-6">
      {/* Sentiment analysis */}
      {(highlights.length > 0 || concerns.length > 0) && (
        <div className="bg-surface-elevated border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-semibold text-text-primary">AI Sentiment Analysis</span>
            {sentimentLabel && (
              <Badge variant={sentimentScore! > 0 ? 'success' : 'warning'}>
                {sentimentLabel}
              </Badge>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {highlights.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-green-400 text-xs font-medium mb-2">
                  <TrendingUp size={12} />
                  Guests love
                </div>
                <ul className="space-y-1">
                  {highlights.map((h, i) => (
                    <li key={i} className="text-xs text-text-secondary flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {concerns.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-yellow-400 text-xs font-medium mb-2">
                  <TrendingDown size={12} />
                  Some note
                </div>
                <ul className="space-y-1">
                  {concerns.map((c, i) => (
                    <li key={i} className="text-xs text-text-secondary flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reviews */}
      {reviews.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-8">
          No reviews yet. Be the first to review!
        </p>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {displayReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-surface-elevated border border-border rounded-2xl p-5"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden bg-surface flex-shrink-0">
                    {review.author_photo ? (
                      <Image
                        src={review.author_photo}
                        alt={review.author_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-accent font-semibold text-sm bg-accent-light">
                        {review.author_name[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-text-primary truncate">
                        {review.author_name}
                      </span>
                      <span className="text-xs text-text-muted flex-shrink-0">
                        {review.relative_time_description}
                      </span>
                    </div>
                    <StarRow rating={review.rating} size={12} />
                  </div>
                </div>

                {/* Review text */}
                <ExpandableText text={review.text} />

                {/* Sentiment badge */}
                {review.sentiment && (
                  <div className="mt-3">
                    <Badge
                      variant={
                        review.sentiment === 'positive'
                          ? 'success'
                          : review.sentiment === 'negative'
                          ? 'danger'
                          : 'default'
                      }
                      size="sm"
                    >
                      {review.sentiment}
                    </Badge>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {reviews.length > 3 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm text-text-secondary hover:text-accent transition-colors"
            >
              {expanded ? 'Show less' : `Show all ${reviews.length} reviews`}
              <ChevronDown
                size={16}
                className={cn('transition-transform duration-300', expanded && 'rotate-180')}
              />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const maxLength = 200;
  const shouldTruncate = text.length > maxLength;

  return (
    <div>
      <p className="text-sm text-text-secondary leading-relaxed">
        {shouldTruncate && !expanded ? `${text.slice(0, maxLength)}…` : text}
      </p>
      {shouldTruncate && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-accent hover:text-accent-hover mt-1 transition-colors"
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
}
