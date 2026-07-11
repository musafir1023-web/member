import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const admin = searchParams.get('admin')

    // Admin: list all customers
    if (admin === 'true') {
      const users = await db.user.findMany({
        where: { role: 'customer' },
        select: { id: true, name: true, email: true, phone: true, points: true },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json(users)
    }

    if (!userId) {
      return NextResponse.json({ error: 'ID user diperlukan' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, phone: true, points: true, voucher: true, createdAt: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ error: 'Gagal mengambil profil' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, phone, password } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID user diperlukan' }, { status: 400 })
    }

    const data: Record<string, string> = {}
    if (name) data.name = name
    if (phone !== undefined) data.phone = phone
    if (password) data.password = password

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Tidak ada data yang diubah' }, { status: 400 })
    }

    const user = await db.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, phone: true, points: true, voucher: true, createdAt: true },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Gagal mengupdate profil' }, { status: 500 })
  }
}