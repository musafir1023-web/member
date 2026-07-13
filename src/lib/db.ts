import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  _migratePromise: Promise<void> | undefined
}

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL || ''

  if (databaseUrl.startsWith('libsql://')) {
    const adapter = new PrismaLibSQL({ url: databaseUrl })
    return new PrismaClient({ adapter, log: [] })
  }

  return new PrismaClient({ log: [] })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Ensure VoucherProduct table exists on Turso (blocking — call with await)
let _migrated = false
export async function ensureMigrated() {
  if (_migrated) return
  const databaseUrl = process.env.DATABASE_URL || ''
  if (!databaseUrl.startsWith('libsql://')) {
    _migrated = true
    return
  }
  // Deduplicate concurrent calls
  if (!globalForPrisma._migratePromise) {
    globalForPrisma._migratePromise = (async () => {
      try {
        const { createClient } = await import('@libsql/client')
        const libsql = createClient({ url: databaseUrl })
        const result = await libsql.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='VoucherProduct'")
        if (result.rows.length === 0) {
          await libsql.execute(`CREATE TABLE VoucherProduct (id TEXT NOT NULL PRIMARY KEY, voucherId TEXT NOT NULL REFERENCES Voucher(id) ON DELETE CASCADE, productId TEXT NOT NULL REFERENCES Product(id))`)
          await libsql.execute('CREATE UNIQUE INDEX VoucherProduct_voucherId_productId_key ON VoucherProduct(voucherId, productId)')
          await libsql.execute('CREATE INDEX idx_voucherproduct_voucherId ON VoucherProduct(voucherId)')
          await libsql.execute('CREATE INDEX idx_voucherproduct_productId ON VoucherProduct(productId)')
          console.log('[DB] VoucherProduct table created')
        }
      } catch (e) {
        console.error('[DB] Auto-migration failed:', e)
      }
    })()
  }
  await globalForPrisma._migratePromise
  _migrated = true
}