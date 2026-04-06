import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Providers from '@/components/layout/Providers';
import Navbar from '@/components/layout/Navbar';
import ChatBot from '@/components/ai/ChatBot';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CafeFinder AI — Discover Your Perfect Cafe',
  description:
    'AI-powered cafe discovery platform. Find the perfect cafe for your mood — whether you need a cozy workspace, a romantic spot, or the best espresso in town.',
  keywords: ['cafe finder', 'coffee shops', 'AI recommendations', 'nearby cafes', 'best coffee'],
  authors: [{ name: 'CafeFinder AI' }],
  creator: 'CafeFinder AI',
  openGraph: {
    type: 'website',
    title: 'CafeFinder AI',
    description: 'Discover your perfect cafe with AI-powered recommendations',
    images: [{ url: '/og-image.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CafeFinder AI',
    description: 'Discover your perfect cafe with AI-powered recommendations',
  },
};

export const viewport: Viewport = {
  themeColor: '#0D0D0D',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-background text-text-primary antialiased`}>
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <ChatBot />
          <Toaster
            position="bottom-left"
            toastOptions={{
              style: {
                background: '#1A1A1A',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                fontSize: '13px',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
