import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/formatters';

interface CardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  glowing?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  title,
  subtitle,
  action,
  glowing = false,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'glass-panel rounded-2xl relative overflow-hidden transition-all',
        glowing && 'border-brand-500/30 shadow-glow-brand',
        className
      )}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className="px-6 py-4.5 border-b border-white/[0.06] flex items-center justify-between gap-4 bg-white/[0.015]">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-slate-100 tracking-tight flex items-center gap-2">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5 font-normal">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </motion.div>
  );
};
