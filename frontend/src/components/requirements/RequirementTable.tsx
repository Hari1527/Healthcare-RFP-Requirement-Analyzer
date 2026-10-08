import React from 'react';
import { Eye, Sparkles, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RequirementItem } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { TableSkeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';
import {
  getPriorityColor,
  getCategoryBadgeColor,
  getStatusBadgeColor,
} from '../../utils/formatters';

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
        title="No Requirements Extracted"
        description="Run analysis on an uploaded RFP to automatically detect and classify specifications."
      />
    );
  }

  return (
    <div className="overflow-x-auto border border-slate-200/80 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/80 dark:bg-slate-850/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <th className="py-3 px-4 w-28">Req ID</th>
            <th className="py-3 px-4 min-w-[280px]">Requirement Text</th>
            <th className="py-3 px-4">Category</th>
            <th className="py-3 px-4">Priority</th>
            <th className="py-3 px-4">Type</th>
            <th className="py-3 px-4">Source Location</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
          {requirements.map((req) => (
            <tr
              key={req.id}
              className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
              onClick={() => {
                if (onSelectRequirement) {
                  onSelectRequirement(req);
                } else {
                  navigate(`/requirements/${req.id}`);
                }
              }}
            >
              {/* ID */}
              <td className="py-3 px-4 font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {req.id.slice(0, 8)}
              </td>

              {/* Requirement text */}
              <td className="py-3 px-4">
                <p className="line-clamp-2 text-slate-900 dark:text-slate-100 font-medium leading-relaxed group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {req.requirement_text}
                </p>
              </td>

              {/* Category */}
              <td className="py-3 px-4 whitespace-nowrap">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-md border text-[11px] font-medium ${getCategoryBadgeColor(
                    req.category
                  )}`}
                >
                  {req.category}
                </span>
              </td>

              {/* Priority */}
              <td className="py-3 px-4 whitespace-nowrap">
                <span
                  className={`inline-block px-2 py-0.5 rounded border text-[11px] font-semibold ${getPriorityColor(
                    req.priority
                  )}`}
                >
                  {req.priority}
                </span>
              </td>

              {/* Requirement type */}
              <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">
                {req.requirement_type}
              </td>

              {/* Source page / section */}
              <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <BookOpen className="w-3 h-3 text-slate-400" />
                  <span>
                    {req.page_number ? `P. ${req.page_number}` : 'N/A'}
                    {req.section ? ` (${req.section})` : ''}
                  </span>
                </div>
              </td>

              {/* Status */}
              <td className="py-3 px-4 whitespace-nowrap">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider ${getStatusBadgeColor(
                    req.status
                  )}`}
                >
                  {req.status}
                </span>
              </td>

              {/* Action */}
              <td
                className="py-3 px-4 text-right whitespace-nowrap"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Generate AI Draft Response"
                    onClick={() =>
                      navigate('/responses', {
                        state: { requirementId: req.id, documentId: req.document_id },
                      })
                    }
                  >
                    <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    title="View Detailed Breakdown"
                    onClick={() => navigate(`/requirements/${req.id}`)}
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500 hover:text-slate-900" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
