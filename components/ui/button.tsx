import { Button } from '@/components/ui/button'

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'border border-zinc-700 text-zinc-300 hover:bg-zinc-800',
    destructive: 'bg-red-500 text-white hover:bg-red-600',
    ghost: 'text-zinc-400 hover:bg-zinc-800',
  }

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3',
  }

  return (
    <button
      className={`rounded-lg font-medium transition-colors ${
        variants[variant as keyof typeof variants]
      } ${sizes[size as keyof typeof sizes]} ${className || ''}`}
      {...props}
    />
  )
}
