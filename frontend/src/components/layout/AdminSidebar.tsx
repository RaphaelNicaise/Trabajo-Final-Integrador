import {
  LayoutDashboard,
  Store,
  Package,
  Tags,
  ShoppingCart,
  Settings,
  LogOut,
  User,
  BarChart2,
} from 'lucide-react';
import { useState } from 'react';
// Importamos el isotipo correcto
import logoSolo from '../../assets/logosolo.png';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  href?: string;
  badge?: number;
}

const SidebarItem = ({ icon, label, isActive, href = "#", badge }: SidebarItemProps) => {
  return (
    <a
      href={href}
      className={`
        relative flex items-center justify-center w-12 h-12 mt-2 rounded-xl transition-all duration-200 group
        ${isActive 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }
      `}
    >
      {icon}
      
      {/* Badge de notificaciones */}
      {badge && badge > 0 && (
        <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white border-2 border-[#0F172A]">
          {badge}
        </span>
      )}

       <div className="absolute left-16 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg shadow-xl opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 z-50 whitespace-nowrap border border-slate-700 flex items-center">
        
        {/* 1. La flecha va PRIMERO para que se renderice DETRÁS del texto */}
        <div className="absolute left-0 top-1/2 -translate-x-1.5 -translate-y-1/2 w-3 h-3 bg-slate-900 border-l border-b border-slate-700 transform rotate-45"></div>
        
        {/* 2. El texto va SEGUNDO para estar al frente (y con z-10 por seguridad) */}
        <span className="relative z-10">{label}</span>
      </div>
    </a>
  );
};

export const AdminSidebar = () => {
  const [activeRoute, setActiveRoute] = useState('tiendas');

  return (
    // Sidebar principal: overflow-y-visible para permitir que los tooltips salgan del contenedor
    // Si necesitas scroll real en pantallas muy bajas, usa 'overflow-y-auto scrollbar-hide' en una clase custom
    <aside className="flex flex-col items-center w-20 h-screen py-6 bg-[#0F172A] border-r border-slate-800 z-50">
      
      {/* 1. LOGO SUPERIOR */}
       <a href="/" className="flex items-center justify-center w-12 h-12 mb-6 transition-transform hover:scale-110 group relative flex-shrink-0">
        <img src={logoSolo} alt="StoreHub" className="w-10 h-10 object-contain" />
        
        {/* Tooltip del Logo */}
        <div className="absolute left-16 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity border border-slate-700 pointer-events-none whitespace-nowrap flex items-center">
          <div className="absolute left-0 top-1/2 -translate-x-1.5 -translate-y-1/2 w-3 h-3 bg-slate-900 border-l border-b border-slate-700 transform rotate-45 z-10"></div>
          <span className="relative z-20 ml-2">StoreHub Admin</span>
        </div>
      </a>

      {/* Contenedor Flex que ocupa el espacio restante - SIN SCROLLBARS INTERNAS */}
      <div className="flex-1 w-full flex flex-col items-center gap-2">
        
        {/* SECCIÓN PRINCIPAL */}
        <div className="w-full flex flex-col items-center border-t border-slate-800/50 pt-4 gap-2">
          
          <SidebarItem 
            icon={<Store size={24} strokeWidth={1.5} />} 
            label="Mis Tiendas"
            isActive={activeRoute === 'tiendas'}
            href='#tiendas'
          />
          <SidebarItem 
            icon={<LayoutDashboard size={24} strokeWidth={1.5} />} 
            label="Dashboard"
            isActive={activeRoute === 'dashboard'}
            href='#dashboard'
          />
          <SidebarItem 
            icon={<Package size={24} strokeWidth={1.5} />} 
            label="Productos"
            isActive={activeRoute === 'productos'}
            href='#productos'
          />
          <SidebarItem 
            icon={<ShoppingCart size={24} strokeWidth={1.5} />} 
            label="Órdenes"
            isActive={activeRoute === 'ordenes'} 
            badge={3}
            href='#ordenes'
          />
        </div>

        {/* SECCIÓN SECUNDARIA (Empujada hacia abajo si hay espacio, o simplemente a continuación) */}
        <div className="w-full flex flex-col items-center border-t border-slate-800/50 pt-4 mt-auto gap-2">
          <SidebarItem 
            icon={<Tags size={24} strokeWidth={1.5} />} 
            label="Categorías"
            href='#categorias'
            isActive={activeRoute === 'categorias'}
          />
          <SidebarItem 
            icon={<BarChart2 size={24} strokeWidth={1.5} />} 
            label="Analíticas"
            href='#analiticas'
            isActive={activeRoute === 'analiticas'}
          />
          <SidebarItem 
            icon={<Settings size={24} strokeWidth={1.5} />} 
            label="Configuración"
            isActive={activeRoute === 'configuracion'}
            href='#configuracion' 
          />
        </div>
      </div>

      {/* 4. FOOTER (Usuario y Logout) */}
            <div className="flex flex-col items-center w-full pt-4 mt-auto border-t border-slate-800 gap-3 bg-[#0F172A] flex-shrink-0">
        <a 
          href="#" 
          className="relative group flex items-center justify-center w-10 h-10 rounded-full bg-indigo-900/50 text-indigo-200 hover:bg-indigo-600 hover:text-white transition-colors ring-2 ring-transparent hover:ring-indigo-500/30"
        >
          <User size={20} strokeWidth={2} />
          
          {/* Tooltip Usuario CORREGIDO */}
          <div className="absolute left-14 bottom-2 px-5 py-4 bg-slate-900 text-white text-sm font-medium rounded-lg shadow-xl opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 border border-slate-700 whitespace-nowrap z-50">
            {/* Flecha primero */}
            <div className="absolute left-0 bottom-4 -translate-x-1.5 w-3 h-3 bg-slate-900 border-l border-b border-slate-700 transform rotate-45 z-0"></div>
            {/* Texto después */}
            <div className="relative z-10 ml-1">
                <p className="text-xs text-slate-400 mb-1">Logueado como</p>
                <p className="font-bold text-white text-base">Juan Pérez</p>
            </div>
          </div>  
        </a>
        
        <button 
          className="relative group flex items-center justify-center w-10 h-10 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-800"
        >
          <LogOut size={20} strokeWidth={2} />
          
          {/* Tooltip Logout CORREGIDO */}
          <div className="absolute left-14 bottom-0 px-5 py-3 bg-red-900/90 text-red-100 text-sm font-bold rounded-lg shadow-xl opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 border border-red-800 whitespace-nowrap z-50 flex items-center">
            {/* Flecha primero */}
            <div className="absolute left-0 top-1/2 -translate-x-1.5 -translate-y-1/2 w-3 h-3 bg-red-900/90 border-l border-b border-red-800 transform rotate-45 z-0"></div>
            {/* Texto después */}
            <span className="relative z-10 ml-1">Cerrar Sesión</span>
          </div>
        </button>
      </div>
    </aside>
  );
};