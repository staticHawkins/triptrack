import { C } from '../lib/constants'

interface Props {
  pct: number
  color?: string
  height?: number
  trackColor?: string
}

export default function ProgressBar({ pct, color = C.tealLight, height = 4, trackColor = C.sandDark }: Props) {
  return (
    <div style={{ height, background: trackColor, borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, pct))}%`, background: color, borderRadius: 2 }} />
    </div>
  )
}
