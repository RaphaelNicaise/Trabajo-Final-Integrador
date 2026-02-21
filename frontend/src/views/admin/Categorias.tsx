import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { categoriesService } from '../../services/categories.service';
import type { Category } from '../../services/categories.service';
import {
  Trash2, Edit, Plus, Tag, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X, AlertTriangle
} from 'lucide-react';

const ROWS_PER_PAGE = 8;

export const CategoriasPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [orderBy, setOrderBy] = useState<keyof Category>('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => { loadCategories(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const loadCategories = async () => {
    setLoading(true); setError('');
    try { setCategories(await categoriesService.getAll()); }
    catch { setError('Error al cargar las categorías'); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      await categoriesService.create({ name: formData.name });
      setShowCreateModal(false); resetForm(); loadCategories();
    } catch { setError('Error al crear la categoría'); }
  };

  const handleEdit = async () => {
    if (!selectedCategory) return;
    try {
      await categoriesService.update(selectedCategory._id, { name: formData.name });
      setShowEditModal(false); resetForm(); loadCategories();
    } catch { setError('Error al actualizar la categoría'); }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    try {
      await categoriesService.delete(selectedCategory._id);
      setShowDeleteModal(false); setSelectedCategory(null); loadCategories();
    } catch { setError('Error al eliminar la categoría'); }
  };

  const openEditModal = (cat: Category) => {
    setSelectedCategory(cat); setFormData({ name: cat.name }); setShowEditModal(true);
  };

  const resetForm = () => { setFormData({ name: '' }); setSelectedCategory(null); };

  const handleSort = (property: keyof Category) => {
    setOrder(orderBy === property && order === 'asc' ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const SortIcon = ({ field }: { field: keyof Category }) => {
    if (orderBy !== field) return <ChevronUp className="w-3.5 h-3.5 text-slate-300" />;
    return order === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-purple-600" /> : <ChevronDown className="w-3.5 h-3.5 text-purple-600" />;
  };

  const filtered = useMemo(() => {
    return categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [categories, searchQuery]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aVal = a[orderBy]; const bVal = b[orderBy];
      if (typeof aVal === 'string' && typeof bVal === 'string')
        return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return 0;
    });
  }, [filtered, orderBy, order]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / ROWS_PER_PAGE));
  const paginated = sorted.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6">
      <PageHeader title="Categorías" description="Organiza tus productos por categorías" />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Buscar categoría..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" />
        </div>
        <button onClick={() => { resetForm(); setShowCreateModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer">
          <Plus className="w-4 h-4" />Agregar Categoría
        </button>
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:text-slate-700" onClick={() => handleSort('name')}>
                  <span className="inline-flex items-center gap-1">Nombre <SortIcon field="name" /></span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:text-slate-700" onClick={() => handleSort('createdAt')}>
                  <span className="inline-flex items-center gap-1">Creado <SortIcon field="createdAt" /></span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:text-slate-700" onClick={() => handleSort('updatedAt')}>
                  <span className="inline-flex items-center gap-1">Actualizado <SortIcon field="updatedAt" /></span>
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-16">
                  <div className="inline-flex items-center gap-3 text-slate-500">
                    <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />Cargando...
                  </div>
                </td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-16">
                  <Tag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">{filtered.length === 0 && categories.length > 0 ? 'Sin resultados' : 'No hay categorías'}</p>
                </td></tr>
              ) : paginated.map((cat) => (
                <tr key={cat._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center"><Tag className="w-3.5 h-3.5 text-purple-600" /></div>
                      <span className="font-medium text-slate-900 text-sm">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">{formatDate(cat.createdAt)}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{formatDate(cat.updatedAt)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex items-center gap-1">
                      <button onClick={() => openEditModal(cat)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer" title="Editar"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => { setSelectedCategory(cat); setShowDeleteModal(true); }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
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

      {/* Modal Crear */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowCreateModal(false); resetForm(); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><Tag className="w-5 h-5 text-purple-600" /></div>
                <div><h2 className="text-lg font-bold text-slate-900">Agregar Categoría</h2><p className="text-xs text-slate-500">Organiza tus productos</p></div>
                <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="ml-auto p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"><X className="w-5 h-5 text-slate-400" /></button>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <input type="text" placeholder="Nombre de la categoría" value={formData.name} autoFocus
                onChange={(e) => setFormData({ name: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter' && formData.name.trim()) handleCreate(); }}
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" />
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer">Cancelar</button>
                <button onClick={handleCreate} disabled={!formData.name.trim()}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm">Crear</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowEditModal(false); resetForm(); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><Edit className="w-5 h-5 text-blue-600" /></div>
                <div><h2 className="text-lg font-bold text-slate-900">Editar Categoría</h2><p className="text-xs text-slate-500">Actualiza el nombre</p></div>
                <button onClick={() => { setShowEditModal(false); resetForm(); }} className="ml-auto p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"><X className="w-5 h-5 text-slate-400" /></button>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <input type="text" placeholder="Nombre de la categoría" value={formData.name} autoFocus
                onChange={(e) => setFormData({ name: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter' && formData.name.trim()) handleEdit(); }}
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => { setShowEditModal(false); resetForm(); }} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer">Cancelar</button>
                <button onClick={handleEdit} disabled={!formData.name.trim()}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm">Actualizar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowDeleteModal(false); setSelectedCategory(null); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-5 h-5 text-red-600" /></div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Eliminar Categoría</h3>
              <p className="text-sm text-slate-500">¿Eliminar <strong className="text-slate-700">&quot;{selectedCategory?.name}&quot;</strong>? Esta acción no se puede deshacer.</p>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button onClick={() => { setShowDeleteModal(false); setSelectedCategory(null); }} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer">Cancelar</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all cursor-pointer shadow-sm">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
