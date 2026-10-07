import { apiClient } from './client';
import { RequirementItem, RequirementListResponse } from '../types';

export const requirementsApi = {
  getAll: async (params?: {
    document_id?: string;
    category?: string;
    priority?: string;
    skip?: number;
    limit?: number;
  }): Promise<RequirementListResponse> => {
    const response = await apiClient.get<RequirementListResponse>('/requirements/', {
      params,
    });
    return response.data;
  },

  getById: async (id: string): Promise<RequirementItem> => {
    const response = await apiClient.get<RequirementItem>(`/requirements/${id}`);
    return response.data;
  },
};
