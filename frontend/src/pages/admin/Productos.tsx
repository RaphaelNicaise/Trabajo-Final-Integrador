import { PageHeader } from '../../components/PageHeader';

export const ProductosPage = () => {
  return (
    <div className="p-8">
      <PageHeader 
        title="Productos" 
        description="Gestiona el catálogo de productos"
      />
      <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
        <p className="text-slate-600">Página de Productos</p>
      </div>
    </div>
  );
};
