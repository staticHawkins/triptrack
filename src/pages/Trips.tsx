import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import TopNav from '../components/TopNav'
import TripBanner from '../components/TripBanner'
import ProgressBar from '../components/ProgressBar'
import { useTrips, type TripSummary } from '../hooks/useTrips'
import { C, fmtDate } from '../lib/constants'

function TripCard({ trip, onClick }: { trip: TripSummary; onClick: () => void }) {
  const { totalBudget, totalSpent, status } = trip
  const remaining = totalBudget - totalSpent
  const isOver = remaining < 0
  const pct = totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0

  const health =
    status === 'completed'
      ? isOver
        ? { label: 'Went over', color: C.danger }
        : pct > 90
        ? { label: 'Broke even', color: C.gold }
        : { label: 'Came in under', color: C.teal }
      : status === 'upcoming'
      ? { label: 'Not started', color: C.inkMuted }
      : isOver
      ? { label: 'Over budget', color: C.danger }
      : { label: 'Under budget', color: C.teal }

  const statusLabel =
    status === 'active' ? 'In progress' : status === 'upcoming' ? 'Upcoming' : 'Completed'

  const memberNames = trip.members
    .map(m => m.display_name ?? m.email.split('@')[0])
    .slice(0, 3)
    .join(' · ')

  return (
    <div
      onClick={onClick}
      style={{
        background: C.white,
        borderRadius: 12,
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px solid rgba(26,26,46,0.07)',
        boxShadow: '0 2px 16px rgba(26,26,46,0.08)',
        opacity: status === 'completed' ? 0.8 : 1,
      }}
    >
      <TripBanner destination={trip.destination} height={140}>
        <div style={{ padding: '0 14px 14px' }}>
          <p
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 18,
              fontWeight: 600,
              color: '#fff',
              textShadow: '0 1px 6px rgba(0,0,0,0.5)',
              marginBottom: 3,
            }}
          >
            {trip.name}
          </p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
            {trip.destination} · {fmtDate(trip.start_date)} – {fmtDate(trip.end_date)}
          </p>
        </div>
      </TripBanner>

      <div style={{ padding: '12px 14px 10px' }}>
        {status === 'upcoming' ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: C.inkMuted }}>Total budget</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>
              ${totalBudget.toLocaleString()}
            </span>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: health.color,
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 13, fontWeight: 600, color: health.color }}>{health.label}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: isOver ? C.danger : C.ink }}>
                  {isOver ? '-' : ''}${Math.abs(remaining).toLocaleString()}
                </span>
                <span style={{ fontSize: 12, color: C.inkMuted }}> {isOver ? 'over' : 'left'}</span>
              </div>
            </div>
            <ProgressBar pct={pct} color={health.color} height={3} />
          </>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <p style={{ fontSize: 11, color: C.inkMuted }}>{memberNames}</p>
          <p style={{ fontSize: 11, color: C.inkMuted }}>{statusLabel}</p>
        </div>
      </div>
    </div>
  )
}

export default function Trips() {
  const navigate = useNavigate()
  const { trips, loading, error } = useTrips()

  return (
    <div style={{ minHeight: '100vh', background: C.sand }}>
      <TopNav
        action={
          <button
            onClick={() => navigate('/trips/new')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '7px 14px',
              borderRadius: 8,
              background: C.terra,
              color: C.white,
              border: 'none',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <Plus size={13} />
            New Trip
          </button>
        }
      />

      <div style={{ padding: '28px 20px 80px' }}>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: C.ink }}>
          My Trips
        </p>

        {loading ? (
          <p style={{ fontSize: 13, color: C.inkMuted, marginTop: 8 }}>Loading…</p>
        ) : error ? (
          <p style={{ fontSize: 13, color: C.danger, marginTop: 8 }}>{error}</p>
        ) : (
          <>
            <p style={{ fontSize: 13, color: C.inkMuted, marginTop: 3, marginBottom: 28 }}>
              {trips.length === 0 ? 'No trips yet' : `${trips.length} trip${trips.length === 1 ? '' : 's'}`}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 14,
              }}
            >
              {trips.map(t => (
                <TripCard key={t.id} trip={t} onClick={() => navigate(`/trips/${t.id}`)} />
              ))}

              {/* New trip placeholder card */}
              <button
                onClick={() => navigate('/trips/new')}
                style={{
                  background: 'transparent',
                  border: '2px dashed rgba(26,26,46,0.15)',
                  borderRadius: 12,
                  padding: '32px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  color: C.inkMuted,
                  fontFamily: 'inherit',
                  minHeight: 200,
                }}
              >
                <Plus size={28} strokeWidth={1.5} />
                <span style={{ fontSize: 14, fontWeight: 500 }}>Plan a new trip</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
