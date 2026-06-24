'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getCommissionPayout, approveCommissionPayout, markPaidCommissionPayout } from '@/lib/api';
import { ShieldAlert, RotateCcw, DollarSign, Building2, Dumbbell, Package, Clock, BadgeDollarSign } from 'lucide-react';

interface PayoutData { id: string; grossAmount: number; commissionAmount: number; payoutStatus: string; payoutDate: string | null; paymentReference: string | null; createdAt: string; trainer: { id: string; user: { id: string; firstName: string; lastName: string } }; session: { id: string; scheduledAt: string; status: string }; }

const statusColors: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-blue-100 text-blue-700', paid: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };

function PayoutDetailContent() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [payout, setPayout] = useState<PayoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !user.roles.includes('super_admin'))) { router.push('/'); return; }
    if (user && id) loadPayout();
  }, [user, authLoading, id]);

  async function loadPayout() {
    setLoading(true);
    try { const d = await getCommissionPayout(id); setPayout(d); } catch {} finally { setLoading(false); }
  }

  async function handleApprove() {
    setError(''); setSuccess(''); setActionLoading('approve');
    try { await approveCommissionPayout(id); setSuccess('Payout approved'); await loadPayout(); } catch (err: any) { setError(err.response?.data?.error?.message || 'Failed to approve'); } finally { setActionLoading(''); }
  }

  async function handleMarkPaid() {
    setError(''); setSuccess(''); setActionLoading('paid');
    try {
      const payload: any = {};
      if (paymentRef) payload.paymentReference = paymentRef;
      await markPaidCommissionPayout(id, payload);
      setSuccess('Payout marked as paid'); await loadPayout();
    } catch (err: any) { setError(err.response?.data?.error?.message || 'Failed to mark paid'); } finally { setActionLoading(''); }
  }

  if (authLoading || loading) return <div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>;
  if (!user || !payout) return null;

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col bg-gray-900 text-white">
        <div className="flex items-center gap-2 border-b border-gray-700 px-6 py-4"><ShieldAlert className="h-6 w-6 text-blue-400" /><span className="text-lg font-bold">Admin Panel</span></div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          <a href="/admin/gyms" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><ShieldAlert className="h-5 w-5" /> Gym Management</a>
          <a href="/admin/billing" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><DollarSign className="h-5 w-5" /> Billing</a>
          <a href="/admin/supplements" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Building2 className="h-5 w-5" /> Supplements</a>
          <a href="/admin/supplement-companies" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Building2 className="h-5 w-5" /> Supplement Companies</a>
          <a href="/admin/supplement-orders" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Building2 className="h-5 w-5" /> Supplement Orders</a>
          <a href="/admin/trainers" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Dumbbell className="h-5 w-5" /> Trainers</a>
          <a href="/admin/pt-packages" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Package className="h-5 w-5" /> PT Packages</a>
          <a href="/admin/pt-sessions" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Clock className="h-5 w-5" /> PT Sessions</a>
          <a href="/admin/commissions" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><BadgeDollarSign className="h-5 w-5" /> Commissions</a>
          <a href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><RotateCcw className="h-5 w-5" /> Back to Dashboard</a>
        </nav>
        <div className="border-t border-gray-700 px-4 py-4"><div className="mb-2 text-xs text-gray-400">{user.email}</div></div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50 p-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <h1 className="text-2xl font-bold">Commission Payout Details</h1>
          {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {success && <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div>}
          <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[payout.payoutStatus] || 'bg-gray-100 text-gray-700'}`}>{payout.payoutStatus}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-gray-500">Trainer</label><p className="font-medium">{payout.trainer.user.firstName} {payout.trainer.user.lastName}</p></div>
              <div><label className="text-xs text-gray-500">Session</label><p className="font-medium">{new Date(payout.session.scheduledAt).toLocaleString()}</p></div>
              <div><label className="text-xs text-gray-500">Gross Amount</label><p className="font-medium">₹{Number(payout.grossAmount).toFixed(2)}</p></div>
              <div><label className="text-xs text-gray-500">Commission Amount</label><p className="font-medium">₹{Number(payout.commissionAmount).toFixed(2)}</p></div>
              {payout.payoutDate && <div><label className="text-xs text-gray-500">Payout Date</label><p className="font-medium">{new Date(payout.payoutDate).toLocaleDateString()}</p></div>}
              {payout.paymentReference && <div><label className="text-xs text-gray-500">Payment Reference</label><p className="font-medium">{payout.paymentReference}</p></div>}
            </div>

            {payout.payoutStatus === 'pending' && (
              <div className="flex gap-2 pt-2">
                <button onClick={handleApprove} disabled={actionLoading === 'approve'}
                  className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
                  {actionLoading === 'approve' ? 'Processing...' : 'Approve'}
                </button>
              </div>
            )}
            {payout.payoutStatus === 'approved' && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Reference (optional)</label>
                  <input type="text" value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} placeholder="e.g., TRANS-001"
                    className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                </div>
                <button onClick={handleMarkPaid} disabled={actionLoading === 'paid'}
                  className="rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50">
                  {actionLoading === 'paid' ? 'Processing...' : 'Mark as Paid'}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PayoutDetailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>}>
      <PayoutDetailContent />
    </Suspense>
  );
}
