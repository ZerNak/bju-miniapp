import { useState } from 'react'
import { ActivityPicker } from './components/ActivityPicker'
import { calcGoals } from '../lib/nutrition'
import { clearAll, saveProfile } from '../lib/storage'
import type { AppState, Profile } from '../types'

type Props = {
  state: AppState
  onChange: () => void
  onResetOnboarding: () => void
}

export function ProfileScreen({ state, onChange, onResetOnboarding }: Props) {
  const profile = state.profile!
  const [weightKg, setWeightKg] = useState(profile.weightKg)
  const [deficitPct, setDeficitPct] = useState(profile.deficitPct)
  const [activity, setActivity] = useState<Profile['activity']>(profile.activity)

  function save() {
    const next: Profile = { ...profile, weightKg, deficitPct, activity }
    saveProfile(next, calcGoals(next))
    onChange()
  }

  function reset() {
    if (!confirm('Сбросить профиль и дневник?')) return
    clearAll()
    onResetOnboarding()
  }

  return (
    <div className="screen">
      <header className="screen__header">
        <p className="eyebrow">Профиль</p>
        <h1>Цели и данные</h1>
        <p className="muted">Данные только в этом браузере / Telegram WebView.</p>
      </header>

      <div className="goal-preview">
        <strong>{state.goals?.calories} ккал / день</strong>
        <span>
          Б {state.goals?.proteinG} · Ж {state.goals?.fatG} · У {state.goals?.carbsG}
        </span>
      </div>

      <label className="field">
        <span>Вес, кг</span>
        <input
          type="number"
          min={35}
          max={250}
          step={0.1}
          value={weightKg}
          onChange={(e) => setWeightKg(Number(e.target.value))}
        />
      </label>

      <label className="field">
        <span>Активность</span>
        <ActivityPicker value={activity} onChange={setActivity} variant="menu" />
      </label>

      <label className="field">
        <span>Процент похудения: {deficitPct}%</span>
        <input
          type="range"
          min={10}
          max={25}
          value={deficitPct}
          onChange={(e) => setDeficitPct(Number(e.target.value))}
        />
      </label>

      <button type="button" className="btn btn--primary" onClick={save}>
        Сохранить цели
      </button>

      <button type="button" className="btn btn--danger" onClick={reset}>
        Сбросить всё
      </button>
    </div>
  )
}
