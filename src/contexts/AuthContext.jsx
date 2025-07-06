import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { LoadingSpinner } from '../components/LoadingSpinner';

// Create the context
const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user and token from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      const userWithRole = { ...response.data.user, role: response.data.user.role || 'student' };
      setCurrentUser(userWithRole);

      // Store token and user in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(userWithRole));

      setLoading(false);
      return userWithRole;
    } catch (error) {
      setLoading(false);
      console.error('AuthContext: Login error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      const userWithRole = { ...response.data.user, role: response.data.user.role || 'student' };
      setCurrentUser(userWithRole);

      // Store token and user in localStorage (auto-login after register)
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(userWithRole));

      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      console.error('AuthContext: Registration error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = async () => {
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setLoading(false);
  };

  const value = {
    currentUser,
    setCurrentUser,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};