import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { adminMiddleware } from '../../../../lib/middleware';

export async function GET(req: NextRequest) {
  try {
    const admin = await adminMiddleware(req);
    
    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized - Admin access required',
        },
        { status: 401 }
      );
    }

    // Get current date and dates for comparison
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Execute all analytics queries in parallel
    const [
      totalUsers,
      totalDealers,
      totalServices,
      totalPackages,
      newUsersLast30Days,
      newDealersLast30Days,
      newServicesLast30Days,
      newPackagesLast30Days,
      usersLast30Days,
      dealersLast30Days,
      servicesLast30Days,
      packagesLast30Days,
      topDealersByServices,
      topDealersByPackages,
      userGrowth,
      dealerGrowth,
    ] = await Promise.all([
      // Total counts
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { role: 'DEALER' } }),
      prisma.service.count({ where: { isActive: true } }),
      prisma.package.count({ where: { isActive: true } }),

      // Last 30 days counts
      prisma.user.count({
        where: {
          role: 'USER',
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      prisma.user.count({
        where: {
          role: 'DEALER',
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      prisma.service.count({
        where: {
          isActive: true,
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      prisma.package.count({
        where: {
          isActive: true,
          createdAt: { gte: thirtyDaysAgo }
        }
      }),

      // Time series data for charts (last 30 days)
      getTimeSeriesData('USER', thirtyDaysAgo),
      getTimeSeriesData('DEALER', thirtyDaysAgo),
      getTimeSeriesData('SERVICE', thirtyDaysAgo),
      getTimeSeriesData('PACKAGE', thirtyDaysAgo),

      // Top performers
      prisma.user.findMany({
        where: { role: 'DEALER' },
        include: {
          dealerProfile: {
            select: { businessName: true }
          },
          _count: {
            select: {
              services: { where: { isActive: true } },
              packages: { where: { isActive: true } },
            }
          }
        },
        orderBy: {
          services: { _count: 'desc' }
        },
        take: 10
      }),
      prisma.user.findMany({
        where: { role: 'DEALER' },
        include: {
          dealerProfile: {
            select: { businessName: true }
          },
          _count: {
            select: {
              packages: { where: { isActive: true } },
              services: { where: { isActive: true } },
            }
          }
        },
        orderBy: {
          packages: { _count: 'desc' }
        },
        take: 10
      }),

      // Growth calculations
      calculateGrowthRate('USER', thirtyDaysAgo, sixtyDaysAgo),
      calculateGrowthRate('DEALER', thirtyDaysAgo, sixtyDaysAgo),
    ]);

    // Format analytics response
    const analytics = {
      overview: {
        totalUsers,
        totalDealers,
        totalServices,
        totalPackages,
        newUsersLast30Days,
        newDealersLast30Days,
        newServicesLast30Days,
        newPackagesLast30Days,
      },
      growth: {
        users: userGrowth,
        dealers: dealerGrowth,
      },
      charts: {
        users: usersLast30Days,
        dealers: dealersLast30Days,
        services: servicesLast30Days,
        packages: packagesLast30Days,
      },
      topPerformers: {
        byServices: topDealersByServices.map(dealer => ({
          id: dealer.id,
          businessName: dealer.dealerProfile?.businessName || 'N/A',
          email: dealer.email,
          servicesCount: dealer._count.services,
          packagesCount: dealer._count.packages,
        })),
        byPackages: topDealersByPackages.map(dealer => ({
          id: dealer.id,
          businessName: dealer.dealerProfile?.businessName || 'N/A',
          email: dealer.email,
          packagesCount: dealer._count.packages,
          servicesCount: dealer._count.services,
        })),
      },
      summary: {
        totalRevenue: totalServices * 100 + totalPackages * 500, // Mock revenue calculation
        activeDealers: totalDealers,
        platformUtilization: Math.round((totalServices + totalPackages) / (totalDealers || 1)),
      },
    };

    return NextResponse.json({
      success: true,
      message: 'Analytics retrieved successfully',
      data: analytics,
    });
  } catch (error) {
    console.error('Get admin analytics error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// Helper function to get time series data
async function getTimeSeriesData(type: 'USER' | 'DEALER' | 'SERVICE' | 'PACKAGE', startDate: Date) {
  const dates = [];
  const data = [];
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }

  for (const date of dates) {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    let count = 0;
    
    switch (type) {
      case 'USER':
        count = await prisma.user.count({
          where: {
            role: 'USER',
            createdAt: {
              gte: new Date(date),
              lt: nextDate,
            },
          },
        });
        break;
      case 'DEALER':
        count = await prisma.user.count({
          where: {
            role: 'DEALER',
            createdAt: {
              gte: new Date(date),
              lt: nextDate,
            },
          },
        });
        break;
      case 'SERVICE':
        count = await prisma.service.count({
          where: {
            isActive: true,
            createdAt: {
              gte: new Date(date),
              lt: nextDate,
            },
          },
        });
        break;
      case 'PACKAGE':
        count = await prisma.package.count({
          where: {
            isActive: true,
            createdAt: {
              gte: new Date(date),
              lt: nextDate,
            },
          },
        });
        break;
    }

    data.push({
      date,
      count,
    });
  }

  return data;
}

// Helper function to calculate growth rate
async function calculateGrowthRate(type: 'USER' | 'DEALER', currentPeriodStart: Date, previousPeriodStart: Date) {
  const [currentCount, previousCount] = await Promise.all([
    prisma.user.count({
      where: {
        role: type,
        createdAt: { gte: currentPeriodStart }
      }
    }),
    prisma.user.count({
      where: {
        role: type,
        createdAt: { 
          gte: previousPeriodStart,
          lt: currentPeriodStart
        }
      }
    })
  ]);

  if (previousCount === 0) return currentCount > 0 ? 100 : 0;
  
  return ((currentCount - previousCount) / previousCount) * 100;
}