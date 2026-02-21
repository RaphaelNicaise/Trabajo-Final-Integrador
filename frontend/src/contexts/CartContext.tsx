import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

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
  imageUrl?: string;
  shopSlug: string;
  shopName: string;
  promotion?: CartItemPromotion;
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

  // Cargar carrito del localStorage solo en el cliente
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error al cargar el carrito:', error);
    } finally {
      setInitialized(true);
    }
  }, []);

  // Guardar en localStorage cuando cambia, pero solo después de inicializar
  useEffect(() => {
    if (initialized) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, initialized]);

  const addItem = (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.productId === item.productId);

      if (existingIndex >= 0) {
        const newItems = [...prev];
        newItems[existingIndex].quantity += quantity;
        return newItems;
      }

      return [...prev, { ...item, quantity }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
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
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
