import { useState, useEffect } from 'react'

interface StatusPreference {
  status_key: 'to_watch' | 'watching' | 'watched'
  custom_label: string
  icon: string
  color: string
}

const DEFAULT_STATUSES: Record<string, StatusPreference> = {
  to_watch: {
    status_key: 'to_watch',
    custom_label: 'Want to Watch',
    icon: '📌',
    color: 'blue',
  },
  watching: {
    status_key: 'watching',
    custom_label: 'Watching',
    icon: '▶️',
    color: 'yellow',
  },
  watched: {
    status_key: 'watched',
    custom_label: 'Watched',
    icon: '✅',
    color: 'green',
  },
}

export function useStatusPreferences() {
  const [preferences, setPreferences] = useState<Record<string, StatusPreference>>(DEFAULT_STATUSES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/user/status-preferences')
      if (response.ok) {
        const data = await response.json()
        if (data.preferences && data.preferences.length > 0) {
          const customPrefs: Record<string, StatusPreference> = {}
          data.preferences.forEach((pref: StatusPreference) => {
            customPrefs[pref.status_key] = pref
          })
          // Merge with defaults
          setPreferences({ ...DEFAULT_STATUSES, ...customPrefs })
        }
      }
    } catch (error) {
      console.error('Failed to fetch status preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  return { preferences, loading }
}

