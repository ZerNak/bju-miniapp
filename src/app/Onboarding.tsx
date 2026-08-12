import { useMemo, useState, type FormEvent } from 'react'
import { ActivityPicker } from './components/ActivityPicker'
import { InfoTip } from './components/InfoTip'
import { calcGoals } from '../lib/nutrition'
import { saveProfile } from '../lib/storage'
import type { Profile, Sex } from '../types'

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
  const [activity, setActivity] = useState<Profile['activity']>(1.375)
  const [deficitPct, setDeficitPct] = useState(20)

  const ageN = parsePositive(age)
  const heightN = parsePositive(heightCm)
  const weightN = parsePositive(weightKg)

  const valid =
    ageN !== null &&
    ageN >= 14 &&
    ageN <= 90 &&
    heightN !== null &&
    heightN >= 120 &&
    heightN <= 230 &&
    weightN !== null &&
    weightN >= 35 &&
    weightN <= 250

  const preview = useMemo(() => {
    if (!valid || ageN === null || heightN === null || weightN === null) return null
    return calcGoals({
      sex,
      age: ageN,
      heightCm: heightN,
      weightKg: weightN,
      activity,
      deficitPct,
    })
  }, [valid, sex, ageN, heightN, weightN, activity, deficitPct])

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!valid || ageN === null || heightN === null || weightN === null) return
    const profile: Profile = {
      sex,
      age: ageN,
      heightCm: heightN,
      weightKg: weightN,
      activity,
      deficitPct,
    }
    saveProfile(profile, calcGoals(profile))
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
          <span>Вес, кг</span>
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

        <div className="goal-preview">
          {preview ? (
            <>
              <strong>{preview.calories} ккал</strong>
              <span>
                Б {preview.proteinG} · Ж {preview.fatG} · У {preview.carbsG}
              </span>
            </>
          ) : (
            <span className="muted">Заполни возраст, рост и вес — появится расчёт цели</span>
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
