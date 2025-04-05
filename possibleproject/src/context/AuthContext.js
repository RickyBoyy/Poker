import React, { createContext, useState, useContext, useEffect } from 'react';
import { userService } from '../services/userService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [displayMode, setDisplayMode] = useState('money'); // 'money' or 'bigBlinds'

  useEffect(() => {
    // Check for existing user session
    const checkUser = () => {
      try {
        const currentUser = userService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error checking user session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const login = async (username, password) => {
    try {
      // Input validation
      if (!username || !password) {
        return { success: false, error: 'Please enter both username and password' };
      }

      // Attempt to login
      const userData = userService.login(username, password);
      
      if (userData) {
        // Update user state
        setUser(userData);
        return { success: true };
      }
      
      return { success: false, error: 'Invalid username or password' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during login. Please try again.' };
    }
  };

  const register = async (userData) => {
    try {
      // Input validation
      if (!userData.username || !userData.password) {
        return { success: false, error: 'Please enter both username and password' };
      }

      // Attempt to register
      const newUser = userService.register(userData);
      
      if (newUser) {
        // Update user state
        setUser(newUser);
        return { success: true };
      }
      
      return { success: false, error: 'Registration failed. Please try again.' };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.message || 'An error occurred during registration. Please try again.' 
      };
    }
  };

  const logout = () => {
    try {
      userService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleDisplayMode = () => {
    setDisplayMode(prev => prev === 'money' ? 'bigBlinds' : 'money');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    displayMode,
    toggleDisplayMode
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 