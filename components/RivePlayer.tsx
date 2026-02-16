'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

type PlayerType = 'standard' | 'torrent' | 'agg'

interface RivePlayerProps {
    type: 'movie' | 'tv'
    tmdbId: number | string
    season?: number
    episode?: number
    title?: string
}

const RIVE_BASE = process.env.NEXT_PUBLIC_RIVE_EMBED_BASE || 'https://watch.rivestream.app'

function buildUrl(playerType: PlayerType, props: RivePlayerProps): string {
    const { type, tmdbId, season, episode } = props
    const path =
        playerType === 'standard' ? '/embed'
            : playerType === 'torrent' ? '/embed/torrent'
                : '/embed/agg'
    if (type === 'movie') return `${RIVE_BASE}${path}?type=movie&id=${tmdbId}`
    return `${RIVE_BASE}${path}?type=tv&id=${tmdbId}&season=${season ?? 1}&episode=${episode ?? 1}`
}

function buildDownloadUrl(props: RivePlayerProps): string {
    const { type, tmdbId, season, episode } = props
    if (type === 'movie') return `${RIVE_BASE}/download?type=movie&id=${tmdbId}`
    return `${RIVE_BASE}/download?type=tv&id=${tmdbId}&season=${season ?? 1}&episode=${episode ?? 1}`
}

const SERVERS: { id: PlayerType; label: string; badge: string; desc: string }[] = [
    { id: 'standard', label: 'Standard', badge: '⚡', desc: 'Fastest CDN servers with subtitles' },
    { id: 'torrent', label: 'Torrent', badge: '🧲', desc: 'Highest quality (up to 4K)' },
    { id: 'agg', label: 'Multi-Server', badge: '🔀', desc: 'Aggregator fallback' },
]

type LoadState = 'loading' | 'loaded' | 'slow' | 'error'

export default function RivePlayer(props: RivePlayerProps) {
    const [server, setServer] = useState<PlayerType>('standard')
    const [loadState, setLoadState] = useState<LoadState>('loading')
    const [retryCount, setRetryCount] = useState(0)

    const iframeRef = useRef<HTMLIFrameElement>(null)
    const shieldRef = useRef<HTMLDivElement>(null)
    const slowTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const embedUrl = buildUrl(server, props)

    // Clear timers
    const clearTimers = useCallback(() => {
        if (slowTimer.current) { clearTimeout(slowTimer.current); slowTimer.current = null }
        if (errorTimer.current) { clearTimeout(errorTimer.current); errorTimer.current = null }
    }, [])

    // Start timeout-based load detection when URL changes
    useEffect(() => {
        setLoadState('loading')
        clearTimers()

        // After 12s — show "taking a while" (amber, not error)
        slowTimer.current = setTimeout(() => setLoadState('slow'), 12000)

        // After 25s — show error with retry options
        errorTimer.current = setTimeout(() => setLoadState('error'), 25000)

        return clearTimers
    }, [embedUrl, retryCount, clearTimers])

    const handleLoaded = useCallback(() => {
        clearTimers()
        setLoadState('loaded')
    }, [clearTimers])

    const handleServerChange = useCallback((id: PlayerType) => {
        setServer(id)
        setRetryCount(0)
        clearTimers()
    }, [clearTimers])

    const handleRetry = useCallback(() => {
        setRetryCount((c) => c + 1)
    }, [])

    // Click shield for ad protection
    const handleShieldClick = useCallback(() => {
        const shield = shieldRef.current
        if (!shield) return
        shield.style.pointerEvents = 'all'
        setTimeout(() => { if (shield) shield.style.pointerEvents = 'none' }, 100)
    }, [])

    const isVisible = loadState === 'loaded'

    return (
        <div className="w-full flex flex-col gap-4">

            {/* ── Server Bar ── */}
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">Server</span>
                {SERVERS.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => handleServerChange(s.id)}
                        title={s.desc}
                        className={`
              relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold
              transition-all duration-300 select-none
              ${server === s.id
                                ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-[0_4px_20px_rgba(239,68,68,0.4)] scale-[1.03]'
                                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white hover:scale-[1.02]'}
            `}
                    >
                        <span>{s.badge}</span>
                        <span>{s.label}</span>
                        {server === s.id && loadState === 'loading' && (
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse ml-1" />
                        )}
                    </button>
                ))}

                <a
                    href={buildDownloadUrl(props)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold
            bg-slate-800/80 text-slate-400 hover:bg-emerald-600 hover:text-white
            hover:shadow-[0_4px_20px_rgba(16,185,129,0.3)] transition-all duration-300"
                >
                    ⬇️ Download
                </a>
            </div>

            {/* ── Player Container ── */}
            <div className="player-glow relative w-full aspect-video rounded-2xl overflow-hidden bg-black/90 shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-slate-700/40">

                {/* Loading State */}
                {(loadState === 'loading') && (
                    <div className="absolute inset-0 z-10 bg-gradient-to-br from-slate-900 via-slate-950 to-black flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                                <div className="w-14 h-14 rounded-full border-2 border-red-500/30 border-t-red-500 animate-spin" />
                                <div className="absolute inset-0 w-14 h-14 rounded-full border-2 border-transparent border-b-rose-400/50 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-white/80">Loading player…</p>
                                <p className="text-xs text-slate-500 mt-1">Connecting to {SERVERS.find(s => s.id === server)?.label} server</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Slow State — amber nudge, NOT error */}
                {loadState === 'slow' && (
                    <div className="absolute inset-0 z-10 bg-gradient-to-br from-slate-900 via-slate-950 to-black flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4 text-center px-6 max-w-md">
                            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                <span className="text-2xl">⏳</span>
                            </div>
                            <div>
                                <p className="text-white font-semibold">Taking a moment…</p>
                                <p className="text-slate-400 text-sm mt-1">The server is responding slowly. You can wait or try another server.</p>
                            </div>
                            <div className="flex gap-2 mt-1">
                                <button
                                    onClick={handleRetry}
                                    className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-200 text-sm font-medium hover:bg-amber-500/30 transition"
                                >
                                    🔄 Retry
                                </button>
                                {SERVERS.filter(s => s.id !== server).map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => handleServerChange(s.id)}
                                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 hover:text-white transition"
                                    >
                                        {s.badge} {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {loadState === 'error' && (
                    <div className="absolute inset-0 z-10 bg-gradient-to-br from-slate-900 via-slate-950 to-black flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4 text-center px-6 max-w-md">
                            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <span className="text-2xl">⚠️</span>
                            </div>
                            <div>
                                <p className="text-white font-semibold">Server not responding</p>
                                <p className="text-slate-400 text-sm mt-1">This server may be down. Try a different one below.</p>
                            </div>
                            <div className="flex gap-2 mt-1">
                                <button
                                    onClick={handleRetry}
                                    className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-sm font-medium hover:bg-red-500/30 transition"
                                >
                                    🔄 Retry
                                </button>
                                {SERVERS.filter(s => s.id !== server).map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => handleServerChange(s.id)}
                                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 hover:text-white transition"
                                    >
                                        Try {s.badge} {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── The iframe — NO sandbox, other 4 layers handle ads ── */}
                <iframe
                    ref={iframeRef}
                    key={`${embedUrl}-${retryCount}`}
                    src={embedUrl}
                    className={`absolute inset-0 w-full h-full border-0 transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                    allowFullScreen
                    allow="autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write"
                    referrerPolicy="origin"
                    onLoad={handleLoaded}
                />

                {/* Click shield for ad protection */}
                <div
                    ref={shieldRef}
                    className="absolute inset-0 z-20"
                    style={{ pointerEvents: 'none' }}
                    onClick={handleShieldClick}
                    aria-hidden="true"
                />
            </div>

            {/* ── Info Bar ── */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span>⚙️ Subtitles & quality settings available in the player menu</span>
                <span className="flex items-center gap-1.5">
                    🛡️ <span className="text-emerald-500/80">Ad-protected</span>
                </span>
            </div>
        </div>
    )
}
