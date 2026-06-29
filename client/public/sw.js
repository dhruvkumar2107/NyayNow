const CACHE_VERSION = 'v2'
const STATIC_CACHE = `nyaynow-static-${CACHE_VERSION}`
const API_CACHE = `nyaynow-api-${CACHE_VERSION}`

const STATIC_PRECACHE = [
  '/',
  '/marketplace',
  '/assistant',
  '/manifest.json',
]

const API_ORIGIN = self.location.origin

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_PRECACHE))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== API_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Never intercept non-GET, cross-origin (except same-origin api), or chrome-extension
  if (request.method !== 'GET') return
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return

  // API routes: network-first, fall back to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE))
    return
  }

  // Next.js internals / HMR: always network
  if (url.pathname.startsWith('/_next/')) {
    return
  }

  // HTML documents: network-first (prevents stale HTML referencing dead hashed CSS/JS assets)
  const isHTML = request.headers.get('accept')?.includes('text/html')
  if (isHTML) {
    event.respondWith(networkFirst(request, STATIC_CACHE))
    return
  }

  // Static assets and pages: cache-first
  event.respondWith(cacheFirst(request, STATIC_CACHE))
})

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('Offline — content not available', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    })
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    return (
      cached ||
      new Response(JSON.stringify({ error: 'Offline' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      })
    )
  }
}
