import {
  LayoutDashboard,
  Store,
  Package,
  Tags,
  ShoppingCart,
  Settings,
  LogOut,
  User,
} from 'lucide-react';
import { useState } from 'react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: number;
  isActive?: boolean;
}

const NavItem = ({ icon, label, href, badge, isActive }: NavItemProps) => {
  return (
    <a
      href={href}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-md transition-all
        ${
          isActive
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }
      `}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="font-medium">{label}</span>
      {badge && badge > 0 && (
        <span className="ml-auto bg-emerald-500 text-white text-xs font-bold rounded-full h-5 min-w-5 px-2 flex items-center justify-center">
          {badge}
        </span>
      )}
    </a>
  );
};

export const AdminSidebar = () => {
  const [activeRoute] = useState('dashboard');

  return (
    <div className="flex h-screen bg-slate-900 text-white w-64 flex-col">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white">
          StoreHub <span className="text-slate-400 font-normal text-sm">Admin</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <NavItem
          icon={<LayoutDashboard size={20} strokeWidth={2} />}
          label="Dashboard"
          href="#dashboard"
          isActive={activeRoute === 'dashboard'}
        />
        <NavItem
          icon={<Store size={20} strokeWidth={2} />}
          label="Mis Tiendas"
          href="#tiendas"
          isActive={activeRoute === 'tiendas'}
        />
        <NavItem
          icon={<Package size={20} strokeWidth={2} />}
          label="Productos"
          href="#productos"
          isActive={activeRoute === 'productos'}
        />
        <NavItem
          icon={<Tags size={20} strokeWidth={2} />}
          label="Categorías"
          href="#categorias"
          isActive={activeRoute === 'categorias'}
        />
        <NavItem
          icon={<ShoppingCart size={20} strokeWidth={2} />}
          label="Órdenes"
          href="#ordenes"
          badge={12}
          isActive={activeRoute === 'ordenes'}
        />
        <NavItem
          icon={<Settings size={20} strokeWidth={2} />}
          label="Configuración"
          href="#configuracion"
          isActive={activeRoute === 'configuracion'}
        />
      </nav>

      {/* Footer - User Profile */}
      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-md hover:bg-slate-800 transition-colors cursor-pointer">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
            <User size={20} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">Juan Pérez</p>
            <p className="text-xs text-slate-400 truncate">juan@example.com</p>
          </div>
        </div>
        <button className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition-all active:scale-95">
          <LogOut size={20} strokeWidth={2} />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};
