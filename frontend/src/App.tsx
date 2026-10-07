import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/Dashboard';
import { DocumentsPage } from './pages/Documents';
import { DocumentDetailsPage } from './pages/DocumentDetails';
import { RequirementsPage } from './pages/Requirements';
import { RequirementDetailsPage } from './pages/RequirementDetails';
import { DraftResponsesPage } from './pages/DraftResponses';
import { CompliancePage } from './pages/Compliance';
import { SearchPage } from './pages/Search';
import { SettingsPage } from './pages/Settings';
import { LoginPage } from './pages/Login';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Application Shell */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/documents/:id" element={<DocumentDetailsPage />} />
            <Route path="/requirements" element={<RequirementsPage />} />
            <Route path="/requirements/:id" element={<RequirementDetailsPage />} />
            <Route path="/responses" element={<DraftResponsesPage />} />
            <Route path="/compliance" element={<CompliancePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
