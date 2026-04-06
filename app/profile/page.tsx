'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { User, Heart, Clock, Settings, LogOut, Coffee, MapPin } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import Button from '@/components/ui/Button';
import { DEMO_CAFES, getCafePrimaryPhoto } from '@/lib/utils/helpers';
import Footer from '@/components/layout/Footer';
import type { Cafe } from '@/types';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { favorites, recentlyViewed } = useAppStore();
  const [recentCafes, setRecentCafes] = useState<Cafe[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') redirect('/login');
  }, [status]);

  useEffect(() => {
    const cafes = recentlyViewed
      .slice(0, 4)
      .map((id) => DEMO_CAFES.find((c) => c.place_id === id || c.id === id))
      .filter(Boolean) as Cafe[];
    setRecentCafes(cafes);
  }, [recentlyViewed]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  const stats = [
    { icon: Heart, label: 'Favorites', value: favorites.length, href: '/favorites' },
    { icon: Clock, label: 'Visited', value: recentlyViewed.length, href: '/explore' },
    { icon: Coffee, label: 'Mood', value: 'Explorer', href: '/explore' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 max-w-3xl mx-auto px-4 pt-24 pb-16 w-full">
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-6 mb-10"
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {session.user?.image ? (
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-accent/30">
                <Image src={session.user.image} alt={session.user.name || ''} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-accent-light border border-accent/30 flex items-center justify-center">
                <User size={32} className="text-accent" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background" />
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-text-primary mb-1">{session.user?.name}</h1>
            <p className="text-text-muted text-sm flex items-center gap-1.5">
              <MapPin size={12} />
              {session.user?.email}
            </p>
            <div className="flex gap-3 mt-4">
              {stats.map(({ icon: Icon, label, value, href }) => (
                <Link key={label} href={href}>
                  <div className="text-center px-4 py-2 bg-surface border border-border rounded-xl hover:border-accent/30 transition-colors">
                    <div className="text-lg font-bold text-text-primary">{value}</div>
                    <div className="text-xs text-text-muted">{label}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recently viewed */}
        {recentCafes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10"
          >
            <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Clock size={18} className="text-accent" />
              Recently Viewed
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {recentCafes.map((cafe, i) => (
                <Link key={cafe.place_id} href={`/cafe/${cafe.place_id}`}>
                  <div className="group flex gap-3 p-3 bg-surface border border-border rounded-2xl hover:border-accent/30 transition-all">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                      <Image
                        src={getCafePrimaryPhoto(cafe)}
                        alt={cafe.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors truncate">
                        {cafe.name}
                      </p>
                      <p className="text-xs text-text-muted truncate">{cafe.address}</p>
                      <p className="text-xs text-accent mt-0.5">{cafe.rating}★</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Settings section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface border border-border rounded-2xl overflow-hidden"
        >
          <div className="p-4 border-b border-border">
            <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Settings size={15} />
              Account
            </h2>
          </div>
          <div className="divide-y divide-border">
            {[
              { label: 'Edit profile', icon: User, href: '#' },
              { label: 'My favorites', icon: Heart, href: '/favorites' },
              { label: 'Explore cafes', icon: Coffee, href: '/explore' },
            ].map(({ label, icon: Icon, href }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 px-4 py-3.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
