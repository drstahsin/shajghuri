"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import defaultProducts from "../data/products.json";

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  images?: string[];
  featured: boolean;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

interface AppContextType {
  products: Product[];
  setProducts: (products: Product[]) => void;
  refreshProducts: () => Promise<void>;
  decrementStock: (orderedItems: { id: number | string; quantity: number }[]) => void;
  restoreStock: (cancelledItems: { id: number | string; quantity: number }[]) => void;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [products, setProductsState] = useState<Product[]>(defaultProducts as Product[]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const refreshProducts = async () => {
    try {
      const res = await fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setProductsState(data);
      }
    } catch (err) {
      console.error("Failed to refresh products", err);
    }
  };

  const decrementStock = (orderedItems: { id: number | string; quantity: number }[]) => {
    setProductsState((prevProducts) =>
      prevProducts.map((p) => {
        const match = orderedItems.find((it) => Number(it.id) === Number(p.id));
        if (match) {
          const qty = Math.max(1, Number(match.quantity) || 1);
          const currentStock = typeof p.stock === 'number' ? p.stock : (parseInt(p.stock as any, 10) || 0);
          return { ...p, stock: Math.max(0, currentStock - qty) };
        }
        return p;
      })
    );
  };

  const restoreStock = (cancelledItems: { id: number | string; quantity: number }[]) => {
    setProductsState((prevProducts) =>
      prevProducts.map((p) => {
        const match = cancelledItems.find((it) => Number(it.id) === Number(p.id));
        if (match) {
          const qty = Math.max(1, Number(match.quantity) || 1);
          const currentStock = typeof p.stock === 'number' ? p.stock : (parseInt(p.stock as any, 10) || 0);
          return { ...p, stock: currentStock + qty };
        }
        return p;
      })
    );
  };

  useEffect(() => {
    refreshProducts();

    // Load cart
    const storedCart = localStorage.getItem("shajghuri_cart");
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        setCart([]);
      }
    }
  }, []);

  const setProducts = async (newProducts: Product[]) => {
    // Update local state instantly for snappy UI
    setProductsState(newProducts);
    
    // Save to backend API
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProducts),
      });
    } catch (e) {
      console.error("Failed to save products to API", e);
    }
  };

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("shajghuri_cart", JSON.stringify(newCart));
  };

  const addToCart = (product: Product) => {
    const newCart = [...cart];
    const existing = newCart.find((item) => item.id === product.id);
    if (existing) {
      if (existing.quantity < product.stock) {
        existing.quantity += 1;
      } else {
        alert("Cannot add more than available stock.");
        return;
      }
    } else {
      if (product.stock > 0) {
        newCart.push({ ...product, quantity: 1 });
      } else {
        alert("Product is out of stock.");
        return;
      }
    }
    saveCart(newCart);
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: number) => {
    saveCart(cart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const newCart = cart.map((item) => {
      if (item.id === productId) {
        if (quantity > item.stock) {
          alert("Cannot exceed available stock.");
          return { ...item, quantity: item.stock };
        }
        return { ...item, quantity };
      }
      return item;
    });
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <AppContext.Provider
      value={{
        products,
        setProducts,
        refreshProducts,
        decrementStock,
        restoreStock,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
