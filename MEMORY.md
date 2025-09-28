## RedaStream — Project Memory

### Product Direction
- FMovies-inspired catalog and watch experience with TMDB as the primary metadata source
- Server-side proxy to hide TMDB keys, add caching, and normalize responses
- Watch pages embed third-party servers via configurable providers (e.g., Vidnest)

### Key Decisions
- Framework: Next.js (App Router) with SSR/SSG for SEO
- Styling: Tailwind CSS
- API: Next API routes, single `tmdbClient` with Bearer token; response caching
- Streaming: Provider abstraction returns a prioritized list of embed URLs; Player switches on failures
- Filters: URL-driven state for shareability and SSR fetch parity
- SEO: Canonical detail and watch routes; JSON-LD for Movie/TV

### Environment Variables
- `TMDB_API_KEY` or `TMDB_READ_TOKEN` (v4 bearer preferred)
- `ALLOWED_IFRAME_ORIGINS` (CSV of allowed embed hosts)
- `CACHE_TTL_SECONDS` (default 300)

### External APIs
- TMDB base: `https://api.themoviedb.org/3`
- TMDB image: `https://image.tmdb.org/t/p/`
- Streaming embeds (example): `https://vidnest.fun`

### Internal API Contracts
- `/api/trending` — maps to TMDB trending; supports `media_type`, `time_window`, `page`
- `/api/discover` — maps to TMDB discover; supports `type`, `sort_by`, `with_genres`, `with_original_language`, `year`, `page`, `region`, `language`
- `/api/top-imdb` — derived discover query with vote thresholds
- `/api/search` — TMDB multi, filters out `person`
- `/api/details/:type/:id` — appends `videos,images,credits,recommendations,release_dates,content_ratings,external_ids`
- `/api/tv/:id/season/:season` — season details
- `/api/filters` — genres (movie+tv), year range, countries map
- `/api/stream/:type/:id[/:season/:episode]` — provider list `{ servers: [{name, embedUrl, priority}] }`

### UX Patterns
- Header with global search autocomplete and quick filter nav (Movies/TV/Top IMDb/Trending/New)
- Homepage sections (Trending, Latest Movies, Latest TV Episodes, Top IMDb)
- Listing pages with sidebar filters; pagination or infinite scroll
- Detail pages with cast, recommendations, trailers, and watch button
- Watch pages with server tabs, quality label, subtitle toggle placeholder

### Error Handling & Resilience
- Centralized API error shape `{ error: { code, message } }`
- Server-side timeouts and retries for TMDB
- Player auto-switch to next server on iframe error or user report

### Security & Compliance
- TMDB attribution and disclaimer maintained
- CSP with strict `frame-src` allowlist from `ALLOWED_IFRAME_ORIGINS`
- Rate limiting on `/api/search`

### Open Items / Backlog
- Add `/watch/providers` integration for official links
- Add user auth for favorites and history (optional)
- Internationalization of UI strings; language/region propagation to TMDB

### Known Bugs (from MVP)
- `showEpisodeSelector` uses `data.genres` instead of `tvData.genres`; fix during migration

### References
- FMovies UX inspiration: [FMovies](https://www.fmovies.gd/)

- 2025-09-27: Relaxed CSP script-src in next.config.js ('self' 'unsafe-inline' 'unsafe-eval') to fix blank page in production caused by blocked Next.js inline runtime.
