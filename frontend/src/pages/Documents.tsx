import React, { useEffect, useState } from 'react';
import { Upload, Search, RefreshCw, Filter, Database } from 'lucide-react';
import { documentsApi } from '../api';
import { DocumentItem } from '../types';
import { DocumentTable } from '../components/documents/DocumentTable';
import { DocumentUploadModal } from '../components/documents/DocumentUploadModal';
import { Button } from '../components/common/Button';
import { Alert } from '../components/common/Alert';
import { Card } from '../components/common/Card';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [analyzingIds, setAnalyzingIds] = useState<string[]>([]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await documentsApi.getAll(0, 100);
      setDocuments(res.documents);
      setTotal(res.total);
    } catch (err: any) {
      setError(err?.message || 'Failed to load RFP documents.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleSeedSamples = async () => {
    try {
      setIsSeeding(true);
      setError(null);
      await documentsApi.seedSamples();
      await fetchDocuments();
    } catch (err: any) {
      setError(err?.message || 'Failed to seed sample datasets.');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleAnalyze = async (docId: string) => {
    try {
      setAnalyzingIds((prev) => [...prev, docId]);
      await documentsApi.analyze(docId);
      // Poll or reload list
      await fetchDocuments();
    } catch (err: any) {
      setError(err?.message || 'Failed to trigger document analysis pipeline.');
    } finally {
      setAnalyzingIds((prev) => prev.filter((id) => id !== docId));
    }
  };

  const handleDelete = async (docId: string) => {
    if (!window.confirm('Delete this document and all associated embeddings & requirements?')) {
      return;
    }
    try {
      await documentsApi.delete(docId);
      await fetchDocuments();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete document.');
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.original_filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.organization && doc.organization.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' || doc.processing_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            RFP Documents Repository
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage, upload, and trigger NLP requirement extraction pipelines
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDocuments}
            isLoading={isLoading}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSeedSamples}
            isLoading={isSeeding}
            icon={<Database className="w-3.5 h-3.5" />}
          >
            Load Sample Datasets
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            icon={<Upload className="w-3.5 h-3.5" />}
          >
            Upload RFP
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Filters and search card */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by RFP title or issuing hospital organization..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="ALL">All Statuses ({total})</option>
                <option value="COMPLETED">Completed</option>
                <option value="PROCESSING">Processing</option>
                <option value="UPLOADED">Uploaded</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Table */}
      <DocumentTable
        documents={filteredDocs}
        isLoading={isLoading}
        onAnalyze={handleAnalyze}
        onDelete={handleDelete}
        analyzingIds={analyzingIds}
      />

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={fetchDocuments}
      />
    </div>
  );
};
