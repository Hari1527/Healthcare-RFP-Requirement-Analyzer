import React, { useState } from 'react';
import { Settings as SettingsIcon, Database, Cpu, Shield, Check, Globe } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Alert } from '../components/common/Alert';

export const SettingsPage: React.FC = () => {
  const [apiUrl, setApiUrl] = useState(
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
  );
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          System Configuration & Model Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Backend API endpoints, embedding model parameters, and compliance scoring rules
        </p>
      </div>

      {saved && (
        <Alert
          type="success"
          message="System environment settings updated successfully."
        />
      )}

      {/* Backend API Connection */}
      <Card
        title="Backend API Connection"
        subtitle="Configure REST API gateway communication"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-brand-600" />
              REST API Base URL
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Default local address: http://localhost:8000/api
            </p>
          </div>

          <Button type="submit" variant="primary" size="sm">
            Save Endpoint
          </Button>
        </form>
      </Card>

      {/* Model & Vector Settings (Info) */}
      <Card
        title="AI Engine & Vector Retrieval Architecture"
        subtitle="Active components running on the connected backend"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <Cpu className="w-4 h-4 text-brand-600" />
              <span>Language Models (Configurable)</span>
            </div>
            <p className="text-slate-600">
              Providers: <strong>OpenAI (GPT-4)</strong> or <strong>Anthropic (Claude 3.5 Sonnet)</strong>
            </p>
            <p className="text-slate-500 text-[11px]">
              Configured via backend <code className="text-brand-700">.env</code> (LLM_PROVIDER, LLM_MODEL).
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <Database className="w-4 h-4 text-purple-600" />
              <span>Vector Database & Embeddings</span>
            </div>
            <p className="text-slate-600">
              Model: <strong>sentence-transformers/all-MiniLM-L6-v2</strong>
            </p>
            <p className="text-slate-500 text-[11px]">
              Vector Engine: <strong>ChromaDB Persistent Engine</strong> (Cosine Distance).
            </p>
          </div>
        </div>
      </Card>

      {/* Compliance Formula */}
      <Card
        title="Compliance Scoring Formula Documentation"
        subtitle="Mathematical basis for executive readiness scoring"
      >
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-3 font-mono leading-relaxed">
          <p className="font-semibold text-slate-900 font-sans">
            Priority Weights Schema:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>Critical Requirements: <strong>4.0x multiplier</strong></li>
            <li>High Priority Requirements: <strong>3.0x multiplier</strong></li>
            <li>Medium Priority Requirements: <strong>2.0x multiplier</strong></li>
            <li>Low Priority Requirements: <strong>1.0x multiplier</strong></li>
          </ul>
          <div className="pt-2 border-t border-slate-200 text-[11px]">
            <code>Compliance Score = (Earned Weights / Total Possible Weights) * 100</code>
          </div>
        </div>
      </Card>
    </div>
  );
};
