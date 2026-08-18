export interface GeocodeResult {
  latitude: number
  longitude: number
  displayName: string
}

interface NominatimResult {
  lat: string
  lon: string
  display_name: string
}

async function geocodeQuery(query: string): Promise<GeocodeResult | null> {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', query)
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '1')

  const response = await fetch(url.toString(), { headers: { Accept: 'application/json' } })
  if (!response.ok) return null

  const results = (await response.json()) as NominatimResult[]
  const first = results[0]
  if (!first) return null

  return {
    latitude: Number(first.lat),
    longitude: Number(first.lon),
    displayName: first.display_name,
  }
}

/**
 * Free forward geocoding via OpenStreetMap's Nominatim service — no API key
 * required. Handles full real-world addresses ("National Bank of Abu Dhabi,
 * N Teseen, New Cairo 1, Cairo Governorate 4730115"), not just "City,
 * Country" — but Nominatim's free-text matching can fail on the full string
 * when it includes a postal code or an abbreviated street segment that isn't
 * indexed verbatim, even though a less-specific version of the same address
 * resolves fine. So: try the full address first, then progressively drop
 * trailing comma-separated segments (postal code, sub-district, …) until
 * something matches or nothing is left.
 */
export async function geocodeAddress(query: string): Promise<GeocodeResult | null> {
  const trimmed = query.trim()
  if (!trimmed) return null

  const segments = trimmed
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  for (let dropCount = 0; dropCount < segments.length; dropCount++) {
    const candidate = segments.slice(0, segments.length - dropCount).join(', ')
    const result = await geocodeQuery(candidate)
    if (result) return result
  }

  return null
}
