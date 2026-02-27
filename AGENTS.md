# AGENTS.md - Agent Coding Guidelines

This file contains guidelines for agentic coding assistants working on this repository.

---

## Build / Lint / Test Commands

```bash
# Development
npm run dev              # Start dev server on http://localhost:3000

# Build & Production
npm run build            # Build for production
npm start                # Start production server (requires build first)

# Linting & Type Checking
npm run lint             # Run ESLint
npx tsc --noEmit        # Type check without emitting files

# Running Tests (when implemented)
# Note: No test framework configured yet. Add one of:
# npm test                # Run all tests
# npm test -- path/to/test.spec.ts  # Run single test file
# npm test -- -t "test name"         # Run tests matching pattern
```

---

## Code Style Guidelines

### Imports & Exports

```typescript
// Order: React/Next.js → External libs → Internal modules
'use client'  // Top of client components only

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'
import type { User } from '@/types'
```

- Use `@/*` path alias for internal imports (configured in tsconfig.json)
- Group imports logically, no blank lines between groups
- Type imports: `import type { TypeName }` or inline `import { type TypeName }`

### Naming Conventions

```typescript
// Components: PascalCase
function UserProfile() { }
const ContactList = () => { }

// Functions/Variables: camelCase
const handleSubmit = () => { }
let isLoggedIn = false

// Interfaces/Types: PascalCase
interface AppState { }
type UserProfile = { }

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3
const API_BASE_URL = '/api'

// File names: kebab-case or PascalCase for components
components/user-profile.tsx
lib/audio-recorder.ts
hooks/usePeerConnection.ts
```

### TypeScript Rules

```typescript
// Enable strict mode - no `any` types unless absolutely necessary
// Prefer explicit types over inference for public APIs
interface Props {
  username: string
  onEdit: (id: string) => void
}

// Use union types for string literals
type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'

// Use optional chaining and nullish coalescing
const username = profile?.username ?? 'Anonymous'

// Never use `@ts-ignore` - fix the type issue instead
// Generate proper Supabase types: npx supabase gen types typescript --linked > types/database.ts
```

### Formatting

```typescript
// 2 spaces indentation, no semicolons
const fetchData = async () => {
  const { data, error } = await supabase.from('profiles').select('*')
  if (error) {
    console.error('Error:', error)
    return
  }
  return data
}

// Shorthand arrow functions for single params
contacts.filter(c => c.id === contactId)

// Use template literals for string interpolation
const message = `Hello, ${username}!`
```

### Error Handling

```typescript
// Async operations: always handle errors
try {
  await supabase.from('profiles').insert(data)
  toast.success('Profile created')
} catch (error) {
  console.error('Failed to create profile:', error)
  toast.error('Failed to create profile')
}

// Database operations: check error property
const { data, error } = await supabase.from('profiles').select('*')
if (error) {
  console.error('Query error:', error)
  return
}

// User-facing errors: use toast.error()
// Debug errors: use console.error() with context
```

### Component Structure

```typescript
'use client'  // Only for client components

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  // Define props interface
}

export default function ComponentName({ param }: Props) {
  // Hooks at top level
  const router = useRouter()
  const [state, setState] = useState(null)

  // Event handlers
  const handleClick = () => { }

  // Effects
  useEffect(() => { }, [])

  // Render
  return (
    <div className="flex flex-col">
      {/* JSX */}
    </div>
  )
}
```

### Styling with Tailwind

```typescript
// Use cn() helper for conditional classes
import { cn } from '@/lib/utils'

<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  'hover:states'
)} />

// Follow utility class order: layout → spacing → typography → color → effects
<button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
  Button text
</button>

// Color palette (dark theme):
// Backgrounds: zinc-950 (main), zinc-900 (cards), zinc-800 (borders)
// Text: white (primary), zinc-400 (secondary), zinc-500 (muted)
// Accents: blue-600 (primary), green-500 (success), red-500 (danger)
```

### Zustand Store Pattern

```typescript
import { create } from 'zustand'

interface StoreState {
  // State
  currentUser: User | null

  // Actions
  setCurrentUser: (user: User | null) => void
}

export const useStore = create<StoreState>((set) => ({
  currentUser: null,

  setCurrentUser: (currentUser) => set({ currentUser }),
}))
```

---

## File Organization

```
app/                    # Next.js app router
├── (auth)/            # Auth route group
├── (main)/            # Main app route group
├── api/                # API routes
└── layout.tsx          # Root layout
components/             # Reusable components
├── ui/                # shadcn/ui components
└── feature-specific/   # Domain components
lib/                   # Utility functions
├── supabase.ts
├── peerjs.ts
├── utils.ts
└── *.ts
store/                 # State management
└── useStore.ts
types/                 # TypeScript definitions
└── index.ts
hooks/                 # Custom React hooks
constants/             # Constants
```

---

## Security Best Practices

- Never expose `peer_id` to non-contacts
- Validate all user inputs before Supabase queries
- Use Supabase RLS policies for data access control
- Sanitize usernames before display: `username.replace(/[^a-zA-Z0-9_-]/g, '')`
- Use `randomUUID()` for IDs instead of `Date.now()`
- Verify WebRTC connections before accepting
- Never commit `.env.local` or secrets
- Use service role key only in server-side code

---

## WebRTC / Audio Notes

- TURN servers required for NAT traversal (80% of users)
- Audio sample rate: 16000 Hz for speech
- Chunk interval: 100ms for low latency
- Always cleanup AudioContext and MediaRecorder on unmount
- Close WebRTC Peer connections to prevent memory leaks

---

## Common Patterns

### Database Query Pattern
```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', value)

if (error) {
  console.error('Error:', error)
  toast.error('Operation failed')
  return
}
// Use data...
```

### Toast Notification Pattern
```typescript
import toast from 'react-hot-toast'

toast.success('Success message')
toast.error('Error message')
toast.loading('Loading...')
toast.dismiss(toastId)
```

### Route Transition Pattern
```typescript
const router = useRouter()
router.push('/path/to/page')
router.back()
router.refresh()
```
