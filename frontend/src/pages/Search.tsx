import React, { useState } from 'react';
import { Search, Sparkles, Filter, BookOpen, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchApi } from '../api';
import { SearchResultItem } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Alert } from '../components/common/Alert';
import { EmptyState } from '../components/common/EmptyState';
import {
  getPriorityColor,
  getCategoryBadgeColor,
} from '../utils/formatters';

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [topK, setTopK] = useState(10);

  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    try {
      setIsSearching(true);
      setError(null);
      setHasSearched(true);

      const response = await searchApi.search({
        query: query.trim(),
        category: categoryFilter || undefined,
        priority: priorityFilter || undefined,
        top_k: topK,
      });

      setResults(response.results);
    } catch (err: any) {
      setError(err?.message || 'Semantic search query failed.');
    } finally {
      setIsSearching(false);
    }
  };

  const sampleQueries = [
    'cybersecurity requirements related to patient data',
    'HIPAA compliance and PHI encryption standards',
    'disaster recovery and high availability SLAs',
    'EHR system integration with Epic or Cerner via FHIR',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Semantic Vector Search
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Retrieve clauses across all contracts using sentence-transformers vector embeddings
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Main Search Input Card */}
      <Card className="border-brand-200 dark:border-brand-900/40 bg-brand-50/15 dark:bg-brand-950/20">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-brand-600 dark:text-brand-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across analyzed RFP documents in natural language..."
              className="w-full pl-12 pr-4 py-3.5 text-sm border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-slate-900 shadow-inner font-medium text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Quick suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Suggested:</span>
            {sampleQueries.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(sample);
                }}
                className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 text-[11px] transition-all text-slate-700 dark:text-slate-300"
              >
                {sample}
              </button>
            ))}
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/80 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span>Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                >
                  <option value="">All Categories</option>
                  <option value="Security">Security</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Clinical">Clinical</option>
                  <option value="Technical">Technical</option>
                  <option value="Financial">Financial</option>
                  <option value="Legal">Legal</option>
                  <option value="Operational">Operational</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <span>Priority:</span>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                >
                  <option value="">All Priorities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <span>Top Results:</span>
                <select
                  value={topK}
                  onChange={(e) => setTopK(Number(e.target.value))}
                  className="px-2 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                >
                  <option value={5}>Top 5</option>
                  <option value={10}>Top 10</option>
                  <option value={20}>Top 20</option>
                </select>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSearching}
              disabled={!query.trim()}
              icon={<Search className="w-3.5 h-3.5" />}
            >
              Execute Semantic Search
            </Button>
          </div>
        </form>
      </Card>

      {/* Results Section */}
      <div className="space-y-4">
        {hasSearched && (
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span>
              Found <strong>{results.length}</strong> semantically relevant requirements for: "{query}"
            </span>
          </div>
        )}

        {isSearching ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-800 border-t-brand-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Generating query embedding & querying ChromaDB cosine distance...
            </p>
          </div>
        ) : hasSearched && results.length === 0 ? (
          <EmptyState
            title="No Matching Requirements Found"
            description="Try relaxing your filters or rephrasing your search query in different natural language terms."
          />
        ) : (
          <div className="space-y-3">
            {results.map((item, idx) => (
              <Card
                key={idx}
                className="hover:border-brand-400 dark:hover:border-brand-500 hover:shadow-md transition-all cursor-pointer"
              >
                <div
                  onClick={() => navigate(`/requirements/${item.requirement_id}`)}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
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
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                        Req ID: {item.requirement_id.slice(0, 8)}...
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                          {(item.similarity_score * 100).toFixed(1)}% match
                        </span>
                        <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-0.5">
                          <div
                            className="h-full bg-brand-500 rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, item.similarity_score * 100))}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Requirement Text */}
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                    {item.requirement_text}
                  </p>

                  {/* Context location */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <span>
                        Page: {item.page_number || 'N/A'}{' '}
                        {item.section && `• Section: ${item.section}`}
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/responses', {
                          state: { requirementId: item.requirement_id },
                        });
                      }}
                      icon={<Sparkles className="w-3 h-3 text-brand-600 dark:text-brand-400" />}
                    >
                      Draft Response
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
