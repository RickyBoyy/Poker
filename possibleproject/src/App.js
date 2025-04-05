import "./App.css";
import { Route, BrowserRouter as Router, Routes, Link, Navigate } from "react-router-dom";
import RegisterPage from "./pages/Register";
import LoginPage from "./pages/Login";
import HomePage from "./pages/Home";
import GamePage from "./pages/Game";
import BotSelection from "./components/BotSelection";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import { useState } from "react";

function AppContent() {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="App">
      <Router>
        <nav className="navbar">
          <div className="nav-brand">
            <Link to="/">deepPoker</Link>
          </div>
          <div className="nav-links">
            <Link to="/play">Play</Link>
            {user ? (
              <div className="user-menu">
                <button 
                  className="user-button"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <span className="user-icon">👤</span>
                  <span className="username">{user.username}</span>
                </button>
                {showDropdown && (
                  <div className="dropdown-menu">
                    <div className="user-info">
                      <p>Username: {user.username}</p>
                      <p>Chips: {user.chips || 0}</p>
                    </div>
                    <button onClick={logout} className="logout-button">Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/play" element={<BotSelection />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
