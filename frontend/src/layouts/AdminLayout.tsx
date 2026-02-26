import { AdminSidebar } from '../components/layout/AdminSidebar';
import { useState } from 'react';
import { Menu } from 'lucide-react';

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile hamburger button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#0F172A] text-white rounded-lg shadow-lg cursor-pointer"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:sticky top-0 h-screen z-50
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pt-16 md:pt-6">
          {children}
        </div>
      </main>
    </div>
  );
};
