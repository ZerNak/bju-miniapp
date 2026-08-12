import { useMemo, useState } from 'react'
import { ChoiceControl } from './components/ChoiceControl'
import { getFood, listFoods } from '../lib/recognize'
import { macrosForGrams, todayKey } from '../lib/nutrition'
import { addEntry, uid } from '../lib/storage'
import type { RecognitionResult } from '../types'

type Props = {
  result: RecognitionResult
  previewUrl: string
  onSaved: () => void
  onCancel: () => void
}

export function ConfirmFood({ result, previewUrl, onSaved, onCancel }: Props) {
  const [foodId, setFoodId] = useState(result.foodId)
  const food = getFood(foodId) ?? listFoods()[0]
  const [grams, setGrams] = useState(food.defaultGrams)

  const options = useMemo(() => {
    const altIds = new Set(result.alternatives.map((a) => a.foodId))
    const fromAi = result.alternatives
      .map((a) => {
        const f = getFood(a.foodId)
        if (!f) return null
        return {
          value: a.foodId,
          label: `${f.nameRu} · ${Math.round(a.confidence * 100)}%`,
        }
      })
      .filter((x): x is { value: string; label: string } => Boolean(x))

    const rest = listFoods()
      .filter((f) => !altIds.has(f.id))
      .map((f) => ({ value: f.id, label: f.nameRu }))

    return [...fromAi, ...rest]
  }, [result.alternatives])

  const macros = useMemo(() => macrosForGrams(food, grams), [food, grams])

  function pickFood(id: string) {
    setFoodId(id)
    const f = getFood(id)
    if (f) setGrams(f.defaultGrams)
  }

  function save() {
    addEntry({
      id: uid(),
      date: todayKey(),
      foodId: food.id,
      nameRu: food.nameRu,
      grams,
      ...macros,
      source: 'ai',
      createdAt: Date.now(),
    })
    onSaved()
  }

  return (
    <div className="screen">
      <header className="screen__header">
        <p className="eyebrow">Проверь результат</p>
        <h1>{food.nameRu}</h1>
        <p className="muted">
          Уверенность ИИ: {Math.round(result.confidence * 100)}%. Можно сменить блюдо и граммы.
        </p>
      </header>

      <img src={previewUrl} alt="" className="confirm-photo" />

      <label className="field">
        <span>Блюдо</span>
        <ChoiceControl value={foodId} options={options} onChange={pickFood} variant="menu" />
      </label>

      <label className="field">
        <span>Граммы: {grams} г</span>
        <input
          type="range"
          min={20}
          max={600}
          step={5}
          value={grams}
          onChange={(e) => setGrams(Number(e.target.value))}
        />
      </label>

      <div className="goal-preview">
        <strong>{macros.calories} ккал</strong>
        <span>
          Б {macros.protein} · Ж {macros.fat} · У {macros.carbs}
        </span>
      </div>

      <div className="btn-row">
        <button type="button" className="btn btn--primary" onClick={save}>
          В дневник
        </button>
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Отмена
        </button>
      </div>
    </div>
  )
}
