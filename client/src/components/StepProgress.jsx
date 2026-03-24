import { motion } from 'framer-motion';
import {
  CheckCircle2,
  ClipboardCheck,
  Laptop,
  PartyPopper,
  Send,
  UserRoundCog,
} from 'lucide-react';

const STEPS = [
  { key: 'SUBMITTED', label: 'Submitted', Icon: Send },
  { key: 'HR_REVIEW', label: 'HR review', Icon: ClipboardCheck },
  { key: 'MANAGER_ASSIGNED', label: 'Manager', Icon: UserRoundCog },
  { key: 'IT_SETUP', label: 'IT setup', Icon: Laptop },
  { key: 'COMPLETED', label: 'Done', Icon: PartyPopper },
];

export default function StepProgress({ currentStep }) {
  const idx = STEPS.findIndex((s) => s.key === currentStep);
  const safeIdx = idx < 0 ? 0 : idx;
  const completed = currentStep === 'COMPLETED';
  const progressPercent = completed ? 100 : ((safeIdx + 1) / STEPS.length) * 100;

  return (
    <div className="w-full space-y-6">
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <div className="flex flex-wrap justify-between gap-3">
        {STEPS.map((s, i) => {
          const done = completed || i < safeIdx;
          const active = !completed && i === safeIdx;
          const isLast = i === STEPS.length - 1;
          const Icon =
            completed && isLast ? PartyPopper : done ? CheckCircle2 : s.Icon;

          return (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              className="flex min-w-[72px] flex-1 flex-col items-center gap-2 text-center"
            >
              <motion.div
                className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 transition-colors ${
                  done
                    ? 'border-emerald-400/80 bg-emerald-50 text-emerald-600'
                    : active
                      ? 'border-violet-500 bg-violet-50 text-violet-600 shadow-md shadow-violet-500/20'
                      : 'border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-500'
                }`}
                animate={active ? { scale: [1, 1.06, 1] } : {}}
                transition={{ duration: 2, repeat: active ? Infinity : 0, ease: 'easeInOut' }}
              >
                <Icon className="h-5 w-5" strokeWidth={done || active ? 2.25 : 1.75} />
              </motion.div>
              <span
                className={`text-[11px] font-medium leading-tight sm:text-xs ${
                  active
                    ? 'text-violet-900 dark:text-violet-300'
                    : done
                      ? 'text-emerald-800 dark:text-emerald-400'
                      : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {s.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
