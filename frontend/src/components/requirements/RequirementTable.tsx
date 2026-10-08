import React, { useState } from 'react';
import { Eye, Sparkles, BookOpen, ExternalLink, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RequirementItem } from '../../types';
import { TableSkeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';

interface RequirementTableProps {
  requirements: RequirementItem[];
  isLoading: boolean;
  onSelectRequirement?: (req: RequirementItem) => void;
}

export const RequirementTable: React.FC<RequirementTableProps> = ({
  requirements,
  isLoading,
  onSelectRequirement,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return <TableSkeleton rows={6} cols={6} />;
  }

  if (requirements.length === 0) {
    return (
      <EmptyState
        title="No Requirements In Matrix"
        description="Run analysis on an ingested contract to extract specifications across Clinical, Security, and Compliance."
      />
    );
  }

  const getCategoryClass = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case 'security':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'compliance':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'clinical':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'technical':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
      case 'financial':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'legal':
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      default:
        return 'text-slate-300 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getPriorityClass = (prio: string) => {
    switch (prio?.toLowerCase()) {
      case 'critical':
        return 'text-red-400 bg-red-500/10 border-red-500/25';
      case 'high':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/25';
      case 'medium':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/25';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/25';
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.015]">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/[0.06] text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-white/[0.02]">
            <th className="py-3.5 px-4 w-28 font-mono">ID</th>
            <th className="py-3.5 px-4 min-w-[320px]">Requirement Statement</th>
            <th className="py-3.5 px-4">Domain</th>
            <th className="py-3.5 px-4">Criticality</th>
            <th className="py-3.5 px-4">Type</th>
            <th className="py-3.5 px-4">Citation Ref</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4 text-right">RAG Studio</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04] text-xs">
          {requirements.map((req, idx) => (
            <motion.tr
              key={req.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15, delay: idx * 0.02 }}
              className="hover:bg-white/[0.04] transition-colors group cursor-pointer"
              onClick={() => {
                if (onSelectRequirement) {
                  onSelectRequirement(req);
                } else {
                  navigate(`/requirements/${req.id}`);
                }
              }}
            >
              {/* ID */}
              <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                {req.id.slice(0, 8)}
              </td>

              {/* Requirement text */}
              <td className="py-3.5 px-4">
                <p className="line-clamp-2 text-slate-200 font-medium leading-relaxed group-hover:text-brand-300 transition-colors">
                  {req.requirement_text}
                </p>
              </td>

              {/* Domain */}
              <td className="py-3.5 px-4 whitespace-nowrap">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-md border text-[11px] font-semibold ${getCategoryClass(
                    req.category
                  )}`}
                >
                  {req.category}
                </span>
              </td>

              {/* Priority */}
              <td className="py-3.5 px-4 whitespace-nowrap">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-md border text-[11px] font-bold ${getPriorityClass(
                    req.priority
                  )}`}
                >
                  {req.priority}
                </span>
              </td>

              {/* Type */}
              <td className="py-3.5 px-4 text-slate-400 font-medium">
                {req.requirement_type}
              </td>

              {/* Source page / section */}
              <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3 text-brand-400 flex-shrink-0" />
                  <span className="truncate max-w-[120px]">
                    {req.page_number ? `P.${req.page_number}` : 'N/A'}
                    {req.section ? ` (${req.section})` : ''}
                  </span>
                </div>
              </td>

              {/* Status */}
              <td className="py-3.5 px-4 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                    req.status === 'RESPONDED'
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : 'text-slate-400 bg-slate-500/10 border-slate-500/20'
                  }`}
                >
                  {req.status}
                </span>
              </td>

              {/* Action */}
              <td
                className="py-3.5 px-4 text-right whitespace-nowrap"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() =>
                    navigate('/responses', {
                      state: { requirementId: req.id, documentId: req.document_id },
                    })
                  }
                  title="Generate RAG Draft"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-500/10 hover:bg-brand-500/25 border border-brand-500/30 text-brand-300 text-[11px] font-semibold transition-all group-hover:shadow-glow-brand"
                >
                  <Sparkles className="w-3 h-3 text-brand-400" />
                  <span>Draft</span>
                </button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
