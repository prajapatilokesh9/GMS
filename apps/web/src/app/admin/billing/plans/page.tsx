'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getBillingPlans } from '@/lib/api';
import { ShieldAlert, RotateCcw, DollarSign, Plus } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  type: string;
  description: string | null;
  priceAmount: string;
  currency: string;
  durationDays: number | null;
  sessionsIncluded: number | null;
  autoRenew: boolean;
  isActive: boolean;
  createdAt: string;
}

const PLAN_TYPE_LABELS: Record<string, string> = {
  fixed: 'Fixed Duration',
  payg: 'Pay As You Go',
  flex: 'Flexible',
};

function PlanListContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const gymId = searchParams.get('gymId') || '';
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !user.roles.includes('super_admin'))) {
      router.push('/');
      return;
    }
    if (user && gymId) loadPlans();
  }, [user, authLoading, gymId]);

  async function loadPlans() {
    setLoading(true);
    try {
      const data = await getBillingPlans(gymId);
      setPlans(Array.isArray(data) ? data : []);
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
          <a href="/admin/gyms" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
            <ShieldAlert className="h-5 w-5" /> Gym Management
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
            <h1 className="text-2xl font-bold">Membership Plans</h1>
            <Link href={`/admin/billing/plans/new?gymId=${gymId}`}
              className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              <Plus className="h-4 w-4" /> Create Plan
            </Link>
          </div>
          {loading ? (
            <p className="text-gray-500">Loading plans...</p>
          ) : plans.length === 0 ? (
            <div className="rounded-lg border bg-white p-8 text-center">
              <p className="text-gray-500">No plans found for this gym.</p>
              <Link href={`/admin/billing/plans/new?gymId=${gymId}`}
                className="mt-2 inline-block text-sm text-blue-600 hover:underline">Create your first plan</Link>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Type</th>
                    <th className="px-4 py-3 text-left font-medium">Price</th>
                    <th className="px-4 py-3 text-left font-medium">Duration</th>
                    <th className="px-4 py-3 text-left font-medium">Auto-Renew</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {plans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link href={`/admin/billing/plans/${plan.id}?gymId=${gymId}`}
                          className="font-medium text-blue-600 hover:underline">{plan.name}</Link>
                        {plan.description && <p className="text-xs text-gray-500">{plan.description}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{PLAN_TYPE_LABELS[plan.type] || plan.type}</td>
                      <td className="px-4 py-3 font-medium">{plan.currency} {Number(plan.priceAmount).toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {plan.durationDays ? `${plan.durationDays} days` : plan.sessionsIncluded ? `${plan.sessionsIncluded} sessions` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${plan.autoRenew ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {plan.autoRenew ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${plan.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {plan.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/billing/plans/${plan.id}?gymId=${gymId}`}
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

export default function PlanListPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>}>
      <PlanListContent />
    </Suspense>
  );
}