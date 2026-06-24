'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getEquipmentCatalogue, updateEquipmentCatalogue, deleteEquipmentCatalogue, restoreEquipmentCatalogue } from '@/lib/api';
import { ShieldAlert, RotateCcw, DollarSign, Building2, Dumbbell, Package, Wrench } from 'lucide-react';

interface EquipmentCatalogueData {
  id: string;
  name: string;
  sku: string;
  brand: string;
  model: string;
  category: string;
  subcategory: string | null;
  specs: Record<string, unknown> | null;
  unitCost: string;
  warrantyMonths: number | null;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
}

function EquipmentCatalogueDetailContent() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [item, setItem] = useState<EquipmentCatalogueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [warrantyMonths, setWarrantyMonths] = useState('12');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !user.roles.includes('super_admin'))) {
      router.push('/');
      return;
    }
    if (user && id) loadItem();
  }, [user, authLoading, id]);

  async function loadItem() {
    setLoading(true);
    try {
      const data = await getEquipmentCatalogue(id);
      setItem(data);
      setName(data.name);
      setSku(data.sku);
      setBrand(data.brand);
      setModel(data.model);
      setCategory(data.category);
      setSubcategory(data.subcategory || '');
      setUnitCost(String(data.unitCost));
      setWarrantyMonths(String(data.warrantyMonths ?? ''));
      setIsActive(data.isActive);
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  async function handleSave() {
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await updateEquipmentCatalogue(id, {
        name: name || undefined,
        sku: sku || undefined,
        brand: brand || undefined,
        model: model || undefined,
        category: category || undefined,
        subcategory: subcategory || undefined,
        unitCost: parseFloat(unitCost) || undefined,
        warrantyMonths: parseInt(warrantyMonths, 10) || undefined,
        isActive,
      });
      setSuccess('Equipment updated successfully');
      setEditing(false);
      await loadItem();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to update equipment');
    } finally { setSubmitting(false); }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this item?')) return;
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await deleteEquipmentCatalogue(id);
      setSuccess('Item deleted');
      await loadItem();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to delete');
    } finally { setSubmitting(false); }
  }

  async function handleRestore() {
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await restoreEquipmentCatalogue(id);
      setSuccess('Item restored');
      await loadItem();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to restore');
    } finally { setSubmitting(false); }
  }

  if (authLoading || loading) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>;
  }
  if (!user || !item) return null;

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col bg-gray-900 text-white">
        <div className="flex items-center gap-2 border-b border-gray-700 px-6 py-4">
          <ShieldAlert className="h-6 w-6 text-blue-400" />
          <span className="text-lg font-bold">Admin Panel</span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          <a href="/admin/gyms" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Building2 className="h-5 w-5" /> Gym Management</a>
          <a href="/admin/billing" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><DollarSign className="h-5 w-5" /> Billing</a>
          <a href="/admin/supplements" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Building2 className="h-5 w-5" /> Supplements</a>
          <a href="/admin/supplement-companies" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Building2 className="h-5 w-5" /> Supplement Companies</a>
          <a href="/admin/supplement-orders" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Building2 className="h-5 w-5" /> Supplement Orders</a>
          <a href="/admin/trainers" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Dumbbell className="h-5 w-5" /> Trainers</a>
          <a href="/admin/pt-packages" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Package className="h-5 w-5" /> PT Packages</a>
          <a href="/admin/pt-sessions" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Dumbbell className="h-5 w-5" /> PT Sessions</a>
          <a href="/admin/equipment-catalogue" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Wrench className="h-5 w-5" /> Equipment</a>
          <a href="/admin/equipment-inventory" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Package className="h-5 w-5" /> Equipment Inventory</a>
          <a href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><RotateCcw className="h-5 w-5" /> Back to Dashboard</a>
        </nav>
        <div className="border-t border-gray-700 px-4 py-4">
          <div className="mb-2 text-xs text-gray-400">{user.email}</div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50 p-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{editing ? 'Edit Equipment' : item.name}</h1>
            <div className="flex items-center gap-2">
              {item.deletedAt ? (
                <button onClick={handleRestore} disabled={submitting}
                  className="rounded border bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50">
                  Restore
                </button>
              ) : (
                <>
                  <button onClick={() => { setEditing(!editing); setError(''); setSuccess(''); }}
                    className="rounded border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                    {editing ? 'Cancel' : 'Edit'}
                  </button>
                  <button onClick={handleDelete} disabled={submitting}
                    className="rounded border bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50">
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
          {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {success && <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div>}

          {!editing ? (
            <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-gray-500">Brand</label><p className="font-medium">{item.brand}</p></div>
                <div><label className="text-xs text-gray-500">Model</label><p className="font-medium">{item.model}</p></div>
                <div><label className="text-xs text-gray-500">SKU</label><p className="font-medium">{item.sku}</p></div>
                <div><label className="text-xs text-gray-500">Category</label><p className="font-medium">{item.category}{item.subcategory ? ` / ${item.subcategory}` : ''}</p></div>
                <div><label className="text-xs text-gray-500">Unit Cost</label><p className="font-medium">₹{Number(item.unitCost).toLocaleString()}</p></div>
                <div><label className="text-xs text-gray-500">Warranty</label><p className="font-medium">{item.warrantyMonths ? `${item.warrantyMonths} months` : 'None'}</p></div>
                <div><label className="text-xs text-gray-500">Status</label>
                  <p className={`font-medium ${item.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
              <div><label className="text-xs text-gray-500">Created</label><p className="font-medium">{new Date(item.createdAt).toLocaleDateString()}</p></div>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} required
                    className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">SKU</label>
                  <input value={sku} onChange={(e) => setSku(e.target.value)} required
                    className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Brand</label>
                  <input value={brand} onChange={(e) => setBrand(e.target.value)} required
                    className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Model</label>
                  <input value={model} onChange={(e) => setModel(e.target.value)} required
                    className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <input value={category} onChange={(e) => setCategory(e.target.value)} required
                    className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subcategory</label>
                  <input value={subcategory} onChange={(e) => setSubcategory(e.target.value)}
                    className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unit Cost (₹)</label>
                  <input type="number" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} min="0" step="0.01"
                    className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Warranty (months)</label>
                  <input type="number" value={warrantyMonths} onChange={(e) => setWarrantyMonths(e.target.value)} min="1"
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

export default function EquipmentCatalogueDetailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>}>
      <EquipmentCatalogueDetailContent />
    </Suspense>
  );
}
