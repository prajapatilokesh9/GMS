'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getGyms, updateGymOnboardingStatus } from '@/lib/api';
import { Shield, ShieldAlert, CheckCircle, XCircle, RotateCcw, DollarSign } from 'lucide-react';

const STATUS_FILTERS = ['all', 'pending', 'documents', 'review', 'active', 'rejected'];

interface Gym {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  ownerId: string;
  onboardingStatus: string;
  isActive: boolean;
  rejectionReason?: string;
  createdAt: string;
}

export default function AdminGymsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ gymId: string; gymName: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (!loading && (!user || !user.roles.includes('super_admin'))) {
      router.push('/');
      return;
    }
    if (user) {
      loadGyms();
    }
  }, [user, loading, filter]);

  async function loadGyms() {
    setPageLoading(true);
    try {
      const res = await getGyms(1, 100);
      const list = Array.isArray(res) ? res : res.gyms || [];
      setGyms(list);
    } catch { /* ignore */ } finally {
      setPageLoading(false);
    }
  }

  async function handleVerify(gymId: string) {
    setActionLoading(gymId);
    try {
      await updateGymOnboardingStatus(gymId, 'active');
      await loadGyms();
    } catch { /* ignore */ } finally {
      setActionLoading(null);
    }
  }

  async function handleReject() {
    if (!rejectModal) return;
    setActionLoading(rejectModal.gymId);
    try {
      await updateGymOnboardingStatus(rejectModal.gymId, 'rejected', rejectReason);
      setRejectModal(null);
      setRejectReason('');
      await loadGyms();
    } catch { /* ignore */ } finally {
      setActionLoading(null);
    }
  }

  const filteredGyms = filter === 'all' ? gyms : gyms.filter((g) => g.onboardingStatus === filter);

  function getStatusBadge(status: string) {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      pending: 'bg-gray-100 text-gray-600',
      documents: 'bg-blue-100 text-blue-700',
      review: 'bg-yellow-100 text-yellow-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return `rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`;
  }

  if (loading || pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
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
          <a href="/admin/gyms" className="flex items-center gap-3 rounded-lg bg-gray-800 px-3 py-2 text-sm text-white">
            <Shield className="h-5 w-5" /> Gym Management
          </a>
          <a href="/admin/billing" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
            <DollarSign className="h-5 w-5" /> Billing
          </a>
          <a href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
            <RotateCcw className="h-5 w-5" /> Back to Dashboard
          </a>
        </nav>
        <div className="border-t border-gray-700 px-4 py-4">
          <div className="mb-2 text-xs text-gray-400">{user.email}</div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50 p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Gym Management</h1>
            <div className="flex gap-2">
              {STATUS_FILTERS.map((s) => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`rounded px-3 py-1.5 text-xs font-medium ${
                    filter === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'
                  }`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg border bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">City</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Onboarding</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredGyms.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No gyms found.</td>
                  </tr>
                ) : filteredGyms.map((gym) => (
                  <tr key={gym.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <a href={`/admin/gyms/${gym.id}`} className="font-medium text-blue-600 hover:underline">{gym.name}</a>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{gym.email}</td>
                    <td className="px-4 py-3 text-gray-600">{gym.city}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        gym.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>{gym.isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={getStatusBadge(gym.onboardingStatus)}>{gym.onboardingStatus}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {gym.onboardingStatus === 'review' && (
                          <>
                            <button onClick={() => handleVerify(gym.id)} disabled={actionLoading === gym.id}
                              className="flex items-center gap-1 rounded bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50">
                              <CheckCircle className="h-3.5 w-3.5" /> Verify
                            </button>
                            <button onClick={() => setRejectModal({ gymId: gym.id, gymName: gym.name })}
                              className="flex items-center gap-1 rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700">
                              <XCircle className="h-3.5 w-3.5" /> Reject
                            </button>
                          </>
                        )}
                        {gym.onboardingStatus === 'active' && (
                          <span className="text-xs text-green-600">Verified</span>
                        )}
                        {gym.onboardingStatus === 'rejected' && (
                          <div className="text-xs text-red-600" title={gym.rejectionReason}>
                            Rejected
                          </div>
                        )}
                        {gym.onboardingStatus === 'pending' && (
                          <span className="text-xs text-gray-400">Awaiting documents</span>
                        )}
                        {gym.onboardingStatus === 'documents' && (
                          <span className="text-xs text-gray-400">Docs submitted</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Reject Gym</h2>
            <p className="mt-1 text-sm text-gray-500">Provide a reason for rejecting <strong>{rejectModal.gymName}</strong>:</p>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              className="mt-3 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              rows={3} placeholder="Enter rejection reason..." />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }
              } className="rounded border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleReject} disabled={!rejectReason.trim()} className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50">
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
