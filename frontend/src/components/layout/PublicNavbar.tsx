import { Search, ShoppingCart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import logoSH from '../../assets/logosh.png';

export const PublicNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-[#1E1B4B] border-b border-slate-700 sticky top-0 z-50 shadow-md">
      {/* CAMBIO: w-full para ocupar todo el ancho, px-8 para márgenes laterales */}
      <div className="w-full px-4 sm:px-8 lg:px-12">
        {/* CAMBIO: h-24 para dar altura suficiente al logo grande */}
        <div className="flex items-center justify-between h-24">
          
          {/* 1. SECCIÓN IZQUIERDA: Logo Grande */}
          <div className="flex-shrink-0 flex items-center cursor-pointer">
            {/* CAMBIO: Logo h-16 (64px) mucho más grande que antes */}
            <img 
              src={logoSH} 
              alt="StoreHub Logo" 
              className="h-16 w-auto object-contain hover:opacity-90 transition-opacity" 
            />
          </div>

          {/* 2. SECCIÓN CENTRAL: Buscador Corto y Centrado */}
          {/* hidden md:flex para ocultar en móvil. flex-1 y justify-center para centrar. */}
          <div className="hidden md:flex flex-1 justify-center px-8">
            {/* CAMBIO: max-w-md hace el buscador más corto (aprox 450px) */}
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" strokeWidth={2} />
              </div>
              <input
                type="text"
                placeholder="Buscar tiendas..."
                className="block w-full pl-10 pr-4 py-2.5 border border-slate-600 rounded-full leading-5 bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* 3. SECCIÓN DERECHA: Navegación y Acciones */}
          <div className="hidden md:flex items-center gap-6 flex-shrink-0">
            <a
              href="#explorar"
              className="text-slate-200 hover:text-white font-medium transition-colors text-base"
            >
              Explorar
            </a>
            
            <button className="px-6 py-2.5 text-slate-200 font-medium border border-slate-600 rounded-md hover:bg-slate-700 hover:text-white transition-all active:scale-95">
              Ingresar
            </button>
            
            <button className="px-6 py-2.5 bg-emerald-500 text-white font-bold rounded-md hover:bg-emerald-600 transition-all shadow-lg active:scale-95 hover:shadow-emerald-500/20">
              Vende en StoreHub
            </button>
            
            {/* Carrito con separador */}
            <div className="pl-4 ml-2 border-l border-slate-700 flex items-center">
              <button
                className="relative p-2 text-slate-200 hover:text-white transition-colors group"
                aria-label="Carrito"
              >
                <ShoppingCart className="h-7 w-7 group-hover:scale-110 transition-transform" strokeWidth={2} />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-[#1E1B4B]">
                  3
                </span>
              </button>
            </div>
          </div>

          {/* Botón Menú Móvil (Solo visible en pantallas chicas) */}
          <div className="md:hidden flex items-center gap-4">
            <button className="relative p-2 text-slate-200">
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                3
              </span>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-200 hover:bg-slate-800 rounded-md"
            >
              {isMobileMenuOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
            </button>
          </div>
        </div>

        {/* Buscador Móvil (Debajo del navbar en pantallas chicas) */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar..."
              className="block w-full pl-10 pr-4 py-3 border border-slate-600 rounded-md bg-slate-800 text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#1E1B4B] border-t border-slate-700 shadow-xl absolute w-full left-0 z-50">
          <div className="px-6 py-6 space-y-4">
            <a href="#explorar" className="block text-lg font-medium text-slate-200 py-2">
              Explorar Tiendas
            </a>
            <button className="w-full text-left py-3 text-lg font-medium text-slate-200 border-t border-slate-700">
              Ingresar
            </button>
            <button className="w-full py-3 bg-emerald-500 text-white font-bold rounded-md text-lg">
              ¡Quiero Vender!
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};