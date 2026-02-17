import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  shopSlug: string;
  shopName: string;
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
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
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
