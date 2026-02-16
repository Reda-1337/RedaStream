/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, { dev }) {
    if (dev) {
      config.cache = false
    }
    return config
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'image.tmdb.org' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'www.themoviedb.org' },
      { protocol: 'https', hostname: 'media.kitsu.app' },
      { protocol: 'https', hostname: '*.kitsu.app' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' }
    ]
  },
  /**
   * 🛡️ LAYER 5 — next.config.js hardening
   *
   * Backup security headers applied at the Next.js config level.
   * The middleware also sets CSP; these act as a second line of defense,
   * plus they add COOP/COEP specifically for watch pages.
   */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'off', // Prevent DNS prefetch to ad domains
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
        ],
      },
      // Tightest restrictions on watch pages
      {
        source: '/watch/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin', // Isolates page from popup windows
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none', // Keep — allows Rivestream iframe
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
