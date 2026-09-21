import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type UserRole = 'user' | 'admin';

// Matches the JSON returned by Auth Service POST /api/v1/auth/login
export interface User {
  id: number;
  google_subject: string;
  email: string;
  name: string;
  picture: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: (googleIdToken: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:8081';
const SESSION_KEY = 'r_cloud_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, check if session still valid by hitting /profile
  useEffect(() => {
    const checkSession = async () => {
      const cached = localStorage.getItem(SESSION_KEY);
      if (cached) {
        try {
          setUser(JSON.parse(cached));
        } catch (_) {
          localStorage.removeItem(SESSION_KEY);
        }
      }
      setIsLoading(false);
    };
    checkSession();
  }, []);

  /**
   * Called after Google Sign-In returns a credential (ID token).
   * Sends it to our Auth Service which validates, creates session, returns User.
   */
  const loginWithGoogle = useCallback(async (googleIdToken: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${AUTH_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // send/receive session cookie
        body: JSON.stringify({ idToken: googleIdToken }),
      });

      if (!response.ok) {
        console.error('Auth service login failed:', response.status, await response.text());
        setIsLoading(false);
        return false;
      }

      const userData: User = await response.json();
      setUser(userData);
      localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setIsLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${AUTH_URL}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (_) {}
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginWithGoogle,
        logout,
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
