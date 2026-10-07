import React, { useEffect, useState } from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { requirementsApi, documentsApi } from '../api';
import { RequirementItem, DocumentItem } from '../types';
import { RequirementTable } from '../components/requirements/RequirementTable';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Alert } from '../components/common/Alert';

export const RequirementsPage: React.FC = () => {
  const [requirements, setRequirements] = useState<RequirementItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [total, setTotal] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRequirements = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params: any = { skip: 0, limit: 200 };
      if (selectedDocId) params.document_id = selectedDocId;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedPriority) params.priority = selectedPriority;

      const [reqRes, docRes] = await Promise.all([
        requirementsApi.getAll(params),
        documentsApi.getAll(0, 50).catch(() => ({ documents: [], total: 0 })),
      ]);

      setRequirements(reqRes.requirements);
      setTotal(reqRes.total);
      setDocuments(docRes.documents);
    } catch (err: any) {
      setError(err?.message || 'Failed to load requirements.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, [selectedDocId, selectedCategory, selectedPriority]);

  const filteredRequirements = requirements.filter((r) =>
    r.requirement_text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Requirements Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-contract extracted requirements database with categorization & priority
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchRequirements}
          isLoading={isLoading}
          icon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Filter Toolbar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in requirements..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
            />
          </div>

          {/* Document filter */}
          <div>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All RFP Documents</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.original_filename}
                </option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Categories</option>
              <option value="Clinical">Clinical</option>
              <option value="Technical">Technical</option>
              <option value="Security">Security</option>
              <option value="Compliance">Compliance</option>
              <option value="Financial">Financial</option>
              <option value="Legal">Legal</option>
              <option value="Operational">Operational</option>
              <option value="General">General</option>
            </select>
          </div>

          {/* Priority filter */}
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <RequirementTable
        requirements={filteredRequirements}
        isLoading={isLoading}
      />
    </div>
  );
};
