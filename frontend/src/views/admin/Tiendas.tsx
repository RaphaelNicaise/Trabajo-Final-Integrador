import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { shopsService } from '../../services/shops.service';
import { Store, Plus, X, ArrowRight, Trash2, MapPin, Image as ImageIcon } from 'lucide-react';

interface Shop {
  id: string;
  slug: string;
  name: string;
  location?: string;
  description?: string;
  imageUrl?: string;
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
  const router = useRouter();

  useEffect(() => {
    clearActiveShop();
    loadShops();
    document.title = 'Mis Tiendas | StoreHub';
    return () => { document.title = 'StoreHub'; };
  }, []);

  const loadShops = async () => {
    if (!user) return;
    setLoading(true); setError('');
    try { setShops(await shopsService.getUserShops(user.id)); }
    catch { setError('Error al cargar las tiendas. Intenta de nuevo.'); }
    finally { setLoading(false); }
  };

  const handleSelectShop = (shop: Shop) => {
    selectShop({ id: shop.id, slug: shop.slug, name: shop.name, role: shop.role });
    router.push('/admin/dashboard');
  };

  const handleLeaveShop = async (shop: Shop) => {
    if (!user) return;
    try { await shopsService.removeMember(shop.slug, user.id); await loadShops(); }
    catch { setError('Error al desasociarse de la tienda.'); }
  };

  const handleConfirmDelete = async () => {
    if (!shopToDelete) return;
    try {
      await shopsService.deleteShop(shopToDelete.slug);
      setShowDeleteModal(false); setShopToDelete(null); await loadShops();
    } catch { setError('Error al eliminar la tienda.'); setShowDeleteModal(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 flex flex-col items-center justify-start">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        <div className="mb-8 w-full text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Mis Tiendas</h1>
          <p className="text-slate-600">Selecciona una tienda para administrar o crea una nueva</p>
        </div>

        {loading && (
          <div className="text-center py-12 w-full flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-600">Cargando tiendas...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6 w-full flex items-center justify-between">
            <p className="text-red-600 text-sm">{error}</p>
            <button onClick={loadShops} className="text-sm text-red-700 hover:text-red-800 font-medium cursor-pointer">Reintentar</button>
          </div>
        )}

        {!loading && !error && (
          <div className="w-full flex flex-col items-center gap-6">
            <div className="w-full flex flex-col items-center gap-4">
              {shops.map((shop) => (
                <div key={shop.id}
                  className="w-full max-w-2xl bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-200 p-6 flex items-center justify-between gap-6 mx-auto group relative">
                  <div className="flex items-center gap-5 flex-1">
                    <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-emerald-200 group-hover:border-emerald-400 transition-all overflow-hidden">
                      {shop.imageUrl ? (
                        <img src={shop.imageUrl} alt={shop.name} className="w-full h-full object-cover" />
                      ) : (
                        <Store className="w-8 h-8 text-emerald-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-slate-800 text-xl truncate group-hover:text-emerald-700 transition-colors">{shop.name}</h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded flex-shrink-0">
                          {shop.role === 'owner' ? 'Propietario' : 'Admin'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">@{shop.slug}</span>
                      <div className="flex flex-wrap items-center gap-4 mt-2">
                        {shop.location && <span className="text-sm text-slate-600 bg-slate-100 rounded px-2 py-1">{shop.location}</span>}
                        {shop.description && <span className="text-sm text-slate-600 truncate max-w-[180px] bg-slate-50 rounded px-2 py-1">{shop.description}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {shop.role === 'owner' && (
                      <button onClick={() => { setShopToDelete(shop); setShowDeleteModal(true); }}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-md transition-all border border-transparent hover:border-red-300 cursor-pointer" title="Eliminar tienda">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                    {shop.role === 'admin' && (
                      <button onClick={() => handleLeaveShop(shop)}
                        className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-all border border-red-200 hover:border-red-300 cursor-pointer font-medium">
                        Desasociarse
                      </button>
                    )}
                    <button onClick={() => handleSelectShop(shop)}
                      className="px-6 py-2.5 bg-emerald-500 text-white font-semibold rounded-md hover:bg-emerald-600 transition-all flex items-center gap-2 flex-shrink-0 shadow group-hover:shadow-md cursor-pointer">
                      Administrar<ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute inset-0 rounded-xl pointer-events-none group-hover:ring-2 group-hover:ring-emerald-300 transition-all"></div>
                </div>
              ))}
            </div>

            <div className="w-full flex items-center justify-center mt-6">
              <button onClick={() => setShowModal(true)}
                className="w-full max-w-2xl bg-white border-2 border-dashed border-slate-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all p-6 flex items-center justify-center gap-3 group cursor-pointer">
                <div className="w-12 h-12 bg-slate-100 group-hover:bg-emerald-100 rounded-full flex items-center justify-center transition-colors">
                  <Plus className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-slate-700 group-hover:text-emerald-700 mb-1">Crear Nueva Tienda</h3>
                  <p className="text-sm text-slate-500">Comienza a vender en línea</p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && <CreateShopModal onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); loadShops(); }} />}

      {showDeleteModal && shopToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowDeleteModal(false); setShopToDelete(null); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-5 h-5 text-red-600" /></div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Eliminar Tienda</h3>
              <p className="text-sm text-slate-500">¿Eliminar <strong className="text-slate-700">&quot;{shopToDelete.name}&quot;</strong>?</p>
              <p className="text-xs text-slate-400 mt-2">Se eliminarán todos los datos asociados. Esta acción no se puede deshacer.</p>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button onClick={() => { setShowDeleteModal(false); setShopToDelete(null); }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer">Cancelar</button>
              <button onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all cursor-pointer shadow-sm">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface CreateShopModalProps { onClose: () => void; onSuccess: () => void; }

function CreateShopModal({ onClose, onSuccess }: CreateShopModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    if (!user) { setError('Usuario no autenticado'); setLoading(false); return; }
    try {
      await shopsService.createShop({ userId: user.id, storeName: name, slug, location: location || undefined, description: description || undefined });
      if (logoFile) { try { await shopsService.uploadShopLogo(slug, logoFile); } catch {} }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear la tienda.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><Store className="w-5 h-5 text-emerald-600" /></div>
            <div><h2 className="text-lg font-bold text-slate-900">Crear Nueva Tienda</h2><p className="text-xs text-slate-500">Comienza a vender en línea</p></div>
            <button onClick={onClose} className="ml-auto p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"><X className="w-5 h-5 text-slate-400" /></button>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-5">
            {/* Info Basica */}
            <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
              <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center"><Store className="w-3.5 h-3.5 text-blue-600" /></div>
              <h3 className="text-sm font-semibold text-slate-900">Información Básica</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre de la Tienda *</label>
              <input type="text" value={name} onChange={(e) => handleNameChange(e.target.value)} required placeholder="Mi Tienda Online"
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">URL (Slug) *</label>
              <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="mi-tienda-online"
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono" />
              <p className="mt-1.5 text-xs text-slate-500">Tu tienda estará en: storehub.com/<strong>{slug || 'tu-slug'}</strong></p>
            </div>

            {/* Detalles */}
            <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
              <div className="w-7 h-7 bg-cyan-100 rounded-lg flex items-center justify-center"><MapPin className="w-3.5 h-3.5 text-cyan-600" /></div>
              <h3 className="text-sm font-semibold text-slate-900">Detalles Adicionales</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Ubicación (Opcional)</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ciudad, País"
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción (Opcional)</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe tu tienda..."
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none" />
            </div>

            {/* Logo */}
            <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
              <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center"><ImageIcon className="w-3.5 h-3.5 text-orange-600" /></div>
              <h3 className="text-sm font-semibold text-slate-900">Logo (Opcional)</h3>
            </div>
            <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer border border-slate-200 rounded-lg" />
            {logoFile && <p className="text-sm text-emerald-600 font-medium">✓ {logoFile.name}</p>}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg transition-all cursor-pointer">Cancelar</button>
              <button type="submit" disabled={loading}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm">
                {loading ? 'Creando...' : 'Crear Tienda'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
