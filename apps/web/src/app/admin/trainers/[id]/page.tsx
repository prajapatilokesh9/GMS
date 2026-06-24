'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getTrainer, updateTrainer } from '@/lib/api';
import { ShieldAlert, RotateCcw, DollarSign, Building2, Dumbbell } from 'lucide-react';

interface TrainerData {
  id: string;
  userId: string;
  gymId: string;
  specialization: string | null;
  certifications: { name: string; issuer?: string; year?: number }[];
  bio: string | null;
  isActive: boolean;
  createdAt: string;
  user: { id: string; email: string; firstName: string; lastName: string; avatarUrl: string | null };
  gym: { id: string; name: string };
}

function TrainerDetailContent() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [trainer, setTrainer] = useState<TrainerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [specialization, setSpecialization] = useState('');
  const [bio, setBio] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !user.roles.includes('super_admin'))) {
      router.push('/');
      return;
    }
    if (user && id) loadTrainer();
  }, [user, authLoading, id]);

  async function loadTrainer() {
    setLoading(true);
    try {
      const data = await getTrainer(id);
      setTrainer(data);
      setSpecialization(data.specialization || '');
      setBio(data.bio || '');
      setIsActive(data.isActive);
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  async function handleSave() {
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await updateTrainer(id, {
        specialization: specialization || undefined,
        bio: bio || undefined,
        isActive,
      });
      setSuccess('Trainer updated successfully');
      setEditing(false);
      await loadTrainer();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to update trainer');
    } finally { setSubmitting(false); }
  }

  if (authLoading || loading) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>;
  }
  if (!user || !trainer) return null;

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
          <a href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><RotateCcw className="h-5 w-5" /> Back to Dashboard</a>
        </nav>
        <div className="border-t border-gray-700 px-4 py-4">
          <div className="mb-2 text-xs text-gray-400">{user.email}</div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50 p-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{editing ? 'Edit Trainer' : `${trainer.user.firstName} ${trainer.user.lastName}`}</h1>
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
                <div><label className="text-xs text-gray-500">Email</label><p className="font-medium">{trainer.user.email}</p></div>
                <div><label className="text-xs text-gray-500">Gym</label><p className="font-medium">{trainer.gym.name}</p></div>
                <div><label className="text-xs text-gray-500">Specialization</label><p className="font-medium">{trainer.specialization || '-'}</p></div>
                <div><label className="text-xs text-gray-500">Status</label>
                  <p className={`font-medium ${trainer.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {trainer.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
              <div><label className="text-xs text-gray-500">Bio</label><p className="font-medium">{trainer.bio || '-'}</p></div>
              <div><label className="text-xs text-gray-500">Created</label><p className="font-medium">{new Date(trainer.createdAt).toLocaleDateString()}</p></div>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
              <div>
                <label className="block text-sm font-medium text-gray-700">Specialization</label>
                <input value={specialization} onChange={(e) => setSpecialization(e.target.value)}
                  className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                  className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
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

export default function TrainerDetailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>}>
      <TrainerDetailContent />
    </Suspense>
  );
}
