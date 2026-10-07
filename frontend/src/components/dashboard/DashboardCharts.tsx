import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card } from '../common/Card';
import { CategoryCount, PriorityCount, ComplianceOverview } from '../../types';

interface DashboardChartsProps {
  categories: CategoryCount[];
  priorities: PriorityCount[];
  compliance: ComplianceOverview | null;
  isLoading: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  Clinical: '#10b981',
  Technical: '#0ea5e9',
  Security: '#f43f5e',
  Compliance: '#a855f7',
  Financial: '#f59e0b',
  Legal: '#6366f1',
  Operational: '#14b8a6',
  General: '#64748b',
};

const PRIORITY_COLORS: Record<string, string> = {
  Critical: '#ef4444',
  High: '#f59e0b',
  Medium: '#3b82f6',
  Low: '#94a3b8',
};

const COMPLIANCE_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1'];

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  categories,
  priorities,
  compliance,
  isLoading,
}) => {
  const complianceData = [
    { name: 'Compliant', value: compliance?.compliant || 0 },
    { name: 'Partially Compliant', value: compliance?.partially_compliant || 0 },
    { name: 'Missing', value: compliance?.missing || 0 },
    { name: 'Needs Review', value: compliance?.needs_review || 0 },
  ].filter((item) => item.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      {/* Chart 1: Requirements by Category */}
      <Card
        title="Requirements by Category"
        subtitle="Distribution across operational & regulatory domains"
        className="lg:col-span-1"
      >
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-xs text-slate-400">
            No category data available yet.
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categories}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 25, bottom: 5 }}
              >
                <XAxis type="number" fontSize={11} stroke="#94a3b8" />
                <YAxis
                  dataKey="category"
                  type="category"
                  fontSize={11}
                  stroke="#94a3b8"
                  width={75}
                />
                <Tooltip
                  formatter={(value: number) => [`${value} Requirements`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {categories.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[entry.category] || '#64748b'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Chart 2: Requirements by Priority */}
      <Card
        title="Requirements by Priority"
        subtitle="Criticality weighting and urgency breakdown"
        className="lg:col-span-1"
      >
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : priorities.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-xs text-slate-400">
            No priority data available yet.
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={priorities}
                margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
              >
                <XAxis dataKey="priority" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" />
                <Tooltip
                  formatter={(value: number) => [`${value} Requirements`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {priorities.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PRIORITY_COLORS[entry.priority] || '#3b82f6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Chart 3: Compliance Overview */}
      <Card
        title="Compliance Status Overview"
        subtitle="Satisfaction breakdown based on evidence"
        className="lg:col-span-1"
      >
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : complianceData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-xs text-slate-400">
            No compliance status recorded yet.
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complianceData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {complianceData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COMPLIANCE_COLORS[index % COMPLIANCE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value} Requirements`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-xs text-slate-600 font-medium">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
};
