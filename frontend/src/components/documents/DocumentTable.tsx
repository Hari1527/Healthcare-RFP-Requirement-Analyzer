import React from 'react';
import { Eye, Play, Trash2, FileText, CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DocumentItem } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { TableSkeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { formatDate, formatBytes } from '../../utils/formatters';

interface DocumentTableProps {
  documents: DocumentItem[];
  isLoading: boolean;
  onAnalyze: (id: string) => void;
  onDelete: (id: string) => void;
  analyzingIds: string[];
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  isLoading,
  onAnalyze,
  onDelete,
  analyzingIds,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return <TableSkeleton rows={5} cols={6} />;
  }

  if (documents.length === 0) {
    return (
      <EmptyState
        title="No RFP Contracts Ingested"
        description="Upload hospital or health system RFP documents (PDF, DOCX, TXT) to trigger automated requirement parsing."
      />
    );
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Indexed
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25 animate-pulse">
            <Clock className="w-3 h-3 animate-spin text-amber-400" /> Extracting NLP
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/25">
            <XCircle className="w-3 h-3 text-rose-400" /> Error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-500/10 text-slate-300 border border-slate-500/25">
            <Clock className="w-3 h-3 text-slate-400" /> Uploaded
          </span>
        );
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.015]">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/[0.06] text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-white/[0.02]">
            <th className="py-3.5 px-4 font-mono">Contract File</th>
            <th className="py-3.5 px-4">Hospital / Health Network</th>
            <th className="py-3.5 px-4">Ingested Date</th>
            <th className="py-3.5 px-4">Pages / Size</th>
            <th className="py-3.5 px-4">Pipeline Status</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04] text-xs">
          {documents.map((doc, idx) => {
            const isAnalyzing = analyzingIds.includes(doc.id) || doc.processing_status === 'PROCESSING';

            return (
              <motion.tr
                key={doc.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
                className="hover:bg-white/[0.04] transition-colors group cursor-pointer"
                onClick={() => navigate(`/documents/${doc.id}`)}
              >
                {/* File */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-xl group-hover:bg-brand-500 group-hover:text-white transition-all flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-100 group-hover:text-brand-300 transition-colors">
                        {doc.original_filename}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        UUID: {doc.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </td>

                {/* Organization */}
                <td className="py-3.5 px-4 font-medium text-slate-300">
                  {doc.organization || <span className="text-slate-600 italic">Not specified</span>}
                </td>

                {/* Date */}
                <td className="py-3.5 px-4 text-slate-400">
                  {formatDate(doc.upload_date)}
                </td>

                {/* Pages & Size */}
                <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                  <span>{doc.page_count ? `${doc.page_count} pgs` : 'N/A'}</span>
                  <span className="text-slate-500 text-[10px] block">
                    {formatBytes(doc.file_size)}
                  </span>
                </td>

                {/* Pipeline Status */}
                <td className="py-3.5 px-4">
                  {renderStatusBadge(doc.processing_status)}
                </td>

                {/* Actions */}
                <td
                  className="py-3.5 px-4 text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => navigate(`/documents/${doc.id}`)}
                      title="Inspect extracted requirements"
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onAnalyze(doc.id)}
                      disabled={isAnalyzing}
                      title="Re-run AI extraction pipeline"
                      className="p-1.5 text-brand-400 hover:text-brand-300 hover:bg-brand-500/10 rounded-lg transition-colors disabled:opacity-40"
                    >
                      <Play className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    </button>

                    <button
                      onClick={() => onDelete(doc.id)}
                      title="Delete contract"
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
