import { useState, useEffect, useRef, useCallback } from 'react'

interface PlaceResult {
  name: string
  lat: number
  lng: number
}

interface Prediction {
  description: string
  place_id: string
}

interface Props {
  value: string
  onChange: (val: string) => void
  onPlaceSelect: (place: PlaceResult | null) => void
  style?: React.CSSProperties
  placeholder?: string
}

export default function PlacesAutocomplete({ value, onChange, onPlaceSelect, style, placeholder }: Props) {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const fetchPredictions = useCallback((input: string) => {
    if (!input.trim()) {
      setPredictions([])
      setOpen(false)
      return
    }
    fetch(`/api/places-autocomplete?input=${encodeURIComponent(input)}`)
      .then(r => r.json())
      .then((data: { predictions?: Prediction[] }) => {
        const preds = data.predictions ?? []
        setPredictions(preds)
        setOpen(preds.length > 0)
      })
      .catch(() => {
        setPredictions([])
        setOpen(false)
      })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    onChange(val)
    if (!val) onPlaceSelect(null)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchPredictions(val), 300)
  }

  const handleSelect = (pred: Prediction) => {
    onChange(pred.description)
    setOpen(false)
    setPredictions([])
    fetch(`/api/place-details?place_id=${encodeURIComponent(pred.place_id)}`)
      .then(r => r.json())
      .then((data: { name?: string; lat?: number; lng?: number }) => {
        if (data.lat !== undefined && data.lng !== undefined) {
          onPlaceSelect({ name: data.name ?? pred.description, lat: data.lat, lng: data.lng })
        } else {
          onPlaceSelect(null)
        }
      })
      .catch(() => onPlaceSelect(null))
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <input
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        style={style}
        autoComplete="off"
      />
      {open && (
        <ul
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 100,
            margin: 0,
            padding: 0,
            listStyle: 'none',
            background: '#1a1d2e',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8,
            marginTop: 4,
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}
        >
          {predictions.map(pred => (
            <li
              key={pred.place_id}
              onMouseDown={() => handleSelect(pred)}
              style={{
                padding: '10px 14px',
                cursor: 'pointer',
                fontSize: 14,
                color: 'rgba(255,255,255,0.9)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {pred.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
