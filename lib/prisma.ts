import { PrismaClient } from '@prisma/client';
import { hash, compare } from 'bcryptjs';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export class DatabaseService {
  // User methods
  static async findUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        userProfile: true,
        dealerProfile: true,
      },
    });
  }

  static async findUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        userProfile: true,
        dealerProfile: true,
      },
    });
  }

  static async createUser(userData: {
    email: string;
    password: string;
    role: 'USER' | 'DEALER' | 'ADMIN';
    userProfile?: any;
    dealerProfile?: any;
  }) {
    return await prisma.user.create({
      data: {
        email: userData.email,
        password: userData.password,
        role: userData.role,
        ...(userData.role === 'USER' && userData.userProfile && {
          userProfile: {
            create: userData.userProfile,
          },
        }),
        ...(userData.role === 'DEALER' && userData.dealerProfile && {
          dealerProfile: {
            create: userData.dealerProfile,
          },
        }),
      },
      include: {
        userProfile: userData.role === 'USER',
        dealerProfile: userData.role === 'DEALER',
      },
    });
  }

  static async updateUserPassword(userId: string, newPassword: string) {
    const hashedPassword = await hash(newPassword, 12);
    return await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  static async verifyUserPassword(plainPassword: string, hashedPassword: string) {
    return await compare(plainPassword, hashedPassword);
  }

  // Refresh token methods
  static async createRefreshToken(tokenData: {
    userId: string;
    token: string;
    expiresAt: Date;
  }) {
    return await prisma.refreshToken.create({
      data: tokenData,
    });
  }

  static async findRefreshToken(token: string) {
    return await prisma.refreshToken.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });
  }

  static async deleteRefreshToken(token: string) {
    return await prisma.refreshToken.deleteMany({
      where: { token },
    });
  }

  static async deleteAllUserRefreshTokens(userId: string) {
    return await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  static async cleanupExpiredTokens() {
    return await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  // Profile methods
  static async updateUserProfile(userId: string, profileData: any) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        userProfile: {
          update: profileData,
        },
      },
      include: {
        userProfile: true,
      },
    });
  }

  static async updateDealerProfile(userId: string, profileData: any) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        dealerProfile: {
          update: profileData,
        },
      },
      include: {
        dealerProfile: true,
      },
    });
  }

  // Service methods
  static async findServiceById(id: string) {
    return await prisma.service.findUnique({
      where: { id },
      include: {
        dealer: {
          include: {
            dealerProfile: true,
          },
        },
        packages: {
          include: {
            package: true,
          },
        },
      },
    });
  }

  static async findDealerServices(dealerId: string) {
    return await prisma.service.findMany({
      where: { dealerId },
      include: {
        packages: {
          include: {
            package: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async findServicesByCategory(category: string) {
    return await prisma.service.findMany({
      where: { 
        category,
        isActive: true 
      },
      include: {
        dealer: {
          include: {
            dealerProfile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async createService(serviceData: {
    name: string;
    description?: string;
    category: string;
    price?: number;
    duration?: number;
    dealerId: string;
  }) {
    return await prisma.service.create({
      data: serviceData,
    });
  }

  static async updateService(id: string, serviceData: any) {
    return await prisma.service.update({
      where: { id },
      data: serviceData,
    });
  }

  static async deleteService(id: string) {
    return await prisma.service.delete({
      where: { id },
    });
  }

  static async deactivateService(id: string) {
    return await prisma.service.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Package methods
  static async findPackageById(id: string) {
    return await prisma.package.findUnique({
      where: { id },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        dealer: {
          include: {
            dealerProfile: true,
          },
        },
      },
    });
  }

  static async findDealerPackages(dealerId: string) {
    return await prisma.package.findMany({
      where: { dealerId },
      include: {
        services: {
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async findPackagesByDealer(dealerId: string) {
    return await prisma.package.findMany({
      where: { 
        dealerId,
        isActive: true 
      },
      include: {
        services: {
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async createPackage(packageData: {
    name: string;
    description?: string;
    price: number;
    duration?: number;
    dealerId: string;
    serviceIds: string[];
  }) {
    const { serviceIds, ...packageInfo } = packageData;

    return await prisma.package.create({
      data: {
        ...packageInfo,
        services: {
          create: serviceIds.map(serviceId => ({
            serviceId: serviceId,
          })),
        },
      },
      include: {
        services: {
          include: {
            service: true,
          },
        },
      },
    });
  }

  static async updatePackage(id: string, packageData: any) {
    return await prisma.package.update({
      where: { id },
      data: packageData,
      include: {
        services: {
          include: {
            service: true,
          },
        },
      },
    });
  }

  static async updatePackageServices(packageId: string, serviceIds: string[]) {
    // First remove existing services
    await prisma.packageService.deleteMany({
      where: { packageId },
    });

    // Then add new services
    if (serviceIds.length > 0) {
      await prisma.packageService.createMany({
        data: serviceIds.map(serviceId => ({
          packageId,
          serviceId,
        })),
      });
    }

    return await this.findPackageById(packageId);
  }

  static async deactivatePackage(id: string) {
    return await prisma.package.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Admin methods
  static async getAdminStats() {
    const [
      totalUsers,
      totalDealers,
      totalServices,
      totalPackages,
      activeDealers,
      totalAdmins,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { role: 'DEALER' } }),
      prisma.service.count({ where: { isActive: true } }),
      prisma.package.count({ where: { isActive: true } }),
      prisma.user.count({
        where: {
          role: 'DEALER',
          services: { some: { isActive: true } }
        }
      }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
    ]);

    return {
      totalUsers,
      totalDealers,
      totalServices,
      totalPackages,
      activeDealers,
      totalAdmins,
      platformUtilization: Math.round((totalServices + totalPackages) / (totalDealers || 1)),
    };
  }

  static async getRecentActivity(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [newUsers, newDealers, newServices, newPackages] = await Promise.all([
      prisma.user.count({
        where: {
          role: 'USER',
          createdAt: { gte: startDate }
        }
      }),
      prisma.user.count({
        where: {
          role: 'DEALER',
          createdAt: { gte: startDate }
        }
      }),
      prisma.service.count({
        where: {
          isActive: true,
          createdAt: { gte: startDate }
        }
      }),
      prisma.package.count({
        where: {
          isActive: true,
          createdAt: { gte: startDate }
        }
      }),
    ]);

    return {
      newUsers,
      newDealers,
      newServices,
      newPackages,
    };
  }

  static async getUserGrowthData(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = [];
    for (let i = days; i >= 0; i--) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const [users, dealers] = await Promise.all([
        prisma.user.count({
          where: {
            role: 'USER',
            createdAt: {
              gte: date,
              lt: nextDate,
            },
          },
        }),
        prisma.user.count({
          where: {
            role: 'DEALER',
            createdAt: {
              gte: date,
              lt: nextDate,
            },
          },
        }),
      ]);

      data.push({
        date: date.toISOString().split('T')[0],
        users,
        dealers,
      });
    }

    return data;
  }

  static async getTopPerformers(limit: number = 10) {
    const topDealersByServices = await prisma.user.findMany({
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
      take: limit
    });

    const topDealersByPackages = await prisma.user.findMany({
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
      take: limit
    });

    return {
      byServices: topDealersByServices,
      byPackages: topDealersByPackages,
    };
  }

  static async getUsersWithPagination(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where: any = { role: 'USER' };
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { userProfile: { fullName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          userProfile: true,
          _count: {
            select: {
              refreshTokens: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  static async getDealersWithPagination(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where: any = { role: 'DEALER' };
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { dealerProfile: { businessName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [dealers, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          dealerProfile: true,
          _count: {
            select: {
              services: { where: { isActive: true } },
              packages: { where: { isActive: true } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      dealers,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  // Utility methods
  static async getServiceCategories() {
    const categories = await prisma.service.findMany({
      where: { isActive: true },
      distinct: ['category'],
      select: { category: true },
    });

    return categories.map(c => c.category);
  }

  static async getPopularServices(limit: number = 5) {
    // This is a simplified version - in a real app you might track service views or bookings
    return await prisma.service.findMany({
      where: { isActive: true },
      include: {
        dealer: {
          include: {
            dealerProfile: {
              select: {
                businessName: true,
                city: true,
                state: true,
              },
            },
          },
        },
        _count: {
          select: {
            packages: true,
          },
        },
      },
      orderBy: {
        packages: { _count: 'desc' },
      },
      take: limit,
    });
  }

  static async searchServices(query: string, category?: string) {
    const where: any = {
      isActive: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (category) {
      where.category = category;
    }

    return await prisma.service.findMany({
      where,
      include: {
        dealer: {
          include: {
            dealerProfile: {
              select: {
                businessName: true,
                city: true,
                state: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

// Transaction helper
export const withTransaction = async <T>(
  operation: (prisma: any) => Promise<T>
): Promise<T> => {
  return await prisma.$transaction(operation);
};

// Health check
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

// Database maintenance utilities
export const DatabaseMaintenance = {
  async cleanupExpiredData() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [expiredTokens, oldInactiveServices, oldInactivePackages] = await Promise.all([
      prisma.refreshToken.deleteMany({
        where: {
          expiresAt: { lt: new Date() }
        }
      }),
      prisma.service.deleteMany({
        where: {
          isActive: false,
          updatedAt: { lt: thirtyDaysAgo }
        }
      }),
      prisma.package.deleteMany({
        where: {
          isActive: false,
          updatedAt: { lt: thirtyDaysAgo }
        }
      })
    ]);

    return {
      expiredTokens: expiredTokens.count,
      oldInactiveServices: oldInactiveServices.count,
      oldInactivePackages: oldInactivePackages.count,
    };
  },

  async getDatabaseSize() {
    try {
      // This is PostgreSQL specific - adjust for your database
      const result = await prisma.$queryRaw<{ size: string }[]>`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
      `;
      return result[0]?.size || 'Unknown';
    } catch (error) {
      console.error('Error getting database size:', error);
      return 'Unknown';
    }
  },

  async getTableStats() {
    const tables = ['User', 'Service', 'Package', 'RefreshToken', 'UserProfile', 'DealerProfile'];
    const stats: any = {};

    for (const table of tables) {
      try {
        const count = await (prisma as any)[table.toLowerCase()].count();
        stats[table] = count;
      } catch (error) {
        stats[table] = 'Error';
      }
    }

    return stats;
  }
};

// Export prisma instance for direct use when needed
export { prisma as db };