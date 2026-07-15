import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const links = await db.appLink.findMany({
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json(links)
  } catch {
    return NextResponse.json({ error: 'Gagal memuat data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, url, description, icon, color, active } = body

    if (!name?.trim() || !url?.trim()) {
      return NextResponse.json({ error: 'Nama dan URL wajib diisi' }, { status: 400 })
    }

    // Count existing links for sort order
    const count = await db.appLink.count()

    const link = await db.appLink.create({
      data: {
        name: name.trim(),
        url: url.trim(),
        description: description?.trim() || '',
        icon: icon?.trim() || 'Link',
        color: color?.trim() || '#f97316',
        active: active !== false,
        sortOrder: count,
      },
    })

    return NextResponse.json(link, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Gagal menambahkan link' }, { status: 500 })
  }
}