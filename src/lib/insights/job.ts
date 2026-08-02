import { kvGetJson, kvPutJson } from '@/lib/cache/kv'

const JOB_TTL = 60 * 60 // 1 hour

export type InsightsComputeStatus = 'idle' | 'pending' | 'running' | 'completed' | 'failed'

export interface InsightsComputeJob {
  status: InsightsComputeStatus
  started_at?: string
  completed_at?: string
  error?: string
}

function jobKey(userId: string) {
  return `insights:compute:${userId}`
}

export async function getInsightsComputeJob(userId: string): Promise<InsightsComputeJob> {
  const job = await kvGetJson<InsightsComputeJob>(jobKey(userId))
  return job ?? { status: 'idle' }
}

export async function setInsightsComputeJob(userId: string, job: InsightsComputeJob) {
  await kvPutJson(jobKey(userId), job, JOB_TTL)
}
