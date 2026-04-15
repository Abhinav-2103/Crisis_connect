import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, Mail, Lock, User, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'user',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, signup, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setIsLoading(false);
          return;
        }
        await signup(formData.email, formData.password, formData.name, formData.role);
      }
      navigate('/');
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-950 text-white flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-semibold mb-2">CrisisConnect</h1>
          <p className="text-gray-400">Emergency Response Platform</p>
        </div>

        {/* Auth Card */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900/80 via-purple-900/20 to-slate-900/80 border border-white/20 backdrop-blur-xl shadow-2xl">
          {/* Toggle Tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-white/10 rounded-xl">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-lg transition-all duration-200 ${
                isLogin
                  ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-lg transition-all duration-200 ${
                !isLogin
                  ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name (Signup only) */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required={!isLogin}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>
              </motion.div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
              {!isLogin && (
                <p className="text-xs text-gray-400 mt-1">At least 6 characters</p>
              )}
            </div>

            {/* Role (Signup only) */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-sm font-medium mb-2">I want to...</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none"
                  >
                    <option value="user">Request Help</option>
                    <option value="volunteer">Volunteer to Help</option>
                    <option value="admin">Coordinate Response (Admin)</option>
                  </select>
                </div>
              </motion.div>
            )}

            {/* Forgot Password (Login only) */}
            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
            </button>
          </form>

          {/* Demo Credentials */}
          {isLogin && (
            <div className="mt-6 space-y-3">
              <p className="text-xs font-semibold text-purple-300 mb-3">
                🎭 Demo Accounts - Try Different Roles:
              </p>
              
              {/* Admin Account */}
              <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/40 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-xs bg-purple-500/30 text-purple-300 rounded-full border border-purple-500/50 font-medium">
                    ADMIN
                  </span>
                  <span className="text-xs text-gray-400">Full Dashboard Access</span>
                </div>
                <p className="text-xs text-gray-300">
                  <strong>Email:</strong> admin@crisisconnect.com<br />
                  <strong>Password:</strong> demo123
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Access: All needs, volunteers, analytics dashboard, chat, leaderboard
                </p>
              </div>

              {/* Volunteer Account */}
              <div className="p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/40 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-xs bg-blue-500/30 text-blue-300 rounded-full border border-blue-500/50 font-medium">
                    VOLUNTEER
                  </span>
                  <span className="text-xs text-gray-400">Help People in Need</span>
                </div>
                <p className="text-xs text-gray-300">
                  <strong>Email:</strong> volunteer@crisisconnect.com<br />
                  <strong>Password:</strong> demo123
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Access: Available needs, personal stats, leaderboard, chat
                </p>
              </div>

              {/* User Account */}
              <div className="p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-xs bg-green-500/30 text-green-300 rounded-full border border-green-500/50 font-medium">
                    USER
                  </span>
                  <span className="text-xs text-gray-400">Request Emergency Help</span>
                </div>
                <p className="text-xs text-gray-300">
                  <strong>Email:</strong> user@crisisconnect.com<br />
                  <strong>Password:</strong> demo123
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Access: Post needs, my requests, volunteers, chat
                </p>
              </div>

              <p className="text-xs text-gray-500 text-center mt-3">
                💡 You can use any password with 6+ characters for demo accounts
              </p>
            </div>
          )}

          {/* Terms (Signup only) */}
          {!isLogin && (
            <p className="mt-6 text-xs text-center text-gray-400">
              By signing up, you agree to our{' '}
              <a href="#" className="text-purple-400 hover:text-purple-300">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-purple-400 hover:text-purple-300">
                Privacy Policy
              </a>
            </p>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>Need immediate emergency assistance?</p>
          <p className="text-purple-400 font-medium mt-1">Call 911 or your local emergency number</p>
        </div>
      </motion.div>
    </div>
  );
}