'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getPtSessions } from '@/lib/api';
import { ShieldAlert, RotateCcw, DollarSign, Building2, Dumbbell, Package, Clock } from 'lucide-react';

interface PtSession {
  id: string;
  scheduledAt: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  notes: string | null;
  createdAt: string;
  trainer: { id: string; user: { id: string; email: string; firstName: string; lastName: string } };
  client: { id: string; email: string; firstName: string; lastName: string };
  package: { id: string; name: string; totalSessions: number } | null;
  gym: { id: string; name: string } | null;
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  checked_in: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

function PtSessionListContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<PtSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !user.roles.includes('super_admin'))) {
      router.push('/');
      return;
    }
    if (user) loadSessions();
  }, [user, authLoading, statusFilter]);

  async function loadSessions() {
    setLoading(true);
    try {
      const filters: any = {};
      if (statusFilter) filters.status = statusFilter;
      const data = await getPtSessions(filters);
      setSessions(Array.isArray(data) ? data : []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>;
  }
  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col bg-gray-900 text-white">
        <div className="flex items-center gap-2 border-b border-gray-700 px-6 py-4">
          <ShieldAlert className="h-6 w-6 text-blue-400" />
          <span className="text-lg font-bold">Admin Panel</span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          <a href="/admin/gyms" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><ShieldAlert className="h-5 w-5" /> Gym Management</a>
          <a href="/admin/billing" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><DollarSign className="h-5 w-5" /> Billing</a>
          <a href="/admin/supplements" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Building2 className="h-5 w-5" /> Supplements</a>
          <a href="/admin/supplement-companies" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Building2 className="h-5 w-5" /> Supplement Companies</a>
          <a href="/admin/supplement-orders" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Building2 className="h-5 w-5" /> Supplement Orders</a>
          <a href="/admin/trainers" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Dumbbell className="h-5 w-5" /> Trainers</a>
          <a href="/admin/pt-packages" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Package className="h-5 w-5" /> PT Packages</a>
          <a href="/admin/pt-sessions" className="flex items-center gap-3 rounded-lg bg-gray-800 px-3 py-2 text-sm text-white"><Clock className="h-5 w-5" /> PT Sessions</a>
          <a href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><RotateCcw className="h-5 w-5" /> Back to Dashboard</a>
        </nav>
        <div className="border-t border-gray-700 px-4 py-4">
          <div className="mb-2 text-xs text-gray-400">{user.email}</div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50 p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">PT Sessions</h1>
            <Link href="/admin/pt-sessions/new"
              className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              <Clock className="h-4 w-4" /> Schedule Session
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded border px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none">
              <option value="">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="checked_in">Checked In</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          {loading ? (
            <p className="text-gray-500">Loading sessions...</p>
          ) : sessions.length === 0 ? (
            <div className="rounded-lg border bg-white p-8 text-center">
              <p className="text-gray-500">No PT sessions found.</p>
              <Link href="/admin/pt-sessions/new"
                className="mt-2 inline-block text-sm text-blue-600 hover:underline">Schedule your first session</Link>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Client</th>
                    <th className="px-4 py-3 text-left font-medium">Trainer</th>
                    <th className="px-4 py-3 text-left font-medium">Scheduled At</th>
                    <th className="px-4 py-3 text-left font-medium">Package</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link href={`/admin/pt-sessions/${s.id}`} className="font-medium text-blue-600 hover:underline">
                          {s.client.firstName} {s.client.lastName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{s.trainer.user.firstName} {s.trainer.user.lastName}</td>
                      <td className="px-4 py-3 text-gray-600">{new Date(s.scheduledAt).toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-600">{s.package?.name || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[s.status] || 'bg-gray-100 text-gray-700'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/pt-sessions/${s.id}`} className="text-blue-600 hover:underline">View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function PtSessionListPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>}>
      <PtSessionListContent />
    </Suspense>
  );
}
