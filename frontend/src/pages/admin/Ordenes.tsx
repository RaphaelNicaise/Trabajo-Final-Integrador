import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { ordersService } from '../../services/orders.service';
import type { Order } from '../../services/orders.service';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
} from '@mui/material';
import { Eye } from 'lucide-react';

export const OrdenesPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para sorting
  const [orderBy, setOrderBy] = useState<keyof Order>('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  
  // Estados para modales
  const [showBuyerModal, setShowBuyerModal] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ordersService.getAll();
      setOrders(data);
    } catch (err: any) {
      console.error('Error al cargar órdenes:', err);
      setError('Error al cargar las órdenes');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await ordersService.updateStatus(orderId, newStatus);
      loadOrders();
    } catch (err: any) {
      console.error('Error al actualizar estado:', err);
      setError('Error al actualizar el estado de la orden');
    }
  };

  const handleSort = (property: keyof Order) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedOrders = [...orders].sort((a, b) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendiente':
        return { bg: '#fef3c7', color: '#92400e' }; // Amarillo
      case 'Pagado':
        return { bg: '#d1fae5', color: '#065f46' }; // Verde
      case 'Enviado':
        return { bg: '#dbeafe', color: '#1e40af' }; // Azul
      case 'Cancelado':
        return { bg: '#fee2e2', color: '#991b1b' }; // Rojo
      default:
        return { bg: '#f3f4f6', color: '#374151' }; // Gris
    }
  };

  const openBuyerModal = (order: Order) => {
    setSelectedOrder(order);
    setShowBuyerModal(true);
  };

  const openProductsModal = (order: Order) => {
    setSelectedOrder(order);
    setShowProductsModal(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Órdenes" 
        description="Administra los pedidos de tus clientes"
      />

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg alert-animate">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Tabla de Órdenes */}
      <div className="card-animate">
        <TableContainer component={Paper} className="shadow-sm">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell 
                  style={{ fontWeight: 600, minWidth: '100px' }}
                >
                  ID
                </TableCell>
                <TableCell 
                  style={{ fontWeight: 600, minWidth: '140px' }}
                >
                  Comprador
                </TableCell>
                <TableCell 
                  style={{ fontWeight: 600, minWidth: '120px' }}
                >
                  Productos
                </TableCell>
                <TableCell 
                  align="right"
                  onClick={() => handleSort('total')}
                  style={{ cursor: 'pointer', userSelect: 'none', fontWeight: 600, minWidth: '100px' }}
                >
                  Total $ {orderBy === 'total' && (order === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell 
                  style={{ fontWeight: 600, minWidth: '140px' }}
                >
                  Status
                </TableCell>
                <TableCell 
                  onClick={() => handleSort('createdAt')}
                  style={{ cursor: 'pointer', userSelect: 'none', fontWeight: 600, minWidth: '140px' }}
                >
                  Creado {orderBy === 'createdAt' && (order === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell 
                  onClick={() => handleSort('updatedAt')}
                  style={{ cursor: 'pointer', userSelect: 'none', fontWeight: 600, minWidth: '140px' }}
                >
                  Actualizado {orderBy === 'updatedAt' && (order === 'asc' ? '↑' : '↓')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No hay órdenes
                  </TableCell>
                </TableRow>
              ) : (
                sortedOrders.map((orderItem) => (
                  <TableRow key={orderItem._id} hover className="table-row-hover">
                    <TableCell>
                      <span className="text-xs font-mono text-slate-600">
                        {orderItem._id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="text"
                        size="small"
                        startIcon={<Eye className="w-4 h-4" />}
                        onClick={() => openBuyerModal(orderItem)}
                        sx={{ textTransform: 'none' }}
                      >
                        Ver Detalles
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="text"
                        size="small"
                        startIcon={<Eye className="w-4 h-4" />}
                        onClick={() => openProductsModal(orderItem)}
                        sx={{ textTransform: 'none' }}
                      >
                        Ver Detalles ({orderItem.products.length})
                      </Button>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#059669' }}>
                      ${orderItem.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {orderItem.status === 'Cancelado' ? (
                        <Chip
                          label="Cancelado"
                          size="small"
                          sx={{
                            backgroundColor: getStatusColor('Cancelado').bg,
                            color: getStatusColor('Cancelado').color,
                            fontWeight: 600,
                          }}
                        />
                      ) : (
                        <Select
                          value={orderItem.status}
                          onChange={(e) => handleStatusChange(orderItem._id, e.target.value)}
                          size="small"
                          sx={{ minWidth: '120px' }}
                        >
                          <MenuItem value="Pendiente">
                            <Chip
                              label="Pendiente"
                              size="small"
                              sx={{
                                backgroundColor: getStatusColor('Pendiente').bg,
                                color: getStatusColor('Pendiente').color,
                                fontWeight: 600,
                              }}
                            />
                          </MenuItem>
                          <MenuItem value="Pagado">
                            <Chip
                              label="Pagado"
                              size="small"
                              sx={{
                                backgroundColor: getStatusColor('Pagado').bg,
                                color: getStatusColor('Pagado').color,
                                fontWeight: 600,
                              }}
                            />
                          </MenuItem>
                          <MenuItem value="Enviado">
                            <Chip
                              label="Enviado"
                              size="small"
                              sx={{
                                backgroundColor: getStatusColor('Enviado').bg,
                                color: getStatusColor('Enviado').color,
                                fontWeight: 600,
                              }}
                            />
                          </MenuItem>
                          <MenuItem value="Cancelado">
                            <Chip
                              label="Cancelado"
                              size="small"
                              sx={{
                                backgroundColor: getStatusColor('Cancelado').bg,
                                color: getStatusColor('Cancelado').color,
                                fontWeight: 600,
                              }}
                            />
                          </MenuItem>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell sx={{ color: '#64748b' }}>
                      {formatDate(orderItem.createdAt)}
                    </TableCell>
                    <TableCell sx={{ color: '#64748b' }}>
                      {formatDate(orderItem.updatedAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* Modal Detalles del Comprador */}
      <Dialog 
        open={showBuyerModal} 
        onClose={() => { setShowBuyerModal(false); setSelectedOrder(null); }}
        maxWidth="sm"
        fullWidth
        className="modal-overlay"
      >
        <DialogTitle>Detalles del Comprador</DialogTitle>
        <DialogContent className="modal-content">
          {selectedOrder && (
            <div className="space-y-3 mt-2">
              <div>
                <p className="text-sm font-semibold text-slate-700">Nombre:</p>
                <p className="text-base text-slate-900">{selectedOrder.buyer.name}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Email:</p>
                <p className="text-base text-slate-900">{selectedOrder.buyer.email}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Dirección:</p>
                <p className="text-base text-slate-900">{selectedOrder.buyer.address}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Código Postal:</p>
                <p className="text-base text-slate-900">{selectedOrder.buyer.postalCode}</p>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowBuyerModal(false); setSelectedOrder(null); }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Detalles de Productos */}
      <Dialog 
        open={showProductsModal} 
        onClose={() => { setShowProductsModal(false); setSelectedOrder(null); }}
        maxWidth="md"
        fullWidth
        className="modal-overlay"
      >
        <DialogTitle>Detalles de Productos</DialogTitle>
        <DialogContent className="modal-content">
          {selectedOrder && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Producto</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Precio</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Cantidad</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedOrder.products.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell align="right">${product.price.toFixed(2)}</TableCell>
                      <TableCell align="right">{product.quantity}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        ${(product.price * product.quantity).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} align="right" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                      Total:
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1rem', color: '#059669' }}>
                      ${selectedOrder.total.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowProductsModal(false); setSelectedOrder(null); }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
