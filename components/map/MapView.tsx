'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import L from 'leaflet';
import Link from 'next/link';
import Image from 'next/image';
import { useAppStore } from '@/store/useAppStore';
import { formatDistance, getCafePrimaryPhoto } from '@/lib/utils/helpers';
import { Rating } from '@/components/ui/Rating';
import { OpenBadge } from '@/components/ui/Badge';
import type { Cafe } from '@/types';
import 'leaflet/dist/leaflet.css';

// ─── Fix default Leaflet marker icons (broken in Next.js) ────────────────────
function fixLeafletIcons() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

// ─── Custom cafe marker icon ──────────────────────────────────────────────────
function createCafeIcon(rating: number, isSelected: boolean) {
  const bg = isSelected ? '#D4A853' : '#1A1A1A';
  const textColor = isSelected ? '#000' : '#D4A853';
  const border = isSelected ? '#D4A853' : 'rgba(255,255,255,0.2)';

  const html = `
    <div style="
      background:${bg};
      color:${textColor};
      border:1.5px solid ${border};
      border-radius:10px;
      padding:3px 8px;
      font-size:11px;
      font-weight:700;
      font-family:Inter,system-ui,sans-serif;
      white-space:nowrap;
      box-shadow:0 2px 8px rgba(0,0,0,0.5);
      display:flex;
      align-items:center;
      gap:3px;
      ${isSelected ? 'box-shadow:0 0 12px rgba(212,168,83,0.5);' : ''}
    ">
      ${isSelected ? '☕ ' : ''}${rating.toFixed(1)} ★
    </div>
    <div style="
      width:0;height:0;
      border-left:5px solid transparent;
      border-right:5px solid transparent;
      border-top:6px solid ${bg};
      margin:0 auto;
    "></div>
  `;

  return L.divIcon({
    html,
    className: '',
    iconAnchor: [20, 36],
    popupAnchor: [0, -36],
  });
}

// ─── Fly-to controller ────────────────────────────────────────────────────────
function FlyToSelected({ cafe }: { cafe: Cafe | null }) {
  const map = useMap();
  useEffect(() => {
    if (cafe) {
      map.flyTo([cafe.coordinates.lat, cafe.coordinates.lng], 16, { duration: 1.2 });
    }
  }, [cafe, map]);
  return null;
}

// ─── User location marker ─────────────────────────────────────────────────────
function UserLocationMarker({ lat, lng }: { lat: number; lng: number }) {
  const userIcon = L.divIcon({
    html: `
      <div style="position:relative;width:16px;height:16px;">
        <div style="
          width:16px;height:16px;border-radius:50%;
          background:#3B82F6;border:2px solid #fff;
          box-shadow:0 0 0 4px rgba(59,130,246,0.3);
        "></div>
      </div>
    `,
    className: '',
    iconAnchor: [8, 8],
  });

  return <Marker position={[lat, lng]} icon={userIcon} />;
}

// ─── Main MapView ─────────────────────────────────────────────────────────────
interface MapViewProps {
  cafes: Cafe[];
  className?: string;
}

export default function MapView({ cafes, className }: MapViewProps) {
  const { userLocation, selectedCafe, setSelectedCafe } = useAppStore();

  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [40.7128, -74.006]; // default: NYC

  // Fix icons on mount
  useEffect(() => { fixLeafletIcons(); }, []);

  return (
    <div className={`relative rounded-2xl overflow-hidden ${className}`}>
      <MapContainer
        center={center}
        zoom={14}
        style={{ width: '100%', height: '100%', background: '#0D0D0D' }}
        zoomControl={false}
      >
        {/* Dark OpenStreetMap tiles — no API key needed */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          maxZoom={19}
        />

        {/* Fly to selected cafe */}
        <FlyToSelected cafe={selectedCafe} />

        {/* User location */}
        {userLocation && (
          <UserLocationMarker lat={userLocation.lat} lng={userLocation.lng} />
        )}

        {/* Cafe markers */}
        {cafes.map((cafe) => {
          const isSelected = selectedCafe?.place_id === cafe.place_id;
          return (
            <Marker
              key={cafe.place_id}
              position={[cafe.coordinates.lat, cafe.coordinates.lng]}
              icon={createCafeIcon(cafe.rating, isSelected)}
              eventHandlers={{
                click: () => setSelectedCafe(isSelected ? null : cafe),
              }}
            />
          );
        })}
      </MapContainer>

      {/* Selected cafe popup (rendered outside Leaflet for full styling control) */}
      <AnimatePresence>
        {selectedCafe && (
          <motion.div
            key={selectedCafe.place_id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] w-72 bg-[#1A1A1A] rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
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
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <X size={13} />
              </button>
            </div>

            {/* Info */}
            <div className="p-3">
              <h4 className="font-semibold text-white text-sm mb-0.5 truncate">
                {selectedCafe.name}
              </h4>
              <p className="text-white/50 text-xs mb-2 truncate">{selectedCafe.address}</p>
              <div className="flex items-center justify-between mb-3">
                <Rating rating={selectedCafe.rating} count={selectedCafe.user_ratings_total} size="sm" />
                {selectedCafe.hours && <OpenBadge isOpen={selectedCafe.hours.open_now} />}
              </div>
              {selectedCafe.distance && (
                <p className="text-white/40 text-xs mb-2">
                  {formatDistance(selectedCafe.distance)} away
                </p>
              )}
              <Link href={`/cafe/${selectedCafe.place_id}`}>
                <button className="w-full py-2 bg-[#D4A853] hover:bg-[#E8C070] text-black text-xs font-semibold rounded-xl transition-colors">
                  View Details →
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
