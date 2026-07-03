import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'daily' // daily, weekly, monthly
    const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0]

    const targetDate = new Date(dateStr)

    // Determine date range based on period
    let startDate: Date
    let endDate: Date
    let groupByFormat: string
    let periodLabel: string

    if (period === 'daily') {
      startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
      endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 1)
      groupByFormat = 'daily'
      periodLabel = startDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    } else if (period === 'weekly') {
      // Start from Monday of the week
      const day = targetDate.getDay()
      const diff = day === 0 ? 6 : day - 1 // Monday as start
      startDate = new Date(targetDate)
      startDate.setDate(targetDate.getDate() - diff)
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 7)
      groupByFormat = 'weekly'
      periodLabel = `${startDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} - ${new Date(endDate.getTime() - 1).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
    } else {
      // Monthly
      startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1)
      endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 1)
      groupByFormat = 'monthly'
      periodLabel = targetDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    }

    // Fetch orders in date range (only delivered for revenue)
    const orders = await db.order.findMany({
      where: {
        createdAt: { gte: startDate, lt: endDate },
      },
      include: { items: true },
      orderBy: { createdAt: 'asc' },
    })

    // Aggregate summary
    const deliveredOrders = orders.filter((o) => o.status === 'delivered')
    const allOrders = orders
    const cancelledOrders = orders.filter((o) => o.status === 'cancelled')

    const totalRevenue = deliveredOrders.reduce((s, o) => s + o.total, 0)
    const totalOrders = allOrders.length
    const completedOrders = deliveredOrders.length
    const cancelledCount = cancelledOrders.length
    const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / completedOrders) || 0 : 0

    // Group by day
    const dailyMap = new Map<string, { date: string; orders: any[]; revenue: number; count: number; completed: number }>()

    for (const order of allOrders) {
      const dayKey = order.createdAt.toISOString().split('T')[0]
      const existing = dailyMap.get(dayKey) || { date: dayKey, orders: [], revenue: 0, count: 0, completed: 0 }
      existing.orders.push(order)
      existing.count++
      if (order.status === 'delivered') {
        existing.revenue += order.total
        existing.completed++
      }
      dailyMap.set(dayKey, existing)
    }

    const dailyBreakdown = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date)).map((d) => ({
      date: d.date,
      label: new Date(d.date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }),
      totalOrders: d.count,
      completed: d.completed,
      cancelled: d.orders.filter((o) => o.status === 'cancelled').length,
      revenue: d.revenue,
    }))

    // Top products
    const productMap = new Map<string, { name: string; quantity: number; revenue: number }>()
    for (const order of deliveredOrders) {
      for (const item of order.items) {
        const existing = productMap.get(item.productName) || { name: item.productName, quantity: 0, revenue: 0 }
        existing.quantity += item.quantity
        existing.revenue += item.subtotal
        productMap.set(item.productName, existing)
      }
    }
    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Payment method breakdown
    const paymentMap = new Map<string, { method: string; count: number; revenue: number }>()
    for (const order of deliveredOrders) {
      const existing = paymentMap.get(order.paymentMethod) || { method: order.paymentMethod, count: 0, revenue: 0 }
      existing.count++
      existing.revenue += order.total
      paymentMap.set(order.paymentMethod, existing)
    }
    const paymentBreakdown = Array.from(paymentMap.values()).sort((a, b) => b.revenue - a.revenue)

    return NextResponse.json({
      period,
      periodLabel,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      summary: {
        totalOrders,
        completedOrders,
        cancelledCount,
        totalRevenue,
        avgOrder,
      },
      dailyBreakdown,
      topProducts,
      paymentBreakdown,
      orders: allOrders.map((o) => ({
        id: o.id,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        total: o.total,
        status: o.status,
        paymentMethod: o.paymentMethod,
        createdAt: o.createdAt.toISOString(),
        items: o.items.map((i) => ({
          productName: i.productName,
          quantity: i.quantity,
          price: i.price,
          subtotal: i.subtotal,
        })),
      })),
    })
  } catch (error) {
    console.error('Report error:', error)
    return NextResponse.json({ error: 'Gagal mengambil laporan' }, { status: 500 })
  }
}