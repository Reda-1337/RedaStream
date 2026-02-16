"use client"

import { useMemo } from "react"
import Image from "next/image"
import Link from "next/link"

import Header from "@/components/Header"
import EnhancedFooter from "@/components/EnhancedFooter"
import RivePlayer from "@/components/RivePlayer"

type SeasonSummary = {
  season_number: number
  name: string
  episode_count?: number
}

type EpisodeSummary = {
  episode_number: number
  name?: string
  overview?: string
  still_path?: string | null
  runtime?: number | null
  air_date?: string | null
}

type Props = {
  id: string
  seasonNumber: number
  episodeNumber: number
  details: any | null
  seasons: SeasonSummary[]
  episodes: EpisodeSummary[]
}

const FALLBACK_STILL = "https://image.tmdb.org/t/p/w300_and_h169_bestv2/9BO752hELUnx58hYgZjXMPaq0G7.jpg"

function mapEpisodes(list: EpisodeSummary[]): EpisodeSummary[] {
  return list
    .filter((episode) => typeof episode.episode_number === "number" && episode.episode_number > 0)
    .sort((a, b) => a.episode_number - b.episode_number)
}

export default function WatchTvEpisodeClient({
  id,
  seasonNumber,
  episodeNumber,
  details,
  seasons,
  episodes
}: Props) {
  const sortedEpisodes = useMemo(() => mapEpisodes(episodes), [episodes])
  const backdrop = details?.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : null
  const poster = details?.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : FALLBACK_STILL
  const year = details?.first_air_date ? details.first_air_date.slice(0, 4) : undefined
  const rating = typeof details?.vote_average === "number" ? details.vote_average.toFixed(1) : undefined

  const currentEpisode = useMemo(
    () => sortedEpisodes.find((episode) => episode.episode_number === episodeNumber) || null,
    [sortedEpisodes, episodeNumber]
  )

  const { previousEpisodeNumber, nextEpisodeNumber } = useMemo(() => {
    const index = sortedEpisodes.findIndex((episode) => episode.episode_number === episodeNumber)
    return {
      previousEpisodeNumber: index > 0 ? sortedEpisodes[index - 1].episode_number : null,
      nextEpisodeNumber: index >= 0 && index < sortedEpisodes.length - 1 ? sortedEpisodes[index + 1].episode_number : null
    }
  }, [sortedEpisodes, episodeNumber])

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      <section className="relative">
        <div className="absolute inset-0">
          {backdrop ? (
            <Image src={backdrop} alt={details?.name ?? "Series backdrop"} fill priority className="object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-6 pb-20 pt-24">
          <div className="flex flex-col gap-10 lg:flex-row">
            <aside className="w-full max-w-sm space-y-6">
              <div className="overflow-hidden rounded-[28px] border border-slate-800/60 shadow-[0_25px_60px_rgba(8,47,73,0.45)]">
                <div className="relative aspect-[2/3]">
                  <Image src={poster} alt={details?.name ?? "Series poster"} fill className="object-cover" priority />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800/60 bg-slate-950/70 p-5 text-sm text-slate-300">
                <h2 className="text-lg font-semibold text-white">{details?.name ?? "TV Series"}</h2>
                <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.35em] text-slate-400">
                  <span className="rounded-full bg-slate-900/70 px-3 py-1 text-slate-200">TV Show</span>
                  {year && <span className="rounded-full bg-slate-900/70 px-3 py-1">{year}</span>}
                  {rating && <span className="rounded-full bg-slate-900/70 px-3 py-1">TMDB {rating}</span>}
                </div>
                {Array.isArray(details?.genres) && details.genres.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Genres</p>
                    <div className="flex flex-wrap gap-2">
                      {details.genres.map((genre: any) => (
                        <span key={genre.id} className="rounded-full border border-slate-700/60 bg-slate-900/70 px-3 py-1 text-xs">
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>

            <div className="flex-1 space-y-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">
                    Season {seasonNumber} / Episode {episodeNumber}
                  </p>
                  <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">Watch Episode</h1>
                </div>
                <Link
                  href={`/tv/${id}`}
                  className="inline-flex items-center rounded-full border border-slate-700/60 bg-slate-900/70 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/60 hover:text-white"
                >
                  View details
                </Link>
              </div>

              {details?.overview && (
                <p className="max-w-3xl text-sm text-slate-300 md:text-base md:leading-relaxed">{details.overview}</p>
              )}

              <div className="space-y-3">
                <RivePlayer type="tv" tmdbId={id} season={seasonNumber} episode={episodeNumber} />

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.3em] text-slate-400">
                  {previousEpisodeNumber ? (
                    <Link
                      href={`/watch/tv/${id}/${seasonNumber}/${previousEpisodeNumber}`}
                      prefetch={false}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/70 px-4 py-2 text-[11px] font-semibold text-slate-200 transition hover:border-cyan-400/60 hover:text-white"
                    >
                      ← Episode {previousEpisodeNumber.toString().padStart(2, "0")}
                    </Link>
                  ) : (
                    <span />
                  )}

                  {nextEpisodeNumber ? (
                    <Link
                      href={`/watch/tv/${id}/${seasonNumber}/${nextEpisodeNumber}`}
                      prefetch={false}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/70 px-4 py-2 text-[11px] font-semibold text-slate-200 transition hover:border-cyan-400/60 hover:text-white"
                    >
                      Episode {nextEpisodeNumber.toString().padStart(2, "0")}
                      →
                    </Link>
                  ) : (
                    <span />
                  )}
                </div>
              </div>

              {seasons.length > 0 && (
                <div className="rounded-2xl border border-slate-800/60 bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Seasons</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {seasons.map((season) => {
                      const isActive = season.season_number === seasonNumber
                      return (
                        <Link
                          key={season.season_number}
                          href={`/watch/tv/${id}/${season.season_number}/1`}
                          prefetch={false}
                          className={`rounded-full px-5 py-2 text-xs font-semibold transition ${isActive
                              ? "bg-cyan-500 text-slate-950 shadow-[0_10px_25px_rgba(6,182,212,0.35)]"
                              : "border border-slate-700/60 bg-slate-900/70 text-slate-300 hover:border-cyan-400/60 hover:text-white"
                            }`}
                        >
                          <span>{season.name}</span>
                          {typeof season.episode_count === "number" && (
                            <span className="ml-2 text-[10px] uppercase tracking-[0.25em] text-slate-400">
                              {season.episode_count} eps
                            </span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-slate-800/60 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
                  <span>Episodes</span>
                  <span>
                    {sortedEpisodes.length} Episodes · Season {seasonNumber}
                  </span>
                </div>
                {sortedEpisodes.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-400">No episode information available.</p>
                ) : (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {sortedEpisodes.map((episode) => {
                      const target = episode.episode_number
                      const isActive = target === episodeNumber
                      const still = episode.still_path
                        ? `https://image.tmdb.org/t/p/w500${episode.still_path}`
                        : FALLBACK_STILL
                      return (
                        <Link
                          key={target}
                          href={`/watch/tv/${id}/${seasonNumber}/${target}`}
                          prefetch={false}
                          className={`group overflow-hidden rounded-2xl border text-left transition ${isActive
                              ? "border-cyan-400/60 bg-cyan-500/10 text-cyan-100"
                              : "border-slate-700/60 bg-slate-900/70 text-slate-300 hover:border-cyan-400/40 hover:text-white"
                            }`}
                        >
                          <div className="relative h-36 w-full overflow-hidden">
                            <Image
                              src={still}
                              alt={episode.name ?? `Episode ${target}`}
                              fill
                              className="object-cover transition duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/5 to-transparent" />
                            <div className="absolute left-3 top-3 rounded-full bg-slate-950/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-100">
                              Ep {target.toString().padStart(2, "0")}
                            </div>
                          </div>
                          <div className="space-y-2 p-4">
                            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-slate-400">
                              <span>{episode.runtime ? `${episode.runtime} min` : ""}</span>
                              {episode.air_date && <span>{episode.air_date}</span>}
                            </div>
                            <div className="text-sm font-semibold text-white line-clamp-1">
                              {episode.name || "Untitled"}
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-3">
                              {episode.overview || "No synopsis available."}
                            </p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>

              {currentEpisode && (
                <div className="flex flex-col gap-4 rounded-[28px] border border-slate-800/60 bg-slate-950/70 p-6 md:flex-row">
                  <div className="relative h-32 w-full overflow-hidden rounded-2xl border border-slate-800/60 md:h-40 md:w-64">
                    <Image
                      src={currentEpisode.still_path ? `https://image.tmdb.org/t/p/w500${currentEpisode.still_path}` : FALLBACK_STILL}
                      alt={currentEpisode.name ?? "Episode still"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-2 text-sm text-slate-300">
                    <h2 className="text-lg font-semibold text-white">
                      Episode {episodeNumber}: {currentEpisode.name ?? "Untitled"}
                    </h2>
                    {currentEpisode.runtime ? (
                      <p className="text-slate-400">Runtime - {currentEpisode.runtime} min</p>
                    ) : null}
                    {currentEpisode.air_date ? (
                      <p className="text-slate-400">Air date - {currentEpisode.air_date}</p>
                    ) : null}
                    <p className="text-sm leading-relaxed text-slate-300">
                      {currentEpisode.overview || "No synopsis provided for this episode."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  )
}
