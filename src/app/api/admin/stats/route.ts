import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function GET(request: NextRequest) {
  try {
    const role = request.headers.get('x-user-role');

    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Run all queries in parallel
    const [
      totalUsers,
      activeSubscribers,
      monthlyRevenueResult,
      totalDocuments,
      totalStorageResult,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Active subscribers
      prisma.subscription.count({
        where: { status: 'ACTIVE' },
      }),

      // Monthly revenue (current month captured payments)
      prisma.payment.aggregate({
        where: {
          status: 'CAPTURED',
          paidAt: {
            gte: new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              1
            ),
          },
        },
        _sum: { amount: true },
      }),

      // Total documents
      prisma.document.count(),

      // Total storage (sum of document sizes)
      prisma.document.aggregate({
        _sum: { size: true },
      }),
    ]);

    return NextResponse.json({
      totalUsers,
      activeSubscribers,
      monthlyRevenue: monthlyRevenueResult._sum.amount ?? 0,
      totalDocuments,
      totalStorageBytes: Number(totalStorageResult._sum.size ?? 0),
    });
  } catch (error) {
    console.error('[GET /api/admin/stats] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
