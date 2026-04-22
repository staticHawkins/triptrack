import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const destination = req.query.destination
  if (!destination || typeof destination !== 'string') {
    return res.status(400).json({ error: 'destination query param required' })
  }

  const key = process.env.UNSPLASH_ACCESS_KEY
  if (!key) {
    return res.status(500).json({ error: 'Unsplash not configured' })
  }

  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(destination + ' travel landscape')}&per_page=1&orientation=landscape`
  const upstream = await fetch(url, { headers: { Authorization: `Client-ID ${key}` } })

  if (!upstream.ok) {
    return res.status(502).json({ error: 'Unsplash request failed' })
  }

  const data = await upstream.json() as { results?: { urls?: { regular?: string } }[] }
  const photoUrl = data?.results?.[0]?.urls?.regular ?? null
  return res.status(200).json({ url: photoUrl })
}
