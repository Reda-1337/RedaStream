import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import EnhancedFooter from '@/components/EnhancedFooter'
import MediaGrid from '@/components/MediaGrid'
import { tmdbFetch } from '@/lib/tmdb'
import { Play, Clock, Star, Calendar } from 'lucide-react'

type MovieDetails = {
  backdrop_path?: string | null
  poster_path?: string | null
  release_date?: string | null
  runtime?: number | null
  vote_average?: number | null
  genres?: Array<{ id: number; name: string }>
  recommendations?: { results?: any[] }
  title?: string
  tagline?: string | null
  overview?: string | null
}

const HAS_TMDB_CREDS = Boolean(process.env.TMDB_API_KEY || process.env.TMDB_READ_TOKEN)

async function getDetails(id: string): Promise<MovieDetails | null> {
  if (!HAS_TMDB_CREDS) return null
  try {
    return await tmdbFetch<MovieDetails>(`/movie/${id}`, {
      append_to_response: 'videos,images,credits,recommendations,release_dates,content_ratings,external_ids'
    })
  } catch (error) {
    console.error(`Failed to load movie ${id}:`, error)
    return null
  }
}

type MoviePageProps = {
  params: { id: string }
}

export default async function MovieDetailsPage({ params }: MoviePageProps) {
  const data = await getDetails(params.id)

  if (!data) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-6 py-24 text-center text-slate-400">
          <p className="text-2xl font-semibold text-white">Movie not found</p>
          <p className="mt-2 text-sm text-slate-400">Try returning to the homepage and exploring other titles.</p>
          <Link href="/" className="mt-6 inline-flex items-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-cyan-400">
            Go home
          </Link>
        </main>
        <EnhancedFooter />
      </div>
    )
  }

  const title = data.title || 'Movie'
  const backdrop = data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null
  const poster = data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null
  const watchHref = `/watch/movie/${params.id}`
  const year = data.release_date ? data.release_date.slice(0, 4) : null
  const runtime = data.runtime ? `${data.runtime} min` : null
  const rating = typeof data.vote_average === 'number' ? data.vote_average.toFixed(1) : 'N/A'
  const genres = Array.isArray(data.genres) ? data.genres : []
  const recommendations = Array.isArray(data.recommendations?.results) ? data.recommendations.results : []

  return (
    <div className="min-h-screen">
      <Header />

      <main className="space-y-16 pb-20">
        <section className="relative">
          <div className="absolute inset-0">
            {backdrop ? (
              <Image
                src={backdrop}
                alt={title}
                fill
                priority
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/30 to-transparent" />
          </div>

          <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pb-16 pt-24 lg:flex-row">
            <div className="glass-card w-full max-w-sm overflow-hidden rounded-[28px] border border-slate-800/50">
              <div className="relative aspect-[2/3]">
                {poster ? (
                  <Image src={poster} alt={title} fill className="object-cover" priority />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-900 text-slate-500">No Poster</div>
                )}
              </div>
              <div className="p-6 space-y-3 text-sm text-slate-300">
                <div className="flex items-center gap-2 text-amber-300">
                  <Star className="h-4 w-4" />
                  <span className="font-semibold">{rating}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span>{year ?? 'Unknown year'}</span>
                </div>
                {runtime && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <span>{runtime}</span>
                  </div>
                )}
                {genres.length > 0 && (
                  <div className="pt-3">
                    <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Genres</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {genres.map((genre: any) => (
                        <span key={genre.id} className="rounded-full border border-slate-700/50 bg-slate-900/60 px-3 py-1 text-xs font-semibold text-slate-200">
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="glass-panel flex-1 rounded-[32px] border border-slate-800/50 bg-slate-950/75 p-8">
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.4em] text-cyan-300">
                <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-cyan-200">Movie</span>
                {year && <span className="rounded-full bg-slate-900/70 px-3 py-1 text-slate-300">{year}</span>}
                <span className="rounded-full bg-slate-900/70 px-3 py-1 text-slate-300">TMDB Score {rating}</span>
              </div>

              <h1 className="mt-5 text-4xl font-bold text-white md:text-5xl">{data.title}</h1>

              {data.tagline && (
                <p className="mt-4 text-sm italic text-slate-400">"{data.tagline}"</p>
              )}

              {data.overview && (
                <p className="mt-6 max-w-3xl text-base text-slate-300 md:text-lg md:leading-relaxed">
                  {data.overview}
                </p>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href={watchHref as any}
                  className="inline-flex items-center gap-3 rounded-full bg-cyan-500 px-8 py-3 text-sm font-semibold text-slate-900 shadow-[0_18px_45px_rgba(6,182,212,0.45)] transition hover:-translate-y-0.5 hover:bg-cyan-400"
                >
                  <Play className="h-5 w-5" />
                  Start Watching
                </Link>
                <button className="inline-flex items-center gap-3 rounded-full border border-slate-700/60 bg-slate-900/70 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/60 hover:text-white">
                  Add to Watchlist
                </button>
                <button className="inline-flex items-center gap-3 rounded-full border border-slate-700/60 bg-slate-900/70 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/60 hover:text-white">
                  Trailer
                </button>
              </div>
            </div>
          </div>
        </section>

        {recommendations.length > 0 && (
          <section className="mx-auto w-full max-w-7xl px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">You may also like</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Similar Titles</h2>
              </div>
            </div>
            <div className="mt-6">
              <MediaGrid items={recommendations} />
            </div>
          </section>
        )}
      </main>

      <EnhancedFooter />
    </div>
  )
}

