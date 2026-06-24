'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { LayoutDashboard, Dumbbell, User, History, LogOut, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/gyms', label: 'Gyms', icon: Dumbbell },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/login-history', label: 'Login History', icon: History },
];

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col bg-gray-900 text-white">
        <div className="flex items-center gap-2 border-b border-gray-700 px-6 py-4">
          <ShieldCheck className="h-6 w-6 text-blue-400" />
          <span className="text-lg font-bold">FitCore Pro</span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-gray-700 px-4 py-4">
          <div className="mb-2 text-xs text-gray-400">{user.email}</div>
          <button onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Welcome</p>
              <p className="mt-1 text-lg font-semibold">{user.fullName}</p>
            </div>
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Role</p>
              <p className="mt-1 text-lg font-semibold capitalize">{user.role}</p>
            </div>
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Status</p>
              <p className={`mt-1 text-lg font-semibold ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
