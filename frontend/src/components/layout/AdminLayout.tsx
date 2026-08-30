import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="bg-white border-b px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex space-x-8 items-center">
          <h1 className="text-xl font-bold text-blue-600">CTP Admin</h1>
          <div className="space-x-4">
            <Link 
              to="/admin/dashboard" 
              className={`font-medium ${location.pathname === '/admin' || location.pathname === '/admin/dashboard' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              🏠 Dashboard
            </Link>
            <Link 
              to="/admin/bookings" 
              className={`font-medium ${location.pathname === '/admin/bookings' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              📅 Antrean Booking
            </Link>
            <Link 
              to="/admin/buildings" 
              className={`font-medium ${location.pathname === '/admin/buildings' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              🏢 Master Gedung
            </Link>
            <Link 
              to="/admin/announcements" 
              className={`font-medium ${location.pathname === '/admin/announcements' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              📢 Pengumuman
            </Link>
            <Link 
              to="/admin/reports" 
              className={`font-medium ${location.pathname === '/admin/reports' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              📊 Laporan & Statistik
            </Link>
            <Link 
              to="/admin/audit" 
              className={`font-medium ${location.pathname === '/admin/audit' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              🕵️ Audit Trail
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Halo, {user?.email}</span>
          <button onClick={() => { logout(); window.location.href='/login'; }} className="text-sm text-red-600 font-medium hover:underline">Logout</button>
        </div>
      </nav>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
