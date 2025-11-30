import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Shop {
  id: string;
  slug: string;
  name: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  activeShop: Shop | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  selectShop: (shop: Shop) => void;
  clearActiveShop: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeShop, setActiveShop] = useState<Shop | null>(null);

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedShop = localStorage.getItem('activeShop');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    if (storedShop) {
      setActiveShop(JSON.parse(storedShop));
    }
  }, []);

  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setActiveShop(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('activeShop');
  };

  const selectShop = (shop: Shop) => {
    setActiveShop(shop);
    localStorage.setItem('activeShop', JSON.stringify(shop));
  };

  const clearActiveShop = () => {
    setActiveShop(null);
    localStorage.removeItem('activeShop');
  };

  const value: AuthContextType = {
    user,
    token,
    activeShop,
    login,
    logout,
    selectShop,
    clearActiveShop,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
