import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, RefreshCw, FileText, CheckCircle2 } from 'lucide-react';
import { complianceApi, documentsApi } from '../api';
import { ComplianceReport, MissingRequirementItem, DocumentItem } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Alert } from '../components/common/Alert';
import { EmptyState } from '../components/common/EmptyState';
import { getPriorityColor, getCategoryBadgeColor } from '../utils/formatters';

export const CompliancePage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [missingReqs, setMissingReqs] = useState<MissingRequirementItem[]>([]);

  const [activeTab, setActiveTab] = useState<'report' | 'missing'>('report');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters for report items
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const docsRes = await documentsApi.getAll(0, 50);
      setDocuments(docsRes.documents);

      if (docsRes.documents.length > 0) {
        const firstId = docsRes.documents[0].id;
        setSelectedDocId(firstId);
        await loadReport(firstId);
      } else {
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load documents.');
      setIsLoading(false);
    }
  };

  const loadReport = async (docId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const [compRes, missingRes] = await Promise.all([
        complianceApi.getReportByDocumentId(docId).catch(() => null),
        complianceApi.getMissingRequirements(docId).catch(() => ({ requirements: [], total: 0 })),
      ]);
      setReport(compRes);
      setMissingReqs(missingRes.requirements);
    } catch (err: any) {
      setError(err?.message || 'Failed to calculate compliance report.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleDocumentChange = (docId: string) => {
    setSelectedDocId(docId);
    if (docId) {
      loadReport(docId);
    }
  };

  const filteredItems = report?.items?.filter((item) => {
    if (statusFilter === 'ALL') return true;
    return item.status === statusFilter;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Compliance & Gap Analysis Checklist
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit readiness evaluation with weighted compliance scoring and missing requirement tracking
          </p>
        </div>

        {/* Document Selector */}
        <div className="flex items-center gap-3">
          <select
            value={selectedDocId}
            onChange={(e) => handleDocumentChange(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
          >
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.original_filename} ({d.organization || 'RFP'})
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => selectedDocId && loadReport(selectedDocId)}
            isLoading={isLoading}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* KPI Overview */}
      {report && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-4 border-l-4 border-l-emerald-500">
            <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Compliance Score</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {report.compliance_score.toFixed(1)}%
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Weighted satisfaction</p>
          </Card>

          <Card className="p-4 border-l-4 border-l-emerald-400">
            <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Compliant</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{report.compliant}</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">Verified evidence</p>
          </Card>

          <Card className="p-4 border-l-4 border-l-amber-500">
            <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Partially Compliant</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{report.partially_compliant}</p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">Needs source citations</p>
          </Card>

          <Card className="p-4 border-l-4 border-l-red-500">
            <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Missing</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{report.missing}</p>
            <p className="text-[10px] text-red-500 dark:text-red-400 font-medium mt-0.5">Action required</p>
          </Card>

          <Card className="p-4 border-l-4 border-l-indigo-500">
            <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Needs Review</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{report.needs_review}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Ambiguous evidence</p>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('report')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'report'
              ? 'border-brand-600 dark:border-brand-400 text-brand-700 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Compliance Matrix ({report?.total_requirements || 0})
        </button>

        <button
          onClick={() => setActiveTab('missing')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'missing'
              ? 'border-red-600 dark:border-red-400 text-red-700 dark:text-red-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span>Gaps & Missing Requirements</span>
          <span className="px-1.5 py-0.2 rounded-full bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-[10px] font-bold">
            {missingReqs.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Comprehensive Compliance Report */}
      {activeTab === 'report' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <span>Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                <option value="ALL">All Items</option>
                <option value="Compliant">Compliant</option>
                <option value="Partially Compliant">Partially Compliant</option>
                <option value="Missing">Missing</option>
                <option value="Needs Review">Needs Review</option>
              </select>
            </div>
            {report?.scoring_methodology && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                Formula: {report.scoring_methodology}
              </span>
            )}
          </div>

          <div className="overflow-x-auto border border-slate-200/80 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  <th className="py-3 px-4">Requirement</th>
                  <th className="py-3 px-4">Category / Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Evidence / Reason</th>
                  <th className="py-3 px-4">Recommended Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredItems.map((item) => (
                  <tr key={item.requirement_id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-slate-100 max-w-xs">
                      {item.requirement_text}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getCategoryBadgeColor(
                            item.category
                          )}`}
                        >
                          {item.category}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getPriorityColor(
                            item.priority
                          )}`}
                        >
                          {item.priority}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          item.status === 'Compliant'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : item.status === 'Partially Compliant'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                            : item.status === 'Missing'
                            ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                            : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-sm">
                      {item.evidence ? (
                        <p className="line-clamp-2 text-slate-800 dark:text-slate-200 text-[11px] bg-slate-50 dark:bg-slate-950/60 p-1.5 rounded border border-slate-100 dark:border-slate-800">
                          {item.evidence}
                        </p>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 italic text-[11px]">
                          {item.reason}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium max-w-xs">
                      {item.recommended_action}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Missing Requirements Dedicated View */}
      {activeTab === 'missing' && (
        <div className="space-y-4">
          {missingReqs.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />}
              title="No Missing Requirements Detected"
              description="All identified RFP requirements have draft responses with validated source citations."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {missingReqs.map((miss) => {
                const isCritical = miss.priority === 'Critical';

                return (
                  <Card
                    key={miss.requirement_id}
                    className={`border-l-4 ${
                      isCritical ? 'border-l-red-600 bg-red-50/10 dark:bg-red-950/20' : 'border-l-amber-500'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityColor(
                            miss.priority
                          )}`}
                        >
                          {miss.priority}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getCategoryBadgeColor(
                            miss.category
                          )}`}
                        >
                          {miss.category}
                        </span>
                      </div>
                      <Badge variant={isCritical ? 'danger' : 'warning'}>
                        {miss.status}
                      </Badge>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-2 leading-relaxed">
                      {miss.requirement_text}
                    </h4>

                    <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-lg text-[11px] space-y-1 border border-slate-100 dark:border-slate-800">
                      <p className="text-slate-600 dark:text-slate-400">
                        <strong>Reason: </strong>
                        {miss.reason}
                      </p>
                      <p className="text-brand-700 dark:text-brand-400 font-semibold">
                        <strong>Action: </strong>
                        {miss.recommended_action}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
