import React, { useState } from 'react';
import { Copy, Check, Edit2, Save, Sparkles, AlertCircle } from 'lucide-react';
import { DraftResponseItem } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Citation } from '../common/Citation';
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
      setError(err?.message || 'Failed to save updated response.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-semibold text-brand-700 dark:text-brand-400 uppercase tracking-wider">
              AI Draft Response
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
              (Req: {responseItem.requirement_id.slice(0, 8)}...)
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
            {responseItem.requirement_text}
          </h4>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              icon={<Edit2 className="w-3.5 h-3.5" />}
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
        <div className="mt-3 p-2 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-xs rounded-lg flex items-center gap-1.5 border border-red-200 dark:border-red-900/50">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
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
            className="w-full text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-950 p-3 border border-brand-300 dark:border-brand-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono leading-relaxed"
          />
        ) : (
          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-50/70 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            {responseItem.draft_response}
          </div>
        )}

        <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 italic">
          Disclaimer: AI-generated draft. Review and validate against hospital RFP guidelines before final submission.
        </p>
      </div>

      {/* Source References */}
      {responseItem.sources && responseItem.sources.length > 0 && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
            Supporting Evidence & Source Citations:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {responseItem.sources.map((src, i) => (
              <Citation
                key={i}
                documentName={src.document_name}
                page={src.page}
                section={src.section}
                excerpt={src.excerpt}
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
