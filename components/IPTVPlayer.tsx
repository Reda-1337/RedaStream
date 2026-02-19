'use client'

import { useEffect, useRef, useState } from 'react'

interface IPTVPlayerProps {
  streamUrl: string
  channelName: string
}

export default function IPTVPlayer({ streamUrl, channelName }: IPTVPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!streamUrl || !videoRef.current) return

    const video = videoRef.current
    let hls: any = null

    const onLoadedMeta = () => {
      setLoading(false)
      video.play().catch(() => null)
    }

    const onVideoError = () => {
      setError('Stream unavailable. The channel may be offline.')
      setLoading(false)
    }

    setError(null)
    setLoading(true)

    if (streamUrl.includes('.m3u8')) {
      import('hls.js')
        .then(({ default: Hls }) => {
          if (Hls.isSupported()) {
            hls = new Hls({ enableWorker: true })
            hls.loadSource(streamUrl)
            hls.attachMedia(video)

            hls.on(Hls.Events.MANIFEST_PARSED, onLoadedMeta)
            hls.on(Hls.Events.ERROR, (_: any, data: any) => {
              if (data?.fatal) onVideoError()
            })
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl
            video.addEventListener('loadedmetadata', onLoadedMeta)
            video.addEventListener('error', onVideoError)
          } else {
            setError('HLS playback is not supported in this browser.')
            setLoading(false)
          }
        })
        .catch(() => {
          setError('Failed to initialize stream player.')
          setLoading(false)
        })
    } else {
      video.src = streamUrl
      video.addEventListener('loadedmetadata', onLoadedMeta)
      video.addEventListener('error', onVideoError)
    }

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMeta)
      video.removeEventListener('error', onVideoError)
      if (hls) hls.destroy()
    }
  }, [streamUrl])

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800/60 shadow-2xl shadow-black/60 focus-ring" tabIndex={0}>
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-400">Loading stream...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/95 z-10">
            <div className="flex flex-col items-center gap-3 text-center px-6">
              <span className="text-4xl">??</span>
              <p className="text-sm text-slate-300 font-medium">{error}</p>
              <p className="text-xs text-slate-500">Try a different channel or check back later.</p>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          controls
          className="w-full h-full"
          title={channelName}
          playsInline
        />
      </div>

      <p className="text-xs text-slate-500 text-center">
        Live stream • Content provided by third-party sources • Availability may vary by channel
      </p>
    </div>
  )
}