import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID diperlukan' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, points: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    }

    // Calculate points breakdown from completed orders
    const completedOrders = await db.order.findMany({
      where: { userId, status: 'delivered' },
      select: { id: true, total: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })

    const totalEarned = completedOrders.reduce((s, o) => s + Math.floor(o.total / 1000), 0)

    return NextResponse.json({
      points: user.points,
      totalEarned,
      totalOrders: completedOrders.length,
    })
  } catch (error) {
    console.error('Get points error:', error)
    return NextResponse.json({ error: 'Gagal mengambil poin' }, { status: 500 })
  }
}