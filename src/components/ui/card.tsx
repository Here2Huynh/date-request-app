import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Card({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn(
        'w-full rounded-[22px] bg-white/85 p-7 shadow-[0_18px_55px_rgba(98,62,62,0.07)] sm:p-10',
        className,
      )}
      {...props}
    />
  )
}
