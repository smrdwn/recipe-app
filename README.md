# Recipe Radar

A PWA for browsing, searching, and saving recipes from TheMealDB. It ships with a secure Node/Express proxy, offline-friendly favorites via IndexedDB, and a responsive UI built with React, Vite, Tailwind, and shadcn-inspired components.

## Features

- Search and browse TheMealDB recipes through a proxy API.
- Category chips, detailed recipe view, and favorites.
- Offline-ready favorites stored in IndexedDB.
- PWA installable: manifest, service worker, offline fallback.
- Skeleton loaders, toasts, and error boundary.
- Accessible, keyboard-friendly UI.

## Tech Stack

- Client: React + Vite + TypeScript + Tailwind + TanStack Query + shadcn/ui patterns
- Server: Node.js + Express + TypeScript

## Project Tree

```
/server
  .env.example
  package.json
  tsconfig.json
  /src
    index.ts
    /routes
      mealdb.ts

/client
  index.html
  package.json
  postcss.config.cjs
  tailwind.config.cjs
  tsconfig.json
  tsconfig.node.json
  vite.config.ts
  /public
    manifest.webmanifest
    offline.html
    /icons
      icon-192.svg
      icon-512.svg
  /src
    App.tsx
    main.tsx
    sw.js
    /components
      ErrorBoundary.tsx
      MealCard.tsx
      SkipLink.tsx
      ThemeToggle.tsx
      /ui
        badge.tsx
        button.tsx
        card.tsx
        dialog.tsx
        input.tsx
        skeleton.tsx
    /features
      /favorites
        db.ts
        useFavorites.ts
    /lib
      api.ts
      queryClient.ts
      utils.ts
    /pages
      Home.tsx
      Details.tsx
      Favorites.tsx
    /styles
      globals.css
```

## Setup

### Server

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

### Client

```bash
cd client
npm install
npm run dev
```

## Environment Variables

Server `.env`:

- `MEALDB_API_BASE=https://www.themealdb.com/api/json/v1`
- `MEALDB_API_KEY=1`
- `PORT=5174`

## shadcn/ui Setup Notes

This project includes shadcn-style components. If you want the official generator:

```bash
cd client
npx shadcn-ui@latest init
```

Then you can replace the components in `src/components/ui` with generated ones.

## PWA Notes

- `public/manifest.webmanifest` defines name, icons, and theme color.
- `src/sw.js` handles precaching, runtime caching, and offline fallback.
- Test offline by building the client and running `npm run preview`, then toggling offline in DevTools.

## Caching Strategy

- Service worker precaches app shell and offline fallback.
- Stale-while-revalidate for images and `/api/categories`.
- Network-first with cache fallback for `/api/*` data.

To change caching behavior, edit `client/src/sw.js`.

## Deploy Suggestions

- Server: Render or Railway
- Client: Netlify or Vercel

### Netlify (Client + Functions)

This repo includes Netlify Functions to replace the Express proxy.

1. Create a new Netlify site from the repo.
2. Build settings:

- Build command: `npm --prefix client run build`
- Publish directory: `client/dist`

3. Netlify environment variables:

- `MEALDB_API_BASE=https://www.themealdb.com/api/json/v1`
- `MEALDB_API_KEY=1`

The client keeps using `/api/*`, which is redirected to `/.netlify/functions/mealdb`.

## Post-generation Checklist

- Replace placeholder SVG icons in `client/public/icons` with real PNGs.
- Run `npm install` in both `server` and `client`.
- Configure `MEALDB_API_KEY` and `MEALDB_API_BASE` in production.
- Consider enabling HTTPS for production PWA installs.
