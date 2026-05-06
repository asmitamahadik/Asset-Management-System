import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ThemeToggle from './components/ThemeToggle';
import './App.css';

/**
 * Main App Component
 * 
 * Manages authentication state and routes between Login and Dashboard views
 */
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  /**
   * Check if user is already logged in (from localStorage)
   */
  useEffect(() => {
    const savedUserName = localStorage.getItem('assetMgmtUserName');
    if (savedUserName) {
      setUserName(savedUserName);
      setIsLoggedIn(true);
    }
  }, []);

  /**
   * Handle user login
   */
  const handleLogin = (name) => {
    setUserName(name);
    setIsLoggedIn(true);
    localStorage.setItem('assetMgmtUserName', name);
  };

  /**
   * Handle user logout
   */
  const handleLogout = () => {
    setUserName('');
    setIsLoggedIn(false);
    localStorage.removeItem('assetMgmtUserName');
  };

  return (
    <div className="App">
      <ThemeToggle />
      {isLoggedIn ? (
        <Dashboard userName={userName} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
