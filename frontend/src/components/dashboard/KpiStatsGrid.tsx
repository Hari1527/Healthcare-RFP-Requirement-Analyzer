import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  ListTodo,
  AlertOctagon,
  FileQuestion,
  Sparkles,
  Award,
  TrendingUp,
} from 'lucide-react';
import { DashboardSummary } from '../../types';

interface KpiStatsGridProps {
  summary: DashboardSummary | null;
  isLoading: boolean;
}

export const KpiStatsGrid: React.FC<KpiStatsGridProps> = ({ summary, isLoading }) => {
  const cards = [
    {
      title: 'RFP Documents',
      value: summary?.total_documents ?? 0,
      icon: FileText,
      gradient: 'from-blue-500/20 to-sky-500/5',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400 bg-blue-500/10',
      subtitle: 'Managed across health networks',
    },
    {
      title: 'Total Requirements',
      value: summary?.total_requirements ?? 0,
      icon: ListTodo,
      gradient: 'from-indigo-500/20 to-purple-500/5',
      borderColor: 'border-indigo-500/30',
      iconColor: 'text-indigo-400 bg-indigo-500/10',
      subtitle: 'NLP extracted & classified clauses',
    },
    {
      title: 'Critical Requirements',
      value: summary?.critical_requirements ?? 0,
      icon: AlertOctagon,
      gradient: 'from-red-500/20 to-rose-500/5',
      borderColor: 'border-red-500/30',
      iconColor: 'text-red-400 bg-red-500/10',
      subtitle: 'HIPAA, patient safety & security',
    },
    {
      title: 'Missing Requirements',
      value: summary?.missing_requirements ?? 0,
      icon: FileQuestion,
      gradient: 'from-amber-500/20 to-yellow-500/5',
      borderColor: 'border-amber-500/30',
      iconColor: 'text-amber-400 bg-amber-500/10',
      subtitle: 'Gaps requiring proposal action',
    },
    {
      title: 'Draft Responses',
      value: summary?.draft_responses ?? 0,
      icon: Sparkles,
      gradient: 'from-emerald-500/20 to-teal-500/5',
      borderColor: 'border-emerald-500/30',
      iconColor: 'text-emerald-400 bg-emerald-500/10',
      subtitle: 'Grounded RAG drafts with citations',
    },
    {
      title: 'Compliance Score',
      value:
        summary?.compliance_score !== null && summary?.compliance_score !== undefined
          ? `${summary.compliance_score.toFixed(1)}%`
          : 'N/A',
      icon: Award,
      gradient: 'from-violet-500/20 to-purple-500/5',
      borderColor: 'border-violet-500/30',
      iconColor: 'text-violet-400 bg-violet-500/10',
      subtitle: 'Weighted satisfaction index',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5">
      {cards.map((card, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className={`glass-panel p-5.5 rounded-2xl relative overflow-hidden border ${card.borderColor} bg-gradient-to-br ${card.gradient} hover:shadow-lg transition-all group`}
        >
          {/* Ambient Corner Glow */}
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-white/[0.03] rounded-full blur-xl pointer-events-none" />

          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {card.title}
              </p>
              {isLoading ? (
                <div className="h-8 w-16 bg-white/10 animate-pulse rounded my-2" />
              ) : (
                <div className="flex items-baseline gap-2 mt-1.5">
                  <p className="text-3xl font-extrabold text-white tracking-tight">
                    {card.value}
                  </p>
                </div>
              )}
              <p className="text-[11px] text-slate-400 mt-1 font-normal">
                {card.subtitle}
              </p>
            </div>

            <div className={`p-3 rounded-xl border border-white/10 ${card.iconColor} shadow-inner`}>
              <card.icon className="w-5 h-5" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
