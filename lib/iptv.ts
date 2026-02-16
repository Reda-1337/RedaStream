// Free IPTV from iptv-org (open source channels)
const IPTV_BASE = 'https://iptv-org.github.io/api'

export type IPTVChannel = {
    id: string
    name: string
    alt_names?: string[]
    network?: string
    owners?: string[]
    country: string
    subdivision?: string
    city?: string
    broadcast_area?: string[]
    languages?: string[]
    categories?: string[]
    is_nsfw?: boolean
    launched?: string
    closed?: string
    replaced_by?: string
    website?: string
    logo?: string
}

export type IPTVStream = {
    channel: string
    url: string
    http_referrer?: string
    user_agent?: string
    status?: string
    width?: number
    height?: number
}

/** Fetch all IPTV channels */
export async function getLiveChannels(): Promise<IPTVChannel[]> {
    try {
        const res = await fetch(`${IPTV_BASE}/channels.json`, {
            next: { revalidate: 86400 },
        })
        if (!res.ok) return FEATURED_CHANNELS.map(ch => ({ id: ch.name, name: ch.name, country: '', logo: ch.logo }))
        return res.json()
    } catch {
        return FEATURED_CHANNELS.map(ch => ({ id: ch.name, name: ch.name, country: '', logo: ch.logo }))
    }
}

/** Fetch all IPTV streams */
export async function getIPTVStreams(): Promise<IPTVStream[]> {
    try {
        const res = await fetch(`${IPTV_BASE}/streams.json`, {
            next: { revalidate: 3600 },
        })
        if (!res.ok) return []
        return res.json()
    } catch {
        return []
    }
}

/** Curated popular channels with known-working HLS streams */
export const FEATURED_CHANNELS = [
    {
        name: 'Al Jazeera English',
        logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Al_Jazeera_Logo.svg/200px-Al_Jazeera_Logo.svg.png',
        streamUrl: 'https://live-hls-web-aje.getaj.net/AJE/01.m3u8',
        category: 'News',
    },
    {
        name: 'NASA TV',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/200px-NASA_logo.svg.png',
        streamUrl: 'https://nasa-i.akamaihd.net/hls/live/253565/NASA-NTV1-HLS/master.m3u8',
        category: 'Science',
    },
    {
        name: 'DW English',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Deutsche_Welle_Logo.svg/200px-Deutsche_Welle_Logo.svg.png',
        streamUrl: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8',
        category: 'News',
    },
    {
        name: 'France 24 English',
        logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/2/24/France_24_logo.svg/200px-France_24_logo.svg.png',
        streamUrl: 'https://static.france.tv/hls/live/2022873/FRN_LV/master.m3u8',
        category: 'News',
    },
    {
        name: 'Euronews',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Euronews_2016_logo.svg/200px-Euronews_2016_logo.svg.png',
        streamUrl: 'https://rakuten-euronews-2-be.samsung.wurl.tv/manifest/playlist.m3u8',
        category: 'News',
    },
    {
        name: 'RT Documentary',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Russia-today-logo.svg/200px-Russia-today-logo.svg.png',
        streamUrl: 'https://rt-doc.rtp.pt/liveukport/smil:live.smil/playlist.m3u8',
        category: 'Documentary',
    },
    {
        name: 'Bloomberg TV',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Bloomberg_logo.svg/200px-Bloomberg_logo.svg.png',
        streamUrl: 'https://www.bloomberg.com/media-manifest/streams/us.m3u8',
        category: 'Business',
    },
    {
        name: 'CGTN',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/CGTN.svg/200px-CGTN.svg.png',
        streamUrl: 'https://news.cgtn.com/resource/live/english/cgtn-news.m3u8',
        category: 'News',
    },
] as const

export type FeaturedChannel = (typeof FEATURED_CHANNELS)[number]
