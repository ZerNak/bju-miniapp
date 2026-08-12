import { MacroSummary } from './components/MacroBar'
import { removeEntry } from '../lib/storage'
import { sumMacros, todayKey } from '../lib/nutrition'
import type { AppState } from '../types'

type Props = {
  state: AppState
  firstName: string
  onChange: () => void
  onAddPhoto: () => void
}

export function Today({ state, firstName, onChange, onAddPhoto }: Props) {
  const day = todayKey()
  const today = state.entries.filter((e) => e.date === day)
  const totals = sumMacros(today)
  const goals = state.goals!

  return (
    <div className="screen">
      <header className="screen__header">
        <p className="eyebrow">Сегодня</p>
        <h1>{firstName}, держим темп</h1>
        <p className="muted">
          Осталось {Math.max(0, goals.calories - totals.calories)} ккал до цели
        </p>
      </header>

      <MacroSummary goals={goals} current={totals} />

      <button type="button" className="btn btn--primary" onClick={onAddPhoto}>
        Сфотографировать еду
      </button>

      <section className="list-section">
        <h2>Приёмы пищи</h2>
        {today.length === 0 ? (
          <p className="muted">Пока пусто — добавь первое блюдо с фото или вручную.</p>
        ) : (
          <ul className="entry-list">
            {today.map((e) => (
              <li key={e.id} className="entry-card">
                <div>
                  <strong>{e.nameRu}</strong>
                  <p className="muted">
                    {e.grams} г · {e.calories} ккал · Б {e.protein} Ж {e.fat} У {e.carbs}
                    {e.source === 'ai' ? ' · ИИ' : ''}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => {
                    removeEntry(e.id)
                    onChange()
                  }}
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
