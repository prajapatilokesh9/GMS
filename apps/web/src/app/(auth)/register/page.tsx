'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register } from '@/lib/api';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await register({ email, password, fullName, phone: phone || undefined });
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <UserPlus className="mx-auto h-10 w-10 text-blue-600" />
          <h1 className="mt-2 text-2xl font-bold">Create account</h1>
          <p className="text-sm text-gray-500">Join FitCore Pro</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>}
          <div>
            <label className="block text-sm font-medium">Full name</label>
            <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium">Phone (optional)</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <button type="submit" className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Create account
          </button>
        </form>
        <p className="text-center text-sm text-gray-500">
          Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
