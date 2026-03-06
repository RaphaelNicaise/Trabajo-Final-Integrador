'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
            <div className="text-center max-w-lg">
                {/* Animated 404 */}
                <div className="relative mb-8">
                    <h1 className="text-[160px] font-black text-slate-200 leading-none select-none">404</h1>
                    <div className="absolute inset-0 flex items-center justify-center">

                    </div>
                </div>

                <h2 className="text-3xl font-bold text-slate-800 mb-3">Página no encontrada</h2>
                <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                    La página que estás buscando no existe o fue movida a otra ubicación.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                        <Home className="w-5 h-5" />
                        Ir al inicio
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border-2 border-slate-200 hover:border-slate-300 shadow-sm transition-all duration-200 cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Volver atrás
                    </button>
                </div>

                <p className="text-slate-400 text-sm mt-10">
                    Si creés que esto es un error, contactanos.
                </p>
            </div>
        </div>
    );
}
