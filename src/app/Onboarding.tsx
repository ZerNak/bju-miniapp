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

export function Onboarding({ firstName, onDone }: Props) {
  const [sex, setSex] = useState<Sex>('male')
  const [age, setAge] = useState(28)
  const [heightCm, setHeightCm] = useState(175)
  const [weightKg, setWeightKg] = useState(80)
  const [activity, setActivity] = useState<Profile['activity']>(1.375)
  const [deficitPct, setDeficitPct] = useState(20)

  const preview = useMemo(
    () =>
      calcGoals({
        sex,
        age,
        heightCm,
        weightKg,
        activity,
        deficitPct,
      }),
    [sex, age, heightCm, weightKg, activity, deficitPct],
  )

  function submit(e: FormEvent) {
    e.preventDefault()
    const profile: Profile = {
      sex,
      age,
      heightCm,
      weightKg,
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
            min={14}
            max={90}
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            required
          />
        </label>

        <label className="field">
          <span>Рост, см</span>
          <input
            type="number"
            min={120}
            max={230}
            value={heightCm}
            onChange={(e) => setHeightCm(Number(e.target.value))}
            required
          />
        </label>

        <label className="field">
          <span>Вес, кг</span>
          <input
            type="number"
            min={35}
            max={250}
            step={0.1}
            value={weightKg}
            onChange={(e) => setWeightKg(Number(e.target.value))}
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
          <strong>{preview.calories} ккал</strong>
          <span>
            Б {preview.proteinG} · Ж {preview.fatG} · У {preview.carbsG}
          </span>
        </div>

        <button type="submit" className="btn btn--primary">
          Начать
        </button>
      </form>
    </div>
  )
}
