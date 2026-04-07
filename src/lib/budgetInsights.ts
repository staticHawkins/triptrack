import type { Expense } from './types'

export type InsightSeverity = 'critical' | 'warning' | 'positive'

export interface BudgetInsight {
  id: string
  severity: InsightSeverity
  title: string
  detail: string
  action: string
}

export interface BudgetInsightInput {
  totalBudget: number
  totalSpent: number
  expenses: Expense[]
  start_date: string
  dayNumber: number
  daysLeftInTrip: number
}

const MIN_DAYS_FOR_BURN_RATE = 2
const TIGHT_RATIO = 0.7

// Per-category advice based on whether spending is high-ticket vs many-small
const CAT_HIGH_AVG_THRESHOLD: Record<string, number> = {
  Food: 35,
  Transport: 30,
  Activities: 50,
  Lodging: 100,
  Supplies: 40,
  Other: 40,
}

const CAT_ADVICE: Record<string, { high: string; low: string }> = {
  Food:       { high: 'Switch to groceries or street food instead of restaurants',   low: 'Cut snacks and drinks between meals' },
  Transport:  { high: 'Use public transit instead of taxis or rideshares',            low: 'Combine errands into fewer trips' },
  Lodging:    { high: 'Avoid hotel add-ons like room service or late checkout',       low: 'Avoid hotel add-ons like room service or late checkout' },
  Activities: { high: 'Skip lower-priority bookings and look for free alternatives',  low: 'Stick to free activities — parks, markets, walking tours' },
  Supplies:   { high: 'Stop souvenir shopping until the last day',                    low: 'Consolidate any remaining purchases into one trip' },
  Other:      { high: 'Review your miscellaneous charges for anything you can cut',   low: 'Review your miscellaneous charges for anything you can cut' },
}

function fmt(n: number) {
  return '$' + Math.round(n).toLocaleString()
}

function getCategoryAdvice(expenses: Expense[], category: string): string {
  const catExpenses = expenses.filter(e => e.category === category)
  if (catExpenses.length === 0) return CAT_ADVICE[category]?.low ?? ''
  const avg = catExpenses.reduce((s, e) => s + e.amount, 0) / catExpenses.length
  const threshold = CAT_HIGH_AVG_THRESHOLD[category] ?? 40
  return avg > threshold ? (CAT_ADVICE[category]?.high ?? '') : (CAT_ADVICE[category]?.low ?? '')
}

export function computeBudgetInsights(input: BudgetInsightInput): BudgetInsight[] {
  const { totalBudget, totalSpent, expenses, start_date, dayNumber, daysLeftInTrip } = input

  if (totalBudget <= 0) return []

  const remaining = totalBudget - totalSpent
  const elapsedDays = dayNumber - 1
  const totalTripDays = dayNumber + daysLeftInTrip

  const inTripSpend = expenses
    .filter(e => e.date >= start_date)
    .reduce((s, e) => s + e.amount, 0)

  const dailyBurnRate = elapsedDays >= MIN_DAYS_FOR_BURN_RATE
    ? inTripSpend / elapsedDays
    : null

  const projectedTotal = dailyBurnRate != null
    ? totalSpent + dailyBurnRate * daysLeftInTrip
    : null

  const budgetPerRemainingDay = daysLeftInTrip > 0 ? remaining / daysLeftInTrip : null
  const evenDailyRate = totalTripDays > 0 ? totalBudget / totalTripDays : null

  // Top spending category
  const catTotals: Record<string, number> = {}
  for (const e of expenses) {
    catTotals[e.category] = (catTotals[e.category] ?? 0) + e.amount
  }
  const topCategory = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  const insights: BudgetInsight[] = []

  // 1. Over budget now
  if (remaining < 0) {
    const overBy = Math.abs(remaining)
    const action = topCategory
      ? `${getCategoryAdvice(expenses, topCategory)} — your biggest spend is ${topCategory} (${fmt(catTotals[topCategory])}).`
      : 'Review your largest expenses to find where you can cut.'
    insights.push({
      id: 'over_budget',
      severity: 'critical',
      title: 'Over budget',
      detail: `You've exceeded your ${fmt(totalBudget)} budget by ${fmt(overBy)}.`,
      action,
    })
    return insights
  }

  // 2. Will run out before trip ends
  if (dailyBurnRate != null && projectedTotal != null && projectedTotal > totalBudget) {
    const daysUntilBroke = dailyBurnRate > 0 ? Math.floor(remaining / dailyBurnRate) : daysLeftInTrip
    const safeDaily = daysLeftInTrip > 0 ? remaining / daysLeftInTrip : 0
    const action = topCategory
      ? `Cut to ${fmt(safeDaily)}/day to make it to the end. ${getCategoryAdvice(expenses, topCategory)} — your heaviest category is ${topCategory} (${fmt(catTotals[topCategory])}).`
      : `Cut daily spending to ${fmt(safeDaily)}/day to last the trip.`
    insights.push({
      id: 'will_run_out',
      severity: 'critical',
      title: 'Budget at risk',
      detail: `At your pace (${fmt(dailyBurnRate)}/day), you'll run out of money in ${daysUntilBroke} day${daysUntilBroke === 1 ? '' : 's'}.`,
      action,
    })
    return insights
  }

  // 3. Tight runway
  if (
    budgetPerRemainingDay != null &&
    evenDailyRate != null &&
    budgetPerRemainingDay < evenDailyRate * TIGHT_RATIO &&
    daysLeftInTrip > 0
  ) {
    const action = topCategory
      ? `Focus cuts on ${topCategory}. ${getCategoryAdvice(expenses, topCategory)} Aim for ${fmt(budgetPerRemainingDay)}/day or less.`
      : `Aim for ${fmt(budgetPerRemainingDay)}/day or less for the remaining ${daysLeftInTrip} days.`
    insights.push({
      id: 'tight_budget',
      severity: 'warning',
      title: 'Tight runway',
      detail: `You have ${fmt(budgetPerRemainingDay)}/day left for ${daysLeftInTrip} day${daysLeftInTrip === 1 ? '' : 's'} (originally ${fmt(evenDailyRate)}/day).`,
      action,
    })
    return insights
  }

  // 4. Good pace
  const topNote = topCategory
    ? ` Your biggest spend is ${topCategory} at ${fmt(catTotals[topCategory])}.`
    : ''
  insights.push({
    id: 'good_pace',
    severity: 'positive',
    title: 'On track',
    detail: `You're on track — ${fmt(remaining)} remaining with ${daysLeftInTrip} day${daysLeftInTrip === 1 ? '' : 's'} to go.`,
    action: `Keep it up.${topNote}`,
  })

  return insights
}
