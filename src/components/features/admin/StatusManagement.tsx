'use client'

import { useState, useEffect } from 'react'

interface StatusPreference {
  id?: string
  status_key: 'to_watch' | 'watching' | 'watched'
  custom_label: string
  icon: string
  color: string
}

const DEFAULT_STATUSES: StatusPreference[] = [
  {
    status_key: 'to_watch',
    custom_label: 'Want to Watch',
    icon: '📌',
    color: 'blue',
  },
  {
    status_key: 'watching',
    custom_label: 'Watching',
    icon: '▶️',
    color: 'yellow',
  },
  {
    status_key: 'watched',
    custom_label: 'Watched',
    icon: '✅',
    color: 'green',
  },
]

const AVAILABLE_ICONS = ['📌', '▶️', '✅', '⭐', '❤️', '👀', '🎬', '📺', '🍿', '🎭']
const AVAILABLE_COLORS = [
  { name: 'blue', class: 'bg-blue-600' },
  { name: 'green', class: 'bg-green-600' },
  { name: 'yellow', class: 'bg-yellow-600' },
  { name: 'red', class: 'bg-red-600' },
  { name: 'purple', class: 'bg-purple-600' },
  { name: 'pink', class: 'bg-pink-600' },
  { name: 'indigo', class: 'bg-indigo-600' },
  { name: 'orange', class: 'bg-orange-600' },
]

export function StatusManagement() {
  const [statuses, setStatuses] = useState<StatusPreference[]>(DEFAULT_STATUSES)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/user/status-preferences')
      if (response.ok) {
        const data = await response.json()
        if (data.preferences && data.preferences.length > 0) {
          // Merge custom preferences with defaults
          const merged = DEFAULT_STATUSES.map((defaultStatus) => {
            const custom = data.preferences.find(
              (p: StatusPreference) => p.status_key === defaultStatus.status_key
            )
            return custom || defaultStatus
          })
          setStatuses(merged)
        }
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const savePreference = async (preference: StatusPreference) => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/user/status-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preference),
      })

      if (!response.ok) throw new Error('Failed to save preference')

      const data = await response.json()
      
      // Update local state
      setStatuses((prev) =>
        prev.map((s) =>
          s.status_key === preference.status_key
            ? { ...preference, id: data.preference.id }
            : s
        )
      )

      setMessage({ type: 'success', text: 'Status preference saved!' })
      setEditingId(null)
      
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Failed to save preference:', error)
      setMessage({ type: 'error', text: 'Failed to save preference' })
    } finally {
      setSaving(false)
    }
  }

  const resetToDefaults = async () => {
    if (!confirm('Are you sure you want to reset all status labels to defaults?')) {
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/user/status-preferences', {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to reset preferences')

      setStatuses(DEFAULT_STATUSES)
      setMessage({ type: 'success', text: 'Reset to default status labels!' })
      
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Failed to reset preferences:', error)
      setMessage({ type: 'error', text: 'Failed to reset preferences' })
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = (statusKey: string, field: keyof StatusPreference, value: string) => {
    setStatuses((prev) =>
      prev.map((s) => (s.status_key === statusKey ? { ...s, [field]: value } : s))
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-300 rounded w-1/3" />
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Manage Status Options</h2>
            <p className="mt-1 text-sm text-gray-600">
              Customize the labels, icons, and colors for your content status options
            </p>
          </div>
          <button
            onClick={resetToDefaults}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Success/Error Message */}
        {message && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          {statuses.map((status) => {
            const isEditing = editingId === status.status_key
            const colorClass = AVAILABLE_COLORS.find((c) => c.name === status.color)?.class || 'bg-gray-600'

            return (
              <div
                key={status.status_key}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Preview */}
                  <div className="flex-shrink-0">
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-medium text-sm ${colorClass}`}
                    >
                      <span className="text-base">{status.icon}</span>
                      <span>{status.custom_label}</span>
                    </div>
                  </div>

                  {/* Edit Form */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Label
                      </label>
                      <input
                        type="text"
                        value={status.custom_label}
                        onChange={(e) =>
                          updateStatus(status.status_key, 'custom_label', e.target.value)
                        }
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        placeholder="e.g., Want to Watch"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Icon
                        </label>
                        <select
                          value={status.icon}
                          onChange={(e) => updateStatus(status.status_key, 'icon', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        >
                          {AVAILABLE_ICONS.map((icon) => (
                            <option key={icon} value={icon}>
                              {icon}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Color
                        </label>
                        <select
                          value={status.color}
                          onChange={(e) => updateStatus(status.status_key, 'color', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        >
                          {AVAILABLE_COLORS.map((color) => (
                            <option key={color.name} value={color.name}>
                              {color.name.charAt(0).toUpperCase() + color.name.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => savePreference(status)}
                          disabled={saving || !status.custom_label.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null)
                            fetchPreferences()
                          }}
                          disabled={saving}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingId(status.status_key)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

