import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default enterprise persona
    return {
      id: 'usr_enterprise_01',
      name: 'Dr. Sarah Mitchell',
      email: 's.mitchell@healthtech-solutions.com',
      role: 'Principal Proposal Director',
      organization: 'HealthTech Solutions Enterprise',
    };
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_token', 'mock_jwt_enterprise_token');
    } else {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
    }
  }, [user]);

  const login = async (email: string) => {
    const newUser = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0].replace('.', ' '),
      email,
      role: 'Proposal Reviewer',
      organization: 'Healthcare Systems Inc.',
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
