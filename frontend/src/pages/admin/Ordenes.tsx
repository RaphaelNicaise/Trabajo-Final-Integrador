import { PageHeader } from '../../components/PageHeader';

export const OrdenesPage = () => {
  return (
    <div className="p-8">
      <PageHeader 
        title="Órdenes" 
        description="Administra los pedidos de tus clientes"
      />
      <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
        <p className="text-slate-600">Página de Órdenes</p>
      </div>
    </div>
  );
};
