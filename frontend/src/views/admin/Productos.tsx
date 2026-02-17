import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { productsService } from '../../services/products.service';
import type { Product } from '../../services/products.service';
import { categoriesService } from '../../services/categories.service';
import type { Category } from '../../services/categories.service';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Chip,
  Autocomplete,
} from '@mui/material';
import { Trash2, Edit, Plus, Package, DollarSign, Box, Tag, Image as ImageIcon } from 'lucide-react';

export const ProductosPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para sorting
  const [orderBy, setOrderBy] = useState<keyof Product>('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  
  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Estados para formularios
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    categories: [] as string[],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await productsService.getAll();
      setProducts(data);
    } catch (err: any) {
      console.error('Error al cargar productos:', err);
      setError('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoriesService.getAll();
      setCategories(data);
    } catch (err: any) {
      console.error('Error al cargar categorías:', err);
    }
  };

  const handleCreate = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price.toString());
      formDataToSend.append('stock', formData.stock.toString());
      
      // Agregar categorías
      if (formData.categories.length > 0) {
        formData.categories.forEach(categoryId => {
          formDataToSend.append('categories[]', categoryId);
        });
      }
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      await productsService.create(formDataToSend);
      setShowCreateModal(false);
      resetForm();
      loadProducts();
    } catch (err: any) {
      console.error('Error al crear producto:', err);
      setError('Error al crear el producto');
    }
  };

  const handleEdit = async () => {
    if (!selectedProduct) return;

    try {
      const formDataToSend = new FormData();
      
      if (formData.name !== selectedProduct.name) {
        formDataToSend.append('name', formData.name);
      }
      if (formData.description !== selectedProduct.description) {
        formDataToSend.append('description', formData.description);
      }
      if (formData.price !== selectedProduct.price) {
        formDataToSend.append('price', formData.price.toString());
      }
      if (formData.stock !== selectedProduct.stock) {
        formDataToSend.append('stock', formData.stock.toString());
      }
      
      // Siempre enviar categorías (incluso si están vacías)
      if (formData.categories.length > 0) {
        formData.categories.forEach(categoryId => {
          formDataToSend.append('categories[]', categoryId);
        });
      } else {
        formDataToSend.append('categories', JSON.stringify([]));
      }
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      await productsService.update(selectedProduct._id, formDataToSend);
      setShowEditModal(false);
      resetForm();
      loadProducts();
    } catch (err: any) {
      console.error('Error al actualizar producto:', err);
      setError('Error al actualizar el producto');
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      await productsService.delete(selectedProduct._id);
      setShowDeleteModal(false);
      setSelectedProduct(null);
      loadProducts();
    } catch (err: any) {
      console.error('Error al eliminar producto:', err);
      setError('Error al eliminar el producto');
    }
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categories: product.categories || [],
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      categories: [],
    });
    setImageFile(null);
    setSelectedProduct(null);
  };

  const handleSort = (property: keyof Product) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedProducts = [...products].sort((a, b) => {
    const aValue = a[orderBy];
    const bValue = b[orderBy];
    
    if (aValue === undefined || bValue === undefined) return 0;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return order === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Productos" 
        description="Gestiona el catálogo de productos"
      />

      {/* Botón Crear Producto */}
      <div className="flex justify-end">
        <Button
          variant="contained"
          startIcon={<Plus className="w-5 h-5" />}
          onClick={() => setShowCreateModal(true)}
          className="interactive-btn"
          sx={{
            backgroundColor: '#10b981',
            '&:hover': {
              backgroundColor: '#059669',
            },
          }}
        >
          Crear Producto
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg alert-animate">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Tabla de Productos */}
      <div className="card-animate">
        <TableContainer component={Paper} className="shadow-sm">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Imagen</TableCell>
              <TableCell 
                onClick={() => handleSort('name')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                Nombre {orderBy === 'name' && (order === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell 
                onClick={() => handleSort('description')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                Descripción {orderBy === 'description' && (order === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell>Categorías</TableCell>
              <TableCell 
                align="right"
                onClick={() => handleSort('price')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                Precio {orderBy === 'price' && (order === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell 
                align="right"
                onClick={() => handleSort('stock')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                Stock {orderBy === 'stock' && (order === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No hay productos
                </TableCell>
              </TableRow>
            ) : (
               sortedProducts.map((product, index) => (
                 <TableRow key={product._id} hover className="table-row-hover stagger-item" sx={{ height: '100px', animationDelay: `${index * 0.05}s` }}>
                  <TableCell>
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-slate-200 rounded flex items-center justify-center">
                        <span className="text-slate-400 text-xs">Sin imagen</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell sx={{ maxWidth: '200px' }}>
                    <div 
                      className="max-h-[80px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 pr-2"
                    >
                      {product.categories && product.categories.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {product.categories.map((categoryId) => {
                            const category = categories.find(c => c._id === categoryId);
                            return category ? (
                              <Chip
                                key={categoryId}
                                label={category.name}
                                size="small"
                                sx={{
                                  backgroundColor: '#e0e7ff',
                                  color: '#4338ca',
                                  fontWeight: 500,
                                  fontSize: '0.75rem',
                                }}
                              />
                            ) : null;
                          })}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">Sin categorías</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell align="right">${product.price.toFixed(2)}</TableCell>
                  <TableCell align="right">{product.stock}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => openEditModal(product)}
                      color="primary"
                      size="small"
                      className="interactive-btn"
                    >
                      <Edit className="w-5 h-5" />
                    </IconButton>
                    <IconButton
                      onClick={() => openDeleteModal(product)}
                      color="error"
                      size="small"
                      className="interactive-btn"
                    >
                      <Trash2 className="w-5 h-5" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      </div>

      {/* Modal Crear Producto */}
      <Dialog open={showCreateModal} onClose={() => { setShowCreateModal(false); resetForm(); }} maxWidth="md" fullWidth className="modal-overlay">
        <DialogTitle>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Crear Producto</h2>
              <p className="text-sm text-slate-500 font-normal">Agrega un nuevo producto a tu catálogo</p>
            </div>
          </div>
        </DialogTitle>
        <DialogContent className="space-y-6 pt-4">
          {/* Información Básica */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Información Básica</h3>
            </div>
            
            <TextField
              autoFocus
              label="Nombre del Producto"
              type="text"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Laptop HP Pavilion"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#10b981' },
                  '&.Mui-focused fieldset': { borderColor: '#10b981' }
                }
              }}
            />
            
            <TextField
              label="Descripción"
              type="text"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe las características del producto..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#10b981' },
                  '&.Mui-focused fieldset': { borderColor: '#10b981' }
                }
              }}
            />
          </div>

          {/* Precio y Stock */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Precio y Stock</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <TextField
                label="Precio"
                type="number"
                fullWidth
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                placeholder="0.00"
                InputProps={{
                  startAdornment: <span className="text-slate-500 mr-2">$</span>
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: '#10b981' },
                    '&.Mui-focused fieldset': { borderColor: '#10b981' }
                  }
                }}
              />
              
              <TextField
                label="Stock"
                type="number"
                fullWidth
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                placeholder="0"
                InputProps={{
                  startAdornment: <Box className="w-4 h-4 text-slate-500 mr-2" />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: '#10b981' },
                    '&.Mui-focused fieldset': { borderColor: '#10b981' }
                  }
                }}
              />
            </div>
          </div>

          {/* Categorías */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Tag className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Categorías</h3>
            </div>
            
            <Autocomplete
              multiple
              options={categories}
              getOptionLabel={(option) => option.name}
              value={categories.filter(cat => formData.categories.includes(cat._id))}
              onChange={(_, newValue) => {
                setFormData({ ...formData, categories: newValue.map(cat => cat._id) });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Selecciona categorías"
                  placeholder="Buscar categorías..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#10b981' },
                      '&.Mui-focused fieldset': { borderColor: '#10b981' }
                    }
                  }}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.name}
                    {...getTagProps({ index })}
                    size="small"
                    sx={{
                      backgroundColor: '#e0e7ff',
                      color: '#4338ca',
                      fontWeight: 500
                    }}
                  />
                ))
              }
            />
          </div>
          
          {/* Imagen */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Imagen del Producto</h3>
            </div>
            
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-600 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer border border-slate-300 rounded-lg"
              />
              {imageFile && (
                <p className="mt-2 text-sm text-emerald-600 font-medium">
                  ✓ {imageFile.name}
                </p>
              )}
            </div>
          </div>
        </DialogContent>
         <DialogActions className="px-6 py-4 bg-slate-50 border-t border-slate-200">
           <Button 
             onClick={() => { setShowCreateModal(false); resetForm(); }} 
             className="interactive-btn"
             sx={{ 
               color: '#64748b',
               '&:hover': { backgroundColor: '#f1f5f9' }
             }}
           >
             Cancelar
           </Button>
           <Button 
             onClick={handleCreate} 
             variant="contained" 
             className="interactive-btn"
             sx={{
               backgroundColor: '#10b981',
               '&:hover': { backgroundColor: '#059669' },
               fontWeight: 600,
               px: 4
             }}
           >
             Crear Producto
           </Button>
         </DialogActions>
      </Dialog>

      {/* Modal Editar Producto */}
      <Dialog open={showEditModal} onClose={() => { setShowEditModal(false); resetForm(); }} maxWidth="md" fullWidth>
        <DialogTitle>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Edit className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Editar Producto</h2>
              <p className="text-sm text-slate-500 font-normal">Actualiza la información del producto</p>
            </div>
          </div>
        </DialogTitle>
        <DialogContent className="space-y-6 pt-4">
          {/* Información Básica */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Información Básica</h3>
            </div>
            
            <TextField
              autoFocus
              label="Nombre del Producto"
              type="text"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#3b82f6' },
                  '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                }
              }}
            />
            
            <TextField
              label="Descripción"
              type="text"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#3b82f6' },
                  '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                }
              }}
            />
          </div>

          {/* Precio y Stock */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Precio y Stock</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <TextField
                label="Precio"
                type="number"
                fullWidth
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                InputProps={{
                  startAdornment: <span className="text-slate-500 mr-2">$</span>
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: '#3b82f6' },
                    '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                  }
                }}
              />
              
              <TextField
                label="Stock"
                type="number"
                fullWidth
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                InputProps={{
                  startAdornment: <Box className="w-4 h-4 text-slate-500 mr-2" />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: '#3b82f6' },
                    '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                  }
                }}
              />
            </div>
          </div>

          {/* Categorías */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Tag className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Categorías</h3>
            </div>
            
            <Autocomplete
              multiple
              options={categories}
              getOptionLabel={(option) => option.name}
              value={categories.filter(cat => formData.categories.includes(cat._id))}
              onChange={(_, newValue) => {
                setFormData({ ...formData, categories: newValue.map(cat => cat._id) });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Selecciona categorías"
                  placeholder="Buscar categorías..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#3b82f6' },
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                    }
                  }}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.name}
                    {...getTagProps({ index })}
                    size="small"
                    sx={{
                      backgroundColor: '#e0e7ff',
                      color: '#4338ca',
                      fontWeight: 500
                    }}
                  />
                ))
              }
            />
          </div>
          
          {/* Imagen */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Cambiar Imagen</h3>
            </div>
            
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-600 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-slate-300 rounded-lg"
              />
              {imageFile && (
                <p className="mt-2 text-sm text-blue-600 font-medium">
                  ✓ {imageFile.name}
                </p>
              )}
            </div>
          </div>
        </DialogContent>
         <DialogActions className="px-6 py-4 bg-slate-50 border-t border-slate-200">
           <Button 
             onClick={() => { setShowEditModal(false); resetForm(); }} 
             className="interactive-btn"
             sx={{ 
               color: '#64748b',
               '&:hover': { backgroundColor: '#f1f5f9' }
             }}
           >
             Cancelar
           </Button>
           <Button 
             onClick={handleEdit} 
             variant="contained" 
             className="interactive-btn"
             sx={{
               backgroundColor: '#3b82f6',
               '&:hover': { backgroundColor: '#2563eb' },
               fontWeight: 600,
               px: 4
             }}
           >
             Actualizar
           </Button>
         </DialogActions>
      </Dialog>

      {/* Modal Confirmar Eliminación */}
      <Dialog open={showDeleteModal} onClose={() => { setShowDeleteModal(false); setSelectedProduct(null); }}>
        <DialogTitle>Eliminar Producto</DialogTitle>
        <DialogContent>
          <p>
            ¿Estás seguro que quieres eliminar el producto{' '}
            <strong>"{selectedProduct?.name}"</strong>?
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Esta acción no se puede deshacer.
          </p>
        </DialogContent>
         <DialogActions>
           <Button onClick={() => { setShowDeleteModal(false); setSelectedProduct(null); }} className="interactive-btn">
             Cancelar
           </Button>
           <Button onClick={handleDelete} variant="contained" color="error" className="interactive-btn">
             Eliminar
           </Button>
         </DialogActions>
      </Dialog>
    </div>
  );
};
