/** @type {import('next').NextConfig} */
function parseOrigins(value) {
  return (value || '')
    .split(/[\s,]+/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .join(' ')
}

const DEFAULT_IFRAME_ORIGINS = [
  'https://vidsrc.to',
  'https://*.vidsrc.to',
  'https://vidsrc.vip',
  'https://*.vidsrc.vip',
  'https://vidsrc.xyz',
  'https://*.vidsrc.xyz',
  'https://vidlink.pro',
  'https://*.vidlink.pro',
  'https://vidnest.fun',
  'https://*.vidnest.fun',
  'https://multiembed.mov',
  'https://*.multiembed.mov',
  'https://autoembed.to',
  'https://*.autoembed.to',
  'https://cloudnestra.com',
  'https://*.cloudnestra.com',
  'https://player.videasy.net'
].join(',')

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
      { protocol: 'https', hostname: 'www.themoviedb.org' }
    ]
  },
  async headers() {
    const rawOrigins = [DEFAULT_IFRAME_ORIGINS, process.env.ALLOWED_IFRAME_ORIGINS]
      .filter(Boolean)
      .join(',')
    const allowedFrames = parseOrigins(rawOrigins)

    const csp = [
      "default-src 'self'",
      "img-src 'self' https: data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      `frame-src 'self' ${allowedFrames}`,
      "connect-src 'self' https://api.themoviedb.org https://image.tmdb.org",
      "font-src 'self' data:"
    ].join('; ')

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp }
        ]
      }
    ]
  }
}

module.exports = nextConfig


