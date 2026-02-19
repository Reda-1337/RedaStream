import { FEATURED_CHANNELS, type Channel } from "@/lib/iptv"

function safe(value?: string | null) {
  return (value || "").trim()
}

function slug(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || `ch-${Math.random().toString(36).slice(2, 9)}`
}

function attr(extInf: string, key: string) {
  const m = extInf.match(new RegExp(`${key}=\"([^\"]+)\"`, "i"))
  return m?.[1] || ""
}

export function parseM3U(text: string): Channel[] {
  const lines = text.split(/\r?\n/)
  const out: Channel[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line.startsWith('#EXTINF')) continue

    const title = (line.split(',').pop() || '').trim()
    const logo = safe(attr(line, 'tvg-logo'))
    const category = safe(attr(line, 'group-title')) || 'General'
    const language = safe(attr(line, 'tvg-language')) || 'en'
    const country = safe(attr(line, 'tvg-country'))

    let streamUrl = ''
    for (let j = i + 1; j < lines.length; j++) {
      const next = lines[j].trim()
      if (!next || next.startsWith('#')) continue
      streamUrl = next
      i = j
      break
    }

    if (!streamUrl || !/^https?:\/\//i.test(streamUrl)) continue

    const name = title || 'Live Channel'
    const id = `${slug(name)}.${country || 'xx'}`

    out.push({ id, name, logo, category, streamUrl, language, country })
  }

  const dedup = new Map<string, Channel>()
  for (const c of out) {
    if (!dedup.has(c.streamUrl)) dedup.set(c.streamUrl, c)
  }

  return Array.from(dedup.values())
}

export async function loadRemoteLiveChannels(): Promise<Channel[]> {
  const source = process.env.LIVE_CHANNELS_SOURCE_URL
  if (!source) return []

  const res = await fetch(source, {
    cache: 'no-store',
    headers: {
      'User-Agent': 'Mozilla/5.0 RedaStream/1.0',
      Accept: '*/*'
    }
  })

  if (!res.ok) throw new Error(`Live source fetch failed: ${res.status}`)

  const contentType = res.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    const data = await res.json()
    if (!Array.isArray(data)) return []
    return data
      .map((x: any, idx: number) => ({
        id: String(x.id || x.slug || `ext-${idx}`),
        name: String(x.name || x.title || `Channel ${idx + 1}`),
        logo: String(x.logo || ''),
        category: String(x.category || x.group || 'General'),
        streamUrl: String(x.streamUrl || x.url || x.m3u8 || ''),
        language: String(x.language || 'en'),
        country: String(x.country || ''),
      }))
      .filter((x: Channel) => /^https?:\/\//i.test(x.streamUrl))
  }

  const text = await res.text()
  return parseM3U(text)
}

export async function getLiveChannelsMerged() {
  try {
    const remote = await loadRemoteLiveChannels()
    if (remote.length > 0) return remote
  } catch {}
  return FEATURED_CHANNELS
}