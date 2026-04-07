// Minimal type declarations for the Google Maps Places API (dynamically loaded)
declare namespace google {
  namespace maps {
    const event: {
      clearInstanceListeners: (instance: object) => void
    }
    namespace places {
      class Autocomplete {
        constructor(input: HTMLInputElement, opts?: { fields?: string[] })
        addListener(event: string, handler: () => void): void
        getPlace(): {
          formatted_address?: string
          name?: string
          geometry?: {
            location?: {
              lat(): number
              lng(): number
            }
          }
        }
      }
    }
  }
}

interface Window {
  google: typeof google
}
