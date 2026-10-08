import { cachedGet } from './client';
import {
  DashboardSummary,
  CategoryCount,
  PriorityCount,
  ComplianceOverview,
} from '../types';

export const dashboardApi = {
  getSummary: (): Promise<DashboardSummary> => {
    return cachedGet<DashboardSummary>('/dashboard/summary');
  },

  getByCategory: (): Promise<CategoryCount[]> => {
    return cachedGet<CategoryCount[]>('/dashboard/requirements-by-category');
  },

  getByPriority: (): Promise<PriorityCount[]> => {
    return cachedGet<PriorityCount[]>('/dashboard/requirements-by-priority');
  },

  getComplianceOverview: (): Promise<ComplianceOverview> => {
    return cachedGet<ComplianceOverview>('/dashboard/compliance-overview');
  },
};
