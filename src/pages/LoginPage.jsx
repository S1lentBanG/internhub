import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      console.log("Login successful, navigating to:", from);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to log in.');
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-md w-full space-y-8 card p-8 sm:p-10">
        <div>
          <h2 className="text-center text-3xl font-bold text-text-primary">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-brand-primary hover:text-brand-accent transition-colors">
              Sign up
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <ErrorMessage title="Login Failed" message={error} />}
          <div>
            <label htmlFor="email-address" className="block text-sm font-medium text-text-secondary mb-1">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="input-field"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
                Password
              </label>
              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-brand-primary hover:text-brand-accent transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-3 disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {loading ? <LoadingSpinner size="sm" message="" /> : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}