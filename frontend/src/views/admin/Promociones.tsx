import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { productsService } from '../../services/products.service';
import type { Product, ProductPromotion } from '../../services/products.service';
import {
  Trash2, Edit, Plus, Percent, DollarSign, Tag, Search, Package, X, AlertTriangle, ChevronLeft, ChevronRight
} from 'lucide-react';

type PromoType = 'porcentaje' | 'fijo' | 'nxm';
interface PromoFormData { tipo: PromoType; valor: string; valor_secundario: string; activa: boolean; }
const defaultForm: PromoFormData = { tipo: 'porcentaje', valor: '', valor_secundario: '', activa: true };
const ROWS_PER_PAGE = 8;

function getPromoLabel(promo: ProductPromotion): string {
  switch (promo.tipo) {
    case 'porcentaje': return `${promo.valor}% OFF`;
    case 'fijo': return `$${promo.valor} OFF`;
    case 'nxm': return `${promo.valor}x${promo.valor_secundario}`;
    default: return promo.tipo;
  }
}

function getPromoColor(tipo: PromoType) {
  switch (tipo) {
    case 'porcentaje': return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' };
    case 'fijo': return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' };
    case 'nxm': return { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' };
  }
}

function calculateFinalPrice(price: number, promo: ProductPromotion, quantity: number): number {
  if (!promo || !promo.activa) return price * quantity;
  switch (promo.tipo) {
    case 'porcentaje': return price * quantity * (1 - promo.valor / 100);
    case 'fijo': return Math.max(0, price - promo.valor) * quantity;
    case 'nxm': {
      if (!promo.valor_secundario) return price * quantity;
      const groups = Math.floor(quantity / promo.valor);
      const remainder = quantity % promo.valor;
      return (groups * promo.valor_secundario + remainder) * price;
    }
    default: return price * quantity;
  }
}

export const PromocionesPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [tab, setTab] = useState<'con-promo' | 'sin-promo'>('con-promo');

  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<PromoFormData>(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadProducts(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchQuery, tab]);

  const loadProducts = async () => {
    setLoading(true); setError('');
    try { setProducts(await productsService.getAll()); }
    catch { setError('Error al cargar los productos'); }
    finally { setLoading(false); }
  };

  const productsWithPromo = useMemo(() => products.filter(p => p.promotion && p.promotion.activa), [products]);
  const productsWithoutPromo = useMemo(() => products.filter(p => !p.promotion || !p.promotion.activa), [products]);

  const filteredProducts = useMemo(() => {
    const list = tab === 'con-promo' ? productsWithPromo : productsWithoutPromo;
    if (!searchQuery) return list;
    return list.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [tab, productsWithPromo, productsWithoutPromo, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ROWS_PER_PAGE));
  const paginated = filteredProducts.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const openCreatePromo = (product: Product) => {
    setSelectedProduct(product);
    if (product.promotion) {
      setFormData({ tipo: product.promotion.tipo, valor: product.promotion.valor.toString(), valor_secundario: product.promotion.valor_secundario?.toString() || '', activa: product.promotion.activa });
    } else { setFormData(defaultForm); }
    setShowPromoModal(true);
  };

  const handleSavePromo = async () => {
    if (!selectedProduct) return;
    setSaving(true); setError('');
    try {
      const data: any = { tipo: formData.tipo, valor: parseFloat(formData.valor), activa: formData.activa };
      if (formData.tipo === 'nxm') data.valor_secundario = parseInt(formData.valor_secundario);
      await productsService.setPromotion(selectedProduct._id, data);
      setShowPromoModal(false); setSelectedProduct(null); loadProducts();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar la promoción');
    } finally { setSaving(false); }
  };

  const handleDeletePromo = async () => {
    if (!selectedProduct) return;
    try {
      await productsService.removePromotion(selectedProduct._id);
      setShowDeleteModal(false); setSelectedProduct(null); loadProducts();
    } catch { setError('Error al eliminar la promoción'); }
  };

  const isFormValid = () => {
    if (!formData.valor || parseFloat(formData.valor) <= 0) return false;
    if (formData.tipo === 'nxm' && (!formData.valor_secundario || parseInt(formData.valor_secundario) < 1)) return false;
    if (formData.tipo === 'porcentaje' && parseFloat(formData.valor) > 100) return false;
    return true;
  };

  const handleNumInput = (field: 'valor' | 'valor_secundario') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v === '' || /^\d*\.?\d*$/.test(v)) setFormData({ ...formData, [field]: v });
  };

  const colCount = tab === 'con-promo' ? 6 : 4;

  return (
    <div className="space-y-6">
      <PageHeader title="Promociones" description="Gestiona las promociones de tus productos" />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center"><Tag className="w-5 h-5 text-emerald-600" /></div>
            <div><p className="text-2xl font-bold text-slate-900">{productsWithPromo.length}</p><p className="text-sm text-slate-500">Promociones activas</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center"><Package className="w-5 h-5 text-slate-600" /></div>
            <div><p className="text-2xl font-bold text-slate-900">{productsWithoutPromo.length}</p><p className="text-sm text-slate-500">Sin promoción</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center"><Percent className="w-5 h-5 text-indigo-600" /></div>
            <div><p className="text-2xl font-bold text-slate-900">{products.length}</p><p className="text-sm text-slate-500">Productos totales</p></div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Buscar productos..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" />
        </div>
        <div className="flex bg-slate-100 rounded-lg p-1">
          <button onClick={() => setTab('con-promo')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${tab === 'con-promo' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
            Con promoción ({productsWithPromo.length})
          </button>
          <button onClick={() => setTab('sin-promo')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${tab === 'sin-promo' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
            Sin promoción ({productsWithoutPromo.length})
          </button>
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">Imagen</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Precio</th>
                {tab === 'con-promo' && <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Promoción</th>}
                {tab === 'con-promo' && <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Precio Final</th>}
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={colCount} className="text-center py-16">
                  <div className="inline-flex items-center gap-3 text-slate-500">
                    <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />Cargando...
                  </div>
                </td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={colCount} className="text-center py-16">
                  <Tag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">{tab === 'con-promo' ? 'No hay productos con promociones activas' : 'Todos los productos tienen promoción'}</p>
                </td></tr>
              ) : paginated.map((product) => {
                const promo = product.promotion;
                const finalPrice = promo ? calculateFinalPrice(product.price, promo, 1) : product.price;
                const promoColors = promo ? getPromoColor(promo.tipo) : null;
                return (
                  <tr key={product._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-slate-300" /></div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900 text-sm">{product.name}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{product.description}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${promo ? 'line-through text-slate-400 text-xs' : 'text-slate-900 text-sm'}`}>${product.price.toLocaleString('es-AR')}</span>
                    </td>
                    {tab === 'con-promo' && promo && promoColors && (
                      <>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${promoColors.bg} ${promoColors.text} ${promoColors.border} border`}>
                            {getPromoLabel(promo)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-bold text-emerald-600">${finalPrice.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                        </td>
                      </>
                    )}
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button onClick={() => openCreatePromo(product)} title={promo ? 'Editar' : 'Agregar'}
                          className="p-1.5 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer">
                          {promo ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </button>
                        {promo && (
                          <button onClick={() => { setSelectedProduct(product); setShowDeleteModal(true); }} title="Eliminar"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && filteredProducts.length > ROWS_PER_PAGE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
            <span className="text-xs text-slate-500">{(currentPage - 1) * ROWS_PER_PAGE + 1}&ndash;{Math.min(currentPage * ROWS_PER_PAGE, filteredProducts.length)} de {filteredProducts.length}</span>
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

      {/* Modal Crear/Editar */}
      {showPromoModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowPromoModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><Tag className="w-5 h-5 text-emerald-600" /></div>
                <div><h2 className="text-lg font-bold text-slate-900">{selectedProduct.promotion ? 'Editar Promoción' : 'Nueva Promoción'}</h2><p className="text-xs text-slate-500">{selectedProduct.name}</p></div>
                <button onClick={() => setShowPromoModal(false)} className="ml-auto p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"><X className="w-5 h-5 text-slate-400" /></button>
              </div>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de promoción</label>
                <div className="grid grid-cols-3 gap-2">
                  {([['porcentaje', Percent, 'Porcentaje', 'text-orange-600 bg-orange-50 border-orange-200'], ['fijo', DollarSign, 'Fijo', 'text-blue-600 bg-blue-50 border-blue-200'], ['nxm', Tag, 'NxM', 'text-purple-600 bg-purple-50 border-purple-200']] as const).map(([tipo, Icon, label, colors]) => (
                    <button key={tipo} type="button"
                      onClick={() => setFormData({ ...formData, tipo, valor: '', valor_secundario: '' })}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all cursor-pointer ${formData.tipo === tipo ? colors + ' shadow-sm' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                      <Icon className="w-5 h-5" /><span className="text-xs font-semibold">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Desc */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600">
                {formData.tipo === 'porcentaje' && <><strong>Descuento porcentual:</strong> Se descuenta un porcentaje del precio.</>}
                {formData.tipo === 'fijo' && <><strong>Descuento fijo:</strong> Se descuenta un monto fijo del precio.</>}
                {formData.tipo === 'nxm' && <><strong>NxM:</strong> El cliente lleva N unidades y paga solo M.</>}
              </div>

              {/* Valor */}
              {formData.tipo === 'nxm' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Llevás (N)</label>
                    <input type="text" inputMode="numeric" placeholder="3" value={formData.valor} onChange={handleNumInput('valor')}
                      className="w-full px-4 py-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                    <p className="text-xs text-slate-400 mt-1">Cantidad que lleva</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Pagás (M)</label>
                    <input type="text" inputMode="numeric" placeholder="2" value={formData.valor_secundario} onChange={handleNumInput('valor_secundario')}
                      className="w-full px-4 py-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                    <p className="text-xs text-slate-400 mt-1">Cantidad que paga</p>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{formData.tipo === 'porcentaje' ? 'Porcentaje de descuento' : 'Monto de descuento ($)'}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">{formData.tipo === 'porcentaje' ? '%' : '$'}</span>
                    <input type="text" inputMode="decimal" placeholder={formData.tipo === 'porcentaje' ? '15' : '100'} value={formData.valor} onChange={handleNumInput('valor')}
                      className="w-full pl-8 pr-4 py-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{formData.tipo === 'porcentaje' ? 'Entre 1 y 100' : `Monto a descontar del precio ($${selectedProduct.price})`}</p>
                </div>
              )}

              {/* Preview */}
              {formData.valor && (
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-xs font-semibold text-emerald-800 mb-2">Vista previa:</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="line-through text-slate-400 text-sm">${selectedProduct.price.toLocaleString('es-AR')}</span>
                    <span className="text-xl font-bold text-emerald-600">
                      ${calculateFinalPrice(selectedProduct.price, { tipo: formData.tipo, valor: parseFloat(formData.valor) || 0, valor_secundario: parseInt(formData.valor_secundario) || undefined, activa: true }, 1).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getPromoColor(formData.tipo).bg} ${getPromoColor(formData.tipo).text}`}>
                      {formData.tipo === 'porcentaje' && `${formData.valor}% OFF`}
                      {formData.tipo === 'fijo' && `$${formData.valor} OFF`}
                      {formData.tipo === 'nxm' && `${formData.valor}x${formData.valor_secundario || '?'}`}
                    </span>
                  </div>
                </div>
              )}

              {/* Activa toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" checked={formData.activa} onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                    className="sr-only peer" />
                  <div className="w-10 h-6 bg-slate-200 rounded-full peer-checked:bg-emerald-500 transition-colors"></div>
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
                </div>
                <span className="text-sm font-medium text-slate-700">Promoción activa</span>
              </label>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button onClick={() => setShowPromoModal(false)} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer">Cancelar</button>
                <button onClick={handleSavePromo} disabled={!isFormValid() || saving}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm">
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowDeleteModal(false); setSelectedProduct(null); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-5 h-5 text-red-600" /></div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Eliminar Promoción</h3>
              <p className="text-sm text-slate-500">¿Eliminar la promoción de <strong className="text-slate-700">&quot;{selectedProduct.name}&quot;</strong>?</p>
              {selectedProduct.promotion && (
                <p className="text-xs text-slate-400 mt-2">Promoción actual: <strong>{getPromoLabel(selectedProduct.promotion)}</strong></p>
              )}
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button onClick={() => { setShowDeleteModal(false); setSelectedProduct(null); }} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer">Cancelar</button>
              <button onClick={handleDeletePromo} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all cursor-pointer shadow-sm">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
