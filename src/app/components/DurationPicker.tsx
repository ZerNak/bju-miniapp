import type { PlanWeeks } from '../../types'
import { ChoiceControl } from './ChoiceControl'

export const WEEK_OPTIONS: Array<{ value: PlanWeeks; label: string }> = [
  { value: 4, label: '4 нед' },
  { value: 8, label: '2 мес' },
  { value: 12, label: '3 мес' },
  { value: 16, label: '4 мес' },
  { value: 24, label: '6 мес' },
]

type Props = {
  value: PlanWeeks
  onChange: (v: PlanWeeks) => void
}

export function DurationPicker({ value, onChange }: Props) {
  return (
    <ChoiceControl value={value} options={WEEK_OPTIONS} onChange={onChange} variant="pills" />
  )
}
