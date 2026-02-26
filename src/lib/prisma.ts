import { PrismaClient } from "@prisma/client"
import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import ws from 'ws'

// Required for Neon serverless driver in Node.js environments
neonConfig.webSocketConstructor = ws

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL environment variable is not set. Make sure it is defined in your .env or .env.local file."
    )
  }
  const pool = new Pool({ connectionString })
  const adapter = new PrismaNeon(pool as any)
  return new PrismaClient({ adapter })
}

export const prisma = globalThis.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma
