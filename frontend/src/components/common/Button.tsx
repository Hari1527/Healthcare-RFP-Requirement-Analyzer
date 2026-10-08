import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/formatters';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none select-none relative overflow-hidden';

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-md shadow-brand-600/20 border border-brand-400/30 hover:shadow-glow-brand active:scale-[0.98]',
    glow:
      'bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/30 hover:border-brand-400 shadow-glow-brand active:scale-[0.98]',
    secondary:
      'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/80 shadow-sm active:scale-[0.98]',
    outline:
      'border border-slate-700 bg-slate-800/40 hover:bg-slate-800/80 hover:border-slate-600 text-slate-300 active:scale-[0.98]',
    danger:
      'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-sm border border-red-500/30 active:scale-[0.98]',
    ghost:
      'bg-transparent hover:bg-white/[0.06] text-slate-300 hover:text-white',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-xs px-4 py-2.2 gap-2 font-semibold',
    lg: 'text-sm px-5 py-2.5 gap-2.5 font-semibold',
  };

  return (
    <motion.button
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    >
      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-current" /> : icon}
      {children}
    </motion.button>
  );
};
