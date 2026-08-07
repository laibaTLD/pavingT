import { fetchInitialSiteData } from '@/app/lib/serverSiteData'
import { resolveSiteFavicon } from '@/app/lib/metadata'

export const revalidate = 3600

export async function GET() {
  try {
    const data = await fetchInitialSiteData()
    const url = resolveSiteFavicon(data?.site)
    if (!url) {
      return new Response(null, { status: 404 })
    }

    const upstream = await fetch(url, {
      next: { revalidate: 3600 },
      headers: { Accept: 'image/*,*/*' },
    })

    if (!upstream.ok) {
      return new Response(null, { status: 502 })
    }

    const contentType = upstream.headers.get('content-type') || 'image/png'
    const body = await upstream.arrayBuffer()

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    })
  } catch {
    return new Response(null, { status: 500 })
  }
}
