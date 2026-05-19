import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const VerifyOTP = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  
  const [email, setEmail] = useState(params.get('email') || '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isResending, setIsResending] = useState(false);
  const { verifyOtp, resendOtp } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your email address.');
      return;
    }
    setError('');
    setSuccess('');
    try {
      await verifyOtp(email, otp);
      setSuccess('Account verified successfully! Redirecting to login...');
      setTimeout(() => navigate(`/login${location.search}`), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setError('Please provide your email address to resend OTP.');
      return;
    }
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

  const maskEmail = (emailStr) => {
    if (!emailStr || !emailStr.includes('@')) return emailStr;
    const [localPart, domain] = emailStr.split('@');
    if (localPart.length <= 2) return `${localPart[0]}***@${domain}`;
    return `${localPart.substring(0, 2)}****${localPart.slice(-1)}@${domain}`;
  };

  const isEmailFromUrl = !!params.get('email');

  return (
    <div className="app-container">
      <h2>Verify Your Email</h2>
      <p className="subtitle">
        Enter the 6-digit code sent to <strong>{isEmailFromUrl ? maskEmail(email) : 'your email'}</strong>
      </p>
      
      <form onSubmit={handleSubmit}>
        {!isEmailFromUrl && (
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
        )}
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
        <button type="submit">Verify Account</button>
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

export default VerifyOTP;
