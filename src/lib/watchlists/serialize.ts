import type { content, watchlistItems, watchlistMembers, watchlists } from '@/lib/db/schema/app'
import type { profiles } from '@/lib/db/schema/profiles'

export function serializeWatchlist(w: typeof watchlists.$inferSelect) {
  return {
    id: w.id,
    name: w.name,
    description: w.description,
    owner_id: w.ownerId,
    is_shared: w.isShared,
    created_at: new Date(w.createdAt).toISOString(),
    updated_at: new Date(w.updatedAt).toISOString(),
  }
}

export function serializeWatchlistItem(
  item: typeof watchlistItems.$inferSelect,
  contentRow: typeof content.$inferSelect | null
) {
  return {
    id: item.id,
    watchlist_id: item.watchlistId,
    content_id: item.contentId,
    added_by: item.addedBy,
    priority: item.priority,
    notes: item.notes,
    added_at: new Date(item.addedAt).toISOString(),
    content: contentRow
      ? {
          id: contentRow.id,
          tmdb_id: contentRow.tmdbId,
          title: contentRow.title,
          content_type: contentRow.contentType,
          poster_path: contentRow.posterPath,
          release_date: contentRow.releaseDate,
          genres: contentRow.genres ?? [],
        }
      : null,
  }
}

export function serializeMember(
  member: typeof watchlistMembers.$inferSelect,
  profile: typeof profiles.$inferSelect | null
) {
  return {
    id: member.id,
    watchlist_id: member.watchlistId,
    user_id: member.userId,
    role: member.role,
    joined_at: new Date(member.joinedAt).toISOString(),
    display_name: profile?.displayName ?? null,
    email: profile?.email ?? null,
  }
}
