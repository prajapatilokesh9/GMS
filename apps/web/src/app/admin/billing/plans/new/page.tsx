'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createBillingPlan } from '@/lib/api';
import { ShieldAlert, RotateCcw, DollarSign } from 'lucide-react';

function CreatePlanContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const gymId = searchParams.get('gymId') || '';

  const [name, setName] = useState('');
  const [type, setType] = useState('fixed');
  const [description, setDescription] = useState('');
  const [priceAmount, setPriceAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [durationDays, setDurationDays] = useState('');
  const [sessionsIncluded, setSessionsIncluded] = useState('');
  const [autoRenew, setAutoRenew] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !user.roles.includes('super_admin'))) {
      router.push('/');
    }
  }, [user, authLoading]);

  if (!gymId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">No gym selected. <a href="/admin/billing" className="text-blue-600 hover:underline">Go to Billing Dashboard</a></p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createBillingPlan({
        gymId,
        name,
        type,
        description: description || undefined,
        priceAmount: Number(priceAmount),
        currency,
        durationDays: durationDays ? Number(durationDays) : undefined,
        sessionsIncluded: sessionsIncluded ? Number(sessionsIncluded) : undefined,
        autoRenew,
      });
      router.push(`/admin/billing/plans?gymId=${gymId}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to create plan');
    } finally {
      setSubmitting(false);
    }
  }

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
          <div className="mb-2 text-xs text-gray-400">{user?.email}</div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50 p-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <h1 className="text-2xl font-bold">Create Membership Plan</h1>
          {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type *</label>
                <select value={type} onChange={(e) => setType(e.target.value)}
                  className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                  <option value="fixed">Fixed Duration</option>
                  <option value="payg">Pay As You Go</option>
                  <option value="flex">Flexible</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Currency</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)}
                  className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
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
            <div className="flex items-center gap-2">
              <input type="checkbox" id="autoRenew" checked={autoRenew} onChange={(e) => setAutoRenew(e.target.checked)}
                className="rounded border-gray-300" />
              <label htmlFor="autoRenew" className="text-sm font-medium text-gray-700">Auto-renew by default</label>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => router.back()}
                className="rounded border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={submitting}
                className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
                {submitting ? 'Creating...' : 'Create Plan'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function CreatePlanPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>}>
      <CreatePlanContent />
    </Suspense>
  );
}