'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getBillingMembership, renewBillingMembership, updateBillingMembership, topUpWallet } from '@/lib/api';
import { ShieldAlert, RotateCcw, DollarSign, Play, Pause, XCircle, Wallet } from 'lucide-react';

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
  lastRenewedAt: string | null;
  pausedAt: string | null;
  pausedUntil: string | null;
  walletBalance: string;
  cancelledAt: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  plan?: { id: string; name: string; type: string; priceAmount: string; currency: string };
  customer?: { id: string; email: string; firstName: string; lastName: string; phone: string | null };
}

const STATUS_BADGES: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  expired: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
};

function MembershipDetailContent() {
  const { membershipId } = useParams<{ membershipId: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const gymId = searchParams.get('gymId') || '';

  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [topupAmount, setTopupAmount] = useState('');
  const [showTopup, setShowTopup] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !user.roles.includes('super_admin'))) {
      router.push('/');
      return;
    }
    if (user && membershipId) loadMembership();
  }, [user, authLoading, membershipId]);

  async function loadMembership() {
    setLoading(true);
    try {
      const data = await getBillingMembership(membershipId);
      setMembership(data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  async function handleAction(action: string) {
    setError('');
    setSuccess('');
    setActionLoading(action);
    try {
      switch (action) {
        case 'renew': await renewBillingMembership(membershipId); break;
        case 'pause': await updateBillingMembership(membershipId, { status: 'paused' }); break;
        case 'cancel': await updateBillingMembership(membershipId, { status: 'cancelled' }); break;
      }
      setSuccess(`${action.charAt(0).toUpperCase() + action.slice(1)} successful`);
      await loadMembership();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || `Failed to ${action}`);
    } finally { setActionLoading(null); }
  }

  async function handleTopup() {
    if (!topupAmount || Number(topupAmount) <= 0) return;
    setError('');
    setSuccess('');
    setActionLoading('topup');
    try {
      await topUpWallet(membershipId, Number(topupAmount));
      setSuccess(`Wallet topped up by ₹${Number(topupAmount).toLocaleString()}`);
      setShowTopup(false);
      setTopupAmount('');
      await loadMembership();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to top up wallet');
    } finally { setActionLoading(null); }
  }

  if (authLoading || loading) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>;
  }
  if (!user || !membership) return null;

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
          <a href={`/admin/billing/memberships?gymId=${gymId}`} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><RotateCcw className="h-5 w-5" /> Back to Memberships</a>
          <a href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><RotateCcw className="h-5 w-5" /> Back to Dashboard</a>
        </nav>
        <div className="border-t border-gray-700 px-4 py-4">
          <div className="mb-2 text-xs text-gray-400">{user.email}</div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50 p-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {success && <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div>}

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  {membership.customer ? `${membership.customer.firstName} ${membership.customer.lastName}` : 'Member'}
                </h1>
                <p className="text-sm text-gray-500">{membership.customer?.email || membership.customerId}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_BADGES[membership.status] || 'bg-gray-100 text-gray-600'}`}>
                {membership.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Plan Details</h2>
              <div className="space-y-3">
                <div><label className="text-xs text-gray-500">Plan</label><p className="font-medium">{membership.plan?.name || 'N/A'}</p></div>
                <div><label className="text-xs text-gray-500">Price Paid</label><p className="font-medium">₹{Number(membership.pricePaid).toLocaleString()}</p></div>
                <div><label className="text-xs text-gray-500">Payment Method</label><p className="font-medium">{membership.paymentMethod || 'N/A'}</p></div>
                <div><label className="text-xs text-gray-500">Auto-Renew</label><p className="font-medium">{membership.autoRenew ? 'Yes' : 'No'}</p></div>
                {membership.renewalDate && <div><label className="text-xs text-gray-500">Next Renewal</label><p className="font-medium">{new Date(membership.renewalDate).toLocaleDateString()}</p></div>}
              </div>
            </div>
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Wallet</h2>
              <div className="text-3xl font-bold text-blue-600">₹{Number(membership.walletBalance).toLocaleString()}</div>
              <button onClick={() => setShowTopup(true)}
                className="mt-3 flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
                <Wallet className="h-4 w-4" /> Top Up Wallet
              </button>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Timeline</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div><label className="text-xs text-gray-500">Start Date</label><p className="font-medium">{new Date(membership.startDate).toLocaleDateString()}</p></div>
              <div><label className="text-xs text-gray-500">End Date</label><p className="font-medium">{membership.endDate ? new Date(membership.endDate).toLocaleDateString() : '-'}</p></div>
              <div><label className="text-xs text-gray-500">Last Renewed</label><p className="font-medium">{membership.lastRenewedAt ? new Date(membership.lastRenewedAt).toLocaleDateString() : '-'}</p></div>
              <div><label className="text-xs text-gray-500">Created</label><p className="font-medium">{new Date(membership.createdAt).toLocaleDateString()}</p></div>
            </div>
            {membership.cancelledAt && <div className="mt-2"><label className="text-xs text-gray-500">Cancelled At</label><p className="font-medium">{new Date(membership.cancelledAt).toLocaleDateString()}</p></div>}
          </div>

          {membership.status === 'active' && (
            <div className="flex gap-3">
              <button onClick={() => handleAction('renew')} disabled={actionLoading === 'renew'}
                className="flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50">
                <Play className="h-4 w-4" /> Renew
              </button>
              <button onClick={() => handleAction('pause')} disabled={actionLoading === 'pause'}
                className="flex items-center gap-2 rounded bg-yellow-600 px-4 py-2 text-sm text-white hover:bg-yellow-700 disabled:opacity-50">
                <Pause className="h-4 w-4" /> Pause
              </button>
              <button onClick={() => handleAction('cancel')} disabled={actionLoading === 'cancel'}
                className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50">
                <XCircle className="h-4 w-4" /> Cancel
              </button>
            </div>
          )}
          {membership.status === 'paused' && (
            <button onClick={() => handleAction('renew')} disabled={actionLoading === 'renew'}
              className="flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50">
              <Play className="h-4 w-4" /> Resume
            </button>
          )}
        </div>
      </main>
      {showTopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Top Up Wallet</h2>
            <p className="mt-1 text-sm text-gray-500">Enter amount to add to wallet:</p>
            <input type="number" min="1" step="1" value={topupAmount} onChange={(e) => setTopupAmount(e.target.value)}
              className="mt-3 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Enter amount..." />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => { setShowTopup(false); setTopupAmount(''); }}
                className="rounded border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleTopup} disabled={!topupAmount || Number(topupAmount) <= 0 || actionLoading === 'topup'}
                className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
                {actionLoading === 'topup' ? 'Adding...' : 'Add Funds'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MembershipDetailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>}>
      <MembershipDetailContent />
    </Suspense>
  );
}
