# PROJECT_MAP.md — RedaStream+ Architecture

## Data Flow

### TMDB → Pages → Components
```
TMDB API 
  → lib/tmdb.ts (fetch with caching)
  → app/*/page.tsx (Server Component data fetching)
  → components/* (Client or Server components for rendering)
```

### Streaming Providers → Player
```
lib/streaming.ts (provider list)
  → PlayerEmbed.tsx (Client component with iframe + server tabs)
  → watch pages render player
```

### New: Rivestream → RivePlayer
```
RivePlayer.tsx (new component, similar to PlayerEmbed)
  → Embed URL: https://watch.rivestream.app/movie/{id}
  → Used by: watch/movie/[id]/page.tsx and watch/tv/[id]/[season]/[episode]/page.tsx
```

### New: Kitsu.io → Manga Pages
```
Kitsu.io API
  → lib/kitsu.ts (API client)
  → app/manga/page.tsx (Server Component)
  → components/MediaCard.tsx (reused for manga posters)
```

### New: IPTV-org → Live TV
```
IPTV-org M3U8 playlist
  → lib/iptv.ts (parser)
  → app/live/page.tsx (channel browser)
  → app/live/watch/page.tsx (player page)
  → IPTVPlayer.tsx (HLS.js player, Client component)
```

---

## Page → Component Map

### app/page.tsx (Homepage)
```
app/page.tsx (Server)
  ├── Header.tsx (Client)
  ├── EnhancedHeroSection.tsx (Client - carousel with trending)
  ├── ContentSection.tsx × 6 (Client - horizontal scroll rows)
  │     └── MediaCard.tsx (poster cards)
  └── EnhancedFooter.tsx (Client)
```

### app/movies/page.tsx (Movies Catalog)
```
app/movies/page.tsx (Server)
  ├── Header.tsx
  ├── FiltersBar.tsx (Client - genre, year, language, sort)
  ├── CatalogResults.tsx (Client - infinite scroll)
  │     └── MediaGrid.tsx → MediaCard.tsx
  └── EnhancedFooter.tsx
```

### app/tv/page.tsx (TV Catalog)
```
app/tv/page.tsx (Server)
  ├── Header.tsx
  ├── FiltersBar.tsx (Client)
  ├── CatalogResults.tsx (Client)
  │     └── MediaGrid.tsx → MediaCard.tsx
  └── EnhancedFooter.tsx
```

### app/watch/movie/[id]/page.tsx (Movie Player)
```
app/watch/movie/[id]/page.tsx (Server - fetches movie details)
  ├── Header.tsx
  ├── Movie poster + metadata sidebar
  ├── PlayerEmbed.tsx (Client - current iframe player)
  │     └── Server tabs + iframe
  ├── MediaGrid.tsx (recommendations)
  └── EnhancedFooter.tsx
```

### app/watch/tv/[id]/[season]/[episode]/page.tsx (TV Player)
```
app/watch/tv/[id]/[season]/[episode]/page.tsx (Server)
  └── WatchTvEpisodeClient.tsx (Client wrapper)
        ├── Header.tsx
        ├── PlayerEmbed.tsx (iframe player)
        ├── Episode selector sidebar
        ├── Season selector
        └── EnhancedFooter.tsx
```

### NEW: app/kdramas/page.tsx (K-Dramas Catalog)
```
Similar to app/tv/page.tsx but with:
  - TMDB discover filter: with_original_language=ko
  - Title: "Korean Dramas"
  - Same FiltersBar + CatalogResults pattern
```

### NEW: app/anime/page.tsx (Anime Catalog)
```
Similar to app/tv/page.tsx but with:
  - TMDB discover filters: with_original_language=ja + with_genres=16
  - Title: "Anime Series"
  - Same FiltersBar + CatalogResults pattern
```

### NEW: app/manga/page.tsx (Manga Catalog)
```
app/manga/page.tsx (Server - fetches from Kitsu.io)
  ├── Header.tsx
  ├── FiltersBar.tsx (adapted for manga genres/categories)
  ├── CatalogResults.tsx (reused, fetches from /api/manga)
  └── EnhancedFooter.tsx
```

### NEW: app/live/page.tsx (IPTV Channels)
```
app/live/page.tsx (Server - fetches from IPTV-org)
  ├── Header.tsx
  ├── Channel grid (by category: News, Sports, Entertainment, etc.)
  │     └── ChannelCard.tsx (channel logo, name, country)
  └── EnhancedFooter.tsx
```

### NEW: app/live/watch/page.tsx (IPTV Player)
```
app/live/watch/page.tsx (Server)
  ├── Header.tsx
  ├── IPTVPlayer.tsx (Client - HLS.js video player)
  │     └── <video> element with HLS.js
  ├── Channel info sidebar
  └── EnhancedFooter.tsx
```

---

## next.config.js Configuration

### Current Image Domains (remotePatterns)
- `image.tmdb.org` ✅
- `via.placeholder.com` ✅  
- `www.themoviedb.org` ✅

### Will Add
- `media.kitsu.app` (Kitsu.io manga covers)
- `*.kitsu.app` (wildcard for Kitsu CDN)
- `upload.wikimedia.org` (for IPTV channel logos)

### Current CSP frame-src (ALLOWED_IFRAME_ORIGINS)
Default origins in next.config.js:
- `vidsrc.to`, `*.vidsrc.to`
- `vidsrc.vip`, `*.vidsrc.vip`
- `vidsrc.xyz`, `*.vidsrc.xyz`
- `vidlink.pro`, `*.vidlink.pro`
- `vidnest.fun`, `*.vidnest.fun`
- `multiembed.mov`, `*.multiembed.mov`
- `autoembed.to`, `*.autoembed.to`
- `cloudnestra.com`, `*.cloudnestra.com`
- `player.videasy.net`

### Will Add
- `watch.rivestream.app`, `*.rivestream.app` (RivePlayer embeds)

---

## API Endpoints Summary

### Existing TMDB Proxy APIs
- `GET /api/trending?media_type=all|movie|tv&time_window=day|week&page=1`
- `GET /api/discover?type=movie|tv&sort_by=...&with_genres=...&page=1`
- `GET /api/search?q=...&page=1`
- `GET /api/details/:type/:id` (appends videos, images, credits, recommendations)
- `GET /api/tv/:id/season/:season`
- `GET /api/filters` (genres, years, countries)
- `GET /api/stream/:type/:id[/:season/:episode]` (streaming servers list)
- `GET /api/genres/tv`
- `GET /api/tv/list`
- `GET /api/health`
- `GET /api/placeholder/[width]/[height]`

### NEW APIs to Create
- `GET /api/manga?page=1&category=...` (proxy to Kitsu.io)
- `GET /api/live/channels?category=news|sports|...` (IPTV-org parser)

---

## Tailwind Theme Colors Used

### Background Colors
- `bg-black` (pure black)
- `bg-slate-950` (darkest slate)
- `bg-slate-900` (darker slate)
- `bg-slate-800` (dark slate)

### Background Patterns
- Gradients: `from-black via-slate-950 to-black`
- Glass panels: `bg-slate-950/80` with `backdrop-blur-xl`
- Overlay: `bg-slate-900/60`, `bg-slate-900/70`

### Text Colors
- `text-white` (primary headings)
- `text-slate-100` (body base)
- `text-slate-200` (secondary text)
- `text-slate-300` (muted text)
- `text-slate-400` (very muted)

### Accent Colors
- **Primary**: `bg-cyan-500`, `text-cyan-300`, `border-cyan-400`
- **Secondary** (TV): `bg-indigo-500`, `text-indigo-300`, `border-indigo-400`
- **Highlights**: `text-amber-300` (ratings), `bg-rose-500` (notifications)

### Border Colors
- `border-slate-800/60` (primary borders)
- `border-slate-700` (secondary borders)
- `border-cyan-400/60` (accent borders on hover)

### Rounded Corners
- Large panels: `rounded-3xl` (24px)
- Medium panels: `rounded-2xl` (16px)
- Buttons: `rounded-full`
- Cards: `rounded-[28px]` (custom)

---

## Component Reusability Guide

### When to Create New Components
- ❌ **Don't**: Create duplicate MediaCard for manga (reuse existing)
- ❌ **Don't**: Create new ContentSection for K-Dramas (reuse existing)
- ✅ **Do**: Create IPTVPlayer (unique HLS.js video player)
- ✅ **Do**: Create RivePlayer (new embed source)

### Reusable Components
- `MediaCard.tsx` → Works for movies, TV, anime, K-dramas, manga
- `MediaGrid.tsx` → Works for any grid layout
- `ContentSection.tsx` → Works for any horizontal scroll row
- `FiltersBar.tsx` → Can be adapted for manga categories
- `CatalogResults.tsx` → Works with any paginated API
- `LoadingSkeleton.tsx` → Reusable with type prop
- `ErrorBoundary.tsx` → Wrap any section

### New Components Needed
1. `RivePlayer.tsx` (replacement for PlayerEmbed)
2. `IPTVPlayer.tsx` (HLS.js video player)
3. `ChannelCard.tsx` (optional, or reuse MediaCard)

---

## What Needs to Be Added (Task Summary)

### Step-by-Step Implementation Order
1. ✅ Pre-flight complete (AGENTS.md, .cursorrules, PROJECT_MAP.md, TASK_LOG.md)
2. [ ] Install `hls.js` and `@types/hls.js`
3. [ ] Update next.config.js (add Kitsu, Rivestream domains)
4. [ ] Create `RivePlayer.tsx` component (iframe-based like PlayerEmbed)
5. [ ] Update `app/watch/movie/[id]/page.tsx` to use RivePlayer
6. [ ] Update `app/watch/tv/[id]/[season]/[episode]/page.tsx` to use RivePlayer
7. [ ] Create `app/kdramas/page.tsx` (copy /tv, add language filter)
8. [ ] Create `app/anime/page.tsx` (copy /tv, add language + genre filter)
9. [ ] Create `lib/kitsu.ts` (Kitsu.io API client)
10. [ ] Create `app/manga/page.tsx` (new catalog page)
11. [ ] Create `app/api/manga/route.ts` (Kitsu.io proxy)
12. [ ] Create `lib/iptv.ts` (IPTV-org M3U8 parser)
13. [ ] Create `IPTVPlayer.tsx` (HLS.js video player component)
14. [ ] Create `app/live/page.tsx` (channel browser)
15. [ ] Create `app/live/watch/page.tsx` (IPTV player page)
16. [ ] Update `components/Header.tsx` (add K-Dramas, Anime, Manga, Live TV links)
17. [ ] Update `app/page.tsx` (add new content sections)
18. [ ] Add streaming provider + genre filters (if time permits)
19. [ ] Test all new pages locally
20. [ ] Deploy to Vercel

---

## Testing Strategy

### Manual Browser Testing
1. Run `npm run dev`
2. Navigate to http://localhost:3000
3. Test each route:
   - `/` → Check new sections appear
   - `/kdramas` → Korean dramas load
   - `/anime` → Anime shows load
   - `/manga` → Manga from Kitsu loads
   - `/live` → IPTV channels load
   - `/watch/movie/123` → RivePlayer works
   - `/live/watch?url=...` → HLS video plays

### Automated Tests
- No existing test suite found
- Manual browser testing required for all changes

### Verification Checklist
- [ ] All pages load without errors
- [ ] RivePlayer loads and switches servers
- [ ] IPTVPlayer plays HLS streams
- [ ] TMDB K-Drama filter works (Korean language)
- [ ] TMDB Anime filter works (Japanese + anime genre)
- [ ] Kitsu.io manga API returns data
- [ ] IPTV-org channels parse correctly
- [ ] Header navigation includes all new links
- [ ] Homepage shows all new sections
- [ ] Mobile responsive on all new pages
- [ ] No console errors
- [ ] Images load (TMDB, Kitsu, IPTV logos)

---

## Architecture Decisions

### Why Rivestream?
- Replaces third-party embeds (Vidnest, Videasy, VidSrc)
- Single, reliable source
- Pattern: `https://watch.rivestream.app/{type}/{id}[/{season}/{episode}]`

### Why Kitsu.io for Manga?
- Free, public API
- Comprehensive manga database
- Good image quality for covers
- No API key required (check docs)

### Why IPTV-org?
- Open-source, community-maintained
- Free M3U8 playlists
- Categorized by country and genre
- Works with HLS.js

### Why HLS.js?
- Industry standard for HLS playback
- Works in browsers without native HLS support
- Lightweight, well-maintained
- Compatible with IPTV streams

---

## Performance Considerations

### Server-Side Rendering (SSR)
- All catalog pages use SSR for SEO
- Data fetched at request time
- Cached with `revalidate: 300` (5 min)

### Client-Side Hydration
- Minimal JS for interactive components
- Most content is static HTML
- Player components are client-only

### Image Optimization
- Next.js Image component auto-optimizes
- Lazy loading enabled by default
- Placeholder blur for TMDB images

### Caching Strategy
- TMDB: 5 min cache (`revalidate: 300`)
- Kitsu: 1 hour cache (`revalidate: 3600`)
- IPTV: 24 hour cache (`revalidate: 86400`)

---

## Deployment Notes

### Vercel Configuration
- Environment variables needed:
  - `TMDB_API_KEY` or `TMDB_READ_TOKEN` ✅
  - `CACHE_TTL_SECONDS` (optional, default 300)
  - `ALLOWED_IFRAME_ORIGINS` (optional, defaults in next.config.js)
  
### Build Command
```bash
npm run build
```

### Start Command
```bash
npm start
```

### Deploy Command (Vercel CLI)
```bash
vercel --prod
```

---

**End of PROJECT_MAP.md**
