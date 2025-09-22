import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserService, UserProfile as SupabaseUserProfile, UserAddress as SupabaseUserAddress } from '../services/userService';

export interface UserAddress {
  id: string;
  title: string;
  street: string;
  city: string;
  zip: string;
  isDefault: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  addresses: UserAddress[];
}

interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
}

type UserAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PROFILE'; payload: UserProfile }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'ADD_ADDRESS'; payload: UserAddress }
  | { type: 'UPDATE_ADDRESS'; payload: { id: string; address: Partial<UserAddress> } }
  | { type: 'DELETE_ADDRESS'; payload: string }
  | { type: 'SET_DEFAULT_ADDRESS'; payload: string };

const initialState: UserState = {
  profile: null,
  isLoading: false,
};

const userReducer = (state: UserState, action: UserAction): UserState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_PROFILE':
      return { ...state, profile: action.payload, isLoading: false };

    case 'UPDATE_PROFILE':
      if (!state.profile) return state;
      return {
        ...state,
        profile: { ...state.profile, ...action.payload },
      };

    case 'ADD_ADDRESS':
      if (!state.profile) return state;
      return {
        ...state,
        profile: {
          ...state.profile,
          addresses: [...state.profile.addresses, action.payload],
        },
      };

    case 'UPDATE_ADDRESS':
      if (!state.profile) return state;
      return {
        ...state,
        profile: {
          ...state.profile,
          addresses: state.profile.addresses.map(addr =>
            addr.id === action.payload.id
              ? { ...addr, ...action.payload.address }
              : addr
          ),
        },
      };

    case 'DELETE_ADDRESS':
      if (!state.profile) return state;
      return {
        ...state,
        profile: {
          ...state.profile,
          addresses: state.profile.addresses.filter(addr => addr.id !== action.payload),
        },
      };

    case 'SET_DEFAULT_ADDRESS':
      if (!state.profile) return state;
      return {
        ...state,
        profile: {
          ...state.profile,
          addresses: state.profile.addresses.map(addr => ({
            ...addr,
            isDefault: addr.id === action.payload,
          })),
        },
      };

    default:
      return state;
  }
};

interface UserContextType {
  state: UserState;
  updateProfile: (profile: Partial<UserProfile>) => void;
  addAddress: (address: Omit<UserAddress, 'id'>) => void;
  updateAddress: (id: string, address: Partial<UserAddress>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  loadUserData: () => Promise<void>;
  saveUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Load user data from AsyncStorage on app start
  useEffect(() => {
    loadUserData();
  }, []);

  // Save user data to AsyncStorage whenever profile changes
  useEffect(() => {
    if (state.profile) {
      saveUserData();
    }
  }, [state.profile]);

  const loadUserData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // First try to get from AsyncStorage
      const savedPhone = await AsyncStorage.getItem('userPhone');
      
      if (savedPhone) {
        // Try to load from Supabase
        try {
          const supabaseData = await UserService.getUserProfileWithAddresses(savedPhone);
          if (supabaseData) {
            const profile: UserProfile = {
              id: supabaseData.profile.id,
              name: supabaseData.profile.name || '',
              email: supabaseData.profile.email || '',
              phone: supabaseData.profile.phone,
              avatar: supabaseData.profile.avatar_url,
              addresses: supabaseData.addresses.map(addr => ({
                id: addr.id,
                title: addr.title,
                street: addr.street,
                city: addr.city,
                zip: addr.zip_code,
                isDefault: addr.is_default,
              })),
            };
            dispatch({ type: 'SET_PROFILE', payload: profile });
            return;
          }
        } catch (error) {
          console.log('Could not load from Supabase, using local data:', error);
        }
        
        // Fallback to local storage
        const savedProfile = await AsyncStorage.getItem('userProfile');
        if (savedProfile) {
          const profile: UserProfile = JSON.parse(savedProfile);
          dispatch({ type: 'SET_PROFILE', payload: profile });
          return;
        }
      }
      
      // Create default profile if none exists
      const defaultProfile: UserProfile = {
        id: 'default-user',
        name: '',
        email: '',
        phone: '',
        addresses: [],
      };
      dispatch({ type: 'SET_PROFILE', payload: defaultProfile });
    } catch (error) {
      console.error('Error loading user data:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const saveUserData = async () => {
    try {
      if (state.profile && state.profile.phone) {
        // Save to AsyncStorage
        await AsyncStorage.setItem('userProfile', JSON.stringify(state.profile));
        await AsyncStorage.setItem('userPhone', state.profile.phone);
        
        // Sync to Supabase
        try {
          // Create or update user profile
          const supabaseProfile = await UserService.createOrUpdateUserProfile(
            state.profile.phone,
            {
              name: state.profile.name,
              email: state.profile.email,
              avatar_url: state.profile.avatar,
            }
          );
          
          // Update local profile with Supabase ID
          if (state.profile.id === 'default-user' || state.profile.id !== supabaseProfile.id) {
            dispatch({ 
              type: 'UPDATE_PROFILE', 
              payload: { id: supabaseProfile.id } 
            });
          }
          
          // Sync addresses
          for (const address of state.profile.addresses) {
            if (address.id.startsWith('address_')) {
              // New address - create in Supabase
              await UserService.createUserAddress({
                user_profile_id: supabaseProfile.id,
                title: address.title,
                street: address.street,
                city: address.city,
                zip_code: address.zip,
                is_default: address.isDefault,
              });
            } else {
              // Existing address - update in Supabase
              await UserService.updateUserAddress(address.id, {
                title: address.title,
                street: address.street,
                city: address.city,
                zip_code: address.zip,
                is_default: address.isDefault,
              });
            }
          }
        } catch (error) {
          console.log('Could not sync to Supabase:', error);
          // Continue with local storage even if Supabase fails
        }
      }
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const updateProfile = (profile: Partial<UserProfile>) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: profile });
  };

  const addAddress = (address: Omit<UserAddress, 'id'>) => {
    const newAddress: UserAddress = {
      ...address,
      id: `address_${Date.now()}_${Math.random()}`,
    };
    dispatch({ type: 'ADD_ADDRESS', payload: newAddress });
  };

  const updateAddress = (id: string, address: Partial<UserAddress>) => {
    dispatch({ type: 'UPDATE_ADDRESS', payload: { id, address } });
  };

  const deleteAddress = (id: string) => {
    dispatch({ type: 'DELETE_ADDRESS', payload: id });
  };

  const setDefaultAddress = (id: string) => {
    dispatch({ type: 'SET_DEFAULT_ADDRESS', payload: id });
  };

  return (
    <UserContext.Provider
      value={{
        state,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        loadUserData,
        saveUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
