import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await signup(username, email, password);
      setSuccess('Account created! Check your email for the OTP...');
      const params = new URLSearchParams(window.location.search);
      params.set('email', email);
      setTimeout(() => navigate(`/verify-otp?${params.toString()}`), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating account. Username or email might be taken.');
    }
  };

  return (
    <div className="app-container">
      <h2>Create Account</h2>
      <p className="subtitle">Join us to secure your data</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input 
            type="text" 
            placeholder="Choose a username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input 
            type="email" 
            placeholder="Enter your email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            placeholder="Create a password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">Sign Up</button>
      </form>
      
      {error && <div className="message error">{error}</div>}
      {success && <div className="message success">{success}</div>}
      
      <div className="link-text">
        Already have an account? <Link to={`/login${window.location.search}`}>Sign in</Link>
      </div>
    </div>
  );
};

export default Signup;
