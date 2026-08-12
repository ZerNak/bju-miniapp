import { useEffect, useRef, useState } from 'react'
import { getModelStatus, preloadModel, recognizeFood } from '../lib/recognize'
import type { RecognitionResult } from '../types'

type Props = {
  onRecognized: (result: RecognitionResult, previewUrl: string) => void
  onManual: () => void
}

export function AddMeal({ onRecognized, onManual }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modelNote, setModelNote] = useState('Модель загрузится при распознавании')
  const imgRef = useRef<HTMLImageElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    preloadModel()
    const t = window.setInterval(() => {
      const s = getModelStatus()
      if (s === 'loading') setModelNote('Загружаем Food-101 модель…')
      if (s === 'ready') setModelNote('Модель готова')
      if (s === 'error') setModelNote('Модель недоступна — используй ручной ввод')
    }, 400)
    return () => window.clearInterval(t)
  }, [])

  function onFile(file: File | undefined) {
    if (!file) return
    setError(null)
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  async function runRecognize() {
    if (!imgRef.current || !preview) return
    setBusy(true)
    setError(null)
    try {
      if (!imgRef.current.complete) {
        await new Promise<void>((resolve, reject) => {
          imgRef.current!.onload = () => resolve()
          imgRef.current!.onerror = () => reject(new Error('Не удалось открыть фото'))
        })
      }
      const result = await recognizeFood(imgRef.current)
      onRecognized(result, preview)
    } catch (e) {
      setError(
        e instanceof Error
          ? `${e.message}. Можно ввести блюдо вручную.`
          : 'Ошибка распознавания',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="screen">
      <header className="screen__header">
        <p className="eyebrow">Распознавание</p>
        <h1>Что на тарелке?</h1>
        <p className="muted">
          Сфотографируй еду. ИИ предложит блюдо — ты поправишь граммы и сохранишь.
        </p>
        <p className="hint">{modelNote}</p>
      </header>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => onFile(e.target.files?.[0])}
      />

      <div className="photo-box">
        {preview ? (
          <img ref={imgRef} src={preview} alt="Еда" className="photo-box__img" />
        ) : (
          <div className="photo-box__empty">Фото появится здесь</div>
        )}
      </div>

      <div className="btn-row">
        <button type="button" className="btn btn--primary" onClick={() => fileRef.current?.click()}>
          {preview ? 'Другое фото' : 'Камера / галерея'}
        </button>
        {preview && (
          <button
            type="button"
            className="btn btn--secondary"
            disabled={busy}
            onClick={() => void runRecognize()}
          >
            {busy ? 'Распознаём…' : 'Распознать'}
          </button>
        )}
      </div>

      {error && <p className="error">{error}</p>}

      <button type="button" className="btn btn--ghost" onClick={onManual}>
        Ввести вручную
      </button>
    </div>
  )
}
