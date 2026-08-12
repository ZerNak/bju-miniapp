import { useEffect, useMemo, useState } from 'react'
import { ActivityPicker } from './components/ActivityPicker'
import { InfoTip } from './components/InfoTip'
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

  const draft: Profile = useMemo(
    () => ({ ...profile, weightKg, deficitPct, activity }),
    [profile, weightKg, deficitPct, activity],
  )

  const preview = useMemo(() => calcGoals(draft), [draft])

  const dirty =
    weightKg !== profile.weightKg ||
    deficitPct !== profile.deficitPct ||
    activity !== profile.activity

  // Сразу применяем цели в приложении (Сегодня и т.д.)
  useEffect(() => {
    if (!dirty) return
    const id = window.setTimeout(() => {
      saveProfile(draft, calcGoals(draft))
      onChange()
    }, 250)
    return () => window.clearTimeout(id)
  }, [dirty, draft, onChange])

  useEffect(() => {
    setWeightKg(profile.weightKg)
    setDeficitPct(profile.deficitPct)
    setActivity(profile.activity)
  }, [profile.weightKg, profile.deficitPct, profile.activity])

  function save() {
    if (!dirty) return
    saveProfile(draft, calcGoals(draft))
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
        <strong>{preview.calories} ккал / день</strong>
        <span>
          Б {preview.proteinG} · Ж {preview.fatG} · У {preview.carbsG}
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

      <div className="field">
        <span>Активность</span>
        <ActivityPicker value={activity} onChange={setActivity} variant="pills" />
      </div>

      <div className="field">
        <span className="field__label-row">
          Процент похудения: {deficitPct}%
          <InfoTip text="Это процент результата, на который вы хотите похудеть." />
        </span>
        <input
          type="range"
          min={10}
          max={25}
          value={deficitPct}
          onChange={(e) => setDeficitPct(Number(e.target.value))}
        />
      </div>

      <button
        type="button"
        className={dirty ? 'btn btn--primary' : 'btn btn--saved'}
        disabled={!dirty}
        onClick={save}
      >
        {dirty ? 'Сохранить цели' : 'Сохранено'}
      </button>

      <button type="button" className="btn btn--danger" onClick={reset}>
        Сбросить всё
      </button>
    </div>
  )
}
