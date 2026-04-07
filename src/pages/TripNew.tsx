import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopNav from '../components/TopNav'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { C } from '../lib/constants'

export default function TripNew() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({ name: '', destination: '', start: '', end: '', budget: '' })

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.destination.trim() || !form.start || !form.end) {
      setError('Please fill in trip name, destination, and dates.')
      return
    }
    if (!user) return

    setSaving(true)
    setError(null)

    // 1. Insert trip
    const { data: tripData, error: tripErr } = await supabase
      .from('trips')
      .insert({
        name: form.name.trim(),
        destination: form.destination.trim(),
        start_date: form.start,
        end_date: form.end,
        created_by: user.id,
        budget: form.budget ? parseFloat(form.budget) : null,
      })
      .select()
      .single()

    if (tripErr || !tripData) {
      setError(tripErr?.message ?? 'Failed to create trip.')
      setSaving(false)
      return
    }

    const tripId = tripData.id

    // 2. Add creator as owner member
    const { error: memberErr } = await supabase.from('trip_members').insert({
      trip_id: tripId,
      user_id: user.id,
      role: 'owner',
    })

    if (memberErr) {
      setError(memberErr.message)
      setSaving(false)
      return
    }

    navigate(`/trips/${tripId}`)
  }

  return (
    <div style={{ minHeight: '100vh', background: C.sand }}>
      <TopNav onBack={() => navigate('/trips')} backLabel="All trips" />

      <div style={{ padding: '24px 20px 60px', maxWidth: 560, margin: '0 auto' }}>
        <p
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 24,
            fontWeight: 700,
            color: C.ink,
            marginBottom: 24,
          }}
        >
          New Trip
        </p>

        {error && (
          <p
            style={{
              fontSize: 13,
              color: C.danger,
              background: C.dangerPale,
              padding: '10px 14px',
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            {error}
          </p>
        )}

        <Field label="Trip name">
          <input
            placeholder="e.g. Amalfi Coast Summer"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            style={inputStyle}
          />
        </Field>

        <Field label="Destination">
          <input
            placeholder="e.g. Italy"
            value={form.destination}
            onChange={e => set('destination', e.target.value)}
            style={inputStyle}
          />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Start date">
            <input
              type="date"
              value={form.start}
              onChange={e => set('start', e.target.value)}
              style={inputStyle}
            />
          </Field>
          <Field label="End date">
            <input
              type="date"
              value={form.end}
              onChange={e => set('end', e.target.value)}
              style={inputStyle}
            />
          </Field>
        </div>

        <Field label="Total budget (optional)">
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: C.inkMuted }}>$</span>
            <input
              type="number"
              min="0"
              placeholder="e.g. 3000"
              value={form.budget}
              onChange={e => set('budget', e.target.value)}
              style={{ ...inputStyle, paddingLeft: 26 }}
            />
          </div>
        </Field>

        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{
            width: '100%',
            padding: '13px 20px',
            borderRadius: 8,
            background: saving ? C.inkMuted : C.terra,
            color: C.white,
            border: 'none',
            fontSize: 14,
            fontWeight: 600,
            cursor: saving ? 'default' : 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {saving ? 'Creating…' : 'Create trip'}
        </button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          color: C.inkMuted,
          marginBottom: 6,
        }}
      >
        {label}
      </p>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 13px',
  borderRadius: 8,
  border: '1px solid rgba(26,26,46,0.15)',
  background: '#FFFFFF',
  fontSize: 14,
  color: '#1A1A2E',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}
