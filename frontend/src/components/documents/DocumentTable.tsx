import React from 'react';
import { Eye, Play, Trash2, FileText, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DocumentItem } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { TableSkeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { formatDate, formatBytes, getStatusBadgeColor } from '../../utils/formatters';

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
        title="No RFP Documents Found"
        description="Upload your healthcare RFP contracts or specifications to extract requirements automatically."
      />
    );
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge variant="success">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </Badge>
        );
      case 'PROCESSING':
        return (
          <Badge variant="warning">
            <Clock className="w-3 h-3 animate-spin" /> Processing
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge variant="danger">
            <XCircle className="w-3 h-3" /> Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="default">
            <Clock className="w-3 h-3" /> Uploaded
          </Badge>
        );
    }
  };

  return (
    <div className="overflow-x-auto border border-slate-200/80 rounded-xl bg-white shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <th className="py-3.5 px-4">Document Details</th>
            <th className="py-3.5 px-4">Organization</th>
            <th className="py-3.5 px-4">Uploaded</th>
            <th className="py-3.5 px-4">Pages / Size</th>
            <th className="py-3.5 px-4">Processing Status</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs">
          {documents.map((doc) => {
            const isAnalyzing = analyzingIds.includes(doc.id) || doc.processing_status === 'PROCESSING';

            return (
              <tr
                key={doc.id}
                className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                onClick={() => navigate(`/documents/${doc.id}`)}
              >
                {/* Name */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-50 text-brand-600 rounded-lg group-hover:bg-brand-600 group-hover:text-white transition-colors flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                        {doc.original_filename}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        ID: {doc.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </td>

                {/* Organization */}
                <td className="py-3.5 px-4 font-medium text-slate-700">
                  {doc.organization || <span className="text-slate-400 italic">Not specified</span>}
                </td>

                {/* Upload date */}
                <td className="py-3.5 px-4 text-slate-500">
                  {formatDate(doc.upload_date)}
                </td>

                {/* Pages & Size */}
                <td className="py-3.5 px-4 text-slate-600">
                  <span>{doc.page_count ? `${doc.page_count} pages` : 'N/A'}</span>
                  <span className="text-slate-400 text-[10px] block font-mono">
                    {formatBytes(doc.file_size)}
                  </span>
                </td>

                {/* Status */}
                <td className="py-3.5 px-4">
                  {renderStatusBadge(doc.processing_status)}
                </td>

                {/* Action buttons */}
                <td
                  className="py-3.5 px-4 text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      title="View Requirements & Analysis"
                      onClick={() => navigate(`/documents/${doc.id}`)}
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500 hover:text-slate-900" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      title="Re-run AI Analysis Pipeline"
                      isLoading={isAnalyzing}
                      disabled={isAnalyzing}
                      onClick={() => onAnalyze(doc.id)}
                    >
                      <Play className="w-3.5 h-3.5 text-brand-600 hover:text-brand-800" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      title="Delete Document"
                      onClick={() => onDelete(doc.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500 hover:text-red-700" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
