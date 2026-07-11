import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// Generate a random voucher code (uppercase alphanumeric, 8 chars)
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// Ensure code is unique in DB
async function uniqueCode(): Promise<string> {
  let code = generateCode()
  while (await db.voucher.findUnique({ where: { code } })) {
    code = generateCode()
  }
  return code
}

// ─── POST: Admin creates voucher(s) ───
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, value, minOrder, maxDiscount, userId: targetUserId, expiresAt } = body

    if (!type || !value) {
      return NextResponse.json({ error: 'Tipe dan nilai voucher wajib diisi' }, { status: 400 })
    }
    if (!['percentage', 'fixed'].includes(type)) {
      return NextResponse.json({ error: 'Tipe voucher harus percentage atau fixed' }, { status: 400 })
    }
    if (type === 'percentage' && (value < 1 || value > 100)) {
      return NextResponse.json({ error: 'Persentase diskon harus 1-100' }, { status: 400 })
    }
    if (type === 'fixed' && value < 1) {
      return NextResponse.json({ error: 'Nilai diskon tetap harus lebih dari 0' }, { status: 400 })
    }

    const code = await uniqueCode()

    const voucher = await db.voucher.create({
      data: {
        code,
        type,
        value: Number(value),
        minOrder: minOrder ? Number(minOrder) : null,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        userId: targetUserId || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    })

    return NextResponse.json(voucher)
  } catch (error) {
    console.error('Create voucher error:', error)
    return NextResponse.json({ error: 'Gagal membuat voucher' }, { status: 500 })
  }
}

// ─── GET: Admin lists all vouchers / Customer gets their vouchers ───
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')

    // Validate voucher code
    if (action === 'validate') {
      const code = searchParams.get('code')
      const orderTotal = Number(searchParams.get('total') || 0)
      const customerId = searchParams.get('customerId')

      if (!code) {
        return NextResponse.json({ error: 'Kode voucher wajib diisi' }, { status: 400 })
      }

      const voucher = await db.voucher.findUnique({ where: { code: code.toUpperCase() } })
      if (!voucher) {
        return NextResponse.json({ error: 'Kode voucher tidak valid' }, { status: 404 })
      }
      if (voucher.used) {
        return NextResponse.json({ error: 'Voucher sudah digunakan' }, { status: 400 })
      }
      if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date()) {
        return NextResponse.json({ error: 'Voucher sudah expired' }, { status: 400 })
      }
      if (voucher.userId && voucher.userId !== customerId) {
        return NextResponse.json({ error: 'Voucher tidak berlaku untuk akun Anda' }, { status: 400 })
      }
      if (voucher.minOrder && orderTotal < voucher.minOrder) {
        return NextResponse.json({ error: `Minimal pesanan ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(voucher.minOrder)}` }, { status: 400 })
      }

      // Calculate discount
      let discount = 0
      if (voucher.type === 'percentage') {
        discount = Math.floor(orderTotal * voucher.value / 100)
        if (voucher.maxDiscount && discount > voucher.maxDiscount) {
          discount = voucher.maxDiscount
        }
      } else {
        discount = voucher.value
        if (discount > orderTotal) discount = orderTotal
      }

      return NextResponse.json({
        valid: true,
        voucher: {
          id: voucher.id,
          code: voucher.code,
          type: voucher.type,
          value: voucher.value,
          discount,
          finalTotal: orderTotal - discount,
          maxDiscount: voucher.maxDiscount,
          minOrder: voucher.minOrder,
          expiresAt: voucher.expiresAt,
        },
      })
    }

    // List vouchers
    const where: Record<string, unknown> = {}
    if (userId) where.userId = userId

    const vouchers = await db.voucher.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(vouchers)
  } catch (error) {
    console.error('Get vouchers error:', error)
    return NextResponse.json({ error: 'Gagal mengambil voucher' }, { status: 500 })
  }
}

// ─── DELETE: Admin deletes a voucher ───
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID voucher diperlukan' }, { status: 400 })
    }

    await db.voucher.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete voucher error:', error)
    return NextResponse.json({ error: 'Gagal menghapus voucher' }, { status: 500 })
  }
}