import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Building2, Calendar, FileText, LayoutDashboard, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PortalLayout() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const navItems = [
    { label: 'Dashboard Saya', path: '/portal/dashboard', icon: LayoutDashboard },
    { label: 'Form Pengajuan', path: '/portal', icon: FileText },
    { label: 'Kalender Jadwal', path: '/portal/calendar', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col font-sans">
      {/* Formal Government Header */}
      <header className="bg-primary-900 text-white shadow-xs sticky top-0 z-40 border-b border-primary-700/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-accent-600 text-white rounded-lg flex items-center justify-center font-bold shadow-xs">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-sm sm:text-base leading-none block text-white">
                  UPTD Cimahi Techno Park
                </span>
                <span className="text-[11px] text-neutral-300 block font-normal mt-0.5">
                  Portal Layanan Digital
                </span>
              </div>
            </Link>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-primary-700/60">
              {navItems.map((item) => {
                const active = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                      active
                        ? 'bg-primary-700 text-white shadow-2xs'
                        : 'text-neutral-200 hover:bg-primary-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Section */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-200 bg-primary-800/80 px-3 py-1.5 rounded-lg border border-primary-700">
              <User className="w-3.5 h-3.5 text-accent-400" />
              <span className="font-medium max-w-[150px] truncate">{user?.email}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
              className="bg-transparent border-primary-500 text-white hover:bg-primary-800 hover:text-white text-xs h-8 px-2.5"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" />
              Keluar
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Formal Footer */}
      <footer className="bg-white border-t border-neutral-200 py-6 text-xs text-neutral-500 text-center">
        <div className="max-w-6xl mx-auto px-4">
          <p>© 2026 UPTD Cimahi Techno Park & BITC &bull; Dinas Perdagangan, Koperasi, UKM dan Perindustrian Kota Cimahi</p>
        </div>
      </footer>
    </div>
  );
}
