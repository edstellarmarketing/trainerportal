"use client";

import { useEffect, useState } from "react";

interface Session {
  id: string;
  client_company: string;
  topic: string;
  session_date: string;
  duration_hours: number | null;
  location: string | null;
  delivery_format: string | null;
  group_size: number | null;
  client_rating: number | null;
  participant_nps: number | null;
  feedback_comments: string | null;
  status: string;
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  no_show: "bg-gray-100 text-gray-500",
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/trainer/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-xl font-bold text-gray-900">Session History</h2>

      {sessions.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-400">No sessions recorded yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Topic</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Client</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Format</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Rating</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{s.topic}</p>
                      {s.location && <p className="text-xs text-gray-400">{s.location}</p>}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-gray-600">{s.client_company}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(s.session_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-500">{s.delivery_format || "—"}</td>
                    <td className="px-4 py-3">
                      {s.client_rating ? (
                        <span className="text-amber-600 font-medium">{Number(s.client_rating).toFixed(1)}</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[s.status] || "bg-gray-100 text-gray-500"}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
