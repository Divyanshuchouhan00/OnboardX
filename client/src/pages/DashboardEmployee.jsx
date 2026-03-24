import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, RefreshCw, Sparkles, User } from 'lucide-react';
import api from '../services/api.js';
import StepProgress from '../components/StepProgress.jsx';
import DashboardCard from '../components/ui/DashboardCard.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function DashboardEmployee() {
  const { showToast } = useToast();
  const [workflow, setWorkflow] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  async function fetchDashboard() {
    setError('');
    const [w, p] = await Promise.all([
      api.get('/api/workflow/me'),
      api.get('/api/employees/me'),
    ]);
    setWorkflow(w.data);
    setProfile(p.data);
  }

  useEffect(() => {
    (async () => {
      try {
        await fetchDashboard();
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function refresh() {
    setRefreshing(true);
    try {
      await fetchDashboard();
      showToast('Status updated');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load');
    } finally {
      setRefreshing(false);
    }
  }

  const manager = profile?.assignedManager || profile?.manager;
  const isDone = workflow?.currentStep === 'COMPLETED';

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-8">
        <LoadingSpinner label="Loading your workspace…" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          {profile?.userId?.name ? `Hi, ${profile.userId.name}` : 'Welcome'}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {isDone ? 'Your onboarding journey is complete.' : 'Track progress and finish your onboarding steps.'}
        </p>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
        >
          {error}
        </motion.div>
      )}

      {isDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 flex items-center gap-3 rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-4 text-emerald-900 shadow-sm dark:border-emerald-800/60 dark:from-emerald-950/50 dark:to-teal-950/50 dark:text-emerald-100"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl shadow-sm dark:bg-slate-800">
            🎉
          </span>
          <div>
            <p className="font-semibold text-emerald-950 dark:text-emerald-50">Onboarding Completed Successfully</p>
            <p className="text-sm text-emerald-800/90 dark:text-emerald-200/90">You’re all set — welcome aboard.</p>
          </div>
        </motion.div>
      )}

      <DashboardCard className="mb-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Your progress</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Steps update as HR and IT complete their tasks.</p>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-800 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-violet-500/40 dark:hover:bg-violet-950/40 dark:hover:text-violet-300"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Updating…' : 'Refresh'}
          </button>
        </div>
        {workflow && <StepProgress currentStep={workflow.currentStep} />}
        <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
          Current step:{' '}
          <span className="font-mono text-xs font-semibold text-violet-700 dark:text-violet-400">
            {workflow?.currentStep}
          </span>
        </p>
        {manager && (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Your manager:{' '}
            <strong className="text-slate-900 dark:text-white">{manager.name}</strong>
            <span className="text-slate-400 dark:text-slate-500"> ({manager.email})</span>
          </p>
        )}
      </DashboardCard>

      {!isDone && (
        <div className="grid gap-4 sm:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link
              to="/employee/onboarding"
              className="group block h-full rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:border-violet-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-violet-500/40"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700 transition group-hover:scale-105">
                <User className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Profile & details</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Personal info and role</p>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-violet-600">
                Continue <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Link
              to="/employee/documents"
              className="group block h-full rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:border-violet-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-violet-500/40"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-fuchsia-100 text-fuchsia-700 transition group-hover:scale-105">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Documents</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Upload for HR review</p>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-violet-600">
                Upload <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          </motion.div>
        </div>
      )}

      {!isDone && (
        <p className="mt-10 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <Sparkles className="h-3.5 w-3.5" />
          Tip: refresh after HR actions to see the latest step.
        </p>
      )}
    </div>
  );
}
