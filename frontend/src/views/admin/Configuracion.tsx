import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import { shopsService } from '../../services/shops.service';
import { configurationsService, Configuration } from '../../services/configurations.service';
import { Store, Image as ImageIcon, MapPin, Upload, Check, Settings, X, AlertTriangle, CheckCircle, DollarSign, Truck } from 'lucide-react';

const CONFIG_KEYS = {
  MIN_PURCHASE_AMOUNT: 'minPurchaseAmount',
  FREE_SHIPPING_THRESHOLD: 'freeShippingThreshold',
};

export const ConfiguracionPage = () => {
  const { activeShop } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [shopData, setShopData] = useState({ storeName: '', location: '', description: '', imageUrl: '' });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');

  const [systemConfigs, setSystemConfigs] = useState({
    [CONFIG_KEYS.MIN_PURCHASE_AMOUNT]: '',
    [CONFIG_KEYS.FREE_SHIPPING_THRESHOLD]: '',
  });

  useEffect(() => {
    if (activeShop) {
      loadShopData();
      loadSystemConfigs();
    }
  }, [activeShop]);

  const loadShopData = async () => {
// ... existing code ...
    if (!activeShop) return;
    setLoading(true);
    try {
      const data = await shopsService.getShopBySlug(activeShop.slug);
      setShopData({ storeName: data.storeName || '', location: data.location || '', description: data.description || '', imageUrl: data.imageUrl || '' });
    } catch { setError('Error al cargar la configuración'); }
    finally { setLoading(false); }
  };

  const loadSystemConfigs = async () => {
    setLoading(true);
    try {
      const configs = await configurationsService.getAll();
      const newConfigs = { ...systemConfigs };
      configs.forEach(c => {
        if (Object.values(CONFIG_KEYS).includes(c.key)) {
          newConfigs[c.key as keyof typeof newConfigs] = c.value.toString();
        }
      });
      setSystemConfigs(newConfigs);
    } catch {
      setError('Error al cargar las configuraciones del sistema.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (key: string, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setSystemConfigs(prev => ({ ...prev, [key]: numericValue }));
  };

  const handleSaveSystemConfigs = async () => {
    setLoading(true); setError(''); setSuccess('');
    try {
      const configsToUpdate = [
        {
          key: CONFIG_KEYS.MIN_PURCHASE_AMOUNT,
          value: parseFloat(systemConfigs[CONFIG_KEYS.MIN_PURCHASE_AMOUNT] || '0') || 0,
          description: 'Monto mínimo de compra para finalizar un pedido.',
          isPublic: true
        },
        {
          key: CONFIG_KEYS.FREE_SHIPPING_THRESHOLD,
          value: parseFloat(systemConfigs[CONFIG_KEYS.FREE_SHIPPING_THRESHOLD] || '0') || 0,
          description: 'Monto a partir del cual el envío es gratuito. 0 para deshabilitar.',
          isPublic: true
        }
      ];
      await configurationsService.upsert(configsToUpdate);
      setSuccess('Configuraciones de sistema guardadas.');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Error al guardar las configuraciones del sistema.');
    } finally {
      setLoading(false);
    }
  };


  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadLogo = async () => {
    if (!logoFile || !activeShop) return;
    setUploading(true); setError(''); setSuccess('');
    try {
      const result = await shopsService.uploadShopLogo(activeShop.slug, logoFile);
      setShopData({ ...shopData, imageUrl: result.imageUrl });
      setSuccess('Logo actualizado exitosamente');
      setLogoFile(null); setLogoPreview('');
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Error al subir el logo'); }
    finally { setUploading(false); }
  };

  const handleUpdateShop = async () => {
    if (!activeShop) return;
    setLoading(true); setError(''); setSuccess('');
    try {
      await shopsService.updateShop(activeShop.slug, { storeName: shopData.storeName, location: shopData.location, description: shopData.description });
      setSuccess('Configuración actualizada exitosamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Error al actualizar la configuración'); }
    finally { setLoading(false); }
  };

  if (!activeShop) {
    return (
      <div className="space-y-6">
        <PageHeader title="Configuración" description="Ajustes generales de la tienda" />
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <Settings className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Selecciona una tienda para configurar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <PageHeader title="Configuración" description={`Administración de "${activeShop.name || 'Tienda'}"`} />

      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />{success}
          <button onClick={() => setSuccess('')} className="ml-auto hover:bg-emerald-100 rounded p-1 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />{error}
          <button onClick={() => setError('')} className="ml-auto hover:bg-red-100 rounded p-1 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Logo */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-orange-50 to-white flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center"><ImageIcon className="w-5 h-5 text-orange-600" /></div>
          <div><h2 className="text-lg font-bold text-slate-900">Logo de la Tienda</h2><p className="text-sm text-slate-500">Imagen visible en tu storefront</p></div>
        </div>
        <div className="p-6 flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="w-40 h-40 bg-slate-100 rounded-xl border-2 border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
            {logoPreview ? (
              <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
            ) : shopData.imageUrl ? (
              <img src={shopData.imageUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-4"><Store className="w-12 h-12 text-slate-300 mx-auto mb-2" /><span className="text-xs text-slate-400 font-medium">Sin logo</span></div>
            )}
          </div>
          <div className="flex-1 space-y-4 w-full">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-600">
              <p className="font-medium mb-1">Recomendaciones:</p>
              <ul className="list-disc list-inside space-y-1 ml-1 text-slate-500">
                <li>Formato cuadrado (1:1)</li>
                <li>Mínimo 512x512 pixeles</li>
                <li>Archivos PNG o JPG (máx 5MB)</li>
              </ul>
            </div>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">
                <Upload className="w-4 h-4" />Seleccionar Archivo
                <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
              </label>
              {logoFile && (
                <button onClick={handleUploadLogo} disabled={uploading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-all disabled:opacity-50 cursor-pointer shadow-sm">
                  {uploading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Subiendo...</> : <><Check className="w-4 h-4" />Actualizar Logo</>}
                </button>
              )}
            </div>
            {logoFile && <p className="text-sm text-emerald-600 font-medium">Archivo seleccionado: {logoFile.name}</p>}
          </div>
        </div>
      </div>

      {/* Info General */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><Store className="w-5 h-5 text-blue-600" /></div>
          <div><h2 className="text-lg font-bold text-slate-900">Información General</h2><p className="text-sm text-slate-500">Detalles básicos de tu comercio</p></div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre de la Tienda</label>
              <input type="text" value={shopData.storeName} onChange={(e) => setShopData({ ...shopData, storeName: e.target.value })}
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Ubicación</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" value={shopData.location} onChange={(e) => setShopData({ ...shopData, location: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción</label>
            <textarea rows={3} value={shopData.description} onChange={(e) => setShopData({ ...shopData, description: e.target.value })} placeholder="Describe tu negocio..."
              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none" />
          </div>
          <div className="pt-2 flex justify-end">
            <button onClick={handleUpdateShop} disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all disabled:opacity-50 cursor-pointer shadow-sm">
              {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Guardando...</> : <><Check className="w-4 h-4" />Guardar Cambios</>}
            </button>
          </div>
        </div>
      </div>

      {/* Config Sistema */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center"><Settings className="w-5 h-5 text-slate-600" /></div>
          <div><h2 className="text-lg font-bold text-slate-900">Configuraciones</h2><p className="text-sm text-slate-500">Variables de sistema y parámetros</p></div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor={CONFIG_KEYS.MIN_PURCHASE_AMOUNT} className="block text-sm font-medium text-slate-700 mb-1.5">Monto Mínimo de Compra</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id={CONFIG_KEYS.MIN_PURCHASE_AMOUNT}
                  type="text"
                  inputMode="decimal"
                  value={systemConfigs.MIN_PURCHASE_AMOUNT}
                  onChange={(e) => handleConfigChange(CONFIG_KEYS.MIN_PURCHASE_AMOUNT, e.target.value)}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1.5">El valor que el carrito debe superar para finalizar la compra. 0 para desactivar.</p>
            </div>
            <div>
              <label htmlFor={CONFIG_KEYS.FREE_SHIPPING_THRESHOLD} className="block text-sm font-medium text-slate-700 mb-1.5">Envío Gratis a partir de</label>
              <div className="relative">
                <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id={CONFIG_KEYS.FREE_SHIPPING_THRESHOLD}
                  type="text"
                  inputMode="decimal"
                  value={systemConfigs.FREE_SHIPPING_THRESHOLD}
                  onChange={(e) => handleConfigChange(CONFIG_KEYS.FREE_SHIPPING_THRESHOLD, e.target.value)}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1.5">El total del carrito para ofrecer envío gratis. 0 para desactivar.</p>
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <button onClick={handleSaveSystemConfigs} disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-all disabled:opacity-50 cursor-pointer shadow-sm">
              {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Guardando...</> : <><Check className="w-4 h-4" />Guardar Configuraciones</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
