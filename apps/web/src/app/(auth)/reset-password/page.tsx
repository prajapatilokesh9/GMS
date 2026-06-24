'use client';

import { useState, type FormEvent, use } from 'react';
import Link from 'next/link';
import { resetPassword } from '@/lib/api';
import { ShieldCheck } from 'lucide-react';

export default function ResetPasswordPage(props: { searchParams: Promise<{ token?: string }> }) {
  const { token } = use(props.searchParams);
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!token) { setError('Missing reset token'); return; }
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center"><p className="text-red-600">Invalid or missing reset token.</p></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-blue-600" />
          <h1 className="mt-2 text-2xl font-bold">Set new password</h1>
        </div>
        {done ? (
          <div className="space-y-4">
            <div className="rounded bg-green-50 p-4 text-sm text-green-700">Password reset successfully.</div>
            <Link href="/login" className="block text-center text-sm text-blue-600 hover:underline">Sign in</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>}
            <div>
              <label className="block text-sm font-medium">New password</label>
              <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <button type="submit" className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Reset password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
