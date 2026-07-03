import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/chat/unread-count?userId=xxx&role=customer|admin
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const role = searchParams.get('role')

    if (!userId || !role) {
      return NextResponse.json({ error: 'userId and role required' }, { status: 400 })
    }

    if (role === 'admin') {
      const result = await db.conversation.aggregate({
        _sum: { unreadAdmin: true },
      })
      return NextResponse.json({ count: result._sum.unreadAdmin || 0 })
    } else {
      const conversation = await db.conversation.findUnique({
        where: { userId },
        select: { unreadUser: true },
      })
      return NextResponse.json({ count: conversation?.unreadUser || 0 })
    }
  } catch (error) {
    console.error('[Chat Unread Count]', error)
    return NextResponse.json({ count: 0 })
  }
}