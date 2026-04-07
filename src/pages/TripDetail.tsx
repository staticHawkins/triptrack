import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Trash2, Pencil, UserPlus, Plane, UtensilsCrossed, Star, Home, MoreHorizontal } from 'lucide-react'
import TopNav from '../components/TopNav'
import TripBanner from '../components/TripBanner'
import ProgressBar from '../components/ProgressBar'
import Sheet from '../components/Sheet'
import CategoryIcon from '../components/CategoryIcon'
import PlacesAutocomplete from '../components/PlacesAutocomplete'
import { useTripDetail } from '../hooks/useTripDetail'
import { useAuth } from '../hooks/useAuth'
import { C, CATEGORY_META, fmtDate, fmtDateFull } from '../lib/constants'
import { CATEGORIES, ITINERARY_TYPES, type Category, type Expense, type ItineraryItem, type ItineraryItemType } from '../lib/types'

// ─── Itinerary Type Meta ───────────────────────────────────────────────────────
const TYPE_META: Record<ItineraryItemType, { icon: React.FC<{ size: number; color: string }>, color: string; pale: string }> = {
  Activity:  { icon: ({ size, color }) => <Star size={size} color={color} strokeWidth={1.8} />,           color: C.tealLight, pale: C.tealPale  },
  Meal:      { icon: ({ size, color }) => <UtensilsCrossed size={size} color={color} strokeWidth={1.8} />, color: C.terra,     pale: C.terraPale },
  Transport: { icon: ({ size, color }) => <Plane size={size} color={color} strokeWidth={1.8} />,           color: C.teal,      pale: C.tealPale  },
  Stay:      { icon: ({ size, color }) => <Home size={size} color={color} strokeWidth={1.8} />,            color: C.gold,      pale: C.goldPale  },
  Other:     { icon: ({ size, color }) => <MoreHorizontal size={size} color={color} strokeWidth={1.8} />,  color: C.inkMuted,  pale: C.sandDark  },
}

// ─── Itinerary Tab ─────────────────────────────────────────────────────────────
function ItineraryTab({
  trip,
  onAddActivity,
  onDeleteItem,
  onEditItem,
}: {
  trip: ReturnType<typeof useTripDetail>['trip'] & object
  onAddActivity: (date?: string) => void
  onDeleteItem: (id: string) => void
  onEditItem: (item: ItineraryItem) => void
}) {
  if (!trip) return null

  const todayStr = new Date().toISOString().split('T')[0]
  const todayRef = useRef<HTMLDivElement>(null)

  // Group items by date
  const grouped = trip.itinerary_items.reduce<Record<string, ItineraryItem[]>>((acc, item) => {
    ;(acc[item.date] = acc[item.date] || []).push(item)
    return acc
  }, {})

  // Build sorted list of all trip days (even empty ones)
  const allDays: string[] = []
  const start = new Date(trip.start_date + 'T12:00:00')
  const end = new Date(trip.end_date + 'T12:00:00')
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    allDays.push(d.toISOString().split('T')[0])
  }

  const hasToday = allDays.includes(todayStr)

  const scrollToToday = () => {
    todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    if (hasToday) {
      setTimeout(() => scrollToToday(), 100)
    }
  }, [hasToday])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        {hasToday && (
          <button
            onClick={scrollToToday}
            style={{
              padding: '5px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              background: C.terraPale,
              color: C.terra,
              border: `1px solid ${C.terra}`,
            }}
          >
            Today
          </button>
        )}
        <button
          onClick={() => onAddActivity()}
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
            marginLeft: 'auto',
          }}
        >
          <Plus size={13} />
          Plan activity
        </button>
      </div>

      {allDays.map((date, di) => {
        const isToday = date === todayStr
        const items = grouped[date] || []

        return (
          <div
            key={date}
            id={`day-${date}`}
            ref={isToday ? todayRef : undefined}
            style={{ marginBottom: 24 }}
          >
            {/* Day header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1.2px',
                  color: isToday ? C.terra : C.inkMuted,
                  whiteSpace: 'nowrap',
                }}
              >
                {isToday ? 'Today' : `Day ${di + 1}`} · {fmtDate(date, { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
              <div style={{ flex: 1, height: 1, background: isToday ? C.terraPale : 'rgba(26,26,46,0.1)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map(item => {
                const linkedTotal = trip.expenses
                  .filter(e => e.itinerary_item_id === item.id)
                  .reduce((s, e) => s + e.amount, 0)
                return (
                  <ActivityCard
                    key={item.id}
                    item={item}
                    isToday={isToday}
                    linkedTotal={linkedTotal}
                    onDelete={() => onDeleteItem(item.id)}
                    onEdit={() => onEditItem(item)}
                  />
                )
              })}

              {/* Add to this day */}
              <button
                onClick={() => onAddActivity(date)}
                style={{
                  width: '100%',
                  padding: '9px',
                  border: '1px dashed rgba(26,26,46,0.15)',
                  borderRadius: 8,
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: 12,
                  color: C.inkMuted,
                  fontFamily: 'inherit',
                }}
              >
                + Add to {isToday ? 'today' : `Day ${di + 1}`}
              </button>
            </div>
          </div>
        )
      })}

      {allDays.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <p style={{ fontSize: 13, color: C.inkMuted }}>No trip days yet.</p>
        </div>
      )}
    </div>
  )
}

function ActivityCard({
  item,
  isToday,
  linkedTotal,
  onDelete,
  onEdit,
}: {
  item: ItineraryItem
  isToday: boolean
  linkedTotal: number
  onDelete: () => void
  onEdit: () => void
}) {
  const [showActions, setShowActions] = useState(false)

  return (
    <div
      onClick={onEdit}
      style={{
        background: C.white,
        borderRadius: 8,
        padding: '11px 13px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        border: `1px solid ${isToday ? C.terraPale : 'rgba(26,26,46,0.06)'}`,
        boxShadow: '0 1px 5px rgba(26,26,46,0.05)',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Type icon */}
      {(() => {
        const meta = TYPE_META[item.type] ?? TYPE_META.Other
        const Icon = meta.icon
        return (
          <div style={{ width: 34, height: 34, borderRadius: 9, background: meta.pale, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={15} color={meta.color} />
          </div>
        )
      })()}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: C.ink }}>{item.title}</p>
        {item.location && (
          <p style={{ fontSize: 12, color: C.inkMuted, marginTop: 1 }}>{item.location}</p>
        )}
        {item.notes && (
          <p style={{ fontSize: 12, color: C.inkMuted, marginTop: 1, fontStyle: 'italic' }}>{item.notes}</p>
        )}
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        {linkedTotal > 0 && (
          <p style={{ fontSize: 13, fontWeight: 600, color: C.terra }}>
            ${linkedTotal.toLocaleString()}
          </p>
        )}
        {item.time && (
          <p style={{ fontSize: 12, color: C.inkMuted }}>
            {item.time.slice(0, 5).replace(/^0/, '')}
          </p>
        )}
        {showActions && (
          <button
            onClick={e => { e.stopPropagation(); onDelete() }}
            style={{ background: C.dangerPale, border: 'none', borderRadius: 6, padding: '4px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: C.danger }}
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Edit Trip Form ─────────────────────────────────────────────────────────────
function EditTripForm({
  trip,
  onClose,
  onSave,
}: {
  trip: ReturnType<typeof useTripDetail>['trip'] & object
  onClose: () => void
  onSave: (updates: { name: string; destination: string; start_date: string; end_date: string }) => Promise<unknown>
}) {
  const [form, setForm] = useState({
    name: trip.name,
    destination: trip.destination,
    start_date: trip.start_date,
    end_date: trip.end_date,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Trip name is required.'); return }
    if (!form.destination.trim()) { setError('Destination is required.'); return }
    if (form.end_date < form.start_date) { setError('End date must be after start date.'); return }
    setSaving(true)
    const err = await onSave({ name: form.name.trim(), destination: form.destination.trim(), start_date: form.start_date, end_date: form.end_date })
    if (err) { setError((err as { message: string }).message); setSaving(false); return }
    onClose()
  }

  return (
    <div>
      {error && (
        <p style={{ fontSize: 13, color: C.danger, background: C.dangerPale, padding: '8px 12px', borderRadius: 8, marginBottom: 14 }}>
          {error}
        </p>
      )}
      <SheetField label="Trip name">
        <input value={form.name} onChange={e => set('name', e.target.value)} style={sheetInputStyle} />
      </SheetField>
      <SheetField label="Destination">
        <input value={form.destination} onChange={e => set('destination', e.target.value)} style={sheetInputStyle} />
      </SheetField>
      <SheetField label="Start date">
        <input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} style={sheetInputStyle} />
      </SheetField>
      <SheetField label="End date">
        <input type="date" value={form.end_date} min={form.start_date} onChange={e => set('end_date', e.target.value)} style={sheetInputStyle} />
      </SheetField>
      <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
        <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid rgba(26,26,46,0.15)', background: C.white, fontSize: 13, fontWeight: 500, color: C.inkMuted, cursor: 'pointer', fontFamily: 'inherit' }}>
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '10px', borderRadius: 8, background: saving ? C.inkMuted : C.terra, color: C.white, border: 'none', fontSize: 13, fontWeight: 600, cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit' }}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}

// ─── Edit Budgets Form ──────────────────────────────────────────────────────────
function EditBudgetsForm({
  trip,
  onClose,
  onSave,
}: {
  trip: ReturnType<typeof useTripDetail>['trip'] & object
  onClose: () => void
  onSave: (budgets: Partial<Record<string, number>>) => Promise<unknown>
}) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(
      CATEGORIES.map(cat => [
        cat,
        String(trip.category_budgets.find(b => b.category === cat)?.amount ?? ''),
      ])
    )
  )
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const budgets = Object.fromEntries(
      CATEGORIES.map(cat => [cat, Number(values[cat]) || 0])
    )
    await onSave(budgets)
    setSaving(false)
    onClose()
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        {CATEGORIES.map(cat => {
          const meta = CATEGORY_META[cat]
          return (
            <div
              key={cat}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: C.sandDark,
                border: '1px solid rgba(26,26,46,0.08)',
                borderRadius: 8,
                padding: '9px 13px',
              }}
            >
              <span style={{ color: meta.color, display: 'flex', flexShrink: 0 }}>
                <CategoryIcon category={cat as Category} color={meta.color} size={16} />
              </span>
              <span style={{ fontSize: 13, color: C.ink, width: 84 }}>{cat}</span>
              <span style={{ fontSize: 13, color: C.inkMuted, flexShrink: 0 }}>$</span>
              <input
                type="number"
                min="0"
                placeholder="—"
                value={values[cat]}
                onChange={e => setValues(v => ({ ...v, [cat]: e.target.value }))}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: 14,
                  color: C.ink,
                  fontFamily: 'inherit',
                  background: 'transparent',
                }}
              />
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={onClose}
          style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid rgba(26,26,46,0.15)', background: C.white, fontSize: 13, fontWeight: 500, color: C.inkMuted, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ flex: 2, padding: '10px', borderRadius: 8, background: saving ? C.inkMuted : C.terra, color: C.white, border: 'none', fontSize: 13, fontWeight: 600, cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit' }}
        >
          {saving ? 'Saving…' : 'Save budgets'}
        </button>
      </div>
    </div>
  )
}

// ─── Budget Tab ─────────────────────────────────────────────────────────────────
function BudgetTab({
  trip,
  onEditBudgets,
  onLogExpense,
  onDeleteExpense,
  onEditExpense,
}: {
  trip: ReturnType<typeof useTripDetail>['trip'] & object
  onEditBudgets: () => void
  onLogExpense: () => void
  onDeleteExpense: (id: string) => void
  onEditExpense: (exp: Expense) => void
}) {
  if (!trip) return null

  const catSpent = CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = trip.expenses
      .filter(e => e.category === cat)
      .reduce((s, e) => s + e.amount, 0)
    return acc
  }, {})

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.inkMuted }}>
          By Category
        </p>
        <button
          onClick={onEditBudgets}
          style={{ fontSize: 12, fontWeight: 500, color: C.terra, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Edit budgets
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
        {CATEGORIES.map(cat => {
          const meta = CATEGORY_META[cat]
          const budget = trip.category_budgets.find(b => b.category === cat)?.amount ?? 0
          const spent = catSpent[cat] || 0
          const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0
          const over = budget > 0 && spent > budget
          const barColor = over ? C.danger : meta.barColor

          return (
            <div
              key={cat}
              style={{
                background: C.white,
                borderRadius: 8,
                padding: '12px 14px',
                border: '1px solid rgba(26,26,46,0.06)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: budget > 0 ? 8 : 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CategoryIcon category={cat as Category} color={over ? C.danger : meta.color} size={15} />
                  <span style={{ fontSize: 14, fontWeight: 500, color: C.ink }}>{cat}</span>
                </div>
                <div style={{ fontSize: 12, color: C.inkMuted, display: 'flex', gap: 12 }}>
                  {budget > 0 && <span>${budget.toLocaleString()} budget</span>}
                  <span style={{ fontWeight: 600, color: over ? C.danger : C.ink }}>
                    ${spent.toLocaleString()} spent
                  </span>
                </div>
              </div>
              {budget > 0 && <ProgressBar pct={pct} color={barColor} height={4} />}
              {over && (
                <p style={{ fontSize: 11, color: C.danger, marginTop: 5, fontWeight: 600 }}>
                  ${(spent - budget).toLocaleString()} over budget
                </p>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.inkMuted }}>
          Expenses
        </p>
        <button
          onClick={onLogExpense}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, background: C.terra, color: C.white, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <Plus size={13} />
          Log expense
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {trip.expenses.length === 0 && (
          <p style={{ fontSize: 13, color: C.inkMuted, textAlign: 'center', padding: '20px 0' }}>
            No expenses logged yet.
          </p>
        )}
        {trip.expenses.map(exp => {
          const meta = CATEGORY_META[exp.category] || CATEGORY_META.Other
          const d = new Date(exp.date + 'T12:00:00')
          const isPreTrip = exp.date < trip.start_date
          const linkedItem = exp.itinerary_item_id
            ? trip.itinerary_items.find(i => i.id === exp.itinerary_item_id)
            : null

          return (
            <div
              key={exp.id}
              onClick={() => onEditExpense(exp)}
              style={{
                background: C.white,
                borderRadius: 8,
                padding: '11px 14px',
                display: 'flex',
                gap: 12,
                border: '1px solid rgba(26,26,46,0.06)',
                cursor: 'pointer',
              }}
            >
              <div style={{ width: 38, textAlign: 'center', flexShrink: 0 }}>
                <p
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 20,
                    fontWeight: 700,
                    color: C.ink,
                    lineHeight: 1,
                  }}
                >
                  {d.getDate()}
                </p>
                <p
                  style={{
                    fontSize: 10,
                    color: C.inkMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {d.toLocaleDateString('en-US', { month: 'short' })}
                </p>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: C.ink }}>{exp.description}</p>
                  {isPreTrip && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        background: C.goldPale,
                        color: C.gold,
                        padding: '1px 7px',
                        borderRadius: 20,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Pre-trip
                    </span>
                  )}
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: C.inkMuted,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <CategoryIcon category={exp.category as Category} color={meta.color} size={12} />
                  {exp.category}
                  {linkedItem ? ` · ${linkedItem.title}` : ''}
                  {exp.paid_by ? ` · ${trip.trip_members.find(m => m.user_id === exp.paid_by)?.profiles.display_name ?? 'Unknown'}` : ''}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: C.terra, whiteSpace: 'nowrap' }}>
                  ${exp.amount.toLocaleString()}
                </p>
                <button
                  onClick={e => { e.stopPropagation(); onDeleteExpense(exp.id) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: C.inkMuted, display: 'flex' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Add Activity Form ──────────────────────────────────────────────────────────
function AddActivityForm({
  tripId: _tripId,
  tripStart,
  tripEnd,
  prefilledDate,
  initialValues,
  onClose,
  onSave,
}: {
  tripId: string
  tripStart: string
  tripEnd: string
  prefilledDate?: string
  initialValues?: ItineraryItem
  onClose: () => void
  onSave: (item: { date: string; time?: string; title: string; location?: string; latitude?: number; longitude?: number; notes?: string; type?: string }) => Promise<unknown>
}) {
  const defaultDate = initialValues?.date ?? prefilledDate ?? new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    date: defaultDate < tripStart ? tripStart : defaultDate > tripEnd ? tripStart : defaultDate,
    time: initialValues?.time ?? '',
    title: initialValues?.title ?? '',
    location: initialValues?.location ?? '',
    lat: initialValues?.latitude ?? null as number | null,
    lng: initialValues?.longitude ?? null as number | null,
    notes: initialValues?.notes ?? '',
    type: (initialValues?.type ?? 'Activity') as ItineraryItemType,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Name is required.'); return }
    setSaving(true)
    const err = await onSave({
      date: form.date,
      time: form.time || undefined,
      title: form.title.trim(),
      location: form.location.trim() || undefined,
      latitude: form.lat ?? undefined,
      longitude: form.lng ?? undefined,
      notes: form.notes.trim() || undefined,
      type: form.type,
    })
    if (err) { setError((err as { message: string }).message); setSaving(false); return }
    onClose()
  }

  return (
    <div>
      {error && (
        <p style={{ fontSize: 13, color: C.danger, background: C.dangerPale, padding: '8px 12px', borderRadius: 8, marginBottom: 14 }}>
          {error}
        </p>
      )}

      <SheetField label="Type">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ITINERARY_TYPES.map(t => {
            const meta = TYPE_META[t]
            const Icon = meta.icon
            const selected = form.type === t
            return (
              <button
                key={t}
                onClick={() => set('type', t)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 13px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  background: selected ? meta.color : C.white,
                  color: selected ? C.white : C.inkMuted,
                  border: `1px solid ${selected ? meta.color : 'rgba(26,26,46,0.15)'}`,
                }}
              >
                <Icon size={13} color={selected ? C.white : meta.color} />
                {t}
              </button>
            )
          })}
        </div>
      </SheetField>

      <SheetField label="Date">
        <input
          type="date"
          min={tripStart}
          max={tripEnd}
          value={form.date}
          onChange={e => set('date', e.target.value)}
          style={sheetInputStyle}
        />
      </SheetField>

      <SheetField label="Name">
        <input
          placeholder="e.g. Dinner at Sukiyabashi Jiro"
          value={form.title}
          onChange={e => set('title', e.target.value)}
          style={sheetInputStyle}
        />
      </SheetField>

      <SheetField label="Time (optional)">
        <input
          type="time"
          value={form.time}
          onChange={e => set('time', e.target.value)}
          style={sheetInputStyle}
        />
      </SheetField>

      <SheetField label="Location (optional)">
        <PlacesAutocomplete
          value={form.location}
          onChange={val => set('location', val)}
          onPlaceSelect={place => {
            if (place) {
              setForm(f => ({ ...f, location: place.address, lat: place.lat, lng: place.lng }))
            } else {
              setForm(f => ({ ...f, lat: null, lng: null }))
            }
          }}
          placeholder="e.g. Ginza, Tokyo"
          style={sheetInputStyle}
        />
      </SheetField>

      <SheetField label="Notes (optional)">
        <input
          placeholder="Reservation #, reminders…"
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          style={sheetInputStyle}
        />
      </SheetField>

      <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
        <button
          onClick={onClose}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: 8,
            border: '1px solid rgba(26,26,46,0.15)',
            background: C.white,
            fontSize: 13,
            fontWeight: 500,
            color: C.inkMuted,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            flex: 2,
            padding: '10px',
            borderRadius: 8,
            background: saving ? C.inkMuted : C.terra,
            color: C.white,
            border: 'none',
            fontSize: 13,
            fontWeight: 600,
            cursor: saving ? 'default' : 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {saving ? 'Saving…' : initialValues ? 'Save changes' : 'Save activity'}
        </button>
      </div>
    </div>
  )
}

// ─── Invite Member Form ─────────────────────────────────────────────────────────
function InviteMemberForm({
  onClose,
  onInvite,
  members,
}: {
  onClose: () => void
  onInvite: (email: string) => Promise<{ result: string | null; error: unknown }>
  members: { display_name: string | null; email: string }[]
}) {
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const handleInvite = async () => {
    if (!email.trim()) return
    setSaving(true)
    setMessage(null)
    const { result, error } = await onInvite(email.trim().toLowerCase())
    setSaving(false)
    if (error) {
      setMessage({ text: 'Something went wrong. Try again.', type: 'error' })
    } else if (result === 'not_found') {
      setMessage({ text: 'No account found with that email. Ask them to sign up first.', type: 'error' })
    } else if (result === 'not_owner') {
      setMessage({ text: 'Only the trip owner can invite members.', type: 'error' })
    } else {
      setMessage({ text: 'Member added!', type: 'success' })
      setEmail('')
    }
  }

  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.inkMuted, marginBottom: 10 }}>
        Current Members
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {members.map(m => (
          <div key={m.email} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: C.sandDark, borderRadius: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.terra, color: C.white, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {(m.display_name ?? m.email)[0].toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: C.ink }}>{m.display_name ?? m.email.split('@')[0]}</p>
              <p style={{ fontSize: 11, color: C.inkMuted }}>{m.email}</p>
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.inkMuted, marginBottom: 8 }}>
        Invite by Email
      </p>

      {message && (
        <p style={{ fontSize: 13, color: message.type === 'error' ? C.danger : C.teal, background: message.type === 'error' ? C.dangerPale : C.tealPale, padding: '8px 12px', borderRadius: 8, marginBottom: 12 }}>
          {message.text}
        </p>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="email"
          placeholder="friend@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleInvite()}
          style={{ ...sheetInputStyle, flex: 1, marginBottom: 0 }}
        />
        <button
          onClick={handleInvite}
          disabled={saving || !email.trim()}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            background: saving || !email.trim() ? C.inkMuted : C.terra,
            color: C.white,
            border: 'none',
            fontSize: 13,
            fontWeight: 600,
            cursor: saving || !email.trim() ? 'default' : 'pointer',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
          }}
        >
          {saving ? '…' : 'Add'}
        </button>
      </div>

      <button
        onClick={onClose}
        style={{ width: '100%', marginTop: 16, padding: '10px', borderRadius: 8, border: '1px solid rgba(26,26,46,0.15)', background: C.white, fontSize: 13, fontWeight: 500, color: C.inkMuted, cursor: 'pointer', fontFamily: 'inherit' }}
      >
        Done
      </button>
    </div>
  )
}

// ─── WMO weather code → label ───────────────────────────────────────────────────
function wmoLabel(code: number): { condition: string; emoji: string } {
  if (code === 0)                       return { condition: 'Clear sky',    emoji: '☀️'  }
  if (code <= 2)                        return { condition: 'Partly cloudy', emoji: '⛅'  }
  if (code === 3)                       return { condition: 'Overcast',      emoji: '☁️'  }
  if (code <= 48)                       return { condition: 'Foggy',         emoji: '🌫️' }
  if (code <= 67)                       return { condition: 'Rain',          emoji: '🌧️' }
  if (code <= 77)                       return { condition: 'Snow',          emoji: '🌨️' }
  if (code <= 82)                       return { condition: 'Showers',       emoji: '🌦️' }
  return                                       { condition: 'Thunderstorm',  emoji: '⛈️' }
}

// ─── Dashboard Tab ──────────────────────────────────────────────────────────────
function DashboardTab({ trip }: { trip: ReturnType<typeof useTripDetail>['trip'] & object }) {
  const todayStr = new Date().toISOString().split('T')[0]
  const todayItems = trip.itinerary_items.filter(i => i.date === todayStr)

  // Day counter
  const startMs = new Date(trip.start_date).getTime()
  const endMs   = new Date(trip.end_date).getTime()
  const todayMs = new Date(todayStr).getTime()
  const totalDays = Math.round((endMs - startMs) / 86400000) + 1
  const dayNumber = Math.round((todayMs - startMs) / 86400000) + 1
  const dayCounter = dayNumber >= 1 && dayNumber <= totalDays ? `Day ${dayNumber} of ${totalDays}` : null

  // Resolve weather coordinates: prefer today's items with stored coords, else geocode destination
  const coordItem = todayItems.find(i => i.latitude != null && i.longitude != null)

  type WeatherData = { temp: number; tempMax: number; tempMin: number; precipChance: number; condition: string; emoji: string }
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setWeather(null)
    setWeatherLoading(true)

    async function load() {
      try {
        let lat: number
        let lon: number

        if (coordItem?.latitude != null && coordItem?.longitude != null) {
          lat = coordItem.latitude
          lon = coordItem.longitude
        } else {
          const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trip.destination)}&count=1`
          )
          const geoData = await geoRes.json()
          const loc = geoData?.results?.[0]
          if (!loc || cancelled) return
          lat = loc.latitude
          lon = loc.longitude
        }

        const wxRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
          `&current=temperature_2m,weathercode,precipitation_probability` +
          `&daily=temperature_2m_max,temperature_2m_min&temperature_unit=celsius&forecast_days=1&timezone=auto`
        )
        const wx = await wxRes.json()
        if (cancelled) return

        const code: number = wx.current.weathercode
        setWeather({
          temp: Math.round(wx.current.temperature_2m),
          tempMax: Math.round(wx.daily.temperature_2m_max[0]),
          tempMin: Math.round(wx.daily.temperature_2m_min[0]),
          precipChance: wx.current.precipitation_probability ?? 0,
          ...wmoLabel(code),
        })
      } catch {
        // silently fail — card just won't render
      } finally {
        if (!cancelled) setWeatherLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [trip.destination, coordItem?.latitude, coordItem?.longitude]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.inkMuted, marginBottom: 10 }}>
        Today · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </p>

      {/* Weather card */}
      {weatherLoading ? (
        <div style={{
          background: C.white,
          borderRadius: 10,
          padding: '14px 16px',
          border: `1px solid ${C.terraPale}`,
          boxShadow: '0 1px 5px rgba(26,26,46,0.05)',
          marginBottom: 16,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{ width: 40, height: 16, borderRadius: 4, background: C.sandDark }} />
          <div style={{ width: 80, height: 16, borderRadius: 4, background: C.sandDark }} />
          <div style={{ flex: 1 }} />
          <div style={{ width: 48, height: 16, borderRadius: 4, background: C.sandDark }} />
        </div>
      ) : weather ? (
        <div style={{
          background: C.white,
          borderRadius: 10,
          padding: '14px 16px',
          border: `1px solid ${C.terraPale}`,
          boxShadow: '0 1px 5px rgba(26,26,46,0.05)',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <span style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>{weather.emoji}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: C.ink }}>{weather.condition}</p>
            <p style={{ fontSize: 12, color: C.inkMuted, marginTop: 2 }}>
              H:{weather.tempMax}° &nbsp;L:{weather.tempMin}° &nbsp;·&nbsp; 💧 {weather.precipChance}%
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{ fontSize: 22, fontWeight: 600, color: C.ink, lineHeight: 1 }}>{weather.temp}°C</p>
            {dayCounter && (
              <p style={{ fontSize: 11, color: C.inkMuted, marginTop: 4 }}>{dayCounter}</p>
            )}
          </div>
        </div>
      ) : dayCounter ? (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 12, color: C.inkMuted }}>{dayCounter}</p>
        </div>
      ) : null}

      {todayItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <p style={{ fontSize: 13, color: C.inkMuted }}>Nothing planned for today.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
          {todayItems.map(item => {
            const meta = TYPE_META[item.type] ?? TYPE_META.Other
            const Icon = meta.icon
            return (
              <div
                key={item.id}
                style={{
                  background: C.white,
                  borderRadius: 8,
                  padding: '11px 13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  border: `1px solid ${C.terraPale}`,
                  boxShadow: '0 1px 5px rgba(26,26,46,0.05)',
                }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 9, background: meta.pale, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={15} color={meta.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: C.ink }}>{item.title}</p>
                  {item.location && <p style={{ fontSize: 12, color: C.inkMuted, marginTop: 1 }}>{item.location}</p>}
                </div>
                {item.time && (
                  <p style={{ fontSize: 12, color: C.inkMuted, flexShrink: 0 }}>
                    {item.time.slice(0, 5).replace(/^0/, '')}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Log Expense Form ───────────────────────────────────────────────────────────
function LogExpenseForm({
  trip,
  onClose,
  onSave,
  currentUserId,
  initialValues,
}: {
  trip: ReturnType<typeof useTripDetail>['trip'] & object
  onClose: () => void
  onSave: (expense: { category: string; amount: number; description: string; date: string; paid_by: string; itinerary_item_id?: string }) => Promise<unknown>
  currentUserId: string
  initialValues?: Expense
}) {
  const [form, setForm] = useState({
    category: (initialValues?.category ?? 'Food') as Category,
    amount: initialValues ? String(initialValues.amount) : '',
    description: initialValues?.description ?? '',
    date: initialValues?.date ?? new Date().toISOString().split('T')[0],
    paid_by: initialValues?.paid_by ?? currentUserId,
    itinerary_item_id: initialValues?.itinerary_item_id ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.amount || Number(form.amount) <= 0) { setError('Enter a valid amount.'); return }
    if (!form.description.trim()) { setError('Description is required.'); return }
    setSaving(true)
    const err = await onSave({
      category: form.category,
      amount: Number(form.amount),
      description: form.description.trim(),
      date: form.date,
      paid_by: form.paid_by,
      itinerary_item_id: form.itinerary_item_id || undefined,
    })
    if (err) { setError((err as { message: string }).message); setSaving(false); return }
    onClose()
  }

  return (
    <div>
      {error && (
        <p style={{ fontSize: 13, color: C.danger, background: C.dangerPale, padding: '8px 12px', borderRadius: 8, marginBottom: 14 }}>
          {error}
        </p>
      )}

      <SheetField label="Category">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => {
            const meta = CATEGORY_META[cat]
            const selected = form.category === cat
            return (
              <button
                key={cat}
                onClick={() => set('category', cat)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 13px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', fontFamily: 'inherit',
                  background: selected ? meta.color : C.white,
                  color: selected ? C.white : C.inkMuted,
                  border: `1px solid ${selected ? meta.color : 'rgba(26,26,46,0.15)'}`,
                }}
              >
                <CategoryIcon category={cat as Category} color={selected ? C.white : meta.color} size={13} />
                {cat}
              </button>
            )
          })}
        </div>
      </SheetField>

      <SheetField label="Amount ($)">
        <input type="number" min="0" step="0.01" placeholder="0.00" value={form.amount}
          onChange={e => set('amount', e.target.value)} style={sheetInputStyle} />
      </SheetField>

      <SheetField label="Description">
        <input placeholder="What was this for?" value={form.description}
          onChange={e => set('description', e.target.value)} style={sheetInputStyle} />
      </SheetField>

      <SheetField label="Date">
        <input type="date" value={form.date}
          onChange={e => set('date', e.target.value)} style={sheetInputStyle} />
      </SheetField>

      <SheetField label="Paid by">
        <select value={form.paid_by} onChange={e => set('paid_by', e.target.value)}
          style={{ ...sheetInputStyle, appearance: 'auto' }}>
          {trip.trip_members.map(m => (
            <option key={m.user_id} value={m.user_id}>
              {m.profiles.display_name ?? m.profiles.email.split('@')[0]}
            </option>
          ))}
        </select>
      </SheetField>

      <SheetField label="Link to activity (optional)">
        <select value={form.itinerary_item_id} onChange={e => set('itinerary_item_id', e.target.value)}
          style={{ ...sheetInputStyle, appearance: 'auto' }}>
          <option value="">— None —</option>
          {trip.itinerary_items.map(item => (
            <option key={item.id} value={item.id}>
              {fmtDate(item.date)} · {item.title}
            </option>
          ))}
        </select>
      </SheetField>

      <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
        <button onClick={onClose}
          style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid rgba(26,26,46,0.15)', background: C.white, fontSize: 13, fontWeight: 500, color: C.inkMuted, cursor: 'pointer', fontFamily: 'inherit' }}>
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving}
          style={{ flex: 2, padding: '10px', borderRadius: 8, background: saving ? C.inkMuted : C.terra, color: C.white, border: 'none', fontSize: 13, fontWeight: 600, cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit' }}>
          {saving ? 'Saving…' : initialValues ? 'Save changes' : 'Log expense'}
        </button>
      </div>
    </div>
  )
}

// ─── TripDetail page ────────────────────────────────────────────────────────────
export default function TripDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { trip, loading, error, updateTrip, addItineraryItem, deleteItineraryItem, updateItineraryItem, deleteExpense, updateExpense, inviteMember, updateBudgets, addExpense } =
    useTripDetail(id!)

  const [tab, setTab] = useState<'dashboard' | 'itinerary' | 'budget'>('dashboard')
  const [showAddActivity, setShowAddActivity] = useState(false)
  const [activityDate, setActivityDate] = useState<string | undefined>(undefined)
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null)
  const [showInvite, setShowInvite] = useState(false)
  const [showEditBudgets, setShowEditBudgets] = useState(false)
  const [showLogExpense, setShowLogExpense] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [showEditTrip, setShowEditTrip] = useState(false)

  const openAddActivity = (date?: string) => {
    setActivityDate(date)
    setShowAddActivity(true)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.sand }}>
        <TopNav onBack={() => navigate('/trips')} backLabel="All trips" />
        <p style={{ padding: 24, fontSize: 13, color: C.inkMuted }}>Loading…</p>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div style={{ minHeight: '100vh', background: C.sand }}>
        <TopNav onBack={() => navigate('/trips')} backLabel="All trips" />
        <p style={{ padding: 24, fontSize: 13, color: C.danger }}>{error ?? 'Trip not found.'}</p>
      </div>
    )
  }

  const { totalBudget, totalSpent } = trip
  const remaining = totalBudget - totalSpent
  const isOver = remaining < 0
  const pct = totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0

  const isOwner = trip.trip_members.some(m => m.user_id === user?.id && m.role === 'owner')
  const members = trip.trip_members.map(m => m.profiles)

  return (
    <div style={{ minHeight: '100vh', background: C.sand }}>
      {/* Top nav */}
      <TopNav
        onBack={() => navigate('/trips')}
        backLabel="All trips"
        action={
          isOwner ? (
            <button
              onClick={() => setShowInvite(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.12)',
                color: 'rgba(245,240,232,0.8)',
                border: '1px solid rgba(255,255,255,0.15)',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <UserPlus size={13} />
              Invite
            </button>
          ) : undefined
        }
      />

      {/* Hero banner */}
      <TripBanner destination={trip.destination} height={140}>
        <div
          onClick={() => setShowEditTrip(true)}
          style={{ padding: '0 20px 0', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 24,
                fontWeight: 700,
                color: '#fff',
                textShadow: '0 1px 8px rgba(0,0,0,0.4)',
              }}
            >
              {trip.name}
            </p>
            <Pencil size={14} color="rgba(255,255,255,0.6)" />
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
            {trip.destination} · {fmtDate(trip.start_date)} – {fmtDateFull(trip.end_date)}
          </p>
        </div>
      </TripBanner>

      {/* Budget bar */}
      <div style={{ background: C.ink, padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'rgba(245,240,232,0.4)',
            }}
          >
            Budget Overview
          </p>
          <span style={{ fontSize: 12, fontWeight: 500, color: isOver ? C.danger : C.teal }}>
            ● {isOver ? 'Over budget' : 'Under budget'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
          {[
            { label: 'Budget', val: `$${totalBudget.toLocaleString()}`, color: C.sand },
            { label: 'Spent', val: `$${totalSpent.toLocaleString()}`, color: C.terraLight },
            {
              label: 'Remaining',
              val: `${remaining < 0 ? '-' : ''}$${Math.abs(remaining).toLocaleString()}`,
              color: remaining < 0 ? C.terraLight : C.tealLight,
            },
          ].map(n => (
            <div key={n.label}>
              <p
                style={{
                  fontSize: 10,
                  color: 'rgba(245,240,232,0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {n.label}
              </p>
              <p
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: n.color,
                  marginTop: 2,
                }}
              >
                {n.val}
              </p>
            </div>
          ))}
        </div>

        <ProgressBar
          pct={pct}
          color={isOver ? C.danger : C.tealLight}
          height={5}
          trackColor="rgba(255,255,255,0.1)"
        />
      </div>

      {/* Tabs */}
      <div
        style={{
          background: C.white,
          borderBottom: '1px solid rgba(26,26,46,0.08)',
          display: 'flex',
          padding: '0 18px',
          position: 'sticky',
          top: 56,
          zIndex: 50,
        }}
      >
        {(['dashboard', 'itinerary', 'budget'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '13px 16px',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              fontFamily: 'inherit',
              color: tab === t ? C.terra : C.inkMuted,
              borderBottom: `2px solid ${tab === t ? C.terra : 'transparent'}`,
              textTransform: 'capitalize',
            }}
          >
            {t}
          </button>
        ))}

      </div>

      {/* Tab content */}
      <div style={{ padding: '18px 20px 80px', maxWidth: 800, margin: '0 auto' }}>
        {tab === 'dashboard' && <DashboardTab trip={trip} />}
        {tab === 'itinerary' && (
          <ItineraryTab
            trip={trip}
            onAddActivity={openAddActivity}
            onDeleteItem={deleteItineraryItem}
            onEditItem={item => setEditingItem(item)}
          />
        )}
        {tab === 'budget' && (
          <BudgetTab
            trip={trip}
            onEditBudgets={() => setShowEditBudgets(true)}
            onLogExpense={() => setShowLogExpense(true)}
            onDeleteExpense={deleteExpense}
            onEditExpense={exp => setEditingExpense(exp)}
          />
        )}
      </div>

      {/* Add activity sheet */}
      <Sheet
        open={showAddActivity}
        onClose={() => setShowAddActivity(false)}
        title="Add to itinerary"
      >
        <AddActivityForm
          tripId={trip.id}
          tripStart={trip.start_date}
          tripEnd={trip.end_date}
          prefilledDate={activityDate}
          onClose={() => setShowAddActivity(false)}
          onSave={addItineraryItem}
        />
      </Sheet>

      {/* Log expense sheet */}
      <Sheet open={showLogExpense} onClose={() => setShowLogExpense(false)} title="Log an Expense">
        {showLogExpense && (
          <LogExpenseForm
            trip={trip}
            onClose={() => setShowLogExpense(false)}
            onSave={addExpense}
            currentUserId={user?.id ?? ''}
          />
        )}
      </Sheet>

      {/* Edit budgets sheet */}
      <Sheet open={showEditBudgets} onClose={() => setShowEditBudgets(false)} title="Edit Budgets">
        {showEditBudgets && (
          <EditBudgetsForm
            trip={trip}
            onClose={() => setShowEditBudgets(false)}
            onSave={updateBudgets}
          />
        )}
      </Sheet>

      {/* Edit trip sheet */}
      <Sheet open={showEditTrip} onClose={() => setShowEditTrip(false)} title="Edit trip">
        {showEditTrip && (
          <EditTripForm
            trip={trip}
            onClose={() => setShowEditTrip(false)}
            onSave={updateTrip}
          />
        )}
      </Sheet>

      {/* Edit itinerary item sheet */}
      <Sheet open={!!editingItem} onClose={() => setEditingItem(null)} title="Edit activity">
        {editingItem && (
          <AddActivityForm
            tripId={trip.id}
            tripStart={trip.start_date}
            tripEnd={trip.end_date}
            initialValues={editingItem}
            onClose={() => setEditingItem(null)}
            onSave={updates => updateItineraryItem(editingItem.id, updates as Partial<ItineraryItem>)}
          />
        )}
      </Sheet>

      {/* Edit expense sheet */}
      <Sheet open={!!editingExpense} onClose={() => setEditingExpense(null)} title="Edit expense">
        {editingExpense && (
          <LogExpenseForm
            trip={trip}
            onClose={() => setEditingExpense(null)}
            onSave={updates => updateExpense(editingExpense.id, updates as Partial<Expense>)}
            currentUserId={user?.id ?? ''}
            initialValues={editingExpense}
          />
        )}
      </Sheet>

      {/* Invite members sheet */}
      <Sheet open={showInvite} onClose={() => setShowInvite(false)} title="Trip Members">
        <InviteMemberForm
          onClose={() => setShowInvite(false)}
          onInvite={inviteMember}
          members={members}
        />
      </Sheet>
    </div>
  )
}

// ─── Helpers ────────────────────────────────────────────────────────────────────
function SheetField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.inkMuted, marginBottom: 6 }}>
        {label}
      </p>
      {children}
    </div>
  )
}

const sheetInputStyle: React.CSSProperties = {
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
