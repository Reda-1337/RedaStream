export type StreamServer = {
  name: string
  embedUrl: string
  priority: number
}

const BRAND_COLOR = '0EA5E9'

const MOVIE_PROVIDERS = [
  {
    name: 'VidKing',
    priority: 0,
    build: (id: string) => `https://www.vidking.net/embed/movie/${id}`
  },
  {
    name: 'Videasy',
    priority: 1,
    build: (id: string) => `https://player.videasy.net/movie/${id}?color=${BRAND_COLOR}&overlay=true`
  },
  {
    name: 'Vidnest',
    priority: 2,
    build: (id: string) => `https://vidnest.fun/movie/${id}`
  },
  {
    name: 'VidSrc',
    priority: 3,
    build: (id: string) => `https://vidsrc.vip/embed/movie/${id}`
  }
] as const

const TV_PROVIDERS = [
  {
    name: 'VidKing',
    priority: 0,
    build: (id: string, season: string, episode: string) =>
      `https://www.vidking.net/embed/tv/${id}/${season}/${episode}`
  },
  {
    name: 'Videasy',
    priority: 1,
    build: (id: string, season: string, episode: string) =>
      `https://player.videasy.net/tv/${id}/${season}/${episode}?nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&color=${BRAND_COLOR}`
  },
  {
    name: 'Vidnest',
    priority: 2,
    build: (id: string, season: string, episode: string) =>
      `https://vidnest.fun/tv/${id}/${season}/${episode}`
  },
  {
    name: 'VidSrc',
    priority: 3,
    build: (id: string, season: string, episode: string) =>
      `https://vidsrc.vip/embed/tv/${id}/${season}/${episode}`
  }
] as const

function buildMovieServers(id: string) {
  const normalizedId = encodeURIComponent(id)
  return MOVIE_PROVIDERS.map((provider) => ({
    name: provider.name,
    embedUrl: provider.build(normalizedId),
    priority: provider.priority
  }))
}

function buildTvServers(id: string, season: string, episode: string) {
  const normalizedId = encodeURIComponent(id)
  const normalizedSeason = encodeURIComponent(season)
  const normalizedEpisode = encodeURIComponent(episode)
  return TV_PROVIDERS.map((provider) => ({
    name: provider.name,
    embedUrl: provider.build(normalizedId, normalizedSeason, normalizedEpisode),
    priority: provider.priority
  }))
}

export function getMovieServers(id: string): StreamServer[] {
  return buildMovieServers(id)
}

export function getTvServers(id: string, season: string, episode: string): StreamServer[] {
  return buildTvServers(id, season, episode)
}