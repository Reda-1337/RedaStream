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

type Mode = "api" | "backup"
const MODE_KEY = "redastream_player_mode"

export default function PlayerSwitcher({ type, tmdbId, season, episode }: Props) {
  const [mode, setMode] = useState<Mode>("api")
  const [apiServers, setApiServers] = useState<RawServer[]>([])
  const [loadingApi, setLoadingApi] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const apiPath = useMemo(() => {
    if (type === "movie") return `/api/stream/movie/${tmdbId}`
    if (!season || !episode) return null
    return `/api/stream/tv/${tmdbId}/${season}/${episode}`
  }, [type, tmdbId, season, episode])

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(MODE_KEY) as Mode | null
      if (saved === "api" || saved === "backup") setMode(saved)
    } catch {}
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(MODE_KEY, mode)
    } catch {}
  }, [mode])

  useEffect(() => {
    if (!apiPath || apiServers.length > 0 || loadingApi) return

    let cancelled = false

    const loadApiServers = async () => {
      try {
        setLoadingApi(true)
        setApiError(null)

        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 9000)
        const res = await fetch(apiPath, { cache: "no-store", signal: controller.signal }).finally(() => clearTimeout(timeout))
        if (!res.ok) throw new Error(`API player failed (${res.status})`)

        const data = await res.json()
        const servers = Array.isArray(data?.servers) ? data.servers : []

        if (!cancelled) {
          setApiServers(servers)
          if (servers.length === 0) {
            setApiError("No API servers available for this title")
            setMode("backup")
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          const msg = err?.name === "AbortError" ? "API timeout" : (err?.message || "Failed to load API servers")
          setApiError(msg)
          setApiServers([])
          setMode("backup")
        }
      } finally {
        if (!cancelled) setLoadingApi(false)
      }
    }

    loadApiServers()

    return () => {
      cancelled = true
    }
  }, [apiPath, apiServers.length, loadingApi])

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-xl border border-slate-800/70 bg-slate-900/60 p-1">
        <button
          type="button"
          onClick={() => setMode("api")}
          className={`rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition ${
            mode === "api"
              ? "bg-cyan-500 text-slate-950"
              : "text-slate-400 hover:text-white"
          }`}
        >
          API Player (Recommended)
        </button>
        <button
          type="button"
          onClick={() => setMode("backup")}
          className={`rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition ${
            mode === "backup"
              ? "bg-cyan-500 text-slate-950"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Backup Player
        </button>
      </div>

      {apiError && mode === "api" && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {apiError} — switched to backup when needed.
        </div>
      )}

      {mode === "api" ? (
        loadingApi ? (
          <div className="rounded-3xl border border-slate-800/60 bg-slate-950 px-6 py-10 text-center text-sm text-slate-300">
            Loading API servers... (auto-fallback in ~9s)
          </div>
        ) : (
          <PlayerEmbed initialServers={apiServers} />
        )
      ) : (
        <RivePlayer type={type} tmdbId={tmdbId} season={season} episode={episode} />
      )}
    </div>
  )
}