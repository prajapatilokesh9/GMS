'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getSupplement, updateSupplement, getSupplementCompanies } from '@/lib/api';
import { ShieldAlert, RotateCcw, DollarSign, Pill } from 'lucide-react';

interface Supplement {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  price: string;
  mrp: string;
  unit: string;
  unitValue: string | null;
  stock: number;
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  company: { id: string; name: string };
}

function SupplementDetailContent() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [supplement, setSupplement] = useState<Supplement | null>(null);
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [companyId, setCompanyId] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [unit, setUnit] = useState('unit');
  const [unitValue, setUnitValue] = useState('');
  const [stock, setStock] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !user.roles.includes('super_admin'))) {
      router.push('/');
      return;
    }
    if (user && id) loadSupplement();
  }, [user, authLoading, id]);

  async function loadSupplement() {
    setLoading(true);
    try {
      const [data, comps] = await Promise.all([
        getSupplement(id),
        getSupplementCompanies().catch(() => []),
      ]);
      setSupplement(data);
      setCompanyId(data.company.id);
      setName(data.name);
      setCategory(data.category);
      setDescription(data.description || '');
      setPrice(data.price);
      setMrp(data.mrp);
      setUnit(data.unit);
      setUnitValue(data.unitValue || '');
      setStock(data.stock.toString());
      setIsActive(data.isActive);
      setCompanies(Array.isArray(comps) ? comps.filter((c: any) => c.isActive) : []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  async function handleSave() {
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await updateSupplement(id, {
        companyId,
        name, category,
        description: description || undefined,
        price: Number(price),
        mrp: Number(mrp),
        unit,
        unitValue: unitValue || undefined,
        stock: Number(stock),
        isActive,
      });
      setSuccess('Supplement updated successfully');
      setEditing(false);
      await loadSupplement();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to update supplement');
    } finally { setSubmitting(false); }
  }

  if (authLoading || loading) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>;
  }
  if (!user || !supplement) return null;

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
          <a href="/admin/supplements" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Pill className="h-5 w-5" /> Supplements</a>
          <a href="/admin/supplement-companies" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Pill className="h-5 w-5" /> Companies</a>
          <a href="/admin/supplement-orders" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Pill className="h-5 w-5" /> Orders</a>
          <a href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><RotateCcw className="h-5 w-5" /> Back to Dashboard</a>
        </nav>
        <div className="border-t border-gray-700 px-4 py-4">
          <div className="mb-2 text-xs text-gray-400">{user.email}</div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50 p-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{editing ? 'Edit Supplement' : supplement.name}</h1>
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
                <div><label className="text-xs text-gray-500">Company</label><p className="font-medium">{supplement.company?.name || '-'}</p></div>
                <div><label className="text-xs text-gray-500">Category</label><p className="font-medium">{supplement.category}</p></div>
                <div><label className="text-xs text-gray-500">Price</label><p className="font-medium">₹{Number(supplement.price).toLocaleString()}</p></div>
                <div><label className="text-xs text-gray-500">MRP</label><p className="font-medium">₹{Number(supplement.mrp).toLocaleString()}</p></div>
                <div><label className="text-xs text-gray-500">Unit</label><p className="font-medium">{supplement.unit}{supplement.unitValue ? ` (${supplement.unitValue})` : ''}</p></div>
                <div><label className="text-xs text-gray-500">Stock</label><p className="font-medium">{supplement.stock}</p></div>
                <div><label className="text-xs text-gray-500">Slug</label><p className="font-medium">{supplement.slug}</p></div>
                <div><label className="text-xs text-gray-500">Status</label><p className="font-medium">{supplement.isActive ? 'Active' : 'Inactive'}</p></div>
              </div>
              {supplement.description && <div><label className="text-xs text-gray-500">Description</label><p className="text-sm">{supplement.description}</p></div>}
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-gray-500">Created</label><p className="font-medium">{new Date(supplement.createdAt).toLocaleDateString()}</p></div>
                <div><label className="text-xs text-gray-500">Updated</label><p className="font-medium">{new Date(supplement.updatedAt).toLocaleDateString()}</p></div>
              </div>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
              <div>
                <label className="block text-sm font-medium text-gray-700">Company *</label>
                <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} required
                  className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                  {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required
                  className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category *</label>
                <input value={category} onChange={(e) => setCategory(e.target.value)} required
                  className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                  className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price *</label>
                  <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required
                    className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">MRP *</label>
                  <input type="number" step="0.01" min="0" value={mrp} onChange={(e) => setMrp(e.target.value)} required
                    className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unit</label>
                  <select value={unit} onChange={(e) => setUnit(e.target.value)}
                    className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                    <option value="unit">Unit</option>
                    <option value="kg">Kg</option>
                    <option value="g">Gram</option>
                    <option value="l">Litre</option>
                    <option value="ml">ML</option>
                    <option value="pack">Pack</option>
                    <option value="box">Box</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unit Value</label>
                  <input value={unitValue} onChange={(e) => setUnitValue(e.target.value)}
                    className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock *</label>
                  <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} required
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

export default function SupplementDetailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>}>
      <SupplementDetailContent />
    </Suspense>
  );
}
