'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createSupplementCompany } from '@/lib/api';
import { ShieldAlert, RotateCcw, DollarSign, Building2 } from 'lucide-react';

function CreateCompanyContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !user.roles.includes('super_admin'))) {
      router.push('/');
    }
  }, [user, authLoading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createSupplementCompany({
        name, slug,
        email: email || undefined,
        phone: phone || undefined,
        address: address || undefined,
        city: city || undefined,
        state: state || undefined,
        pincode: pincode || undefined,
      });
      router.push('/admin/supplement-companies');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to create company');
    } finally {
      setSubmitting(false);
    }
  }

  function autoSlug(value: string) {
    setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
  }

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
          <a href="/admin/supplement-companies" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Building2 className="h-5 w-5" /> Companies</a>
          <a href="/admin/supplement-orders" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><Building2 className="h-5 w-5" /> Orders</a>
          <a href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"><RotateCcw className="h-5 w-5" /> Back to Dashboard</a>
        </nav>
        <div className="border-t border-gray-700 px-4 py-4">
          <div className="mb-2 text-xs text-gray-400">{user?.email}</div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50 p-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <h1 className="text-2xl font-bold">Add Supplement Company</h1>
          {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name *</label>
              <input value={name} onChange={(e) => { setName(e.target.value); autoSlug(e.target.value); }} required
                className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Slug *</label>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} required
                className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2}
                className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input value={city} onChange={(e) => setCity(e.target.value)}
                  className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input value={state} onChange={(e) => setState(e.target.value)}
                  className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Pincode</label>
                <input value={pincode} onChange={(e) => setPincode(e.target.value)}
                  className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => router.back()}
                className="rounded border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={submitting}
                className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
                {submitting ? 'Creating...' : 'Create Company'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function CreateCompanyPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>}>
      <CreateCompanyContent />
    </Suspense>
  );
}
