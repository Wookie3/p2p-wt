import { useEffect, useState } from 'react'

export function useMicPermission() {
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown')

  useEffect(() => {
    if (typeof navigator === 'undefined') {
      setPermission('unknown')
      return
    }

    // Check permission using Permissions API
    navigator.permissions.query({ name: 'microphone' as PermissionName })
      .then(result => {
        setPermission(result.state as 'granted' | 'denied' | 'prompt')
        result.addEventListener('change', () => {
          setPermission(result.state as 'granted' | 'denied' | 'prompt')
        })
      })
      .catch(() => {
        // Browser doesn't support permissions API
        setPermission('unknown')
      })
  }, [])

  return permission
}
