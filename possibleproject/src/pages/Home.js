import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Deep Poker</h1>
          <p>Experience the thrill of poker with AI-powered opponents</p>
          <div className="hero-buttons">
            <button 
              className="primary-button"
              onClick={() => navigate('/game')}
            >
              <i className="fas fa-play"></i>
              <span>Play Now</span>
            </button>
            <button 
              className="secondary-button"
              onClick={() => navigate('/multiplayer')}
            >
              <i className="fas fa-users"></i>
              <span>Multiplayer</span>
            </button>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2>Why Choose Deep Poker?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <i className="fas fa-robot"></i>
            <h3>AI Opponents</h3>
            <p>Challenge our advanced AI that adapts to your playing style</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-trophy"></i>
            <h3>Skill Development</h3>
            <p>Improve your poker skills with detailed hand analysis</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-users"></i>
            <h3>Multiplayer</h3>
            <p>Play against real opponents in our multiplayer mode</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-chart-line"></i>
            <h3>Statistics</h3>
            <p>Track your progress with comprehensive statistics</p>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <div className="cta-content">
          <h2>Ready to Play?</h2>
          <p>Join thousands of players and start your poker journey today</p>
          <div className="cta-buttons">
            <button 
              className="primary-button"
              onClick={() => navigate('/register')}
            >
              <i className="fas fa-user-plus"></i>
              <span>Create Account</span>
            </button>
            <button 
              className="secondary-button"
              onClick={() => navigate('/login')}
            >
              <i className="fas fa-sign-in-alt"></i>
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 