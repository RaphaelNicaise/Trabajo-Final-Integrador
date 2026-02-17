import {
  LayoutDashboard,
  Store,
  Package,
  Tags,
  ShoppingCart,
  Settings,
  LogOut,
  User,
  Users,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  to: string;
  badge?: number;
  disabled?: boolean;
}

const SidebarItem = ({ icon, label, isActive, to, badge, disabled = false }: SidebarItemProps) => {
  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
    }
  };

  return (
    <Link
      href={disabled ? '#' : to}
      onClick={handleClick}
      className={`
        relative flex items-center justify-center w-12 h-12 mt-2 rounded-xl transition-all duration-200 group
        ${disabled
          ? 'opacity-40 cursor-not-allowed text-slate-600'
          : isActive
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 cursor-pointer'
            : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:shadow-md cursor-pointer'
        }
      `}
    >
      {icon}

      {badge && badge > 0 && !disabled && (
        <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white border-2 border-[#0F172A]">
          {badge}
        </span>
      )}

      <div className={`absolute left-16 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg shadow-xl opacity-0 -translate-x-2 pointer-events-none ${!disabled && 'group-hover:opacity-100 group-hover:translate-x-0'} transition-all duration-200 z-50 whitespace-nowrap border border-slate-700 flex items-center`}>
        <div className="absolute left-0 top-1/2 -translate-x-1.5 -translate-y-1/2 w-3 h-3 bg-slate-900 border-l border-b border-slate-700 transform rotate-45"></div>
        <span className="relative z-10">{disabled ? 'Selecciona una tienda' : label}</span>
      </div>
    </Link>
  );
};

export const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, activeShop, logout, clearActiveShop } = useAuth();
  const [showShopMenu, setShowShopMenu] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleChangeShop = () => {
    clearActiveShop();
    router.push('/admin/tiendas');
  };

  const getActiveRoute = () => {
    const path = pathname;
    if (path.includes('/tiendas')) return 'tiendas';
    if (path.includes('/dashboard')) return 'dashboard';
    if (path.includes('/productos')) return 'productos';
    if (path.includes('/ordenes')) return 'ordenes';
    if (path.includes('/categorias')) return 'categorias';
    if (path.includes('/configuracion')) return 'configuracion';
    if (path.includes('/usuarios')) return 'usuarios';
    return 'tiendas';
  };

  const activeRoute = getActiveRoute();

  return (
    <aside className="flex flex-col items-center w-20 min-h-screen py-6 bg-[#0F172A] border-r border-slate-800 z-50">

      <div className="flex flex-col items-center w-full mb-6 flex-shrink-0">
        {activeShop ? (
          <div className="relative group">
            <button
              onClick={() => setShowShopMenu(!showShopMenu)}
              className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 transition-all shadow-lg cursor-pointer hover:shadow-emerald-500/50 hover:-translate-y-0.5"
            >
              <Store size={20} className="text-white mb-1" strokeWidth={2} />
              <ChevronDown size={12} className="text-white" strokeWidth={2} />
            </button>

            <div className="absolute left-16 px-4 py-3 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity border border-slate-700 pointer-events-none whitespace-nowrap flex flex-col">
              <div className="absolute left-0 top-1/2 -translate-x-1.5 -translate-y-1/2 w-3 h-3 bg-slate-900 border-l border-b border-slate-700 transform rotate-45"></div>
              <span className="relative z-10 text-slate-400">Tienda activa:</span>
              <span className="relative z-10 font-bold text-white">{activeShop.name}</span>
            </div>

            {showShopMenu && (
              <div className="absolute left-16 top-0 bg-slate-900 rounded-lg shadow-xl border border-slate-700 py-2 w-48 z-50">
                <div className="px-4 py-2 border-b border-slate-700">
                  <p className="text-xs text-slate-400">Tienda actual</p>
                  <p className="text-sm font-bold text-white truncate">{activeShop.name}</p>
                </div>
                <button
                  onClick={handleChangeShop}
                  className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                >
                  Cambiar tienda
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/admin/tiendas"
            className="flex items-center justify-center w-12 h-12 transition-all hover:scale-110 group relative cursor-pointer hover:-translate-y-1 hover:shadow-lg"
          >
            <Store size={28} className="text-emerald-500" />

            <div className="absolute left-16 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity border border-slate-700 pointer-events-none whitespace-nowrap flex items-center">
              <div className="absolute left-0 top-1/2 -translate-x-1.5 -translate-y-1/2 w-3 h-3 bg-slate-900 border-l border-b border-slate-700 transform rotate-45 z-10"></div>
              <span className="relative z-20 ml-2">Seleccionar Tienda</span>
            </div>
          </Link>
        )}
      </div>

      <div className="flex-1 w-full flex flex-col items-center gap-2">

        <div className="w-full flex flex-col items-center border-t border-slate-800/50 pt-4 gap-2">

          <SidebarItem
            icon={<Store size={24} strokeWidth={1.5} />}
            label="Mis Tiendas"
            isActive={activeRoute === 'tiendas'}
            to="/admin/tiendas"
          />
          <SidebarItem
            icon={<LayoutDashboard size={24} strokeWidth={1.5} />}
            label="Dashboard"
            isActive={activeRoute === 'dashboard'}
            to="/admin/dashboard"
            disabled={!activeShop}
          />
          <SidebarItem
            icon={<Package size={24} strokeWidth={1.5} />}
            label="Productos"
            isActive={activeRoute === 'productos'}
            to="/admin/productos"
            disabled={!activeShop}
          />
          <SidebarItem
            icon={<ShoppingCart size={24} strokeWidth={1.5} />}
            label="Ordenes"
            isActive={activeRoute === 'ordenes'}
            badge={3}
            to="/admin/ordenes"
            disabled={!activeShop}
          />
        </div>

        <div className="w-full flex flex-col items-center border-t border-slate-800/50 pt-4 mt-auto gap-2">
          <SidebarItem
            icon={<Tags size={24} strokeWidth={1.5} />}
            label="Categorias"
            to="/admin/categorias"
            isActive={activeRoute === 'categorias'}
            disabled={!activeShop}
          />
          <SidebarItem
            icon={<Users size={24} strokeWidth={1.5} />}
            label="Usuarios"
            isActive={activeRoute === 'usuarios'}
            to="/admin/usuarios"
            disabled={!activeShop}
          />
          <SidebarItem
            icon={<Settings size={24} strokeWidth={1.5} />}
            label="Configuracion"
            isActive={activeRoute === 'configuracion'}
            to="/admin/configuracion"
            disabled={!activeShop}
          />
        </div>
      </div>

      <div className="flex flex-col items-center w-full pt-4 mt-auto border-t border-slate-800 gap-3 bg-[#0F172A] flex-shrink-0">
        <div
          className="relative group flex items-center justify-center w-10 h-10 rounded-full bg-indigo-900/50 text-indigo-200 hover:bg-indigo-600 hover:text-white transition-all ring-2 ring-transparent hover:ring-indigo-500/30 cursor-pointer hover:shadow-md hover:-translate-y-0.5"
        >
          <User size={20} strokeWidth={2} />

          <div className="absolute left-14 bottom-2 px-5 py-4 bg-slate-900 text-white text-sm font-medium rounded-lg shadow-xl opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 border border-slate-700 whitespace-nowrap z-50">
            <div className="absolute left-0 bottom-4 -translate-x-1.5 w-3 h-3 bg-slate-900 border-l border-b border-slate-700 transform rotate-45 z-0"></div>
            <div className="relative z-10 ml-1">
              <p className="text-xs text-slate-400 mb-1">Logueado como</p>
              <p className="font-bold text-white text-base">{user?.name || 'Usuario'}</p>
              <p className="text-xs text-slate-400 mt-1">{user?.email || ''}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="relative group flex items-center justify-center w-10 h-10 text-slate-500 hover:text-red-400 transition-all rounded-lg hover:bg-slate-800 cursor-pointer hover:shadow-md hover:-translate-y-0.5"
        >
          <LogOut size={20} strokeWidth={2} />

          <div className="absolute left-14 bottom-0 px-5 py-3 bg-red-900/90 text-red-100 text-sm font-bold rounded-lg shadow-xl opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 border border-red-800 whitespace-nowrap z-50 flex items-center">
            <div className="absolute left-0 top-1/2 -translate-x-1.5 -translate-y-1/2 w-3 h-3 bg-red-900/90 border-l border-b border-red-800 transform rotate-45 z-0"></div>
            <span className="relative z-10 ml-1">Cerrar Sesion</span>
          </div>
        </button>
      </div>
    </aside>
  );
};
