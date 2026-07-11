import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, items, customerName, customerPhone, customerAddress, notes, paymentMethod, voucherCode } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Pesanan tidak boleh kosong' }, { status: 400 })
    }

    if (!customerName || !customerPhone || !customerAddress) {
      return NextResponse.json(
        { error: 'Nama, nomor telepon, dan alamat harus diisi' },
        { status: 400 }
      )
    }

    const subtotal = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0)

    let discount = 0
    let voucherId: string | null = null
    let appliedVoucherCode: string | null = null

    // ─── Validate and apply voucher ───
    if (voucherCode) {
      const voucher = await db.voucher.findUnique({ where: { code: voucherCode.toUpperCase() } })
      if (!voucher) {
        return NextResponse.json({ error: 'Kode voucher tidak valid' }, { status: 400 })
      }
      if (voucher.used) {
        return NextResponse.json({ error: 'Voucher sudah digunakan' }, { status: 400 })
      }
      if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date()) {
        return NextResponse.json({ error: 'Voucher sudah expired' }, { status: 400 })
      }
      if (voucher.userId && voucher.userId !== (userId || null)) {
        return NextResponse.json({ error: 'Voucher tidak berlaku untuk akun Anda' }, { status: 400 })
      }
      if (voucher.minOrder && subtotal < voucher.minOrder) {
        return NextResponse.json({ error: `Minimal pesanan Rp ${voucher.minOrder.toLocaleString('id-ID')} untuk menggunakan voucher ini` }, { status: 400 })
      }

      if (voucher.type === 'percentage') {
        discount = Math.floor(subtotal * voucher.value / 100)
        if (voucher.maxDiscount && discount > voucher.maxDiscount) {
          discount = voucher.maxDiscount
        }
      } else {
        discount = voucher.value
        if (discount > subtotal) discount = subtotal
      }

      voucherId = voucher.id
      appliedVoucherCode = voucher.code
    }

    const total = subtotal - discount

    const order = await db.order.create({
      data: {
        userId: userId || null,
        total,
        discount,
        voucherCode: appliedVoucherCode,
        voucherId,
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

    // Mark voucher as used
    if (voucherId) {
      await db.voucher.update({
        where: { id: voucherId },
        data: { used: true, usedAt: new Date(), usedOrderId: order.id },
      })
    }

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