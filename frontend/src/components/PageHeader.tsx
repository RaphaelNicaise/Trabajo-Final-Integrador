import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  const { activeShop } = useAuth();

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
    <div className="mb-8 pb-6 border-b border-slate-200 animate-fade-in-down">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
        {activeShop && (
          <>
            <span className="text-2xl text-slate-300">|</span>
            <span className="text-base font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              {activeShop.name}
            </span>
          </>
        )}
      </div>
      {description && (
        <p className="text-slate-600 text-base mt-2">{description}</p>
      )}
    </div>
  );
}
