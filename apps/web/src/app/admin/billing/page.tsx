'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getGyms, getBillingPlans, getBillingMemberships, getBillingPayments } from '@/lib/api';
import { ShieldAlert, RotateCcw, CreditCard, Users, DollarSign, Wallet } from 'lucide-react';

interface Gym {
  id: string;
  name: string;
}

export default function BillingDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [selectedGymId, setSelectedGymId] = useState<string>('');
  const [planCount, setPlanCount] = useState(0);
  const [membershipCount, setMembershipCount] = useState(0);
  const [paymentCount, setPaymentCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !user.roles.includes('super_admin'))) {
      router.push('/');
      return;
    }
    if (user) loadGyms();
  }, [user, authLoading]);

  async function loadGyms() {
    try {
      const res = await getGyms(1, 200);
      const list = Array.isArray(res) ? res : res.gyms || [];
      setGyms(list);
      if (list.length > 0) setSelectedGymId(list[0].id);
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  useEffect(() => {
    if (selectedGymId) loadStats();
  }, [selectedGymId]);

  async function loadStats() {
    setLoading(true);
    try {
      const [plans, memberships, payments] = await Promise.all([
        getBillingPlans(selectedGymId),
        getBillingMemberships(selectedGymId),
        getBillingPayments(),
      ]);
      const planList = Array.isArray(plans) ? plans : [];
      const membershipList = Array.isArray(memberships) ? memberships : [];
      const paymentList = Array.isArray(payments) ? payments : [];
      setPlanCount(planList.length);
      setMembershipCount(membershipList.length);
      setPaymentCount(paymentList.length);
      setTotalRevenue(paymentList.reduce((sum: number, p: any) => sum + (p.status === 'completed' ? Number(p.amount) : 0), 0));
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
          <a href="/admin/billing" className="flex items-center gap-3 rounded-lg bg-gray-800 px-3 py-2 text-sm text-white">
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
            <h1 className="text-2xl font-bold">Billing Dashboard</h1>
            <select value={selectedGymId} onChange={(e) => setSelectedGymId(e.target.value)}
              className="rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
              {gyms.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          {loading ? (
            <p className="text-gray-500">Loading stats...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-100 p-3"><CreditCard className="h-6 w-6 text-blue-600" /></div>
                    <div><p className="text-sm text-gray-500">Plans</p><p className="text-2xl font-bold">{planCount}</p></div>
                  </div>
                </div>
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-green-100 p-3"><Users className="h-6 w-6 text-green-600" /></div>
                    <div><p className="text-sm text-gray-500">Memberships</p><p className="text-2xl font-bold">{membershipCount}</p></div>
                  </div>
                </div>
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-purple-100 p-3"><Wallet className="h-6 w-6 text-purple-600" /></div>
                    <div><p className="text-sm text-gray-500">Payments</p><p className="text-2xl font-bold">{paymentCount}</p></div>
                  </div>
                </div>
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-yellow-100 p-3"><DollarSign className="h-6 w-6 text-yellow-600" /></div>
                    <div><p className="text-sm text-gray-500">Revenue</p><p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p></div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <a href={`/admin/billing/plans?gymId=${selectedGymId}`}
                  className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="font-semibold">Membership Plans</h3>
                  <p className="mt-1 text-sm text-gray-500">Create and manage membership plans</p>
                </a>
                <a href={`/admin/billing/memberships?gymId=${selectedGymId}`}
                  className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="font-semibold">Memberships</h3>
                  <p className="mt-1 text-sm text-gray-500">View and manage member subscriptions</p>
                </a>
                <a href={`/admin/billing/payments`}
                  className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="font-semibold">Payments</h3>
                  <p className="mt-1 text-sm text-gray-500">View payment history and transactions</p>
                </a>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}