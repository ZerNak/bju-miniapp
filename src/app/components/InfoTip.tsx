import { useEffect, useId, useRef, useState } from 'react'

type Props = {
  text: string
}

export function InfoTip({ text }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLSpanElement>(null)
  const tipId = useId()

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent | TouchEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('touchstart', onDoc)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('touchstart', onDoc)
    }
  }, [open])

  return (
    <span className={`info-tip${open ? ' is-open' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="info-tip__btn"
        aria-label="Подсказка"
        aria-expanded={open}
        aria-controls={tipId}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen((v) => !v)
        }}
      >
        ⓘ
      </button>
      {open && (
        <span className="info-tip__bubble" id={tipId} role="tooltip">
          {text}
        </span>
      )}
    </span>
  )
}
