import { motion } from 'framer-motion';
import { BarChart3, CheckCircle2, Clock, Users } from 'lucide-react';
import DashboardCard from '../ui/DashboardCard.jsx';
import LoadingSpinner from '../ui/LoadingSpinner.jsx';

const statConfig = [
  {
    key: 'totalEmployees',
    title: 'Total employees',
    Icon: Users,
    accent: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-100 dark:bg-violet-950/50',
  },
  {
    key: 'pendingHR',
    title: 'Pending HR review',
    Icon: Clock,
    accent: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-950/50',
  },
  {
    key: 'inProgress',
    title: 'In progress',
    Icon: BarChart3,
    accent: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-100 dark:bg-sky-950/50',
  },
  {
    key: 'completed',
    title: 'Completed',
    Icon: CheckCircle2,
    accent: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-950/50',
  },
];

function BarRow({ label, value, max, colorClass }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <motion.div
          className={`h-full rounded-full ${colorClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

export default function AnalyticsOverview({ stats, loading }) {
  if (loading || !stats) {
    return (
      <div className="mb-8 flex min-h-[120px] items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
        <LoadingSpinner label="Loading insights…" />
      </div>
    );
  }

  const maxBar = Math.max(
    stats.totalEmployees,
    stats.pendingHR,
    stats.inProgress,
    stats.completed,
    1
  );

  return (
    <div className="mb-10 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Insights</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Live counts from workflows and profiles.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statConfig.map((s, i) => {
          const Icon = s.Icon;
          const value = stats[s.key] ?? 0;
          return (
            <DashboardCard key={s.key} delay={0.05 * i} className="!p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {s.title}
                  </p>
                  <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900 dark:text-white">{value}</p>
                </div>
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.bg}`}>
                  <Icon className={`h-5 w-5 ${s.accent}`} strokeWidth={2} />
                </div>
              </div>
            </DashboardCard>
          );
        })}
      </div>

      <DashboardCard delay={0.2} className="!p-5">
        <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Pipeline overview</h3>
        <div className="space-y-4">
          <BarRow
            label="Total employees"
            value={stats.totalEmployees}
            max={maxBar}
            colorClass="bg-gradient-to-r from-violet-500 to-fuchsia-500"
          />
          <BarRow
            label="Pending HR"
            value={stats.pendingHR}
            max={maxBar}
            colorClass="bg-amber-500"
          />
          <BarRow
            label="In progress"
            value={stats.inProgress}
            max={maxBar}
            colorClass="bg-sky-500"
          />
          <BarRow
            label="Completed"
            value={stats.completed}
            max={maxBar}
            colorClass="bg-emerald-500"
          />
        </div>
      </DashboardCard>
    </div>
  );
}
