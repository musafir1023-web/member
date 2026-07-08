import { createClient } from '@libsql/client'

const srcClient = createClient({ url: 'file:db/custom.db' })
const dstClient = createClient({
  url: 'libsql://ayamgeprek-musafir1023-web.aws-us-west-2.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN,
})

async function migrate() {
  console.log('Starting migration to Turso...\n')

  // Users
  const users = await srcClient.execute('SELECT * FROM User')
  console.log(`Migrating ${users.rows.length} users...`)
  for (const r of users.rows) {
    await dstClient.execute({
      sql: `INSERT OR REPLACE INTO "User" (id, name, email, password, phone, role, points, voucher, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [r.id, r.name, r.email, r.password, r.phone, r.role ?? 'customer', r.points ?? 0, r.voucher ?? 0, r.createdAt, r.updatedAt]
    })
  }

  // Products
  const products = await srcClient.execute('SELECT * FROM Product')
  console.log(`Migrating ${products.rows.length} products...`)
  for (const r of products.rows) {
    await dstClient.execute({
      sql: `INSERT OR REPLACE INTO "Product" (id, name, description, price, originalPrice, image, category, tag, available, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [r.id, r.name, r.description, r.price, r.originalPrice, r.image, r.category ?? 'Makanan', r.tag, r.available ?? 1, r.createdAt, r.updatedAt]
    })
  }

  // Orders
  const orders = await srcClient.execute('SELECT * FROM "Order"')
  console.log(`Migrating ${orders.rows.length} orders...`)
  for (const r of orders.rows) {
    await dstClient.execute({
      sql: `INSERT OR REPLACE INTO "Order" (id, userId, total, status, paymentMethod, customerName, customerPhone, customerAddress, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [r.id, r.userId, r.total, r.status ?? 'pending', r.paymentMethod ?? 'COD', r.customerName, r.customerPhone, r.customerAddress, r.notes, r.createdAt, r.updatedAt]
    })
  }

  // OrderItems
  const items = await srcClient.execute('SELECT * FROM OrderItem')
  console.log(`Migrating ${items.rows.length} order items...`)
  for (const r of items.rows) {
    await dstClient.execute({
      sql: `INSERT OR REPLACE INTO OrderItem (id, orderId, productId, productName, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [r.id, r.orderId, r.productId, r.productName, r.quantity, r.price, r.subtotal]
    })
  }

  // Conversations
  const convos = await srcClient.execute('SELECT * FROM Conversation')
  console.log(`Migrating ${convos.rows.length} conversations...`)
  for (const r of convos.rows) {
    await dstClient.execute({
      sql: `INSERT OR REPLACE INTO Conversation (id, userId, userName, userPhone, lastMessage, lastMessageAt, unreadAdmin, unreadUser, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [r.id, r.userId, r.userName, r.userPhone, r.lastMessage, r.lastMessageAt, r.unreadAdmin ?? 0, r.unreadUser ?? 0, r.createdAt, r.updatedAt]
    })
  }

  // Messages
  const msgs = await srcClient.execute('SELECT * FROM Message')
  console.log(`Migrating ${msgs.rows.length} messages...`)
  for (const r of msgs.rows) {
    await dstClient.execute({
      sql: `INSERT OR REPLACE INTO Message (id, conversationId, senderId, senderRole, content, type, readByAdmin, readByUser, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [r.id, r.conversationId, r.senderId, r.senderRole, r.content, r.type ?? 'text', r.readByAdmin ?? 0, r.readByUser ?? 1, r.createdAt]
    })
  }

  console.log('\n✅ Migration complete!')

  // Verify
  const result = await dstClient.execute('SELECT COUNT(*) as c FROM Product')
  console.log(`Verified: ${result.rows[0].c} products in Turso`)

  await srcClient.close()
  await dstClient.close()
}

migrate().catch(e => { console.error('Failed:', e); process.exit(1) })