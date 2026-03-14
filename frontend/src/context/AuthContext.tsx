import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, CartItem } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (productId: number | string) => void;
  clearCart: () => void;
  updateCartQuantity: (productId: number | string, quantity: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedCart = localStorage.getItem('cart');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const addToCart = (product: any) => {
    setCart(prev => {
      const productId = product.id || product._id;
      const existing = prev.find(item => (item.id || item._id) === productId);
      let newCart;
      if (existing) {
        newCart = prev.map(item => 
          (item.id || item._id) === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        newCart = [...prev, { ...product, quantity: 1 }];
      }
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const removeFromCart = (productId: number | string) => {
    setCart(prev => {
      const newCart = prev.filter(item => (item.id || item._id) !== productId);
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const updateCartQuantity = (productId: number | string, quantity: number) => {
    setCart(prev => {
      const newCart = prev.map(item => 
        (item.id || item._id) === productId ? { ...item, quantity: Math.max(1, quantity) } : item
      );
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  return (
    <AuthContext.Provider value={{ 
      user, token, login, logout, 
      cart, addToCart, removeFromCart, clearCart, updateCartQuantity 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
