import type { TgUser } from './telegram-types'

export type { TgUser }

function isRealTelegram(): boolean {
  return Boolean(window.Telegram?.WebApp?.initData)
}

export function initTelegram(): TgUser {
  if (!isRealTelegram()) {
    return { firstName: 'друг' }
  }

  try {
    const wa = window.Telegram!.WebApp!
    wa.ready?.()
    wa.expand?.()

    const tp = wa.themeParams
    if (tp?.button_color) {
      document.documentElement.style.setProperty('--tg-button', tp.button_color)
    }
    if (tp?.button_text_color) {
      document.documentElement.style.setProperty('--tg-button-text', tp.button_text_color)
    }

    const u = wa.initDataUnsafe?.user
    if (u?.first_name) {
      return { firstName: u.first_name, id: u.id }
    }
  } catch {
    // ignore — browser preview
  }

  return { firstName: 'друг' }
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string
        colorScheme?: string
        themeParams?: {
          bg_color?: string
          text_color?: string
          button_color?: string
          button_text_color?: string
        }
        initDataUnsafe?: {
          user?: { first_name?: string; id?: number }
        }
        ready?: () => void
        expand?: () => void
      }
    }
  }
}
