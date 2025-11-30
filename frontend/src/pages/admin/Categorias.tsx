import { PageHeader } from '../../components/PageHeader';

export const CategoriasPage = () => {
  return (
    <div className="p-8">
      <PageHeader 
        title="Categorías" 
        description="Organiza tus productos por categorías"
      />
      <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
        <p className="text-slate-600">Página de Categorías</p>
      </div>
    </div>
  );
};
