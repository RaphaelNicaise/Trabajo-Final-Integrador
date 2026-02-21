import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export const PublicNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-[#1E1B4B] border-b border-slate-700 sticky top-0 z-50 shadow-xl">
      <div className="w-full h-20 flex items-center justify-between px-6 md:px-12">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center cursor-pointer">
          <span className="text-2xl font-bold text-white">Store<span className="text-emerald-400">Hub</span></span>
        </Link>

        {/* Acciones (Derecha) */}
        <div className="hidden md:flex items-center gap-6 flex-shrink-0">

          <Link
            href="/"
            className="text-base text-slate-200 hover:text-white font-semibold transition-colors"
          >
            Explorar
          </Link>

          <Link
            href="/login"
            className="px-5 py-2.5 text-base font-semibold text-slate-100 border border-slate-600 rounded-lg hover:bg-slate-700 transition-all"
          >
            Ingresar
          </Link>

          <Link
            href="/register"
            className="px-5 py-2.5 bg-emerald-500 text-white text-base font-bold rounded-lg hover:bg-emerald-400 transition-all"
          >
            Vende en StoreHub
          </Link>


        </div>

        {/* Menu Movil */}
        <div className="md:hidden flex items-center gap-4">
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
              href="/"
              className="text-lg font-medium text-slate-200 py-2 border-b border-slate-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Explorar Tiendas
            </Link>

            <Link
              href="/login"
              className="w-full text-left py-3 text-lg font-medium text-slate-200 border-b border-slate-700"
            >
              Ingresar
            </Link>

            <Link
              href="/register"
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
