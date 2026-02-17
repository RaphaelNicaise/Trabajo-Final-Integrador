import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
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
} from '@mui/material';
import { Trash2, Edit, Plus, Tag } from 'lucide-react';

export const CategoriasPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para sorting
  const [orderBy, setOrderBy] = useState<keyof Category>('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  
  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  // Estados para formularios
  const [formData, setFormData] = useState({
    name: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await categoriesService.getAll();
      setCategories(data);
    } catch (err: any) {
      console.error('Error al cargar categorías:', err);
      setError('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await categoriesService.create({
        name: formData.name,
      });
      setShowCreateModal(false);
      resetForm();
      loadCategories();
    } catch (err: any) {
      console.error('Error al crear categoría:', err);
      setError('Error al crear la categoría');
    }
  };

  const handleEdit = async () => {
    if (!selectedCategory) return;

    try {
      await categoriesService.update(selectedCategory._id, {
        name: formData.name,
      });
      setShowEditModal(false);
      resetForm();
      loadCategories();
    } catch (err: any) {
      console.error('Error al actualizar categoría:', err);
      setError('Error al actualizar la categoría');
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    try {
      await categoriesService.delete(selectedCategory._id);
      setShowDeleteModal(false);
      setSelectedCategory(null);
      loadCategories();
    } catch (err: any) {
      console.error('Error al eliminar categoría:', err);
      setError('Error al eliminar la categoría');
    }
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (category: Category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
    });
    setSelectedCategory(null);
  };

  const handleSort = (property: keyof Category) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedCategories = [...categories].sort((a, b) => {
    const aValue = a[orderBy];
    const bValue = b[orderBy];
    
    if (aValue === undefined || bValue === undefined) return 0;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return order === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return 0;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Categorías" 
        description="Organiza tus productos por categorías"
      />

      {/* Botón Agregar Categoría */}
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
          Agregar Categoría
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg alert-animate">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Tabla de Categorías */}
      <div className="card-animate">
        <TableContainer component={Paper} className="shadow-sm">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell 
                  onClick={() => handleSort('name')}
                  style={{ cursor: 'pointer', userSelect: 'none', fontWeight: 600 }}
                >
                  Nombre {orderBy === 'name' && (order === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell 
                  onClick={() => handleSort('createdAt')}
                  style={{ cursor: 'pointer', userSelect: 'none', fontWeight: 600 }}
                >
                  Creado {orderBy === 'createdAt' && (order === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell 
                  onClick={() => handleSort('updatedAt')}
                  style={{ cursor: 'pointer', userSelect: 'none', fontWeight: 600 }}
                >
                  Actualizado {orderBy === 'updatedAt' && (order === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell align="center" style={{ fontWeight: 600 }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No hay categorías
                  </TableCell>
                </TableRow>
              ) : (
               sortedCategories.map((category, index) => (
                 <TableRow key={category._id} hover className="table-row-hover stagger-item" sx={{ animationDelay: `${index * 0.05}s` }}>
                    <TableCell sx={{ fontWeight: 500 }}>{category.name}</TableCell>
                    <TableCell sx={{ color: '#64748b' }}>{formatDate(category.createdAt)}</TableCell>
                    <TableCell sx={{ color: '#64748b' }}>{formatDate(category.updatedAt)}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={() => openEditModal(category)}
                        color="primary"
                        size="small"
                        className="interactive-btn"
                      >
                        <Edit className="w-5 h-5" />
                      </IconButton>
                      <IconButton
                        onClick={() => openDeleteModal(category)}
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

      {/* Modal Crear Categoría */}
      <Dialog 
        open={showCreateModal} 
        onClose={() => { setShowCreateModal(false); resetForm(); }}
        maxWidth="sm"
        fullWidth
        className="modal-overlay"
      >
        <DialogTitle>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Tag className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Agregar Categoría</h2>
              <p className="text-sm text-slate-500 font-normal">Organiza tus productos</p>
            </div>
          </div>
        </DialogTitle>
        <DialogContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Tag className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Detalles de la Categoría</h3>
            </div>
            
            <TextField
              autoFocus
              label="Nombre de la categoría"
              type="text"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Electrónica, Ropa, Accesorios..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#9333ea' },
                  '&.Mui-focused fieldset': { borderColor: '#9333ea' }
                }
              }}
            />
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
             disabled={!formData.name.trim()}
             className="interactive-btn"
             sx={{
               backgroundColor: '#9333ea',
               '&:hover': { backgroundColor: '#7e22ce' },
               '&.Mui-disabled': { backgroundColor: '#e9d5ff', color: '#a855f7' },
               fontWeight: 600,
               px: 4
             }}
           >
             Crear
           </Button>
         </DialogActions>
      </Dialog>

      {/* Modal Editar Categoría */}
      <Dialog 
        open={showEditModal} 
        onClose={() => { setShowEditModal(false); resetForm(); }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Edit className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Editar Categoría</h2>
              <p className="text-sm text-slate-500 font-normal">Actualiza el nombre de la categoría</p>
            </div>
          </div>
        </DialogTitle>
        <DialogContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Tag className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Detalles de la Categoría</h3>
            </div>
            
            <TextField
              autoFocus
              label="Nombre de la categoría"
              type="text"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#3b82f6' },
                  '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                }
              }}
            />
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
             disabled={!formData.name.trim()}
             className="interactive-btn"
             sx={{
               backgroundColor: '#3b82f6',
               '&:hover': { backgroundColor: '#2563eb' },
               '&.Mui-disabled': { backgroundColor: '#dbeafe', color: '#60a5fa' },
               fontWeight: 600,
               px: 4
             }}
           >
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Confirmar Eliminación */}
      <Dialog 
        open={showDeleteModal} 
        onClose={() => { setShowDeleteModal(false); setSelectedCategory(null); }}
      >
        <DialogTitle>Eliminar Categoría</DialogTitle>
        <DialogContent>
          <p>
            ¿Estás seguro que quieres eliminar la categoría{' '}
            <strong>"{selectedCategory?.name}"</strong>?
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Esta acción no se puede deshacer.
          </p>
        </DialogContent>
         <DialogActions>
           <Button onClick={() => { setShowDeleteModal(false); setSelectedCategory(null); }} className="interactive-btn">
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
