"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Trainer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  primary_domains: string[];
  secondary_domains: string[];
  rating_avg: number;
  rating_count: number;
  total_sessions_delivered: number;
  certifications: { name: string; expiryDate: string }[];
  day_rate_usd: number | null;
  hourly_rate_usd: number | null;
  created_at: string;
  approved_at: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  in_review: "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function DashboardPage() {
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [completeness, setCompleteness] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [sessions, setSessions] = useState<{ id: string; client_company: string; topic: string; session_date: string; status: string; client_rating: number | null }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [profileRes, sessionsRes] = await Promise.all([
        fetch("/api/trainer/profile"),
        fetch("/api/trainer/sessions"),
      ]);

      if (profileRes.ok) {
        const data = await profileRes.json();
        setTrainer(data.trainer);
        setCompleteness(data.completeness);
        setSuggestions(data.suggestions);
      }

      if (sessionsRes.ok) {
        const data = await sessionsRes.json();
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

  if (!trainer) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">No trainer profile found for this account.</p>
        <Link href="/register" className="text-blue-600 font-medium">Register as a trainer</Link>
      </div>
    );
  }

  // Expiring certifications (within 30 days)
  const certs = Array.isArray(trainer.certifications) ? trainer.certifications : [];
  const now = new Date();
  const expiringSoon = certs.filter((c) => {
    if (!c.expiryDate) return false;
    const exp = new Date(c.expiryDate);
    const diff = (exp.getTime() - now.getTime()) / 86400000;
    return diff > 0 && diff <= 30;
  });

  const recentSessions = sessions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Welcome, {trainer.first_name}!
          </h2>
          <p className="text-sm text-gray-500">
            Status:{" "}
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[trainer.status] || "bg-gray-100 text-gray-500"}`}>
              {trainer.status}
            </span>
          </p>
        </div>
        <Link
          href="/dashboard/edit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          Edit Profile
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Profile Score" value={`${completeness}%`} sub={completeness === 100 ? "Complete" : `${suggestions.length} items to improve`} />
        <StatCard label="Rating" value={Number(trainer.rating_avg) > 0 ? Number(trainer.rating_avg).toFixed(1) : "—"} sub={trainer.rating_count > 0 ? `${trainer.rating_count} reviews` : "No reviews yet"} />
        <StatCard label="Sessions" value={String(trainer.total_sessions_delivered || 0)} sub="Total delivered" />
        <StatCard label="Day Rate" value={trainer.day_rate_usd ? `$${trainer.day_rate_usd}` : "—"} sub={trainer.hourly_rate_usd ? `$${trainer.hourly_rate_usd}/hr` : "Not set"} />
      </div>

      {/* Profile completeness */}
      {completeness < 100 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Profile Completeness</h3>
            <span className="text-sm font-bold text-blue-600">{completeness}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${completeness}%` }} />
          </div>
          <ul className="space-y-1.5">
            {suggestions.map((s) => (
              <li key={s} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Certification alerts */}
      {expiringSoon.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-amber-800 mb-2">Certification Renewal Alert</h3>
          <ul className="space-y-1">
            {expiringSoon.map((c) => (
              <li key={c.name} className="text-sm text-amber-700">
                <strong>{c.name}</strong> expires on {new Date(c.expiryDate).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Domains */}
      {(trainer.primary_domains?.length > 0 || trainer.secondary_domains?.length > 0) && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Domains</h3>
          <div className="flex flex-wrap gap-1.5">
            {trainer.primary_domains?.map((d) => (
              <span key={d} className="px-2.5 py-1 bg-blue-600 text-white rounded-full text-xs">{d}</span>
            ))}
            {trainer.secondary_domains?.map((d) => (
              <span key={d} className="px-2.5 py-1 bg-gray-200 text-gray-700 rounded-full text-xs">{d}</span>
            ))}
          </div>
        </div>
      )}

      {/* Recent sessions */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Recent Sessions</h3>
          {sessions.length > 5 && (
            <Link href="/dashboard/sessions" className="text-xs text-blue-600 font-medium">View all</Link>
          )}
        </div>
        <div className="px-5 py-4">
          {recentSessions.length === 0 ? (
            <p className="text-sm text-gray-400">No sessions recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {recentSessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm border-b border-gray-50 pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{s.topic}</p>
                    <p className="text-xs text-gray-400">{s.client_company} &middot; {new Date(s.session_date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    {s.client_rating && (
                      <span className="text-xs font-medium text-amber-600">{Number(s.client_rating).toFixed(1)} / 5</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}
