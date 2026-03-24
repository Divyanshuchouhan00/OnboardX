import { motion } from 'framer-motion';

export default function LoadingSpinner({ className = '', label = 'Loading' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`} role="status" aria-live="polite">
      <motion.div
        className="h-10 w-10 rounded-full border-2 border-slate-200 border-t-violet-600 dark:border-slate-600 dark:border-t-violet-400"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.85, repeat: Infinity, ease: 'linear' }}
        aria-hidden
      />
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
}
