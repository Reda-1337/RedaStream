"use client"

import { useMemo, useState } from "react"

type RawServer = { name?: string; embedUrl?: string; url?: string; priority?: number }

type Props = {
  initialServers: RawServer[]
}

function normalizeServers(raw: RawServer[]) {
  const seen = new Set<string>()

  return (raw || [])
    .map((server, index) => ({
      name: server?.name || `Server ${index + 1}`,
      embedUrl: (server?.embedUrl || server?.url || '').trim(),
      priority: typeof server?.priority === 'number' ? server.priority : index
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
  'picture-in-picture'
].join('; ')

export default function PlayerEmbed({ initialServers }: Props) {
  const servers = useMemo(() => normalizeServers(initialServers), [initialServers])
  const [activeIndex, setActiveIndex] = useState(0)
  const active = servers[activeIndex]

  if (!active) {
    return (
      <div className="rounded-3xl border border-slate-800/60 bg-slate-950 px-6 py-8 text-center text-sm text-slate-300">
        No streaming server available.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {servers.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {servers.map((server, index) => {
            const isActive = index === activeIndex
            return (
              <button
                key={`${server.name}-${server.embedUrl}`}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveIndex(index)}
                className={`rounded-full px-4 py-1 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 ${
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

      <div className="overflow-hidden rounded-3xl border border-slate-800/60 bg-black">
        <iframe
          key={active.embedUrl}
          src={active.embedUrl}
          allow={IFRAME_ALLOW_ATTRS}
          allowFullScreen
          referrerPolicy="origin-when-cross-origin"
          className="aspect-video h-full w-full"
        />
      </div>

      <div className="flex items-center justify-center text-xs text-slate-400">
        <a
          href={active.embedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-slate-700/60 px-3 py-1 text-[11px] uppercase tracking-[0.35em] text-slate-300 transition hover:border-cyan-400/60 hover:text-white"
        >
          Open in new window
        </a>
      </div>
    </div>
  )
}
