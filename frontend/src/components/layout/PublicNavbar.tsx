import { Search, ShoppingCart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import logoSH from '../../assets/logosh.png';

export const PublicNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    // Navbar alto h-28
    <nav className="bg-[#1E1B4B] border-b border-slate-700 sticky top-0 z-50 shadow-xl">
      

      <div className="w-full h-28 flex items-center justify-between px-6 md:pl-12 md:pr-20 ">
        
        {/* 1. LOGO */}
        <div className="flex-shrink-0 flex items-center cursor-pointer">
          <img 
            src={logoSH} 
            alt="StoreHub Logo" 
            className="h-20 w-auto object-contain hover:scale-105 transition-transform duration-200" 
          />
        </div>

        {/* 2. BUSCADOR (Centro) */}
        <div className="hidden md:flex flex-1 justify-center px-10">
          <div className="relative w-full max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-slate-400" strokeWidth={2.5} />
            </div>
            <input
              type="text"
              placeholder="  Buscar tiendas..."
              className="block w-full pl-14 pr-6 py-4 text-lg border border-slate-600 rounded-full bg-slate-800/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-inner backdrop-blur-sm"
            />
          </div>
        </div>

        {/* 3. ACCIONES (Derecha) */}
        {/* gap-8 para separar los elementos entre sí */}
        <div className="hidden md:flex items-center gap-8 flex-shrink-0 ">
          
          <a
            href="#explorar"
            className="text-lg text-slate-200 hover:text-white font-semibold transition-colors hover:underline underline-offset-4 decoration-emerald-500"
          >
            Explorar
          </a>
          
          <button className="min-w-[140px] h-12 flex items-center justify-center text-lg font-semibold text-slate-100 border-2 border-slate-600 rounded-xl hover:bg-slate-700 hover:border-slate-500 transition-all active:scale-95">
            Ingresar
          </button>
          

          <button className="min-w-[200px] h-12 flex items-center justify-center bg-emerald-500 text-white text-lg font-bold rounded-xl hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all active:scale-95 transform">
            Vende en StoreHub
          </button>
          
     
          <div className="pl-4 ml-2 border-l border-slate-700 flex items-center">
            <button
              className="relative p-2 group"
              aria-label="Carrito"
            >
              <ShoppingCart className="h-9 w-9 text-slate-200 group-hover:text-emerald-400 transition-colors" strokeWidth={2} />
              <span className="absolute top-0 -right-1 h-6 w-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-[#1E1B4B] shadow-sm transform group-hover:scale-110 transition-transform">
                3
              </span>
            </button>
          </div>
        </div>

        {/* MENÚ MÓVIL */}
        <div className="md:hidden flex items-center gap-6">
          <button className="relative">
            <ShoppingCart className="h-8 w-8 text-slate-200" />
            <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">3</span>
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-200 hover:bg-slate-800 rounded-lg"
          >
            {isMobileMenuOpen ? <X className="h-10 w-10" /> : <Menu className="h-10 w-10" />}
          </button>
        </div>
      </div>

      {/* DROPDOWN MÓVIL */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#1E1B4B] border-t border-slate-700 shadow-2xl absolute w-full left-0 z-50 animate-in slide-in-from-top-5 duration-200">
          <div className="p-6 space-y-6 flex flex-col">
            <a href="#explorar" className="text-xl font-medium text-slate-200 py-2 border-b border-slate-700">
              Explorar Tiendas
            </a>
            <button className="w-full text-left py-4 text-xl font-medium text-slate-200 border-b border-slate-700">
              Ingresar
            </button>
            <button className="w-full py-5 bg-emerald-500 text-white font-bold rounded-xl text-xl shadow-lg mt-4">
              ¡Quiero Vender!
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};