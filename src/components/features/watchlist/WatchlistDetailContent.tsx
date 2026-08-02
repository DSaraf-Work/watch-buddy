'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ROUTES } from '@/constants/routes'
import { fetchJson } from '@/lib/utils/fetch-json'

interface WatchlistDetail {
  watchlist: {
    id: string
    name: string
    description: string | null
    is_shared: boolean
    owner_id: string
  }
  role: 'owner' | 'member'
  items: Array<{
    id: string
    content_id: string
    notes: string | null
    content: {
      id: string
      tmdb_id: number
      title: string
      content_type: 'movie' | 'series'
      poster_path: string | null
    } | null
  }>
  members: Array<{
    user_id: string
    role: string
    display_name: string | null
    email: string | null
  }>
}

export function WatchlistDetailContent({ watchlistId }: { watchlistId: string }) {
  const [data, setData] = useState<WatchlistDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [memberEmail, setMemberEmail] = useState('')
  const [inviting, setInviting] = useState(false)

  const load = useCallback(async () => {
    try {
      const response = await fetchJson<WatchlistDetail>(`/api/watchlists/${watchlistId}`)
      setData(response)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load watchlist')
    } finally {
      setLoading(false)
    }
  }, [watchlistId])

  useEffect(() => {
    load()
  }, [load])

  const removeItem = async (itemId: string) => {
    await fetchJson(`/api/watchlists/${watchlistId}/items/${itemId}`, { method: 'DELETE' })
    await load()
  }

  const inviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!memberEmail.trim()) return
    setInviting(true)
    try {
      await fetchJson(`/api/watchlists/${watchlistId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: memberEmail.trim() }),
      })
      setMemberEmail('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite member')
    } finally {
      setInviting(false)
    }
  }

  const removeMember = async (userId: string) => {
    await fetchJson(`/api/watchlists/${watchlistId}/members/${userId}`, { method: 'DELETE' })
    await load()
  }

  if (loading) return <p className="text-gray-600">Loading watchlist...</p>
  if (error || !data) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
        {error ?? 'Watchlist not found'}
      </div>
    )
  }

  const canManage = data.role === 'owner'

  return (
    <div className="space-y-8">
      <div>
        <Link href={ROUTES.WATCHLIST.INDEX} className="text-sm text-blue-700 hover:underline">
          ← Back to watchlists
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">{data.watchlist.name}</h1>
        {data.watchlist.description && (
          <p className="mt-2 text-gray-600">{data.watchlist.description}</p>
        )}
        {data.watchlist.is_shared && (
          <span className="mt-3 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
            Shared watchlist
          </span>
        )}
      </div>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Items ({data.items.length})</h2>
        {data.items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-600">
            No items yet. Add titles from search or a content page.
          </div>
        ) : (
          <div className="space-y-3">
            {data.items.map((item) => {
              const content = item.content
              const contentPath = content
                ? ROUTES.CONTENT(`${content.tmdb_id}-${content.content_type}`)
                : null
              return (
                <article
                  key={item.id}
                  className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="relative h-20 w-14 flex-shrink-0 overflow-hidden rounded bg-gray-200">
                    {content?.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w185${content.poster_path}`}
                        alt={content.title}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    {contentPath ? (
                      <Link href={contentPath} className="font-semibold text-gray-900 hover:text-blue-700">
                        {content?.title}
                      </Link>
                    ) : (
                      <p className="font-semibold text-gray-900">Unknown title</p>
                    )}
                  </div>
                  {canManage && (
                    <Button variant="outline" size="sm" onClick={() => removeItem(item.id)}>
                      Remove
                    </Button>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>

      {data.watchlist.is_shared && (
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Members</h2>
          <ul className="mb-4 space-y-2">
            {data.members.map((member) => (
              <li key={member.user_id} className="flex items-center justify-between text-sm">
                <span>
                  {member.display_name || member.email} ({member.role})
                </span>
                {canManage && member.role !== 'owner' && (
                  <Button variant="outline" size="sm" onClick={() => removeMember(member.user_id)}>
                    Remove
                  </Button>
                )}
              </li>
            ))}
          </ul>
          {canManage && (
            <form onSubmit={inviteMember} className="flex flex-wrap gap-2">
              <Input
                label="Invite by email"
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="friend@example.com"
                className="max-w-sm"
              />
              <div className="flex items-end">
                <Button type="submit" isLoading={inviting}>
                  Invite
                </Button>
              </div>
            </form>
          )}
        </section>
      )}
    </div>
  )
}
