import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Building2, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { documentsApi } from '../../api';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { formatBytes } from '../../utils/formatters';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [organization, setOrganization] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  if (!isOpen) return null;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      validateAndSetFile(selected);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (f: File) => {
    setError(null);
    const validExtensions = ['.pdf', '.docx', '.txt'];
    const hasValidExt = validExtensions.some((ext) =>
      f.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExt) {
      setError('Unsupported file type. Please upload a PDF, DOCX, or TXT healthcare RFP.');
      return;
    }

    if (f.size > 50 * 1024 * 1024) {
      setError('File exceeds 50MB maximum allowable size.');
      return;
    }

    setFile(f);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an RFP file to ingest.');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      await documentsApi.upload(file, organization.trim() || undefined);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to ingest document.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel bg-[#0d1326] rounded-2xl shadow-2xl border border-white/10 max-w-lg w-full overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Ingest Healthcare RFP Contract
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload proposal document for automated NLP clause extraction
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleUpload} className="p-6 space-y-4.5">
            {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

            {/* Organization */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-brand-400" />
                Issuing Hospital / Payer Organization
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. Cleveland Clinic, Johns Hopkins, Veterans Affairs"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-100 placeholder:text-slate-500"
              />
            </div>

            {/* Dropzone */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                RFP Specification File
              </label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                  isDragOver
                    ? 'border-brand-400 bg-brand-500/10'
                    : 'border-white/15 hover:border-white/25 bg-white/[0.02]'
                }`}
              >
                <input
                  type="file"
                  id="rfp-upload-input"
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                />

                {file ? (
                  <div className="flex items-center justify-between p-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-left">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 bg-brand-500/10 text-brand-400 border border-brand-500/25 rounded-lg flex-shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {formatBytes(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-xs text-rose-400 hover:text-rose-300 font-medium px-2 py-1"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="rfp-upload-input"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mb-3 shadow-glow-brand">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-200 mb-1">
                      Click to choose or drag & drop RFP
                    </p>
                    <p className="text-[11px] text-slate-400">
                      PDF, DOCX, or TXT up to 50MB
                    </p>
                  </label>
                )}
              </div>
            </div>

            {/* Pipeline Notice */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] text-slate-400 space-y-1 font-mono">
              <p className="flex items-center gap-1.5 text-slate-300 font-sans">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                Preserves page-level chunks for audit citations
              </p>
              <p className="flex items-center gap-1.5 text-slate-300 font-sans">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                Auto-generates sentence-transformers 384d vector embeddings
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isUploading}
                disabled={!file}
              >
                Ingest & Process
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
