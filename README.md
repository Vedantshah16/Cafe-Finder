<img src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&h=400&fit=crop" alt="CafeFinder AI Banner" width="100%" />

# ☕ CafeFinder AI

> **AI-powered cafe discovery platform** — Find your perfect cafe by mood, intent, and location.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-pink?style=flat-square)](https://framer.com/motion)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?style=flat-square&logo=openai)](https://openai.com)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

---

## ✨ Features

### 🤖 AI-Powered Search
- Natural language queries: *"romantic cafe for a first date"*, *"quiet workspace with fast WiFi"*
- OpenAI GPT-4o-mini detects mood, intent, and desired features
- Intelligent cafe ranking based on query relevance

### 🗺️ Interactive Map
- Mapbox GL with smooth fly-to animations and custom rating markers
- Split view (list + map), full map, and list-only modes
- Click any marker for an instant info card popup

### 🎡 Spin the Wheel
- Canvas-based physics wheel for indecisive cafe-seekers
- Smooth easing animation with confetti on landing
- Populated from your current search results

### 💬 AI Chatbot (CafeBot)
- Floating AI concierge powered by GPT-4o-mini
- Context-aware responses based on nearby cafes
- Quick-prompt suggestions for instant discovery

### 😊 Mood-Based Discovery
- 7 moods: Romantic, Work, Chill, Social, Study, Date Night, Quick Stop
- Each mood triggers a tailored search and UI accent color

### 👤 User System
- Authentication via credentials or Google OAuth (NextAuth.js)
- Save favorites, track recently viewed cafes
- Persistent state across sessions (Zustand + MongoDB)

### 🔍 Smart Filters
- Filter by price, rating, distance, open now, WiFi, outdoor seating
- LRU cache on all API responses to minimize costs

---

## 🖼️ Screenshots

| Home | Explore | Cafe Detail |
|------|---------|-------------|
| Hero with AI search | Map + list split view | Gallery, reviews, AI summary |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Maps | Mapbox GL · react-map-gl |
| AI | OpenAI GPT-4o-mini |
| Places | Google Places API |
| Auth | NextAuth.js (JWT) |
| Database | MongoDB · Mongoose |
| State | Zustand (persisted) |
| Data Fetching | TanStack Query · Axios |
| Icons | Lucide React |
| Caching | LRU Cache (in-memory) |

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/Vedantshah16/Cafe-Finder.git
cd Cafe-Finder
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>

# Database (MongoDB Atlas free tier works)
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/cafefinder

# OpenAI (gpt-4o-mini is very cheap)
OPENAI_API_KEY=sk-...

# Google Places API
GOOGLE_PLACES_API_KEY=AIza...
NEXT_PUBLIC_GOOGLE_PLACES_KEY=AIza...

# Mapbox (free tier available)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...

# Google OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

> **No API keys?** The app runs in **demo mode** with 6 sample cafes and all UI features intact.

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📦 Project Structure

```
├── app/
│   ├── page.tsx              # Home — Hero, moods, trending, featured
│   ├── explore/              # Map + list explore with AI search
│   ├── cafe/[id]/            # Cafe detail — gallery, reviews, similar
│   ├── favorites/            # Saved cafes
│   ├── profile/              # User profile & history
│   ├── login/ & signup/      # Auth pages
│   └── api/
│       ├── cafes/            # nearby · search · [id] · trending · autocomplete
│       ├── ai/               # recommend · chat
│       ├── auth/             # [...nextauth] · register
│       └── user/             # favorites
├── components/
│   ├── ai/                   # ChatBot · SpinWheel
│   ├── cafe/                 # CafeCard · Gallery · Reviews · SimilarCafes
│   ├── explore/              # FiltersPanel
│   ├── home/                 # Hero · SearchBar · MoodSelector · Trending · Featured · AIBanner
│   ├── layout/               # Navbar · Footer · Providers
│   ├── map/                  # MapView
│   └── ui/                   # Button · Input · Modal · Badge · Rating · Skeleton
├── lib/
│   ├── api/                  # googlePlaces.ts · openai.ts
│   ├── auth.ts               # NextAuth config
│   ├── db/                   # mongodb.ts · models/User · models/SavedCafe
│   └── utils/                # helpers.ts · cache.ts
├── store/
│   └── useAppStore.ts        # Zustand global store (persisted)
├── hooks/
│   ├── useLocation.ts        # Geolocation with permission handling
│   └── useCafes.ts           # Cafe data fetching actions
└── types/
    └── index.ts              # All TypeScript types
```

---

## 🌐 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Vedantshah16/Cafe-Finder)

1. Click the button above or import the repo at [vercel.com/new](https://vercel.com/new)
2. Add all environment variables in the Vercel dashboard
3. Deploy — done!

### Manual

```bash
npm run build
npm start
```

---

## 🔑 API Keys — Where to Get Them

| Key | Where |
|-----|-------|
| `OPENAI_API_KEY` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| `GOOGLE_PLACES_API_KEY` | [console.cloud.google.com](https://console.cloud.google.com) → Enable Places API |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | [account.mapbox.com/access-tokens](https://account.mapbox.com/access-tokens/) |
| `MONGODB_URI` | [cloud.mongodb.com](https://cloud.mongodb.com) → Free M0 cluster |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |

---

## 📄 License

MIT © [Vedant Shah](https://github.com/Vedantshah16)
