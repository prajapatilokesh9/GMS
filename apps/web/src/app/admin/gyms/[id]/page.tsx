'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getGymById, getGymDocuments, updateDocumentStatus, updateGymOnboardingStatus, getGymStaff } from '@/lib/api';
import { ShieldAlert, RotateCcw, CheckCircle, XCircle, FileText, Users, DollarSign } from 'lucide-react';

interface GymDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  addressLine1: string;
  onboardingStatus: string;
  isActive: boolean;
  rejectionReason?: string;
  verifiedAt?: string;
  ownerId: string;
}

interface Document {
  id: string;
  documentType: string;
  fileName: string;
  status: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: string;
  createdAt: string;
}

interface Staff {
  id: string;
  userId: string;
  roleId: string;
  user?: { firstName: string; lastName: string; email: string };
  role?: { name: string; slug: string };
}

export default function AdminGymDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [gym, setGym] = useState<GymDetail | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !user.roles.includes('super_admin'))) {
      router.push('/');
      return;
    }
    if (user && id) loadData();
  }, [user, authLoading, id]);

  async function loadData() {
    setLoading(true);
    try {
      const [gymData, docs, staffData] = await Promise.all([
        getGymById(id),
        getGymDocuments(id),
        getGymStaff(id),
      ]);
      setGym(gymData);
      setDocuments(Array.isArray(docs) ? docs : []);
      setStaff(Array.isArray(staffData) ? staffData : []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }

  async function handleDocAction(docId: string, status: string) {
    setActionLoading(`${docId}-${status}`);
    try {
      await updateDocumentStatus(id, docId, status);
      await loadData();
    } catch { /* ignore */ } finally {
      setActionLoading(null);
    }
  }

  async function handleVerify() {
    setActionLoading('verify');
    try {
      await updateGymOnboardingStatus(id, 'active');
      await loadData();
    } catch { /* ignore */ } finally {
      setActionLoading(null);
    }
  }

  async function handleReject() {
    setActionLoading('reject');
    try {
      await updateGymOnboardingStatus(id, 'rejected', rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
      await loadData();
    } catch { /* ignore */ } finally {
      setActionLoading(null);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user || !gym) return null;

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col bg-gray-900 text-white">
        <div className="flex items-center gap-2 border-b border-gray-700 px-6 py-4">
          <ShieldAlert className="h-6 w-6 text-blue-400" />
          <span className="text-lg font-bold">Admin Panel</span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          <a href="/admin/gyms" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
            <RotateCcw className="h-5 w-5" /> Gym Management
          </a>
          <a href="/admin/billing" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
            <DollarSign className="h-5 w-5" /> Billing
          </a>
          <a href="/admin/gyms" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
            <RotateCcw className="h-5 w-5" /> Back to Gym List
          </a>
        </nav>
        <div className="border-t border-gray-700 px-4 py-4">
          <div className="mb-2 text-xs text-gray-400">{user.email}</div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50 p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">{gym.name}</h1>
                <p className="mt-1 text-sm text-gray-500">{gym.email} | {gym.phone}</p>
                <p className="text-sm text-gray-500">{gym.addressLine1}, {gym.city}, {gym.state}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                  gym.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>{gym.isActive ? 'Active' : 'Inactive'}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                  gym.onboardingStatus === 'active' ? 'bg-green-100 text-green-700' :
                  gym.onboardingStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>{gym.onboardingStatus}</span>
              </div>
            </div>
            {gym.rejectionReason && (
              <div className="mt-3 rounded bg-red-50 p-3 text-sm text-red-700">
                Rejection reason: {gym.rejectionReason}
              </div>
            )}
            {(gym.onboardingStatus === 'review' || gym.onboardingStatus === 'rejected') && (
              <div className="mt-4 flex gap-2">
                <button onClick={handleVerify} disabled={actionLoading === 'verify'}
                  className="flex items-center gap-1 rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">
                  <CheckCircle className="h-4 w-4" /> Verify Gym
                </button>
                {gym.onboardingStatus !== 'rejected' && (
                  <button onClick={() => setShowRejectModal(true)}
                    className="flex items-center gap-1 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold">Documents ({documents.length})</h2>
            </div>
            {documents.length === 0 ? (
              <p className="text-sm text-gray-500">No documents uploaded.</p>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between rounded border p-3">
                    <div>
                      <p className="text-sm font-medium capitalize">{doc.documentType.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-gray-500">{doc.fileName} ({(doc.fileSize / 1024).toFixed(0)} KB)</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        doc.status === 'approved' ? 'bg-green-100 text-green-700' :
                        doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{doc.status}</span>
                      {doc.status === 'pending' && (
                        <div className="flex gap-1">
                          <button onClick={() => handleDocAction(doc.id, 'approved')}
                            disabled={actionLoading === `${doc.id}-approved`}
                            className="rounded bg-green-100 px-2 py-1 text-xs text-green-700 hover:bg-green-200 disabled:opacity-50">
                            Approve
                          </button>
                          <button onClick={() => handleDocAction(doc.id, 'rejected')}
                            disabled={actionLoading === `${doc.id}-rejected`}
                            className="rounded bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200 disabled:opacity-50">
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold">Staff ({staff.length})</h2>
            </div>
            {staff.length === 0 ? (
              <p className="text-sm text-gray-500">No staff assigned.</p>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 pr-4 text-left font-medium">Name</th>
                    <th className="py-2 pr-4 text-left font-medium">Email</th>
                    <th className="py-2 text-left font-medium">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((s) => (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="py-2 pr-4">{s.user ? `${s.user.firstName} ${s.user.lastName}` : s.userId}</td>
                      <td className="py-2 pr-4 text-gray-500">{s.user?.email || '-'}</td>
                      <td className="py-2 text-gray-500 capitalize">{s.role?.name || s.roleId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Reject Gym</h2>
            <p className="mt-1 text-sm text-gray-500">Provide a reason for rejecting <strong>{gym.name}</strong>:</p>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              className="mt-3 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              rows={3} placeholder="Enter rejection reason..." />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                className="rounded border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleReject} disabled={!rejectReason.trim()}
                className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50">Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
