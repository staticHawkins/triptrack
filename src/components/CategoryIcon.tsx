import {
  UtensilsCrossed,
  Plane,
  Home,
  Star,
  ShoppingBag,
  MoreHorizontal,
  type LucideProps,
} from 'lucide-react'
import type { Category } from '../lib/types'

const ICONS: Record<Category, React.FC<LucideProps>> = {
  Food:       UtensilsCrossed,
  Transport:  Plane,
  Lodging:    Home,
  Activities: Star,
  Supplies:   ShoppingBag,
  Other:      MoreHorizontal,
}

interface Props {
  category: Category
  color?: string
  size?: number
}

export default function CategoryIcon({ category, color = 'currentColor', size = 15 }: Props) {
  const Icon = ICONS[category] ?? MoreHorizontal
  return <Icon size={size} color={color} strokeWidth={1.8} />
}
