'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import { shopsService } from '../../services/shops.service';
import { productsService } from '../../services/products.service';
import type { Product } from '../../services/products.service';
import { ordersService } from '../../services/orders.service';
import type { Order } from '../../services/orders.service';
import { categoriesService } from '../../services/categories.service';
import type { Category } from '../../services/categories.service';
import { Store, Package, ShoppingCart, DollarSign, TrendingUp, AlertTriangle, BarChart3, Calendar, Search, X } from 'lucide-react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts';

const CHART_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export const DashboardPage = () => {
  const { activeShop } = useAuth();
  const [loading, setLoading] = useState(true);
  const [shopData, setShopData] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0
  });

  // Chart date range state (default: 2 días antes y 2 días después de hoy)
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 2); return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 2); return d.toISOString().split('T')[0];
  });

  // Multi-product filter for chart
  const [selectedChartProducts, setSelectedChartProducts] = useState<string[]>([]);
  const [chartProductSearch, setChartProductSearch] = useState('');
  const [showChartProductDropdown, setShowChartProductDropdown] = useState(false);
  const chartProductRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeShop) { loadDashboardData(); }
  }, [activeShop]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (chartProductRef.current && !chartProductRef.current.contains(e.target as Node)) setShowChartProductDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadDashboardData = async () => {
    if (!activeShop) return;
    setLoading(true);
    try {
      const shop = await shopsService.getShopBySlug(activeShop.slug);
      setShopData(shop);

      const [prods, ords, cats] = await Promise.all([
        productsService.getAll(),
        ordersService.getAll(),
        categoriesService.getAll()
      ]);

      setProducts(prods);
      setOrders(ords);
      setCategories(cats);

      const pendingOrders = ords.filter((o: Order) => o.status === 'Pendiente').length;
      const totalRevenue = ords
        .filter((o: Order) => o.status === 'Confirmado' || o.status === 'Enviado')
        .reduce((sum: number, o: Order) => sum + (o.total || 0), 0);

      setStats({ totalProducts: prods.length, totalOrders: ords.length, pendingOrders, totalRevenue });
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Date validation helpers
  const handleDateFromChange = (value: string) => {
    setDateFrom(value);
    if (dateTo && value > dateTo) setDateTo(value);
  };
  const handleDateToChange = (value: string) => {
    setDateTo(value);
    if (dateFrom && value < dateFrom) setDateFrom(value);
  };

  // ── Analytics data ──────────────────────────────────────────────
  const topProducts = useMemo(() => {
    const salesMap: Record<string, { name: string; sold: number; revenue: number }> = {};
    orders.forEach(order => {
      if (order.status === 'Cancelado') return;
      order.products.forEach(p => {
        if (!salesMap[p.productId]) salesMap[p.productId] = { name: p.name, sold: 0, revenue: 0 };
        salesMap[p.productId].sold += p.quantity;
        salesMap[p.productId].revenue += p.price * p.quantity;
      });
    });
    return Object.values(salesMap).sort((a, b) => b.sold - a.sold).slice(0, 5);
  }, [orders]);

  const topCategories = useMemo(() => {
    // Build a map of productId -> categories from products data
    const productCatMap: Record<string, string[]> = {};
    products.forEach(p => { if (p.categories) productCatMap[p._id] = p.categories; });

    const catSalesMap: Record<string, { name: string; sold: number }> = {};
    orders.forEach(order => {
      if (order.status === 'Cancelado') return;
      order.products.forEach(p => {
        const cats = productCatMap[p.productId];
        if (cats) {
          cats.forEach(catId => {
            const cat = categories.find(c => c._id === catId);
            if (cat) {
              if (!catSalesMap[catId]) catSalesMap[catId] = { name: cat.name, sold: 0 };
              catSalesMap[catId].sold += p.quantity;
            }
          });
        }
      });
    });
    return Object.values(catSalesMap).sort((a, b) => b.sold - a.sold).slice(0, 5);
  }, [orders, products, categories]);

  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.stock < 5).sort((a, b) => a.stock - b.stock);
  }, [products]);

  // Chart product dropdown filter
  const chartProductOptions = useMemo(() => {
    if (!chartProductSearch.trim()) return products.filter(p => !selectedChartProducts.includes(p._id)).slice(0, 8);
    const q = chartProductSearch.toLowerCase();
    return products.filter(p => !selectedChartProducts.includes(p._id) && p.name.toLowerCase().includes(q)).slice(0, 8);
  }, [products, chartProductSearch, selectedChartProducts]);

  // Simple orders per day chart data (no product filter)
  const ordersChartData = useMemo(() => {
    const from = new Date(dateFrom); from.setHours(0, 0, 0, 0);
    const to = new Date(dateTo); to.setHours(23, 59, 59, 999);
    const days: string[] = [];
    const current = new Date(from);
    while (current <= to) {
      days.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    const dayMap: Record<string, number> = {};
    days.forEach(d => dayMap[d] = 0);
    orders.forEach(order => {
      const d = new Date(order.createdAt);
      if (d < from || d > to) return;
      const key = d.toISOString().split('T')[0];
      if (dayMap[key] !== undefined) dayMap[key]++;
    });
    return days.map(date => ({
      date: new Date(date + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
      fullDate: date,
      órdenes: dayMap[date] || 0,
    }));
  }, [orders, dateFrom, dateTo]);

  // Products sold per day chart data (with multi-product filter)
  const productsSoldChartData = useMemo(() => {
    const from = new Date(dateFrom); from.setHours(0, 0, 0, 0);
    const to = new Date(dateTo); to.setHours(23, 59, 59, 999);
    const days: string[] = [];
    const current = new Date(from);
    while (current <= to) {
      days.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    if (selectedChartProducts.length === 0) {
      // No filter: show total products sold per day
      const dayMap: Record<string, number> = {};
      days.forEach(d => dayMap[d] = 0);

      orders.forEach(order => {
        if (order.status === 'Cancelado') return;
        const d = new Date(order.createdAt);
        if (d < from || d > to) return;
        const key = d.toISOString().split('T')[0];
        if (dayMap[key] !== undefined) {
          order.products.forEach(op => { dayMap[key] += op.quantity; });
        }
      });

      return days.map(date => ({
        date: new Date(date + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
        fullDate: date,
        'Total vendidos': dayMap[date] || 0,
      }));
    } else {
      // Per-product lines
      const result = days.map(date => {
        const entry: Record<string, any> = {
          date: new Date(date + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
          fullDate: date,
        };
        selectedChartProducts.forEach(pId => {
          const prod = products.find(p => p._id === pId);
          if (prod) entry[prod.name] = 0;
        });
        return entry;
      });

      orders.forEach(order => {
        if (order.status === 'Cancelado') return;
        const d = new Date(order.createdAt);
        if (d < from || d > to) return;
        const key = d.toISOString().split('T')[0];
        const dayIndex = days.indexOf(key);
        if (dayIndex === -1) return;

        order.products.forEach(op => {
          if (selectedChartProducts.includes(op.productId)) {
            const prod = products.find(p => p._id === op.productId);
            if (prod) result[dayIndex][prod.name] += op.quantity;
          }
        });
      });

      return result;
    }
  }, [orders, products, dateFrom, dateTo, selectedChartProducts]);

  const productsSoldLineKeys = useMemo(() => {
    if (selectedChartProducts.length === 0) return ['Total vendidos'];
    return selectedChartProducts.map(pId => {
      const prod = products.find(p => p._id === pId);
      return prod?.name || '';
    }).filter(Boolean);
  }, [selectedChartProducts, products]);

  if (!activeShop) {
    return (
      <div>
        <PageHeader title="Dashboard" description="Resumen y métricas de tu tienda" />
        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <p className="text-slate-600">Selecciona una tienda para ver el dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Resumen y métricas de tu tienda" />

      {/* Header con Logo y Nombre de Tienda */}
      <div className="bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-xl shadow-lg p-8 text-white card-animate">
        <div className="flex items-center gap-6">
          {shopData?.imageUrl ? (
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-white rounded-2xl shadow-xl p-2 overflow-hidden">
                <img src={shopData.imageUrl} alt={`Logo de ${activeShop.name}`} className="w-full h-full object-cover rounded-xl" />
              </div>
            </div>
          ) : (
            <div className="flex-shrink-0 w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center">
              <Store className="w-12 h-12 text-white" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{activeShop.name}</h1>
            {shopData?.location && <p className="text-white/90 text-lg">{shopData.location}</p>}
            {shopData?.description && <p className="text-white/80 mt-2">{shopData.description}</p>}
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
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-all card-animate hover-lift">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><Package className="w-6 h-6 text-blue-600" /></div>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-sm text-slate-600 font-medium">Total Productos</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalProducts}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-all card-animate hover-lift">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center"><ShoppingCart className="w-6 h-6 text-emerald-600" /></div>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-sm text-slate-600 font-medium">Total Órdenes</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalOrders}</p>
          </div>

          {/* Pendientes — solo el número abajo */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-all card-animate hover-lift">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center"><ShoppingCart className="w-6 h-6 text-orange-600" /></div>
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-sm text-slate-600 font-medium">Pendientes</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stats.pendingOrders}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-all card-animate hover-lift">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center"><DollarSign className="w-6 h-6 text-purple-600" /></div>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-sm text-slate-600 font-medium">Ingresos Totales</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">${stats.totalRevenue.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
            <p className="text-[11px] text-slate-400 mt-1">Solo confirmadas y enviadas</p>
          </div>
        </div>
      )}

      {/* Acciones rápidas — ANTES de las gráficas */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 card-animate">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/productos" className="flex items-center gap-4 p-4 border-2 border-slate-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors"><Package className="w-6 h-6 text-blue-600" /></div>
            <div><p className="font-semibold text-slate-900 group-hover:text-blue-700">Gestionar Productos</p><p className="text-sm text-slate-600">Ver y editar catálogo</p></div>
          </Link>
          <Link href="/admin/ordenes" className="flex items-center gap-4 p-4 border-2 border-slate-200 rounded-lg hover:border-emerald-400 hover:bg-emerald-50 transition-all cursor-pointer group">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors"><ShoppingCart className="w-6 h-6 text-emerald-600" /></div>
            <div><p className="font-semibold text-slate-900 group-hover:text-emerald-700">Ver Órdenes</p><p className="text-sm text-slate-600">Gestionar pedidos</p></div>
          </Link>
          <Link href="/admin/configuracion" className="flex items-center gap-4 p-4 border-2 border-slate-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all cursor-pointer group">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors"><Store className="w-6 h-6 text-purple-600" /></div>
            <div><p className="font-semibold text-slate-900 group-hover:text-purple-700">Configuración</p><p className="text-sm text-slate-600">Ajustes de tienda</p></div>
          </Link>
        </div>
      </div>

      {/* ── Analytics ────────────────────────────────────────────── */}
      {!loading && (
        <>
          {/* Row 1: Top Products + Top Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-5">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">Top 5 Productos Más Vendidos</h3>
              </div>
              {topProducts.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">Sin datos de ventas todavía</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={topProducts} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11, fill: '#334155' }} />
                    <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px' }} formatter={(value: any) => [`${value} unidades`, 'Vendidos']} />
                    <Bar dataKey="sold" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-5">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">Top 5 Categorías</h3>
              </div>
              {topCategories.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">Sin datos de categorías todavía</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={topCategories} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11, fill: '#334155' }} />
                    <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px' }} formatter={(value: any) => [`${value} unidades`, 'Vendidos']} />
                    <Bar dataKey="sold" fill="#10b981" radius={[0, 6, 6, 0]} barSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Row 2: Products Low Stock */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold text-slate-900">Productos con Bajo Stock</h3>
              <span className="ml-auto text-xs font-medium text-slate-400">{lowStockProducts.length} producto{lowStockProducts.length !== 1 ? 's' : ''}</span>
            </div>
            {lowStockProducts.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">Todos los productos tienen stock suficiente 🎉</p>
            ) : (
              <div className="max-h-64 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                {lowStockProducts.map(p => (
                  <div key={p._id} className="flex items-center justify-between p-3 rounded-lg bg-amber-50/50 border border-amber-100 hover:bg-amber-50 transition-colors">
                    <div className="flex items-center gap-3">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-9 h-9 rounded-lg object-cover border border-slate-100" />
                      ) : (
                        <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center"><Package className="w-4 h-4 text-slate-300" /></div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-800">{p.name}</p>
                        <p className="text-[11px] text-slate-400">${p.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${p.stock <= 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {p.stock <= 0 ? 'Sin stock' : `${p.stock} restante${p.stock !== 1 ? 's' : ''}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Row 3: Orders over time chart (simple, no product filter) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold text-slate-900">Órdenes por Día</h3>
              </div>
              <div className="flex items-center gap-2">
                <input type="date" value={dateFrom} max={dateTo} onChange={(e) => handleDateFromChange(e.target.value)}
                  className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                <span className="text-slate-400 text-sm">—</span>
                <input type="date" value={dateTo} min={dateFrom} onChange={(e) => handleDateToChange(e.target.value)}
                  className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
              </div>
            </div>
            {ordersChartData.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">No hay órdenes en el rango seleccionado</p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={ordersChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} interval={Math.max(0, Math.floor(ordersChartData.length / 15))} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px' }} labelFormatter={(label) => `Fecha: ${label}`} />
                  <Legend />
                  <Line type="monotone" dataKey="órdenes" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3, fill: '#8b5cf6' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Row 4: Products sold per day chart (multi-product filter) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col gap-4 mb-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-slate-900">Productos Vendidos por Día</h3>
                </div>
                <div className="flex items-center gap-2">
                  <input type="date" value={dateFrom} max={dateTo} onChange={(e) => handleDateFromChange(e.target.value)}
                    className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                  <span className="text-slate-400 text-sm">—</span>
                  <input type="date" value={dateTo} min={dateFrom} onChange={(e) => handleDateToChange(e.target.value)}
                    className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
              </div>

              {/* Multi-product picker */}
              <div className="flex flex-wrap items-center gap-2">
                {selectedChartProducts.map((pId, idx) => {
                  const prod = products.find(p => p._id === pId);
                  if (!prod) return null;
                  return (
                    <span key={pId} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border" style={{
                      backgroundColor: `${CHART_COLORS[idx % CHART_COLORS.length]}15`,
                      borderColor: `${CHART_COLORS[idx % CHART_COLORS.length]}40`,
                      color: CHART_COLORS[idx % CHART_COLORS.length]
                    }}>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                      {prod.name}
                      <button type="button" onClick={() => setSelectedChartProducts(prev => prev.filter(id => id !== pId))}
                        className="hover:opacity-70 cursor-pointer"><X className="w-3 h-3" /></button>
                    </span>
                  );
                })}
                <div ref={chartProductRef} className="relative">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={chartProductSearch}
                      onChange={(e) => { setChartProductSearch(e.target.value); setShowChartProductDropdown(true); }}
                      onFocus={() => setShowChartProductDropdown(true)}
                      placeholder={selectedChartProducts.length >= 5 ? 'Máx. 5 productos' : 'Buscar producto...'}
                      disabled={selectedChartProducts.length >= 5}
                      className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-52 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  {showChartProductDropdown && chartProductOptions.length > 0 && selectedChartProducts.length < 5 && (
                    <div className="absolute z-20 top-full mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                      {chartProductOptions.map(p => (
                        <button key={p._id} type="button"
                          onClick={() => {
                            setSelectedChartProducts(prev => [...prev, p._id]);
                            setChartProductSearch('');
                            setShowChartProductDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer truncate">
                          {p.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedChartProducts.length > 0 && (
                  <button onClick={() => setSelectedChartProducts([])}
                    className="text-xs text-slate-400 hover:text-slate-600 underline cursor-pointer">Limpiar</button>
                )}
              </div>
            </div>

            {productsSoldChartData.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">No hay datos en el rango seleccionado</p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={productsSoldChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} interval={Math.max(0, Math.floor(productsSoldChartData.length / 15))} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px' }} labelFormatter={(label) => `Fecha: ${label}`} />
                  <Legend />
                  {productsSoldLineKeys.map((key, idx) => (
                    <Line key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[idx % CHART_COLORS.length]} strokeWidth={2.5}
                      dot={{ r: 3, fill: CHART_COLORS[idx % CHART_COLORS.length] }} activeDot={{ r: 6 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
};
