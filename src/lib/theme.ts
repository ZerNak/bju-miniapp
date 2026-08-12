const THEME_KEY = 'bju-miniapp-theme'

export type ThemeMode = 'light' | 'dark'

export function loadTheme(): ThemeMode {
  try {
    const v = localStorage.getItem(THEME_KEY)
    return v === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function saveTheme(theme: ThemeMode): void {
  localStorage.setItem(THEME_KEY, theme)
}

export function applyTheme(theme: ThemeMode): void {
  document.documentElement.dataset.theme = theme
}
