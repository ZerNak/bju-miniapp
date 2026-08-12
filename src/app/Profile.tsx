import { useEffect, useMemo, useState } from 'react'
import { ActivityPicker } from './components/ActivityPicker'
import { DurationPicker } from './components/DurationPicker'
import { InfoTip } from './components/InfoTip'
import { calcGoals, calcPlanMeta, resolveTargetWeight, resolveWeeks } from '../lib/nutrition'
import { clearAll, saveProfile } from '../lib/storage'
import type { AppState, PlanWeeks, Profile } from '../types'

type Props = {
  state: AppState
  onChange: () => void
  onResetOnboarding: () => void
}

export function ProfileScreen({ state, onChange, onResetOnboarding }: Props) {
  const profile = state.profile!
  const [weightKg, setWeightKg] = useState(profile.weightKg)
  const [targetWeightKg, setTargetWeightKg] = useState(resolveTargetWeight(profile))
  const [weeks, setWeeks] = useState<PlanWeeks>(resolveWeeks(profile))
  const [activity, setActivity] = useState<Profile['activity']>(profile.activity)

  const draft: Profile = useMemo(() => {
    const base: Profile = {
      ...profile,
      weightKg,
      targetWeightKg,
      weeks,
      activity,
      deficitPct: profile.deficitPct ?? 15,
    }
    const meta = calcPlanMeta(base)
    return { ...base, deficitPct: meta.deficitPct }
  }, [profile, weightKg, targetWeightKg, weeks, activity])

  const meta = useMemo(() => calcPlanMeta(draft), [draft])

  const dirty =
    weightKg !== profile.weightKg ||
    targetWeightKg !== resolveTargetWeight(profile) ||
    weeks !== resolveWeeks(profile) ||
    activity !== profile.activity

  useEffect(() => {
    if (!dirty) return
    if (targetWeightKg >= weightKg || targetWeightKg < 35) return
    const id = window.setTimeout(() => {
      saveProfile(draft, calcGoals(draft))
      onChange()
    }, 250)
    return () => window.clearTimeout(id)
  }, [dirty, draft, onChange, targetWeightKg, weightKg])

  useEffect(() => {
    setWeightKg(profile.weightKg)
    setTargetWeightKg(resolveTargetWeight(profile))
    setWeeks(resolveWeeks(profile))
    setActivity(profile.activity)
  }, [profile])

  function save() {
    if (!dirty) return
    if (targetWeightKg >= weightKg || targetWeightKg < 35) return
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
        <strong>{meta.goals.calories} ккал / день</strong>
        <span>
          Б {meta.goals.proteinG} · Ж {meta.goals.fatG} · У {meta.goals.carbsG}
        </span>
        <span className="muted">
          ≈ {meta.kgPerWeek} кг/нед · дефицит ~{meta.deficitPct}%
        </span>
      </div>

      <label className="field">
        <span>Текущий вес, кг</span>
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
        <span className="field__label-row">
          Целевой вес, кг
          <InfoTip text="Вес, к которому хотите прийти. Должен быть меньше текущего." />
        </span>
        <input
          type="number"
          min={35}
          max={249}
          step={0.1}
          value={targetWeightKg}
          onChange={(e) => setTargetWeightKg(Number(e.target.value))}
        />
      </label>

      <div className="field">
        <span className="field__label-row">
          Срок похудения
          <InfoTip text="За сколько хотите прийти к целевому весу. От срока зависит дневной дефицит калорий." />
        </span>
        <DurationPicker value={weeks} onChange={setWeeks} />
      </div>

      <div className="field">
        <span>Активность</span>
        <ActivityPicker value={activity} onChange={setActivity} variant="pills" />
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
