'use client';

import { useState, type FormEvent } from 'react';
import { useAuth } from '@/lib/auth-context';
import { changePassword } from '@/lib/api';
import { SidebarLayout } from '@/components/SidebarLayout';
import { Save } from 'lucide-react';

function ProfileContent() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await changePassword(currentPassword, newPassword);
      setMessage(res.message);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password');
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between"><dt className="text-gray-500">Name</dt><dd className="font-medium">{user?.fullName}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Email</dt><dd className="font-medium">{user?.email}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Role</dt><dd className="font-medium capitalize">{user?.role}</dd></div>
        </dl>
      </div>
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Change password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {message && <div className="rounded bg-green-50 p-3 text-sm text-green-700">{message}</div>}
          {error && <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>}
          <div>
            <label className="block text-sm font-medium">Current password</label>
            <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium">New password</label>
            <input type="password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <button type="submit" className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Save className="h-4 w-4" /> Update password
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return <SidebarLayout><ProfileContent /></SidebarLayout>;
}
