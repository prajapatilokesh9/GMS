'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getBillingPlan, updateBillingPlan } from '@/lib/api';
import { ShieldAlert, RotateCcw, DollarSign } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  type: string;
  description: string | null;
  priceAmount: string;
  currency: string;
  durationDays: number | null;
  sessionsIncluded: number | null;
  features: Record<string, unknown> | null;
  autoRenew: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const PLAN_TYPE_LABELS: Record<string, string> = {
  fixed: 'Fixed Duration', payg: 'Pay As You Go', flex: 'Flexible',
};

function PlanDetailContent() {
  const { planId } = useParams<{ planId: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const gymId = searchParams.get('gymId') || '';

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priceAmount, setPriceAmount] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [sessionsIncluded, setSessionsIncluded] = useState('');
  const [autoRenew, setAutoRenew] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !user.roles.includes('super_admin'))) {
      router.push('/');
      return;
    }
    if (user && planId) loadPlan();
  }, [user, authLoading, planId]);

  async function loadPlan() {
    setLoading(true);
    try {
      const data = await getBillingPlan(planId);
      setPlan(data);
      setName(data.name);
      setDescription(data.description || '');
      setPriceAmount(data.priceAmount);
      setDurationDays(data.durationDays?.toString() || '');
      setSessionsIncluded(data.sessionsIncluded?.toString() || '');
      setAutoRenew(data.autoRenew);
      setIsActive(data.isActive);
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  async function handleSave() {
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await updateBillingPlan(planId, {
        name, description: description || undefined,
        priceAmount: Number(priceAmount),
        durationDays: durationDays ? Number(durationDays) : null,
        sessionsIncluded: sessionsIncluded ? Number(sessionsIncluded) : null,
        autoRenew, isActive,
      });
      setSuccess('Plan updated successfully');
      setEditing(false);
      await loadPlan();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to update plan');
    } finally { setSubmitting(false); }
  }

  if (authLoading || loading) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>;
  }
  if (!user || !plan) return null;

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
          <a href={`/admin/billing/plans?gymId=${gymId}`} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><RotateCcw className="h-5 w-5" /> Back to Plans</a>
          <a href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><RotateCcw className="h-5 w-5" /> Back to Dashboard</a>
        </nav>
        <div className="border-t border-gray-700 px-4 py-4">
          <div className="mb-2 text-xs text-gray-400">{user.email}</div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50 p-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{editing ? 'Edit Plan' : plan.name}</h1>
            <button onClick={() => { setEditing(!editing); setError(''); setSuccess(''); }}
              className="rounded border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>
          {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {success && <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div>}

          {!editing ? (
            <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-gray-500">Type</label><p className="font-medium">{PLAN_TYPE_LABELS[plan.type] || plan.type}</p></div>
                <div><label className="text-xs text-gray-500">Price</label><p className="font-medium">{plan.currency} {Number(plan.priceAmount).toLocaleString()}</p></div>
                <div><label className="text-xs text-gray-500">Duration</label><p className="font-medium">{plan.durationDays ? `${plan.durationDays} days` : plan.sessionsIncluded ? `${plan.sessionsIncluded} sessions` : 'N/A'}</p></div>
                <div><label className="text-xs text-gray-500">Auto-Renew</label><p className="font-medium">{plan.autoRenew ? 'Yes' : 'No'}</p></div>
                <div><label className="text-xs text-gray-500">Status</label><p className="font-medium">{plan.isActive ? 'Active' : 'Inactive'}</p></div>
                <div><label className="text-xs text-gray-500">Created</label><p className="font-medium">{new Date(plan.createdAt).toLocaleDateString()}</p></div>
              </div>
              {plan.description && <div><label className="text-xs text-gray-500">Description</label><p className="text-sm">{plan.description}</p></div>}
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
              <div>
                <label className="block text-sm font-medium text-gray-700">Plan Name *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required
                  className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                  className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price Amount *</label>
                <input type="number" step="0.01" min="0" value={priceAmount} onChange={(e) => setPriceAmount(e.target.value)} required
                  className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration (days)</label>
                  <input type="number" min="1" value={durationDays} onChange={(e) => setDurationDays(e.target.value)}
                    className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sessions Included</label>
                  <input type="number" min="1" value={sessionsIncluded} onChange={(e) => setSessionsIncluded(e.target.value)}
                    className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                </div>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={autoRenew} onChange={(e) => setAutoRenew(e.target.checked)}
                    className="rounded border-gray-300" />
                  <span className="text-sm font-medium text-gray-700">Auto-renew</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-gray-300" />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={submitting}
                  className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default function PlanDetailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>}>
      <PlanDetailContent />
    </Suspense>
  );
}