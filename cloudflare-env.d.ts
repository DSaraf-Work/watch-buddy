interface CloudflareEnv {
  DATABASE: D1Database
  KV: KVNamespace
  R2: R2Bucket
  ASSETS: Fetcher
  IMAGES: ImagesBinding
  WORKER_SELF_REFERENCE: Fetcher
  BETTER_AUTH_URL: string
  BETTER_AUTH_SECRET: string
  BETTER_AUTH_TRUSTED_ORIGINS?: string
  TMDB_API_KEY?: string
  RESEND_API_KEY?: string
}
