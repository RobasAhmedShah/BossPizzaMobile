import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MenuItem, MenuItemSize } from '../supabase';
import { PizzaCustomization, DealOption } from '../types/pizza';

export interface CartItem {
  id: string;
  type: 'menu_item' | 'custom_pizza' | 'deal';
  menuItem?: MenuItem;
  size?: MenuItemSize;
  pizzaCustomization?: PizzaCustomization;
  deal?: DealOption;
  quantity: number;
  customizations?: {
    toppings: string[];
    notes?: string;
  };
  totalPrice: number;
  name: string;
  description?: string;
  image?: string;
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  isLoading: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: CartState = {
  items: [],
  subtotal: 0,
  deliveryFee: 0,
  tax: 0,
  total: 0,
  isLoading: false,
};

const calculateTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryFee = subtotal > 1000 ? 0 : 150; // Free delivery over PKR 1000
  const tax = Math.round(subtotal * 0.15); // 15% tax
  const total = subtotal + deliveryFee + tax;

  return { subtotal, deliveryFee, tax, total };
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      console.log('CartReducer: ADD_ITEM action received:', action.payload);
      const existingItemIndex = state.items.findIndex(
        item => item.id === action.payload.id
      );

      let newItems;
      if (existingItemIndex >= 0) {
        // Update existing item
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
        console.log('CartReducer: Updated existing item, new items:', newItems);
      } else {
        // Add new item
        newItems = [...state.items, action.payload];
        console.log('CartReducer: Added new item, new items:', newItems);
      }

      const totals = calculateTotals(newItems);
      console.log('CartReducer: Calculated totals:', totals);
      return { ...state, items: newItems, ...totals };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const totals = calculateTotals(newItems);
      return { ...state, items: newItems, ...totals };
    }

    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0); // Remove items with 0 quantity

      const totals = calculateTotals(newItems);
      return { ...state, items: newItems, ...totals };
    }

    case 'CLEAR_CART':
      return { ...initialState };

    case 'LOAD_CART': {
      const totals = calculateTotals(action.payload);
      return { ...state, items: action.payload, ...totals };
    }

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    default:
      return state;
  }
};

interface CartContextType {
  state: CartState;
  addItem: (item: CartItem) => void;
  addCustomPizza: (customization: PizzaCustomization, quantity: number, totalPrice: number) => void;
  addDeal: (deal: DealOption, quantity: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  loadCart: () => Promise<void>;
  saveCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from AsyncStorage on app start
  useEffect(() => {
    loadCart();
  }, []);

  // Save cart to AsyncStorage whenever items change
  useEffect(() => {
    if (state.items.length > 0) {
      saveCart();
    }
  }, [state.items]);

  const addItem = (item: CartItem) => {
    console.log('CartContext: Adding item to cart:', item);
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const addCustomPizza = (customization: PizzaCustomization, quantity: number, totalPrice: number) => {
    const item: CartItem = {
      id: `custom_pizza_${Date.now()}_${Math.random()}`,
      type: 'custom_pizza',
      pizzaCustomization: customization,
      quantity,
      totalPrice,
      name: `Custom ${customization.size.name} Pizza`,
      description: `${customization.crust.name} crust with ${customization.sauce.name}${
        customization.toppings.length > 0 
          ? ` and ${customization.toppings.map(t => t.name).join(', ')}`
          : ''
      }`,
    };
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const addDeal = (deal: DealOption, quantity: number) => {
    const item: CartItem = {
      id: `deal_${deal.id}_${Date.now()}`,
      type: 'deal',
      deal,
      quantity,
      totalPrice: deal.price * quantity,
      name: deal.name,
      description: deal.description,
    };
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    AsyncStorage.removeItem('cart');
  };

  const loadCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const savedCart = await AsyncStorage.getItem('cart');
      if (savedCart) {
        const cartItems: CartItem[] = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartItems });
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const saveCart = async () => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(state.items));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        addCustomPizza,
        addDeal,
        removeItem,
        updateQuantity,
        clearCart,
        loadCart,
        saveCart,
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
