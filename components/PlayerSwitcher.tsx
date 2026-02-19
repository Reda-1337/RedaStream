"use client"

import { useEffect, useMemo, useState } from "react"
import RivePlayer from "@/components/RivePlayer"
import PlayerEmbed from "@/components/PlayerEmbed"

type RawServer = {
  name?: string
  embedUrl?: string
  url?: string
  priority?: number
}

type Props = {
  type: "movie" | "tv"
  tmdbId: string
  season?: number
  episode?: number
}

export default function PlayerSwitcher({ type, tmdbId, season, episode }: Props) {
  const [mode, setMode] = useState<"new" | "legacy">("new")
  const [legacyServers, setLegacyServers] = useState<RawServer[]>([])
  const [loadingLegacy, setLoadingLegacy] = useState(false)
  const [legacyError, setLegacyError] = useState<string | null>(null)

  const legacyPath = useMemo(() => {
    if (type === "movie") return `/api/stream/movie/${tmdbId}`
    if (!season || !episode) return null
    return `/api/stream/tv/${tmdbId}/${season}/${episode}`
  }, [type, tmdbId, season, episode])

  useEffect(() => {
    if (mode !== "legacy" || !legacyPath || legacyServers.length > 0 || loadingLegacy) return

    let cancelled = false

    const loadLegacy = async () => {
      try {
        setLoadingLegacy(true)
        setLegacyError(null)

        const res = await fetch(legacyPath, { cache: "no-store" })
        if (!res.ok) throw new Error(`Legacy API failed (${res.status})`)

        const data = await res.json()
        const servers = Array.isArray(data?.servers) ? data.servers : []

        if (!cancelled) setLegacyServers(servers)
      } catch (err: any) {
        if (!cancelled) {
          setLegacyError(err?.message || "Failed to load legacy servers")
          setLegacyServers([])
        }
      } finally {
        if (!cancelled) setLoadingLegacy(false)
      }
    }

    loadLegacy()

    return () => {
      cancelled = true
    }
  }, [mode, legacyPath, legacyServers.length, loadingLegacy])

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-xl border border-slate-800/70 bg-slate-900/60 p-1">
        <button
          type="button"
          onClick={() => setMode("new")}
          className={`rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
            mode === "new"
              ? "bg-cyan-500 text-slate-950"
              : "text-slate-400 hover:text-white"
          }`}
        >
          New Player
        </button>
        <button
          type="button"
          onClick={() => setMode("legacy")}
          className={`rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
            mode === "legacy"
              ? "bg-cyan-500 text-slate-950"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Legacy API Players
        </button>
      </div>

      {mode === "new" ? (
        <RivePlayer type={type} tmdbId={tmdbId} season={season} episode={episode} />
      ) : loadingLegacy ? (
        <div className="rounded-3xl border border-slate-800/60 bg-slate-950 px-6 py-10 text-center text-sm text-slate-300">
          Loading legacy servers...
        </div>
      ) : legacyError ? (
        <div className="rounded-3xl border border-rose-500/30 bg-rose-950/20 px-6 py-10 text-center text-sm text-rose-200">
          {legacyError}
        </div>
      ) : (
        <PlayerEmbed initialServers={legacyServers} />
      )}
    </div>
  )
}