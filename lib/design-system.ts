// Design system constants

export const colors = {
  primary: '#2563eb',
  primaryHover: '#1d4ed8',
  success: '#22c55e',
  warning: '#eab308',
  danger: '#ef4444',
} as const

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '40px',
  '3xl': '48px',
} as const

export const typography = {
  h1: 'text-3xl font-bold tracking-tight',
  h2: 'text-2xl font-semibold tracking-tight',
  h3: 'text-xl font-semibold',
  body: 'text-base',
  small: 'text-sm',
  muted: 'text-sm text-zinc-400',
} as const

export const borderRadius = {
  sm: 'rounded-md',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  full: 'rounded-full',
} as const
