import { apiClient } from './client';
import {
  DocumentItem,
  DocumentListResponse,
  DocumentUploadResponse,
  DocumentStatusResponse,
  RequirementListResponse,
} from '../types';

export const documentsApi = {
  upload: async (file: File, organization?: string): Promise<DocumentUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (organization) {
      formData.append('organization', organization);
    }

    const response = await apiClient.post<DocumentUploadResponse>('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAll: async (skip = 0, limit = 100): Promise<DocumentListResponse> => {
    const response = await apiClient.get<DocumentListResponse>('/documents/', {
      params: { skip, limit },
    });
    return response.data;
  },

  getById: async (id: string): Promise<DocumentItem> => {
    const response = await apiClient.get<DocumentItem>(`/documents/${id}`);
    return response.data;
  },

  getStatus: async (id: string): Promise<DocumentStatusResponse> => {
    const response = await apiClient.get<DocumentStatusResponse>(`/documents/${id}/status`);
    return response.data;
  },

  analyze: async (id: string): Promise<{ message: string; document_id: string }> => {
    const response = await apiClient.post<{ message: string; document_id: string }>(
      `/documents/${id}/analyze`
    );
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/documents/${id}`);
    return response.data;
  },

  getRequirements: async (
    id: string,
    skip = 0,
    limit = 100
  ): Promise<RequirementListResponse> => {
    const response = await apiClient.get<RequirementListResponse>(
      `/documents/${id}/requirements`,
      {
        params: { skip, limit },
      }
    );
    return response.data;
  },
};
