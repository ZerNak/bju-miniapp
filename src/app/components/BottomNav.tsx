import type { Screen } from '../../types'

type Props = {
  screen: Screen
  onChange: (s: Screen) => void
}

const items: Array<{ id: Screen; label: string }> = [
  { id: 'today', label: 'Сегодня' },
  { id: 'add', label: 'Фото' },
  { id: 'manual', label: 'Вручную' },
  { id: 'profile', label: 'Профиль' },
]

export function BottomNav({ screen, onChange }: Props) {
  const active = screen === 'confirm' ? 'add' : screen

  return (
    <nav className="bottom-nav" aria-label="Навигация">
      {items.map((item) => {
        const isActive = active === item.id
        return (
          <button
            key={item.id}
            type="button"
            className={isActive ? 'bottom-nav__item is-active' : 'bottom-nav__item'}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onChange(item.id)}
          >
            <span className="bottom-nav__label">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
