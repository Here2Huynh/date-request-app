import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'mt-2 h-12 w-full rounded-xl border border-[#edd8d9] bg-[#fffaf9] px-3.5 text-sm text-[#403a3b] outline-none transition-colors placeholder:text-[#a69799] focus:border-[#e77c8f] focus:ring-2 focus:ring-[#f9cbd1]',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
