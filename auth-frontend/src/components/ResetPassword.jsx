import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const ResetPassword = () => {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isResending, setIsResending] = useState(false);
  const { resetPassword, resendOtp } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const params = new URLSearchParams(location.search);
  const email = params.get('email');

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await resetPassword(email, otp, newPassword);
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP or error resetting password.');
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;
    setError('');
    setSuccess('');
    setIsResending(true);
    try {
      await resendOtp(email);
      setSuccess('A new OTP has been sent to your email!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="app-container">
      <h2>Reset Password</h2>
      <p className="subtitle">Enter the 6-digit code sent to {email}</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>One-Time Password</label>
          <input 
            type="text" 
            placeholder="Enter 6-digit OTP" 
            value={otp} 
            onChange={(e) => setOtp(e.target.value)} 
            maxLength={6}
            style={{ letterSpacing: '0.5rem', textAlign: 'center', fontSize: '1.5rem' }}
            required 
          />
        </div>
        <div className="form-group">
          <label>New Password</label>
          <input 
            type="password" 
            placeholder="Enter new password" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">Reset Password</button>
      </form>
      
      {error && <div className="message error">{error}</div>}
      {success && <div className="message success">{success}</div>}

      <div className="link-text" style={{ marginTop: '1.5rem' }}>
        Didn't receive the code?{' '}
        <button 
          type="button" 
          onClick={handleResendOtp} 
          disabled={isResending}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary-color)',
            padding: 0,
            margin: 0,
            width: 'auto',
            display: 'inline',
            fontWeight: 500,
            textDecoration: 'underline',
            cursor: isResending ? 'not-allowed' : 'pointer',
            opacity: isResending ? 0.6 : 1
          }}
        >
          {isResending ? 'Sending...' : 'Resend OTP'}
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
