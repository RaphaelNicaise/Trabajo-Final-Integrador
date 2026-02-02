import { PageHeader } from '../../components/PageHeader';

export const UsuariosPage = () => {
  return (
    <div>
      <PageHeader 
        title="Usuarios" 
        description="Gestiona los usuarios y permisos"
      />
      <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
        <p className="text-slate-600">Página de Usuarios</p>
      </div>
    </div>
  );
};
