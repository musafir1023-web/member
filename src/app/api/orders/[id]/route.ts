import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// 1 poin per Rp 1.000 belanja
const POINT_RATE = 1000

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: 'Status diperlukan' }, { status: 400 })
    }

    const validStatuses = ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 })
    }

    // Fetch the order first to check current state
    const existing = await db.order.findUnique({
      where: { id },
      include: { items: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 })
    }

    const pointsInfo = { awarded: false, points: 0, newTotal: 0 }

    // If marking as delivered and points not yet awarded, add points to customer
    if (status === 'delivered' && !existing.pointsAwarded && existing.userId) {
      const earned = Math.floor(existing.total / POINT_RATE)

      if (earned > 0) {
        const updatedUser = await db.user.update({
          where: { id: existing.userId },
          data: { points: { increment: earned } },
        })

        await db.order.update({
          where: { id },
          data: { pointsAwarded: true, pointsEarned: earned },
        })

        pointsInfo.awarded = true
        pointsInfo.points = earned
        pointsInfo.newTotal = updatedUser.points
      } else {
        // Even 0 points — mark as awarded to avoid re-checking
        await db.order.update({
          where: { id },
          data: { pointsAwarded: true, pointsEarned: 0 },
        })
      }
    }

    const order = await db.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    })

    return NextResponse.json({ ...order, pointsInfo })
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json({ error: 'Gagal mengupdate pesanan' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.orderItem.deleteMany({ where: { orderId: id } })
    await db.order.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete order error:', error)
    return NextResponse.json({ error: 'Gagal menghapus pesanan' }, { status: 500 })
  }
}