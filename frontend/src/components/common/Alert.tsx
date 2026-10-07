import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '../../utils/formatters';

interface AlertProps {
  type?: 'error' | 'warning' | 'success' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  onClose,
  className,
}) => {
  const styles = {
    error: {
      wrapper: 'bg-red-50/80 border-red-200 text-red-900',
      icon: <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />,
    },
    warning: {
      wrapper: 'bg-amber-50/80 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
    },
    success: {
      wrapper: 'bg-emerald-50/80 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
    },
    info: {
      wrapper: 'bg-blue-50/80 border-blue-200 text-blue-900',
      icon: <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />,
    },
  };

  return (
    <div
      className={cn(
        'p-4 rounded-xl border flex items-start gap-3 text-sm shadow-sm',
        styles[type].wrapper,
        className
      )}
    >
      {styles[type].icon}
      <div className="flex-1">
        {title && <h4 className="font-semibold text-sm mb-0.5">{title}</h4>}
        <p className="text-xs leading-relaxed opacity-90">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 transition-colors p-0.5"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
