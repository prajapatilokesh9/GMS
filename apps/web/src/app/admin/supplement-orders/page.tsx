'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getSupplementOrders } from '@/lib/api';
import { ShieldAlert, RotateCcw, DollarSign, ShoppingCart } from 'lucide-react';

interface Order {
  id: string;
  quantity: number;
  unitPrice: string;
  totalAmount: string;
  status: string;
  notes: string | null;
  createdAt: string;
  supplement: { id: string; name: string };
  company: { id: string; name: string };
}

const STATUS_BADGES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  returned: 'bg-gray-100 text-gray-600',
};

function OrderListContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !user.roles.includes('super_admin'))) {
      router.push('/');
      return;
    }
    if (user) loadOrders();
  }, [user, authLoading]);

  async function loadOrders() {
    setLoading(true);
    try {
      const data = await getSupplementOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  const filteredOrders = statusFilter ? orders.filter((o) => o.status === statusFilter) : orders;

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>;
  }
  if (!user) return null;

  const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'];

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
          <a href="/admin/supplements" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><ShoppingCart className="h-5 w-5" /> Supplements</a>
          <a href="/admin/supplement-companies" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><ShoppingCart className="h-5 w-5" /> Companies</a>
          <a href="/admin/supplement-orders" className="flex items-center gap-3 rounded-lg bg-gray-800 px-3 py-2 text-sm text-white"><ShoppingCart className="h-5 w-5" /> Orders</a>
          <a href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><RotateCcw className="h-5 w-5" /> Back to Dashboard</a>
        </nav>
        <div className="border-t border-gray-700 px-4 py-4">
          <div className="mb-2 text-xs text-gray-400">{user.email}</div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50 p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Supplement Orders</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStatusFilter('')}
              className={`rounded px-3 py-1.5 text-xs font-medium ${!statusFilter ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'}`}>
              All
            </button>
            {statuses.map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`rounded px-3 py-1.5 text-xs font-medium capitalize ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'}`}>
                {s}
              </button>
            ))}
          </div>
          {loading ? (
            <p className="text-gray-500">Loading orders...</p>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-lg border bg-white p-8 text-center">
              <p className="text-gray-500">No orders found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Order ID</th>
                    <th className="px-4 py-3 text-left font-medium">Supplement</th>
                    <th className="px-4 py-3 text-left font-medium">Company</th>
                    <th className="px-4 py-3 text-left font-medium">Qty</th>
                    <th className="px-4 py-3 text-left font-medium">Total</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{o.id.slice(0, 8)}...</td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/supplement-orders/${o.id}`}
                          className="font-medium text-blue-600 hover:underline">{o.supplement?.name || '-'}</Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{o.company?.name || '-'}</td>
                      <td className="px-4 py-3">{o.quantity}</td>
                      <td className="px-4 py-3 font-medium">₹{Number(o.totalAmount).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_BADGES[o.status] || 'bg-gray-100 text-gray-600'}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/supplement-orders/${o.id}`}
                          className="text-blue-600 hover:underline">View</Link>
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

export default function OrderListPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>}>
      <OrderListContent />
    </Suspense>
  );
}
