import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  ChevronRight,
  Database,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/formatters';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Executive Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'RFP Documents', path: '/documents', icon: FileText },
    { label: 'Requirements Matrix', path: '/requirements', icon: ListTodo },
    { label: 'AI Draft Responses', path: '/responses', icon: Sparkles },
    { label: 'Compliance Audit', path: '/compliance', icon: ShieldCheck },
    { label: 'Vector Search', path: '/search', icon: Search },
    { label: 'Model Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={cn(
        'w-64 bg-[#0a0f1d] border-r border-white/[0.08] text-slate-300 flex flex-col justify-between select-none min-h-screen z-30 shadow-2xl',
        className
      )}
    >
      <div>
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center gap-3.5 border-b border-white/[0.06] bg-white/[0.01]">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-sky-400 flex items-center justify-center text-white shadow-glow-brand">
              <Activity className="w-5 h-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0a0f1d] rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold text-white tracking-tight leading-tight">
                HealthRFP
              </h1>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-brand-500/20 text-brand-300 font-semibold border border-brand-500/30">
                AI PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              Healthcare Proposal Suite
            </p>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="px-3 py-6 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Enterprise Navigation
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group',
                  isActive
                    ? 'text-white font-semibold bg-brand-500/10 border border-brand-500/25 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={cn(
                        'w-4 h-4 flex-shrink-0 transition-colors',
                        isActive
                          ? 'text-brand-400'
                          : 'text-slate-500 group-hover:text-slate-300'
                      )}
                    />
                    <span>{item.label}</span>
                  </div>

                  {isActive ? (
                    <motion.div
                      layoutId="activeIndicator"
                      className="w-1.5 h-1.5 rounded-full bg-brand-400 shadow-glow-brand"
                    />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      {/* User & Infrastructure Section */}
      <div className="p-4 border-t border-white/[0.06] bg-black/20">
        {user ? (
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm flex-shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                    {user.role}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign out session"
                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 font-mono">
          <span className="flex items-center gap-1">
            <Database className="w-3 h-3 text-brand-400" /> ChromaDB Vector
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-sans font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Connected
          </span>
        </div>
      </div>
    </aside>
  );
};
