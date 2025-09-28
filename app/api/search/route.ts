import { advancedSearch } from '@/lib/search'
import { errorResponse } from '@/lib/tmdb'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || searchParams.get('query') || ''
    const page = searchParams.get('page') || '1'
    const language = searchParams.get('language') || undefined
    const rawType = (searchParams.get('type') || 'all').toLowerCase()

    const type = rawType === 'multi' ? 'all' : rawType

    const result = await advancedSearch(q, type as any, page, language)

    if (result.results.length === 0 && result.normalizedQuery.length < 2) {
      return errorResponse('Query too short', 400)
    }

    return Response.json(result, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=600' }
    })
  } catch (e: any) {
    return errorResponse(e.message)
  }
}
