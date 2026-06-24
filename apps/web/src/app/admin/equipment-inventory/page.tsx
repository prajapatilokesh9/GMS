'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import {
  getEquipmentInventoryItems,
  getEquipmentCatalogues,
  getGyms,
  deleteEquipmentInventoryItem,
  restoreEquipmentInventoryItem,
} from '@/lib/api';
import { ShieldAlert, RotateCcw, DollarSign, Building2, Package, Wrench, Dumbbell } from 'lucide-react';

interface InventoryItem {
  id: string;
  serialNumber: string;
  status: string;
  location: string | null;
  purchaseDate: string;
  warrantyEndDate: string | null;
  nextMaintenanceAt: string | null;
  isActive: boolean;
  deletedAt: string | null;
  catalogueItem: { name: string; brand: string; model: string };
  gym: { name: string };
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  ordered: 'Ordered', delivered: 'Delivered', active: 'Active',
  maintenance: 'Maintenance', under_repair: 'Under Repair', damaged: 'Damaged',
  lost_stolen: 'Lost/Stolen', decommissioned: 'Decommissioned',
};

const STATUS_COLORS: Record<string, string> = {
  ordered: 'bg-blue-100 text-blue-800', delivered: 'bg-purple-100 text-purple-800',
  active: 'bg-green-100 text-green-800', maintenance: 'bg-yellow-100 text-yellow-800',
  under_repair: 'bg-orange-100 text-orange-800', damaged: 'bg-red-100 text-red-800',
  lost_stolen: 'bg-gray-100 text-gray-800', decommissioned: 'bg-red-200 text-red-900',
};

function InventoryListContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !user.roles.includes('super_admin'))) {
      router.push('/');
      return;
    }
    if (user) loadItems();
  }, [user, authLoading, statusFilter, includeDeleted]);

  async function loadItems() {
    setLoading(true);
    try {
      const data = await getEquipmentInventoryItems({
        status: statusFilter || undefined,
        includeInactive: includeDeleted ? 'true' : undefined,
      });
      setItems(data ?? []);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Soft-delete this inventory item?')) return;
    try {
      await deleteEquipmentInventoryItem(id);
      loadItems();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }

  async function handleRestore(id: string) {
    try {
      await restoreEquipmentInventoryItem(id);
      loadItems();
    } catch (err) {
      console.error('Restore failed:', err);
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
          <a href="/admin/equipment-inventory" className="flex items-center gap-3 rounded-lg bg-gray-800 px-3 py-2 text-sm text-white"><Package className="h-5 w-5" /> Equipment Inventory</a>
          <a href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><RotateCcw className="h-5 w-5" /> Back to Dashboard</a>
        </nav>
        <div className="border-t border-gray-800 px-4 py-4">
          <div className="mb-2 text-xs text-gray-400">{user.email}</div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Equipment Inventory</h1>
          <Link
            href="/admin/equipment-inventory/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            + Add Item
          </Link>
        </div>

        <div className="flex gap-4 mb-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
          >
            <option value="">All Statuses</option>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-white">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) => setIncludeDeleted(e.target.checked)}
            />
            Include deleted
          </label>
        </div>

        {loading ? (
          <div className="text-white">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-gray-400">No inventory items found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="py-2 pr-4">Serial #</th>
                  <th className="py-2 pr-4">Equipment</th>
                  <th className="py-2 pr-4">Gym</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Location</th>
                  <th className="py-2 pr-4">Warranty</th>
                  <th className="py-2 pr-4">Next Maint.</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-700 text-white hover:bg-gray-800">
                    <td className="py-3 pr-4">
                      <Link href={`/admin/equipment-inventory/${item.id}`} className="text-blue-400 hover:underline font-mono">
                        {item.serialNumber}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">{item.catalogueItem.brand} {item.catalogueItem.model}</td>
                    <td className="py-3 pr-4">{item.gym.name}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[item.status] || 'bg-gray-100'}`}>
                        {STATUS_LABELS[item.status] || item.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4">{item.location || '\u2014'}</td>
                    <td className="py-3 pr-4">
                      {item.warrantyEndDate ? new Date(item.warrantyEndDate).toLocaleDateString() : '\u2014'}
                    </td>
                    <td className="py-3 pr-4">
                      {item.nextMaintenanceAt ? new Date(item.nextMaintenanceAt).toLocaleDateString() : '\u2014'}
                    </td>
                    <td className="py-3">
                      {item.deletedAt ? (
                        <button onClick={() => handleRestore(item.id)} className="text-green-400 hover:text-green-300" title="Restore">
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      ) : (
                        <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300" title="Delete">
                          <ShieldAlert className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default function EquipmentInventoryPage() {
  return (
    <Suspense fallback={<div className="p-6 text-white">Loading...</div>}>
      <InventoryListContent />
    </Suspense>
  );
}
