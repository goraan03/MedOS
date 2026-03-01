import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserRound, Stethoscope, Calendar, LogOut, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '@/store/auth.store';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', module: null },
  { to: '/appointments', icon: Calendar, label: 'Appointments', module: null },
  { to: '/patients', icon: UserRound, label: 'Patients', module: null },
  { to: '/services', icon: Stethoscope, label: 'Services', module: null },
  { to: '/clinic/staff', icon: Users, label: 'Staff', module: null },
  { to: '/clinic/settings', icon: Settings, label: 'Settings', module: null },
];

export function AppLayout() {
  const { clinic, user, logout, modules } = useAuthStore();
  const navigate = useNavigate();

  const visibleItems = NAV_ITEMS.filter(
    item => item.module === null || modules.includes(item.module),
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">MedOS</h1>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{clinic?.name}</p>
          {modules.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {modules.map(m => (
                <span key={m} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                  {m}
                </span>
              ))}
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {visibleItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100',
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <button onClick={() => { logout(); navigate('/login'); }} className="p-1.5 text-gray-400 hover:text-gray-600 rounded">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}