import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { ReactNode } from 'react';

interface ShopGuardProps {
  children: ReactNode;
}

export function ShopGuard({ children }: ShopGuardProps) {
  const { activeShop } = useAuth();
  const location = useLocation();

  if (!activeShop && location.pathname !== '/admin' && location.pathname !== '/admin/tiendas') {
    return <Navigate to="/admin/tiendas" replace />;
  }

  return <>{children}</>;
}
