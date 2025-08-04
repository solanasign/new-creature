import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  DecodedToken, 
  getStoredToken, 
  setStoredToken, 
  removeStoredToken, 
  verifyToken,
  getStoredRefreshToken,
  setStoredRefreshToken,
  getStoredUser,
  setStoredUser
} from '../../../utils/jwt';
import { apiService, AuthResponse } from '../../../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: DecodedToken | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    role: 'member' | 'admin' | 'pastor';
  }) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
    const token = getStoredToken();
        const refreshToken = getStoredRefreshToken();
        
    if (token) {
      try {
        const decoded = verifyToken(token);
        setUser(decoded);
        setIsAuthenticated(true);
      } catch (error) {
            // Token expired, try to refresh
            if (refreshToken) {
              try {
                const response = await apiService.refreshToken(refreshToken);
                setStoredToken(response.accessToken);
                const newDecoded = verifyToken(response.accessToken);
                setUser(newDecoded);
                setIsAuthenticated(true);
              } catch (refreshError) {
                // Refresh failed, clear everything
                removeStoredToken();
                setUser(null);
                setIsAuthenticated(false);
              }
            } else {
              removeStoredToken();
              setUser(null);
              setIsAuthenticated(false);
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        removeStoredToken();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      setLoading(true);
      const response: AuthResponse = await apiService.login(credentials);
      
      setStoredToken(response.accessToken);
      setStoredRefreshToken(response.refreshToken);
      setStoredUser(response.user);
      
      const decoded = verifyToken(response.accessToken);
      setUser(decoded);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    role: 'member' | 'admin' | 'pastor';
  }) => {
    try {
      setLoading(true);
      const response: AuthResponse = await apiService.register(userData);
      
      setStoredToken(response.accessToken);
      setStoredRefreshToken(response.refreshToken);
      setStoredUser(response.user);
      
      const decoded = verifyToken(response.accessToken);
      setUser(decoded);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = getStoredRefreshToken();
      if (refreshToken) {
        await apiService.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
    removeStoredToken();
    setUser(null);
    setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      register, 
      logout, 
      loading 
    }}>
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