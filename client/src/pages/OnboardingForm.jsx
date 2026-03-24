import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../services/api.js';
import DashboardCard from '../components/ui/DashboardCard.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import PrimaryButton from '../components/ui/PrimaryButton.jsx';
import { useToast } from '../context/ToastContext.jsx';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100';

export default function OnboardingForm() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    phone: '',
    address: '',
    department: '',
    jobTitle: '',
    startDate: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/api/employees/me');
        setProfile(data);
        const pd = data.personalDetails || {};
        setForm({
          phone: pd.phone || '',
          address: pd.address || '',
          department: pd.department || '',
          jobTitle: pd.jobTitle || '',
          startDate: pd.startDate ? pd.startDate.slice(0, 10) : '',
        });
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { data } = await api.patch('/api/employees/me', {
        personalDetails: {
          ...form,
          startDate: form.startDate ? new Date(form.startDate) : undefined,
        },
      });
      setProfile(data);
      showToast('Profile saved successfully');
    } catch (e) {
      setError(e.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-8">
        <LoadingSpinner label="Loading profile…" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-violet-600 transition hover:text-violet-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Onboarding details</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Tell us about your role and how to reach you.</p>
      </motion.div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      <DashboardCard delay={0.05}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
            <input
              className={inputClass}
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
            <textarea
              className={`${inputClass} min-h-[80px] resize-y`}
              rows={2}
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Department</label>
            <input
              className={inputClass}
              value={form.department}
              onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Job title</label>
            <input
              className={inputClass}
              value={form.jobTitle}
              onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Start date</label>
            <input
              type="date"
              className={inputClass}
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            />
          </div>
          <PrimaryButton type="submit" disabled={saving} variant="dark" className="!w-auto inline-flex items-center gap-2">
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save changes'}
          </PrimaryButton>
        </form>
      </DashboardCard>

      {profile && (
        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Profile status:{' '}
          <span className="font-medium text-slate-700 dark:text-slate-200">{profile.status}</span>
        </p>
      )}
    </div>
  );
}
