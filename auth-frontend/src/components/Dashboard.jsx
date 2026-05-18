import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [protectedData, setProtectedData] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProtectedData = async () => {
      try {
        const response = await axios.get('/test/user');
        setProtectedData(response.data);
      } catch (err) {
        setError('Failed to fetch protected data. Token might be expired.');
        if (err.response && err.response.status === 401) {
          logout();
        }
      }
    };

    fetchProtectedData();
  }, [token, navigate, logout]);

  if (!token) return null;

  return (
    <div className="app-container dashboard-container">
      <div className="navbar">
        <h2>AuthHub Dashboard</h2>
        <button className="btn-secondary" onClick={logout}>Sign Out</button>
      </div>
      
      <p>Welcome to your secure dashboard! Only authenticated users can see this page.</p>
      
      <div className="data-card">
        <h3>User Profile Details</h3>
        <p><strong>Username:</strong> {user?.username}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Roles:</strong> {user?.roles?.join(', ')}</p>
      </div>

      <div className="data-card">
        <h3>Server Response (Protected API)</h3>
        {error ? (
          <p className="message error">{error}</p>
        ) : (
          <pre>{protectedData || 'Loading secure data...'}</pre>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
