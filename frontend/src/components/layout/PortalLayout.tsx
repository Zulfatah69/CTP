import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function PortalLayout() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-blue-600 text-white px-8 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🏛️</span>
            <h1 className="text-xl font-bold">Portal CTP</h1>
          </div>
          <div className="space-x-4">
            <Link to="/portal" className={`hover:text-blue-200 ${location.pathname === '/portal' ? 'font-bold underline' : ''}`}>Form Booking</Link>
            <Link to="/portal/calendar" className={`hover:text-blue-200 ${location.pathname === '/portal/calendar' ? 'font-bold underline' : ''}`}>Kalender</Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm opacity-90">{user?.email}</span>
          <button onClick={() => { logout(); window.location.href='/login'; }} className="text-sm bg-white/20 px-3 py-1 rounded hover:bg-white/30 font-medium transition">Keluar</button>
        </div>
      </nav>
      <main className="flex-1 py-4">
        <Outlet />
      </main>
    </div>
  );
}
