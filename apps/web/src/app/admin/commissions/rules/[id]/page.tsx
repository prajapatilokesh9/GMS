'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getCommissionRule, updateCommissionRule, activateCommissionRule, deactivateCommissionRule } from '@/lib/api';
import { ShieldAlert, RotateCcw, DollarSign, Building2, Dumbbell, Package, Clock, BadgeDollarSign } from 'lucide-react';

interface RuleData { id: string; commissionType: string; commissionValue: number; status: string; effectiveFrom: string; effectiveTo: string | null; createdAt: string; gym: { id: string; name: string }; trainer: { id: string; user: { id: string; firstName: string; lastName: string } } | null; }

function RuleDetailContent() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [rule, setRule] = useState<RuleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !user.roles.includes('super_admin'))) { router.push('/'); return; }
    if (user && id) loadRule();
  }, [user, authLoading, id]);

  async function loadRule() {
    setLoading(true);
    try { const d = await getCommissionRule(id); setRule(d); } catch {} finally { setLoading(false); }
  }

  async function handleActivate() {
    setError(''); setSuccess(''); setActionLoading('activate');
    try { await activateCommissionRule(id); setSuccess('Rule activated'); await loadRule(); } catch (err: any) { setError(err.response?.data?.error?.message || 'Failed to activate'); } finally { setActionLoading(''); }
  }

  async function handleDeactivate() {
    setError(''); setSuccess(''); setActionLoading('deactivate');
    try { await deactivateCommissionRule(id); setSuccess('Rule deactivated'); await loadRule(); } catch (err: any) { setError(err.response?.data?.error?.message || 'Failed to deactivate'); } finally { setActionLoading(''); }
  }

  if (authLoading || loading) return <div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>;
  if (!user || !rule) return null;

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
          <h1 className="text-2xl font-bold">Commission Rule Details</h1>
          {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {success && <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div>}
          <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${rule.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{rule.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-gray-500">Gym</label><p className="font-medium">{rule.gym?.name || '-'}</p></div>
              <div><label className="text-xs text-gray-500">Trainer</label><p className="font-medium">{rule.trainer ? `${rule.trainer.user.firstName} ${rule.trainer.user.lastName}` : 'All Trainers'}</p></div>
              <div><label className="text-xs text-gray-500">Commission Type</label><p className="font-medium capitalize">{rule.commissionType}</p></div>
              <div><label className="text-xs text-gray-500">Value</label><p className="font-medium">{rule.commissionType === 'percentage' ? `${rule.commissionValue}%` : `₹${rule.commissionValue}`}</p></div>
              <div><label className="text-xs text-gray-500">Effective From</label><p className="font-medium">{new Date(rule.effectiveFrom).toLocaleDateString()}</p></div>
              <div><label className="text-xs text-gray-500">Effective To</label><p className="font-medium">{rule.effectiveTo ? new Date(rule.effectiveTo).toLocaleDateString() : 'Ongoing'}</p></div>
            </div>
            <div className="flex gap-2 pt-2">
              {rule.status === 'active' ? (
                <button onClick={handleDeactivate} disabled={actionLoading === 'deactivate'}
                  className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50">
                  {actionLoading === 'deactivate' ? 'Processing...' : 'Deactivate'}
                </button>
              ) : (
                <button onClick={handleActivate} disabled={actionLoading === 'activate'}
                  className="rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50">
                  {actionLoading === 'activate' ? 'Processing...' : 'Activate'}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function RuleDetailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>}>
      <RuleDetailContent />
    </Suspense>
  );
}
