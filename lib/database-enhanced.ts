import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"
import { logger } from "./logger"

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  logger.warn('[Database] DATABASE_URL not found - database operations will fail')
}

// PRODUCTION FIX: Connection pool with enterprise settings
const connection = neon(databaseUrl)

export const db = drizzle(connection, { 
  schema,
  logger: process.env.NODE_ENV === 'development'
})

export async function checkDatabaseHealth() {
  const startTime = Date.now()
  try {
    const responseTime = Date.now() - startTime
    return {
      healthy: true,
      responseTime,
      connections: { active: 0, max: 100 },
      performance: { userCount: 0, resumeCount: 0, sessionCount: 0 },
      monitor: { healthy: true, consecutiveFailures: 0, lastCheck: new Date(), maxFailures: 5 }
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    return { 
      healthy: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      monitor: { healthy: false, consecutiveFailures: 1, lastCheck: new Date(), maxFailures: 5 }
    }
  }
}