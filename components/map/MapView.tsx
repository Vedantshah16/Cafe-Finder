'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Map, { Marker, Popup, NavigationControl, GeolocateControl, type MapRef } from 'react-map-gl';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAppStore } from '@/store/useAppStore';
import { formatDistance, getCafePrimaryPhoto } from '@/lib/utils/helpers';
import { Rating } from '@/components/ui/Rating';
import { OpenBadge } from '@/components/ui/Badge';
import type { Cafe, MapViewport } from '@/types';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapViewProps {
  cafes: Cafe[];
  className?: string;
}

const MAP_STYLE = 'mapbox://styles/mapbox/dark-v11';
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export default function MapView({ cafes, className }: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const { userLocation, selectedCafe, setSelectedCafe, hoveredCafeId } = useAppStore();

  const [viewport, setViewport] = useState<MapViewport>({
    longitude: userLocation?.lng || -74.006,
    latitude: userLocation?.lat || 40.7128,
    zoom: 13,
    pitch: 45,
    bearing: 0,
  });

  // Update viewport when user location changes
  useEffect(() => {
    if (userLocation) {
      setViewport((v) => ({
        ...v,
        longitude: userLocation.lng,
        latitude: userLocation.lat,
      }));
    }
  }, [userLocation]);

  // Fly to selected cafe
  useEffect(() => {
    if (selectedCafe && mapRef.current) {
      mapRef.current?.getMap().flyTo({
        center: [selectedCafe.coordinates.lng, selectedCafe.coordinates.lat],
        zoom: 16,
        duration: 1500,
        pitch: 50,
      });
    }
  }, [selectedCafe]);

  const handleMarkerClick = useCallback(
    (cafe: Cafe, e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedCafe(cafe === selectedCafe ? null : cafe);
    },
    [selectedCafe, setSelectedCafe]
  );

  return (
    <div className={`relative rounded-2xl overflow-hidden ${className}`}>
      <Map
        ref={mapRef}
        {...viewport}
        onMove={(evt) => setViewport(evt.viewState)}
        mapStyle={MAP_STYLE}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        {/* Navigation controls */}
        <NavigationControl position="top-right" />
        <GeolocateControl
          position="top-right"
          trackUserLocation
          onGeolocate={(e) => {
            const { longitude, latitude } = e.coords;
            setViewport((v) => ({ ...v, longitude, latitude, zoom: 14 }));
          }}
        />

        {/* User location marker */}
        {userLocation && (
          <Marker longitude={userLocation.lng} latitude={userLocation.lat}>
            <div className="relative">
              <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg" />
              <div className="absolute inset-0 rounded-full bg-blue-500/40 animate-ping" />
            </div>
          </Marker>
        )}

        {/* Cafe markers */}
        {cafes.map((cafe) => {
          const isSelected = selectedCafe?.place_id === cafe.place_id;
          const isHovered = hoveredCafeId === cafe.place_id;

          return (
            <Marker
              key={cafe.place_id}
              longitude={cafe.coordinates.lng}
              latitude={cafe.coordinates.lat}
              anchor="bottom"
            >
              <motion.button
                initial={{ scale: 0, y: -20 }}
                animate={{
                  scale: isSelected || isHovered ? 1.2 : 1,
                  y: 0,
                  zIndex: isSelected ? 10 : 1,
                }}
                whileHover={{ scale: 1.15 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => handleMarkerClick(cafe, e)}
                className="relative focus:outline-none"
              >
                {/* Marker pin */}
                <div
                  className={`
                    flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl shadow-lg
                    transition-colors duration-200 cursor-pointer select-none
                    ${
                      isSelected
                        ? 'bg-accent text-black border-2 border-accent'
                        : 'bg-[#1A1A1A] text-white border border-white/20 hover:bg-accent hover:text-black hover:border-accent'
                    }
                  `}
                >
                  <span className="text-xs font-bold">
                    {isSelected ? '☕' : ''}
                    {cafe.rating.toFixed(1)}
                  </span>
                  <Star size={9} fill="currentColor" className={isSelected ? 'text-black' : 'text-accent'} />
                </div>
                {/* Pin tail */}
                <div
                  className={`absolute left-1/2 -translate-x-1/2 top-full w-0 h-0
                    border-l-[5px] border-l-transparent
                    border-r-[5px] border-r-transparent
                    border-t-[6px] ${isSelected ? 'border-t-accent' : 'border-t-[#1A1A1A]'}
                  `}
                />
              </motion.button>
            </Marker>
          );
        })}

        {/* Popup for selected cafe */}
        <AnimatePresence>
          {selectedCafe && (
            <Popup
              longitude={selectedCafe.coordinates.lng}
              latitude={selectedCafe.coordinates.lat}
              anchor="bottom"
              offset={[0, -20]}
              onClose={() => setSelectedCafe(null)}
              closeButton={false}
              closeOnClick={false}
              style={{ padding: 0 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ duration: 0.2 }}
                className="w-64 bg-[#1A1A1A] rounded-2xl overflow-hidden border border-white/10 shadow-xl"
              >
                {/* Image */}
                <div className="relative h-32 w-full">
                  <Image
                    src={getCafePrimaryPhoto(selectedCafe)}
                    alt={selectedCafe.name}
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => setSelectedCafe(null)}
                    className="absolute top-2 right-2 p-1 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-3">
                  <h4 className="font-semibold text-white text-sm mb-1">{selectedCafe.name}</h4>
                  <p className="text-white/50 text-xs mb-2 line-clamp-1">{selectedCafe.address}</p>
                  <div className="flex items-center justify-between">
                    <Rating
                      rating={selectedCafe.rating}
                      count={selectedCafe.user_ratings_total}
                      size="sm"
                    />
                    {selectedCafe.hours && <OpenBadge isOpen={selectedCafe.hours.open_now} />}
                  </div>
                  {selectedCafe.distance && (
                    <p className="text-white/40 text-xs mt-1">
                      {formatDistance(selectedCafe.distance)} away
                    </p>
                  )}
                  <Link href={`/cafe/${selectedCafe.place_id}`}>
                    <button className="w-full mt-3 py-2 bg-[#D4A853] hover:bg-[#E8C070] text-black text-xs font-semibold rounded-xl transition-colors">
                      View Details
                    </button>
                  </Link>
                </div>
              </motion.div>
            </Popup>
          )}
        </AnimatePresence>
      </Map>

      {/* Map overlay attribution */}
      <div className="absolute bottom-2 right-2 text-[10px] text-white/30">
        © Mapbox © OpenStreetMap
      </div>
    </div>
  );
}
