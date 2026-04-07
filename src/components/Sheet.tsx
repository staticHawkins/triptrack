import { useEffect } from 'react'
import { C } from '../lib/constants'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function Sheet({ open, onClose, title, children }: Props) {
  // Lock body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'flex-end' }}>
      {/* Backdrop */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(26,26,46,0.5)', backdropFilter: 'blur(3px)' }}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          background: C.white,
          borderRadius: '12px 12px 0 0',
          padding: '20px 20px 40px',
          maxHeight: '88vh',
          overflowY: 'auto',
          boxShadow: '0 -8px 40px rgba(26,26,46,0.14)',
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(26,26,46,0.15)', margin: '0 auto 20px' }} />
        <p
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 20,
            fontWeight: 700,
            color: C.ink,
            marginBottom: 20,
          }}
        >
          {title}
        </p>
        {children}
      </div>
    </div>
  )
}
