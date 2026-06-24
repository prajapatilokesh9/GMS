'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getCommissionRules, getCommissionPayouts } from '@/lib/api';
import { ShieldAlert, RotateCcw, DollarSign, Building2, Dumbbell, Package, Clock, BadgeDollarSign, Plus, CheckCircle, XCircle, Hourglass } from 'lucide-react';

interface CommissionRule { id: string; commissionType: string; commissionValue: number; status: string; effectiveFrom: string; effectiveTo: string | null; gym: { id: string; name: string }; trainer: { id: string; user: { id: string; firstName: string; lastName: string } } | null; }
interface CommissionPayout { id: string; grossAmount: number; commissionAmount: number; payoutStatus: string; payoutDate: string | null; createdAt: string; trainer: { id: string; user: { id: string; firstName: string; lastName: string } }; session: { id: string; scheduledAt: string }; }

const statusColors: Record<string, string> = { active: 'bg-green-100 text-green-700', inactive: 'bg-red-100 text-red-700' };
const payoutStatusColors: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-blue-100 text-blue-700', paid: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };

function CommissionsContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'rules' | 'payouts'>('rules');
  const [rules, setRules] = useState<CommissionRule[]>([]);
  const [payouts, setPayouts] = useState<CommissionPayout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !user.roles.includes('super_admin'))) { router.push('/'); return; }
    if (user) loadData();
  }, [user, authLoading, tab]);

  async function loadData() {
    setLoading(true);
    try {
      if (tab === 'rules') { const d = await getCommissionRules(); setRules(Array.isArray(d) ? d : []); }
      else { const d = await getCommissionPayouts(); setPayouts(Array.isArray(d) ? d : []); }
    } catch {} finally { setLoading(false); }
  }

  if (authLoading) return <div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>;
  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col bg-gray-900 text-white">
        <div className="flex items-center gap-2 border-b border-gray-700 px-6 py-4"><ShieldAlert className="h-6 w-6 text-blue-400" /><span className="text-lg font-bold">Admin Panel</span></div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          <a href="/admin/gyms" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><ShieldAlert className="h-5 w-5" /> Gym Management</a>
          <a href="/admin/billing" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><DollarSign className="h-5 w-5" /> Billing</a>
          <a href="/admin/supplements" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Building2 className="h-5 w-5" /> Supplements</a>
          <a href="/admin/supplement-companies" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Building2 className="h-5 w-5" /> Supplement Companies</a>
          <a href="/admin/supplement-orders" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Building2 className="h-5 w-5" /> Supplement Orders</a>
          <a href="/admin/trainers" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Dumbbell className="h-5 w-5" /> Trainers</a>
          <a href="/admin/pt-packages" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Package className="h-5 w-5" /> PT Packages</a>
          <a href="/admin/pt-sessions" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Clock className="h-5 w-5" /> PT Sessions</a>
          <a href="/admin/commissions" className="flex items-center gap-3 rounded-lg bg-gray-800 px-3 py-2 text-sm text-white"><BadgeDollarSign className="h-5 w-5" /> Commissions</a>
          <a href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><RotateCcw className="h-5 w-5" /> Back to Dashboard</a>
        </nav>
        <div className="border-t border-gray-700 px-4 py-4"><div className="mb-2 text-xs text-gray-400">{user.email}</div></div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50 p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Commissions</h1>
            {tab === 'rules' && (
              <Link href="/admin/commissions/rules/new"
                className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                <Plus className="h-4 w-4" /> New Rule
              </Link>
            )}
          </div>
          <div className="flex gap-2 border-b">
            <button onClick={() => setTab('rules')} className={`px-4 py-2 text-sm font-medium ${tab === 'rules' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Commission Rules</button>
            <button onClick={() => setTab('payouts')} className={`px-4 py-2 text-sm font-medium ${tab === 'payouts' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Payouts</button>
          </div>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : tab === 'rules' ? (
            rules.length === 0 ? (
              <div className="rounded-lg border bg-white p-8 text-center"><p className="text-gray-500">No commission rules yet.</p></div>
            ) : (
              <div className="overflow-x-auto rounded-lg border bg-white">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Gym</th>
                      <th className="px-4 py-3 text-left font-medium">Trainer</th>
                      <th className="px-4 py-3 text-left font-medium">Type</th>
                      <th className="px-4 py-3 text-left font-medium">Value</th>
                      <th className="px-4 py-3 text-left font-medium">Effective</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      <th className="px-4 py-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rules.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{r.gym?.name || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{r.trainer ? `${r.trainer.user.firstName} ${r.trainer.user.lastName}` : 'All Trainers'}</td>
                        <td className="px-4 py-3"><span className="capitalize">{r.commissionType}</span></td>
                        <td className="px-4 py-3">{r.commissionType === 'percentage' ? `${r.commissionValue}%` : `₹${r.commissionValue}`}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{new Date(r.effectiveFrom).toLocaleDateString()}{r.effectiveTo ? ` - ${new Date(r.effectiveTo).toLocaleDateString()}` : ''}</td>
                        <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[r.status] || 'bg-gray-100 text-gray-700'}`}>{r.status}</span></td>
                        <td className="px-4 py-3"><Link href={`/admin/commissions/rules/${r.id}`} className="text-blue-600 hover:underline">View</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            payouts.length === 0 ? (
              <div className="rounded-lg border bg-white p-8 text-center"><p className="text-gray-500">No payouts yet.</p></div>
            ) : (
              <div className="overflow-x-auto rounded-lg border bg-white">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Trainer</th>
                      <th className="px-4 py-3 text-left font-medium">Gross</th>
                      <th className="px-4 py-3 text-left font-medium">Commission</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                      <th className="px-4 py-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {payouts.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{p.trainer.user.firstName} {p.trainer.user.lastName}</td>
                        <td className="px-4 py-3">₹{Number(p.grossAmount).toFixed(2)}</td>
                        <td className="px-4 py-3">₹{Number(p.commissionAmount).toFixed(2)}</td>
                        <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${payoutStatusColors[p.payoutStatus] || 'bg-gray-100 text-gray-700'}`}>{p.payoutStatus}</span></td>
                        <td className="px-4 py-3 text-xs text-gray-500">{p.payoutDate ? new Date(p.payoutDate).toLocaleDateString() : new Date(p.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3"><Link href={`/admin/commissions/payouts/${p.id}`} className="text-blue-600 hover:underline">View</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}

export default function CommissionsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>}>
      <CommissionsContent />
    </Suspense>
  );
}
