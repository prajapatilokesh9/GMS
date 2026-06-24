'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createPtSession, getTrainers, getGyms, getUsers } from '@/lib/api';
import { ShieldAlert, RotateCcw, DollarSign, Building2, Dumbbell, Package, Clock } from 'lucide-react';

interface Trainer { id: string; user: { id: string; email: string; firstName: string; lastName: string }; specialization: string | null; }
interface Gym { id: string; name: string; }
interface User { id: string; email: string; firstName: string; lastName: string; }

function CreatePtSessionContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [trainerId, setTrainerId] = useState('');
  const [clientId, setClientId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [gymId, setGymId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !user.roles.includes('super_admin'))) {
      router.push('/');
      return;
    }
    if (user) {
      loadTrainers();
      loadGyms();
      loadClients();
    }
  }, [user, authLoading]);

  async function loadTrainers() {
    try { const data = await getTrainers(); setTrainers(Array.isArray(data) ? data : []); } catch { /* ignore */ }
  }
  async function loadGyms() {
    try { const data = await getGyms(); setGyms(Array.isArray(data) ? data : []); } catch { /* ignore */ }
  }
  async function loadClients() {
    try { const data = await getUsers(); setClients(Array.isArray(data) ? data : []); } catch { /* ignore */ }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createPtSession({
        trainerId,
        clientId,
        scheduledAt: new Date(scheduledAt).toISOString(),
        gymId: gymId || undefined,
        notes: notes || undefined,
      });
      router.push('/admin/pt-sessions');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to create session');
    } finally { setSubmitting(false); }
  }

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
          <div className="mb-2 text-xs text-gray-400">{user?.email}</div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50 p-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <h1 className="text-2xl font-bold">Schedule PT Session</h1>
          {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700">Client *</label>
              <select value={clientId} onChange={(e) => setClientId(e.target.value)} required
                className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                <option value="">Select client...</option>
                {clients.map((c) => (<option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.email})</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Trainer *</label>
              <select value={trainerId} onChange={(e) => setTrainerId(e.target.value)} required
                className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                <option value="">Select trainer...</option>
                {trainers.map((t) => (<option key={t.id} value={t.id}>{t.user.firstName} {t.user.lastName}{t.specialization ? ` (${t.specialization})` : ''}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Scheduled Date & Time *</label>
              <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} required
                className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gym (optional)</label>
              <select value={gymId} onChange={(e) => setGymId(e.target.value)}
                className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                <option value="">Select gym...</option>
                {gyms.map((g) => (<option key={g.id} value={g.id}>{g.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => router.back()}
                className="rounded border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={submitting}
                className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
                {submitting ? 'Scheduling...' : 'Schedule Session'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function CreatePtSessionPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>}>
      <CreatePtSessionContent />
    </Suspense>
  );
}
