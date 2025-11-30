import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { ReactNode } from 'react';

interface ShopGuardProps {
  children: ReactNode;
}

export function ShopGuard({ children }: ShopGuardProps) {
  const { activeShop } = useAuth();
  const location = useLocation();

  // Si no hay tienda activa y no estamos en la página de selección de tiendas
  if (!activeShop && location.pathname !== '/admin' && location.pathname !== '/admin/tiendas') {
    return <Navigate to="/admin/tiendas" replace />;
  }

  return <>{children}</>;
}

// Componente alternativo: Mensaje de advertencia en lugar de redirección
export function ShopRequiredMessage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-amber-600"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">
          Selecciona una tienda
        </h2>
        <p className="text-slate-600 mb-6">
          Para acceder a esta funcionalidad, primero debes seleccionar una tienda desde el panel de administración.
        </p>
        <a
          href="/admin/tiendas"
          className="inline-block px-6 py-3 bg-emerald-500 text-white font-semibold rounded-md hover:bg-emerald-600 transition-all shadow-sm"
        >
          Ir a Mis Tiendas
        </a>
      </div>
    </div>
  );
}
