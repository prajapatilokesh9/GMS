'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getPtPackage, updatePtPackage } from '@/lib/api';
import { ShieldAlert, RotateCcw, DollarSign, Building2, Dumbbell, Package } from 'lucide-react';

interface PtPackageData {
  id: string;
  name: string;
  description: string | null;
  totalSessions: number;
  price: string;
  validityDays: number;
  isActive: boolean;
  createdAt: string;
  gym: { id: string; name: string } | null;
}

function PtPackageDetailContent() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [pkg, setPkg] = useState<PtPackageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [totalSessions, setTotalSessions] = useState('10');
  const [price, setPrice] = useState('');
  const [validityDays, setValidityDays] = useState('30');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !user.roles.includes('super_admin'))) {
      router.push('/');
      return;
    }
    if (user && id) loadPackage();
  }, [user, authLoading, id]);

  async function loadPackage() {
    setLoading(true);
    try {
      const data = await getPtPackage(id);
      setPkg(data);
      setName(data.name);
      setDescription(data.description || '');
      setTotalSessions(String(data.totalSessions));
      setPrice(String(data.price));
      setValidityDays(String(data.validityDays));
      setIsActive(data.isActive);
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  async function handleSave() {
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await updatePtPackage(id, {
        name: name || undefined,
        description: description || undefined,
        totalSessions: parseInt(totalSessions, 10) || undefined,
        price: parseFloat(price) || undefined,
        validityDays: parseInt(validityDays, 10) || undefined,
        isActive,
      });
      setSuccess('Package updated successfully');
      setEditing(false);
      await loadPackage();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to update package');
    } finally { setSubmitting(false); }
  }

  if (authLoading || loading) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>;
  }
  if (!user || !pkg) return null;

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
          <div className="mb-2 text-xs text-gray-400">{user.email}</div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50 p-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{editing ? 'Edit Package' : pkg.name}</h1>
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
                <div><label className="text-xs text-gray-500">Sessions</label><p className="font-medium">{pkg.totalSessions}</p></div>
                <div><label className="text-xs text-gray-500">Price</label><p className="font-medium">₹{Number(pkg.price).toLocaleString()}</p></div>
                <div><label className="text-xs text-gray-500">Validity</label><p className="font-medium">{pkg.validityDays} days</p></div>
                <div><label className="text-xs text-gray-500">Status</label>
                  <p className={`font-medium ${pkg.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {pkg.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div><label className="text-xs text-gray-500">Gym</label><p className="font-medium">{pkg.gym?.name || 'All Gyms'}</p></div>
              </div>
              {pkg.description && (
                <div><label className="text-xs text-gray-500">Description</label><p className="font-medium">{pkg.description}</p></div>
              )}
              <div><label className="text-xs text-gray-500">Created</label><p className="font-medium">{new Date(pkg.createdAt).toLocaleDateString()}</p></div>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
              <div>
                <label className="block text-sm font-medium text-gray-700">Package Name</label>
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
                  <label className="block text-sm font-medium text-gray-700">Sessions</label>
                  <input type="number" value={totalSessions} onChange={(e) => setTotalSessions(e.target.value)} min="1"
                    className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min="0" step="0.01"
                    className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Validity (Days)</label>
                  <input type="number" value={validityDays} onChange={(e) => setValidityDays(e.target.value)} min="1"
                    className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-gray-300" />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
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

export default function PtPackageDetailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>}>
      <PtPackageDetailContent />
    </Suspense>
  );
}
