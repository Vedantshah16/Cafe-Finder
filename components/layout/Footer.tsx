'use client';

import Link from 'next/link';
import { Coffee, Github, Twitter, Instagram } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-accent rounded-xl flex items-center justify-center">
                <Coffee size={16} className="text-black" />
              </div>
              <span className="font-bold text-lg text-text-primary">
                Cafe<span className="text-accent">Finder</span>
                <span className="ml-1 text-xs font-medium text-text-muted bg-surface-elevated px-1.5 py-0.5 rounded-md">
                  AI
                </span>
              </span>
            </div>
            <p className="text-sm text-text-muted max-w-xs leading-relaxed">
              Your AI-powered companion for discovering the perfect cafe experience,
              every single time.
            </p>
            <div className="flex gap-3">
              {[Github, Twitter, Instagram].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 rounded-xl bg-surface-elevated border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:border-border-strong transition-colors"
                >
                  <Icon size={15} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4">Explore</h4>
            <ul className="space-y-2.5">
              {['Nearby Cafes', 'Trending Now', 'Top Rated', 'New Openings'].map((item) => (
                <li key={item}>
                  <Link
                    href="/explore"
                    className="text-sm text-text-muted hover:text-text-secondary transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4">Company</h4>
            <ul className="space-y-2.5">
              {['About', 'Blog', 'Careers', 'Privacy', 'Terms'].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm text-text-muted hover:text-text-secondary transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            © 2025 CafeFinder AI. Brewed with love.
          </p>
          <p className="text-xs text-text-muted">
            Powered by OpenAI · Google Places · Mapbox
          </p>
        </div>
      </div>
    </footer>
  );
}
