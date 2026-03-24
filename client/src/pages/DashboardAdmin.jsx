import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import api from '../services/api.js';
import AnalyticsOverview from '../components/admin/AnalyticsOverview.jsx';
import DashboardCard from '../components/ui/DashboardCard.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function DashboardAdmin() {
  const { showToast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [workflow, setWorkflow] = useState(null);
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const { data } = await api.get('/api/employees');
    setEmployees(data);
  }

  async function loadStats() {
    setStatsLoading(true);
    try {
      const { data } = await api.get('/api/admin/stats');
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }

  async function loadCandidates() {
    setCandidatesLoading(true);
    try {
      const { data } = await api.get('/api/employees/manager-candidates');
      setCandidates(data);
    } finally {
      setCandidatesLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        await Promise.all([load(), loadCandidates(), loadStats()]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function selectEmployee(id) {
    setSelected(id);
    setMsg('');
    setError('');
    const emp = employees.find((e) => e._id === id);
    const mgrId = emp?.assignedManager?._id || emp?.manager?._id || '';
    setSelectedManagerId(mgrId ? String(mgrId) : '');
    const { data } = await api.get(`/api/workflow/${id}`);
    setWorkflow(data);
  }

  async function assignManager() {
    if (!selected || !selectedManagerId) {
      setError('Select employee and manager');
      return;
    }
    setSaving(true);
    setMsg('');
    setError('');
    try {
      await api.patch(`/api/employees/${selected}/assign-manager`, { managerId: selectedManagerId });
      await load();
      await loadStats();
      await selectEmployee(selected);
      setMsg('Manager assigned.');
      showToast('Manager assigned');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  }

  async function completeIt() {
    if (!selected) return;
    setSaving(true);
    setMsg('');
    setError('');
    try {
      await api.patch(`/api/workflow/${selected}/complete-it-setup`);
      await load();
      await loadStats();
      await selectEmployee(selected);
      setMsg('Onboarding marked complete.');
      showToast('Onboarding completed');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8">
        <LoadingSpinner label="Loading admin…" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-start gap-3"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-lg dark:from-violet-600 dark:to-fuchsia-700">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Admin
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Analytics, manager assignment, and IT completion.
          </p>
        </div>
      </motion.div>

      <AnalyticsOverview stats={stats} loading={statsLoading} />

      {msg && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100"
        >
          {msg}
        </motion.div>
      )}
      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <DashboardCard>
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Employees</h2>
          <ul className="max-h-[400px] divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200/80 bg-slate-50/50 dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-800/30">
            {employees.map((e) => (
              <li key={e._id}>
                <button
                  type="button"
                  onClick={() => selectEmployee(e._id)}
                  className={`w-full px-4 py-3 text-left transition-colors hover:bg-white dark:hover:bg-slate-800/80 ${
                    selected === e._id
                      ? 'bg-violet-50 ring-1 ring-inset ring-violet-200/80 dark:bg-violet-950/40 dark:ring-violet-800'
                      : ''
                  }`}
                >
                  <span className="font-medium text-slate-900 dark:text-white">{e.userId?.name}</span>
                  <span className="block font-mono text-[10px] text-slate-400 dark:text-slate-500">{e._id}</span>
                </button>
              </li>
            ))}
          </ul>
        </DashboardCard>

        <DashboardCard>
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Actions</h2>
          {selected && workflow && (
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
              Workflow:{' '}
              <span className="font-mono text-xs font-semibold text-violet-700 dark:text-violet-400">
                {workflow.currentStep}
              </span>
            </p>
          )}
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Manager</label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                value={selectedManagerId}
                onChange={(e) => setSelectedManagerId(e.target.value)}
                disabled={candidatesLoading || saving}
              >
                <option value="">— Select —</option>
                {candidates.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
              {candidatesLoading && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Loading…</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={saving || !selected || !selectedManagerId}
                onClick={assignManager}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/25 transition hover:opacity-95 disabled:opacity-50"
              >
                {saving ? 'Working…' : 'Assign manager'}
              </button>
              <button
                type="button"
                disabled={saving || !selected || !workflow || workflow.currentStep !== 'IT_SETUP'}
                onClick={completeIt}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                Mark as Completed
              </button>
            </div>
            {selected && workflow?.currentStep === 'COMPLETED' && (
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Already completed.</p>
            )}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
