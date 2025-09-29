import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode, User, AuthResponse, LoginRequest, RegisterRequest } from '../types';
import { authApi } from '../services/api';
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

let didLogJwtClaims = false;

function getUserFromToken(token: string | null): User | null {
  if (!token) return null;
  try {
    const decoded: any = jwtDecode(token);

    // One-time log to inspect available claim keys
    if (!didLogJwtClaims) {
      didLogJwtClaims = true;
      console.group('[Auth] JWT claims');
      console.info('keys:', Object.keys(decoded));
      console.info('payload:', decoded);
      console.groupEnd();
    }

    const id =
      String(
        decoded.sub ??
          decoded.nameid ??
          decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ??
          ''
      );

    const email =
      decoded.email ??
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ??
      '';

    const name =
      decoded.name ??
      decoded.unique_name ??
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ??
      'User';

    return { id, email, name } as User;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      const restored = getUserFromToken(storedToken);
      console.info('[Auth] userObj from token (restore):', restored);
      setUser(restored);
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      const response: AuthResponse = await authApi.login(credentials);

      setToken(response.accessToken);
      const userObj = getUserFromToken(response.accessToken);
      console.log('[Auth] Decoded JWT:', userObj);
      setUser(userObj);

      localStorage.setItem('token', response.accessToken);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (userData: RegisterRequest): Promise<boolean> => {
    try {
      // Registration returns 204 No Content, so no response body
      await authApi.register(userData);
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};