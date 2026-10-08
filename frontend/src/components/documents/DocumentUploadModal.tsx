import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
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
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    const validExtensions = ['.pdf', '.docx', '.txt'];
    const hasValidExt = validExtensions.some((ext) =>
      f.name.toLowerCase().endsWith(ext)
    );

    if (!validTypes.includes(f.type) && !hasValidExt) {
      setError('Invalid file format. Please upload PDF, DOCX, or TXT documents.');
      return;
    }

    if (f.size > 50 * 1024 * 1024) {
      setError('File size exceeds the 50MB maximum limit.');
      return;
    }

    setFile(f);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please choose an RFP file to upload.');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      await documentsApi.upload(file, organization.trim() || undefined);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to upload document.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Upload Healthcare RFP
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ingest contract document for AI requirement extraction
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleUpload} className="p-6 space-y-5">
          {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

          {/* Organization input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              Issuing Organization / Hospital (Optional)
            </label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="e.g. Mayo Clinic, Kaiser Permanente, Dept of Veterans Affairs"
              className="w-full px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Dropzone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              RFP Document File
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
                  ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30'
                  : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50/60 dark:bg-slate-850/60'
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
                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-left shadow-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 rounded-lg flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        {formatBytes(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium px-2 py-1"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="rfp-upload-input"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-3">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 mb-1">
                    Click to browse or drag and drop RFP
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Supports PDF, DOCX, TXT (Maximum file size: 50MB)
                  </p>
                </label>
              )}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200/80 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
            <p className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              Preserves page-level chunks for audit citations
            </p>
            <p className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              Executes automatic NLP pipeline & vector indexing
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
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
              Upload & Ingest
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
