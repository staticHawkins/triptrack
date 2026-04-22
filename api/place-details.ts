import type { VercelRequest, VercelResponse } from '@vercel/node'

interface GooglePlaceDetailsResponse {
  status: string
  result?: {
    name?: string
    geometry?: {
      location?: { lat: number; lng: number }
    }
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const placeId = req.query.place_id
  if (!placeId || typeof placeId !== 'string') {
    return res.status(400).json({ error: 'place_id query param required' })
  }

  const key = process.env.GOOGLE_MAPS_KEY
  if (!key) {
    return res.status(500).json({ error: 'Google Maps not configured' })
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=name,geometry&key=${key}`
  const upstream = await fetch(url)

  if (!upstream.ok) {
    return res.status(502).json({ error: 'Google Place Details request failed' })
  }

  const data = await upstream.json() as GooglePlaceDetailsResponse
  const location = data.result?.geometry?.location
  if (!location) {
    return res.status(404).json({ error: 'No geometry for this place' })
  }

  return res.status(200).json({
    name: data.result?.name ?? '',
    lat: location.lat,
    lng: location.lng,
  })
}
