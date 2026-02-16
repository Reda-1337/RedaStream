const KITSU_BASE = 'https://kitsu.app/api/edge'

const kitsuHeaders: HeadersInit = {
    'Accept': 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
}

export type KitsuManga = {
    id: string
    type: 'manga'
    attributes: {
        slug: string
        titles: { en?: string; en_jp?: string; ja_jp?: string }
        canonicalTitle: string
        synopsis?: string
        averageRating?: string
        startDate?: string
        status?: string
        posterImage?: { tiny?: string; small?: string; medium?: string; large?: string; original?: string }
        coverImage?: { tiny?: string; small?: string; large?: string; original?: string }
        chapterCount?: number | null
        volumeCount?: number | null
        subtype?: string
    }
}

export type KitsuResponse = {
    data: KitsuManga[]
    meta?: { count?: number }
    links?: { first?: string; next?: string; last?: string }
}

/** Fetch trending manga from Kitsu */
export async function getMangaTrending(): Promise<KitsuResponse> {
    const res = await fetch(`${KITSU_BASE}/trending/manga`, {
        headers: kitsuHeaders,
        next: { revalidate: 3600 },
    })
    if (!res.ok) throw new Error(`Kitsu trending failed: ${res.status}`)
    return res.json()
}

/** Fetch popular manga from Kitsu (sorted by user count) */
export async function getMangaPopular(page = 1): Promise<KitsuResponse> {
    const offset = (page - 1) * 20
    const res = await fetch(
        `${KITSU_BASE}/manga?sort=-userCount&page[limit]=20&page[offset]=${offset}`,
        { headers: kitsuHeaders, next: { revalidate: 3600 } }
    )
    if (!res.ok) throw new Error(`Kitsu popular failed: ${res.status}`)
    return res.json()
}

/** Fetch a single manga by ID */
export async function getMangaById(id: string): Promise<{ data: KitsuManga }> {
    const res = await fetch(`${KITSU_BASE}/manga/${id}`, {
        headers: kitsuHeaders,
        next: { revalidate: 86400 },
    })
    if (!res.ok) throw new Error(`Kitsu manga ${id} failed: ${res.status}`)
    return res.json()
}

/** Search manga by query */
export async function searchManga(query: string): Promise<KitsuResponse> {
    const res = await fetch(
        `${KITSU_BASE}/manga?filter[text]=${encodeURIComponent(query)}&page[limit]=20`,
        { headers: kitsuHeaders, next: { revalidate: 3600 } }
    )
    if (!res.ok) throw new Error(`Kitsu search failed: ${res.status}`)
    return res.json()
}
