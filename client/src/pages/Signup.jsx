import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import AuthBackground from '../components/ui/AuthBackground.jsx';
import GlassCard from '../components/ui/GlassCard.jsx';
import FloatingInput from '../components/ui/FloatingInput.jsx';
import PrimaryButton from '../components/ui/PrimaryButton.jsx';
import api from '../services/api.js';

export default function Signup() {
  const { signup, signupWithInvite } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('token');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(Boolean(inviteToken));
  const [inviteRole, setInviteRole] = useState('');

  useEffect(() => {
    if (!inviteToken) {
      setInviteLoading(false);
      setInviteRole('');
      return;
    }

    let active = true;

    (async () => {
      setInviteLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/api/invite/${inviteToken}`);
        if (!active) return;
        setEmail(data.email);
        setInviteRole(data.role);
      } catch (err) {
        if (!active) return;
        setError(err.response?.data?.message || 'Invite is not valid');
      } finally {
        if (active) {
          setInviteLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [inviteToken]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      if (inviteToken) {
        await signupWithInvite({ name, email, password, token: inviteToken });
        setSuccess('Invitation accepted successfully');
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1000);
        return;
      }

      await signup({ name, email, password, role: 'employee' });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Create your account</h1>
            <p className="mt-2 text-sm text-slate-400">
              {inviteToken ? 'Complete your invited account setup' : 'Start your employee onboarding in minutes'}
            </p>
          </motion.div>

          <GlassCard>
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"
                role="alert"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100"
                role="status"
              >
                {success}
              </motion.div>
            )}
            {inviteToken && inviteRole && !error && (
              <div className="mb-4 rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 py-3 text-sm text-violet-100">
                Invite role: <strong className="capitalize">{inviteRole}</strong>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <FloatingInput label="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
              <FloatingInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={Boolean(inviteToken)}
              />
              <FloatingInput
                label="Password (min 6 characters)"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
              <PrimaryButton
                type="submit"
                disabled={submitting || inviteLoading || Boolean(inviteToken && error)}
                variant="dark"
              >
                {inviteLoading ? 'Validating invite...' : submitting ? 'Creating...' : 'Create account'}
              </PrimaryButton>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-violet-300 transition-colors hover:text-white">
                Sign in
              </Link>
            </p>
          </GlassCard>
        </div>
      </div>
    </AuthBackground>
  );
}
