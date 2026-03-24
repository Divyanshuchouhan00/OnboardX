import { motion } from 'framer-motion';

export default function DashboardCard({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-900/5 transition-all duration-200 hover:shadow-md hover:shadow-slate-900/10 dark:border-slate-700/80 dark:bg-slate-900/60 dark:shadow-black/20 dark:hover:shadow-lg dark:hover:shadow-black/30 ${className}`}
    >
      {children}
    </motion.div>
  );
}
