import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, RefreshCw, Send, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { responsesApi, requirementsApi, documentsApi } from '../api';
import { DraftResponseItem, RequirementItem, DocumentItem } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ResponseCard } from '../components/responses/ResponseCard';
import { Alert } from '../components/common/Alert';
import { EmptyState } from '../components/common/EmptyState';

export const DraftResponsesPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as { requirementId?: string; documentId?: string } | undefined;

  const [responses, setResponses] = useState<DraftResponseItem[]>([]);
  const [requirements, setRequirements] = useState<RequirementItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  // Generation state
  const [selectedReqId, setSelectedReqId] = useState<string>(locationState?.requirementId || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [resList, reqList, docList] = await Promise.all([
        responsesApi.getAll(0, 100),
        requirementsApi.getAll({ limit: 150 }).catch(() => ({ requirements: [], total: 0 })),
        documentsApi.getAll(0, 50).catch(() => ({ documents: [], total: 0 })),
      ]);
      setResponses(resList.responses);
      setRequirements(reqList.requirements);
      setDocuments(docList.documents);
    } catch (err: any) {
      setError(err?.message || 'Failed to load draft responses repository.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReqId) {
      setError('Please select a healthcare RFP requirement to generate a response for.');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      const newResponse = await responsesApi.generate({ requirement_id: selectedReqId });
      // Add to front of response list
      setResponses((prev) => [newResponse, ...prev.filter((r) => r.id !== newResponse.id)]);
      setSelectedReqId('');
    } catch (err: any) {
      setError(err?.message || 'Failed to generate AI response.');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedRequirementObj = requirements.find((r) => r.id === selectedReqId);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            AI Draft Responses (RAG)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Generate grounded proposal sections backed strictly by retrieved document context
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          isLoading={isLoading}
          icon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Generator Card */}
      <Card
        title="Generate Evidence-Grounded Draft"
        subtitle="Retrieves semantic chunks from vector store and drafts response with exact source references"
        className="border-brand-200 dark:border-brand-900/40 bg-brand-50/20 dark:bg-brand-950/20"
      >
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select RFP Requirement to Address
            </label>
            <select
              value={selectedReqId}
              onChange={(e) => setSelectedReqId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            >
              <option value="">-- Choose a requirement from the repository --</option>
              {requirements.map((req) => (
                <option key={req.id} value={req.id}>
                  [{req.category}] [{req.priority}] {req.requirement_text.slice(0, 110)}...
                </option>
              ))}
            </select>
          </div>

          {selectedRequirementObj && (
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs space-y-1">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Selected Requirement:
              </p>
              <p className="text-slate-600 dark:text-slate-400 italic">
                "{selectedRequirementObj.requirement_text}"
              </p>
              <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span>Category: <strong className="text-slate-700 dark:text-slate-300">{selectedRequirementObj.category}</strong></span>
                <span>Priority: <strong className="text-slate-700 dark:text-slate-300">{selectedRequirementObj.priority}</strong></span>
                <span>Type: <strong className="text-slate-700 dark:text-slate-300">{selectedRequirementObj.requirement_type}</strong></span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
              * The LLM strictly grounds drafts on matching chunks; if evidence is absent, it flags gaps.
            </p>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isGenerating}
              disabled={!selectedReqId}
              icon={<Sparkles className="w-4 h-4" />}
            >
              {isGenerating ? 'Retrieving Chunks & Generating...' : 'Generate Response'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Draft Responses List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <span>Draft Response Library</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
            {responses.length}
          </span>
        </h2>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-brand-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Loading responses...</p>
          </div>
        ) : responses.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="w-6 h-6" />}
            title="No Draft Responses Yet"
            description="Select an extracted requirement above to generate the first evidence-backed proposal response."
          />
        ) : (
          <div className="space-y-4">
            {responses.map((resp) => (
              <ResponseCard
                key={resp.id}
                responseItem={resp}
                onUpdated={(updated) => {
                  setResponses((prev) =>
                    prev.map((r) => (r.id === updated.id ? updated : r))
                  );
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
