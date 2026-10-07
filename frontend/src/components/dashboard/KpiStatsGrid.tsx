import React from 'react';
import {
  FileText,
  ListTodo,
  AlertOctagon,
  FileQuestion,
  Sparkles,
  Award,
} from 'lucide-react';
import { Card } from '../common/Card';
import { DashboardSummary } from '../../types';

interface KpiStatsGridProps {
  summary: DashboardSummary | null;
  isLoading: boolean;
}

export const KpiStatsGrid: React.FC<KpiStatsGridProps> = ({ summary, isLoading }) => {
  const cards = [
    {
      title: 'Total RFP Documents',
      value: summary?.total_documents ?? 0,
      icon: FileText,
      accent: 'border-l-brand-500',
      iconBg: 'bg-brand-50 text-brand-600',
      subtitle: 'Managed across clinical units',
    },
    {
      title: 'Total Requirements',
      value: summary?.total_requirements ?? 0,
      icon: ListTodo,
      accent: 'border-l-indigo-500',
      iconBg: 'bg-indigo-50 text-indigo-600',
      subtitle: 'Extracted & classified specifications',
    },
    {
      title: 'Critical Requirements',
      value: summary?.critical_requirements ?? 0,
      icon: AlertOctagon,
      accent: 'border-l-red-500',
      iconBg: 'bg-red-50 text-red-600',
      subtitle: 'HIPAA, security & patient safety',
    },
    {
      title: 'Missing Requirements',
      value: summary?.missing_requirements ?? 0,
      icon: FileQuestion,
      accent: 'border-l-amber-500',
      iconBg: 'bg-amber-50 text-amber-600',
      subtitle: 'Gaps requiring response actions',
    },
    {
      title: 'Draft Responses',
      value: summary?.draft_responses ?? 0,
      icon: Sparkles,
      accent: 'border-l-emerald-500',
      iconBg: 'bg-emerald-50 text-emerald-600',
      subtitle: 'AI-grounded response drafts',
    },
    {
      title: 'Compliance Score',
      value:
        summary?.compliance_score !== null && summary?.compliance_score !== undefined
          ? `${summary.compliance_score.toFixed(1)}%`
          : 'N/A',
      icon: Award,
      accent: 'border-l-purple-500',
      iconBg: 'bg-purple-50 text-purple-600',
      subtitle: 'Weighted satisfaction index',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {cards.map((card, idx) => (
        <Card
          key={idx}
          className={`border-l-4 ${card.accent} hover:shadow-md transition-shadow`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {card.title}
              </p>
              {isLoading ? (
                <div className="h-8 w-16 bg-slate-200 animate-pulse rounded my-1" />
              ) : (
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {card.value}
                </p>
              )}
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                {card.subtitle}
              </p>
            </div>
            <div className={`p-2.5 rounded-xl ${card.iconBg} flex-shrink-0`}>
              <card.icon className="w-5 h-5" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
