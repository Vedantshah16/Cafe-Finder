'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Grid3X3 } from 'lucide-react';
import type { CafePhoto } from '@/types';

interface CafeGalleryProps {
  photos: CafePhoto[];
  name: string;
}

const FALLBACK_PHOTOS: CafePhoto[] = [
  { url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&q=80' },
  { url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80' },
  { url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80' },
];

export default function CafeGallery({ photos, name }: CafeGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const displayPhotos = photos.length > 0 ? photos : FALLBACK_PHOTOS;

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const prev = () =>
    setLightboxIndex((i) => (i !== null ? (i - 1 + displayPhotos.length) % displayPhotos.length : null));
  const next = () =>
    setLightboxIndex((i) => (i !== null ? (i + 1) % displayPhotos.length : null));

  const mainPhoto = displayPhotos[0];
  const sidePhotos = displayPhotos.slice(1, 5);

  return (
    <>
      {/* Gallery grid */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] sm:h-[480px] rounded-3xl overflow-hidden">
        {/* Main large image */}
        <div
          className="col-span-2 row-span-2 relative cursor-pointer group"
          onClick={() => openLightbox(0)}
        >
          <Image
            src={mainPhoto.url}
            alt={`${name} - photo 1`}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        </div>

        {/* Side images */}
        {sidePhotos.map((photo, index) => (
          <div
            key={index}
            className="relative cursor-pointer group"
            onClick={() => openLightbox(index + 1)}
          >
            <Image
              src={photo.url}
              alt={`${name} - photo ${index + 2}`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

            {/* "View all" overlay on last visible */}
            {index === 3 && displayPhotos.length > 5 && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1">
                <Grid3X3 size={20} className="text-white" />
                <span className="text-white text-sm font-medium">
                  +{displayPhotos.length - 5} more
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            >
              <X size={20} />
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
              {lightboxIndex + 1} / {displayPhotos.length}
            </div>

            {/* Nav buttons */}
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            >
              <ChevronRight size={24} />
            </button>

            {/* Image */}
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-4xl max-h-[85vh] aspect-video mx-8"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={displayPhotos[lightboxIndex].url}
                alt={`${name} - photo ${lightboxIndex + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
