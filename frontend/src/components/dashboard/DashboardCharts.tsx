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
  Technical: '#38bdf8',
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
  Low: '#64748b',
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

  const customTooltipStyle = {
    backgroundColor: '#0f172a',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
    color: '#f8fafc',
    fontSize: '12px',
    padding: '8px 12px',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
      {/* Chart 1: Requirements by Category */}
      <Card
        title="Requirements by Domain"
        subtitle="Distribution across clinical & regulatory categories"
        className="lg:col-span-1"
      >
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-xs text-slate-500">
            No requirements indexed yet.
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categories}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 25, bottom: 5 }}
              >
                <XAxis type="number" fontSize={11} stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis
                  dataKey="category"
                  type="category"
                  fontSize={11}
                  stroke="#94a3b8"
                  width={75}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value: number) => [`${value} Specifications`, 'Count']}
                  contentStyle={customTooltipStyle}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
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
        title="Requirements by Criticality"
        subtitle="Priority weighting and urgency breakdown"
        className="lg:col-span-1"
      >
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : priorities.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-xs text-slate-500">
            No priority data available yet.
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={priorities}
                margin={{ top: 15, right: 15, left: -15, bottom: 5 }}
              >
                <XAxis dataKey="priority" fontSize={11} stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis fontSize={11} stroke="#64748b" tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(value: number) => [`${value} Specifications`, 'Count']}
                  contentStyle={customTooltipStyle}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
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
        title="Audit Readiness Breakdown"
        subtitle="Weighted compliance index based on evidence"
        className="lg:col-span-1"
      >
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : complianceData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-xs text-slate-500">
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
                  paddingAngle={5}
                  dataKey="value"
                  stroke="#0b1120"
                  strokeWidth={2}
                >
                  {complianceData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COMPLIANCE_COLORS[index % COMPLIANCE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value} Requirements`, 'Status']}
                  contentStyle={customTooltipStyle}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-xs text-slate-300 font-medium ml-1">
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
