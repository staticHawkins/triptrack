import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

interface TopNavProps {
  onBack?: () => void
  backLabel?: string
  action?: React.ReactNode
}

export default function TopNav({ onBack, backLabel = 'Back', action }: TopNavProps) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const avatar = user?.user_metadata?.picture as string | undefined
  const initials = user?.email?.slice(0, 1).toUpperCase() ?? '?'
  const name = user?.user_metadata?.full_name as string | undefined
  const email = user?.email ?? ''

  return (
    <div
      className="sticky top-0 z-[100] flex items-center justify-between px-5 h-14"
      style={{ background: '#1A1A2E', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div>
        {onBack ? (
          <button
            onClick={onBack}
            className="bg-transparent border-none cursor-pointer text-[13px]"
            style={{ color: 'rgba(245,240,232,0.65)', fontFamily: 'inherit' }}
          >
            ← {backLabel}
          </button>
        ) : (
          <span
            className="text-[20px] font-bold"
            style={{ fontFamily: "'Playfair Display', serif", color: '#F5F0E8' }}
          >
            Trip<span style={{ color: '#E8895A' }}>Track</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {action}

        {!onBack && (
          <div ref={ref} style={{ position: 'relative' }}>
            {/* Avatar button */}
            <button
              onClick={() => setOpen(o => !o)}
              className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-[13px] font-semibold cursor-pointer border-none"
              style={{ background: '#C4622D', color: '#FFFFFF', fontFamily: 'inherit', padding: 0 }}
            >
              {avatar ? (
                <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                initials
              )}
            </button>

            {/* Dropdown */}
            {open && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  background: '#FFFFFF',
                  borderRadius: 10,
                  boxShadow: '0 8px 32px rgba(26,26,46,0.18)',
                  minWidth: 200,
                  overflow: 'hidden',
                  zIndex: 200,
                }}
              >
                {/* User info */}
                <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(26,26,46,0.08)' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E', marginBottom: 2 }}>
                    {name ?? email.split('@')[0]}
                  </p>
                  <p style={{ fontSize: 12, color: '#8888A4' }}>{email}</p>
                </div>

                {/* Sign out */}
                <button
                  onClick={handleSignOut}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 13,
                    color: '#C0392B',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                  }}
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
