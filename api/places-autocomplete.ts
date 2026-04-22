import type { VercelRequest, VercelResponse } from '@vercel/node'

interface Prediction {
  description: string
  place_id: string
}

interface GoogleAutocompleteResponse {
  status: string
  predictions: Prediction[]
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const input = req.query.input
  if (!input || typeof input !== 'string') {
    return res.status(400).json({ error: 'input query param required' })
  }

  const key = process.env.GOOGLE_MAPS_KEY
  if (!key) {
    return res.status(500).json({ error: 'Google Maps not configured' })
  }

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=geocode&key=${key}`
  const upstream = await fetch(url)

  if (!upstream.ok) {
    return res.status(502).json({ error: 'Google Places request failed' })
  }

  const data = await upstream.json() as GoogleAutocompleteResponse
  const predictions = (data.predictions ?? []).map(p => ({
    description: p.description,
    place_id: p.place_id,
  }))
  return res.status(200).json({ predictions })
}
