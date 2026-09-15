import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'mt-2 min-h-20 w-full resize-y rounded-xl border border-[#edd8d9] bg-[#fffaf9] px-3.5 py-3 text-sm text-[#403a3b] outline-none transition-colors placeholder:text-[#a69799] focus:border-[#e77c8f] focus:ring-2 focus:ring-[#f9cbd1]',
      className,
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'
