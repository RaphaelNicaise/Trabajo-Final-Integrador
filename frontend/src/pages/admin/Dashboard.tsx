import { PageHeader } from '../../components/PageHeader';

export const DashboardPage = () => {
  return (
    <div className="p-8">
      <PageHeader 
        title="Dashboard" 
        description="Resumen y métricas de tu tienda"
      />
      <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
        <p className="text-slate-600">Página de Dashboard</p>
      </div>
    </div>
  );
};
