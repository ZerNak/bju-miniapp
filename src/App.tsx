import { useCallback, useEffect, useState } from 'react'
import { AddMeal } from './app/AddMeal'
import { AnimatedScreen } from './app/components/AnimatedScreen'
import { BottomNav } from './app/components/BottomNav'
import { ThemeToggle } from './app/components/ThemeToggle'
import { ConfirmFood } from './app/ConfirmFood'
import { ManualEntry } from './app/ManualEntry'
import { Onboarding } from './app/Onboarding'
import { ProfileScreen } from './app/Profile'
import { Today } from './app/Today'
import { loadState } from './lib/storage'
import { applyTheme, loadTheme, saveTheme, type ThemeMode } from './lib/theme'
import { initTelegram } from './telegram'
import type { AppState, RecognitionResult, Screen } from './types'
import './App.css'

export default function App() {
  const [user] = useState(() => initTelegram())
  const [state, setState] = useState<AppState>(() => loadState())
  const [screen, setScreen] = useState<Screen>('today')
  const [theme, setTheme] = useState<ThemeMode>(() => loadTheme())
  const [themePulse, setThemePulse] = useState(false)
  const [pending, setPending] = useState<{
    result: RecognitionResult
    previewUrl: string
  } | null>(null)

  const refresh = useCallback(() => {
    setState(loadState())
  }, [])

  useEffect(() => {
    applyTheme(theme)
    saveTheme(theme)
  }, [theme])

  useEffect(() => {
    if (!state.profile) return
    document.title = 'BJU Mini'
  }, [state.profile])

  const needsOnboarding = !state.profile || !state.goals

  function toggleTheme() {
    setThemePulse(true)
    setTheme((t) => (t === 'light' ? 'dark' : 'light'))
    window.setTimeout(() => setThemePulse(false), 420)
  }

  return (
    <div className="desktop-stage">
      <div className={`phone-frame${themePulse ? ' is-theme-pulse' : ''}`}>
        <div className="phone-notch" aria-hidden />
        <div className={`phone-screen theme-${theme}`}>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          {needsOnboarding ? (
            <main className="phone-main">
              <AnimatedScreen screenKey="onboarding">
                <Onboarding
                  firstName={user.firstName}
                  onDone={() => {
                    refresh()
                    setScreen('today')
                  }}
                />
              </AnimatedScreen>
            </main>
          ) : (
            <>
              <main className="phone-main">
                <AnimatedScreen screenKey={screen}>
                  {screen === 'today' && (
                    <Today
                      state={state}
                      firstName={user.firstName}
                      onChange={refresh}
                      onAddPhoto={() => setScreen('add')}
                    />
                  )}
                  {screen === 'add' && (
                    <AddMeal
                      onRecognized={(result, previewUrl) => {
                        setPending({ result, previewUrl })
                        setScreen('confirm')
                      }}
                      onManual={() => setScreen('manual')}
                    />
                  )}
                  {screen === 'confirm' && pending && (
                    <ConfirmFood
                      result={pending.result}
                      previewUrl={pending.previewUrl}
                      onSaved={() => {
                        setPending(null)
                        refresh()
                        setScreen('today')
                      }}
                      onCancel={() => {
                        setPending(null)
                        setScreen('add')
                      }}
                    />
                  )}
                  {screen === 'manual' && (
                    <ManualEntry
                      onSaved={() => {
                        refresh()
                        setScreen('today')
                      }}
                    />
                  )}
                  {screen === 'profile' && (
                    <ProfileScreen
                      state={state}
                      onChange={refresh}
                      onResetOnboarding={() => {
                        refresh()
                      }}
                    />
                  )}
                </AnimatedScreen>
              </main>
              <BottomNav screen={screen} onChange={setScreen} />
            </>
          )}
        </div>
      </div>
      <aside className="preview-help">
        <h2>Превью Mini App</h2>
        <p>
          Слева — как приложение выглядит в телефоне / Telegram. Данные не уходят на сервер.
        </p>
        <ol>
          <li>Заполни онбординг</li>
          <li>Открой «Фото» и выбери снимок еды</li>
          <li>Проверь граммы и сохрани в дневник</li>
        </ol>
      </aside>
    </div>
  )
}
