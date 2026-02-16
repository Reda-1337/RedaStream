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
    // ── Arabic ──
    {
        name: 'Al Jazeera Arabic',
        logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Al_Jazeera_Logo.svg/200px-Al_Jazeera_Logo.svg.png',
        streamUrl: 'https://live-hls-web-aja.getaj.net/AJA/01.m3u8',
        category: 'News',
        language: 'ar',
    },
    {
        name: 'Al Jazeera English',
        logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Al_Jazeera_Logo.svg/200px-Al_Jazeera_Logo.svg.png',
        streamUrl: 'https://live-hls-web-aje.getaj.net/AJE/01.m3u8',
        category: 'News',
        language: 'en',
    },
    {
        name: 'Al Arabiya',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Al_Arabiya_logo.svg/200px-Al_Arabiya_logo.svg.png',
        streamUrl: 'https://live.alarabiya.net/alarabiapublish/alarabiya.smil/playlist.m3u8',
        category: 'News',
        language: 'ar',
    },
    {
        name: 'Sky News Arabia',
        logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2c/Sky_News_Arabia.svg/200px-Sky_News_Arabia.svg.png',
        streamUrl: 'https://stream.skynewsarabia.com/hls/sna.m3u8',
        category: 'News',
        language: 'ar',
    },
    {
        name: 'Al Hadath',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Al_Arabiya_logo.svg/200px-Al_Arabiya_logo.svg.png',
        streamUrl: 'https://live.alarabiya.net/alarabiapublish/alhadath.smil/playlist.m3u8',
        category: 'News',
        language: 'ar',
    },
    {
        name: 'France 24 Arabic',
        logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/2/24/France_24_logo.svg/200px-France_24_logo.svg.png',
        streamUrl: 'https://static.france.tv/hls/live/2022874/FRN_LV/master.m3u8',
        category: 'News',
        language: 'ar',
    },
    {
        name: 'DW Arabic',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Deutsche_Welle_Logo.svg/200px-Deutsche_Welle_Logo.svg.png',
        streamUrl: 'https://dwamdstream104.akamaized.net/hls/live/2015530/dwstream104/index.m3u8',
        category: 'News',
        language: 'ar',
    },
    {
        name: 'Medi1 TV',
        logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/7/77/Logo_M%C3%A9di_1_TV.svg/200px-Logo_M%C3%A9di_1_TV.svg.png',
        streamUrl: 'https://streaming1.medi1tv.com/live/smil:medi1fr.smil/playlist.m3u8',
        category: 'News',
        language: 'ar',
    },
    {
        name: '2M Maroc',
        logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/0/00/2M_logo.svg/200px-2M_logo.svg.png',
        streamUrl: 'https://cdnamd-hls-globecast.akamaized.net/live/ramdisk/2m_monde/hls_snrt/2m_monde.m3u8',
        category: 'Entertainment',
        language: 'ar',
    },
    {
        name: 'Al Aoula',
        logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/3/36/Logo_Al_Aoula.svg/200px-Logo_Al_Aoula.svg.png',
        streamUrl: 'https://cdnamd-hls-globecast.akamaized.net/live/ramdisk/al_aoula_inter/hls_snrt/al_aoula_inter.m3u8',
        category: 'Entertainment',
        language: 'ar',
    },

    // ── International News ──
    {
        name: 'France 24 English',
        logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/2/24/France_24_logo.svg/200px-France_24_logo.svg.png',
        streamUrl: 'https://static.france.tv/hls/live/2022873/FRN_LV/master.m3u8',
        category: 'News',
        language: 'en',
    },
    {
        name: 'DW English',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Deutsche_Welle_Logo.svg/200px-Deutsche_Welle_Logo.svg.png',
        streamUrl: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8',
        category: 'News',
        language: 'en',
    },
    {
        name: 'Euronews',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Euronews_2016_logo.svg/200px-Euronews_2016_logo.svg.png',
        streamUrl: 'https://rakuten-euronews-2-be.samsung.wurl.tv/manifest/playlist.m3u8',
        category: 'News',
        language: 'en',
    },
    {
        name: 'CGTN',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/CGTN.svg/200px-CGTN.svg.png',
        streamUrl: 'https://news.cgtn.com/resource/live/english/cgtn-news.m3u8',
        category: 'News',
        language: 'en',
    },
    {
        name: 'NHK World',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/NHK_World-Japan_logo.svg/200px-NHK_World-Japan_logo.svg.png',
        streamUrl: 'https://nhkworld.webcdn.stream.ne.jp/www11/nhkworld-tv/domestic/263942/live.m3u8',
        category: 'News',
        language: 'en',
    },
    {
        name: 'France 24 French',
        logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/2/24/France_24_logo.svg/200px-France_24_logo.svg.png',
        streamUrl: 'https://static.france.tv/hls/live/2022875/FRN_LV/master.m3u8',
        category: 'News',
        language: 'fr',
    },

    // ── Science & Documentary ──
    {
        name: 'NASA TV',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/200px-NASA_logo.svg.png',
        streamUrl: 'https://nasa-i.akamaihd.net/hls/live/253565/NASA-NTV1-HLS/master.m3u8',
        category: 'Science',
        language: 'en',
    },
    {
        name: 'RT Documentary',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Russia-today-logo.svg/200px-Russia-today-logo.svg.png',
        streamUrl: 'https://rt-doc.rtp.pt/liveukport/smil:live.smil/playlist.m3u8',
        category: 'Documentary',
        language: 'en',
    },

    // ── Business ──
    {
        name: 'Bloomberg TV',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Bloomberg_logo.svg/200px-Bloomberg_logo.svg.png',
        streamUrl: 'https://www.bloomberg.com/media-manifest/streams/us.m3u8',
        category: 'Business',
        language: 'en',
    },

    // ── Sports ──
    {
        name: 'beIN Sports News',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Bein_sport_logo.svg/200px-Bein_sport_logo.svg.png',
        streamUrl: 'https://bfrancetv01-hdpi-hls-web.akamaized.net/live/bfrance01/bfrance01.m3u8',
        category: 'Sports',
        language: 'ar',
    },
    {
        name: 'FIBA Basketball',
        logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4a/FIBA_logo.svg/200px-FIBA_logo.svg.png',
        streamUrl: 'https://live.fibalivetv.com/FIBA/hls/live.m3u8',
        category: 'Sports',
        language: 'en',
    },

    // ── Entertainment ──
    {
        name: 'Arirang TV',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Arirang_TV_logo.svg/200px-Arirang_TV_logo.svg.png',
        streamUrl: 'https://amdlive-ch01.ctnd.com.edgesuite.net/arirang_1ch/smil:arirang_1ch.smil/playlist.m3u8',
        category: 'Entertainment',
        language: 'ko',
    },
    {
        name: 'TRT World',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/TRT_logo.svg/200px-TRT_logo.svg.png',
        streamUrl: 'https://tv-trtworld.live.trt.com.tr/master.m3u8',
        category: 'News',
        language: 'en',
    },
    {
        name: 'TV5 Monde',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/TV5Monde_Logo.svg/200px-TV5Monde_Logo.svg.png',
        streamUrl: 'https://ott.tv5monde.com/Content/HLS/Live/channel(info)/index.m3u8',
        category: 'Entertainment',
        language: 'fr',
    },

    // ── Music ──
    {
        name: 'Trace Urban',
        logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/d/d5/Trace_Urban_2014.svg/200px-Trace_Urban_2014.svg.png',
        streamUrl: 'https://live.creacast.com/trace_urban/smil:trace_urban.smil/playlist.m3u8',
        category: 'Music',
        language: 'en',
    },
    {
        name: 'Rotana Music',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Rotana_logo.svg/200px-Rotana_logo.svg.png',
        streamUrl: 'https://bcovlive-a.akamaihd.net/r8d0b6c0dcf6e4a1c9de4b7bce3b37b53/eu-central-1/6057955867001/playlist.m3u8',
        category: 'Music',
        language: 'ar',
    },
] as const

export type FeaturedChannel = (typeof FEATURED_CHANNELS)[number]
