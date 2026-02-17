'use client';

import { useAuth } from '../contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import type { ReactNode } from 'react';

interface ShopGuardProps {
  children: ReactNode;
}

export function ShopGuard({ children }: ShopGuardProps) {
  const { activeShop } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!activeShop && pathname !== '/admin' && pathname !== '/admin/tiendas') {
      router.replace('/admin/tiendas');
    }
  }, [activeShop, pathname, router]);

  if (!activeShop && pathname !== '/admin' && pathname !== '/admin/tiendas') {
    return null;
  }

  return <>{children}</>;
}
