import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import axios from 'axios';

export interface CartItemPromotion {
  tipo: 'porcentaje' | 'fijo' | 'nxm';
  valor: number;
  valor_secundario?: number | null;
  activa: boolean;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  /** Stock disponible en el servidor (límite máximo de cantidad) */
  stock?: number;
  imageUrl?: string;
  shopSlug: string;
  shopName: string;
  promotion?: CartItemPromotion;
}

export interface StockWarning {
  productId: string;
  name: string;
  /** true = eliminado del carrito (stock 0), false = cantidad reducida */
  removed: boolean;
  available: number;
}

/** Calcula el total de un item aplicando la promoción */
export function calculateItemTotal(item: CartItem): number {
  const promo = item.promotion;
  if (!promo || !promo.activa) return item.price * item.quantity;

  switch (promo.tipo) {
    case 'porcentaje':
      return item.price * item.quantity * (1 - promo.valor / 100);
    case 'fijo':
      return Math.max(0, item.price - promo.valor) * item.quantity;
    case 'nxm': {
      const llevas = promo.valor;           // ej: 3
      const pagas = promo.valor_secundario || llevas; // ej: 2
      const groups = Math.floor(item.quantity / llevas);
      const remainder = item.quantity % llevas;
      return (groups * pagas + remainder) * item.price;
    }
    default:
      return item.price * item.quantity;
  }
}

/** Calcula el precio unitario final (sin multiplicar por cantidad) */
export function calculateUnitPrice(price: number, promo?: CartItemPromotion | null): number {
  if (!promo || !promo.activa) return price;
  switch (promo.tipo) {
    case 'porcentaje':
      return price * (1 - promo.valor / 100);
    case 'fijo':
      return Math.max(0, price - promo.valor);
    case 'nxm':
      return price;
    default:
      return price;
  }
}

interface CartContextType {
  items: CartItem[];
  stockWarnings: StockWarning[];
  clearStockWarnings: () => void;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [stockWarnings, setStockWarnings] = useState<StockWarning[]>([]);

  // Ref para acceder a los items actuales dentro del polling sin crear closures viejas
  const itemsRef = useRef<CartItem[]>([]);
  useEffect(() => { itemsRef.current = items; }, [items]);

  // ── Persistencia ──────────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) setItems(JSON.parse(saved));
    } catch { /* noop */ }
    finally { setInitialized(true); }
  }, []);

  useEffect(() => {
    if (initialized) localStorage.setItem('cart', JSON.stringify(items));
  }, [items, initialized]);

  // ── Polling de stock cada 30 segundos ────────────────────────────
  useEffect(() => {
    if (!initialized) return;

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000/api';
    const API_KEY  = process.env.NEXT_PUBLIC_INTERNAL_API_KEY;

    const pollStock = async () => {
      const current = itemsRef.current;
      if (current.length === 0) return;

      const shopSlugs = [...new Set(current.map((i) => i.shopSlug))];
      const newWarnings: StockWarning[] = [];

      for (const slug of shopSlugs) {
        try {
          const { data: products } = await axios.get(`${API_BASE}/products?public=true`, {
            headers: {
              'x-tenant-id': slug,
              ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
            },
          });

          setItems((prev) => {
            const updated = [...prev];
            let changed  = false;

            for (let i = 0; i < updated.length; i++) {
              const item    = updated[i];
              if (item.shopSlug !== slug) continue;

              const product = (products as any[]).find((p: any) => p._id === item.productId);

              if (!product || product.status !== 'Disponible' || product.stock <= 0) {
                // Producto sin stock o no disponible → eliminar del carrito
                newWarnings.push({ productId: item.productId, name: item.name, removed: true, available: 0 });
                updated.splice(i, 1);
                i--;
                changed = true;
              } else if (item.quantity > product.stock) {
                // Cantidad supera el stock → reducir
                newWarnings.push({ productId: item.productId, name: item.name, removed: false, available: product.stock });
                updated[i] = { ...item, quantity: product.stock, stock: product.stock };
                changed = true;
              } else if (item.stock !== product.stock) {
                // Actualizar límite silenciosamente
                updated[i] = { ...item, stock: product.stock };
                changed = true;
              }
            }

            return changed ? updated : prev;
          });
        } catch { /* Si falla la poll, no hacemos nada */ }
      }

      if (newWarnings.length > 0) {
        setStockWarnings((prev) => [...prev, ...newWarnings]);
      }
    };

    const initialTimer = setTimeout(pollStock, 5_000);
    const interval     = setInterval(pollStock, 30_000);
    return () => { clearTimeout(initialTimer); clearInterval(interval); };
  }, [initialized]);

  // ── Acciones ──────────────────────────────────────────────────────

  const addItem = (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.productId === item.productId);
      const maxStock = item.stock ?? Infinity;

      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        const limit    = item.stock ?? existing.stock ?? Infinity;
        const newQty   = Math.min(existing.quantity + quantity, limit);
        if (newQty === existing.quantity) return prev; // ya al máximo
        const newItems = [...prev];
        newItems[existingIndex] = { ...existing, quantity: newQty, stock: item.stock ?? existing.stock };
        return newItems;
      }

      const cappedQty = Math.min(quantity, maxStock);
      if (cappedQty <= 0) return prev;
      return [...prev, { ...item, quantity: cappedQty }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) { removeItem(productId); return; }
    setItems((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;
        const maxStock = item.stock ?? Infinity;
        return { ...item, quantity: Math.min(quantity, maxStock) };
      })
    );
  };

  const clearCart          = () => setItems([]);
  const clearStockWarnings = () => setStockWarnings([]);
  const getTotal           = () => items.reduce((t, i) => t + calculateItemTotal(i), 0);
  const getItemCount       = () => items.reduce((c, i) => c + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        stockWarnings,
        clearStockWarnings,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
