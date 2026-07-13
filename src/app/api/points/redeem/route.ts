import { db, ensureMigrated } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// Conversion rate: 1 point = Rp100
const POINT_VALUE = 100

function generateVoucherCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'PT'
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function POST(request: NextRequest) {
  try {
    await ensureMigrated()

    const { userId, points, password } = await request.json()

    if (!userId || !points || !password) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    const pointsNum = Number(points)
    if (!Number.isInteger(pointsNum) || pointsNum < 1) {
      return NextResponse.json(
        { error: 'Jumlah poin harus bilangan bulat positif' },
        { status: 400 }
      )
    }

    if (pointsNum < 10) {
      return NextResponse.json(
        { error: 'Minimal penukaran 10 poin' },
        { status: 400 }
      )
    }

    // Fetch user with password
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, password: true, points: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      )
    }

    // Verify password
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Password salah' },
        { status: 401 }
      )
    }

    // Check enough points
    if (user.points < pointsNum) {
      return NextResponse.json(
        { error: `Poin tidak cukup. Sisa poin Anda: ${user.points}` },
        { status: 400 }
      )
    }

    const voucherValue = pointsNum * POINT_VALUE

    // Generate unique voucher code
    let code = generateVoucherCode()
    let exists = await db.voucher.findUnique({ where: { code } })
    let attempts = 0
    while (exists && attempts < 10) {
      code = generateVoucherCode()
      exists = await db.voucher.findUnique({ where: { code } })
      attempts++
    }

    // Create voucher and deduct points in a transaction
    const voucher = await db.$transaction(async (tx) => {
      // Deduct points
      await tx.user.update({
        where: { id: userId },
        data: { points: { decrement: pointsNum } },
      })

      // Create voucher (valid for 30 days, fixed amount)
      const v = await tx.voucher.create({
        data: {
          code,
          type: 'fixed',
          value: voucherValue,
          minOrder: 0,
          userId,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      })

      // Record redemption
      await tx.pointRedemption.create({
        data: {
          userId,
          pointsUsed: pointsNum,
          voucherValue,
          voucherId: v.id,
        },
      })

      return v
    })

    // Fetch updated user points
    const updatedUser = await db.user.findUnique({
      where: { id: userId },
      select: { points: true },
    })

    return NextResponse.json({
      success: true,
      message: `${pointsNum} poin berhasil ditukar`,
      voucher: {
        code: voucher.code,
        type: voucher.type,
        value: voucher.value,
        expiresAt: voucher.expiresAt,
      },
      pointsRemaining: updatedUser?.points ?? 0,
      pointValue: POINT_VALUE,
    })
  } catch (error) {
    console.error('Redeem points error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}