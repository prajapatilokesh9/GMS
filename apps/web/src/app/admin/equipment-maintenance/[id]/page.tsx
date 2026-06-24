'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  getMaintenanceJob, updateMaintenanceJob,
  deleteMaintenanceJob, restoreMaintenanceJob,
} from '@/lib/api';
import { ShieldAlert, RotateCcw, ArrowLeft, DollarSign, Building2, Package, Wrench, Dumbbell } from 'lucide-react';

const STATUS_OPTIONS: Record<string, string[]> = {
  scheduled: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled', 'failed'],
  completed: [],
  cancelled: [],
  failed: ['scheduled'],
};

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Scheduled', in_progress: 'In Progress',
  completed: 'Completed', cancelled: 'Cancelled', failed: 'Failed',
};

function MaintenanceDetailContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [job, setJob] = useState<any>(null);
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
    if (user) loadJob();
  }, [user, authLoading, id]);

  async function loadJob() {
    setLoading(true);
    try {
      const data = await getMaintenanceJob(id);
      setJob(data);
      setForm({
        type: data.type,
        assignedTechnicianName: data.assignedTechnicianName || '',
        description: data.description || '',
        outcome: data.outcome || '',
        estimatedCost: data.estimatedCost || '',
        laborCost: data.laborCost || '',
        partsCost: data.partsCost || '',
        invoiceReference: data.invoiceReference || '',
      });
    } catch (err) {
      console.error('Failed to load maintenance job:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleTransition(toStatus: string) {
    const payload: Record<string, unknown> = { status: toStatus };
    if (reason) payload.reason = reason;
    if (toStatus === 'in_progress') payload.assignedTo = job.assignedTo;
    if (toStatus === 'completed') {
      payload.laborCost = Number(form.laborCost) || 0;
      payload.partsCost = Number(form.partsCost) || 0;
    }
    setSaving(true);
    try {
      await updateMaintenanceJob(id, payload);
      setReason('');
      loadJob();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Transition failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveDetails() {
    setSaving(true);
    try {
      await updateMaintenanceJob(id, form);
      setEditing(false);
      loadJob();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Soft-delete this maintenance job?')) return;
    try {
      await deleteMaintenanceJob(id);
      router.push('/admin/equipment-maintenance');
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }

  async function handleRestore() {
    try {
      await restoreMaintenanceJob(id);
      loadJob();
    } catch (err) {
      console.error('Restore failed:', err);
    }
  }

  if (authLoading || loading) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-900"><p className="text-gray-400">Loading...</p></div>;
  }
  if (!user || !user.roles.includes('super_admin')) return null;
  if (!job) return <div className="flex min-h-screen items-center justify-center bg-gray-900"><p className="text-gray-400">Job not found.</p></div>;

  const allowedTransitions = STATUS_OPTIONS[job.status] || [];
  const needsReason = ['cancelled', 'failed'].includes(job.status);
  const isDeleted = !!job.deletedAt;

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
        <div className="mb-6">
          <button onClick={() => router.push('/admin/equipment-maintenance')} className="text-gray-400 hover:text-white flex items-center gap-1 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Maintenance Jobs
          </button>

          {isDeleted && (
            <div className="bg-yellow-900 text-yellow-200 px-4 py-2 rounded mb-4 flex justify-between items-center">
              <span>This job has been soft-deleted.</span>
              <button onClick={handleRestore} className="text-green-400 hover:text-green-300 underline">Restore</button>
            </div>
          )}

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {job.inventory.catalogueItem.brand} {job.inventory.catalogueItem.model}
              </h1>
              <p className="text-gray-400">
                Serial: {job.inventory.serialNumber} &middot; Gym: {job.inventory.gym.name} &middot; Inventory Status: {job.inventory.status}
              </p>
            </div>
            <div className="flex gap-2">
              {!isDeleted && (
                <button onClick={() => setEditing(!editing)} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-sm">
                  {editing ? 'Cancel' : 'Edit Details'}
                </button>
              )}
              {!isDeleted && (
                <button onClick={handleDelete} className="bg-red-700 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm">
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-white mb-3">Status</h2>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-gray-400">Current:</span>
                <span className="px-2 py-0.5 rounded text-sm font-medium bg-blue-100 text-blue-800">
                  {STATUS_LABELS[job.status] || job.status}
                </span>
              </div>
              {allowedTransitions.length > 0 && !isDeleted && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Transition to:</p>
                  {needsReason && (
                    <input
                      type="text" value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Reason (required)..."
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 text-sm"
                    />
                  )}
                  <div className="flex gap-2 flex-wrap">
                    {allowedTransitions.map((toStatus: string) => (
                      <button
                        key={toStatus}
                        onClick={() => handleTransition(toStatus)}
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-1.5 rounded text-sm"
                      >
                        {toStatus === 'in_progress' ? 'Start Work' :
                         toStatus === 'completed' ? 'Mark Completed' :
                         toStatus === 'cancelled' ? 'Cancel' :
                         toStatus === 'failed' ? 'Mark Failed' :
                         toStatus === 'scheduled' ? 'Retry (Reschedule)' : toStatus}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Editable Details */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-white mb-3">{editing ? 'Edit Details' : 'Details'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Type</label>
                  {editing ? (
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2">
                      <option value="preventive">Preventive</option>
                      <option value="corrective">Corrective</option>
                      <option value="amc">AMC</option>
                    </select>
                  ) : (
                    <p className="text-white">{STATUS_LABELS[job.type] || job.type}</p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Scheduled Date</label>
                  <p className="text-white">{new Date(job.scheduledDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Technician</label>
                  {editing ? (
                    <input type="text" value={form.assignedTechnicianName} onChange={(e) => setForm({ ...form, assignedTechnicianName: e.target.value })}
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2" />
                  ) : (
                    <p className="text-white">{job.assignedTechnicianName || '\u2014'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Outcome</label>
                  {editing ? (
                    <input type="text" value={form.outcome} onChange={(e) => setForm({ ...form, outcome: e.target.value })}
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2" />
                  ) : (
                    <p className="text-white">{job.outcome || '\u2014'}</p>
                  )}
                </div>
              </div>
              {editing && (
                <div className="mt-4">
                  <label className="block text-gray-400 text-sm mb-1">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2" rows={3} />
                </div>
              )}
              {editing && (
                <button onClick={handleSaveDetails} disabled={saving}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>

            {/* Timestamps */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-white mb-3">Timeline</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Scheduled:</span><span className="text-white">{new Date(job.scheduledDate).toLocaleDateString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Started:</span><span className="text-white">{job.startedAt ? new Date(job.startedAt).toLocaleString() : '\u2014'}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Completed:</span><span className="text-white">{job.completedAt ? new Date(job.completedAt).toLocaleString() : '\u2014'}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Created:</span><span className="text-white">{new Date(job.createdAt).toLocaleString()}</span></div>
              </div>
            </div>

            {/* Status Log */}
            {job.statusLogs?.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-white mb-3">Status History</h2>
                <div className="space-y-2">
                  {job.statusLogs.map((log: any) => (
                    <div key={log.id} className="flex justify-between items-center text-sm border-b border-gray-700 pb-1">
                      <span className="text-gray-300">
                        {log.fromStatus || '—'} &rarr; {log.toStatus}
                        {log.reason ? ` (${log.reason})` : ''}
                      </span>
                      <span className="text-gray-500">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cost panel */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-white mb-3">Cost</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-400 text-sm">Estimated Cost</label>
                  {editing ? (
                    <input type="number" step="0.01" value={form.estimatedCost} onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })}
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 mt-1" />
                  ) : (
                    <p className="text-white text-lg">{job.estimatedCost ? `\u20B9${Number(job.estimatedCost).toLocaleString()}` : '\u2014'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-400 text-sm">Labor Cost</label>
                  {editing ? (
                    <input type="number" step="0.01" value={form.laborCost} onChange={(e) => setForm({ ...form, laborCost: e.target.value })}
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 mt-1" />
                  ) : (
                    <p className="text-white">{job.laborCost ? `\u20B9${Number(job.laborCost).toLocaleString()}` : '\u2014'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-400 text-sm">Parts Cost</label>
                  {editing ? (
                    <input type="number" step="0.01" value={form.partsCost} onChange={(e) => setForm({ ...form, partsCost: e.target.value })}
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 mt-1" />
                  ) : (
                    <p className="text-white">{job.partsCost ? `\u20B9${Number(job.partsCost).toLocaleString()}` : '\u2014'}</p>
                  )}
                </div>
                <div className="border-t border-gray-700 pt-2">
                  <p className="text-gray-400 text-sm">Total Cost</p>
                  <p className="text-white text-xl font-bold">
                    {job.totalCost ? `\u20B9${Number(job.totalCost).toLocaleString()}` :
                     (job.laborCost || job.partsCost) ? `\u20B9${(Number(job.laborCost || 0) + Number(job.partsCost || 0)).toLocaleString()}` : '\u2014'}
                  </p>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm">Invoice Ref</label>
                  {editing ? (
                    <input type="text" value={form.invoiceReference} onChange={(e) => setForm({ ...form, invoiceReference: e.target.value })}
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 mt-1" />
                  ) : (
                    <p className="text-white">{job.invoiceReference || '\u2014'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-400 text-sm">Approval Required</label>
                  <p className="text-white">{job.approvalRequired ? 'Yes' : 'No'}</p>
                </div>
                {job.amcContractId && (
                  <div className="border-t border-gray-700 pt-2">
                    <p className="text-gray-400 text-sm">AMC Contract</p>
                    <p className="text-white font-mono text-sm">{job.amcContractId}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function MaintenanceDetailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-900"><p className="text-gray-400">Loading...</p></div>}>
      <MaintenanceDetailContent />
    </Suspense>
  );
}
