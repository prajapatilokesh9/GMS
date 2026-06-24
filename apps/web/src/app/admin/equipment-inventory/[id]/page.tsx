'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import {
  getEquipmentInventoryItem,
  getGyms,
  updateEquipmentInventoryItem,
  deleteEquipmentInventoryItem,
  restoreEquipmentInventoryItem,
} from '@/lib/api';
import { ShieldAlert, RotateCcw, ArrowLeft, DollarSign, Building2, Package, Wrench, Dumbbell } from 'lucide-react';

const STATUS_OPTIONS = [
  'ordered', 'delivered', 'active', 'maintenance',
  'under_repair', 'damaged', 'lost_stolen', 'decommissioned',
];

const STATUS_LABELS: Record<string, string> = {
  ordered: 'Ordered', delivered: 'Delivered', active: 'Active',
  maintenance: 'Maintenance', under_repair: 'Under Repair', damaged: 'Damaged',
  lost_stolen: 'Lost/Stolen', decommissioned: 'Decommissioned',
};

function InventoryDetailContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [item, setItem] = useState<any>(null);
  const [gyms, setGyms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [reason, setReason] = useState('');
  const [form, setForm] = useState<any>({});

  const id = params.id as string;

  useEffect(() => {
    if (!authLoading && (!user || !user.roles.includes('super_admin'))) {
      router.push('/');
      return;
    }
    if (user) loadData();
  }, [user, authLoading, id]);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getEquipmentInventoryItem(id);
      setItem(data);
      setForm({
        serialNumber: data.serialNumber,
        gymId: data.gymId,
        location: data.location || '',
        purchaseDate: data.purchaseDate?.split('T')[0] || '',
        purchaseCost: data.purchaseCost || '',
        supplier: data.supplier || '',
        status: data.status,
        warrantyStartDate: data.warrantyStartDate?.split('T')[0] || '',
        warrantyEndDate: data.warrantyEndDate?.split('T')[0] || '',
        maintenanceIntervalMonths: data.maintenanceIntervalMonths || '6',
        notes: data.notes || '',
      });
      const gymList = await getGyms();
      setGyms(gymList ?? []);
    } catch (err) {
      console.error('Failed to load:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload: Record<string, any> = {
        serialNumber: form.serialNumber,
        gymId: form.gymId,
        location: form.location || null,
        purchaseDate: form.purchaseDate,
        purchaseCost: form.purchaseCost ? Number(form.purchaseCost) : null,
        supplier: form.supplier || null,
        status: form.status,
        warrantyStartDate: form.warrantyStartDate || null,
        warrantyEndDate: form.warrantyEndDate || null,
        maintenanceIntervalMonths: Number(form.maintenanceIntervalMonths),
        notes: form.notes || null,
      };
      if (form.gymId !== item.gymId || form.status !== item.status) {
        payload.reason = reason;
      }
      const updated = await updateEquipmentInventoryItem(id, payload);
      setItem(updated);
      setEditing(false);
      setReason('');
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to update.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Soft-delete this inventory item?')) return;
    try {
      await deleteEquipmentInventoryItem(id);
      router.push('/admin/equipment-inventory');
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }

  async function handleRestore() {
    try {
      const restored = await restoreEquipmentInventoryItem(id);
      setItem(restored);
    } catch (err) {
      console.error('Restore failed:', err);
    }
  }

  if (authLoading || loading) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-900"><p className="text-gray-400">Loading...</p></div>;
  }
  if (!user || !user.roles.includes('super_admin')) return null;
  if (!item) return <div className="flex min-h-screen items-center justify-center bg-gray-900"><p className="text-gray-400">Item not found.</p></div>;

  const isDeleted = !!item.deletedAt;

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
        <Link href="/admin/equipment-inventory" className="text-blue-400 hover:underline flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Inventory
        </Link>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">
            {item.catalogueItem.brand} {item.catalogueItem.model}
            <span className="text-gray-400 text-lg ml-2 font-mono">({item.serialNumber})</span>
          </h1>
          <div className="flex gap-2">
            {isDeleted ? (
              <button onClick={handleRestore} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded flex items-center gap-1">
                <RotateCcw className="w-4 h-4" /> Restore
              </button>
            ) : (
              <>
                <button onClick={() => setEditing(!editing)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">
                  {editing ? 'Cancel' : 'Edit'}
                </button>
                <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4" /> Delete
                </button>
              </>
            )}
          </div>
        </div>

        {editing ? (
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-gray-300 mb-1">Serial Number</label>
              <input type="text" value={form.serialNumber}
                onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Gym</label>
              <select value={form.gymId}
                onChange={(e) => setForm({ ...form, gymId: e.target.value })}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2">
                {gyms.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Location</label>
              <input type="text" value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Status</label>
              <select value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2">
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Purchase Date</label>
              <input type="date" value={form.purchaseDate}
                onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Purchase Cost</label>
              <input type="number" step="0.01" value={form.purchaseCost}
                onChange={(e) => setForm({ ...form, purchaseCost: e.target.value })}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Supplier</label>
              <input type="text" value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-1">Warranty Start</label>
                <input type="date" value={form.warrantyStartDate}
                  onChange={(e) => setForm({ ...form, warrantyStartDate: e.target.value })}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Warranty End</label>
                <input type="date" value={form.warrantyEndDate}
                  onChange={(e) => setForm({ ...form, warrantyEndDate: e.target.value })}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2" />
              </div>
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Maint. Interval (months)</label>
              <input type="number" min="1" max="120" value={form.maintenanceIntervalMonths}
                onChange={(e) => setForm({ ...form, maintenanceIntervalMonths: e.target.value })}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Notes</label>
              <textarea rows={3} value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2" />
            </div>
            {(form.gymId !== item.gymId || form.status !== item.status) && (
              <div>
                <label className="block text-gray-300 mb-1">
                  Reason {form.gymId !== item.gymId ? '(required for transfer)' : '(required for status change)'}
                </label>
                <textarea rows={2} value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2" />
              </div>
            )}
            <button onClick={handleSave} disabled={saving}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-2 rounded">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        ) : (
          <div className="space-y-3 text-white max-w-2xl">
            <DetailRow label="Status" value={
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {STATUS_LABELS[item.status] || item.status}
              </span>
            } />
            <DetailRow label="Catalogue Item" value={`${item.catalogueItem.brand} ${item.catalogueItem.model} (${item.catalogueItem.name})`} />
            <DetailRow label="Gym" value={item.gym.name} />
            <DetailRow label="Location" value={item.location || '\u2014'} />
            <DetailRow label="Purchase Date" value={new Date(item.purchaseDate).toLocaleDateString()} />
            <DetailRow label="Purchase Cost" value={item.purchaseCost ? `\u20B9${Number(item.purchaseCost).toLocaleString()}` : '\u2014'} />
            <DetailRow label="Supplier" value={item.supplier || '\u2014'} />
            <DetailRow label="Warranty Period" value={item.warrantyStartDate && item.warrantyEndDate ? `${new Date(item.warrantyStartDate).toLocaleDateString()} \u2014 ${new Date(item.warrantyEndDate).toLocaleDateString()}` : '\u2014'} />
            <DetailRow label="Next Maintenance" value={item.nextMaintenanceAt ? new Date(item.nextMaintenanceAt).toLocaleDateString() : '\u2014'} />
            <DetailRow label="Maint. Interval" value={`${item.maintenanceIntervalMonths ?? 6} months`} />
            <DetailRow label="Notes" value={item.notes || '\u2014'} />
            <DetailRow label="Created" value={new Date(item.createdAt).toLocaleString()} />
            {item.deletedAt && <DetailRow label="Deleted" value={new Date(item.deletedAt).toLocaleString()} />}
          </div>
        )}
      </main>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex">
      <span className="text-gray-400 w-40 shrink-0">{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default function InventoryDetailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-900"><p className="text-gray-400">Loading...</p></div>}>
      <InventoryDetailContent />
    </Suspense>
  );
}
