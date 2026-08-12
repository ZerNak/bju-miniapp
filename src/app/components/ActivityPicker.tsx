import type { Profile } from '../../types'
import { ChoiceControl } from './ChoiceControl'

export const ACTIVITY_OPTIONS: Array<{ value: Profile['activity']; label: string }> = [
  { value: 1.2, label: 'Сидячий' },
  { value: 1.375, label: 'Лёгкая' },
  { value: 1.55, label: 'Средняя' },
  { value: 1.725, label: 'Высокая' },
]

type Props = {
  value: Profile['activity']
  onChange: (v: Profile['activity']) => void
  variant?: 'pills' | 'menu'
}

export function ActivityPicker({ value, onChange, variant = 'menu' }: Props) {
  return (
    <ChoiceControl
      value={value}
      options={ACTIVITY_OPTIONS}
      onChange={onChange}
      variant={variant}
    />
  )
}
