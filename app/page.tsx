import Header from '@/components/Header'
import EnhancedFooter from '@/components/EnhancedFooter'
import EnhancedHeroSection from '@/components/EnhancedHeroSection'
import ContentSection from '@/components/ContentSection'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import ErrorBoundary from '@/components/ErrorBoundary'
import { getBaseUrl } from '@/lib/baseUrl'
import { Suspense } from 'react'

async function getTrending() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/trending?media_type=all&time_window=week`, {
      next: { revalidate: Number(process.env.CACHE_TTL_SECONDS || 300) }
    })
    if (!res.ok) throw new Error(`Trending API failed: ${res.status}`)
    return res.json()
  } catch (error) {
    console.error('Error fetching trending data:', error)
    return { results: [] as any[] }
  }
}

async function getPopularMovies() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/discover?type=movie&sort_by=popularity.desc&page=1`, {
      next: { revalidate: Number(process.env.CACHE_TTL_SECONDS || 300) }
    })
    if (!res.ok) throw new Error(`Popular Movies API failed: ${res.status}`)
    return res.json()
  } catch (error) {
    console.error('Error fetching popular movies:', error)
    return { results: [] as any[] }
  }
}

async function getPopularTV() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/discover?type=tv&sort_by=popularity.desc&page=1`, {
      next: { revalidate: Number(process.env.CACHE_TTL_SECONDS || 300) }
    })
    if (!res.ok) throw new Error(`Popular TV API failed: ${res.status}`)
    return res.json()
  } catch (error) {
    console.error('Error fetching popular TV:', error)
    return { results: [] as any[] }
  }
}

async function getTopRatedMovies() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/discover?type=movie&sort_by=vote_average.desc&page=1`, {
      next: { revalidate: Number(process.env.CACHE_TTL_SECONDS || 300) }
    })
    if (!res.ok) throw new Error(`Top Rated Movies API failed: ${res.status}`)
    return res.json()
  } catch (error) {
    console.error('Error fetching top rated movies:', error)
    return { results: [] as any[] }
  }
}

async function getTopRatedTV() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/discover?type=tv&sort_by=vote_average.desc&page=1`, {
      next: { revalidate: Number(process.env.CACHE_TTL_SECONDS || 300) }
    })
    if (!res.ok) throw new Error(`Top Rated TV API failed: ${res.status}`)
    return res.json()
  } catch (error) {
    console.error('Error fetching top rated TV:', error)
    return { results: [] as any[] }
  }
}

async function getUpcomingMovies() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/discover?type=movie&sort_by=release_date.desc&page=1`, {
      next: { revalidate: Number(process.env.CACHE_TTL_SECONDS || 300) }
    })
    if (!res.ok) throw new Error(`Upcoming Movies API failed: ${res.status}`)
    return res.json()
  } catch (error) {
    console.error('Error fetching upcoming movies:', error)
    return { results: [] as any[] }
  }
}

export default async function HomePage() {
  const [trendingData, popularMoviesData, popularTVData, topRatedMoviesData, topRatedTVData, upcomingMoviesData] = await Promise.all([
    getTrending(),
    getPopularMovies(),
    getPopularTV(),
    getTopRatedMovies(),
    getTopRatedTV(),
    getUpcomingMovies()
  ])

  const trendingItems = Array.isArray(trendingData.results) ? trendingData.results : []
  const popularMovies = Array.isArray(popularMoviesData.results) ? popularMoviesData.results : []
  const popularTV = Array.isArray(popularTVData.results) ? popularTVData.results : []
  const topRatedMovies = Array.isArray(topRatedMoviesData.results) ? topRatedMoviesData.results : []
  const topRatedTV = Array.isArray(topRatedTVData.results) ? topRatedTVData.results : []
  const upcomingMovies = Array.isArray(upcomingMoviesData.results) ? upcomingMoviesData.results : []

  const heroItems =
    trendingItems.length > 0
      ? trendingItems
      : popularMovies.length > 0
      ? popularMovies
      : popularTV.length > 0
      ? popularTV
      : topRatedMovies.length > 0
      ? topRatedMovies
      : topRatedTV.length > 0
      ? topRatedTV
      : upcomingMovies

  const allEmpty = [
    trendingItems.length,
    upcomingMovies.length,
    popularMovies.length,
    popularTV.length,
    topRatedMovies.length,
    topRatedTV.length
  ].every((n) => n === 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <Header />

      <main className="relative">
        <Suspense fallback={<LoadingSkeleton type="hero" />}>
          <div id="hero-section">
            <EnhancedHeroSection items={heroItems} />
          </div>
        </Suspense>

        <div className="space-y-16 pb-20">
          {trendingItems.length > 0 && (
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
          )}

          {popularMovies.length > 0 && (
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
          )}

          {popularTV.length > 0 && (
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
          )}

          {topRatedMovies.length > 0 && (
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
          )}

          {topRatedTV.length > 0 && (
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
          )}

          {upcomingMovies.length > 0 && (
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
          )}

          {allEmpty && (
            <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8 text-center">
              <h2 className="mb-2 text-2xl font-semibold text-white">Content is warming up</h2>
              <p className="mb-4 text-gray-400">
                Add your TMDB API credentials to .env.local and restart the dev server to unlock live data feeds.
              </p>
              <div className="inline-block rounded-lg border border-gray-800 bg-black/40 p-4 text-left text-sm text-gray-300">
                <pre>{`# .env.local
TMDB_API_KEY=your_tmdb_api_key
# or
# TMDB_READ_TOKEN=your_tmdb_v4_bearer_token
CACHE_TTL_SECONDS=300`}</pre>
              </div>
              <p className="mt-4 text-sm text-gray-500">Need help? Visit /api/health to confirm connectivity.</p>
            </div>
          )}
        </div>
      </main>

      <EnhancedFooter />
    </div>
  )
}


