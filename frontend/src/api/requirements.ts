import { cachedGet } from './client';
import { RequirementItem, RequirementListResponse } from '../types';

export const requirementsApi = {
  getAll: (params?: {
    document_id?: string;
    category?: string;
    priority?: string;
    skip?: number;
    limit?: number;
  }): Promise<RequirementListResponse> => {
    return cachedGet<RequirementListResponse>('/requirements/', params);
  },

  getById: (id: string): Promise<RequirementItem> => {
    return cachedGet<RequirementItem>(`/requirements/${id}`);
  },
};
