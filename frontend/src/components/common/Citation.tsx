import React from 'react';
import { FileText, Bookmark } from 'lucide-react';

interface CitationProps {
  documentName?: string;
  page?: number | null;
  section?: string | null;
  excerpt?: string | null;
  onClick?: () => void;
}

export const Citation: React.FC<CitationProps> = ({
  documentName,
  page,
  section,
  excerpt,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`border border-slate-200/90 rounded-lg p-3 bg-slate-50/70 hover:bg-white hover:border-brand-300 transition-all ${
        onClick ? 'cursor-pointer hover:shadow-sm' : ''
      }`}
    >
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-1">
        <FileText className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
        <span className="truncate">{documentName || 'RFP Document'}</span>
        {(page !== undefined && page !== null) && (
          <span className="text-slate-400 font-normal">
            • Page <strong className="text-slate-600">{page}</strong>
          </span>
        )}
        {section && (
          <span className="text-slate-400 font-normal">
            • Section <strong className="text-slate-600">{section}</strong>
          </span>
        )}
      </div>
      {excerpt && (
        <div className="flex items-start gap-2 mt-1.5 pl-1 border-l-2 border-brand-400">
          <Bookmark className="w-3 h-3 text-brand-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-600 italic line-clamp-3 leading-relaxed">
            "{excerpt}"
          </p>
        </div>
      )}
    </div>
  );
};
