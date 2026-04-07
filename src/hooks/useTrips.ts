import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getTripStatus } from '../lib/constants'
import type { Trip, CategoryBudget, TripMember, Profile } from '../lib/types'

export interface TripSummary extends Trip {
  status: 'active' | 'upcoming' | 'completed'
  totalBudget: number
  totalSpent: number
  members: { display_name: string | null; email: string }[]
  category_budgets: CategoryBudget[]
}

type RawTrip = Trip & {
  category_budgets: CategoryBudget[]
  expenses: { amount: number }[]
  trip_members: (Omit<TripMember, 'profiles'> & { profiles: Pick<Profile, 'display_name' | 'email'> })[]
}

export function useTrips() {
  const [trips, setTrips] = useState<TripSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('trips')
      .select(`
        *,
        category_budgets (*),
        expenses (amount),
        trip_members (user_id, role, joined_at, profiles (display_name, email))
      `)
      .order('start_date', { ascending: false })

    if (err) { setError(err.message); setLoading(false); return }

    const summaries: TripSummary[] = (data as RawTrip[]).map(t => ({
      ...t,
      status: getTripStatus(t.start_date, t.end_date),
      totalBudget: t.category_budgets.reduce((s, b) => s + b.amount, 0),
      totalSpent: t.expenses.reduce((s, e) => s + e.amount, 0),
      members: t.trip_members.map(m => m.profiles),
    }))

    setTrips(summaries)
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { trips, loading, error, refetch: fetch }
}
