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
  Box,
} from '@mui/material';
import { Trash2, Edit, Plus } from 'lucide-react';

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
    <div className="p-8">
      <PageHeader 
        title="Categorías" 
        description="Organiza tus productos por categorías"
      />

      {/* Contenedor centrado */}
      <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Botón Agregar Categoría */}
        <div className="mb-6 flex justify-end pr-6">
          <Button
            variant="contained"
            startIcon={<Plus className="w-5 h-5" />}
            onClick={() => setShowCreateModal(true)}
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
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Tabla de Categorías */}
        <TableContainer component={Paper}>
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
                sortedCategories.map((category) => (
                  <TableRow key={category._id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{category.name}</TableCell>
                    <TableCell sx={{ color: '#64748b' }}>{formatDate(category.createdAt)}</TableCell>
                    <TableCell sx={{ color: '#64748b' }}>{formatDate(category.updatedAt)}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={() => openEditModal(category)}
                        color="primary"
                        size="small"
                      >
                        <Edit className="w-5 h-5" />
                      </IconButton>
                      <IconButton
                        onClick={() => openDeleteModal(category)}
                        color="error"
                        size="small"
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
      </Box>

      {/* Modal Crear Categoría */}
      <Dialog 
        open={showCreateModal} 
        onClose={() => { setShowCreateModal(false); resetForm(); }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Agregar Categoría</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre"
            type="text"
            fullWidth
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowCreateModal(false); resetForm(); }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCreate} 
            variant="contained" 
            color="primary"
            disabled={!formData.name.trim()}
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
        <DialogTitle>Editar Categoría</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre"
            type="text"
            fullWidth
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowEditModal(false); resetForm(); }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleEdit} 
            variant="contained" 
            color="primary"
            disabled={!formData.name.trim()}
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
          <Button onClick={() => { setShowDeleteModal(false); setSelectedCategory(null); }}>
            Cancelar
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
