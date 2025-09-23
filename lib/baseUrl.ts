function normalizeUrl(value: string) {
  const trimmed = value.trim()
  const withProtocol = trimmed.startsWith('http://') || trimmed.startsWith('https://')
    ? trimmed
    : `https://${trimmed}`
  return withProtocol.replace(/\/$/, '')
}

export function getBaseUrl() {
  const runtimePort = process.env.PORT || process.env.NEXT_PUBLIC_PORT
  if (runtimePort) {
    return `http://127.0.0.1:${runtimePort}`
  }

  const explicit = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
  if (explicit) {
    return normalizeUrl(explicit)
  }

  return 'http://127.0.0.1:3000'
}
