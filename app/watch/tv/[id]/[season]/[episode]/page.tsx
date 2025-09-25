import { tmdbFetch } from "@/lib/tmdb"
import { getTvServers } from "@/lib/streaming"
import WatchTvEpisodeClient from "./WatchTvEpisodeClient"

type TvDetails = {
  backdrop_path?: string | null
  poster_path?: string | null
  first_air_date?: string | null
  vote_average?: number | null
  genres?: Array<{ id: number; name: string }>
  seasons?: Array<{ season_number: number; name?: string; episode_count?: number }>
  recommendations?: { results?: any[] }
  name?: string
  tagline?: string | null
  overview?: string | null
}

type RouteParams = {
  id: string
  season: string
  episode: string
}

type SeasonSummary = {
  season_number: number
  name: string
  episode_count?: number
}

type SeasonDetails = {
  episodes?: Array<{ episode_number: number; name?: string; overview?: string; still_path?: string | null; runtime?: number | null; air_date?: string | null }>
  air_date?: string | null
}

type EpisodeSummary = {
  episode_number: number
  name?: string
  overview?: string
  still_path?: string | null
  runtime?: number | null
  air_date?: string | null
}

const HAS_TMDB_CREDS = Boolean(process.env.TMDB_API_KEY || process.env.TMDB_READ_TOKEN)

async function getTvDetails(id: string): Promise<TvDetails | null> {
  if (!HAS_TMDB_CREDS) return null
  try {
    return await tmdbFetch<TvDetails>(`/tv/${id}`, {
      append_to_response: 'videos,images,credits,recommendations,content_ratings,external_ids'
    })
  } catch (error) {
    console.error(`Failed to load tv show ${id}:`, error)
    return null
  }
}

async function getSeasonDetails(id: string, seasonNumber: number): Promise<SeasonDetails | null> {
  if (!HAS_TMDB_CREDS) return null
  try {
    return await tmdbFetch<SeasonDetails>(`/tv/${id}/season/${seasonNumber}`)
  } catch (error) {
    console.error(`Failed to load tv show ${id} season ${seasonNumber}:`, error)
    return null
  }
}

export default async function WatchTvEpisodePage({ params }: { params: RouteParams }) {
  const id = params.id
  const seasonNumber = Number.parseInt(params.season || "1", 10) || 1
  const episodeNumber = Number.parseInt(params.episode || "1", 10) || 1

  const [details, seasonData] = await Promise.all([
    getTvDetails(id),
    getSeasonDetails(id, seasonNumber)
  ])

  const showName = details?.name ?? 'TV Series'
  const seasons: SeasonSummary[] = Array.isArray(details?.seasons)
    ? details.seasons
        .filter((season: any) => typeof season?.season_number === "number" && season.season_number > 0)
        .map((season: any) => ({
          season_number: season.season_number,
          name: season.name || `Season ${season.season_number}`,
          episode_count: season.episode_count
        }))
    : []

  const episodes: EpisodeSummary[] = Array.isArray(seasonData?.episodes)
    ? seasonData.episodes.map((episode: any) => ({
        episode_number: episode.episode_number,
        name: episode.name,
        overview: episode.overview,
        still_path: episode.still_path,
        runtime: episode.runtime,
        air_date: episode.air_date
      }))
    : []

  const servers = getTvServers(id, String(seasonNumber), String(episodeNumber))

  return (
    <WatchTvEpisodeClient
      id={id}
      seasonNumber={seasonNumber}
      episodeNumber={episodeNumber}
      details={details}
      seasons={seasons}
      episodes={episodes}
      servers={servers}
    />
  )
}

