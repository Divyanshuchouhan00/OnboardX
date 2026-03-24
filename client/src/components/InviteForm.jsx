import { useState } from 'react';
import api from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

const roleOptions = [
  { value: 'employee', label: 'Employee' },
  { value: 'hr', label: 'HR' },
  { value: 'manager', label: 'Manager' },
];

export default function InviteForm() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('employee');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await api.post('/api/invite', { email, role });
      setSuccess(`Invite created for ${data.invite.email}`);
      setEmail('');
      setRole('employee');
      showToast('Invite created successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create invite');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Send invite</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Create a one-time signup link for a new employee, HR user, or manager.
        </p>
      </div>

      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      )}
      {success && (
        <p className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
          {success}
        </p>
      )}

      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-[minmax(0,1fr),180px,auto] sm:items-end">
        <div>
          <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">Email</label>
          <input
            type="email"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="new.user@company.com"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">Role</label>
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {submitting ? 'Sending...' : 'Send Invite'}
        </button>
      </form>
    </div>
  );
}
