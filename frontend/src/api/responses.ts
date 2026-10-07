import { apiClient } from './client';
import {
  DraftResponseItem,
  DraftResponseListResponse,
  GenerateResponseRequest,
  UpdateResponseRequest,
} from '../types';

export const responsesApi = {
  generate: async (payload: GenerateResponseRequest): Promise<DraftResponseItem> => {
    const response = await apiClient.post<DraftResponseItem>('/responses/generate', payload);
    return response.data;
  },

  getAll: async (skip = 0, limit = 100): Promise<DraftResponseListResponse> => {
    const response = await apiClient.get<DraftResponseListResponse>('/responses/', {
      params: { skip, limit },
    });
    return response.data;
  },

  getById: async (id: string): Promise<DraftResponseItem> => {
    const response = await apiClient.get<DraftResponseItem>(`/responses/${id}`);
    return response.data;
  },

  update: async (id: string, payload: UpdateResponseRequest): Promise<DraftResponseItem> => {
    const response = await apiClient.put<DraftResponseItem>(`/responses/${id}`, payload);
    return response.data;
  },
};
