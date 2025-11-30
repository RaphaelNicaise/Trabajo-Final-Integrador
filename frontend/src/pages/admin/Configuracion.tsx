import { PageHeader } from '../../components/PageHeader';

export const ConfiguracionPage = () => {
  return (
    <div className="p-8">
      <PageHeader 
        title="Configuración" 
        description="Ajustes generales de la tienda"
      />
      <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
        <p className="text-slate-600">Página de Configuración</p>
      </div>
    </div>
  );
};
