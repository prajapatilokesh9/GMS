'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getPtSession, updatePtSession, checkInPtSession, completePtSession, cancelPtSession } from '@/lib/api';
import { ShieldAlert, RotateCcw, DollarSign, Building2, Dumbbell, Package, Clock } from 'lucide-react';

interface PtSessionData {
  id: string;
  scheduledAt: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  notes: string | null;
  createdAt: string;
  trainer: { id: string; user: { id: string; email: string; firstName: string; lastName: string } };
  client: { id: string; email: string; firstName: string; lastName: string };
  package: { id: string; name: string; totalSessions: number } | null;
  gym: { id: string; name: string } | null;
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  checked_in: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

function PtSessionDetailContent() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [session, setSession] = useState<PtSessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !user.roles.includes('super_admin'))) {
      router.push('/');
      return;
    }
    if (user && id) loadSession();
  }, [user, authLoading, id]);

  async function loadSession() {
    setLoading(true);
    try {
      const data = await getPtSession(id);
      setSession(data);
      setScheduledAt(new Date(data.scheduledAt).toISOString().slice(0, 16));
      setNotes(data.notes || '');
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  async function handleSave() {
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await updatePtSession(id, {
        scheduledAt: new Date(scheduledAt).toISOString(),
        notes: notes || undefined,
      });
      setSuccess('Session updated successfully');
      setEditing(false);
      await loadSession();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to update session');
    } finally { setSubmitting(false); }
  }

  async function handleAction(action: string) {
    setError('');
    setSuccess('');
    setActionLoading(action);
    try {
      if (action === 'check-in') await checkInPtSession(id);
      else if (action === 'complete') await completePtSession(id);
      else if (action === 'cancel') await cancelPtSession(id);
      setSuccess(`Session ${action} successful`);
      await loadSession();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || `Failed to ${action} session`);
    } finally { setActionLoading(''); }
  }

  if (authLoading || loading) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>;
  }
  if (!user || !session) return null;

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
          <a href="/admin/pt-sessions" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Clock className="h-5 w-5" /> PT Sessions</a>
          <a href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><RotateCcw className="h-5 w-5" /> Back to Dashboard</a>
        </nav>
        <div className="border-t border-gray-700 px-4 py-4">
          <div className="mb-2 text-xs text-gray-400">{user.email}</div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50 p-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{editing ? 'Edit Session' : 'PT Session Details'}</h1>
            <div className="flex gap-2">
              {session.status === 'scheduled' && (
                <button onClick={() => { setEditing(!editing); setError(''); setSuccess(''); }}
                  className="rounded border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                  {editing ? 'Cancel' : 'Edit'}
                </button>
              )}
            </div>
          </div>
          {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {success && <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div>}

          {!editing ? (
            <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[session.status] || 'bg-gray-100 text-gray-700'}`}>
                  {session.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-gray-500">Client</label><p className="font-medium">{session.client.firstName} {session.client.lastName}</p></div>
                <div><label className="text-xs text-gray-500">Trainer</label><p className="font-medium">{session.trainer.user.firstName} {session.trainer.user.lastName}</p></div>
                <div><label className="text-xs text-gray-500">Scheduled At</label><p className="font-medium">{new Date(session.scheduledAt).toLocaleString()}</p></div>
                <div><label className="text-xs text-gray-500">Gym</label><p className="font-medium">{session.gym?.name || '-'}</p></div>
                <div><label className="text-xs text-gray-500">Package</label><p className="font-medium">{session.package?.name || '-'}</p></div>
                {session.startedAt && <div><label className="text-xs text-gray-500">Started At</label><p className="font-medium">{new Date(session.startedAt).toLocaleString()}</p></div>}
                {session.completedAt && <div><label className="text-xs text-gray-500">Completed At</label><p className="font-medium">{new Date(session.completedAt).toLocaleString()}</p></div>}
              </div>
              {session.notes && <div><label className="text-xs text-gray-500">Notes</label><p className="font-medium">{session.notes}</p></div>}
              <div><label className="text-xs text-gray-500">Created</label><p className="font-medium">{new Date(session.createdAt).toLocaleDateString()}</p></div>

              {session.status === 'scheduled' && (
                <div className="flex gap-2 pt-2">
                  <button onClick={() => handleAction('check-in')} disabled={actionLoading === 'check-in'}
                    className="rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50">
                    {actionLoading === 'check-in' ? 'Processing...' : 'Check In'}
                  </button>
                  <button onClick={() => handleAction('cancel')} disabled={actionLoading === 'cancel'}
                    className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50">
                    {actionLoading === 'cancel' ? 'Processing...' : 'Cancel Session'}
                  </button>
                </div>
              )}
              {session.status === 'checked_in' && (
                <button onClick={() => handleAction('complete')} disabled={actionLoading === 'complete'}
                  className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
                  {actionLoading === 'complete' ? 'Processing...' : 'Complete Session'}
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
              <div>
                <label className="block text-sm font-medium text-gray-700">Scheduled Date & Time</label>
                <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} required
                  className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                  className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
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

export default function PtSessionDetailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>}>
      <PtSessionDetailContent />
    </Suspense>
  );
}
