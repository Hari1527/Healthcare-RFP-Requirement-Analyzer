import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, Shield, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Topbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const getPageInfo = (path: string): { title: string; subtitle: string; badge?: string } => {
    if (path === '/') {
      return {
        title: 'Executive Proposal Intelligence',
        subtitle: 'Real-time telemetry, requirement extraction health, and compliance scoring',
        badge: 'LIVE METRICS',
      };
    }
    if (path.startsWith('/documents/')) {
      return {
        title: 'Document Analysis Studio',
        subtitle: 'Page-level chunk inspection, section hierarchies, and citation mapping',
        badge: 'CHUNK INSPECTION',
      };
    }
    if (path.startsWith('/documents')) {
      return {
        title: 'RFP Document Repository',
        subtitle: 'Multi-format ingestion pipeline for hospital contracts (PDF, DOCX, TXT)',
        badge: 'INGESTION ENGINE',
      };
    }
    if (path.startsWith('/requirements/')) {
      return {
        title: 'Requirement Specification',
        subtitle: 'Extracted regulatory clause, priority weights, and semantic relationships',
      };
    }
    if (path.startsWith('/requirements')) {
      return {
        title: 'Requirements Matrix',
        subtitle: 'Searchable multi-contract taxonomy across Clinical, Security, and Compliance',
        badge: 'SEMANTIC TAXONOMY',
      };
    }
    if (path.startsWith('/responses')) {
      return {
        title: 'AI Draft Studio (RAG)',
        subtitle: 'Strict evidence-grounded proposal drafting backed by ChromaDB source citations',
        badge: 'RAG WORKFLOW',
      };
    }
    if (path.startsWith('/compliance')) {
      return {
        title: 'Compliance & Audit Checklist',
        subtitle: 'Weighted satisfaction index (Critical=4x) and gap identification',
        badge: 'AUDIT READY',
      };
    }
    if (path.startsWith('/search')) {
      return {
        title: 'Vector Semantic Search',
        subtitle: 'Natural language retrieval powered by sentence-transformers embeddings',
        badge: 'CHROMA ENGINE',
      };
    }
    if (path.startsWith('/settings')) {
      return {
        title: 'System & Architecture Settings',
        subtitle: 'API endpoints, vector index properties, and compliance formula parameters',
      };
    }
    return { title: 'HealthRFP Suite', subtitle: 'Enterprise Proposal Intelligence' };
  };

  const { title, subtitle, badge } = getPageInfo(location.pathname);

  return (
    <header className="h-20 bg-[#080d19]/80 backdrop-blur-xl border-b border-white/[0.06] px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight leading-none">
              {title}
            </h2>
            {badge && (
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-brand-500/15 text-brand-300 border border-brand-500/25 tracking-wider">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 font-normal">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3.5">
        {/* Quick Search Bar */}
        <button
          onClick={() => navigate('/search')}
          className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-brand-500/40 text-slate-400 hover:text-slate-200 text-xs transition-all shadow-inner group"
        >
          <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-400 transition-colors" />
          <span className="text-slate-400">Search vectors...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-800 border border-slate-700 rounded font-mono text-slate-400">
            ⌘K
          </kbd>
        </button>

        {/* Action Button: RAG Studio Shortcut */}
        <button
          onClick={() => navigate('/responses')}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 text-brand-300 text-xs font-semibold transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>Draft Studio</span>
        </button>

        {/* Security / HIPAA badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] font-medium text-emerald-400">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>BAA Encrypted</span>
        </div>

        {/* User Pill */}
        {user && (
          <div className="flex items-center gap-2 pl-3 border-l border-white/[0.08]">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-md border border-white/10">
              {user.name.charAt(0)}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
