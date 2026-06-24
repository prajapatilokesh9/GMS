'use client';

import { useEffect, useState } from 'react';
import { getLoginHistory } from '@/lib/api';
import { SidebarLayout } from '@/components/SidebarLayout';
import { History } from 'lucide-react';

interface LoginEntry {
  id: string;
  ipAddress: string;
  userAgent: string;
  device: string;
  browser: string;
  location: string | null;
  success: boolean;
  failureReason: string | null;
  createdAt: string;
}

function LoginHistoryContent() {
  const [entries, setEntries] = useState<LoginEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLoginHistory().then((res) => setEntries(res.history || res)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading login history...</p>;

  return (
    <div className="space-y-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <History className="h-6 w-6" /> Login History
      </h1>
      {entries.length === 0 ? (
        <p className="text-gray-500">No login history found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">IP</th>
                <th className="px-4 py-3 text-left font-medium">Device</th>
                <th className="px-4 py-3 text-left font-medium">Browser</th>
                <th className="px-4 py-3 text-left font-medium">Location</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {entries.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(e.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono text-xs">{e.ipAddress}</td>
                  <td className="px-4 py-3 text-gray-600">{e.device || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{e.browser || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{e.location || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      e.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>{e.success ? 'Success' : e.failureReason || 'Failed'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function LoginHistoryPage() {
  return <SidebarLayout><LoginHistoryContent /></SidebarLayout>;
}
