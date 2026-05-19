import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const [step, setStep] = useState(1);
  
  // Step 1 State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Step 2 State
  const [otp, setOtp] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  
  // UI State
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signup, verifyOtp, updateUnverifiedEmail } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      await signup(username, email, password);
      setSuccess('Account created! Check your email for the OTP.');
      setStep(2);
      setNewEmail(email); // Pre-fill in case they edit
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating account. Username or email might be taken.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      await verifyOtp(isEditingEmail ? newEmail : email, otp);
      setSuccess('Account verified successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail) {
      setError('Please provide a new email address.');
      return;
    }
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      await updateUnverifiedEmail(username, password, newEmail);
      setEmail(newEmail);
      setIsEditingEmail(false);
      setSuccess('Email updated securely! A new OTP has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating email.');
    } finally {
      setIsLoading(false);
    }
  };

  const maskEmail = (emailStr) => {
    if (!emailStr || !emailStr.includes('@')) return emailStr;
    const [localPart, domain] = emailStr.split('@');
    if (localPart.length <= 2) return `${localPart[0]}***@${domain}`;
    return `${localPart.substring(0, 2)}****${localPart.slice(-1)}@${domain}`;
  };

  return (
    <div className="app-container">
      {step === 1 ? (
        <>
          <h2>Create Account</h2>
          <p className="subtitle">Join us to secure your data</p>
          
          <form onSubmit={handleSignupSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input 
                type="text" 
                placeholder="Choose a username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
                disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Sign Up'}
            </button>
          </form>
          
          {error && <div className="message error">{error}</div>}
          
          <div className="link-text">
            Already have an account? <Link to={`/login${window.location.search}`}>Sign in</Link>
          </div>
        </>
      ) : (
        <>
          <h2>Verify Your Email</h2>
          
          {!isEditingEmail ? (
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <p style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                OTP sent to <strong>{maskEmail(email)}</strong>
              </p>
              <button 
                type="button" 
                onClick={() => setIsEditingEmail(true)}
                style={{
                  background: 'none', border: 'none', color: 'var(--text-muted)', 
                  padding: 0, margin: 0, width: 'auto', display: 'inline', 
                  fontSize: '0.875rem', textDecoration: 'underline', cursor: 'pointer'
                }}
              >
                ✏️ Typo? Wrong Email?
              </button>
            </div>
          ) : (
            <div className="form-group" style={{ marginBottom: '1.5rem', background: '#f9fafb', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <label>Update Email Address</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input 
                  type="email" 
                  value={newEmail} 
                  onChange={(e) => setNewEmail(e.target.value)} 
                  disabled={isLoading}
                />
                <button 
                  type="button" 
                  onClick={handleUpdateEmail} 
                  disabled={isLoading || newEmail === email}
                  style={{ marginTop: 0, width: 'auto', whiteSpace: 'nowrap' }}
                >
                  Update & Resend
                </button>
              </div>
              <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => { setIsEditingEmail(false); setError(''); setSuccess(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', width: 'auto', padding: 0, fontSize: '0.8rem', cursor: 'pointer', margin: 0 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          <form onSubmit={handleVerifySubmit}>
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
                disabled={isLoading}
              />
            </div>
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify Account'}
            </button>
          </form>
          
          {error && <div className="message error">{error}</div>}
          {success && <div className="message success">{success}</div>}
        </>
      )}
    </div>
  );
};

export default Signup;
