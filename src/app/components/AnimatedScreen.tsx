import type { ReactNode } from 'react'

type Props = {
  screenKey: string
  children: ReactNode
  className?: string
}

/** Remounts on screenKey change to replay enter animation. */
export function AnimatedScreen({ screenKey, children, className }: Props) {
  return (
    <div key={screenKey} className={className ? `screen-enter ${className}` : 'screen-enter'}>
      {children}
    </div>
  )
}
