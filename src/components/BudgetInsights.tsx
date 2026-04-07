import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react'
import { C } from '../lib/constants'
import type { BudgetInsight } from '../lib/budgetInsights'

const SEVERITY_STYLE = {
  critical: { bg: C.dangerPale, border: C.danger,   icon: AlertTriangle, iconColor: C.danger },
  warning:  { bg: C.goldPale,   border: C.gold,     icon: AlertCircle,   iconColor: C.gold },
  positive: { bg: C.tealPale,   border: C.teal,     icon: CheckCircle2,  iconColor: C.teal },
}

export default function BudgetInsights({ insights }: { insights: BudgetInsight[] }) {
  if (insights.length === 0) return null

  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.inkMuted, marginBottom: 10 }}>
        Trip Insights
      </p>
      {insights.map(insight => {
        const s = SEVERITY_STYLE[insight.severity]
        const Icon = s.icon
        return (
          <div
            key={insight.id}
            style={{
              background: s.bg,
              borderRadius: 8,
              padding: '11px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              borderLeft: `3px solid ${s.border}`,
              marginBottom: 8,
            }}
          >
            <Icon size={15} color={s.iconColor} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 2 }}>
                {insight.title}
              </p>
              <p style={{ fontSize: 12, color: C.inkLight, marginBottom: 4 }}>
                {insight.detail}
              </p>
              <p style={{ fontSize: 12, color: s.iconColor, fontWeight: 500 }}>
                {insight.action}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
