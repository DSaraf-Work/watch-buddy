import { getCloudflareContext } from '@opennextjs/cloudflare'
import { betterAuth } from 'better-auth'
import { withCloudflare } from 'better-auth-cloudflare'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { getDb } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { profiles } from '@/lib/db/schema/profiles'
import { isE2eTestMode } from '@/lib/auth/constants'

async function authBuilder() {
  const db = await getDb()
  const { env, cf } = await getCloudflareContext({ async: true })

  return betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: (env.BETTER_AUTH_TRUSTED_ORIGINS ?? env.BETTER_AUTH_URL)
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
    ...(isE2eTestMode()
      ? {
          emailAndPassword: {
            enabled: true,
          },
        }
      : {}),
    ...withCloudflare(
      {
        autoDetectIpAddress: true,
        geolocationTracking: true,
        cf: cf ?? {},
        d1: { db, options: { usePlural: true } },
        kv: env.KV as any,
      },
      {
        rateLimit: {
          enabled: true,
          window: 60,
          max: 100,
        },
      }
    ),
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            await db.insert(profiles).values({
              id: user.id,
              email: user.email,
              displayName: user.name || user.email.split('@')[0],
              createdAt: new Date(),
              updatedAt: new Date(),
            })
          },
        },
      },
    },
  })
}

// Static export for CLI schema generation (no Cloudflare bindings)
export const auth = betterAuth({
  database: drizzleAdapter({} as D1Database, {
    provider: 'sqlite',
    schema,
    usePlural: true,
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    },
  },
})

let authInstance: Awaited<ReturnType<typeof authBuilder>> | null = null

export async function initAuth() {
  if (!authInstance) {
    authInstance = await authBuilder()
  }
  return authInstance
}

export type Session = Awaited<ReturnType<typeof initAuth>>['$Infer']['Session']
