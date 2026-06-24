'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getSupplementCompany, updateSupplementCompany } from '@/lib/api';
import { ShieldAlert, RotateCcw, DollarSign, Building2 } from 'lucide-react';

interface Supplement {
  id: string;
  name: string;
  category: string;
  price: string;
  stock: number;
  isActive: boolean;
}

interface Company {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  supplements: Supplement[];
}

function CompanyDetailContent() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !user.roles.includes('super_admin'))) {
      router.push('/');
      return;
    }
    if (user && id) loadCompany();
  }, [user, authLoading, id]);

  async function loadCompany() {
    setLoading(true);
    try {
      const data = await getSupplementCompany(id);
      setCompany(data);
      setName(data.name);
      setEmail(data.email || '');
      setPhone(data.phone || '');
      setAddress(data.address || '');
      setCity(data.city || '');
      setState(data.state || '');
      setPincode(data.pincode || '');
      setIsActive(data.isActive);
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  async function handleSave() {
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await updateSupplementCompany(id, {
        name, email: email || undefined,
        phone: phone || undefined,
        address: address || undefined,
        city: city || undefined,
        state: state || undefined,
        pincode: pincode || undefined,
        isActive,
      });
      setSuccess('Company updated successfully');
      setEditing(false);
      await loadCompany();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to update company');
    } finally { setSubmitting(false); }
  }

  if (authLoading || loading) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>;
  }
  if (!user || !company) return null;

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
          <div className="mb-2 text-xs text-gray-400">{user.email}</div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50 p-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{editing ? 'Edit Company' : company.name}</h1>
            <button onClick={() => { setEditing(!editing); setError(''); setSuccess(''); }}
              className="rounded border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>
          {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {success && <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div>}

          {!editing ? (
            <>
              <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs text-gray-500">Slug</label><p className="font-medium">{company.slug}</p></div>
                  <div><label className="text-xs text-gray-500">Status</label><p className="font-medium">{company.isActive ? 'Active' : 'Inactive'}</p></div>
                  <div><label className="text-xs text-gray-500">Email</label><p className="font-medium">{company.email || '-'}</p></div>
                  <div><label className="text-xs text-gray-500">Phone</label><p className="font-medium">{company.phone || '-'}</p></div>
                  <div><label className="text-xs text-gray-500">Address</label><p className="font-medium">{company.address || '-'}</p></div>
                  <div><label className="text-xs text-gray-500">City</label><p className="font-medium">{company.city || '-'}</p></div>
                  <div><label className="text-xs text-gray-500">State</label><p className="font-medium">{company.state || '-'}</p></div>
                  <div><label className="text-xs text-gray-500">Pincode</label><p className="font-medium">{company.pincode || '-'}</p></div>
                </div>
                <div><label className="text-xs text-gray-500">Created</label><p className="font-medium">{new Date(company.createdAt).toLocaleDateString()}</p></div>
              </div>

              {company.supplements.length > 0 && (
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-lg font-semibold">Supplements ({company.supplements.length})</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium">Name</th>
                          <th className="px-4 py-2 text-left font-medium">Category</th>
                          <th className="px-4 py-2 text-left font-medium">Price</th>
                          <th className="px-4 py-2 text-left font-medium">Stock</th>
                          <th className="px-4 py-2 text-left font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {company.supplements.map((s) => (
                          <tr key={s.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-blue-600">{s.name}</td>
                            <td className="px-4 py-2 text-gray-600">{s.category}</td>
                            <td className="px-4 py-2">₹{Number(s.price).toLocaleString()}</td>
                            <td className="px-4 py-2">{s.stock}</td>
                            <td className="px-4 py-2">
                              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {s.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required
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
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-gray-300" />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={submitting}
                  className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default function CompanyDetailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>}>
      <CompanyDetailContent />
    </Suspense>
  );
}
