import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tag = searchParams.get('tag')

    const where: Record<string, unknown> = { available: true }
    if (tag && tag !== 'semua') {
      where.tag = tag
    }

    const products = await db.product.findMany({
      where,
      orderBy: { createdAt: tag === 'terbaru' ? 'desc' : 'asc' },
    })
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal mengambil produk' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const product = await db.product.create({
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        originalPrice: body.originalPrice || null,
        image: body.image,
        category: body.category,
        tag: body.tag || null,
      },
    })
    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal menambah produk' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const product = await db.product.update({
      where: { id: body.id },
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        originalPrice: body.originalPrice !== undefined ? (body.originalPrice || null) : undefined,
        image: body.image,
        category: body.category,
        tag: body.tag !== undefined ? (body.tag || null) : undefined,
        available: body.available,
      },
    })
    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal mengupdate produk' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 })
    }
    // Hapus OrderItem terkait terlebih dahulu (foreign key constraint)
    await db.orderItem.deleteMany({ where: { productId: id } })
    await db.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Delete product error:', error)
    const msg = error instanceof Error ? error.message : 'Gagal menghapus produk'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}