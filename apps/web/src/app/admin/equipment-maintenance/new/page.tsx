'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createMaintenanceJob, getEquipmentInventoryItems } from '@/lib/api';
import { ShieldAlert, RotateCcw, DollarSign, Building2, Package, Wrench, Dumbbell } from 'lucide-react';

function CreateMaintenanceContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    inventoryId: '', scheduledDate: new Date().toISOString().split('T')[0],
    type: 'preventive', assignedTechnicianName: '',
    estimatedCost: '', description: '',
  });

  useEffect(() => {
    if (!authLoading && (!user || !user.roles.includes('super_admin'))) {
      router.push('/');
      return;
    }
    if (user) {
      getEquipmentInventoryItems({ status: 'active' }).then(setInventoryItems).catch(() => {});
    }
  }, [user, authLoading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createMaintenanceJob({
        inventoryId: form.inventoryId,
        scheduledDate: form.scheduledDate,
        type: form.type,
        assignedTechnicianName: form.assignedTechnicianName || undefined,
        description: form.description || undefined,
        estimatedCost: form.estimatedCost ? Number(form.estimatedCost) : undefined,
      });
      router.push('/admin/equipment-maintenance');
    } catch (err) {
      console.error('Create failed:', err);
      alert('Failed to schedule maintenance.');
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
          <a href="/admin/equipment-inventory" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Package className="h-5 w-5" /> Inventory</a>
          <a href="/admin/equipment-maintenance" className="flex items-center gap-3 rounded-lg bg-gray-800 px-3 py-2 text-sm text-white"><Wrench className="h-5 w-5" /> Maintenance</a>
          <a href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><RotateCcw className="h-5 w-5" /> Back to Dashboard</a>
        </nav>
        <div className="border-t border-gray-800 px-4 py-4">
          <div className="mb-2 text-xs text-gray-400">{user.email}</div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-white mb-6">Schedule Maintenance</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-1">Equipment *</label>
              <select
                value={form.inventoryId}
                onChange={(e) => setForm({ ...form, inventoryId: e.target.value })}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
                required
              >
                <option value="">Select equipment...</option>
                {inventoryItems.map((item: any) => (
                  <option key={item.id} value={item.id}>
                    {item.catalogueItem.brand} {item.catalogueItem.model} ({item.serialNumber}) — {item.gym.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-1">Scheduled Date *</label>
              <input
                type="date" value={form.scheduledDate}
                onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-1">Maintenance Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
              >
                <option value="preventive">Preventive</option>
                <option value="corrective">Corrective</option>
                <option value="amc">AMC</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-1">Technician Name</label>
              <input
                type="text" value={form.assignedTechnicianName}
                onChange={(e) => setForm({ ...form, assignedTechnicianName: e.target.value })}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-1">Estimated Cost (₹)</label>
              <input
                type="number" step="0.01" min="0" value={form.estimatedCost}
                onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
                rows={3}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded"
            >
              {submitting ? 'Scheduling...' : 'Schedule Maintenance'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function CreateMaintenancePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-900"><p className="text-gray-400">Loading...</p></div>}>
      <CreateMaintenanceContent />
    </Suspense>
  );
}
