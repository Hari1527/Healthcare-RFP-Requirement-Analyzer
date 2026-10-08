import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, Shield, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Topbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const getPageTitle = (path: string): { title: string; subtitle: string } => {
    if (path === '/') {
      return {
        title: 'Executive Analytics',
        subtitle: 'Overview of healthcare RFP processing and requirement health',
      };
    }
    if (path.startsWith('/documents/')) {
      return {
        title: 'RFP Document Analysis',
        subtitle: 'Granular requirement inspection and page-level source references',
      };
    }
    if (path.startsWith('/documents')) {
      return {
        title: 'RFP Document Repository',
        subtitle: 'Upload, validate, and manage incoming hospital and payer RFPs',
      };
    }
    if (path.startsWith('/requirements/')) {
      return {
        title: 'Requirement Detail',
        subtitle: 'Categorization, priority breakdown, and semantic relationships',
      };
    }
    if (path.startsWith('/requirements')) {
      return {
        title: 'Requirements Matrix',
        subtitle: 'Filter and inspect extracted specifications across all contracts',
      };
    }
    if (path.startsWith('/responses')) {
      return {
        title: 'AI Draft Responses (RAG)',
        subtitle: 'Generate evidence-grounded responses with strict source citations',
      };
    }
    if (path.startsWith('/compliance')) {
      return {
        title: 'Compliance & Gap Analysis',
        subtitle: 'Weighted satisfaction tracking and audit readiness checklist',
      };
    }
    if (path.startsWith('/search')) {
      return {
        title: 'Semantic Vector Search',
        subtitle: 'Natural language search powered by sentence-transformers & ChromaDB',
      };
    }
    if (path.startsWith('/settings')) {
      return {
        title: 'System & Model Settings',
        subtitle: 'API endpoints, vector index configurations, and enterprise preferences',
      };
    }
    return { title: 'RFP Analyzer', subtitle: 'AI-Powered Proposal Suite' };
  };

  const { title, subtitle } = getPageTitle(location.pathname);

  return (
    <header className="h-20 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm/50">
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
          {title}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Search Shortcut */}
        <button
          onClick={() => navigate('/search')}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 text-xs transition-all shadow-inner"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span>Quick semantic search...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded font-mono text-slate-400">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Icon with Mock Badge */}
        <div className="relative">
          <button
            title="System notifications"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white" />
          </button>
        </div>

        {/* Help button */}
        <button
          title="Enterprise Documentation"
          onClick={() => navigate('/settings')}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Security Status Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[11px] font-medium text-emerald-700">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>HIPAA Safe</span>
        </div>

        {/* User Pill */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-brand-100 border border-brand-200 text-brand-700 font-semibold flex items-center justify-center text-xs">
              {user.name.charAt(0)}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
