import Header from '@/components/Header'
import EnhancedFooter from '@/components/EnhancedFooter'
import EnhancedHeroSection from '@/components/EnhancedHeroSection'
import ContentSection from '@/components/ContentSection'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import ErrorBoundary from '@/components/ErrorBoundary'
import { tmdbFetch, getKDramas, getAnime } from '@/lib/tmdb'
import { FEATURED_CHANNELS } from '@/lib/iptv'
import { Suspense } from 'react'
import Link from 'next/link'
import {
  FALLBACK_MOVIES,
  FALLBACK_TRENDING,
  FALLBACK_TV,
  FALLBACK_UPCOMING
} from '@/components/home/fallbackData'

const HAS_TMDB_CREDS = Boolean(process.env.TMDB_API_KEY || process.env.TMDB_READ_TOKEN)

async function getTrending() {
  if (!HAS_TMDB_CREDS) return { results: FALLBACK_TRENDING }
  try {
    return await tmdbFetch<{ results?: any[] }>('/trending/all/week', { page: '1' })
  } catch (error) {
    console.error('Error fetching trending data:', error)
    return { results: FALLBACK_TRENDING }
  }
}

async function getPopularMovies() {
  if (!HAS_TMDB_CREDS) return { results: FALLBACK_MOVIES }
  try {
    return await tmdbFetch<{ results?: any[] }>('/discover/movie', {
      sort_by: 'popularity.desc',
      page: '1'
    })
  } catch (error) {
    console.error('Error fetching popular movies:', error)
    return { results: FALLBACK_MOVIES }
  }
}

async function getPopularTV() {
  if (!HAS_TMDB_CREDS) return { results: FALLBACK_TV }
  try {
    return await tmdbFetch<{ results?: any[] }>('/discover/tv', {
      sort_by: 'popularity.desc',
      page: '1'
    })
  } catch (error) {
    console.error('Error fetching popular TV:', error)
    return { results: FALLBACK_TV }
  }
}

async function getTopRatedMovies() {
  if (!HAS_TMDB_CREDS) return { results: FALLBACK_MOVIES }
  try {
    return await tmdbFetch<{ results?: any[] }>('/discover/movie', {
      sort_by: 'vote_average.desc',
      page: '1',
      'vote_count.gte': '200'
    })
  } catch (error) {
    console.error('Error fetching top rated movies:', error)
    return { results: FALLBACK_MOVIES }
  }
}

async function getTopRatedTV() {
  if (!HAS_TMDB_CREDS) return { results: FALLBACK_TV }
  try {
    return await tmdbFetch<{ results?: any[] }>('/discover/tv', {
      sort_by: 'vote_average.desc',
      page: '1',
      'vote_count.gte': '200'
    })
  } catch (error) {
    console.error('Error fetching top rated TV:', error)
    return { results: FALLBACK_TV }
  }
}

async function getUpcomingMovies() {
  if (!HAS_TMDB_CREDS) return { results: FALLBACK_UPCOMING }
  try {
    return await tmdbFetch<{ results?: any[] }>('/discover/movie', {
      sort_by: 'primary_release_date.asc',
      page: '1',
      'primary_release_date.gte': new Date().toISOString().slice(0, 10)
    })
  } catch (error) {
    console.error('Error fetching upcoming movies:', error)
    return { results: FALLBACK_UPCOMING }
  }
}

function unwrapResults<T extends { results?: any[] }>(data: T | null | undefined) {
  if (!data || !Array.isArray(data.results)) return []
  return data.results
}

async function safeGetKDramas() {
  if (!HAS_TMDB_CREDS) return []
  try {
    const data = await getKDramas()
    return (data.results || []).map((item: any) => ({ ...item, media_type: 'tv' }))
  } catch {
    return []
  }
}

async function safeGetAnime() {
  if (!HAS_TMDB_CREDS) return []
  try {
    const data = await getAnime()
    return (data.results || []).map((item: any) => ({ ...item, media_type: 'tv' }))
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [trendingData, popularMoviesData, popularTVData, topRatedMoviesData, topRatedTVData, upcomingMoviesData, kdramaItems, animeItems] = await Promise.all([
    getTrending(),
    getPopularMovies(),
    getPopularTV(),
    getTopRatedMovies(),
    getTopRatedTV(),
    getUpcomingMovies(),
    safeGetKDramas(),
    safeGetAnime(),
  ])

  const trendingItems = unwrapResults(trendingData)
  const popularMovies = unwrapResults(popularMoviesData)
  const popularTV = unwrapResults(popularTVData)
  const topRatedMovies = unwrapResults(topRatedMoviesData)
  const topRatedTV = unwrapResults(topRatedTVData)
  const upcomingMovies = unwrapResults(upcomingMoviesData)

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <Header />

      <main className="relative">
        <Suspense fallback={<LoadingSkeleton type="hero" />}>
          <div id="hero-section">
            <EnhancedHeroSection items={trendingItems} />
          </div>
        </Suspense>

        <div className="space-y-16 pb-20">
          <ErrorBoundary fallback={<div className="py-8 text-center text-gray-400">Failed to load trending content</div>}>
            <ContentSection
              sectionId="trending-section"
              title="Trending Now"
              subtitle="Most watched across movies and TV this week."
              icon="TN"
              items={trendingItems.slice(0, 20)}
              viewAllHref="/"
            />
          </ErrorBoundary>

          <ErrorBoundary fallback={<div className="py-8 text-center text-gray-400">Failed to load popular movies</div>}>
            <ContentSection
              sectionId="popular-movies-section"
              title="Popular Movies"
              subtitle="Fan favourites heating up right now."
              icon="PM"
              items={popularMovies.slice(0, 20)}
              viewAllHref="/movies"
            />
          </ErrorBoundary>

          <ErrorBoundary fallback={<div className="py-8 text-center text-gray-400">Failed to load popular TV shows</div>}>
            <ContentSection
              sectionId="popular-tv-section"
              title="Popular TV Shows"
              subtitle="Series viewers keep returning to."
              icon="TV"
              items={popularTV.slice(0, 20)}
              viewAllHref="/tv"
            />
          </ErrorBoundary>

          <ErrorBoundary fallback={<div className="py-8 text-center text-gray-400">Failed to load top rated movies</div>}>
            <ContentSection
              sectionId="top-rated-movies-section"
              title="Top Rated Movies"
              subtitle="Critic-approved films worth your time."
              icon="TR"
              items={topRatedMovies.slice(0, 20)}
              viewAllHref="/movies?sort=rating"
            />
          </ErrorBoundary>

          <ErrorBoundary fallback={<div className="py-8 text-center text-gray-400">Failed to load top rated TV shows</div>}>
            <ContentSection
              sectionId="top-rated-tv-section"
              title="Top Rated TV Shows"
              subtitle="Acclaimed series with standout seasons."
              icon="AT"
              items={topRatedTV.slice(0, 20)}
              viewAllHref="/tv?sort=rating"
            />
          </ErrorBoundary>

          <ErrorBoundary fallback={<div className="py-8 text-center text-gray-400">Failed to load upcoming movies</div>}>
            <ContentSection
              sectionId="coming-soon-section"
              title="Coming Soon"
              subtitle="Set reminders for the next wave of releases."
              icon="CS"
              items={upcomingMovies.slice(0, 20)}
              viewAllHref="/movies?sort=upcoming"
            />
          </ErrorBoundary>

          {kdramaItems.length > 0 && (
            <ErrorBoundary fallback={<div className="py-8 text-center text-gray-400">Failed to load K-Dramas</div>}>
              <ContentSection
                sectionId="kdramas-section"
                title="K-Dramas"
                subtitle="Popular Korean dramas trending this week."
                icon="🇰🇷"
                items={kdramaItems.slice(0, 20)}
                viewAllHref="/kdramas"
              />
            </ErrorBoundary>
          )}

          {animeItems.length > 0 && (
            <ErrorBoundary fallback={<div className="py-8 text-center text-gray-400">Failed to load Anime</div>}>
              <ContentSection
                sectionId="anime-section"
                title="Anime"
                subtitle="Top anime series from Japan."
                icon="🍥"
                items={animeItems.slice(0, 20)}
                viewAllHref="/anime"
              />
            </ErrorBoundary>
          )}

          {/* Live TV Section */}
          <section className="px-4 sm:px-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/15 text-red-400">
                  <span className="inline-block w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                </span>
                <div>
                  <h2 className="text-2xl font-semibold text-white">Live TV</h2>
                  <p className="text-sm text-slate-400">Free live channels from around the world.</p>
                </div>
              </div>
              <Link
                href="/live"
                className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-300 transition hover:border-cyan-400/60 hover:text-white"
              >
                View All
                <span className="text-cyan-400">{'>'}</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {FEATURED_CHANNELS.slice(0, 4).map((ch, i) => (
                <Link
                  key={i}
                  href={`/live/watch?url=${encodeURIComponent(ch.streamUrl)}&name=${encodeURIComponent(ch.name)}`}
                  className="flex items-center gap-3 p-4 rounded-2xl border border-slate-800/60 bg-slate-900/50 hover:bg-slate-800/70 hover:border-cyan-400/30 transition-all"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ch.logo} alt={ch.name} className="h-8 w-auto object-contain" loading="lazy" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-white font-medium truncate block">{ch.name}</span>
                    <span className="text-xs text-red-400 flex items-center gap-1 mt-0.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      LIVE
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      <EnhancedFooter />
    </div>
  )
}


