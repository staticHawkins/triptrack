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

    const controller = new AbortController()

    fetch(
      `/api/unsplash-photo?destination=${encodeURIComponent(destination)}`,
      { signal: controller.signal }
    )
      .then(r => r.json())
      .then((data: { url?: string | null }) => {
        const url = data?.url ?? null
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
