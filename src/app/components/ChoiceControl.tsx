import { useEffect, useId, useRef, useState } from 'react'

export type ChoiceOption<T extends string | number> = {
  value: T
  label: string
}

type Props<T extends string | number> = {
  label?: string
  value: T
  options: ChoiceOption<T>[]
  onChange: (value: T) => void
  /** pills = горизонтальные чипы; menu = выпадающий список */
  variant?: 'pills' | 'menu'
}

export function ChoiceControl<T extends string | number>({
  value,
  options,
  onChange,
  variant = 'pills',
}: Props<T>) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  if (variant === 'pills') {
    return (
      <div className="choice-pills" role="listbox" aria-label="Варианты">
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            role="option"
            aria-selected={o.value === value}
            className={o.value === value ? 'choice-pill is-active' : 'choice-pill'}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={`choice-menu${open ? ' is-open' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="choice-menu__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{selected?.label ?? 'Выбрать'}</span>
        <span className="choice-menu__chev" aria-hidden>
          ▾
        </span>
      </button>
      {open && (
        <ul className="choice-menu__list" id={listId} role="listbox">
          {options.map((o) => (
            <li key={String(o.value)}>
              <button
                type="button"
                role="option"
                aria-selected={o.value === value}
                className={
                  o.value === value ? 'choice-menu__option is-active' : 'choice-menu__option'
                }
                onClick={() => {
                  onChange(o.value)
                  setOpen(false)
                }}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
