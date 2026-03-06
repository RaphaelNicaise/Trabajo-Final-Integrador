'use client';

import { useState, useMemo } from 'react';
import { X, Download, FileSpreadsheet, Filter, ShoppingBag } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { Order } from '../../services/orders.service';

interface ExportOrdersModalProps {
    open: boolean;
    onClose: () => void;
    orders: Order[];
}

const STATUS_STYLES: Record<string, string> = {
    Pendiente: 'bg-amber-100 text-amber-800',
    Confirmado: 'bg-emerald-100 text-emerald-800',
    Enviado: 'bg-blue-100 text-blue-800',
    Cancelado: 'bg-red-100 text-red-800',
};

const STATUSES = ['Pendiente', 'Confirmado', 'Enviado', 'Cancelado'];

export const ExportOrdersModal = ({ open, onClose, orders }: ExportOrdersModalProps) => {
    const [statusFilter, setStatusFilter] = useState('todos');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Date validation helpers
    const handleDateFromChange = (value: string) => {
        setDateFrom(value);
        if (dateTo && value > dateTo) setDateTo(value);
    };
    const handleDateToChange = (value: string) => {
        setDateTo(value);
        if (dateFrom && value < dateFrom) setDateFrom(value);
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(o => {
            const matchStatus = statusFilter === 'todos' || o.status === statusFilter;
            let matchDate = true;
            if (dateFrom) {
                const fromDate = new Date(dateFrom); fromDate.setHours(0, 0, 0, 0);
                matchDate = matchDate && new Date(o.createdAt) >= fromDate;
            }
            if (dateTo) {
                const toDate = new Date(dateTo); toDate.setHours(23, 59, 59, 999);
                matchDate = matchDate && new Date(o.createdAt) <= toDate;
            }
            return matchStatus && matchDate;
        });
    }, [orders, statusFilter, dateFrom, dateTo]);

    const formatDate = (d: string) => new Date(d).toLocaleDateString('es-AR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const handleExport = () => {
        const data = filteredOrders.map(o => ({
            'ID': o._id.slice(-8),
            'Comprador': o.buyer.name,
            'Email': o.buyer.email,
            'Teléfono': o.buyer.phone,
            'Provincia': o.buyer.province,
            'Localidad': o.buyer.city,
            'Dirección': `${o.buyer.address} ${o.buyer.streetNumber}`,
            'Código Postal': o.buyer.postalCode,
            'Productos': o.products.map(p => `${p.name} x${p.quantity}`).join(', '),
            'Total': o.total,
            'Estado': o.status,
            'Método de Envío': o.shipping?.method || '—',
            'Costo Envío': o.shipping?.cost || 0,
            'Fecha': formatDate(o.createdAt),
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Órdenes');

        const colWidths = Object.keys(data[0] || {}).map(key => ({
            wch: Math.max(key.length, ...data.map(row => String((row as any)[key] || '').length).slice(0, 20)) + 2
        }));
        ws['!cols'] = colWidths;

        XLSX.writeFile(wb, `ordenes_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col">
                {/* Header */}
                <div className="flex-shrink-0 bg-white px-6 pt-6 pb-4 border-b border-slate-100 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Exportar Órdenes a Excel</h2>
                            <p className="text-xs text-slate-500">Filtra y exporta los datos de tus órdenes</p>
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
                    <div className="flex flex-wrap items-center gap-3">
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                            <option value="todos">Todos los estados</option>
                            {STATUSES.map(s => (<option key={s} value={s}>{s}</option>))}
                        </select>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">Desde:</span>
                            <input type="date" value={dateFrom} max={dateTo || undefined} onChange={(e) => handleDateFromChange(e.target.value)}
                                className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">Hasta:</span>
                            <input type="date" value={dateTo} min={dateFrom || undefined} onChange={(e) => handleDateToChange(e.target.value)}
                                className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                        </div>
                        {(dateFrom || dateTo || statusFilter !== 'todos') && (
                            <button onClick={() => { setStatusFilter('todos'); setDateFrom(''); setDateTo(''); }}
                                className="text-xs text-slate-500 hover:text-slate-700 underline cursor-pointer">Limpiar filtros</button>
                        )}
                    </div>
                </div>

                {/* Preview Table */}
                <div className="flex-1 overflow-auto px-6 py-4 min-h-0">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-slate-400">
                            {filteredOrders.length} orden{filteredOrders.length !== 1 ? 'es' : ''} seleccionada{filteredOrders.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">ID</th>
                                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Comprador</th>
                                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Email</th>
                                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Productos</th>
                                    <th className="text-right px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Total</th>
                                    <th className="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Estado</th>
                                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Fecha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-10">
                                            <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                            <p className="text-slate-400 text-sm">No hay órdenes con los filtros seleccionados</p>
                                        </td>
                                    </tr>
                                ) : filteredOrders.map(o => (
                                    <tr key={o._id} className="hover:bg-slate-50/50">
                                        <td className="px-3 py-2">
                                            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{o._id.slice(-8)}</span>
                                        </td>
                                        <td className="px-3 py-2 font-medium text-slate-800 whitespace-nowrap">{o.buyer.name}</td>
                                        <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{o.buyer.email}</td>
                                        <td className="px-3 py-2 text-slate-500 max-w-[200px] truncate">
                                            {o.products.map(p => `${p.name} x${p.quantity}`).join(', ')}
                                        </td>
                                        <td className="px-3 py-2 text-right font-semibold text-emerald-600">${o.total.toFixed(2)}</td>
                                        <td className="px-3 py-2 text-center">
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_STYLES[o.status] || ''}`}>{o.status}</span>
                                        </td>
                                        <td className="px-3 py-2 text-slate-500 whitespace-nowrap text-xs">{formatDate(o.createdAt)}</td>
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
                    <button onClick={handleExport} disabled={filteredOrders.length === 0}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm hover:shadow-md">
                        <Download className="w-4 h-4" />Descargar Excel ({filteredOrders.length})
                    </button>
                </div>
            </div>
        </div>
    );
};
