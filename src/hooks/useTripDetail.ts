import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getTripStatus } from '../lib/constants'
import type { Trip, CategoryBudget, TripMember, Profile, ItineraryItem, Expense } from '../lib/types'

export interface TripMemberWithProfile extends TripMember {
  profiles: Pick<Profile, 'display_name' | 'email'>
}

export interface TripDetail extends Trip {
  status: 'active' | 'upcoming' | 'completed'
  totalBudget: number
  totalSpent: number
  category_budgets: CategoryBudget[]
  trip_members: TripMemberWithProfile[]
  itinerary_items: ItineraryItem[]
  expenses: Expense[]
}

export function useTripDetail(tripId: string) {
  const [trip, setTrip] = useState<TripDetail | null>(null)
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
        trip_members (user_id, role, joined_at, profiles (display_name, email)),
        itinerary_items (*),
        expenses (*)
      `)
      .eq('id', tripId)
      .single()

    if (err) { setError(err.message); setLoading(false); return }

    const raw = data as TripDetail & {
      expenses: Expense[]
      category_budgets: CategoryBudget[]
    }

    setTrip({
      ...raw,
      status: getTripStatus(raw.start_date, raw.end_date),
      totalBudget: raw.category_budgets.reduce((s, b) => s + b.amount, 0),
      totalSpent: raw.expenses.reduce((s, e) => s + e.amount, 0),
      itinerary_items: [...raw.itinerary_items].sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date)
        if (dateCompare !== 0) return dateCompare
        if (a.time && b.time) return a.time.localeCompare(b.time)
        if (a.time) return -1
        if (b.time) return 1
        return 0
      }),
      expenses: [...raw.expenses].sort((a, b) => b.date.localeCompare(a.date)),
    })
    setLoading(false)
  }, [tripId])

  useEffect(() => { fetch() }, [fetch])

  // Set up real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel(`trip-${tripId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'itinerary_items', filter: `trip_id=eq.${tripId}` }, fetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses', filter: `trip_id=eq.${tripId}` }, fetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_members', filter: `trip_id=eq.${tripId}` }, fetch)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [tripId, fetch])

  const addItineraryItem = useCallback(async (item: {
    date: string
    time?: string
    title: string
    location?: string
    notes?: string
    type?: string
  }) => {
    const { error } = await supabase.from('itinerary_items').insert({ trip_id: tripId, ...item })
    if (!error) fetch()
    return error
  }, [tripId, fetch])

  const deleteItineraryItem = useCallback(async (itemId: string) => {
    const { error } = await supabase.from('itinerary_items').delete().eq('id', itemId)
    if (!error) fetch()
    return error
  }, [fetch])

  const deleteExpense = useCallback(async (expenseId: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', expenseId)
    if (!error) fetch()
    return error
  }, [fetch])

  const updateExpense = useCallback(async (expenseId: string, updates: Partial<Expense>) => {
    const { error } = await supabase.from('expenses').update(updates).eq('id', expenseId)
    if (!error) fetch()
    return error
  }, [fetch])

  const updateItineraryItem = useCallback(async (itemId: string, updates: Partial<ItineraryItem>) => {
    const { error } = await supabase.from('itinerary_items').update(updates).eq('id', itemId)
    if (!error) fetch()
    return error
  }, [fetch])

  const addExpense = useCallback(async (expense: {
    category: string
    amount: number
    description: string
    date: string
    paid_by: string
    itinerary_item_id?: string
  }) => {
    const { error } = await supabase.from('expenses').insert({ trip_id: tripId, ...expense })
    if (!error) fetch()
    return error
  }, [tripId, fetch])

  const updateBudgets = useCallback(async (budgets: Partial<Record<string, number>>) => {
    const rows = Object.entries(budgets)
      .map(([category, amount]) => ({ trip_id: tripId, category, amount: amount ?? 0 }))

    const { error } = await supabase
      .from('category_budgets')
      .upsert(rows, { onConflict: 'trip_id,category' })

    if (!error) fetch()
    return error
  }, [tripId, fetch])

  const inviteMember = useCallback(async (email: string) => {
    const { data, error } = await supabase.rpc('invite_to_trip', { p_trip_id: tripId, p_email: email })
    if (!error) fetch()
    return { result: data as string | null, error }
  }, [tripId, fetch])

  return { trip, loading, error, refetch: fetch, addItineraryItem, deleteItineraryItem, updateItineraryItem, deleteExpense, updateExpense, inviteMember, updateBudgets, addExpense }
}
