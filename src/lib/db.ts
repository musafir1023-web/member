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

// Ensure VoucherProduct + PointRedemption + AppLink tables exist on Turso (blocking — call with await)
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

        const [vpResult, prResult, alResult] = await Promise.all([
          libsql.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='VoucherProduct'"),
          libsql.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='PointRedemption'"),
          libsql.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='AppLink'"),
        ])

        if (vpResult.rows.length === 0) {
          await libsql.execute(`CREATE TABLE VoucherProduct (id TEXT NOT NULL PRIMARY KEY, voucherId TEXT NOT NULL REFERENCES Voucher(id) ON DELETE CASCADE, productId TEXT NOT NULL REFERENCES Product(id))`)
          await libsql.execute('CREATE UNIQUE INDEX VoucherProduct_voucherId_productId_key ON VoucherProduct(voucherId, productId)')
          await libsql.execute('CREATE INDEX idx_voucherproduct_voucherId ON VoucherProduct(voucherId)')
          await libsql.execute('CREATE INDEX idx_voucherproduct_productId ON VoucherProduct(productId)')
          console.log('[DB] VoucherProduct table created')
        }

        if (prResult.rows.length === 0) {
          await libsql.execute(`CREATE TABLE PointRedemption (id TEXT NOT NULL PRIMARY KEY, userId TEXT NOT NULL REFERENCES User(id), pointsUsed INTEGER NOT NULL, voucherValue INTEGER NOT NULL, voucherId TEXT NOT NULL REFERENCES Voucher(id), createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
          await libsql.execute('CREATE INDEX idx_pointredemption_userId ON PointRedemption(userId)')
          await libsql.execute('CREATE INDEX idx_pointredemption_voucherId ON PointRedemption(voucherId)')
          console.log('[DB] PointRedemption table created')
        }

        if (alResult.rows.length === 0) {
          await libsql.execute(`CREATE TABLE AppLink (
            id TEXT NOT NULL PRIMARY KEY,
            name TEXT NOT NULL,
            url TEXT NOT NULL,
            description TEXT NOT NULL DEFAULT '',
            icon TEXT NOT NULL DEFAULT 'Link',
            color TEXT NOT NULL DEFAULT '#f97316',
            active INTEGER NOT NULL DEFAULT 1,
            sortOrder INTEGER NOT NULL DEFAULT 0,
            createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
          )`)
          console.log('[DB] AppLink table created')
        }
      } catch (e) {
        console.error('[DB] Auto-migration failed:', e)
      }
    })()
  }
  await globalForPrisma._migratePromise
  _migrated = true
}