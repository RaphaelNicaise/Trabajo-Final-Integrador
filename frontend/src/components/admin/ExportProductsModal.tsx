'use client';

import { useState, useMemo } from 'react';
import { X, Download, FileSpreadsheet, Filter, Package } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { Product } from '../../services/products.service';
import type { Category } from '../../services/categories.service';

interface ExportProductsModalProps {
    open: boolean;
    onClose: () => void;
    products: Product[];
    categories: Category[];
}

export const ExportProductsModal = ({ open, onClose, products, categories }: ExportProductsModalProps) => {
    const [filterCategory, setFilterCategory] = useState('todos');
    const [filterStatus, setFilterStatus] = useState('todos');
    const [filterLowStock, setFilterLowStock] = useState(false);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchCat = filterCategory === 'todos' || (p.categories && p.categories.includes(filterCategory));
            const matchStatus = filterStatus === 'todos' || (p.status ?? 'Disponible') === filterStatus;
            const matchStock = !filterLowStock || p.stock < 5;
            return matchCat && matchStatus && matchStock;
        });
    }, [products, filterCategory, filterStatus, filterLowStock]);

    const getCategoryNames = (catIds?: string[]) => {
        if (!catIds || catIds.length === 0) return '—';
        return catIds.map(id => categories.find(c => c._id === id)?.name || '').filter(Boolean).join(', ');
    };

    const handleExport = () => {
        const data = filteredProducts.map(p => ({
            'Nombre': p.name,
            'Descripción': p.description,
            'Precio': p.price,
            'Stock': p.stock,
            'Estado': p.status ?? 'Disponible',
            'Categorías': getCategoryNames(p.categories),
            'Fecha Creación': new Date(p.createdAt).toLocaleDateString('es-AR'),
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Productos');

        const colWidths = Object.keys(data[0] || {}).map(key => ({
            wch: Math.max(key.length, ...data.map(row => String((row as any)[key] || '').length)) + 2
        }));
        ws['!cols'] = colWidths;

        XLSX.writeFile(wb, `productos_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col">
                {/* Header */}
                <div className="flex-shrink-0 bg-white px-6 pt-6 pb-4 border-b border-slate-100 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Exportar Productos a Excel</h2>
                            <p className="text-xs text-slate-500">Filtra y exporta los datos de tus productos</p>
                        </div>
                        <button onClick={onClose} className="ml-auto p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex-shrink-0 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2 mb-3">
                        <Filter className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-semibold text-slate-600">Filtros</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                            <option value="todos">Todas las categorías</option>
                            {categories.map(c => (<option key={c._id} value={c._id}>{c.name}</option>))}
                        </select>
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                            <option value="todos">Todos los estados</option>
                            <option value="Disponible">Disponible</option>
                            <option value="No disponible">No disponible</option>
                            <option value="Agotado">Agotado</option>
                        </select>
                        <label className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg bg-white cursor-pointer hover:bg-slate-50 transition-colors">
                            <input type="checkbox" checked={filterLowStock} onChange={(e) => setFilterLowStock(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                            <span className="text-sm text-slate-700">Bajo stock (&lt;5)</span>
                        </label>
                    </div>
                </div>

                {/* Preview Table */}
                <div className="flex-1 overflow-auto px-6 py-4 min-h-0">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-slate-400">
                            {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} seleccionado{filteredProducts.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Nombre</th>
                                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Categorías</th>
                                    <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Precio</th>
                                    <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Stock</th>
                                    <th className="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-10">
                                            <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                            <p className="text-slate-400 text-sm">No hay productos con los filtros seleccionados</p>
                                        </td>
                                    </tr>
                                ) : filteredProducts.map(p => (
                                    <tr key={p._id} className="hover:bg-slate-50/50">
                                        <td className="px-3 py-2 font-medium text-slate-800">{p.name}</td>
                                        <td className="px-3 py-2 text-slate-500">{getCategoryNames(p.categories)}</td>
                                        <td className="px-3 py-2 text-right text-slate-800">${p.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                                        <td className="px-3 py-2 text-right">
                                            <span className={`font-medium ${p.stock <= 0 ? 'text-red-600' : p.stock < 5 ? 'text-amber-600' : 'text-slate-700'}`}>{p.stock}</span>
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${(p.status ?? 'Disponible') === 'Disponible' ? 'bg-emerald-50 text-emerald-700' :
                                                    p.status === 'Agotado' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'
                                                }`}>{p.status ?? 'Disponible'}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 bg-white px-6 py-4 border-t border-slate-100 flex items-center justify-between rounded-b-2xl">
                    <button onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all cursor-pointer">
                        Cancelar
                    </button>
                    <button onClick={handleExport} disabled={filteredProducts.length === 0}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm hover:shadow-md">
                        <Download className="w-4 h-4" />Descargar Excel ({filteredProducts.length})
                    </button>
                </div>
            </div>
        </div>
    );
};
