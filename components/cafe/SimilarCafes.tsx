'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Rating } from '@/components/ui/Rating';
import { getCafePrimaryPhoto } from '@/lib/utils/helpers';
import { CafeCardSkeleton } from '@/components/ui/Skeleton';
import type { Cafe } from '@/types';
import axios from 'axios';
import { DEMO_CAFES } from '@/lib/utils/helpers';

interface SimilarCafesProps {
  currentCafeId: string;
  location: { lat: number; lng: number };
}

export default function SimilarCafes({ currentCafeId, location }: SimilarCafesProps) {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get('/api/cafes/nearby', {
          params: { lat: location.lat, lng: location.lng, radius: 1000 },
        });
        const similar = (data.data as Cafe[]).filter((c) => c.place_id !== currentCafeId).slice(0, 4);
        setCafes(similar.length > 0 ? similar : DEMO_CAFES.filter((c) => c.id !== currentCafeId).slice(0, 4));
      } catch {
        setCafes(DEMO_CAFES.filter((c) => c.id !== currentCafeId).slice(0, 4));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentCafeId, location]);

  if (!loading && cafes.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary mb-5">Similar cafes nearby</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-surface-elevated rounded-2xl animate-pulse" />
            ))
          : cafes.map((cafe, i) => (
              <motion.div
                key={cafe.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/cafe/${cafe.place_id}`}>
                  <div className="group flex items-center gap-3 p-3 bg-surface-elevated border border-border rounded-2xl hover:border-accent/30 transition-all duration-200">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                      <Image
                        src={getCafePrimaryPhoto(cafe)}
                        alt={cafe.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors truncate">
                        {cafe.name}
                      </p>
                      <Rating rating={cafe.rating} size="sm" showCount={false} className="mt-0.5" />
                    </div>
                    <ArrowRight size={14} className="text-text-muted group-hover:text-accent flex-shrink-0 transition-colors" />
                  </div>
                </Link>
              </motion.div>
            ))}
      </div>
    </div>
  );
}
