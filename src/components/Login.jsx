import React, { useState } from 'react';
import { FiUser, FiLock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

// Hardcoded default credentials. After a Reset Password, the new password
// is persisted to localStorage and takes precedence over PASSWORD_DEFAULT.
const USERNAME = 'admin';
const PASSWORD_DEFAULT = 'admin123';
const PASSWORD_KEY = 'assetMgmtPassword';

const getCurrentPassword = () =>
  localStorage.getItem(PASSWORD_KEY) || PASSWORD_DEFAULT;

const Login = ({ onLogin }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'reset'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const isReset = mode === 'reset';

  const switchMode = (next) => {
    setMode(next);
    setError('');
    setNotice('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirm('');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }
    if (username.trim().toLowerCase() !== USERNAME) {
      setError('Invalid username or password.');
      return;
    }
    if (password !== getCurrentPassword()) {
      setError('Invalid username or password.');
      return;
    }
    onLogin(USERNAME);
  };

  const handleReset = (e) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (!currentPassword || !newPassword || !confirm) {
      setError('All fields are required.');
      return;
    }
    if (currentPassword !== getCurrentPassword()) {
      setError('Current password is incorrect.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword === currentPassword) {
      setError('New password must be different from current password.');
      return;
    }
    if (newPassword !== confirm) {
      setError('New passwords do not match.');
      return;
    }

    localStorage.setItem(PASSWORD_KEY, newPassword);
    switchMode('login');
    setPassword('');
    setNotice('Password updated. Please sign in with your new password.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-blue-600 to-purple-700 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blurred orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400/30 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-400/30 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative animate-slide-up">
        <div className="bg-white/95 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 p-8">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-2xl mb-4 shadow-lg shadow-blue-500/30 dark:shadow-blue-900/50">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">Asset Management</h1>
            <p className="text-gray-600 dark:text-gray-400">{isReset ? 'Reset your password' : 'Admin Login'}</p>
          </div>

          {notice && (
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3 flex gap-2 mb-4">
              <FiCheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-green-700 dark:text-green-300 text-sm">{notice}</p>
            </div>
          )}

          {isReset ? (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    id="confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 flex gap-2">
                  <FiAlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={18} />
                  <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] shadow-lg shadow-blue-500/30 dark:shadow-blue-900/40 transition-all duration-200"
              >
                Update Password
              </button>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                >
                  Back to Login
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 flex gap-2">
                  <FiAlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={18} />
                  <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] shadow-lg shadow-blue-500/30 dark:shadow-blue-900/40 transition-all duration-200"
              >
                Login
              </button>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                <button
                  type="button"
                  onClick={() => switchMode('reset')}
                  className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                >
                  Reset Password
                </button>
              </p>
            </form>
          )}
        </div>

        <div className="text-center mt-6 text-blue-100">
          <p className="text-xs">React Asset Management System v1.0</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
