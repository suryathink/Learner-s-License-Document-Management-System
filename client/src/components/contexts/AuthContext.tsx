import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { Admin, LoginFormData, AuthContextType } from '../types';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

// Auth state type
interface AuthState {
  admin: Admin | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
}

// Auth actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { admin: Admin; token: string } }
  | { type: 'AUTH_ERROR' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_ADMIN'; payload: Admin };

// Initial state
const initialState: AuthState = {
  admin: null,
  token: null,
  loading: true,
  isAuthenticated: false,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        admin: action.payload.admin,
        token: action.payload.token,
        loading: false,
        isAuthenticated: true,
      };

    case 'AUTH_ERROR':
      return {
        ...state,
        admin: null,
        token: null,
        loading: false,
        isAuthenticated: false,
      };

    case 'LOGOUT':
      return {
        ...state,
        admin: null,
        token: null,
        loading: false,
        isAuthenticated: false,
      };

    case 'UPDATE_ADMIN':
      return {
        ...state,
        admin: action.payload,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const adminData = localStorage.getItem('admin');

        if (token && adminData) {
          // const admin = JSON.parse(adminData);
          
          // Verify token is still valid by fetching current admin info
          try {
            const currentAdmin = await authService.getMe();
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { admin: currentAdmin, token },
            });
          } catch (error) {
            // Token is invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('admin');
            dispatch({ type: 'AUTH_ERROR' });
          }
        } else {
          dispatch({ type: 'AUTH_ERROR' });
        }
      } catch (error) {
        dispatch({ type: 'AUTH_ERROR' });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginFormData): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const { admin, token } = await authService.login(credentials);
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('admin', JSON.stringify(admin));
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { admin, token },
      });
      
      toast.success(`Welcome back, ${admin.username}!`);
    } catch (error: any) {
      dispatch({ type: 'AUTH_ERROR' });
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      // Call logout endpoint to invalidate token on server
      await authService.logout();
    } catch (error) {
      // Continue with logout even if server call fails
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    }
  };

  // Update admin data
  // const updateAdmin = (admin: Admin): void => {
  //   localStorage.setItem('admin', JSON.stringify(admin));
  //   dispatch({ type: 'UPDATE_ADMIN', payload: admin });
  // };

  const contextValue: AuthContextType = {
    admin: state.admin,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 