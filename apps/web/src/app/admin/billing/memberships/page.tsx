'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getBillingMemberships } from '@/lib/api';
import { ShieldAlert, RotateCcw, DollarSign } from 'lucide-react';

interface Membership {
  id: string;
  customerId: string;
  planId: string | null;
  startDate: string;
  endDate: string | null;
  status: string;
  pricePaid: string;
  paymentMethod: string | null;
  autoRenew: boolean;
  renewalDate: string | null;
  walletBalance: string;
  cancelledAt: string | null;
  plan?: { name: string };
  customer?: { email: string; firstName: string; lastName: string };
}

const STATUS_BADGES: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  expired: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
};

function MembershipListContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const gymId = searchParams.get('gymId') || '';
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && (!user || !user.roles.includes('super_admin'))) {
      router.push('/');
      return;
    }
    if (user && gymId) loadMemberships();
  }, [user, authLoading, gymId]);

  async function loadMemberships() {
    setLoading(true);
    try {
      const data = await getBillingMemberships(gymId);
      setMemberships(Array.isArray(data) ? data : []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>;
  }
  if (!user) return null;

  const filtered = statusFilter === 'all' ? memberships : memberships.filter((m) => m.status === statusFilter);

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
          <a href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><RotateCcw className="h-5 w-5" /> Back to Dashboard</a>
        </nav>
        <div className="border-t border-gray-700 px-4 py-4">
          <div className="mb-2 text-xs text-gray-400">{user.email}</div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50 p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Memberships</h1>
            <div className="flex gap-2">
              {['all', 'active', 'paused', 'expired', 'cancelled'].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`rounded px-3 py-1.5 text-xs font-medium ${
                    statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'
                  }`}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
              ))}
            </div>
          </div>
          {loading ? (
            <p className="text-gray-500">Loading memberships...</p>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border bg-white p-8 text-center"><p className="text-gray-500">No memberships found.</p></div>
          ) : (
            <div className="overflow-x-auto rounded-lg border bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Customer</th>
                    <th className="px-4 py-3 text-left font-medium">Plan</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Start Date</th>
                    <th className="px-4 py-3 text-left font-medium">End Date</th>
                    <th className="px-4 py-3 text-left font-medium">Price Paid</th>
                    <th className="px-4 py-3 text-left font-medium">Wallet</th>
                    <th className="px-4 py-3 text-left font-medium">Auto-Renew</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link href={`/admin/billing/memberships/${m.id}?gymId=${gymId}`}
                          className="font-medium text-blue-600 hover:underline">
                          {m.customer ? `${m.customer.firstName} ${m.customer.lastName}` : m.customerId.slice(0, 8)}
                        </Link>
                        {m.customer && <p className="text-xs text-gray-500">{m.customer.email}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{m.plan?.name || m.planId?.slice(0, 8) || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGES[m.status] || 'bg-gray-100 text-gray-600'}`}>{m.status}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{new Date(m.startDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-gray-600">{m.endDate ? new Date(m.endDate).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-3 font-medium">₹{Number(m.pricePaid).toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-600">₹{Number(m.walletBalance).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${m.autoRenew ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {m.autoRenew ? 'Yes' : 'No'}
                        </span>
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

export default function MembershipListPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>}>
      <MembershipListContent />
    </Suspense>
  );
}