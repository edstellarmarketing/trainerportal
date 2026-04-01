"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface Enquiry {
  id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  company_type: string;
  domain_needed: string;
  delivery_format: string;
  location: string;
  group_size: number;
  preferred_timeline: string;
  additional_notes: string;
  status: string;
  sla_deadline: string;
  created_at: string;
}

interface Match {
  id: string;
  enquiry_id: string;
  trainer_id: string;
  status: string;
  admin_notes: string;
  trainer: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    primary_domains: string[];
    location_city: string;
    location_country: string;
    rating_avg: number;
    day_rate_usd: number;
    status: string;
  } | null;
}

interface SearchTrainer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  primary_domains: string[];
  secondary_domains: string[];
  location_city: string;
  location_country: string;
  rating_avg: number;
  day_rate_usd: number;
}

const PIPELINE = ["new", "matching", "sent", "reviewing", "converted", "lost"];
const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  matching: "bg-purple-100 text-purple-700",
  sent: "bg-indigo-100 text-indigo-700",
  reviewing: "bg-amber-100 text-amber-700",
  converted: "bg-green-100 text-green-700",
  lost: "bg-gray-100 text-gray-500",
};

export default function EnquiryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const enquiryId = params.id as string;

  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [searchResults, setSearchResults] = useState<SearchTrainer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEnquiry = useCallback(async () => {
    const res = await fetch(`/api/admin/enquiries?search=&status=&page=1&limit=200`);
    const data = await res.json();
    const found = data.enquiries?.find((e: Enquiry) => e.id === enquiryId);
    setEnquiry(found || null);
  }, [enquiryId]);

  const fetchMatches = useCallback(async () => {
    const res = await fetch(`/api/admin/enquiries/${enquiryId}/matches`);
    const data = await res.json();
    setMatches(data.matches || []);
  }, [enquiryId]);

  useEffect(() => {
    Promise.all([fetchEnquiry(), fetchMatches()]).then(() => setLoading(false));
  }, [fetchEnquiry, fetchMatches]);

  async function searchTrainers() {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const res = await fetch(`/api/admin/trainers?search=${encodeURIComponent(searchQuery)}&status=approved&page=1&limit=20`);
    const data = await res.json();
    setSearchResults(data.trainers || []);
    setSearching(false);
  }

  async function addMatch(trainerId: string) {
    setActionLoading(true);
    await fetch(`/api/admin/enquiries/${enquiryId}/matches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trainerId }),
    });
    await fetchMatches();
    setSearchResults((prev) => prev.filter((t) => t.id !== trainerId));
    setActionLoading(false);
  }

  async function removeMatch(trainerId: string) {
    setActionLoading(true);
    await fetch(`/api/admin/enquiries/${enquiryId}/matches?trainerId=${trainerId}`, {
      method: "DELETE",
    });
    await fetchMatches();
    setActionLoading(false);
  }

  async function updateStatus(newStatus: string) {
    setActionLoading(true);
    await fetch("/api/admin/enquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: enquiryId, status: newStatus }),
    });
    setEnquiry((prev) => prev ? { ...prev, status: newStatus } : null);
    setActionLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!enquiry) {
    return (
      <div className="p-8 text-center text-gray-500">
        Enquiry not found.
        <button onClick={() => router.push("/admin/enquiries")} className="ml-2 text-blue-600">Back</button>
      </div>
    );
  }

  const matchedTrainerIds = matches.map((m) => m.trainer_id);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
      <button
        onClick={() => router.push("/admin/enquiries")}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to enquiries
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{enquiry.company_name}</h1>
          <p className="text-sm text-gray-500">{enquiry.contact_name} &middot; {enquiry.contact_email}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[enquiry.status] || ""}`}>
          {enquiry.status}
        </span>
      </div>

      {/* Status pipeline */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {PIPELINE.map((s) => (
          <button
            key={s}
            onClick={() => updateStatus(s)}
            disabled={actionLoading || enquiry.status === s}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              enquiry.status === s
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {/* Enquiry details */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-semibold text-gray-700">Enquiry Details</h3>
          </div>
          <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <Row label="Domain" value={enquiry.domain_needed} />
            <Row label="Format" value={enquiry.delivery_format || "—"} />
            <Row label="Location" value={enquiry.location || "—"} />
            <Row label="Group Size" value={enquiry.group_size ? String(enquiry.group_size) : "—"} />
            <Row label="Timeline" value={enquiry.preferred_timeline || "—"} />
            <Row label="Company Type" value={enquiry.company_type || "—"} />
            <Row label="Phone" value={enquiry.contact_phone || "—"} />
            <Row label="Submitted" value={new Date(enquiry.created_at).toLocaleDateString()} />
          </div>
          {enquiry.additional_notes && (
            <div className="px-5 py-3 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
              <p className="text-sm text-gray-700">{enquiry.additional_notes}</p>
            </div>
          )}
        </div>

        {/* Matched trainers */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Matched Trainers ({matches.length})</h3>
          </div>
          <div className="px-5 py-4">
            {matches.length === 0 ? (
              <p className="text-sm text-gray-400">No trainers matched yet. Search below to add.</p>
            ) : (
              <div className="space-y-2">
                {matches.map((m) => (
                  <div key={m.trainer_id} className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
                    <div>
                      <p className="font-medium text-sm text-gray-900">
                        {m.trainer?.first_name} {m.trainer?.last_name}
                      </p>
                      <div className="flex flex-wrap gap-x-3 text-xs text-gray-400 mt-0.5">
                        <span>{m.trainer?.email}</span>
                        {m.trainer?.location_city && <span>{m.trainer.location_city}</span>}
                        {m.trainer?.day_rate_usd && <span>${m.trainer.day_rate_usd}/day</span>}
                        {Number(m.trainer?.rating_avg) > 0 && <span>Rating: {Number(m.trainer?.rating_avg).toFixed(1)}</span>}
                      </div>
                      {m.trainer?.primary_domains && m.trainer.primary_domains.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {m.trainer.primary_domains.slice(0, 3).map((d) => (
                            <span key={d} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{d}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeMatch(m.trainer_id)}
                      disabled={actionLoading}
                      className="text-red-500 hover:text-red-600 text-xs shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search & add trainers */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-semibold text-gray-700">Find & Add Trainers</h3>
          </div>
          <div className="px-5 py-4 space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchTrainers()}
                placeholder="Search by name, domain, location..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <button
                onClick={searchTrainers}
                disabled={searching}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {searching ? "..." : "Search"}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults
                  .filter((t) => !matchedTrainerIds.includes(t.id))
                  .map((t) => (
                    <div key={t.id} className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{t.first_name} {t.last_name}</p>
                        <div className="flex flex-wrap gap-x-3 text-xs text-gray-400 mt-0.5">
                          <span>{t.email}</span>
                          {t.location_city && <span>{t.location_city}</span>}
                          {t.day_rate_usd && <span>${t.day_rate_usd}/day</span>}
                        </div>
                        {t.primary_domains?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {t.primary_domains.slice(0, 3).map((d) => (
                              <span key={d} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{d}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => addMatch(t.id)}
                        disabled={actionLoading}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50 transition shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex py-0.5">
      <span className="text-gray-500 w-28 shrink-0">{label}</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}
