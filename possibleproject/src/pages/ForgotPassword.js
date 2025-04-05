import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import '../styles/ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authService.requestPasswordReset(email);
      setSuccess('Password reset email sent! Please check your inbox.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-form">
        <div className="forgot-password-header">
          <h2>Reset Password</h2>
          <p>Enter your email to receive a password reset link</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <div className="input-with-icon">
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="reset-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                <span>Sending Reset Link...</span>
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i>
                <span>Send Reset Link</span>
              </>
            )}
          </button>
        </form>

        <div className="form-footer">
          <p>Remember your password? <a href="/login">Sign In</a></p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 