import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, items, customerName, customerPhone, customerAddress, notes, paymentMethod } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Pesanan tidak boleh kosong' }, { status: 400 })
    }

    if (!customerName || !customerPhone || !customerAddress) {
      return NextResponse.json(
        { error: 'Nama, nomor telepon, dan alamat harus diisi' },
        { status: 400 }
      )
    }

    const total = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0)

    const order = await db.order.create({
      data: {
        userId: userId || null,
        total,
        status: 'pending',
        paymentMethod: paymentMethod || 'COD',
        customerName,
        customerPhone,
        customerAddress,
        notes: notes || null,
        items: {
          create: items.map((item: { productId: string; productName: string; quantity: number; price: number; subtotal: number }) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal || item.price * item.quantity,
          })),
        },
      },
      include: { items: true },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Gagal membuat pesanan' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (userId) where.userId = userId
    if (status) where.status = status

    const orders = await db.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json({ error: 'Gagal mengambil pesanan' }, { status: 500 })
  }
}