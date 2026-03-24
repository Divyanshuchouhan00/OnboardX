import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  FolderOpen,
  Mail,
  TrendingUp,
  UserRound,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import api from '../services/api.js';
import DashboardCard from '../components/ui/DashboardCard.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';

const statusConfig = {
  pending: {
    label: 'Pending',
    chip: 'border-yellow-400/25 bg-yellow-500/10 text-yellow-200',
    accent: 'from-yellow-500 to-amber-400',
    progress: 'bg-gradient-to-r from-yellow-500 to-amber-400',
    dot: 'bg-yellow-400',
  },
  in_progress: {
    label: 'In Progress',
    chip: 'border-sky-400/25 bg-sky-500/10 text-sky-200',
    accent: 'from-sky-500 to-cyan-400',
    progress: 'bg-gradient-to-r from-sky-500 to-cyan-400',
    dot: 'bg-sky-400',
  },
  completed: {
    label: 'Completed',
    chip: 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200',
    accent: 'from-emerald-500 to-teal-400',
    progress: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    dot: 'bg-emerald-400',
  },
};

const statCards = [
  {
    key: 'total',
    title: 'Total Employees',
    icon: Users,
    gradient: 'from-violet-600 via-fuchsia-500 to-pink-500',
  },
  {
    key: 'inProgress',
    title: 'In Progress',
    icon: TrendingUp,
    gradient: 'from-sky-600 via-cyan-500 to-teal-400',
  },
  {
    key: 'completed',
    title: 'Completed',
    icon: CheckCircle2,
    gradient: 'from-emerald-600 via-teal-500 to-lime-400',
  },
];

function formatStep(step) {
  return step.replace(/_/g, ' ');
}

function formatDate(value) {
  if (!value) return 'Not set';
  return new Date(value).toLocaleDateString();
}

export default function DashboardManager() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeView, setActiveView] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadEmployees() {
    const { data } = await api.get('/api/manager/employees');
    setEmployees(data);
    setSelectedId((current) => current || data[0]?.id || null);
  }

  useEffect(() => {
    (async () => {
      try {
        await loadEmployees();
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load manager dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    const completed = employees.filter((employee) => employee.status === 'completed').length;
    const pending = employees.filter((employee) => employee.status === 'pending').length;
    return {
      total: employees.length,
      completed,
      inProgress: employees.length - completed - pending,
    };
  }, [employees]);

  const selectedEmployee = employees.find((employee) => employee.id === selectedId) || null;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8">
        <LoadingSpinner label="Loading manager workspace..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mb-8 overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.22),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(34,211,238,0.18),_transparent_30%),linear-gradient(135deg,_rgba(15,23,42,0.98),_rgba(30,41,59,0.92))] p-7 shadow-2xl shadow-slate-950/30"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-slate-300">
              <BriefcaseBusiness className="h-3.5 w-3.5" />
              Team Oversight
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Manager Dashboard</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
              Welcome back, {user?.name}. Track assigned employees, follow onboarding stages, and review profile and document readiness from one place.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Assigned Employees</p>
              <p className="mt-2 text-2xl font-semibold text-white">{stats.total}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Completion Rate</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          const value = stats[card.key];
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * index, duration: 0.4 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className={`rounded-3xl bg-gradient-to-br ${card.gradient} p-[1px] shadow-xl shadow-slate-950/25`}
            >
              <div className="h-full rounded-3xl bg-slate-950/85 p-5 backdrop-blur-xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-300">{card.title}</p>
                    <p className="mt-4 text-4xl font-bold tracking-tight text-white">{value}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {employees.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <DashboardCard className="border-slate-800 bg-[linear-gradient(180deg,_rgba(15,23,42,0.95),_rgba(17,24,39,0.92))] text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-slate-200">
              <Users className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-semibold text-white">No employees assigned yet</h2>
            <p className="mt-2 text-sm text-slate-400">
              Once HR assigns employees to you, they will appear here with onboarding progress and review details.
            </p>
          </DashboardCard>
        </motion.div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr),380px]">
          <div className="space-y-4">
            {employees.map((employee, index) => {
              const status = statusConfig[employee.status] || statusConfig.pending;
              return (
                <motion.button
                  key={employee.id}
                  type="button"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * index, duration: 0.35 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setSelectedId(employee.id)}
                  className={`w-full rounded-[26px] border p-[1px] text-left transition ${
                    selectedId === employee.id
                      ? 'border-transparent bg-gradient-to-r from-violet-500/80 via-fuchsia-500/80 to-cyan-400/80 shadow-xl shadow-violet-950/20'
                      : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  <div className="rounded-[25px] bg-[linear-gradient(180deg,_rgba(15,23,42,0.97),_rgba(17,24,39,0.94))] p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-slate-200">
                            <UserRound className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <h2 className="truncate text-lg font-semibold text-white">{employee.name}</h2>
                            <p className="mt-1 flex items-center gap-2 truncate text-sm text-slate-400">
                              <Mail className="h-3.5 w-3.5" />
                              {employee.email}
                            </p>
                          </div>
                          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${status.chip}`}>
                            <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                            {status.label}
                          </span>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                            Stage: {formatStep(employee.currentStep)}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                            Profile: {employee.profileCompletion}%
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                            Docs: {employee.documents.approved}/{employee.documents.total || 0} approved
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedId(employee.id);
                            setActiveView('profile');
                            showToast(`Viewing ${employee.name}'s profile`);
                          }}
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
                        >
                          <UserRound className="h-4 w-4" />
                          View Profile
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedId(employee.id);
                            setActiveView('documents');
                            showToast(`Viewing ${employee.name}'s documents`);
                          }}
                          className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
                        >
                          <FolderOpen className="h-4 w-4" />
                          View Documents
                        </button>
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                        <span>Onboarding progress</span>
                        <span>{employee.progressPercent}%</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-white/5">
                        <div
                          className={`h-full rounded-full ${status.progress}`}
                          style={{ width: `${employee.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }}>
            <DashboardCard className="sticky top-24 border-slate-800 bg-[linear-gradient(180deg,_rgba(15,23,42,0.98),_rgba(17,24,39,0.94))] p-0">
              {selectedEmployee ? (
                <>
                  <div className="border-b border-white/10 px-6 py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Employee Details</p>
                        <h2 className="mt-2 text-xl font-semibold text-white">{selectedEmployee.name}</h2>
                        <p className="mt-1 text-sm text-slate-400">{selectedEmployee.email}</p>
                      </div>
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${(statusConfig[selectedEmployee.status] || statusConfig.pending).chip}`}>
                        {(statusConfig[selectedEmployee.status] || statusConfig.pending).label}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveView('profile')}
                        className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                          activeView === 'profile'
                            ? 'bg-white text-slate-900'
                            : 'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                        }`}
                      >
                        View Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveView('documents')}
                        className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                          activeView === 'documents'
                            ? 'bg-white text-slate-900'
                            : 'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                        }`}
                      >
                        View Documents
                      </button>
                    </div>
                  </div>

                  <div className="space-y-5 px-6 py-5">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Current Step</p>
                        <p className="mt-2 text-sm font-semibold text-white">{formatStep(selectedEmployee.currentStep)}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Profile Completion</p>
                        <p className="mt-2 text-sm font-semibold text-white">{selectedEmployee.profileCompletion}%</p>
                      </div>
                    </div>

                    {activeView === 'profile' ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-white">
                          <UserRound className="h-4 w-4 text-violet-300" />
                          Profile overview
                        </div>
                        {[
                          ['Phone', selectedEmployee.personalDetails.phone || 'Not provided'],
                          ['Department', selectedEmployee.personalDetails.department || 'Not provided'],
                          ['Job Title', selectedEmployee.personalDetails.jobTitle || 'Not provided'],
                          ['Start Date', formatDate(selectedEmployee.personalDetails.startDate)],
                          ['Address', selectedEmployee.personalDetails.address || 'Not provided'],
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
                            <p className="mt-1 text-sm text-slate-100">{value}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-white">
                          <FileText className="h-4 w-4 text-cyan-300" />
                          Document review
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Pending</p>
                            <p className="mt-2 text-lg font-semibold text-white">{selectedEmployee.documents.pending}</p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Approved</p>
                            <p className="mt-2 text-lg font-semibold text-white">{selectedEmployee.documents.approved}</p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Rejected</p>
                            <p className="mt-2 text-lg font-semibold text-white">{selectedEmployee.documents.rejected}</p>
                          </div>
                        </div>
                        {selectedEmployee.documents.items.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-6 text-center text-sm text-slate-400">
                            No documents uploaded yet.
                          </div>
                        ) : (
                          selectedEmployee.documents.items.map((doc) => (
                            <a
                              key={doc.id}
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
                            >
                              <div>
                                <p className="text-sm font-medium capitalize text-white">{doc.type.replace(/_/g, ' ')}</p>
                                <p className="mt-1 text-xs text-slate-400">{doc.fileName || 'Open document'}</p>
                              </div>
                              <span className="inline-flex items-center gap-1 text-sm text-cyan-300">
                                Open <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                              </span>
                            </a>
                          ))
                        )}
                      </div>
                    )}

                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                      <div className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4 text-slate-400" />
                        Last updated {formatDate(selectedEmployee.updatedAt)}
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </DashboardCard>
          </motion.div>
        </div>
      )}
    </div>
  );
}
