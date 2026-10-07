import { apiClient } from './client';
import { ComplianceReport, MissingRequirementsResponse } from '../types';

export const complianceApi = {
  getReportByDocumentId: async (documentId: string): Promise<ComplianceReport> => {
    const response = await apiClient.get<ComplianceReport>(`/compliance/${documentId}`);
    return response.data;
  },

  getMissingRequirements: async (documentId?: string): Promise<MissingRequirementsResponse> => {
    const response = await apiClient.get<MissingRequirementsResponse>('/compliance/missing', {
      params: documentId ? { document_id: documentId } : undefined,
    });
    return response.data;
  },
};
