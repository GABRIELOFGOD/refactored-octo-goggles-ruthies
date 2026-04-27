'use client';

import { useAuth } from '@/provider/auth-provider';
import { Bell, Settings, User, LogOut } from 'lucide-react';

export default function AdminHeader() {
  const { user, logOut: userLogOut } = useAuth();

  return (
    <header className="sticky top-0 z-20 w-full bg-white border-b border-neutral-200 md:ml-64">
      <div className="flex items-center w-full justify-between px-6 py-4">
        {/* Left */}
        <div>
          <h2 className="text-sm text-neutral-600">Welcome back,</h2>
          <p className="font-semibold text-primary">{user?.name || 'Admin'}</p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <button className="relative text-neutral-600 hover:text-primary transition-colors">
            <Bell className="w-5 h-5" />
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-secondary rounded-full"></span>
          </button>

          <button className="text-neutral-600 hover:text-primary transition-colors">
            <Settings className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 pl-4 border-l border-neutral-200">
            <div className="w-8 h-8 rounded-full bg-secondary text-light-bg flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <button
              onClick={() => userLogOut({ redirectTo: "/" })}
              className="text-neutral-600 hover:text-primary transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
