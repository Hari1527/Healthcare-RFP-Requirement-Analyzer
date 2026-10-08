import { cachedGet } from './client';
import { ComplianceReport, MissingRequirementsResponse } from '../types';

export const complianceApi = {
  getReportByDocumentId: (documentId: string): Promise<ComplianceReport> => {
    return cachedGet<ComplianceReport>(`/compliance/${documentId}`);
  },

  getMissingRequirements: (documentId?: string): Promise<MissingRequirementsResponse> => {
    return cachedGet<MissingRequirementsResponse>(
      '/compliance/missing',
      documentId ? { document_id: documentId } : undefined
    );
  },
};
