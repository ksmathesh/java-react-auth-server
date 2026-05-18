import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { forgotPassword } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await forgotPassword(email);
      setSuccess('OTP sent successfully! Redirecting...');
      setTimeout(() => navigate(`/reset-password?email=${encodeURIComponent(email)}`), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending OTP. Make sure the email is registered.');
    }
  };

  return (
    <div className="app-container">
      <h2>Forgot Password</h2>
      <p className="subtitle">Enter your email to receive a reset code</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email Address</label>
          <input 
            type="email" 
            placeholder="Enter your registered email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">Send OTP</button>
      </form>
      
      {error && <div className="message error">{error}</div>}
      {success && <div className="message success">{success}</div>}
      
      <div className="link-text">
        Remember your password? <Link to={`/login${location.search}`}>Sign in</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
