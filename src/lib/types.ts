export type Category = 'Food' | 'Transport' | 'Lodging' | 'Activities' | 'Supplies' | 'Other'

export const CATEGORIES: Category[] = ['Food', 'Transport', 'Lodging', 'Activities', 'Supplies', 'Other']

export type TripStatus = 'active' | 'upcoming' | 'completed'

export type MemberRole = 'owner' | 'member'

export interface Profile {
  id: string
  email: string
  display_name: string | null
  created_at: string
}

export interface Trip {
  id: string
  name: string
  destination: string
  start_date: string
  end_date: string
  created_by: string
  created_at: string
}

export interface CategoryBudget {
  id: string
  trip_id: string
  category: Category
  amount: number
}

export interface TripMember {
  trip_id: string
  user_id: string
  role: MemberRole
  joined_at: string
}

export type ItineraryItemType = 'Activity' | 'Meal' | 'Transport' | 'Stay' | 'Other'

export const ITINERARY_TYPES: ItineraryItemType[] = ['Activity', 'Meal', 'Transport', 'Stay', 'Other']

export interface ItineraryItem {
  id: string
  trip_id: string
  date: string
  time: string | null
  title: string
  location: string | null
  latitude: number | null
  longitude: number | null
  notes: string | null
  type: ItineraryItemType
  created_at: string
}

export interface Expense {
  id: string
  trip_id: string
  paid_by: string
  amount: number
  category: Category
  description: string
  date: string
  itinerary_item_id: string | null
  created_at: string
}
