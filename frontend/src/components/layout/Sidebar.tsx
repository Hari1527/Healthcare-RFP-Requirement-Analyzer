import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  ListTodo,
  Sparkles,
  ShieldCheck,
  Search,
  Settings,
  Activity,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/formatters';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'RFP Documents', path: '/documents', icon: FileText },
    { label: 'Requirements', path: '/requirements', icon: ListTodo },
    { label: 'Draft Responses', path: '/responses', icon: Sparkles },
    { label: 'Compliance Checklist', path: '/compliance', icon: ShieldCheck },
    { label: 'Semantic Search', path: '/search', icon: Search },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={cn(
        'w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between select-none min-h-screen',
        className
      )}
    >
      <div>
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight leading-tight">
              HealthRFP
            </h1>
            <p className="text-[10px] text-brand-400 font-medium tracking-wide uppercase">
              Requirement Analyzer
            </p>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="px-3 py-6 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Enterprise Menu
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group',
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      'w-4 h-4 flex-shrink-0 transition-colors',
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    )}
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      {/* User & Version Section */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        {user ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-brand-400 flex-shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate leading-tight">
                  {user.name}
                </p>
                <p className="text-[10px] text-slate-400 truncate leading-tight">
                  {user.role}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout session"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <NavLink
            to="/login"
            className="block text-center text-xs py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Sign In
          </NavLink>
        )}

        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
          <span>Enterprise v1.0.0</span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Backend Active
          </span>
        </div>
      </div>
    </aside>
  );
};
