'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  uniqueUserId: string;
  username: string;
  email: string;
  isRegistered: boolean;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUser: (username: string, email: string) => void;
  clearUser: () => void;
  showRegistration: boolean;
  setShowRegistration: (show: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'blogUser';

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setShowRegistration(!parsedUser.isRegistered);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } else {
      setShowRegistration(true);
    }
  }, []);

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Store user ID in multiple localStorage keys for compatibility
  const storeUserId = (userId: string) => {
    localStorage.setItem('unique_user_id', userId);
    localStorage.setItem('userId', userId);
  };

  // Get user ID from multiple possible storage keys
  const getUserId = (): string | null => {
    return localStorage.getItem('unique_user_id') || localStorage.getItem('userId');
  };

  const updateUser = (username: string, email: string) => {
    // Check if user already exists, preserve their UUID
    const existingUserId = user?.uniqueUserId || generateUUID();

    const newUser: User = {
      uniqueUserId: existingUserId,
      username: username.trim(),
      email: email.trim(),
      isRegistered: true
    };
    setUser(newUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    setShowRegistration(false);
  };

  const clearUser = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    setShowRegistration(true);
  };

  const value: UserContextType = {
    user,
    setUser,
    updateUser,
    clearUser,
    showRegistration,
    setShowRegistration
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
