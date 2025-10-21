'use client'

import { useState, useEffect } from 'react'

interface ContentStatusButtonsProps {
  contentId: string
}

type Status = 'to_watch' | 'watching' | 'watched' | null

export function ContentStatusButtons({ contentId }: ContentStatusButtonsProps) {
  const [currentStatus, setCurrentStatus] = useState<Status>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchStatus()
  }, [contentId])

  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/content/${contentId}/status`)
      if (response.ok) {
        const data = await response.json()
        setCurrentStatus(data.status?.status || null)
      }
    } catch (error) {
      console.error('Failed to fetch status:', error)
    }
  }

  const updateStatus = async (status: Status) => {
    if (loading) return

    setLoading(true)
    setMessage(null)

    try {
      if (status === null) {
        // Remove status
        const response = await fetch(`/api/content/${contentId}/status`, {
          method: 'DELETE',
        })

        if (!response.ok) throw new Error('Failed to remove status')

        setCurrentStatus(null)
        setMessage('Status removed')
      } else {
        // Update status
        const response = await fetch(`/api/content/${contentId}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })

        if (!response.ok) throw new Error('Failed to update status')

        const data = await response.json()
        setCurrentStatus(data.status.status)
        setMessage('Status updated!')
      }

      // Clear message after 2 seconds
      setTimeout(() => setMessage(null), 2000)
    } catch (error) {
      console.error('Failed to update status:', error)
      setMessage('Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  const statusButtons: { value: Status; label: string; icon: string; color: string }[] = [
    { value: 'to_watch', label: 'Want to Watch', icon: '📌', color: 'blue' },
    { value: 'watching', label: 'Watching', icon: '▶️', color: 'yellow' },
    { value: 'watched', label: 'Watched', icon: '✅', color: 'green' },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">My Status</h3>
        <div className="flex flex-wrap gap-2">
          {statusButtons.map((btn) => {
            const isActive = currentStatus === btn.value
            const colorClasses = {
              blue: isActive
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50',
              yellow: isActive
                ? 'bg-yellow-600 text-white border-yellow-600'
                : 'bg-white text-yellow-600 border-yellow-300 hover:bg-yellow-50',
              green: isActive
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-green-600 border-green-300 hover:bg-green-50',
            }

            return (
              <button
                key={btn.value}
                onClick={() => updateStatus(isActive ? null : btn.value)}
                disabled={loading}
                className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  colorClasses[btn.color as keyof typeof colorClasses]
                }`}
              >
                <span className="mr-2">{btn.icon}</span>
                {btn.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`px-4 py-2 rounded-lg text-sm ${
            message.includes('Failed')
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}
        >
          {message}
        </div>
      )}

      {/* Current Status Display */}
      {currentStatus && (
        <div className="text-sm text-gray-600">
          Current status:{' '}
          <span className="font-semibold">
            {statusButtons.find((b) => b.value === currentStatus)?.label}
          </span>
        </div>
      )}
    </div>
  )
}

