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
      className={`border border-slate-200/90 dark:border-slate-800 rounded-lg p-3 bg-slate-50/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 hover:border-brand-300 dark:hover:border-brand-500/50 transition-all ${
        onClick ? 'cursor-pointer hover:shadow-sm' : ''
      }`}
    >
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
        <FileText className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
        <span className="truncate">{documentName || 'RFP Document'}</span>
        {(page !== undefined && page !== null) && (
          <span className="text-slate-400 dark:text-slate-500 font-normal">
            • Page <strong className="text-slate-600 dark:text-slate-300">{page}</strong>
          </span>
        )}
        {section && (
          <span className="text-slate-400 dark:text-slate-500 font-normal">
            • Section <strong className="text-slate-600 dark:text-slate-300">{section}</strong>
          </span>
        )}
      </div>
      {excerpt && (
        <div className="flex items-start gap-2 mt-1.5 pl-1 border-l-2 border-brand-400 dark:border-brand-500">
          <Bookmark className="w-3 h-3 text-brand-500 dark:text-brand-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-600 dark:text-slate-400 italic line-clamp-3 leading-relaxed">
            "{excerpt}"
          </p>
        </div>
      )}
    </div>
  );
};
