'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import {
  getMaintenanceJobs, getEquipmentInventoryItems,
  deleteMaintenanceJob, restoreMaintenanceJob,
} from '@/lib/api';
import { ShieldAlert, RotateCcw, DollarSign, Building2, Package, Wrench, Dumbbell } from 'lucide-react';

interface MaintenanceJob {
  id: string;
  type: string;
  status: string;
  scheduledDate: string;
  startedAt: string | null;
  completedAt: string | null;
  assignedTo: string | null;
  assignedTechnicianName: string | null;
  estimatedCost: string | null;
  totalCost: string | null;
  isActive: boolean;
  deletedAt: string | null;
  inventory: {
    id: string;
    serialNumber: string;
    status: string;
    catalogueItem: { name: string; brand: string; model: string };
    gym: { name: string };
  };
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  preventive: 'Preventive', corrective: 'Corrective', amc: 'AMC',
};

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Scheduled', in_progress: 'In Progress',
  completed: 'Completed', cancelled: 'Cancelled', failed: 'Failed',
};

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
  failed: 'bg-red-100 text-red-800',
};

function MaintenanceListContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<MaintenanceJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !user.roles.includes('super_admin'))) {
      router.push('/');
      return;
    }
    if (user) loadJobs();
  }, [user, authLoading, statusFilter, typeFilter, includeDeleted]);

  async function loadJobs() {
    setLoading(true);
    try {
      const data = await getMaintenanceJobs({
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        includeInactive: includeDeleted ? 'true' : undefined,
      });
      setJobs(data ?? []);
    } catch (err) {
      console.error('Failed to load maintenance jobs:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Soft-delete this maintenance job?')) return;
    try {
      await deleteMaintenanceJob(id);
      loadJobs();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }

  async function handleRestore(id: string) {
    try {
      await restoreMaintenanceJob(id);
      loadJobs();
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
          <a href="/admin/trainers" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Dumbbell className="h-5 w-5" /> Trainers</a>
          <a href="/admin/pt-sessions" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Dumbbell className="h-5 w-5" /> PT Sessions</a>
          <a href="/admin/equipment-catalogue" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Wrench className="h-5 w-5" /> Equipment</a>
          <a href="/admin/equipment-inventory" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Package className="h-5 w-5" /> Inventory</a>
          <a href="/admin/equipment-maintenance" className="flex items-center gap-3 rounded-lg bg-gray-800 px-3 py-2 text-sm text-white"><Wrench className="h-5 w-5" /> Maintenance</a>
          <a href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><RotateCcw className="h-5 w-5" /> Back to Dashboard</a>
        </nav>
        <div className="border-t border-gray-800 px-4 py-4">
          <div className="mb-2 text-xs text-gray-400">{user.email}</div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Maintenance Jobs</h1>
          <Link
            href="/admin/equipment-maintenance/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            + Schedule Maintenance
          </Link>
        </div>

        <div className="flex gap-4 mb-4 items-center">
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
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
          >
            <option value="">All Types</option>
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
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
        ) : jobs.length === 0 ? (
          <div className="text-gray-400">No maintenance jobs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="py-2 pr-4">Equipment</th>
                  <th className="py-2 pr-4">Gym</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Scheduled</th>
                  <th className="py-2 pr-4">Technician</th>
                  <th className="py-2 pr-4">Est. Cost</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b border-gray-700 text-white hover:bg-gray-800">
                    <td className="py-3 pr-4">
                      <Link href={`/admin/equipment-maintenance/${job.id}`} className="text-blue-400 hover:underline">
                        {job.inventory.catalogueItem.brand} {job.inventory.catalogueItem.model} ({job.inventory.serialNumber})
                      </Link>
                    </td>
                    <td className="py-3 pr-4">{job.inventory.gym.name}</td>
                    <td className="py-3 pr-4">{TYPE_LABELS[job.type] || job.type}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[job.status] || 'bg-gray-100'}`}>
                        {STATUS_LABELS[job.status] || job.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4">{new Date(job.scheduledDate).toLocaleDateString()}</td>
                    <td className="py-3 pr-4">{job.assignedTechnicianName || '\u2014'}</td>
                    <td className="py-3 pr-4">
                      {job.estimatedCost ? `\u20B9${Number(job.estimatedCost).toLocaleString()}` : '\u2014'}
                    </td>
                    <td className="py-3">
                      {job.deletedAt ? (
                        <button onClick={() => handleRestore(job.id)} className="text-green-400 hover:text-green-300" title="Restore">
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      ) : (
                        <button onClick={() => handleDelete(job.id)} className="text-red-400 hover:text-red-300" title="Delete">
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

export default function EquipmentMaintenancePage() {
  return (
    <Suspense fallback={<div className="p-6 text-white">Loading...</div>}>
      <MaintenanceListContent />
    </Suspense>
  );
}
