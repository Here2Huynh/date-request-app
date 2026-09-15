import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-full px-6 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e95b73] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-[#ed5c77] text-white shadow-[0_8px_20px_rgba(237,92,119,0.18)] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(237,92,119,0.25)]',
        outline: 'border border-[#e8a4ad] bg-transparent text-[#e45770] hover:bg-[#fff4f3]',
        ghost: 'text-[#8c7779] underline underline-offset-4 hover:text-[#e45770]',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  secondary?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, secondary, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant: secondary ? 'outline' : variant }), className)}
      {...props}
    />
  ),
)
Button.displayName = 'Button'
