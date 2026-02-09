import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface CartItem {
  id: number | string;
  title: string;
  price: string | number;
  type: string;
  category: string;
  quantity: number;
  printify_id?: string;
  printify_product_id?: string;
  variant_id?: number;
  color?: string;
  size?: string;
  image?: string;
  variants?: unknown[];
  images?: unknown[];
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: number | string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number | string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

interface CartContextType extends CartState {
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number | string) => void;
  updateQuantity: (id: number | string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    let price: number;
    if (typeof item.price === 'string') {
      price = parseFloat(item.price.replace('$', ''));
    } else {
      price = item.price;
    }
    return total + (price * item.quantity);
  }, 0);
};

const calculateItemCount = (items: CartItem[]): number => {
  return items.reduce((count, item) => count + item.quantity, 0);
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id == action.payload.id);
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.id == action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        return {
          items: updatedItems,
          total: calculateTotal(updatedItems),
          itemCount: calculateItemCount(updatedItems)
        };
      } else {
        const newItems = [...state.items, { ...action.payload, quantity: 1 }];
        return {
          items: newItems,
          total: calculateTotal(newItems),
          itemCount: calculateItemCount(newItems)
        };
      }
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id != action.payload);
      return {
        items: newItems,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems)
      };
    }
    
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        const newItems = state.items.filter(item => item.id != action.payload.id);
        return {
          items: newItems,
          total: calculateTotal(newItems),
          itemCount: calculateItemCount(newItems)
        };
      }
      
      const updatedItems = state.items.map(item =>
        item.id == action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return {
        items: updatedItems,
        total: calculateTotal(updatedItems),
        itemCount: calculateItemCount(updatedItems)
      };
    }
    
    case 'CLEAR_CART':
      return {
        items: [],
        total: 0,
        itemCount: 0
      };
    
    case 'LOAD_CART': {
      return {
        items: action.payload,
        total: calculateTotal(action.payload),
        itemCount: calculateItemCount(action.payload)
      };
    }
    
    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0
  });

  // Load cart from localStorage on mount and handle cross-tab sync
  useEffect(() => {
    const loadCart = () => {
      const savedCart = localStorage.getItem('shopping-cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          dispatch({ type: 'LOAD_CART', payload: parsedCart });
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
        }
      }
    };

    loadCart();

    // Listen for changes in other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'shopping-cart') {
        loadCart();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    const currentSaved = localStorage.getItem('shopping-cart');
    const newStateStr = JSON.stringify(state.items);

    // Only update if actually different to avoid infinite loops with storage event
    if (currentSaved !== newStateStr) {
      localStorage.setItem('shopping-cart', newStateStr);
    }
  }, [state.items]);

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (id: number | string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: number | string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};