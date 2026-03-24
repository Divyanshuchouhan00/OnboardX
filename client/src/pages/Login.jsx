import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import AuthBackground from '../components/ui/AuthBackground.jsx';
import GlassCard from '../components/ui/GlassCard.jsx';
import FloatingInput from '../components/ui/FloatingInput.jsx';
import PrimaryButton from '../components/ui/PrimaryButton.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await login(email, password);
      const fallback = data.user?.role === 'manager' ? '/manager-dashboard' : '/dashboard';
      navigate(from === '/dashboard' ? fallback : from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthBackground>
      <div className="flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-500/30">
              <Sparkles className="h-6 w-6 text-white" aria-hidden />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Welcome back</h1>
            <p className="mt-2 text-sm text-slate-400">Sign in to continue your onboarding</p>
          </motion.div>

          <GlassCard>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"
                role="alert"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <FloatingInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <FloatingInput
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <PrimaryButton type="submit" disabled={submitting} variant="dark">
                {submitting ? 'Signing in…' : 'Sign in'}
              </PrimaryButton>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              No account?{' '}
              <Link
                to="/signup"
                className="font-semibold text-violet-300 transition-colors hover:text-white"
              >
                Create one
              </Link>
            </p>
          </GlassCard>
        </div>
      </div>
    </AuthBackground>
  );
}
