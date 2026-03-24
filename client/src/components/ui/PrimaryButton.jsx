import { motion } from 'framer-motion';

export default function PrimaryButton({
  children,
  type = 'button',
  disabled,
  className = '',
  variant = 'light',
  ...rest
}) {
  const base =
    variant === 'dark'
      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-900/30 hover:shadow-violet-600/25'
      : 'bg-white text-slate-900 shadow-lg shadow-black/10 hover:bg-slate-50';

  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${base} w-full ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
