import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { supabase } from '../supabase';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SESSION'; payload: { user: User | null; session: Session | null } }
  | { type: 'SIGN_OUT' };

const initialState: AuthState = {
  user: null,
  session: null,
  loading: true,
  isAuthenticated: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_SESSION':
      return {
        ...state,
        user: action.payload.user,
        session: action.payload.session,
        isAuthenticated: !!action.payload.user,
        loading: false,
      };
    case 'SIGN_OUT':
      return {
        ...state,
        user: null,
        session: null,
        isAuthenticated: false,
        loading: false,
      };
    default:
      return state;
  }
};

interface AuthContextType {
  state: AuthState;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          dispatch({
            type: 'SET_SESSION',
            payload: { user: session?.user ?? null, session },
          });
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        dispatch({
          type: 'SET_SESSION',
          payload: { user: session?.user ?? null, session },
        });

        // Save session to AsyncStorage
        if (session) {
          await AsyncStorage.setItem('userSession', JSON.stringify(session));
        } else {
          await AsyncStorage.removeItem('userSession');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return { error };
      }

      return { error: null };
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return { error };
      }

      return { error: null };
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      dispatch({ type: 'SIGN_OUT' });
      await AsyncStorage.removeItem('userSession');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'bosspizza://auth/callback',
        },
      });
      
      if (error) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return { error };
      }

      return { error: null };
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return { error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};



