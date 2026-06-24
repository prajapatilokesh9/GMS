'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createEquipmentInventoryItem, getEquipmentCatalogues, getGyms } from '@/lib/api';
import { ShieldAlert, RotateCcw, DollarSign, Building2, Package, Wrench, Dumbbell } from 'lucide-react';

function CreateInventoryContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [catalogues, setCatalogues] = useState<any[]>([]);
  const [gyms, setGyms] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    catalogueItemId: '', serialNumber: '', gymId: '', location: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseCost: '', supplier: '', status: 'ordered',
    warrantyStartDate: '', warrantyEndDate: '',
    maintenanceIntervalMonths: '6', notes: '',
  });

  useEffect(() => {
    if (!authLoading && (!user || !user.roles.includes('super_admin'))) {
      router.push('/');
      return;
    }
    if (user) {
      getEquipmentCatalogues({ includeInactive: 'true' }).then(setCatalogues).catch(() => {});
      getGyms().then(setGyms).catch(() => {});
    }
  }, [user, authLoading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createEquipmentInventoryItem({
        catalogueItemId: form.catalogueItemId,
        serialNumber: form.serialNumber,
        gymId: form.gymId,
        location: form.location || undefined,
        purchaseDate: form.purchaseDate,
        purchaseCost: form.purchaseCost ? Number(form.purchaseCost) : undefined,
        supplier: form.supplier || undefined,
        status: form.status,
        warrantyStartDate: form.warrantyStartDate || undefined,
        warrantyEndDate: form.warrantyEndDate || undefined,
        maintenanceIntervalMonths: Number(form.maintenanceIntervalMonths),
        notes: form.notes || undefined,
      });
      router.push('/admin/equipment-inventory');
    } catch (err) {
      console.error('Create failed:', err);
      alert('Failed to create inventory item.');
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-900"><p className="text-gray-400">Loading...</p></div>;
  }
  if (!user || !user.roles.includes('super_admin')) return null;

  return (
    <div className="flex min-h-screen bg-gray-900">
      <aside className="flex w-64 flex-col bg-gray-950 text-white">
        <div className="flex items-center gap-2 border-b border-gray-800 px-6 py-4">
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
        <div className="border-t border-gray-800 px-4 py-4">
          <div className="mb-2 text-xs text-gray-400">{user.email}</div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-white mb-6">Add Equipment Inventory Item</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-1">Catalogue Item *</label>
              <select
                value={form.catalogueItemId}
                onChange={(e) => setForm({ ...form, catalogueItemId: e.target.value })}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
                required
              >
                <option value="">Select equipment type...</option>
                {catalogues.map((c) => (
                  <option key={c.id} value={c.id}>{c.brand} {c.model} — {c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-1">Serial Number *</label>
              <input
                type="text" value={form.serialNumber}
                onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-1">Gym *</label>
              <select
                value={form.gymId}
                onChange={(e) => setForm({ ...form, gymId: e.target.value })}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
                required
              >
                <option value="">Select gym...</option>
                {gyms.map((g: any) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-1">Location (within gym)</label>
              <input
                type="text" value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-1">Purchase Date *</label>
              <input
                type="date" value={form.purchaseDate}
                onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-1">Purchase Cost</label>
              <input
                type="number" step="0.01" min="0" value={form.purchaseCost}
                onChange={(e) => setForm({ ...form, purchaseCost: e.target.value })}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-1">Supplier</label>
              <input
                type="text" value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
              >
                <option value="ordered">Ordered</option>
                <option value="delivered">Delivered</option>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-1">Warranty Start</label>
                <input
                  type="date" value={form.warrantyStartDate}
                  onChange={(e) => setForm({ ...form, warrantyStartDate: e.target.value })}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Warranty End</label>
                <input
                  type="date" value={form.warrantyEndDate}
                  onChange={(e) => setForm({ ...form, warrantyEndDate: e.target.value })}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-1">Maintenance Interval (months)</label>
              <input
                type="number" min="1" max="120" value={form.maintenanceIntervalMonths}
                onChange={(e) => setForm({ ...form, maintenanceIntervalMonths: e.target.value })}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-1">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
                rows={3}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded"
            >
              {submitting ? 'Creating...' : 'Create Inventory Item'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function CreateInventoryPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-900"><p className="text-gray-400">Loading...</p></div>}>
      <CreateInventoryContent />
    </Suspense>
  );
}
