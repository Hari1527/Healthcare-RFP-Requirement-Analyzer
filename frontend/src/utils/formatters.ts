import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getPriorityColor(priority: string) {
  switch (priority?.toLowerCase()) {
    case 'critical':
      return 'bg-red-50 text-red-700 border-red-200 ring-red-500/10';
    case 'high':
      return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10';
    case 'medium':
      return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10';
    case 'low':
      return 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-500/10';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

export function getCategoryBadgeColor(category: string) {
  switch (category?.toLowerCase()) {
    case 'security':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'compliance':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'clinical':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'technical':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'financial':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'legal':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'operational':
      return 'bg-teal-50 text-teal-700 border-teal-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

export function getStatusBadgeColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'compliant':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'processing':
    case 'partially compliant':
    case 'analyzed':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'failed':
    case 'missing':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'needs review':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'uploaded':
    case 'identified':
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}
