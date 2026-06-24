'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getSupplementOrder, updateSupplementOrder } from '@/lib/api';
import { ShieldAlert, RotateCcw, DollarSign, ShoppingCart, Package, Truck, CheckCircle, XCircle, Undo2 } from 'lucide-react';

interface Order {
  id: string;
  gymId: string;
  userId: string;
  quantity: number;
  unitPrice: string;
  totalAmount: string;
  status: string;
  notes: string | null;
  trackingId: string | null;
  returnReason: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  supplement: { id: string; name: string; images: string[] };
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

function OrderDetailContent() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [trackingId, setTrackingId] = useState('');
  const [showShipModal, setShowShipModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !user.roles.includes('super_admin'))) {
      router.push('/');
      return;
    }
    if (user && id) loadOrder();
  }, [user, authLoading, id]);

  async function loadOrder() {
    setLoading(true);
    try {
      const data = await getSupplementOrder(id);
      setOrder(data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  async function handleStatusUpdate(status: string, extra?: Record<string, unknown>) {
    setError('');
    setSuccess('');
    setActionLoading(status);
    try {
      await updateSupplementOrder(id, { status, ...extra } as any);
      setSuccess(`Order ${status} successfully`);
      setShowShipModal(false);
      setShowReturnModal(false);
      await loadOrder();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || `Failed to ${status} order`);
    } finally { setActionLoading(null); }
  }

  if (authLoading || loading) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>;
  }
  if (!user || !order) return null;

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
          <a href="/admin/supplement-orders" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><ShoppingCart className="h-5 w-5" /> Orders</a>
          <a href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><RotateCcw className="h-5 w-5" /> Back to Dashboard</a>
        </nav>
        <div className="border-t border-gray-700 px-4 py-4">
          <div className="mb-2 text-xs text-gray-400">{user.email}</div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50 p-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {success && <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div>}

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">Order #{order.id.slice(0, 8)}</h1>
                <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${STATUS_BADGES[order.status] || 'bg-gray-100 text-gray-600'}`}>
                {order.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Supplement Details</h2>
              <div className="space-y-3">
                <div><label className="text-xs text-gray-500">Supplement</label><p className="font-medium">{order.supplement?.name || '-'}</p></div>
                <div><label className="text-xs text-gray-500">Company</label><p className="font-medium">{order.company?.name || '-'}</p></div>
                <div><label className="text-xs text-gray-500">Unit Price</label><p className="font-medium">₹{Number(order.unitPrice).toLocaleString()}</p></div>
                <div><label className="text-xs text-gray-500">Quantity</label><p className="font-medium">{order.quantity}</p></div>
                <div><label className="text-xs text-gray-500">Total Amount</label><p className="text-xl font-bold text-blue-600">₹{Number(order.totalAmount).toLocaleString()}</p></div>
              </div>
            </div>
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Tracking</h2>
              <div className="space-y-3">
                <div><label className="text-xs text-gray-500">Tracking ID</label><p className="font-medium">{order.trackingId || 'Not assigned'}</p></div>
                <div><label className="text-xs text-gray-500">Notes</label><p className="font-medium">{order.notes || '-'}</p></div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Timeline</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div><label className="text-xs text-gray-500">Created</label><p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p></div>
              <div><label className="text-xs text-gray-500">Updated</label><p className="font-medium">{new Date(order.updatedAt).toLocaleDateString()}</p></div>
              {order.deliveredAt && <div><label className="text-xs text-gray-500">Delivered</label><p className="font-medium">{new Date(order.deliveredAt).toLocaleDateString()}</p></div>}
              {order.cancelledAt && <div><label className="text-xs text-gray-500">Cancelled</label><p className="font-medium">{new Date(order.cancelledAt).toLocaleDateString()}</p></div>}
            </div>
            {order.returnReason && <div className="mt-2"><label className="text-xs text-gray-500">Return Reason</label><p className="text-sm text-red-600">{order.returnReason}</p></div>}
          </div>

          {order.status === 'pending' && (
            <div className="flex gap-3">
              <button onClick={() => handleStatusUpdate('confirmed')} disabled={actionLoading === 'confirmed'}
                className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
                <CheckCircle className="h-4 w-4" /> Confirm Order
              </button>
              <button onClick={() => handleStatusUpdate('cancelled')} disabled={actionLoading === 'cancelled'}
                className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50">
                <XCircle className="h-4 w-4" /> Cancel Order
              </button>
            </div>
          )}

          {order.status === 'confirmed' && (
            <div>
              <button onClick={() => setShowShipModal(true)}
                className="flex items-center gap-2 rounded bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700">
                <Truck className="h-4 w-4" /> Mark as Shipped
              </button>
            </div>
          )}

          {order.status === 'shipped' && (
            <div className="flex gap-3">
              <button onClick={() => handleStatusUpdate('delivered')} disabled={actionLoading === 'delivered'}
                className="flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50">
                <Package className="h-4 w-4" /> Mark as Delivered
              </button>
            </div>
          )}

          {order.status === 'delivered' && (
            <div>
              <button onClick={() => setShowReturnModal(true)}
                className="flex items-center gap-2 rounded bg-orange-600 px-4 py-2 text-sm text-white hover:bg-orange-700">
                <Undo2 className="h-4 w-4" /> Process Return
              </button>
            </div>
          )}
        </div>
      </main>

      {showShipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Mark as Shipped</h2>
            <p className="mt-1 text-sm text-gray-500">Enter tracking ID:</p>
            <input value={trackingId} onChange={(e) => setTrackingId(e.target.value)}
              className="mt-3 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Tracking ID..." />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => { setShowShipModal(false); setTrackingId(''); }}
                className="rounded border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleStatusUpdate('shipped', { trackingId })} disabled={!trackingId || actionLoading === 'shipped'}
                className="rounded bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700 disabled:opacity-50">
                {actionLoading === 'shipped' ? 'Updating...' : 'Ship Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Process Return</h2>
            <p className="mt-1 text-sm text-gray-500">Enter return reason:</p>
            <textarea value={returnReason} onChange={(e) => setReturnReason(e.target.value)} rows={3}
              className="mt-3 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Reason for return..." />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => { setShowReturnModal(false); setReturnReason(''); }}
                className="rounded border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleStatusUpdate('returned', { returnReason })} disabled={!returnReason || actionLoading === 'returned'}
                className="rounded bg-orange-600 px-4 py-2 text-sm text-white hover:bg-orange-700 disabled:opacity-50">
                {actionLoading === 'returned' ? 'Processing...' : 'Process Return'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>}>
      <OrderDetailContent />
    </Suspense>
  );
}
