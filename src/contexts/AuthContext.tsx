import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../models/types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (nom: string, prenom: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (user: Partial<User>) => Promise<void>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('validetu_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Mock login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would validate against a backend
      // For demo, we'll check if user exists in localStorage
      const storedUsers = JSON.parse(localStorage.getItem('validetu_users') || '[]');
      const user = storedUsers.find((u: any) => u.email === email);
      
      if (!user || user.password !== password) {
        throw new Error('Email ou mot de passe incorrect');
      }
      
      // Remove password from user object before storing in state
      const { password: _, ...userWithoutPassword } = user;
      setCurrentUser(userWithoutPassword);
      localStorage.setItem('validetu_user', JSON.stringify(userWithoutPassword));
    } finally {
      setLoading(false);
    }
  };

  // Mock register function
  const register = async (nom: string, prenom: string, email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would create a user in the backend
      // For demo, we'll store in localStorage
      const storedUsers = JSON.parse(localStorage.getItem('validetu_users') || '[]');
      
      // Check if email already exists
      if (storedUsers.some((u: any) => u.email === email)) {
        throw new Error('Un compte avec cet email existe déjà');
      }
      
      const newUser = {
        id: Date.now().toString(),
        nom,
        prenom,
        email,
        password // In a real app, this would be hashed
      };
      
      storedUsers.push(newUser);
      localStorage.setItem('validetu_users', JSON.stringify(storedUsers));
      
      // Remove password from user object before storing in state
      const { password: _, ...userWithoutPassword } = newUser;
      setCurrentUser(userWithoutPassword);
      localStorage.setItem('validetu_user', JSON.stringify(userWithoutPassword));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('validetu_user');
  };

  const updateProfile = async (userData: Partial<User>) => {
    setLoading(true);
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!currentUser) {
        throw new Error('Aucun utilisateur connecté');
      }
      
      // Update user in localStorage
      const storedUsers = JSON.parse(localStorage.getItem('validetu_users') || '[]');
      const userIndex = storedUsers.findIndex((u: any) => u.id === currentUser.id);
      
      if (userIndex === -1) {
        throw new Error('Utilisateur non trouvé');
      }
      
      const updatedUser = { ...storedUsers[userIndex], ...userData };
      storedUsers[userIndex] = updatedUser;
      localStorage.setItem('validetu_users', JSON.stringify(storedUsers));
      
      // Remove password from user object before storing in state
      const { password: _, ...userWithoutPassword } = updatedUser;
      setCurrentUser(userWithoutPassword);
      localStorage.setItem('validetu_user', JSON.stringify(userWithoutPassword));
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (oldPassword: string, newPassword: string) => {
    setLoading(true);
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!currentUser) {
        throw new Error('Aucun utilisateur connecté');
      }
      
      // Verify old password
      const storedUsers = JSON.parse(localStorage.getItem('validetu_users') || '[]');
      const userIndex = storedUsers.findIndex((u: any) => u.id === currentUser.id);
      
      if (userIndex === -1) {
        throw new Error('Utilisateur non trouvé');
      }
      
      if (storedUsers[userIndex].password !== oldPassword) {
        throw new Error('Ancien mot de passe incorrect');
      }
      
      // Update password
      storedUsers[userIndex].password = newPassword;
      localStorage.setItem('validetu_users', JSON.stringify(storedUsers));
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    updateProfile,
    updatePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}