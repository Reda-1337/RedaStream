"use client"

import { useEffect, useMemo, useState } from "react"

type RawServer = { name?: string; embedUrl?: string; url?: string; priority?: number }

type Props = {
  initialServers: RawServer[]
}

function normalizeServers(raw: RawServer[]) {
  const seen = new Set<string>()

  return (raw || [])
    .map((server, index) => ({
      name: server?.name || `Server ${index + 1}` ,
      embedUrl: (server?.embedUrl || server?.url || '').trim(),
      priority: typeof server?.priority === 'number' ? server.priority : index,
    }))
    .filter((server) => {
      if (!server.embedUrl) return false
      if (seen.has(server.embedUrl)) return false
      seen.add(server.embedUrl)
      return true
    })
    .sort((a, b) => a.priority - b.priority)
}

const IFRAME_ALLOW_ATTRS = [
  'accelerometer',
  'autoplay',
  'clipboard-write',
  'encrypted-media',
  'fullscreen',
  'picture-in-picture',
].join('; ')

export default function PlayerEmbed({ initialServers }: Props) {
  const servers = useMemo(() => normalizeServers(initialServers), [initialServers])
  const [activeIndex, setActiveIndex] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const [loading, setLoading] = useState(true)
  const [slow, setSlow] = useState(false)

  const active = servers[activeIndex]

  useEffect(() => {
    setLoading(true)
    setSlow(false)

    const timer = setTimeout(() => setSlow(true), 12000)
    return () => clearTimeout(timer)
  }, [activeIndex, attempt, active?.embedUrl])

  const goNext = () => {
    if (servers.length <= 1) return
    setActiveIndex((prev) => (prev + 1) % servers.length)
    setAttempt(0)
  }

  if (!active) {
    return (
      <div className="rounded-3xl border border-slate-800/60 bg-slate-950 px-6 py-8 text-center text-sm text-slate-300">
        No streaming server available right now.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {servers.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          {servers.map((server, index) => {
            const isActive = index === activeIndex
            return (
              <button
                key={`${server.name}-${server.embedUrl}`}
                type="button"
                aria-pressed={isActive}
                onClick={() => {
                  setActiveIndex(index)
                  setAttempt(0)
                }}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950'
                    : 'border border-slate-700/60 bg-slate-900/70 text-slate-300 hover:border-cyan-400/60 hover:text-white'
                }`}
              >
                {server.name}
              </button>
            )
          })}
        </div>
      )}

      <div className="relative overflow-hidden rounded-3xl border border-slate-800/60 bg-black">
        {(loading || slow) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/90">
            <div className="px-6 text-center">
              {loading && <p className="text-sm text-slate-200">Loading {active.name}...</p>}
              {slow && <p className="mt-2 text-xs text-amber-300">This server is slow. Try another server if needed.</p>}
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setAttempt((x) => x + 1)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 hover:border-cyan-400/60"
                >
                  Retry
                </button>
                {servers.length > 1 && (
                  <button
                    type="button"
                    onClick={goNext}
                    className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 hover:border-cyan-400/60"
                  >
                    Next server
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <iframe
          key={`${active.embedUrl}-${attempt}`}
          src={active.embedUrl}
          allow={IFRAME_ALLOW_ATTRS}
          allowFullScreen
          referrerPolicy="origin-when-cross-origin"
          className="aspect-video h-full w-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
          onLoad={() => setLoading(false)}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <span>Tip: If playback stalls, switch server.</span>
        <a
          href={active.embedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-slate-700/60 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-300 transition hover:border-cyan-400/60 hover:text-white"
        >
          Open in new window
        </a>
      </div>
    </div>
  )
}