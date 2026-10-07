import { apiClient } from './client';
import {
  DashboardSummary,
  CategoryCount,
  PriorityCount,
  ComplianceOverview,
} from '../types';

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await apiClient.get<DashboardSummary>('/dashboard/summary');
    return response.data;
  },

  getByCategory: async (): Promise<CategoryCount[]> => {
    const response = await apiClient.get<CategoryCount[]>('/dashboard/requirements-by-category');
    return response.data;
  },

  getByPriority: async (): Promise<PriorityCount[]> => {
    const response = await apiClient.get<PriorityCount[]>('/dashboard/requirements-by-priority');
    return response.data;
  },

  getComplianceOverview: async (): Promise<ComplianceOverview> => {
    const response = await apiClient.get<ComplianceOverview>('/dashboard/compliance-overview');
    return response.data;
  },
};
