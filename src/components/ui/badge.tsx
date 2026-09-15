import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-[#f0d7d9] bg-[#fff7f7] px-3 py-2 text-xs text-[#6b5d60]',
        className,
      )}
      {...props}
    />
  )
}
