import type { TgUser } from './telegram-types'

export type { TgUser }

function isRealTelegram(): boolean {
  return Boolean(window.Telegram?.WebApp?.initData)
}

function syncTelegramViewport(wa: NonNullable<Window['Telegram']>['WebApp']) {
  if (!wa) return
  const apply = () => {
    const h = wa.viewportStableHeight || wa.viewportHeight || window.innerHeight
    document.documentElement.style.setProperty('--app-height', `${Math.round(h)}px`)
  }
  apply()
  wa.onEvent?.('viewportChanged', apply)
  window.addEventListener('resize', apply)
}

export function initTelegram(): TgUser {
  const narrow = window.matchMedia('(max-width: 900px)').matches
  if (narrow) document.documentElement.classList.add('is-mobile')

  if (!isRealTelegram()) {
    return { firstName: 'друг' }
  }

  try {
    const wa = window.Telegram!.WebApp!
    document.documentElement.classList.add('is-telegram')
    wa.ready?.()
    wa.expand?.()
    wa.disableVerticalSwipes?.()
    syncTelegramViewport(wa)

    if (wa.colorScheme === 'dark') {
      // keep in-app theme toggle; only hint Telegram chrome
    }

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
        viewportHeight?: number
        viewportStableHeight?: number
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
        disableVerticalSwipes?: () => void
        onEvent?: (event: string, cb: () => void) => void
      }
    }
  }
}
