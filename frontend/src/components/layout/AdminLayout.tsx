import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard,
  CalendarDays,
  Building2,
  Megaphone,
  BarChart3,
  ShieldCheck,
  LogOut,
  UserCheck,
  Search,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Kelola Booking', path: '/admin/bookings', icon: CalendarDays },
    { label: 'Kalender Operasional', path: '/admin/calendar', icon: CalendarDays },
    { label: 'Master Gedung', path: '/admin/buildings', icon: Building2 },
    { label: 'Pengumuman', path: '/admin/announcements', icon: Megaphone },
    { label: 'Laporan & Statistik', path: '/admin/reports', icon: BarChart3 },
    { label: 'Audit Trail', path: '/admin/audit', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar 256px */}
      <aside className="w-full md:w-64 bg-white border-r border-neutral-200 flex flex-col shrink-0">
        {/* Brand header */}
        <div className="h-16 px-6 border-b border-neutral-200 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-900 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-xs">
            CTP
          </div>
          <div>
            <h2 className="font-bold text-sm text-neutral-950 leading-tight">Admin Portal</h2>
            <span className="text-[10px] text-accent-600 font-bold uppercase tracking-wider block">
              UPTD Cimahi Techno Park
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Menu Operasional
          </div>
          {navItems.map((item) => {
            const active =
              location.pathname === item.path ||
              (item.path === '/admin/dashboard' && location.pathname === '/admin');
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? 'bg-primary-50 text-primary-900 font-bold border-l-4 border-primary-700 shadow-2xs'
                    : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    active ? 'text-primary-700' : 'text-neutral-400'
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-neutral-400 uppercase tracking-wider border-t border-neutral-200 mt-4">
            Akses Publik
          </div>
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
          >
            <span>Lihat Portal Publik</span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
          </Link>
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50/70">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-900 flex items-center justify-center font-bold text-xs">
              <UserCheck className="w-4 h-4 text-primary-700" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-neutral-900 truncate">{user?.email || 'Admin UPTD'}</p>
              <p className="text-[10px] text-neutral-500 font-medium">Administrator</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
            className="w-full text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-neutral-200 h-8 font-medium"
          >
            <LogOut className="w-3.5 h-3.5 mr-1" />
            Keluar Sistem
          </Button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-neutral-200 px-6 sm:px-8 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span>UPTD CTP</span>
            <span>/</span>
            <span className="font-semibold text-neutral-800 capitalize">
              {location.pathname.replace('/admin/', '').replace('/', '') || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Pencarian cepat..."
                className="h-8 pl-8 pr-3 text-xs rounded-md border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 w-48 transition-all"
              />
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
