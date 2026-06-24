'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createPtPackage, getGyms } from '@/lib/api';
import { ShieldAlert, RotateCcw, DollarSign, Building2, Dumbbell, Package } from 'lucide-react';

interface Gym { id: string; name: string; }

function CreatePtPackageContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [gyms, setGyms] = useState<Gym[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [totalSessions, setTotalSessions] = useState('10');
  const [price, setPrice] = useState('');
  const [validityDays, setValidityDays] = useState('30');
  const [gymId, setGymId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !user.roles.includes('super_admin'))) {
      router.push('/');
      return;
    }
    if (user) {
      loadGyms();
    }
  }, [user, authLoading]);

  async function loadGyms() {
    try {
      const data = await getGyms();
      setGyms(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createPtPackage({
        name,
        description: description || undefined,
        totalSessions: parseInt(totalSessions, 10),
        price: parseFloat(price),
        validityDays: parseInt(validityDays, 10),
        gymId: gymId || undefined,
        isActive,
      });
      router.push('/admin/pt-packages');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to create package');
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
          <a href="/admin/supplements" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Building2 className="h-5 w-5" /> Supplements</a>
          <a href="/admin/supplement-companies" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Building2 className="h-5 w-5" /> Supplement Companies</a>
          <a href="/admin/supplement-orders" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Building2 className="h-5 w-5" /> Supplement Orders</a>
          <a href="/admin/trainers" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Dumbbell className="h-5 w-5" /> Trainers</a>
          <a href="/admin/pt-packages" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Package className="h-5 w-5" /> PT Packages</a>
          <a href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><RotateCcw className="h-5 w-5" /> Back to Dashboard</a>
        </nav>
        <div className="border-t border-gray-700 px-4 py-4">
          <div className="mb-2 text-xs text-gray-400">{user?.email}</div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50 p-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <h1 className="text-2xl font-bold">Add PT Package</h1>
          {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700">Package Name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required
                className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
                className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Sessions *</label>
                <input type="number" value={totalSessions} onChange={(e) => setTotalSessions(e.target.value)} required min="1"
                  className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price (₹) *</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" step="0.01"
                  className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Validity (Days) *</label>
                <input type="number" value={validityDays} onChange={(e) => setValidityDays(e.target.value)} required min="1"
                  className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gym (optional)</label>
              <select value={gymId} onChange={(e) => setGymId(e.target.value)}
                className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                <option value="">All Gyms (tenant-wide)</option>
                {gyms.map((g) => (<option key={g.id} value={g.id}>{g.name}</option>))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-gray-300" />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => router.back()}
                className="rounded border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={submitting}
                className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
                {submitting ? 'Creating...' : 'Create Package'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function CreatePtPackagePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>}>
      <CreatePtPackageContent />
    </Suspense>
  );
}
