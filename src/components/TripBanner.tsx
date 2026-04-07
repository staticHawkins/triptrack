import { useState, useEffect } from 'react'
import { destinationGradient } from '../lib/constants'

interface Props {
  destination: string
  height?: number
  children?: React.ReactNode
}

const cache: Record<string, string | null> = {}

export default function TripBanner({ destination, height = 140, children }: Props) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(cache[destination] ?? null)
  const gradient = destinationGradient(destination)

  useEffect(() => {
    if (cache[destination] !== undefined) {
      setPhotoUrl(cache[destination])
      return
    }

    const key = import.meta.env.VITE_UNSPLASH_ACCESS_KEY
    if (!key) return

    const controller = new AbortController()

    fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(destination + ' travel landscape')}&per_page=1&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${key}` }, signal: controller.signal }
    )
      .then(r => r.json())
      .then(data => {
        const url = data?.results?.[0]?.urls?.regular ?? null
        cache[destination] = url
        setPhotoUrl(url)
      })
      .catch(err => {
        if (err.name === 'AbortError') return
        cache[destination] = null
      })

    return () => controller.abort()
  }, [destination])

  return (
    <div
      style={{
        height,
        position: 'relative',
        overflow: 'hidden',
        background: gradient,
        flexShrink: 0,
      }}
    >
      {photoUrl && (
        <img
          src={photoUrl}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 40%',
          }}
        />
      )}
      {/* Gradient scrim — bottom-heavy so text stays readable */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to top, rgba(8,10,22,0.78) 0%, rgba(8,10,22,0.3) 55%, rgba(8,10,22,0.1) 100%)',
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
      >
        {children}
      </div>
    </div>
  )
}
