'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <LogIn className="mx-auto h-10 w-10 text-blue-600" />
          <h1 className="mt-2 text-2xl font-bold">Sign in</h1>
          <p className="text-sm text-gray-500">FitCore Pro</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>}
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <button type="submit" className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Sign in
          </button>
        </form>
        <div className="text-center text-sm">
          <Link href="/forgot-password" className="text-blue-600 hover:underline">Forgot password?</Link>
          <span className="mx-2 text-gray-400">|</span>
          <Link href="/register" className="text-blue-600 hover:underline">Create account</Link>
        </div>
      </div>
    </div>
  );
}
