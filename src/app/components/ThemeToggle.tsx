import type { ThemeMode } from '../../lib/theme'

type Props = {
  theme: ThemeMode
  onToggle: () => void
}

export function ThemeToggle({ theme, onToggle }: Props) {
  const next = theme === 'light' ? 'тёмную' : 'светлую'
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={`Включить ${next} тему`}
      title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
    >
      {theme === 'light' ? 'Тёмная' : 'Светлая'}
    </button>
  )
}
