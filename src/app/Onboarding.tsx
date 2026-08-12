import { useMemo, useState, type FormEvent } from 'react'
import { ActivityPicker } from './components/ActivityPicker'
import { DurationPicker } from './components/DurationPicker'
import { InfoTip } from './components/InfoTip'
import { calcGoals, calcPlanMeta } from '../lib/nutrition'
import { saveProfile } from '../lib/storage'
import type { PlanWeeks, Profile, Sex } from '../types'

type Props = {
  firstName: string
  onDone: () => void
}

function parsePositive(raw: string): number | null {
  if (raw.trim() === '') return null
  const n = Number(raw)
  if (!Number.isFinite(n)) return null
  return n
}

export function Onboarding({ firstName, onDone }: Props) {
  const [sex, setSex] = useState<Sex>('male')
  const [age, setAge] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [targetWeightKg, setTargetWeightKg] = useState('')
  const [activity, setActivity] = useState<Profile['activity']>(1.375)
  const [weeks, setWeeks] = useState<PlanWeeks>(12)

  const ageN = parsePositive(age)
  const heightN = parsePositive(heightCm)
  const weightN = parsePositive(weightKg)
  const targetN = parsePositive(targetWeightKg)

  const valid =
    ageN !== null &&
    ageN >= 14 &&
    ageN <= 90 &&
    heightN !== null &&
    heightN >= 120 &&
    heightN <= 230 &&
    weightN !== null &&
    weightN >= 35 &&
    weightN <= 250 &&
    targetN !== null &&
    targetN >= 35 &&
    targetN < weightN!

  const draft: Profile | null = useMemo(() => {
    if (!valid || ageN === null || heightN === null || weightN === null || targetN === null) {
      return null
    }
    return {
      sex,
      age: ageN,
      heightCm: heightN,
      weightKg: weightN,
      targetWeightKg: targetN,
      weeks,
      activity,
      deficitPct: 0,
    }
  }, [valid, sex, ageN, heightN, weightN, targetN, weeks, activity])

  const meta = useMemo(() => (draft ? calcPlanMeta(draft) : null), [draft])

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!draft) return
    const goals = calcGoals(draft)
    const profile: Profile = {
      ...draft,
      deficitPct: meta?.deficitPct ?? 15,
    }
    saveProfile(profile, goals)
    onDone()
  }

  return (
    <div className="screen onboarding">
      <header className="screen__header">
        <p className="eyebrow">BJU Mini</p>
        <h1>Привет, {firstName}</h1>
        <p className="muted">Считаем калории и БЖУ для похудения. Всё хранится только на устройстве.</p>
      </header>

      <form className="form" onSubmit={submit}>
        <label className="field">
          <span>Пол</span>
          <div className="segmented">
            <button
              type="button"
              className={sex === 'male' ? 'is-active' : undefined}
              onClick={() => setSex('male')}
            >
              Муж
            </button>
            <button
              type="button"
              className={sex === 'female' ? 'is-active' : undefined}
              onClick={() => setSex('female')}
            >
              Жен
            </button>
          </div>
        </label>

        <label className="field">
          <span>Возраст</span>
          <input
            type="number"
            inputMode="numeric"
            min={14}
            max={90}
            placeholder="Например, 28"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span>Рост, см</span>
          <input
            type="number"
            inputMode="numeric"
            min={120}
            max={230}
            placeholder="Например, 175"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span>Текущий вес, кг</span>
          <input
            type="number"
            inputMode="decimal"
            min={35}
            max={250}
            step={0.1}
            placeholder="Например, 80"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span className="field__label-row">
            Целевой вес, кг
            <InfoTip text="Вес, к которому хотите прийти. Должен быть меньше текущего." />
          </span>
          <input
            type="number"
            inputMode="decimal"
            min={35}
            max={249}
            step={0.1}
            placeholder="Например, 70"
            value={targetWeightKg}
            onChange={(e) => setTargetWeightKg(e.target.value)}
            required
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

        <div className="goal-preview">
          {meta ? (
            <>
              <strong>{meta.goals.calories} ккал</strong>
              <span>
                Б {meta.goals.proteinG} · Ж {meta.goals.fatG} · У {meta.goals.carbsG}
              </span>
              <span className="muted">
                ≈ {meta.kgPerWeek} кг/нед · дефицит ~{meta.deficitPct}%
              </span>
            </>
          ) : (
            <span className="muted">
              Заполни данные и целевой вес — появится расчёт ккал и БЖУ
            </span>
          )}
        </div>

        <button
          type="submit"
          className={valid ? 'btn btn--primary' : 'btn btn--saved'}
          disabled={!valid}
        >
          Начать
        </button>
      </form>
    </div>
  )
}
