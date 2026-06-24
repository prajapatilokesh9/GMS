'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getBillingPayments } from '@/lib/api';
import { ShieldAlert, RotateCcw, DollarSign } from 'lucide-react';

interface Payment {
  id: string;
  entityType: string;
  entityId: string;
  amount: string;
  currency: string;
  gateway: string | null;
  gatewayTxnId: string | null;
  status: string;
  refundAmount: string;
  createdAt: string;
}

const STATUS_BADGES: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-purple-100 text-purple-700',
  partial_refunded: 'bg-blue-100 text-blue-700',
};

export default function PaymentListPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && (!user || !user.roles.includes('super_admin'))) {
      router.push('/');
      return;
    }
    if (user) loadPayments();
  }, [user, authLoading]);

  async function loadPayments() {
    setLoading(true);
    try {
      const data = await getBillingPayments();
      setPayments(Array.isArray(data) ? data : []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>;
  }
  if (!user) return null;

  const filtered = statusFilter === 'all' ? payments : payments.filter((p) => p.status === statusFilter);

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
            <h1 className="text-2xl font-bold">Payments</h1>
            <div className="flex gap-2">
              {['all', 'completed', 'pending', 'failed', 'refunded', 'partial_refunded'].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`rounded px-3 py-1.5 text-xs font-medium ${
                    statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'
                  }`}>
                  {s === 'partial_refunded' ? 'Partial Refund' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <p className="text-gray-500">Loading payments...</p>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border bg-white p-8 text-center"><p className="text-gray-500">No payments found.</p></div>
          ) : (
            <div className="overflow-x-auto rounded-lg border bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">ID</th>
                    <th className="px-4 py-3 text-left font-medium">Entity</th>
                    <th className="px-4 py-3 text-left font-medium">Amount</th>
                    <th className="px-4 py-3 text-left font-medium">Gateway</th>
                    <th className="px-4 py-3 text-left font-medium">Transaction ID</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Refund</th>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link href={`/admin/billing/payments/${p.id}`}
                          className="font-mono text-xs text-blue-600 hover:underline">{p.id.slice(0, 8)}...</Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600 capitalize">{p.entityType}</td>
                      <td className="px-4 py-3 font-medium">{p.currency} {Number(p.amount).toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-600">{p.gateway || '-'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{p.gatewayTxnId?.slice(0, 12) || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGES[p.status] || 'bg-gray-100 text-gray-600'}`}>{p.status}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{Number(p.refundAmount) > 0 ? `${p.currency} ${Number(p.refundAmount).toLocaleString()}` : '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{new Date(p.createdAt).toLocaleDateString()}</td>
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