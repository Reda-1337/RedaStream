'use client'

import { useState, useRef, useCallback } from 'react'

type PlayerType = 'standard' | 'torrent' | 'agg'

interface RivePlayerProps {
    type: 'movie' | 'tv'
    tmdbId: number | string
    season?: number
    episode?: number
}

const RIVE_BASE = process.env.NEXT_PUBLIC_RIVE_EMBED_BASE || 'https://watch.rivestream.app'

function buildUrl(playerType: PlayerType, props: RivePlayerProps): string {
    const { type, tmdbId, season, episode } = props
    const base =
        playerType === 'standard'
            ? `${RIVE_BASE}/embed`
            : playerType === 'torrent'
                ? `${RIVE_BASE}/embed/torrent`
                : `${RIVE_BASE}/embed/agg`

    if (type === 'movie') return `${base}?type=movie&id=${tmdbId}`
    return `${base}?type=tv&id=${tmdbId}&season=${season}&episode=${episode}`
}

function buildDownloadUrl(props: RivePlayerProps): string {
    const { type, tmdbId, season, episode } = props
    if (type === 'movie')
        return `${RIVE_BASE}/download?type=movie&id=${tmdbId}`
    return `${RIVE_BASE}/download?type=tv&id=${tmdbId}&season=${season}&episode=${episode}`
}

const IFRAME_ALLOW = 'autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write'

const SERVERS: { id: PlayerType; label: string; badge: string; description: string }[] = [
    { id: 'standard', label: 'Standard', badge: '⚡', description: 'Fastest CDN servers' },
    { id: 'torrent', label: 'Torrent', badge: '🧲', description: 'Highest quality (4K)' },
    { id: 'agg', label: 'Multi-Server', badge: '🔀', description: 'Fallback aggregator' },
]

export default function RivePlayer(props: RivePlayerProps) {
    const [server, setServer] = useState<PlayerType>('standard')
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)

    const shieldRef = useRef<HTMLDivElement>(null)

    const embedUrl = buildUrl(server, props)

    const handleServerChange = useCallback((id: PlayerType) => {
        setServer(id)
        setIsLoading(true)
        setHasError(false)
    }, [])

    /* 🛡️ Click shield — intercepts stray popup-triggering clicks.
       Pointer-events are normally 'none' so the player works fine.
       On click, briefly raise them to swallow the ad's window.open. */
    const handleShieldClick = useCallback(() => {
        const shield = shieldRef.current
        if (!shield) return
        shield.style.pointerEvents = 'all'
        setTimeout(() => {
            if (shield) shield.style.pointerEvents = 'none'
        }, 100)
    }, [])

    return (
        <div className="w-full flex flex-col gap-3">
            {/* Server Switcher + Download */}
            <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-slate-400 mr-1">Server:</span>
                {SERVERS.map((s) => (
                    <button
                        key={s.id}
                        type="button"
                        onClick={() => handleServerChange(s.id)}
                        title={s.description}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${server === s.id
                            ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-900/30'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                            }`}
                    >
                        {s.badge} {s.label}
                    </button>
                ))}

                <a
                    href={buildDownloadUrl(props)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-800 text-slate-300 hover:bg-green-700 hover:text-white transition-all"
                >
                    ⬇️ Download
                </a>
            </div>

            {/* Iframe Player */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl shadow-black/60 border border-slate-800/60">
                {/* Loading shimmer */}
                {isLoading && !hasError && (
                    <div className="absolute inset-0 z-10 bg-slate-900 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3 text-slate-500">
                            <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm">Loading player…</p>
                        </div>
                    </div>
                )}

                {/* Error state */}
                {hasError && (
                    <div className="absolute inset-0 z-10 bg-slate-900 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3 text-center px-6">
                            <span className="text-4xl">⚠️</span>
                            <p className="text-white font-semibold">Player failed to load</p>
                            <p className="text-slate-400 text-sm">Try switching to a different server</p>
                            <div className="flex gap-2 mt-1">
                                {SERVERS.filter(s => s.id !== server).map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => handleServerChange(s.id)}
                                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm hover:bg-red-500 transition"
                                    >
                                        Try {s.badge} {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── The actual iframe ── */}
                <iframe
                    key={embedUrl}
                    src={embedUrl}
                    className="absolute inset-0 w-full h-full border-0"
                    allowFullScreen
                    allow={IFRAME_ALLOW}
                    referrerPolicy="origin"
                    loading="lazy"
                    /* 🛡️ LAYER 1 — sandbox: allow everything the player needs,
                       but OMIT allow-popups and allow-top-navigation to
                       block all popup ads and redirect hijacking. */
                    sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-fullscreen"
                    onLoad={() => setIsLoading(false)}
                    onError={() => { setIsLoading(false); setHasError(true) }}
                />

                {/* 🛡️ LAYER 2 — Click shield overlay.
                    pointer-events:none by default so player controls work.
                    Briefly captures stray popup-triggering clicks. */}
                <div
                    ref={shieldRef}
                    className="absolute inset-0 z-20"
                    style={{ pointerEvents: 'none' }}
                    onClick={handleShieldClick}
                    aria-hidden="true"
                />
            </div>

            {/* Info bar */}
            <p className="text-xs text-slate-500 text-center">
                Subtitles available via the in-player settings menu ⚙️ · Content provided by third-party servers
            </p>
        </div>
    )
}
