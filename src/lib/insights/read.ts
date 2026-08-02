import { eq } from 'drizzle-orm'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import * as schema from '@/lib/db/schema'
import { userPreferences } from '@/lib/db/schema/app'

type AppDb = DrizzleD1Database<typeof schema>

export async function getUserInsightsData(db: AppDb, userId: string) {
  const [prefs] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1)

  return prefs?.insightsData ?? null
}
