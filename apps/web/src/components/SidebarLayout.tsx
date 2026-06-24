'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, type ReactNode } from 'react';
import { LayoutDashboard, Dumbbell, User, History, LogOut, ShieldCheck, Shield, DollarSign, Pill, Award, Package, BadgeDollarSign } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/gyms', label: 'Gyms', icon: Dumbbell },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/login-history', label: 'Login History', icon: History },
];

export function SidebarLayout({ children }: { children: ReactNode }) {
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
          {user?.roles.includes('super_admin') && (
            <>
              <Link href="/admin/gyms"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-yellow-300 hover:bg-gray-800 hover:text-white">
                <Shield className="h-5 w-5" />
                Gyms
              </Link>
              <Link href="/admin/billing"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-yellow-300 hover:bg-gray-800 hover:text-white">
                <DollarSign className="h-5 w-5" />
                Billing
              </Link>
              <Link href="/admin/supplements"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-yellow-300 hover:bg-gray-800 hover:text-white">
                <Pill className="h-5 w-5" />
                Supplements
              </Link>
              <Link href="/admin/trainers"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-yellow-300 hover:bg-gray-800 hover:text-white">
                <Award className="h-5 w-5" />
                Trainers
              </Link>
              <Link href="/admin/pt-packages"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-yellow-300 hover:bg-gray-800 hover:text-white">
                <Package className="h-5 w-5" />
                PT Packages
              </Link>
              <Link href="/admin/pt-sessions"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-yellow-300 hover:bg-gray-800 hover:text-white">
                <Dumbbell className="h-5 w-5" />
                PT Sessions
              </Link>
              <Link href="/admin/commissions"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-yellow-300 hover:bg-gray-800 hover:text-white">
                <BadgeDollarSign className="h-5 w-5" />
                Commissions
              </Link>
            </>
          )}
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
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
