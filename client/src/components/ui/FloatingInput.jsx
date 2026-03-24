import { useId, useState } from 'react';

export default function FloatingInput({
  label,
  type = 'text',
  value,
  onChange,
  required,
  minLength,
  autoComplete,
  disabled,
  className = '',
}) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const float = focused || (value != null && String(value).length > 0);

  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="peer w-full rounded-xl border border-white/10 bg-white/5 px-4 pt-6 pb-2.5 text-sm text-white outline-none transition-all focus:border-violet-400/50 focus:bg-white/10 focus:ring-2 focus:ring-violet-500/30"
      />
      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-4 z-10 origin-left font-medium transition-all duration-200 ease-out ${
          float
            ? 'top-2.5 text-[11px] text-violet-300'
            : 'top-1/2 -translate-y-1/2 text-sm text-slate-400'
        }`}
      >
        {label}
        {required && <span className="text-rose-400/90"> *</span>}
      </label>
    </div>
  );
}
