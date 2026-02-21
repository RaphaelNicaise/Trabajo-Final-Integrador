import { useState, useEffect, useMemo, useRef } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { productsService } from '../../services/products.service';
import type { Product } from '../../services/products.service';
import { categoriesService } from '../../services/categories.service';
import type { Category } from '../../services/categories.service';
import {
  Trash2, Edit, Plus, Package, DollarSign, Box, Tag, Image as ImageIcon,
  Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X, AlertTriangle, Filter
} from 'lucide-react';

const ROWS_PER_PAGE = 8;

export const ProductosPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [orderBy, setOrderBy] = useState<keyof Product>('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categories: [] as string[],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [catInput, setCatInput] = useState('');
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadProducts(); loadCategories(); }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setShowCatDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, filterCategory]);

  const loadProducts = async () => {
    setLoading(true); setError('');
    try { setProducts(await productsService.getAll()); }
    catch { setError('Error al cargar los productos'); }
    finally { setLoading(false); }
  };

  const loadCategories = async () => {
    try { setCategories(await categoriesService.getAll()); } catch {}
  };

  // ── Category helpers ───────────────────────────────────────────────
  const filteredCatOptions = useMemo(() => {
    if (!catInput.trim()) return categories.filter(c => !formData.categories.includes(c._id));
    try {
      const regex = new RegExp(catInput.trim(), 'i');
      return categories.filter(c => !formData.categories.includes(c._id) && regex.test(c.name)).slice(0, 3);
    } catch {
      return categories.filter(c => !formData.categories.includes(c._id) && c.name.toLowerCase().includes(catInput.toLowerCase())).slice(0, 3);
    }
  }, [catInput, categories, formData.categories]);

  const exactCatMatch = categories.find(c => c.name.toLowerCase() === catInput.trim().toLowerCase());

  const addCategory = (cat: Category) => {
    setFormData({ ...formData, categories: [...formData.categories, cat._id] });
    setCatInput(''); setShowCatDropdown(false);
  };

  const createAndAddCategory = async () => {
    if (!catInput.trim()) return;
    try {
      const newCat = await categoriesService.create({ name: catInput.trim() });
      setCategories(prev => [...prev, newCat]);
      setFormData({ ...formData, categories: [...formData.categories, newCat._id] });
      setCatInput(''); setShowCatDropdown(false);
    } catch {}
  };

  const removeCategory = (catId: string) => {
    setFormData({ ...formData, categories: formData.categories.filter(id => id !== catId) });
  };

  // ── Number input helpers ───────────────────────────────────────────
  const handlePriceChange = (value: string) => {
    if (value === '' || value === '-') { setFormData({ ...formData, price: '' }); return; }
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) setFormData({ ...formData, price: value });
  };

  const handleStockChange = (value: string) => {
    if (value === '' || value === '-') { setFormData({ ...formData, stock: '' }); return; }
    const num = parseInt(value);
    if (!isNaN(num) && num >= 0) setFormData({ ...formData, stock: value });
  };

  const handlePriceBlur = () => { if (!formData.price) setFormData({ ...formData, price: '0' }); };
  const handleStockBlur = () => { if (!formData.stock) setFormData({ ...formData, stock: '0' }); };

  // ── CRUD ───────────────────────────────────────────────────────────
  const handleCreate = async () => {
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('description', formData.description);
      fd.append('price', (parseFloat(formData.price) || 0).toString());
      fd.append('stock', (parseInt(formData.stock) || 0).toString());
      fd.append('categories', JSON.stringify(formData.categories));
      if (imageFile) fd.append('image', imageFile);
      await productsService.create(fd);
      setShowCreateModal(false); resetForm(); loadProducts(); loadCategories();
    } catch { setError('Error al crear el producto'); }
  };

  const handleEdit = async () => {
    if (!selectedProduct) return;
    try {
      const fd = new FormData();
      if (formData.name !== selectedProduct.name) fd.append('name', formData.name);
      if (formData.description !== selectedProduct.description) fd.append('description', formData.description);
      if (parseFloat(formData.price) !== selectedProduct.price) fd.append('price', (parseFloat(formData.price) || 0).toString());
      if (parseInt(formData.stock) !== selectedProduct.stock) fd.append('stock', (parseInt(formData.stock) || 0).toString());
      fd.append('categories', JSON.stringify(formData.categories));
      if (imageFile) fd.append('image', imageFile);
      await productsService.update(selectedProduct._id, fd);
      setShowEditModal(false); resetForm(); loadProducts(); loadCategories();
    } catch { setError('Error al actualizar el producto'); }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    try {
      await productsService.delete(selectedProduct._id);
      setShowDeleteModal(false); setSelectedProduct(null); loadProducts();
    } catch { setError('Error al eliminar el producto'); }
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name, description: product.description,
      price: product.price.toString(), stock: product.stock.toString(),
      categories: product.categories || [],
    });
    setCatInput(''); setShowEditModal(true);
  };

  const openDeleteModal = (product: Product) => { setSelectedProduct(product); setShowDeleteModal(true); };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', stock: '', categories: [] });
    setImageFile(null); setSelectedProduct(null); setCatInput('');
  };

  // ── Sort ───────────────────────────────────────────────────────────
  const handleSort = (property: keyof Product) => {
    setOrder(orderBy === property && order === 'asc' ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const SortIcon = ({ field }: { field: keyof Product }) => {
    if (orderBy !== field) return <ChevronUp className="w-3.5 h-3.5 text-slate-300" />;
    return order === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-emerald-600" /> : <ChevronDown className="w-3.5 h-3.5 text-emerald-600" />;
  };

  // ── Derived data ───────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = filterCategory === 'todos' || (p.categories && p.categories.includes(filterCategory));
      return matchSearch && matchCat;
    });
  }, [products, searchQuery, filterCategory]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      const aVal = a[orderBy]; const bVal = b[orderBy];
      if (aVal === undefined || bVal === undefined) return 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      if (typeof aVal === 'number' && typeof bVal === 'number') return order === 'asc' ? aVal - bVal : bVal - aVal;
      return 0;
    });
  }, [filteredProducts, orderBy, order]);

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / ROWS_PER_PAGE));
  const paginatedProducts = sortedProducts.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const getStatusInfo = (product: Product) => {
    if (product.stock <= 0) return { label: 'Agotado', color: 'bg-red-50 text-red-700 border-red-200' };
    return { label: 'Disponible', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  const toggleProductStatus = async (product: Product) => {
    try {
      const fd = new FormData();
      fd.append('stock', product.stock > 0 ? '0' : '1');
      await productsService.update(product._id, fd);
      loadProducts();
    } catch { setError('Error al cambiar el estado'); }
  };

  // ── Category Input ─────────────────────────────────────────────────
  const renderCategoryInput = () => (
    <div ref={catRef} className="space-y-2">
      {formData.categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {formData.categories.map(catId => {
            const cat = categories.find(c => c._id === catId);
            return cat ? (
              <span key={catId} className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200">
                {cat.name}
                <button type="button" onClick={() => removeCategory(catId)} className="hover:bg-indigo-200 rounded-full p-0.5 transition-colors cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            ) : null;
          })}
        </div>
      )}
      <div className="relative">
        <input
          type="text" value={catInput}
          onChange={(e) => { setCatInput(e.target.value); setShowCatDropdown(true); }}
          onFocus={() => setShowCatDropdown(true)}
          placeholder="Buscar o crear categoría..."
          className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
        />
        {showCatDropdown && (catInput.trim() || filteredCatOptions.length > 0) && (
          <div className="absolute z-20 top-full mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
            {filteredCatOptions.map(cat => (
              <button key={cat._id} type="button" onClick={() => addCategory(cat)}
                className="w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer">
                <Tag className="w-3.5 h-3.5 text-slate-400" />{cat.name}
              </button>
            ))}
            {catInput.trim() && !exactCatMatch && (
              <button type="button" onClick={createAndAddCategory}
                className="w-full text-left px-3 py-2.5 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center gap-2 cursor-pointer border-t border-slate-100">
                <Plus className="w-3.5 h-3.5" />Crear &quot;{catInput.trim()}&quot;
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // ── Product Form ───────────────────────────────────────────────────
  const renderProductForm = (actionLabel: string, onSubmit: () => void) => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wide"><Package className="w-4 h-4" /> Información</div>
        <input type="text" placeholder="Nombre del producto" value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
        <textarea placeholder="Descripción del producto..." rows={3} value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wide"><DollarSign className="w-4 h-4" /> Precio y Stock</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
            <input type="text" inputMode="decimal" placeholder="0" value={formData.price}
              onChange={(e) => handlePriceChange(e.target.value)} onBlur={handlePriceBlur}
              className="w-full pl-7 pr-4 py-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            <span className="absolute -top-2.5 left-2 text-[10px] font-medium text-slate-400 bg-white px-1">Precio</span>
          </div>
          <div className="relative">
            <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" inputMode="numeric" placeholder="0" value={formData.stock}
              onChange={(e) => handleStockChange(e.target.value)} onBlur={handleStockBlur}
              className="w-full pl-9 pr-4 py-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            <span className="absolute -top-2.5 left-2 text-[10px] font-medium text-slate-400 bg-white px-1">Stock</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wide"><Tag className="w-4 h-4" /> Categorías</div>
        {renderCategoryInput()}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wide"><ImageIcon className="w-4 h-4" /> Imagen</div>
        <label className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-slate-300 hover:bg-slate-50/50 transition-all group">
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="hidden" />
          {imageFile ? (
            <span className="text-sm font-medium text-emerald-600">&#10003; {imageFile.name}</span>
          ) : (
            <><ImageIcon className="w-5 h-5 text-slate-400 group-hover:text-slate-500" /><span className="text-sm text-slate-500 group-hover:text-slate-600">Seleccionar imagen</span></>
          )}
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button type="button" onClick={() => { setShowCreateModal(false); setShowEditModal(false); resetForm(); }}
          className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all cursor-pointer">Cancelar</button>
        <button type="button" onClick={onSubmit} disabled={!formData.name.trim()}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm hover:shadow-md">
          {actionLabel}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Productos" description="Gestiona el catálogo de productos" />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Buscar producto..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
              className="pl-10 pr-8 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer">
              <option value="todos">Todas las categorías</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <button onClick={() => { resetForm(); setShowCreateModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer">
          <Plus className="w-4 h-4" />Crear Producto
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">Img</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:text-slate-700" onClick={() => handleSort('name')}>
                  <span className="inline-flex items-center gap-1">Nombre <SortIcon field="name" /></span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Descripción</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Categorías</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:text-slate-700" onClick={() => handleSort('price')}>
                  <span className="inline-flex items-center gap-1 justify-end">Precio <SortIcon field="price" /></span>
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:text-slate-700" onClick={() => handleSort('stock')}>
                  <span className="inline-flex items-center gap-1 justify-end">Stock <SortIcon field="stock" /></span>
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-16">
                  <div className="inline-flex items-center gap-3 text-slate-500">
                    <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />Cargando...
                  </div>
                </td></tr>
              ) : paginatedProducts.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-16">
                  <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">{filteredProducts.length === 0 && products.length > 0 ? 'Sin resultados' : 'No hay productos'}</p>
                </td></tr>
              ) : paginatedProducts.map((product) => {
                const status = getStatusInfo(product);
                return (
                  <tr key={product._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-11 h-11 rounded-lg object-cover border border-slate-100" />
                      ) : (
                        <div className="w-11 h-11 bg-slate-100 rounded-lg flex items-center justify-center"><ImageIcon className="w-4 h-4 text-slate-300" /></div>
                      )}
                    </td>
                    <td className="px-4 py-3"><span className="font-medium text-slate-900 text-sm">{product.name}</span></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><span className="text-slate-500 text-sm line-clamp-1 max-w-[200px]">{product.description || '\u2014'}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {product.categories && product.categories.length > 0 ? product.categories.map(catId => {
                          const cat = categories.find(c => c._id === catId);
                          return cat ? <span key={catId} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[11px] font-medium rounded-md border border-indigo-100">{cat.name}</span> : null;
                        }) : <span className="text-slate-400 text-xs">&mdash;</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right"><span className="font-semibold text-slate-900 text-sm">${product.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span></td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium text-sm ${product.stock <= 0 ? 'text-red-600' : product.stock < 5 ? 'text-amber-600' : 'text-slate-700'}`}>{product.stock}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleProductStatus(product)} title="Click para cambiar estado"
                        className={`inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded-full border cursor-pointer hover:opacity-80 transition-all ${status.color}`}>{status.label}</button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button onClick={() => openEditModal(product)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer" title="Editar"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => openDeleteModal(product)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && sortedProducts.length > ROWS_PER_PAGE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
            <span className="text-xs text-slate-500">{(currentPage - 1) * ROWS_PER_PAGE + 1}&ndash;{Math.min(currentPage * ROWS_PER_PAGE, sortedProducts.length)} de {sortedProducts.length}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-md text-xs font-medium transition-all cursor-pointer ${page === currentPage ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>{page}</button>
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
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-slate-100 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><Package className="w-5 h-5 text-emerald-600" /></div>
                <div><h2 className="text-lg font-bold text-slate-900">Crear Producto</h2><p className="text-xs text-slate-500">Agrega un nuevo producto al catálogo</p></div>
                <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="ml-auto p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"><X className="w-5 h-5 text-slate-400" /></button>
              </div>
            </div>
            <div className="px-6 py-5">{renderProductForm("Crear Producto", handleCreate)}</div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowEditModal(false); resetForm(); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-slate-100 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><Edit className="w-5 h-5 text-blue-600" /></div>
                <div><h2 className="text-lg font-bold text-slate-900">Editar Producto</h2><p className="text-xs text-slate-500">Actualiza la información</p></div>
                <button onClick={() => { setShowEditModal(false); resetForm(); }} className="ml-auto p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"><X className="w-5 h-5 text-slate-400" /></button>
              </div>
            </div>
            <div className="px-6 py-5">{renderProductForm("Actualizar", handleEdit)}</div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowDeleteModal(false); setSelectedProduct(null); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-5 h-5 text-red-600" /></div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Eliminar Producto</h3>
              <p className="text-sm text-slate-500">¿Eliminar <strong className="text-slate-700">&quot;{selectedProduct?.name}&quot;</strong>? Esta acción no se puede deshacer.</p>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button onClick={() => { setShowDeleteModal(false); setSelectedProduct(null); }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer">Cancelar</button>
              <button onClick={handleDelete}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all cursor-pointer shadow-sm">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
