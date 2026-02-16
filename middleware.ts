import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * 🛡️ LAYER 4 — Middleware CSP
 *
 * Blocks ad network domains at the HTTP response header level —
 * their scripts / iframes / images never even load.
 */

export function middleware(_request: NextRequest) {
    const response = NextResponse.next()

    /* ---------- Content-Security-Policy ---------- */
    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "font-src 'self' data:",
        // Allow iframes ONLY from Rivestream
        "frame-src 'self' https://watch.rivestream.app https://*.rivestream.app",
        // Allow data fetches to known APIs
        "connect-src 'self' https://api.themoviedb.org https://image.tmdb.org https://kitsu.app https://watch.rivestream.app https://iptv-org.github.io",
        // Allow images from trusted sources only
        "img-src 'self' data: blob: https://image.tmdb.org https://www.themoviedb.org https://media.kitsu.app https://upload.wikimedia.org https://watch.rivestream.app",
        // Prevent other sites from framing us
        "frame-ancestors 'self'",
        // Restrict form submissions
        "form-action 'self'",
    ].join('; ')

    response.headers.set('Content-Security-Policy', csp)

    /* ---------- Extra security headers ---------- */
    response.headers.set('X-Frame-Options', 'SAMEORIGIN')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    /* ---------- Permissions-Policy ---------- */
    response.headers.set(
        'Permissions-Policy',
        [
            'accelerometer=()',
            'camera=()',
            'geolocation=()',
            'gyroscope=()',
            'magnetometer=()',
            'microphone=()',
            'payment=()',
            'usb=()',
            'autoplay=(self "https://watch.rivestream.app")',
            'fullscreen=(self "https://watch.rivestream.app")',
        ].join(', ')
    )

    return response
}

/* Apply to all routes except static/image/favicon assets */
export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
