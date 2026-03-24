import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList } from 'lucide-react';
import api from '../services/api.js';
import InviteForm from '../components/InviteForm.jsx';
import DashboardCard from '../components/ui/DashboardCard.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function DashboardHR() {
  const { showToast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [docs, setDocs] = useState([]);
  const [workflow, setWorkflow] = useState(null);
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [loading, setLoading] = useState(true);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [note, setNote] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');
  const [completeLoading, setCompleteLoading] = useState(false);
  const [completeSuccess, setCompleteSuccess] = useState('');
  const [completeError, setCompleteError] = useState('');

  async function loadEmployees() {
    const { data } = await api.get('/api/employees');
    setEmployees(data);
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
        await Promise.all([loadEmployees(), loadCandidates()]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function selectEmployee(id) {
    setSelected(id);
    setNote('');
    setAssignError('');
    setAssignSuccess('');
    setCompleteSuccess('');
    setCompleteError('');
    const emp = employees.find((e) => e._id === id);
    const mgrId = emp?.assignedManager?._id || emp?.manager?._id || '';
    setSelectedManagerId(mgrId ? String(mgrId) : '');
    const [d, w] = await Promise.all([
      api.get(`/api/documents/employee/${id}`),
      api.get(`/api/workflow/${id}`),
    ]);
    setDocs(d.data);
    setWorkflow(w.data);
  }

  async function review(docId, status) {
    setBusyId(docId);
    try {
      await api.patch(`/api/documents/${docId}/review`, { status, note });
      if (selected) await selectEmployee(selected);
      await loadEmployees();
      showToast(status === 'approved' ? 'Document approved' : 'Document rejected');
    } finally {
      setBusyId(null);
    }
  }

  async function handleAssignManager() {
    if (!selected || !selectedManagerId) {
      setAssignError('Select an employee and a manager.');
      return;
    }
    setAssignLoading(true);
    setAssignError('');
    setAssignSuccess('');
    try {
      await api.patch(`/api/employees/${selected}/assign-manager`, {
        managerId: selectedManagerId,
      });
      await loadEmployees();
      await selectEmployee(selected);
      setAssignSuccess('Manager assigned. Workflow updated when eligible.');
      showToast('Manager assigned');
    } catch (e) {
      setAssignError(e.response?.data?.message || 'Assignment failed');
    } finally {
      setAssignLoading(false);
    }
  }

  async function handleMarkCompleted() {
    if (!selected) return;
    setCompleteLoading(true);
    setCompleteError('');
    setCompleteSuccess('');
    try {
      await api.patch(`/api/workflow/${selected}/complete-it-setup`);
      await loadEmployees();
      await selectEmployee(selected);
      setCompleteSuccess('Onboarding marked as completed.');
      showToast('Onboarding completed');
    } catch (e) {
      setCompleteError(e.response?.data?.message || 'Could not complete onboarding');
    } finally {
      setCompleteLoading(false);
    }
  }

  const selectedEmp = employees.find((e) => e._id === selected);
  const displayManager = selectedEmp?.assignedManager || selectedEmp?.manager;

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-8">
        <LoadingSpinner label="Loading HR workspace…" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-start gap-3"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/25">
          <ClipboardList className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">HR review</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Approve documents, assign managers, and close onboarding when IT is done.
          </p>
        </div>
      </motion.div>

      <div className="mb-6">
        <InviteForm />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <DashboardCard>
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Employees</h2>
          <ul className="max-h-[480px] divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200/80 bg-slate-50/50 dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-800/30">
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
                  <span className="block text-xs text-slate-500 dark:text-slate-400">{e.userId?.email}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Status: {e.status}</span>
                  {(e.assignedManager || e.manager) && (
                    <span className="mt-0.5 block text-xs text-violet-700 dark:text-violet-400">
                      Manager: {(e.assignedManager || e.manager)?.name}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </DashboardCard>

        <DashboardCard>
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Documents & workflow</h2>
          {!selected && (
            <p className="text-sm text-slate-500 dark:text-slate-400">Select an employee to review documents.</p>
          )}
          {selected && workflow && (
            <div className="mb-3 space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Workflow:{' '}
                <strong className="text-slate-900 dark:text-white">{workflow.currentStep}</strong>
              </p>
              {workflow.currentStep === 'IT_SETUP' && (
                <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-800/50">
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    IT has finished provisioning. Mark onboarding complete when ready.
                  </p>
                  {completeError && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">
                      {completeError}
                    </p>
                  )}
                  {completeSuccess && (
                    <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                      {completeSuccess}
                    </p>
                  )}
                  <button
                    type="button"
                    disabled={completeLoading}
                    onClick={handleMarkCompleted}
                    className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-violet-600 dark:hover:bg-violet-500 sm:w-auto"
                  >
                    {completeLoading ? 'Saving…' : 'Mark as Completed'}
                  </button>
                </div>
              )}
              {workflow.currentStep === 'COMPLETED' && (
                <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                  Onboarding completed for this employee.
                </p>
              )}
            </div>
          )}
          {selected && displayManager && (
            <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
              Assigned manager:{' '}
              <strong className="text-slate-900 dark:text-white">{displayManager.name}</strong>
              <span className="text-slate-500 dark:text-slate-500"> ({displayManager.email})</span>
            </p>
          )}
          {selected && (
            <div className="space-y-3">
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-800/40">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Manager assignment</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  When workflow is at <strong>MANAGER_ASSIGNED</strong>, assigning a manager moves it to{' '}
                  <strong>IT_SETUP</strong>.
                </p>
                <div>
                  <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">Select manager</label>
                  <select
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                    value={selectedManagerId}
                    onChange={(e) => setSelectedManagerId(e.target.value)}
                    disabled={candidatesLoading || assignLoading}
                  >
                    <option value="">— Choose admin, HR, or manager —</option>
                    {candidates.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.role}) — {u.email}
                      </option>
                    ))}
                  </select>
                  {candidatesLoading && (
                    <p className="text-xs text-slate-500 mt-1">Loading managers…</p>
                  )}
                </div>
                {assignError && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">
                    {assignError}
                  </p>
                )}
                {assignSuccess && (
                  <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                    {assignSuccess}
                  </p>
                )}
                <button
                  type="button"
                  disabled={assignLoading || !selectedManagerId}
                  onClick={handleAssignManager}
                  className="px-4 py-2 rounded-lg bg-brand-700 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50"
                >
                  {assignLoading ? 'Assigning…' : 'Assign manager'}
                </button>
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">Review note (optional)</label>
                <input
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Please re-upload a clearer scan"
                />
              </div>
              <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white dark:divide-slate-700 dark:border-slate-600 dark:bg-slate-800/40">
                {docs.map((d) => (
                  <li
                    key={d._id}
                    className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="font-medium capitalize text-slate-900 dark:text-white">{d.type}</div>
                      <a
                        href={d.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-violet-600 hover:underline dark:text-violet-400"
                      >
                        Open file
                      </a>
                      <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">{d.verificationStatus}</span>
                    </div>
                    {d.verificationStatus === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={busyId === d._id}
                          onClick={() => review(d._id, 'approved')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-500 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={busyId === d._id}
                          onClick={() => review(d._id, 'rejected')}
                          className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm hover:bg-red-500 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </li>
                ))}
                {docs.length === 0 && (
                  <li className="p-4 text-sm text-slate-500 dark:text-slate-400">No documents.</li>
                )}
              </ul>
            </div>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}
