import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, BookOpen, Layers, Shield, RefreshCw } from 'lucide-react';
import { requirementsApi, documentsApi, searchApi } from '../api';
import { RequirementItem, DocumentItem, SearchResultItem } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Alert } from '../components/common/Alert';
import {
  getPriorityColor,
  getCategoryBadgeColor,
  getStatusBadgeColor,
} from '../utils/formatters';

export const RequirementDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [requirement, setRequirement] = useState<RequirementItem | null>(null);
  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [relatedRequirements, setRelatedRequirements] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequirementData = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);

      const reqRes = await requirementsApi.getById(id);
      setRequirement(reqRes);

      // Fetch parent document
      if (reqRes.document_id) {
        documentsApi.getById(reqRes.document_id).then(setDocument).catch(() => null);

        // Fetch related requirements via semantic search
        searchApi
          .search({
            query: reqRes.requirement_text,
            top_k: 4,
          })
          .then((searchRes) => {
            // Filter out current requirement
            const related = searchRes.results.filter((r) => r.requirement_id !== id);
            setRelatedRequirements(related);
          })
          .catch(() => null);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch requirement details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirementData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500">Loading requirement breakdown...</p>
      </div>
    );
  }

  if (!requirement) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/requirements')}>
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Matrix
        </Button>
        <Alert type="error" message="Requirement not found or was deleted." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/requirements')}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Requirements
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Requirement Specification
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">
              ID: {requirement.id}
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() =>
            navigate('/responses', {
              state: {
                requirementId: requirement.id,
                documentId: requirement.document_id,
              },
            })
          }
          icon={<Sparkles className="w-3.5 h-3.5" />}
        >
          Generate AI Draft Response
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Main Requirement Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Requirement Text" subtitle="Exact clause extracted from RFP">
            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 font-medium leading-relaxed">
              {requirement.requirement_text}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">Status in response workflow:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                  requirement.status
                )}`}
              >
                {requirement.status}
              </span>
            </div>
          </Card>

          {/* Semantically Related Requirements */}
          <Card
            title="Semantically Related Requirements"
            subtitle="Discovered via sentence-transformers cosine similarity"
          >
            {relatedRequirements.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                No similar requirements identified in vector store.
              </p>
            ) : (
              <div className="space-y-3">
                {relatedRequirements.map((rel) => (
                  <div
                    key={rel.requirement_id}
                    onClick={() => navigate(`/requirements/${rel.requirement_id}`)}
                    className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-brand-400 dark:hover:border-brand-500/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getCategoryBadgeColor(
                            rel.category
                          )}`}
                        >
                          {rel.category}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getPriorityColor(
                            rel.priority
                          )}`}
                        >
                          {rel.priority}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400">
                        {(rel.similarity_score * 100).toFixed(0)}% match
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-2 group-hover:text-brand-700 dark:group-hover:text-brand-300">
                      {rel.requirement_text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Classification Sidebar */}
        <div className="space-y-6">
          <Card title="Classification Attributes" subtitle="Structured metadata schema">
            <div className="space-y-4">
              <div>
                <p className="text-[11px] uppercase font-semibold text-slate-400 mb-1">
                  Category
                </p>
                <span
                  className={`inline-block px-3 py-1 rounded-lg border text-xs font-semibold ${getCategoryBadgeColor(
                    requirement.category
                  )}`}
                >
                  {requirement.category}
                </span>
              </div>

              <div>
                <p className="text-[11px] uppercase font-semibold text-slate-400 mb-1">
                  Priority Criticality
                </p>
                <span
                  className={`inline-block px-3 py-1 rounded-lg border text-xs font-semibold ${getPriorityColor(
                    requirement.priority
                  )}`}
                >
                  {requirement.priority}
                </span>
              </div>

              <div>
                <p className="text-[11px] uppercase font-semibold text-slate-400 dark:text-slate-500 mb-1">
                  Obligation Type
                </p>
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  {requirement.requirement_type}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[11px] uppercase font-semibold text-slate-400 dark:text-slate-500 mb-1">
                  Source Reference Location
                </p>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-medium">
                    <BookOpen className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                    <span>Page: {requirement.page_number || 'Unspecified'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500">Section: </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{requirement.section || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {document && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] uppercase font-semibold text-slate-400 dark:text-slate-500 mb-1">
                    Originating RFP
                  </p>
                  <p
                    onClick={() => navigate(`/documents/${document.id}`)}
                    className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-semibold cursor-pointer truncate"
                  >
                    {document.original_filename}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {document.organization || 'Healthcare Issuer'}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
