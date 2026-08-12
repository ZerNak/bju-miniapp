import { useMemo, useState } from 'react'
import { getFood, searchFoods } from '../lib/recognize'
import { macrosForGrams, todayKey } from '../lib/nutrition'
import { addEntry, uid } from '../lib/storage'

type Props = {
  onSaved: () => void
}

export function ManualEntry({ onSaved }: Props) {
  const [query, setQuery] = useState('')
  const [foodId, setFoodId] = useState<string | null>(null)
  const results = useMemo(() => searchFoods(query), [query])
  const food = foodId ? getFood(foodId) : null
  const [grams, setGrams] = useState(150)

  const macros = food ? macrosForGrams(food, grams) : null

  function pick(id: string) {
    setFoodId(id)
    const f = getFood(id)
    if (f) setGrams(f.defaultGrams)
  }

  function save() {
    if (!food || !macros) return
    addEntry({
      id: uid(),
      date: todayKey(),
      foodId: food.id,
      nameRu: food.nameRu,
      grams,
      ...macros,
      source: 'manual',
      createdAt: Date.now(),
    })
    onSaved()
  }

  return (
    <div className="screen">
      <header className="screen__header">
        <p className="eyebrow">Вручную</p>
        <h1>Добавить продукт</h1>
        <p className="muted">Найди блюдо в списке и укажи граммы.</p>
      </header>

      <label className="field">
        <span>Поиск</span>
        <input
          type="search"
          placeholder="Пицца, творог, гречка…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>

      <ul className="food-pick-list">
        {results.map((f) => (
          <li key={f.id}>
            <button
              type="button"
              className={foodId === f.id ? 'food-pick is-active' : 'food-pick'}
              onClick={() => pick(f.id)}
            >
              <strong>{f.nameRu}</strong>
              <span className="muted">
                {f.calories} ккал / 100 г · Б {f.protein} Ж {f.fat} У {f.carbs}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {food && macros && (
        <div className="manual-footer">
          <label className="field">
            <span>
              {food.nameRu}: {grams} г
            </span>
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
          <button type="button" className="btn btn--primary" onClick={save}>
            Сохранить
          </button>
        </div>
      )}
    </div>
  )
}
