import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import { shopsService } from '../../services/shops.service';
import {
  Trash2, UserPlus, Shield, User, Mail, ShieldCheck, Search, ChevronLeft, ChevronRight, X, AlertTriangle, CheckCircle
} from 'lucide-react';

const ROWS_PER_PAGE = 8;

interface Member {
  userId: string;
  name: string;
  email: string;
  role: 'owner' | 'admin';
}

export const UsuariosPage = () => {
  const { activeShop } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [addError, setAddError] = useState('');
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [deletingMember, setDeletingMember] = useState(false);

  useEffect(() => { if (activeShop) loadMembers(); }, [activeShop]);
  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const loadMembers = async () => {
    if (!activeShop) return;
    setLoading(true); setError('');
    try { setMembers(await shopsService.getMembers(activeShop.slug)); }
    catch { setError('Error al cargar la lista de usuarios.'); }
    finally { setLoading(false); }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShop || !newMemberEmail.trim()) return;
    setAddingMember(true); setAddError('');
    try {
      await shopsService.addMember(activeShop.slug, newMemberEmail);
      setSuccess('Usuario agregado exitosamente');
      setShowAddModal(false); setNewMemberEmail(''); loadMembers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setAddError(err.response?.data?.error || 'Error al agregar el usuario.');
    } finally { setAddingMember(false); }
  };

  const handleDeleteMember = async () => {
    if (!activeShop || !memberToDelete) return;
    setDeletingMember(true);
    try {
      await shopsService.removeMember(activeShop.slug, memberToDelete.userId);
      setSuccess('Usuario eliminado exitosamente');
      setShowDeleteModal(false); setMemberToDelete(null); loadMembers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al eliminar el usuario.');
    } finally { setDeletingMember(false); }
  };

  const isOwner = activeShop?.role === 'owner';

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return members.filter(m => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
  }, [members, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  if (!activeShop) {
    return (
      <div className="space-y-6">
        <PageHeader title="Usuarios" description="Gestiona el acceso a tu tienda" />
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <User className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Selecciona una tienda para gestionar sus usuarios.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Usuarios y Permisos" description={`Gestiona el equipo de "${activeShop.name}"`} />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Buscar por nombre o email..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500 bg-indigo-50 px-3 py-1.5 rounded-full">{members.length} usuario{members.length !== 1 ? 's' : ''}</span>
          {isOwner && (
            <button onClick={() => { setShowAddModal(true); setAddError(''); setNewMemberEmail(''); }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer">
              <UserPlus className="w-4 h-4" />Invitar Miembro
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />{error}
          <button onClick={() => setError('')} className="ml-auto hover:bg-red-100 rounded p-1 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />{success}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Usuario</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rol</th>
                {isOwner && <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={isOwner ? 4 : 3} className="text-center py-16">
                  <div className="inline-flex items-center gap-3 text-slate-500">
                    <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />Cargando...
                  </div>
                </td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={isOwner ? 4 : 3} className="text-center py-16">
                  <User className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">No se encontraron miembros</p>
                </td></tr>
              ) : paginated.map((member) => (
                <tr key={member.userId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${member.role === 'owner' ? 'bg-orange-500' : 'bg-blue-500'}`}>
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-900 text-sm">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />{member.email}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {member.role === 'owner' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                        <ShieldCheck className="w-3 h-3" />Propietario
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                        <Shield className="w-3 h-3" />Administrador
                      </span>
                    )}
                  </td>
                  {isOwner && (
                    <td className="px-4 py-3 text-center">
                      {member.role !== 'owner' && (
                        <button onClick={() => { setMemberToDelete(member); setShowDeleteModal(true); }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer" title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > ROWS_PER_PAGE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
            <span className="text-xs text-slate-500">{(currentPage - 1) * ROWS_PER_PAGE + 1}&ndash;{Math.min(currentPage * ROWS_PER_PAGE, filtered.length)} de {filtered.length}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-md text-xs font-medium transition-all cursor-pointer ${page === currentPage ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>{page}</button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Agregar */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><UserPlus className="w-5 h-5 text-blue-600" /></div>
                <div><h2 className="text-lg font-bold text-slate-900">Invitar Administrador</h2><p className="text-xs text-slate-500">El usuario debe estar registrado</p></div>
                <button onClick={() => setShowAddModal(false)} className="ml-auto p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"><X className="w-5 h-5 text-slate-400" /></button>
              </div>
            </div>
            <form onSubmit={handleAddMember}>
              <div className="px-6 py-5 space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" placeholder="usuario@ejemplo.com" value={newMemberEmail} autoFocus required
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
                {addError && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />{addError}
                  </div>
                )}
                <div className="flex items-center justify-end gap-3">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer">Cancelar</button>
                  <button type="submit" disabled={addingMember || !newMemberEmail.trim()}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm">
                    {addingMember ? 'Agregando...' : 'Invitar'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {showDeleteModal && memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowDeleteModal(false); setMemberToDelete(null); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-5 h-5 text-red-600" /></div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Eliminar Acceso</h3>
              <p className="text-sm text-slate-500">¿Quitar acceso de administrador a este usuario?</p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600 text-sm">
                {memberToDelete.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">{memberToDelete.name}</p>
                <p className="text-xs text-slate-500">{memberToDelete.email}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-5 text-center">Su cuenta personal permanecerá intacta.</p>
            <div className="flex items-center gap-3">
              <button onClick={() => { setShowDeleteModal(false); setMemberToDelete(null); }} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer">Cancelar</button>
              <button onClick={handleDeleteMember} disabled={deletingMember}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all disabled:opacity-50 cursor-pointer shadow-sm">
                {deletingMember ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
