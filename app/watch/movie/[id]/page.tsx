import Image from "next/image"
import Link from "next/link"

import Header from "@/components/Header"
import EnhancedFooter from "@/components/EnhancedFooter"
import RivePlayer from "@/components/RivePlayer"
import MediaGrid from "@/components/MediaGrid"
import { tmdbFetch } from "@/lib/tmdb"

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

async function getMovieDetails(id: string): Promise<MovieDetails | null> {
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

const FALLBACK_POSTER = "https://image.tmdb.org/t/p/w500/xJHokMbljvjADYdit5fK5VQsXEG.jpg"

export default async function WatchMoviePage({ params }: { params: { id: string } }) {
  const details = await getMovieDetails(params.id)
  const title = details?.title ?? 'Movie'

  const recommendations = Array.isArray(details?.recommendations?.results) ? details.recommendations.results : []
  const backdrop = details?.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : null
  const poster = details?.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null
  const year = details?.release_date ? details.release_date.slice(0, 4) : undefined
  const runtime = details?.runtime ? `${details.runtime} min` : undefined
  const genres = Array.isArray(details?.genres) ? details.genres : []
  const rating = typeof details?.vote_average === "number" ? details.vote_average.toFixed(1) : "N/A"

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      <section className="relative overflow-hidden">
        {backdrop ? (
          <Image src={backdrop} alt={title} fill priority className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/35 to-transparent" />

        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-16 pt-20 lg:flex-row">
          <div className="w-full max-w-sm">
            <div className="overflow-hidden rounded-[28px] border border-slate-800/60 shadow-[0_25px_60px_rgba(8,47,73,0.45)]">
              <Image
                src={poster || FALLBACK_POSTER}
                alt={title}
                width={500}
                height={750}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div className="mt-6 space-y-3 text-sm text-slate-200">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-900/60 px-3 py-1 text-xs uppercase tracking-[0.4em] text-cyan-200">Movie</span>
                {year && <span className="rounded-full bg-slate-900/60 px-3 py-1 text-xs text-slate-300">{year}</span>}
                <span className="rounded-full bg-slate-900/60 px-3 py-1 text-xs text-amber-300">TMDB {rating}</span>
              </div>
              {runtime && <div className="text-slate-400">Runtime - {runtime}</div>}
              {genres.length > 0 && (
                <div className="text-slate-400">
                  Genres - {genres.map((g: any) => g.name).join(", ")}
                </div>
              )}
              {details?.release_date && (
                <div className="text-slate-400">Released - {details.release_date}</div>
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="glass-panel rounded-[32px] border border-slate-800/60 bg-slate-950/80 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white md:text-4xl">{title}</h1>
                  {details?.tagline && <p className="mt-2 text-sm italic text-slate-400">"{details.tagline}"</p>}
                </div>
                <Link
                  href={`/movie/${params.id}`}
                  className="inline-flex items-center rounded-full border border-slate-700/60 bg-slate-900/70 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/60 hover:text-white"
                >
                  View details
                </Link>
              </div>

              {details?.overview && (
                <p className="mt-4 text-sm text-slate-300 md:text-base md:leading-relaxed">{details.overview}</p>
              )}

              <div className="mt-6">
                <RivePlayer type="movie" tmdbId={params.id} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {recommendations.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-6 pb-16">
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

      <EnhancedFooter />
    </div>
  )
}

