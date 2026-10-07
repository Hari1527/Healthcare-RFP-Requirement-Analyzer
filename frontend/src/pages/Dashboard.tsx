import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Upload, RefreshCw } from 'lucide-react';
import { dashboardApi, documentsApi } from '../api';
import { DashboardSummary, CategoryCount, PriorityCount, ComplianceOverview, DocumentItem } from '../types';
import { KpiStatsGrid } from '../components/dashboard/KpiStatsGrid';
import { DashboardCharts } from '../components/dashboard/DashboardCharts';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { DocumentTable } from '../components/documents/DocumentTable';
import { DocumentUploadModal } from '../components/documents/DocumentUploadModal';
import { Alert } from '../components/common/Alert';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [priorities, setPriorities] = useState<PriorityCount[]>([]);
  const [compliance, setCompliance] = useState<ComplianceOverview | null>(null);
  const [recentDocs, setRecentDocs] = useState<DocumentItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [analyzingIds, setAnalyzingIds] = useState<string[]>([]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [summaryRes, catRes, prioRes, compRes, docsRes] = await Promise.all([
        dashboardApi.getSummary().catch(() => null),
        dashboardApi.getByCategory().catch(() => []),
        dashboardApi.getByPriority().catch(() => []),
        dashboardApi.getComplianceOverview().catch(() => null),
        documentsApi.getAll(0, 5).catch(() => ({ documents: [], total: 0 })),
      ]);

      setSummary(summaryRes);
      setCategories(catRes || []);
      setPriorities(prioRes || []);
      setCompliance(compRes);
      setRecentDocs(docsRes?.documents || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch executive dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAnalyze = async (docId: string) => {
    try {
      setAnalyzingIds((prev) => [...prev, docId]);
      await documentsApi.analyze(docId);
      // Refresh documents
      const docsRes = await documentsApi.getAll(0, 5);
      setRecentDocs(docsRes.documents);
    } catch (err: any) {
      setError(err?.message || 'Failed to start analysis.');
    } finally {
      setAnalyzingIds((prev) => prev.filter((id) => id !== docId));
    }
  };

  const handleDelete = async (docId: string) => {
    if (!window.confirm('Are you sure you want to delete this RFP document and all extracted requirements?')) {
      return;
    }
    try {
      await documentsApi.delete(docId);
      fetchDashboardData();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete document.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Proposal Executive Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time pipeline monitoring and compliance analysis overview
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            isLoading={isLoading}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            icon={<Upload className="w-3.5 h-3.5" />}
          >
            Upload New RFP
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* KPI Cards */}
      <KpiStatsGrid summary={summary} isLoading={isLoading} />

      {/* Analytics Charts */}
      <DashboardCharts
        categories={categories}
        priorities={priorities}
        compliance={compliance}
        isLoading={isLoading}
      />

      {/* Recent RFP Documents Table */}
      <div className="pt-2">
        <Card
          title="Recent RFP Documents"
          subtitle="Latest ingested healthcare proposals and status"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/documents')}
              icon={<ArrowUpRight className="w-3.5 h-3.5" />}
            >
              View Repository
            </Button>
          }
        >
          <DocumentTable
            documents={recentDocs}
            isLoading={isLoading}
            onAnalyze={handleAnalyze}
            onDelete={handleDelete}
            analyzingIds={analyzingIds}
          />
        </Card>
      </div>

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          fetchDashboardData();
        }}
      />
    </div>
  );
};
