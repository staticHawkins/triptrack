import { useEffect, useRef } from 'react'

interface PlaceResult {
  address: string
  lat: number
  lng: number
}

interface Props {
  value: string
  onChange: (val: string) => void
  onPlaceSelect: (place: PlaceResult | null) => void
  style?: React.CSSProperties
  placeholder?: string
}

// Load the Maps JS API once; reuse the same promise on subsequent calls.
let loaderPromise: Promise<void> | null = null

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (loaderPromise) return loaderPromise
  if (typeof window !== 'undefined' && window.google?.maps?.places) {
    loaderPromise = Promise.resolve()
    return loaderPromise
  }
  loaderPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Maps'))
    document.head.appendChild(script)
  })
  return loaderPromise
}

export default function PlacesAutocomplete({ value, onChange, onPlaceSelect, style, placeholder }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY as string | undefined

  useEffect(() => {
    if (!apiKey || !inputRef.current) return

    let cancelled = false
    loadGoogleMaps(apiKey).then(() => {
      if (cancelled || !inputRef.current) return
      const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
        fields: ['formatted_address', 'geometry', 'name'],
      })
      autocompleteRef.current = ac
      ac.addListener('place_changed', () => {
        const place = ac.getPlace()
        if (!place.geometry?.location) {
          onPlaceSelect(null)
          return
        }
        const address = place.formatted_address ?? place.name ?? ''
        onPlaceSelect({
          address,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        })
        // Sync the input value with the chosen address
        onChange(address)
      })
    }).catch(() => {
      // API failed to load — component falls back to plain input
    })

    return () => {
      cancelled = true
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current)
        autocompleteRef.current = null
      }
    }
  }, [apiKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    // If the user clears the field, clear the stored place
    if (!e.target.value) onPlaceSelect(null)
  }

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      style={style}
      autoComplete="off"
    />
  )
}
