import { sql } from 'drizzle-orm'
import { sqliteTable, text, integer, real, index, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { users } from './auth'

export const content = sqliteTable(
  'content',
  {
    id: text('id').primaryKey(),
    tmdbId: integer('tmdb_id').notNull(),
    imdbId: text('imdb_id'),
    title: text('title').notNull(),
    originalTitle: text('original_title'),
    contentType: text('content_type', { enum: ['movie', 'series'] }).notNull(),
    overview: text('overview'),
    posterPath: text('poster_path'),
    backdropPath: text('backdrop_path'),
    releaseDate: text('release_date'),
    runtime: integer('runtime'),
    genres: text('genres', { mode: 'json' }).$type<Array<{ id: number; name: string }>>(),
    castData: text('cast_data', { mode: 'json' }).$type<unknown[]>(),
    crewData: text('crew_data', { mode: 'json' }).$type<unknown[]>(),
    ratings: text('ratings', { mode: 'json' }).$type<{ tmdb: number; imdb?: number }>(),
    trailerUrl: text('trailer_url'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex('content_tmdb_type_unique').on(table.tmdbId, table.contentType),
    index('idx_content_title').on(table.title),
    index('idx_content_type').on(table.contentType),
  ]
)

export const ottPlatforms = sqliteTable('ott_platforms', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  logoUrl: text('logo_url'),
  websiteUrl: text('website_url'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
})

export const contentAvailability = sqliteTable(
  'content_availability',
  {
    id: text('id').primaryKey(),
    contentId: text('content_id')
      .notNull()
      .references(() => content.id, { onDelete: 'cascade' }),
    platformId: text('platform_id')
      .notNull()
      .references(() => ottPlatforms.id, { onDelete: 'cascade' }),
    availableFrom: text('available_from'),
    availableUntil: text('available_until'),
    contentUrl: text('content_url'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    uniqueIndex('content_platform_unique').on(table.contentId, table.platformId),
    index('idx_content_availability_content').on(table.contentId),
    index('idx_content_availability_platform').on(table.platformId),
  ]
)

export const userContentStatus = sqliteTable(
  'user_content_status',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    contentId: text('content_id')
      .notNull()
      .references(() => content.id, { onDelete: 'cascade' }),
    status: text('status', { enum: ['to_watch', 'watching', 'watched'] }).notNull(),
    rating: integer('rating'),
    notes: text('notes'),
    startedAt: integer('started_at', { mode: 'timestamp_ms' }),
    completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex('user_content_status_unique').on(table.userId, table.contentId),
    index('idx_user_content_status_user').on(table.userId),
    index('idx_user_content_status_content').on(table.contentId),
    index('idx_user_content_status_status').on(table.status),
  ]
)

export const userStatusPreferences = sqliteTable(
  'user_status_preferences',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    statusKey: text('status_key', { enum: ['to_watch', 'watching', 'watched'] }).notNull(),
    customLabel: text('custom_label').notNull(),
    icon: text('icon').notNull(),
    color: text('color').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex('user_status_pref_unique').on(table.userId, table.statusKey),
    index('idx_user_status_preferences_user').on(table.userId),
  ]
)

export const watchlists = sqliteTable(
  'watchlists',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    ownerId: text('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    isShared: integer('is_shared', { mode: 'boolean' }).default(false).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('idx_watchlists_owner').on(table.ownerId)]
)

export const watchlistMembers = sqliteTable(
  'watchlist_members',
  {
    id: text('id').primaryKey(),
    watchlistId: text('watchlist_id')
      .notNull()
      .references(() => watchlists.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role', { enum: ['owner', 'member'] }).notNull(),
    joinedAt: integer('joined_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    uniqueIndex('watchlist_member_unique').on(table.watchlistId, table.userId),
    index('idx_watchlist_members_user').on(table.userId),
  ]
)

export const watchlistItems = sqliteTable(
  'watchlist_items',
  {
    id: text('id').primaryKey(),
    watchlistId: text('watchlist_id')
      .notNull()
      .references(() => watchlists.id, { onDelete: 'cascade' }),
    contentId: text('content_id')
      .notNull()
      .references(() => content.id, { onDelete: 'cascade' }),
    addedBy: text('added_by').references(() => users.id, { onDelete: 'set null' }),
    priority: text('priority', { enum: ['high', 'medium', 'low'] }),
    notes: text('notes'),
    addedAt: integer('added_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    uniqueIndex('watchlist_item_unique').on(table.watchlistId, table.contentId),
    index('idx_watchlist_items_watchlist').on(table.watchlistId),
    index('idx_watchlist_items_content').on(table.contentId),
  ]
)

export const watchHistory = sqliteTable(
  'watch_history',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    contentId: text('content_id')
      .notNull()
      .references(() => content.id, { onDelete: 'cascade' }),
    platformId: text('platform_id').references(() => ottPlatforms.id, { onDelete: 'set null' }),
    watchedAt: integer('watched_at', { mode: 'timestamp_ms' }).notNull(),
    rating: integer('rating'),
    review: text('review'),
    isRewatch: integer('is_rewatch', { mode: 'boolean' }).default(false).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('idx_watch_history_user').on(table.userId),
    index('idx_watch_history_content').on(table.contentId),
    index('idx_watch_history_watched_at').on(table.watchedAt),
  ]
)

export const watchSessions = sqliteTable(
  'watch_sessions',
  {
    id: text('id').primaryKey(),
    historyId: text('history_id')
      .notNull()
      .references(() => watchHistory.id, { onDelete: 'cascade' }),
    seasonNumber: integer('season_number'),
    episodeNumber: integer('episode_number'),
    watchedAt: integer('watched_at', { mode: 'timestamp_ms' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [index('idx_watch_sessions_history').on(table.historyId)]
)

export type InsightsData = {
  monthly_activity: Array<{ month: string; count: number }>
  genre_breakdown: Array<{ genre: string; count: number }>
  platform_breakdown: Array<{ platform_id: string; platform_name: string; count: number }>
  content_type_breakdown: { movies: number; series: number }
}

export const userPreferences = sqliteTable('user_preferences', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  favoriteGenres: text('favorite_genres', { mode: 'json' }).$type<string[]>(),
  favoritePlatforms: text('favorite_platforms', { mode: 'json' }).$type<string[]>(),
  avgRating: real('avg_rating'),
  totalWatched: integer('total_watched').default(0).notNull(),
  totalWatchTime: integer('total_watch_time').default(0).notNull(),
  insightsData: text('insights_data', { mode: 'json' }).$type<InsightsData>(),
  computedAt: integer('computed_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
})

export const recommendations = sqliteTable(
  'recommendations',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    contentId: text('content_id')
      .notNull()
      .references(() => content.id, { onDelete: 'cascade' }),
    score: integer('score').notNull(),
    reason: text('reason'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    uniqueIndex('recommendations_user_content_unique').on(table.userId, table.contentId),
    index('idx_recommendations_user').on(table.userId),
    index('idx_recommendations_score').on(table.score),
  ]
)
