import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'user' | 'admin';

export interface User {
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, name?: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('r_cloud_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('r_cloud_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, name?: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const normalizedEmail = email.toLowerCase().trim();
    let role: UserRole = 'user';
    let displayName = name || normalizedEmail.split('@')[0];

    // Role assignment based on email contents
    if (normalizedEmail.includes('admin')) {
      role = 'admin';
      displayName = name || 'System Admin';
    }

    const loggedInUser: User = {
      email: normalizedEmail,
      name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
      role,
    };

    setUser(loggedInUser);
    localStorage.setItem('r_cloud_user', JSON.stringify(loggedInUser));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('r_cloud_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
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
