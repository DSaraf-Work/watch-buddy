'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useStatusPreferences } from '@/hooks/useStatusPreferences'

interface ContentStatusDropdownProps {
  contentId: string
}

type Status = 'to_watch' | 'watching' | 'watched' | null

const COLOR_CLASSES: Record<string, string> = {
  blue: 'bg-blue-600 hover:bg-blue-700',
  green: 'bg-green-600 hover:bg-green-700',
  yellow: 'bg-yellow-600 hover:bg-yellow-700',
  red: 'bg-red-600 hover:bg-red-700',
  purple: 'bg-purple-600 hover:bg-purple-700',
  pink: 'bg-pink-600 hover:bg-pink-700',
  indigo: 'bg-indigo-600 hover:bg-indigo-700',
  orange: 'bg-orange-600 hover:bg-orange-700',
}

export function ContentStatusDropdown({ contentId }: ContentStatusDropdownProps) {
  const { preferences, loading: prefsLoading } = useStatusPreferences()
  const [currentStatus, setCurrentStatus] = useState<Status>(null)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [contentId])

  // Update dropdown position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
      })
    }
  }, [isOpen])

  // Close dropdown on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

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
    setIsOpen(false)

    try {
      if (status === null) {
        // Remove status
        const response = await fetch(`/api/content/${contentId}/status`, {
          method: 'DELETE',
        })

        if (!response.ok) throw new Error('Failed to remove status')

        setCurrentStatus(null)
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
      }

      // Show success animation
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 1500)
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentConfig = currentStatus ? preferences[currentStatus] : null
  const colorClass = currentConfig ? COLOR_CLASSES[currentConfig.color] || COLOR_CLASSES.blue : 'bg-gray-600 hover:bg-gray-700'

  if (prefsLoading) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-300 animate-pulse">
        <div className="w-16 h-4 bg-gray-400 rounded" />
      </div>
    )
  }

  return (
    <>
      {/* Status Pill Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm text-white
          transition-all duration-200 shadow-md hover:shadow-lg
          disabled:opacity-50 disabled:cursor-not-allowed
          ${colorClass}
          ${showSuccess ? 'scale-110' : 'scale-100'}
        `}
      >
        <span className="text-base">{currentConfig?.icon || '➕'}</span>
        <span>{currentConfig?.custom_label || 'Add to List'}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Portal for dropdown - renders at document.body level */}
      {mounted && isOpen && createPortal(
        <>
          {/* Invisible backdrop */}
          <div
            className="fixed inset-0 z-[999998]"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div
            ref={dropdownRef}
            className="fixed w-56 bg-white rounded-lg shadow-2xl border border-gray-200 py-2 z-[999999] animate-in fade-in slide-in-from-top-2 duration-200"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
            }}
          >
          {/* Status Options */}
          {Object.entries(preferences).map(([value, config]) => {
            const isActive = currentStatus === value
            return (
              <button
                key={value}
                onClick={() => updateStatus(value as Status)}
                className={`
                  w-full px-4 py-2.5 text-left flex items-center gap-3
                  transition-colors hover:bg-gray-50
                  ${isActive ? 'bg-gray-100' : ''}
                `}
              >
                <span className="text-lg">{config.icon}</span>
                <span className="flex-1 font-medium text-gray-900">{config.custom_label}</span>
                {isActive && (
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            )
          })}

            {/* Remove Status Option */}
            {currentStatus && (
              <>
                <div className="border-t border-gray-200 my-2" />
                <button
                  onClick={() => updateStatus(null)}
                  className="w-full px-4 py-2.5 text-left flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <span className="font-medium">Remove from List</span>
                </button>
              </>
            )}
          </div>
        </>,
        document.body
      )}
    </>
  )
}

