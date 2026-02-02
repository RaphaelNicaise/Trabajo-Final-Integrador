import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  const { activeShop } = useAuth();

  // Actualizar el título del documento
  useEffect(() => {
    if (activeShop) {
      document.title = `${title} - ${activeShop.name} | StoreHub`;
    } else {
      document.title = `${title} | StoreHub`;
    }

    return () => {
      document.title = 'StoreHub';
    };
  }, [title, activeShop]);

  return (
    <div className="mb-8 pb-6 border-b border-slate-200 page-header-animate">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-4xl font-bold text-slate-800 title-animate">{title}</h1>
        {activeShop && (
          <>
            <span className="text-2xl text-slate-300">|</span>
            <span className="text-lg font-semibold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200 shop-badge-animate shadow-sm">
              {activeShop.name}
            </span>
          </>
        )}
      </div>
      {description && (
        <p className="text-slate-600 text-base description-animate">{description}</p>
      )}
    </div>
  );
}
