import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { shopsService } from '../../services/shops.service';
import { Store, Plus, X, ArrowRight, Trash2 } from 'lucide-react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

interface Shop {
  id: string;
  slug: string;
  name: string;
  location?: string;
  description?: string;
  role: string;
}

export const TiendasPage = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [shopToDelete, setShopToDelete] = useState<Shop | null>(null);
  const { user, selectShop, clearActiveShop } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Limpiar la tienda activa al entrar a esta página
    clearActiveShop();
    loadShops();
    
    // Actualizar título del documento
    document.title = 'Mis Tiendas | StoreHub';
    
    return () => {
      document.title = 'StoreHub';
    };
  }, []);

  const loadShops = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const data = await shopsService.getUserShops(user.id);
      setShops(data);
    } catch (err: any) {
      console.error('Error al cargar tiendas:', err);
      setError('Error al cargar las tiendas. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectShop = (shop: Shop) => {
    selectShop({
      id: shop.id,
      slug: shop.slug,
      name: shop.name,
      role: shop.role,
    });
    navigate('/admin/dashboard');
  };

  const handleCreateShop = () => {
    setShowModal(true);
  };

  const handleDeleteClick = (shop: Shop) => {
    setShopToDelete(shop);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!shopToDelete) return;

    try {
      await shopsService.deleteShop(shopToDelete.slug);
      setShowDeleteModal(false);
      setShopToDelete(null);
      // Recargar la lista de tiendas
      await loadShops();
    } catch (err: any) {
      console.error('Error al eliminar tienda:', err);
      setError('Error al eliminar la tienda. Intenta de nuevo.');
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 flex flex-col items-center justify-start">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        {/* Header */}
        <div className="mb-8 w-full text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Mis Tiendas</h1>
          <p className="text-slate-600">
            Selecciona una tienda para administrar o crea una nueva
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12 w-full flex flex-col items-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-600">Cargando tiendas...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-6 w-full">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadShops}
              className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Lista de Tiendas */}
        {!loading && !error && (
          <div className="w-full flex flex-col items-center gap-6">
            {/* Tarjetas de Tiendas */}
            <div className="w-full flex flex-col items-center gap-4">
              {shops.map((shop) => (
                <div
                  key={shop.id}
                  className="w-full max-w-2xl bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-200 p-6 flex items-center justify-between gap-6 mx-auto group relative"
                  style={{ minHeight: '110px' }}
                >
                  <div className="flex items-center gap-5 flex-1">
                    <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-emerald-200 group-hover:border-emerald-400 transition-all">
                      <Store className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-slate-800 text-xl truncate group-hover:text-emerald-700 transition-colors">
                          {shop.name}
                        </h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded group-hover:bg-blue-200 transition-colors flex-shrink-0">
                          {shop.role === 'owner' ? 'Propietario' : 'Admin'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">@{shop.slug}</span>
                      <div className="flex flex-wrap items-center gap-4 mt-2">
                        {shop.location && (
                          <span className="inline-block text-sm text-slate-600 bg-slate-100 rounded px-2 py-1">
                            {shop.location}
                          </span>
                        )}
                        {shop.description && (
                          <span className="inline-block text-sm text-slate-600 truncate max-w-[180px] bg-slate-50 rounded px-2 py-1">
                            {shop.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteClick(shop)}
                      className="p-2 text-red-500 hover:bg-red-100 rounded-md transition-all active:scale-95 border border-transparent hover:border-red-300"
                      title="Eliminar tienda"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleSelectShop(shop)}
                      className="px-6 py-2.5 bg-emerald-500 text-white font-semibold rounded-md hover:bg-emerald-600 transition-all flex items-center gap-2 active:scale-95 flex-shrink-0 shadow group-hover:shadow-md"
                    >
                      Administrar
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Chiche visual: Glow al hover */}
                  <div className="absolute inset-0 rounded-xl pointer-events-none group-hover:ring-2 group-hover:ring-emerald-300 transition-all"></div>
                </div>
              ))}
            </div>
            {/* Botón Crear Nueva Tienda */}
            <div className="w-full flex items-center justify-center mt-6">
              <button
                onClick={handleCreateShop}
                className="w-full max-w-2xl bg-white border-2 border-dashed border-slate-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all p-6 flex items-center justify-center gap-3 group"
              >
                <div className="w-12 h-12 bg-slate-100 group-hover:bg-emerald-100 rounded-full flex items-center justify-center transition-colors">
                  <Plus className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-slate-700 group-hover:text-emerald-700 mb-1">
                    Crear Nueva Tienda
                  </h3>
                  <p className="text-sm text-slate-500">
                    Comienza a vender en línea
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Crear Tienda */}
      {showModal && (
        <CreateShopModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            loadShops();
          }}
        />
      )}

      {/* Modal Confirmar Eliminación */}
      {showDeleteModal && shopToDelete && (
        <Dialog open onClose={() => { setShowDeleteModal(false); setShopToDelete(null); }} maxWidth="xs" fullWidth>
          <DialogTitle className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 bg-white">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-800">Eliminar Tienda</span>
              <p className="text-sm text-slate-600">Esta accion no se puede deshacer</p>
            </div>
          </DialogTitle>
          <DialogContent className="bg-white px-6 py-4">
            <p className="text-slate-700">
              Estas seguro que quieres eliminar la tienda{' '}
              <span className="font-semibold text-slate-900">"{shopToDelete.name}"</span>?
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Se eliminaran todos los datos asociados a esta tienda.
            </p>
          </DialogContent>
          <DialogActions className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setShopToDelete(null);
              }}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-md hover:bg-slate-100 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmDelete}
              className="flex-1 px-4 py-2.5 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition-all active:scale-95"
            >
              Eliminar
            </button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

// Modal para crear nueva tienda
interface CreateShopModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function CreateShopModal({ onClose, onSuccess }: CreateShopModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Auto-generar slug desde el nombre
  const handleNameChange = (value: string) => {
    setName(value);
    const generatedSlug = value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    setSlug(generatedSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user) {
      setError('Usuario no autenticado');
      setLoading(false);
      return;
    }

    try {
      await shopsService.createShop({
        userId: user.id,
        storeName: name,
        slug,
        location: location || undefined,
        description: description || undefined,
      });
      onSuccess();
    } catch (err: any) {
      console.error('Error al crear tienda:', err);
      setError(
        err.response?.data?.error || 
        'Error al crear la tienda. Intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
        <span className="text-2xl font-bold text-slate-800">Crear Nueva Tienda</span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-6 h-6" />
        </button>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent className="bg-white px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Nombre de la Tienda *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Mi Tienda Online"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">URL de la Tienda (Slug) *</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-sm"
              placeholder="mi-tienda-online"
            />
            <p className="mt-1 text-xs text-slate-500">Tu tienda estará en: storehub.com/{slug || 'tu-slug'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Ubicacion (Opcional)</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Ciudad, Pais"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Descripcion (Opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              placeholder="Describe tu tienda..."
            />
          </div>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </DialogContent>
        <DialogActions className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-md hover:bg-slate-100 transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-emerald-500 text-white font-semibold rounded-md hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando...' : 'Crear Tienda'}
          </button>
        </DialogActions>
      </form>
    </Dialog>
  );

