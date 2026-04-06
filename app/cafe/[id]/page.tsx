'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  MapPin, Phone, Globe, Clock, Heart, Share2, Navigation2,
  Wifi, Trees, Star, ArrowLeft, Zap
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { useAppStore } from '@/store/useAppStore';
import CafeGallery from '@/components/cafe/CafeGallery';
import CafeReviews from '@/components/cafe/CafeReviews';
import SimilarCafes from '@/components/cafe/SimilarCafes';
import { Rating } from '@/components/ui/Rating';
import { Badge, OpenBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { CafeDetailSkeleton } from '@/components/ui/Skeleton';
import { DEMO_CAFES, formatPriceLevel, formatDistance } from '@/lib/utils/helpers';
import type { Cafe } from '@/types';
import toast from 'react-hot-toast';
import Footer from '@/components/layout/Footer';

export default function CafeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [loading, setLoading] = useState(true);
  const { toggleFavorite, isFavorite, addRecentlyViewed, userLocation } = useAppStore();

  const isFav = cafe ? isFavorite(cafe.place_id) : false;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/cafes/${id}`);
        const cafeData: Cafe = data.data;
        setCafe(cafeData);
        addRecentlyViewed(cafeData.place_id);
      } catch {
        // Try demo data
        const demo = DEMO_CAFES.find((c) => c.place_id === id || c.id === id);
        if (demo) {
          setCafe(demo);
        } else {
          toast.error('Cafe not found');
          router.push('/explore');
        }
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const handleFavorite = () => {
    if (!cafe) return;
    toggleFavorite(cafe.place_id);
    toast.success(isFav ? 'Removed from favorites' : '❤️ Saved to favorites!');
  };

  const handleShare = async () => {
    if (!cafe) return;
    try {
      await navigator.share({ title: cafe.name, url: window.location.href });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  const handleDirections = () => {
    if (!cafe) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${cafe.coordinates.lat},${cafe.coordinates.lng}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-10 px-4">
        <div className="max-w-4xl mx-auto">
          <CafeDetailSkeleton />
        </div>
      </div>
    );
  }

  if (!cafe) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 pt-20 pb-16">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </motion.div>

        {/* Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <CafeGallery photos={cafe.photos} name={cafe.name} />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex flex-wrap gap-2 mb-3">
                {cafe.is_featured && <Badge variant="accent">✦ Featured</Badge>}
                {cafe.hours && <OpenBadge isOpen={cafe.hours.open_now} />}
                {cafe.ai_score && cafe.ai_score >= 90 && (
                  <Badge variant="accent">
                    <Zap size={10} fill="currentColor" />
                    Top AI Pick
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
                {cafe.name}
              </h1>

              <div className="flex items-center gap-2 text-text-secondary mb-4">
                <MapPin size={14} className="flex-shrink-0" />
                <span className="text-sm">{cafe.address}</span>
                {cafe.distance && (
                  <span className="text-sm text-text-muted">
                    · {formatDistance(cafe.distance)} away
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Rating rating={cafe.rating} count={cafe.user_ratings_total} size="lg" />
                <span className="text-text-secondary text-sm">{formatPriceLevel(cafe.price_level)}</span>
              </div>
            </motion.div>

            {/* AI Summary */}
            {cafe.ai_summary && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-accent-light border border-accent/20 rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 text-accent text-sm font-medium mb-2">
                  <Star size={14} fill="currentColor" />
                  AI Summary
                </div>
                <p className="text-text-secondary text-sm leading-relaxed">{cafe.ai_summary}</p>
              </motion.div>
            )}

            {/* Amenities */}
            {Object.keys(cafe.amenities).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-lg font-semibold text-text-primary mb-4">What's available</h2>
                <div className="flex flex-wrap gap-2">
                  {cafe.amenities.wifi && (
                    <Badge variant="success" className="gap-1.5 px-3 py-1.5 text-sm">
                      <Wifi size={13} /> Free WiFi
                    </Badge>
                  )}
                  {cafe.amenities.outdoor_seating && (
                    <Badge variant="success" className="gap-1.5 px-3 py-1.5 text-sm">
                      <Trees size={13} /> Outdoor Seating
                    </Badge>
                  )}
                  {cafe.amenities.power_outlets && (
                    <Badge variant="success" className="gap-1.5 px-3 py-1.5 text-sm">
                      ⚡ Power Outlets
                    </Badge>
                  )}
                  {cafe.amenities.pet_friendly && (
                    <Badge variant="success" className="gap-1.5 px-3 py-1.5 text-sm">
                      🐾 Pet Friendly
                    </Badge>
                  )}
                  {cafe.amenities.takeout && (
                    <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm">
                      🥡 Takeout
                    </Badge>
                  )}
                  {cafe.amenities.reservations && (
                    <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm">
                      📅 Reservations
                    </Badge>
                  )}
                </div>
              </motion.div>
            )}

            {/* Opening hours */}
            {cafe.hours?.weekday_text && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-accent" />
                  Opening Hours
                </h2>
                <div className="grid sm:grid-cols-2 gap-2">
                  {cafe.hours.weekday_text.map((line, i) => {
                    const [day, hours] = line.split(': ');
                    return (
                      <div key={i} className="flex justify-between text-sm py-2 border-b border-border">
                        <span className="text-text-secondary">{day}</span>
                        <span className="text-text-primary font-medium">{hours}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Reviews ({cafe.user_ratings_total.toLocaleString()})
              </h2>
              <CafeReviews reviews={cafe.reviews} sentimentScore={cafe.sentiment_score} />
            </motion.div>

            {/* Similar cafes */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <SimilarCafes currentCafeId={cafe.place_id} location={cafe.coordinates} />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-surface border border-border rounded-2xl p-5 space-y-3 sticky top-24"
            >
              <Button
                variant="primary"
                fullWidth
                leftIcon={<Navigation2 size={16} />}
                onClick={handleDirections}
              >
                Get Directions
              </Button>
              <Button
                variant={isFav ? 'outline' : 'secondary'}
                fullWidth
                leftIcon={<Heart size={16} fill={isFav ? 'currentColor' : 'none'} />}
                onClick={handleFavorite}
                className={isFav ? 'text-red-400 border-red-500/30 hover:bg-red-500/10' : ''}
              >
                {isFav ? 'Saved' : 'Save Cafe'}
              </Button>
              <Button
                variant="ghost"
                fullWidth
                leftIcon={<Share2 size={16} />}
                onClick={handleShare}
              >
                Share
              </Button>

              {/* Contact */}
              {(cafe.phone || cafe.website) && (
                <div className="pt-3 border-t border-border space-y-2">
                  {cafe.phone && (
                    <a
                      href={`tel:${cafe.phone}`}
                      className="flex items-center gap-2.5 text-sm text-text-secondary hover:text-accent transition-colors"
                    >
                      <Phone size={14} />
                      {cafe.phone}
                    </a>
                  )}
                  {cafe.website && (
                    <a
                      href={cafe.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-sm text-text-secondary hover:text-accent transition-colors"
                    >
                      <Globe size={14} />
                      Visit website
                    </a>
                  )}
                </div>
              )}

              {/* Mood tags */}
              {cafe.mood_tags && cafe.mood_tags.length > 0 && (
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-text-muted mb-2">Best for</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cafe.mood_tags.map((tag) => (
                      <Link key={tag} href={`/explore?mood=${tag}`}>
                        <Badge variant="default" className="capitalize cursor-pointer hover:bg-accent-light hover:text-accent transition-colors">
                          {tag}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
