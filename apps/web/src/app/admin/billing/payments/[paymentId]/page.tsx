'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getBillingPayment } from '@/lib/api';
import { ShieldAlert, RotateCcw, DollarSign, ArrowLeft } from 'lucide-react';

interface Payment {
  id: string;
  tenantId: string;
  entityType: string;
  entityId: string;
  amount: string;
  currency: string;
  gateway: string | null;
  gatewayTxnId: string | null;
  gatewayOrderId: string | null;
  status: string;
  refundAmount: string;
  refundReason: string | null;
  refundedAt: string | null;
  metadata: Record<string, unknown> | null;
  reconciledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_BADGES: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-purple-100 text-purple-700',
  partial_refunded: 'bg-blue-100 text-blue-700',
};

export default function PaymentDetailPage() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !user.roles.includes('super_admin'))) {
      router.push('/');
      return;
    }
    if (user && paymentId) loadPayment();
  }, [user, authLoading, paymentId]);

  async function loadPayment() {
    setLoading(true);
    try {
      const data = await getBillingPayment(paymentId);
      setPayment(data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  if (authLoading || loading) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>;
  }
  if (!user || !payment) return null;

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
          <a href="/admin/billing/payments" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><ArrowLeft className="h-5 w-5" /> Back to Payments</a>
          <a href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><RotateCcw className="h-5 w-5" /> Back to Dashboard</a>
        </nav>
        <div className="border-t border-gray-700 px-4 py-4">
          <div className="mb-2 text-xs text-gray-400">{user.email}</div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50 p-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Payment Details</h1>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_BADGES[payment.status] || 'bg-gray-100 text-gray-600'}`}>
              {payment.status}
            </span>
          </div>

          <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-gray-500">Payment ID</label><p className="font-mono text-sm">{payment.id}</p></div>
              <div><label className="text-xs text-gray-500">Amount</label><p className="text-xl font-bold">{payment.currency} {Number(payment.amount).toLocaleString()}</p></div>
              <div><label className="text-xs text-gray-500">Entity Type</label><p className="font-medium capitalize">{payment.entityType}</p></div>
              <div><label className="text-xs text-gray-500">Entity ID</label><p className="font-mono text-sm">{payment.entityId}</p></div>
              <div><label className="text-xs text-gray-500">Gateway</label><p className="font-medium">{payment.gateway || 'N/A'}</p></div>
              <div><label className="text-xs text-gray-500">Gateway Transaction ID</label><p className="font-mono text-sm">{payment.gatewayTxnId || 'N/A'}</p></div>
              <div><label className="text-xs text-gray-500">Gateway Order ID</label><p className="font-mono text-sm">{payment.gatewayOrderId || 'N/A'}</p></div>
              <div><label className="text-xs text-gray-500">Created At</label><p className="font-medium">{new Date(payment.createdAt).toLocaleString()}</p></div>
            </div>
          </div>

          {(payment.status === 'refunded' || payment.status === 'partial_refunded' || Number(payment.refundAmount) > 0) && (
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-6">
              <h2 className="text-lg font-semibold text-purple-800">Refund Information</h2>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div><label className="text-xs text-purple-600">Refund Amount</label><p className="font-medium text-purple-900">{payment.currency} {Number(payment.refundAmount).toLocaleString()}</p></div>
                <div><label className="text-xs text-purple-600">Refunded At</label><p className="font-medium text-purple-900">{payment.refundedAt ? new Date(payment.refundedAt).toLocaleString() : 'N/A'}</p></div>
              </div>
              {payment.refundReason && <div className="mt-2"><label className="text-xs text-purple-600">Reason</label><p className="text-sm text-purple-900">{payment.refundReason}</p></div>}
            </div>
          )}

          {payment.reconciledAt && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              Reconciled at {new Date(payment.reconciledAt).toLocaleString()}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}