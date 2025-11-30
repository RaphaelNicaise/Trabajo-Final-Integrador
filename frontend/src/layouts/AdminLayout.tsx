import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../components/layout/AdminSidebar';

export const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
