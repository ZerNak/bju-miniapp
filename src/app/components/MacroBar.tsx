import { useEffect, useState } from 'react'
import type { Goals } from '../../types'

type Props = {
  label: string
  current: number
  goal: number
  unit: string
  accent: string
  delay?: number
}

export function MacroBar({ label, current, goal, unit, accent, delay = 0 }: Props) {
  const target = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0
  const [pct, setPct] = useState(0)
  const over = current > goal

  useEffect(() => {
    setPct(0)
    const id = window.requestAnimationFrame(() => {
      window.setTimeout(() => setPct(target), delay + 40)
    })
    return () => window.cancelAnimationFrame(id)
  }, [target, delay])

  return (
    <div className="macro-bar" style={{ animationDelay: `${delay}ms` }}>
      <div className="macro-bar__head">
        <span>{label}</span>
        <span className={over ? 'macro-bar__over' : undefined}>
          {Math.round(current)} / {goal} {unit}
        </span>
      </div>
      <div className="macro-bar__track">
        <div
          className="macro-bar__fill"
          style={{
            width: `${pct}%`,
            background: accent,
          }}
        />
      </div>
    </div>
  )
}

export function MacroSummary({
  goals,
  current,
}: {
  goals: Goals
  current: { calories: number; protein: number; fat: number; carbs: number }
}) {
  return (
    <div className="macro-summary">
      <MacroBar
        label="Калории"
        current={current.calories}
        goal={goals.calories}
        unit="ккал"
        accent="var(--accent)"
        delay={0}
      />
      <MacroBar
        label="Белки"
        current={current.protein}
        goal={goals.proteinG}
        unit="г"
        accent="var(--protein)"
        delay={80}
      />
      <MacroBar
        label="Жиры"
        current={current.fat}
        goal={goals.fatG}
        unit="г"
        accent="var(--fat)"
        delay={160}
      />
      <MacroBar
        label="Углеводы"
        current={current.carbs}
        goal={goals.carbsG}
        unit="г"
        accent="var(--carbs)"
        delay={240}
      />
    </div>
  )
}
