const prisma = require('../../config/database');

async function getStats(req, res) {
  try {
    const totalCategories = await prisma.category.count();
    const totalSubCategories = await prisma.subCategory.count();
    const totalProducts = await prisma.product.count();
    const activeProducts = await prisma.product.count({ where: { status: 'active' } });
    
    const totalOrders = await prisma.order.count();
    const pendingOrders = await prisma.order.count({ where: { status: 'pending' } });
    
    const revenueAgg = await prisma.order.aggregate({
      _sum: {
        total: true
      },
      where: {
        status: {
          not: 'cancelled'
        }
      }
    });
    const revenue = revenueAgg._sum.total ? Number(revenueAgg._sum.total) : 0;

    const recentProductsRaw = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { category: true }
    });
    
    const recentProducts = recentProductsRaw.map(p => ({
      id: p.id,
      name: p.name,
      categoryName: p.category?.name || 'Uncategorized',
      price: Number(p.price || 0)
    }));

    const recentOrdersRaw = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    const recentOrders = recentOrdersRaw.map(o => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      total: Number(o.total || 0),
      status: o.status
    }));

    res.json({
      success: true,
      stats: {
        totalCategories,
        totalSubCategories,
        totalProducts,
        totalOrders,
        activeProducts,
        pendingOrders,
        revenue,
        recentProducts,
        recentOrders
      }
    });

  } catch (error) {
    console.error('getStats error:', error);
    res.status(500).json({ success: false, message: 'Failed to get dashboard stats' });
  }
}

module.exports = {
  getStats
};
