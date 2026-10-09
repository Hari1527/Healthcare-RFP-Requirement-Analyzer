import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  FileText,
  Building2,
  Calendar,
  Layers,
  Award,
  Sparkles,
  RefreshCw,
  Search,
} from 'lucide-react';
import { documentsApi, complianceApi } from '../api';
import { DocumentItem, RequirementItem, ComplianceReport } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Alert } from '../components/common/Alert';
import { RequirementTable } from '../components/requirements/RequirementTable';
import { formatDate, formatBytes } from '../utils/formatters';

export const DocumentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [requirements, setRequirements] = useState<RequirementItem[]>([]);
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDocumentData = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const [docRes, reqsRes, compRes] = await Promise.all([
        documentsApi.getById(id),
        documentsApi.getRequirements(id, 0, 200).catch(() => ({ requirements: [], total: 0 })),
        complianceApi.getReportByDocumentId(id).catch(() => null),
      ]);

      setDocument(docRes);
      setRequirements(reqsRes.requirements);
      setComplianceReport(compRes);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch document information.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentData();
  }, [id]);

  // Polling if currently processing
  useEffect(() => {
    if (!document || document.processing_status !== 'PROCESSING') return;

    const interval = setInterval(async () => {
      if (!id) return;
      try {
        const statusRes = await documentsApi.getStatus(id);
        if (statusRes.processing_status !== 'PROCESSING') {
          clearInterval(interval);
          fetchDocumentData();
        }
      } catch {
        clearInterval(interval);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [document?.processing_status, id]);

  const handleAnalyze = async () => {
    if (!id) return;
    try {
      setIsAnalyzing(true);
      setError(null);
      await documentsApi.analyze(id);
      fetchDocumentData();
    } catch (err: any) {
      setError(err?.message || 'Failed to trigger analysis pipeline.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredRequirements = requirements.filter((r) =>
    r.requirement_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.priority.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const criticalCount = requirements.filter((r) => r.priority === 'Critical').length;
  const missingCount = requirements.filter((r) => r.status === 'IDENTIFIED').length;

  return (
    <div className="space-y-6">
      {/* Header Back & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/documents')}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            All RFPs
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <span>{document?.original_filename || 'RFP Document Details'}</span>
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">
              ID: {id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDocumentData}
            isLoading={isLoading}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAnalyze}
            isLoading={isAnalyzing || document?.processing_status === 'PROCESSING'}
            icon={<Play className="w-3.5 h-3.5" />}
          >
            {document?.processing_status === 'PROCESSING'
              ? 'Analyzing Document...'
              : 'Re-Analyze RFP'}
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-brand-500">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">
                Organization
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                {document?.organization || 'Not Specified'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-indigo-500">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">
                Extracted Requirements
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {requirements.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-red-500">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">
                Critical / Missing
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {criticalCount} <span className="text-xs font-normal text-slate-400 dark:text-slate-500">/ {missingCount}</span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">
                Compliance Score
              </p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {complianceReport?.compliance_score !== undefined
                  ? `${complianceReport.compliance_score.toFixed(1)}%`
                  : 'N/A'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search Requirements within this doc */}
      <Card
        title={`Extracted RFP Requirements (${filteredRequirements.length})`}
        subtitle="Individual line items categorized for proposal responses"
        action={
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter specifications..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        }
      >
        <RequirementTable
          requirements={filteredRequirements}
          isLoading={isLoading}
        />
      </Card>
    </div>
  );
};
