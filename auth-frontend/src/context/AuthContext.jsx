import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const navigate = useNavigate();

  // Configure axios defaults
  axios.defaults.baseURL = 'http://localhost:8080/api';

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  }, [token, user]);

  const login = async (username, password) => {
    const response = await axios.post('/auth/login', { username, password });
    setToken(response.data.accessToken);
    setUser(response.data);
    
    // Check for an external redirect parameter
    const params = new URLSearchParams(window.location.search);
    const redirectUrl = params.get('redirect');
    
    if (redirectUrl) {
      // Append token to the external URL
      const hasQueryParams = redirectUrl.includes('?');
      window.location.href = `${redirectUrl}${hasQueryParams ? '&' : '?'}token=${response.data.accessToken}`;
    } else {
      navigate('/dashboard');
    }
    
    return response.data;
  };

  const signup = async (username, email, password) => {
    const response = await axios.post('/auth/signup', { username, email, password });
    return response.data;
  };

  const verifyOtp = async (email, otp) => {
    const response = await axios.post('/auth/verify-otp', { email, otp });
    return response.data;
  };

  const forgotPassword = async (email) => {
    const response = await axios.post('/auth/forgot-password', { email });
    return response.data;
  };

  const resetPassword = async (email, otp, newPassword) => {
    const response = await axios.post('/auth/reset-password', { email, otp, newPassword });
    return response.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, verifyOtp, forgotPassword, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
