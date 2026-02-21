import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { ordersService } from '../../services/orders.service';
import type { Order } from '../../services/orders.service';
import {
  Eye, ShoppingBag, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X, AlertTriangle, User, MapPin, Mail, Hash
} from 'lucide-react';

const ROWS_PER_PAGE = 8;

const STATUS_STYLES: Record<string, string> = {
  Pendiente: 'bg-amber-100 text-amber-800',
  Pagado: 'bg-emerald-100 text-emerald-800',
  Enviado: 'bg-blue-100 text-blue-800',
  Cancelado: 'bg-red-100 text-red-800',
};

const STATUSES = ['Pendiente', 'Pagado', 'Enviado', 'Cancelado'];

export const OrdenesPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [orderBy, setOrderBy] = useState<keyof Order>('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [showBuyerModal, setShowBuyerModal] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => { loadOrders(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter]);

  const loadOrders = async () => {
    setLoading(true); setError('');
    try { setOrders(await ordersService.getAll()); }
    catch { setError('Error al cargar las órdenes'); }
    finally { setLoading(false); }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try { await ordersService.updateStatus(orderId, newStatus); loadOrders(); }
    catch { setError('Error al actualizar el estado'); }
  };

  const handleSort = (property: keyof Order) => {
    setOrder(orderBy === property && order === 'asc' ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const SortIcon = ({ field }: { field: keyof Order }) => {
    if (orderBy !== field) return <ChevronUp className="w-3.5 h-3.5 text-slate-300" />;
    return order === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-purple-600" /> : <ChevronDown className="w-3.5 h-3.5 text-purple-600" />;
  };

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || o._id.toLowerCase().includes(q) || o.buyer.name.toLowerCase().includes(q) || o.buyer.email.toLowerCase().includes(q);
      const matchesStatus = !statusFilter || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aVal = a[orderBy]; const bVal = b[orderBy];
      if (typeof aVal === 'string' && typeof bVal === 'string')
        return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      if (typeof aVal === 'number' && typeof bVal === 'number')
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      return 0;
    });
  }, [filtered, orderBy, order]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / ROWS_PER_PAGE));
  const paginated = sorted.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6">
      <PageHeader title="Órdenes" description="Administra los pedidos de tus clientes" />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Buscar por ID, nombre o email..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer">
            <option value="">Todos los estados</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />{error}
          <button onClick={() => setError('')} className="ml-auto hover:bg-red-100 rounded p-1 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Comprador</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Productos</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:text-slate-700" onClick={() => handleSort('total')}>
                  <span className="inline-flex items-center gap-1 justify-end">Total <SortIcon field="total" /></span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:text-slate-700" onClick={() => handleSort('createdAt')}>
                  <span className="inline-flex items-center gap-1">Creado <SortIcon field="createdAt" /></span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:text-slate-700" onClick={() => handleSort('updatedAt')}>
                  <span className="inline-flex items-center gap-1">Actualizado <SortIcon field="updatedAt" /></span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-16">
                  <div className="inline-flex items-center gap-3 text-slate-500">
                    <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />Cargando...
                  </div>
                </td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16">
                  <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">No hay órdenes</p>
                </td></tr>
              ) : paginated.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3"><span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{item._id.slice(-8)}</span></td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setSelectedOrder(item); setShowBuyerModal(true); }}
                      className="inline-flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-800 hover:underline cursor-pointer">
                      <Eye className="w-3.5 h-3.5" />{item.buyer.name}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setSelectedOrder(item); setShowProductsModal(true); }}
                      className="inline-flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-800 hover:underline cursor-pointer">
                      <Eye className="w-3.5 h-3.5" />{item.products.length} producto{item.products.length !== 1 ? 's' : ''}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right"><span className="font-semibold text-emerald-600">${item.total.toFixed(2)}</span></td>
                  <td className="px-4 py-3">
                    {item.status === 'Cancelado' ? (
                      <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${STATUS_STYLES['Cancelado']}`}>Cancelado</span>
                    ) : (
                      <select value={item.status} onChange={(e) => handleStatusChange(item._id, e.target.value)}
                        className={`text-xs font-semibold rounded-full px-2.5 py-1 border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${STATUS_STYLES[item.status] || 'bg-slate-100 text-slate-700'}`}>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">{formatDate(item.createdAt)}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{formatDate(item.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && sorted.length > ROWS_PER_PAGE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
            <span className="text-xs text-slate-500">{(currentPage - 1) * ROWS_PER_PAGE + 1}&ndash;{Math.min(currentPage * ROWS_PER_PAGE, sorted.length)} de {sorted.length}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-md text-xs font-medium transition-all cursor-pointer ${page === currentPage ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>{page}</button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Comprador */}
      {showBuyerModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowBuyerModal(false); setSelectedOrder(null); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><User className="w-5 h-5 text-purple-600" /></div>
                <div><h2 className="text-lg font-bold text-slate-900">Comprador</h2><p className="text-xs text-slate-500">Datos del cliente</p></div>
                <button onClick={() => { setShowBuyerModal(false); setSelectedOrder(null); }} className="ml-auto p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"><X className="w-5 h-5 text-slate-400" /></button>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-slate-400 mt-0.5" />
                <div><p className="text-xs font-medium text-slate-500">Nombre</p><p className="text-sm text-slate-900">{selectedOrder.buyer.name}</p></div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                <div><p className="text-xs font-medium text-slate-500">Email</p><p className="text-sm text-slate-900">{selectedOrder.buyer.email}</p></div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                <div><p className="text-xs font-medium text-slate-500">Dirección</p><p className="text-sm text-slate-900">{selectedOrder.buyer.address}</p></div>
              </div>
              <div className="flex items-start gap-3">
                <Hash className="w-4 h-4 text-slate-400 mt-0.5" />
                <div><p className="text-xs font-medium text-slate-500">Código Postal</p><p className="text-sm text-slate-900">{selectedOrder.buyer.postalCode}</p></div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
              <button onClick={() => { setShowBuyerModal(false); setSelectedOrder(null); }} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Productos */}
      {showProductsModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowProductsModal(false); setSelectedOrder(null); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><ShoppingBag className="w-5 h-5 text-emerald-600" /></div>
                <div><h2 className="text-lg font-bold text-slate-900">Productos</h2><p className="text-xs text-slate-500">{selectedOrder.products.length} producto{selectedOrder.products.length !== 1 ? 's' : ''} en la orden</p></div>
                <button onClick={() => { setShowProductsModal(false); setSelectedOrder(null); }} className="ml-auto p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"><X className="w-5 h-5 text-slate-400" /></button>
              </div>
            </div>
            <div className="px-6 py-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left pb-2 text-xs font-semibold text-slate-500 uppercase">Producto</th>
                    <th className="text-right pb-2 text-xs font-semibold text-slate-500 uppercase">Precio</th>
                    <th className="text-right pb-2 text-xs font-semibold text-slate-500 uppercase">Cant.</th>
                    <th className="text-right pb-2 text-xs font-semibold text-slate-500 uppercase">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedOrder.products.map((product, index) => (
                    <tr key={index}>
                      <td className="py-2.5 text-sm text-slate-800">{product.name}</td>
                      <td className="py-2.5 text-sm text-slate-500 text-right">${product.price.toFixed(2)}</td>
                      <td className="py-2.5 text-sm text-slate-500 text-right">{product.quantity}</td>
                      <td className="py-2.5 text-sm font-medium text-slate-800 text-right">${(product.price * product.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-200">
                    <td colSpan={3} className="pt-3 text-right text-sm font-bold text-slate-900">Total:</td>
                    <td className="pt-3 text-right text-sm font-bold text-emerald-600">${selectedOrder.total.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
              <button onClick={() => { setShowProductsModal(false); setSelectedOrder(null); }} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
