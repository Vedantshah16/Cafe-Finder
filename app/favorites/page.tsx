'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Coffee, Compass } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAppStore } from '@/store/useAppStore';
import { Rating } from '@/components/ui/Rating';
import Button from '@/components/ui/Button';
import { DEMO_CAFES, getCafePrimaryPhoto } from '@/lib/utils/helpers';
import Footer from '@/components/layout/Footer';
import type { Cafe } from '@/types';

export default function FavoritesPage() {
  const { favorites, toggleFavorite } = useAppStore();
  const [favoriteCafes, setFavoriteCafes] = useState<Cafe[]>([]);

  useEffect(() => {
    // Get cafe data from demo data (in production, fetch from API)
    const cafes = favorites
      .map((id) => DEMO_CAFES.find((c) => c.place_id === id || c.id === id))
      .filter(Boolean) as Cafe[];
    setFavoriteCafes(cafes);
  }, [favorites]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 max-w-5xl mx-auto px-4 pt-24 pb-16 w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <Heart size={18} className="text-red-400" fill="currentColor" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary">Your Favorites</h1>
          </div>
          <p className="text-text-secondary ml-13">
            {favorites.length > 0
              ? `${favorites.length} cafe${favorites.length !== 1 ? 's' : ''} saved`
              : 'No favorites yet'}
          </p>
        </motion.div>

        {/* Empty state */}
        {favorites.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 gap-6"
          >
            <div className="w-20 h-20 rounded-3xl bg-surface-elevated border border-border flex items-center justify-center">
              <Coffee size={32} className="text-text-muted" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-text-primary mb-2">No favorites yet</h2>
              <p className="text-text-secondary text-sm max-w-sm">
                Discover cafes and tap the heart icon to save your favorites here.
              </p>
            </div>
            <Link href="/explore">
              <Button variant="primary" leftIcon={<Compass size={16} />}>
                Explore Cafes
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Favorites grid */}
        {favoriteCafes.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {favoriteCafes.map((cafe, i) => (
              <motion.div
                key={cafe.place_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                layout
              >
                <Link href={`/cafe/${cafe.place_id}`}>
                  <div className="group bg-surface border border-border rounded-3xl overflow-hidden hover:border-accent/30 transition-all duration-300 hover:shadow-card-hover">
                    <div className="relative h-44">
                      <Image
                        src={getCafePrimaryPhoto(cafe)}
                        alt={cafe.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFavorite(cafe.place_id);
                        }}
                        className="absolute top-3 right-3 p-2 rounded-xl bg-black/50 backdrop-blur-sm hover:bg-red-500/80 transition-colors"
                      >
                        <Heart size={14} className="text-red-400" fill="currentColor" />
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors mb-1">
                        {cafe.name}
                      </h3>
                      <p className="text-text-muted text-xs mb-2 truncate">{cafe.address}</p>
                      <Rating rating={cafe.rating} count={cafe.user_ratings_total} size="sm" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Suggestions when there are favorites but also room for more */}
        {favorites.length > 0 && favorites.length < 5 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 text-center"
          >
            <p className="text-text-muted text-sm mb-4">Discover more cafes to add to your list</p>
            <Link href="/explore">
              <Button variant="secondary" leftIcon={<Compass size={16} />}>
                Explore More
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
}
