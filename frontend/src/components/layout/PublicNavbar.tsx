import { Search, ShoppingCart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export const PublicNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-[#1E1B4B] border-b border-slate-700 sticky top-0 z-50 shadow-xl">
      <div className="w-full h-20 flex items-center justify-between px-6 md:px-12">
        
        {/* Logo */}
        <Link to="/" className="flex-shrink-0 flex items-center cursor-pointer">
          <span className="text-2xl font-bold text-white">Store<span className="text-emerald-400">Hub</span></span>
        </Link>

        {/* Buscador (Centro) */}
        <div className="hidden md:flex flex-1 justify-center px-10">
          <div className="relative w-full max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" strokeWidth={2} />
            </div>
            <input
              type="text"
              placeholder="Buscar tiendas..."
              className="block w-full pl-12 pr-4 py-3 text-base border border-slate-600 rounded-full bg-slate-800/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Acciones (Derecha) */}
        <div className="hidden md:flex items-center gap-6 flex-shrink-0">
          
          <Link
            to="/"
            className="text-base text-slate-200 hover:text-white font-semibold transition-colors"
          >
            Explorar
          </Link>
          
          <Link 
            to="/login"
            className="px-5 py-2.5 text-base font-semibold text-slate-100 border border-slate-600 rounded-lg hover:bg-slate-700 transition-all"
          >
            Ingresar
          </Link>
          
          <Link 
            to="/register"
            className="px-5 py-2.5 bg-emerald-500 text-white text-base font-bold rounded-lg hover:bg-emerald-400 transition-all"
          >
            Vende en StoreHub
          </Link>
          
          <div className="pl-4 ml-2 border-l border-slate-700 flex items-center">
            <button className="relative p-2 group" aria-label="Carrito">
              <ShoppingCart className="h-7 w-7 text-slate-200 group-hover:text-emerald-400 transition-colors" strokeWidth={2} />
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-[#1E1B4B]">
                3
              </span>
            </button>
          </div>
        </div>

        {/* Menu Movil */}
        <div className="md:hidden flex items-center gap-4">
          <button className="relative">
            <ShoppingCart className="h-7 w-7 text-slate-200" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">3</span>
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-200 hover:bg-slate-800 rounded-lg"
          >
            {isMobileMenuOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
          </button>
        </div>
      </div>

      {/* Dropdown Movil */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#1E1B4B] border-t border-slate-700 shadow-2xl absolute w-full left-0 z-50 animate-fade-in-down">
          <div className="p-6 space-y-4 flex flex-col">
            <Link 
              to="/" 
              className="text-lg font-medium text-slate-200 py-2 border-b border-slate-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Explorar Tiendas
            </Link>
            
            <Link 
              to="/login" 
              className="w-full text-left py-3 text-lg font-medium text-slate-200 border-b border-slate-700"
            >
              Ingresar
            </Link>
            
            <Link 
              to="/register" 
              className="w-full py-4 bg-emerald-500 text-white font-bold rounded-lg text-lg text-center mt-2"
            >
              Quiero Vender
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
