import React, { useState } from 'react';
import { Copy, Check, Edit2, Save, Sparkles, AlertCircle, FileText, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { DraftResponseItem } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { responsesApi } from '../../api';

interface ResponseCardProps {
  responseItem: DraftResponseItem;
  onUpdated?: (updated: DraftResponseItem) => void;
}

export const ResponseCard: React.FC<ResponseCardProps> = ({
  responseItem,
  onUpdated,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(responseItem.draft_response);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(editedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      const updated = await responsesApi.update(responseItem.id, {
        response_text: editedText,
      });
      setIsEditing(false);
      if (onUpdated) onUpdated(updated);
    } catch (err: any) {
      setError(err?.message || 'Failed to update draft response.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border border-white/[0.08] hover:border-brand-500/30 transition-all bg-white/[0.02]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-md bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] font-bold text-brand-300 uppercase tracking-wider font-mono">
              AI Grounded Proposal Draft
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              (Req: {responseItem.requirement_id.slice(0, 8)}...)
            </span>
          </div>
          <h4 className="text-sm font-semibold text-white leading-relaxed">
            {responseItem.requirement_text}
          </h4>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              icon={<Edit2 className="w-3.5 h-3.5 text-slate-400" />}
            >
              Edit
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              isLoading={isSaving}
              icon={<Save className="w-3.5 h-3.5" />}
            >
              Save
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/25 text-red-400 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Response Body */}
      <div className="py-4">
        {isEditing ? (
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            rows={6}
            className="w-full text-xs text-slate-200 bg-slate-900/90 p-4 border border-brand-500/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono leading-relaxed"
          />
        ) : (
          <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap bg-white/[0.02] p-4.5 rounded-xl border border-white/[0.06] font-sans">
            {responseItem.draft_response}
          </div>
        )}

        <p className="mt-2 text-[10px] text-slate-500 italic font-mono">
          * AI draft response strictly restricted to retrieved document context. Review prior to RFP submission.
        </p>
      </div>

      {/* Source References */}
      {responseItem.sources && responseItem.sources.length > 0 && (
        <div className="pt-3 border-t border-white/[0.06]">
          <p className="text-[11px] font-semibold text-slate-400 mb-2.5 uppercase tracking-wider font-mono">
            Grounding Evidence & Citations:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {responseItem.sources.map((src, i) => (
              <div
                key={i}
                className="border border-white/[0.06] rounded-xl p-3.5 bg-white/[0.015] hover:bg-white/[0.04] transition-all"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-1.5">
                  <FileText className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                  <span className="truncate">{src.document_name || 'RFP Contract'}</span>
                  {src.page !== null && src.page !== undefined && (
                    <span className="text-slate-400 font-mono text-[11px]">
                      • P.{src.page}
                    </span>
                  )}
                  {src.section && (
                    <span className="text-slate-400 font-mono text-[11px]">
                      • Sec {src.section}
                    </span>
                  )}
                </div>
                {src.excerpt && (
                  <div className="flex items-start gap-2 pl-2 border-l-2 border-brand-500/40 mt-1">
                    <Bookmark className="w-3 h-3 text-brand-400 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-slate-400 italic line-clamp-3 leading-relaxed">
                      "{src.excerpt}"
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
