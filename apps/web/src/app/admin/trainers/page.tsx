'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getTrainers } from '@/lib/api';
import { ShieldAlert, RotateCcw, DollarSign, Building2, Plus, Dumbbell } from 'lucide-react';

interface Trainer {
  id: string;
  userId: string;
  gymId: string;
  specialization: string | null;
  bio: string | null;
  isActive: boolean;
  createdAt: string;
  user: { id: string; email: string; firstName: string; lastName: string; avatarUrl: string | null };
  gym: { id: string; name: string };
}

function TrainerListContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !user.roles.includes('super_admin'))) {
      router.push('/');
      return;
    }
    if (user) loadTrainers();
  }, [user, authLoading]);

  async function loadTrainers() {
    setLoading(true);
    try {
      const data = await getTrainers();
      setTrainers(Array.isArray(data) ? data : []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>;
  }
  if (!user) return null;

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
          <a href="/admin/trainers" className="flex items-center gap-3 rounded-lg bg-gray-800 px-3 py-2 text-sm text-white"><Dumbbell className="h-5 w-5" /> Trainers</a>
          <a href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><RotateCcw className="h-5 w-5" /> Back to Dashboard</a>
        </nav>
        <div className="border-t border-gray-700 px-4 py-4">
          <div className="mb-2 text-xs text-gray-400">{user.email}</div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50 p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Trainers</h1>
            <Link href="/admin/trainers/new"
              className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              <Plus className="h-4 w-4" /> Add Trainer
            </Link>
          </div>
          {loading ? (
            <p className="text-gray-500">Loading trainers...</p>
          ) : trainers.length === 0 ? (
            <div className="rounded-lg border bg-white p-8 text-center">
              <p className="text-gray-500">No trainers found.</p>
              <Link href="/admin/trainers/new"
                className="mt-2 inline-block text-sm text-blue-600 hover:underline">Add your first trainer</Link>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Email</th>
                    <th className="px-4 py-3 text-left font-medium">Gym</th>
                    <th className="px-4 py-3 text-left font-medium">Specialization</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Created</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {trainers.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link href={`/admin/trainers/${t.id}`}
                          className="font-medium text-blue-600 hover:underline">{t.user.firstName} {t.user.lastName}</Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{t.user.email}</td>
                      <td className="px-4 py-3 text-gray-600">{t.gym.name}</td>
                      <td className="px-4 py-3 text-gray-600">{t.specialization || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {t.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/trainers/${t.id}`}
                          className="text-blue-600 hover:underline">Edit</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function TrainerListPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>}>
      <TrainerListContent />
    </Suspense>
  );
}
