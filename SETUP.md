# ☕ CafeFinder AI — Setup Guide

## Prerequisites
- Node.js 18+ installed
- Git
- A code editor (VS Code recommended)

---

## 1. Install Dependencies

```bash
npm install
```

---

## 2. Environment Variables

Copy the example file and fill in your API keys:

```bash
cp .env.example .env.local
```

Then open `.env.local` and add your keys:

### Required Keys:

#### NEXTAUTH_SECRET
Generate a random secret:
```bash
openssl rand -base64 32
```

#### MONGODB_URI
- Create a free cluster at https://cloud.mongodb.com
- Click "Connect" → "Connect your application"
- Copy the connection string
- Replace `<username>`, `<password>`, and `<dbname>` with your values

#### OPENAI_API_KEY
- Go to https://platform.openai.com/api-keys
- Create a new API key
- Add billing (gpt-4o-mini is very cheap — ~$0.15/1M tokens)

#### GOOGLE_PLACES_API_KEY
- Go to https://console.cloud.google.com
- Create a project → Enable "Places API"
- Go to Credentials → Create API Key
- **IMPORTANT**: Also set `NEXT_PUBLIC_GOOGLE_PLACES_KEY` for client-side autocomplete

#### NEXT_PUBLIC_MAPBOX_TOKEN
- Go to https://account.mapbox.com/access-tokens/
- Create a new public token
- Starts with `pk.eyJ1...`

---

## 3. Run Locally

```bash
npm run dev
```

Open http://localhost:3000

---

## 4. Build for Production

```bash
npm run build
npm start
```

---

## 5. Deploy to Vercel (Recommended)

### One-click deploy:
1. Push code to GitHub
2. Go to https://vercel.com/new
3. Import your repository
4. Add all environment variables in Vercel dashboard
5. Deploy!

### Via CLI:
```bash
npm install -g vercel
vercel
```

---

## 6. Deploy to Netlify

```bash
npm install -g netlify-cli
netlify build
netlify deploy --prod
```

Add environment variables in Netlify dashboard under Site Settings → Environment Variables.

---

## Features Without API Keys

The app works in **demo mode** without API keys:
- Shows 6 sample cafes with real photos (from Unsplash)
- AI search uses basic keyword matching
- Map shows demo locations in New York
- All UI/UX features work fully

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Maps | Mapbox GL + react-map-gl |
| AI | OpenAI GPT-4o-mini |
| Places | Google Places API |
| Auth | NextAuth.js |
| Database | MongoDB + Mongoose |
| State | Zustand |
| Data Fetching | TanStack Query + Axios |
| Icons | Lucide React |

---

## Project Structure

```
cafe-finder/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Home page
│   ├── explore/            # Map + list explore page
│   ├── cafe/[id]/          # Cafe detail page
│   ├── favorites/          # User favorites
│   ├── profile/            # User profile
│   ├── login/ signup/      # Auth pages
│   └── api/                # API routes
│       ├── auth/           # NextAuth + registration
│       ├── cafes/          # Cafe search, details, trending
│       ├── ai/             # AI recommend + chatbot
│       └── user/           # Favorites management
├── components/
│   ├── ai/                 # ChatBot + SpinWheel
│   ├── cafe/               # CafeCard, Gallery, Reviews
│   ├── explore/            # FiltersPanel
│   ├── home/               # Hero, MoodSelector, etc.
│   ├── layout/             # Navbar, Footer, Providers
│   ├── map/                # MapView
│   └── ui/                 # Button, Input, Badge, etc.
├── lib/
│   ├── api/                # Google Places + OpenAI
│   ├── auth.ts             # NextAuth config
│   ├── db/                 # MongoDB + models
│   └── utils/              # Helpers, cache
├── store/                  # Zustand global store
├── hooks/                  # useLocation, useCafes
└── types/                  # TypeScript types
```
