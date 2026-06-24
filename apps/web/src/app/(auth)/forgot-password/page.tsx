'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { forgotPassword } from '@/lib/api';
import { KeyRound } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <KeyRound className="mx-auto h-10 w-10 text-blue-600" />
          <h1 className="mt-2 text-2xl font-bold">Reset password</h1>
        </div>
        {sent ? (
          <div className="rounded bg-green-50 p-4 text-sm text-green-700">
            If an account exists with that email, we&apos;ve sent a password reset link.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>}
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <button type="submit" className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Send reset link
            </button>
          </form>
        )}
        <p className="text-center text-sm">
          <Link href="/login" className="text-blue-600 hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
