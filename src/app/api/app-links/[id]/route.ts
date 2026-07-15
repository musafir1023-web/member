import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, url, description, icon, color, active, sortOrder } = body

    const existing = await db.appLink.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Link tidak ditemukan' }, { status: 404 })
    }

    const updated = await db.appLink.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name: String(name).trim() } : {}),
        ...(url !== undefined ? { url: String(url).trim() } : {}),
        ...(description !== undefined ? { description: String(description).trim() } : {}),
        ...(icon !== undefined ? { icon: String(icon).trim() } : {}),
        ...(color !== undefined ? { color: String(color).trim() } : {}),
        ...(active !== undefined ? { active: Boolean(active) } : {}),
        ...(sortOrder !== undefined ? { sortOrder: Number(sortOrder) } : {}),
      },
    })

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Gagal mengupdate link' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const existing = await db.appLink.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Link tidak ditemukan' }, { status: 404 })
    }

    await db.appLink.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Gagal menghapus link' }, { status: 500 })
  }
}