'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Search, Heart, User, Menu, X, Sparkles, Map } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils/helpers';
import { useAppStore } from '@/store/useAppStore';
import Button from '@/components/ui/Button';
import Image from 'next/image';

const NAV_LINKS = [
  { href: '/', label: 'Home', icon: Coffee },
  { href: '/explore', label: 'Explore', icon: Map },
  { href: '/favorites', label: 'Favorites', icon: Heart },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const { favorites, toggleChat } = useAppStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          scrolled
            ? 'bg-background/80 backdrop-blur-xl border-b border-border shadow-glass'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-8 h-8 bg-accent rounded-xl flex items-center justify-center shadow-accent group-hover:shadow-accent-lg transition-all duration-300">
                <Coffee size={16} className="text-black" />
                <div className="absolute inset-0 bg-accent rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
              </div>
              <span className="font-bold text-lg text-text-primary">
                Cafe<span className="text-accent">Finder</span>
                <span className="ml-1 text-xs font-medium text-text-muted bg-surface-elevated px-1.5 py-0.5 rounded-md">
                  AI
                </span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                    pathname === href
                      ? 'text-accent bg-accent-light'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                  )}
                >
                  <Icon size={15} />
                  {label}
                  {label === 'Favorites' && favorites.length > 0 && (
                    <span className="bg-accent text-black text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
                      {favorites.length}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* AI Chat trigger */}
              <button
                onClick={toggleChat}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-accent hover:bg-accent-light transition-all duration-200"
              >
                <Sparkles size={15} />
                <span className="hidden lg:inline">AI Chat</span>
              </button>

              {/* User menu */}
              {session ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-surface-elevated transition-colors"
                  >
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        width={30}
                        height={30}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-accent-light border border-accent/30 flex items-center justify-center">
                        <User size={14} className="text-accent" />
                      </div>
                    )}
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setUserMenuOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-52 bg-surface border border-border rounded-2xl shadow-glass-lg z-20 overflow-hidden"
                        >
                          <div className="p-3 border-b border-border">
                            <p className="text-sm font-medium text-text-primary truncate">
                              {session.user?.name}
                            </p>
                            <p className="text-xs text-text-muted truncate">{session.user?.email}</p>
                          </div>
                          <div className="p-1.5">
                            <Link
                              href="/profile"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
                            >
                              <User size={14} />
                              Profile
                            </Link>
                            <Link
                              href="/favorites"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
                            >
                              <Heart size={14} />
                              Favorites
                            </Link>
                            <hr className="border-border my-1" />
                            <button
                              onClick={() => {
                                setUserMenuOpen(false);
                                signOut({ callbackUrl: '/' });
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              Sign out
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">Sign in</Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="primary" size="sm">Get started</Button>
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-xl text-text-secondary hover:bg-surface-elevated transition-colors"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-30 bg-background/95 backdrop-blur-xl border-b border-border md:hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors',
                    pathname === href
                      ? 'text-accent bg-accent-light'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                  )}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              ))}
              <button
                onClick={toggleChat}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-text-secondary hover:text-accent hover:bg-accent-light transition-colors"
              >
                <Sparkles size={18} />
                AI Chat
              </button>
              {!session && (
                <div className="pt-3 flex gap-2">
                  <Link href="/login" className="flex-1">
                    <Button variant="secondary" fullWidth>Sign in</Button>
                  </Link>
                  <Link href="/signup" className="flex-1">
                    <Button variant="primary" fullWidth>Get started</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
