import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import { shopsService } from '../../services/shops.service';
import { Store, Image as ImageIcon, MapPin, FileText, Upload, Check } from 'lucide-react';
import { Button, TextField, CircularProgress } from '@mui/material';

export const ConfiguracionPage = () => {
  const { activeShop } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [shopData, setShopData] = useState({
    storeName: '',
    location: '',
    description: '',
    imageUrl: ''
  });
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  useEffect(() => {
    if (activeShop) {
      loadShopData();
    }
  }, [activeShop]);

  const loadShopData = async () => {
    if (!activeShop) return;
    
    setLoading(true);
    try {
      const data = await shopsService.getShopBySlug(activeShop.slug);
      setShopData({
        storeName: data.storeName || '',
        location: data.location || '',
        description: data.description || '',
        imageUrl: data.imageUrl || ''
      });
    } catch (err: any) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadLogo = async () => {
    if (!logoFile || !activeShop) return;

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const result = await shopsService.uploadShopLogo(activeShop.slug, logoFile);
      setShopData({ ...shopData, imageUrl: result.imageUrl });
      setSuccess('Logo actualizado exitosamente');
      setLogoFile(null);
      setLogoPreview('');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error al subir logo:', err);
      setError('Error al subir el logo. Intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateShop = async () => {
    if (!activeShop) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await shopsService.updateShop(activeShop.slug, {
        storeName: shopData.storeName,
        location: shopData.location,
        description: shopData.description
      });
      setSuccess('Configuración actualizada exitosamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error al actualizar:', err);
      setError('Error al actualizar la configuración');
    } finally {
      setLoading(false);
    }
  };

  if (!activeShop) {
    return (
      <div>
        <PageHeader 
          title="Configuración" 
          description="Ajustes generales de la tienda"
        />
        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <p className="text-slate-600">Selecciona una tienda para configurar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Configuración" 
        description="Ajustes generales de la tienda"
      />

      {/* Mensajes de éxito/error */}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg alert-animate flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-600" />
          <p className="text-emerald-700 font-medium">{success}</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg alert-animate">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Logo de la Tienda */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden card-animate">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-orange-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Logo de la Tienda</h2>
              <p className="text-sm text-slate-600">Personaliza la imagen de tu tienda</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Preview del logo actual o nuevo */}
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-slate-100 rounded-xl border-2 border-slate-200 flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : shopData.imageUrl ? (
                  <img src={shopData.imageUrl} alt="Logo actual" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Store className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                    <span className="text-xs text-slate-500">Sin logo</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1 space-y-3">
              <p className="text-sm text-slate-600">
                Sube una imagen cuadrada (recomendado 512x512px) en formato PNG, JPG o WEBP
              </p>
              
              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <div className="px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all text-center">
                    <Upload className="w-5 h-5 text-slate-500 mx-auto mb-1" />
                    <span className="text-sm font-medium text-slate-700">
                      {logoFile ? logoFile.name : 'Seleccionar imagen'}
                    </span>
                  </div>
                </label>
                
                {logoFile && (
                  <Button
                    variant="contained"
                    onClick={handleUploadLogo}
                    disabled={uploading}
                    startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <Upload />}
                    sx={{
                      backgroundColor: '#f97316',
                      '&:hover': { backgroundColor: '#ea580c' },
                      fontWeight: 600,
                      px: 3
                    }}
                  >
                    {uploading ? 'Subiendo...' : 'Subir'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información de la Tienda */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden card-animate">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Información de la Tienda</h2>
              <p className="text-sm text-slate-600">Actualiza los detalles principales</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <TextField
            label="Nombre de la Tienda"
            fullWidth
            value={shopData.storeName}
            onChange={(e) => setShopData({ ...shopData, storeName: e.target.value })}
            placeholder="Mi Tienda"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: '#3b82f6' },
                '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
              }
            }}
          />
          
          <TextField
            label="Ubicación"
            fullWidth
            value={shopData.location}
            onChange={(e) => setShopData({ ...shopData, location: e.target.value })}
            placeholder="Ciudad, País"
            InputProps={{
              startAdornment: <MapPin className="w-4 h-4 text-slate-500 mr-2" />
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: '#3b82f6' },
                '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
              }
            }}
          />
          
          <TextField
            label="Descripción"
            fullWidth
            multiline
            rows={3}
            value={shopData.description}
            onChange={(e) => setShopData({ ...shopData, description: e.target.value })}
            placeholder="Describe tu tienda..."
            InputProps={{
              startAdornment: <FileText className="w-4 h-4 text-slate-500 mr-2 self-start mt-3" />
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: '#3b82f6' },
                '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
              }
            }}
          />
          
          <div className="pt-4 flex justify-end">
            <Button
              variant="contained"
              onClick={handleUpdateShop}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Check />}
              sx={{
                backgroundColor: '#3b82f6',
                '&:hover': { backgroundColor: '#2563eb' },
                fontWeight: 600,
                px: 4
              }}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      </div>

      {/* Información del Slug (solo lectura) */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl shadow-sm border border-slate-200 p-6 card-animate">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center">
            <Store className="w-4 h-4 text-slate-600" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700">URL de tu tienda</h3>
        </div>
        <p className="text-slate-900 font-mono text-sm">
          storehub.com/<span className="font-bold text-blue-600">{activeShop.slug}</span>
        </p>
      </div>
    </div>
  );
};
