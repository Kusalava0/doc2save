import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function GET(request: NextRequest) {
  try {
    const role = request.headers.get('x-user-role');

    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()), 10);

    if (isNaN(year) || year < 2020 || year > 2100) {
      return NextResponse.json({ error: 'Invalid year' }, { status: 400 });
    }

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    // Get all captured payments for the year
    const payments = await prisma.payment.findMany({
      where: {
        status: 'CAPTURED',
        paidAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        amount: true,
        paidAt: true,
      },
      orderBy: { paidAt: 'asc' },
    });

    // Group by month
    const monthlyMap = new Map<number, { total: number; transactionCount: number }>();

    // Initialize all 12 months
    for (let i = 0; i < 12; i++) {
      monthlyMap.set(i, { total: 0, transactionCount: 0 });
    }

    // Aggregate payments into months
    for (const payment of payments) {
      if (payment.paidAt) {
        const month = payment.paidAt.getMonth();
        const entry = monthlyMap.get(month)!;
        entry.total += payment.amount;
        entry.transactionCount += 1;
      }
    }

    const MONTH_NAMES = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const revenue = Array.from(monthlyMap.entries()).map(
      ([monthIndex, data]) => ({
        month: MONTH_NAMES[monthIndex],
        total: data.total,
        transactionCount: data.transactionCount,
      })
    );

    return NextResponse.json({ year, revenue });
  } catch (error) {
    console.error('[GET /api/admin/revenue] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    );
  }
}
