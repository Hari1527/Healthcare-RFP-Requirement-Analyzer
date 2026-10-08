import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const AppLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-[#070b14] font-sans text-slate-100 relative">
      {/* Background Ambient Glow */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[350px] bg-brand-500/5 rounded-full blur-[140px] pointer-events-none -z-0" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[300px] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none -z-0" />

      {/* Fixed Sidebar */}
      <Sidebar className="fixed inset-y-0 left-0 z-30" />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen relative z-10">
        <Topbar />
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
