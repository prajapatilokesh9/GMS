'use client';

import { useEffect, useState } from 'react';
import { getGyms } from '@/lib/api';
import { SidebarLayout } from '@/components/SidebarLayout';

interface Gym {
  id: string;
  gymName: string;
  email: string;
  phone: string;
  city: string;
  status: string;
  verificationStatus: string;
  createdAt: string;
}

function GymsContent() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGyms().then((res) => setGyms(res.gyms || res)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading gyms...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gyms</h1>
      {gyms.length === 0 ? (
        <p className="text-gray-500">No gyms found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">City</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {gyms.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{g.gymName}</td>
                  <td className="px-4 py-3 text-gray-600">{g.email}</td>
                  <td className="px-4 py-3 text-gray-600">{g.city}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      g.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>{g.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      g.verificationStatus === 'verified' ? 'bg-green-100 text-green-700' :
                      g.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>{g.verificationStatus}</span>
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

export default function GymsPage() {
  return <SidebarLayout><GymsContent /></SidebarLayout>;
}
