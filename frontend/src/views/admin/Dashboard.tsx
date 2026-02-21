import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import { shopsService } from '../../services/shops.service';
import { productsService } from '../../services/products.service';
import { ordersService } from '../../services/orders.service';
import { Store, Package, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export const DashboardPage = () => {
  const { activeShop } = useAuth();
  const [loading, setLoading] = useState(true);
  const [shopData, setShopData] = useState<any>(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    if (activeShop) {
      loadDashboardData();
    }
  }, [activeShop]);

  const loadDashboardData = async () => {
    if (!activeShop) return;

    setLoading(true);
    try {
      // Cargar datos de la tienda
      const shop = await shopsService.getShopBySlug(activeShop.slug);
      setShopData(shop);

      // Cargar estadísticas
      const products = await productsService.getAll();
      const orders = await ordersService.getAll();

      const pendingOrders = orders.filter((o: any) => o.status === 'pending').length;
      const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        pendingOrders,
        totalRevenue
      });
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!activeShop) {
    return (
      <div>
        <PageHeader
          title="Dashboard"
          description="Resumen y métricas de tu tienda"
        />
        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <p className="text-slate-600">Selecciona una tienda para ver el dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Resumen y métricas de tu tienda"
      />

      {/* Header con Logo y Nombre de Tienda */}
      <div className="bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-xl shadow-lg p-8 text-white card-animate">
        <div className="flex items-center gap-6">
          {shopData?.imageUrl ? (
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-white rounded-2xl shadow-xl p-2 overflow-hidden">
                <img
                  src={shopData.imageUrl}
                  alt={`Logo de ${activeShop.name}`}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </div>
          ) : (
            <div className="flex-shrink-0 w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center">
              <Store className="w-12 h-12 text-white" />
            </div>
          )}

          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{activeShop.name}</h1>
            {shopData?.location && (
              <p className="text-white/90 text-lg">{shopData.location}</p>
            )}
            {shopData?.description && (
              <p className="text-white/80 mt-2">{shopData.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 animate-pulse">
              <div className="h-12 w-12 bg-slate-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-20 mb-2"></div>
              <div className="h-8 bg-slate-200 rounded w-24"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Productos */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-all card-animate hover-lift">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-sm text-slate-600 font-medium">Total Productos</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalProducts}</p>
          </div>

          {/* Total Órdenes */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-all card-animate hover-lift">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-emerald-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-sm text-slate-600 font-medium">Total Órdenes</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalOrders}</p>
          </div>

          {/* Órdenes Pendientes */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-all card-animate hover-lift">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-orange-600" />
              </div>
              {stats.pendingOrders > 0 && (
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{stats.pendingOrders}</span>
                </div>
              )}
            </div>
            <p className="text-sm text-slate-600 font-medium">Pendientes</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stats.pendingOrders}</p>
          </div>

          {/* Ingresos Totales */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-all card-animate hover-lift">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-sm text-slate-600 font-medium">Ingresos Totales</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">${stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Acciones rápidas */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 card-animate">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/productos"
            className="flex items-center gap-4 p-4 border-2 border-slate-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 group-hover:text-blue-700">Gestionar Productos</p>
              <p className="text-sm text-slate-600">Ver y editar catálogo</p>
            </div>
          </Link>

          <Link
            href="/admin/ordenes"
            className="flex items-center gap-4 p-4 border-2 border-slate-200 rounded-lg hover:border-emerald-400 hover:bg-emerald-50 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
              <ShoppingCart className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 group-hover:text-emerald-700">Ver Órdenes</p>
              <p className="text-sm text-slate-600">Gestionar pedidos</p>
            </div>
          </Link>

          <Link
            href="/admin/configuracion"
            className="flex items-center gap-4 p-4 border-2 border-slate-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Store className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 group-hover:text-purple-700">Configuración</p>
              <p className="text-sm text-slate-600">Ajustes de tienda</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
