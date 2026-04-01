"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface Enquiry {
  id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  domain_needed: string;
  delivery_format: string | null;
  location: string | null;
  group_size: number | null;
  status: string;
  sla_deadline: string | null;
  created_at: string;
}

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "new", label: "New" },
  { value: "matching", label: "Matching" },
  { value: "sent", label: "Sent" },
  { value: "reviewing", label: "Reviewing" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
];

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  matching: "bg-purple-100 text-purple-700",
  sent: "bg-indigo-100 text-indigo-700",
  reviewing: "bg-amber-100 text-amber-700",
  converted: "bg-green-100 text-green-700",
  lost: "bg-gray-100 text-gray-500",
};

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ status, search, page: String(page), limit: "20" });
    const res = await fetch(`/api/admin/enquiries?${params}`);
    const data = await res.json();
    setEnquiries(data.enquiries || []);
    setTotal(data.total || 0);
    setTotalPages(data.totalPages || 0);
    setLoading(false);
  }, [status, search, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  function slaStatus(deadline: string | null) {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - Date.now();
    const hours = Math.round(diff / 3600000);
    if (hours < 0) return { text: "Overdue", color: "text-red-600" };
    if (hours < 12) return { text: `${hours}h left`, color: "text-amber-600" };
    return { text: `${hours}h left`, color: "text-gray-400" };
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Enquiries</h1>
          <p className="text-sm text-gray-500">{total} total</p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatus(tab.value); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              status === tab.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Search by company, contact, domain..."
        className="w-full sm:max-w-md px-4 py-2 border border-gray-300 rounded-lg text-sm mb-6 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
      />

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Company</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Domain</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Format</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">SLA</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto" />
                  </td>
                </tr>
              ) : enquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">No enquiries found</td>
                </tr>
              ) : (
                enquiries.map((e) => {
                  const sla = slaStatus(e.sla_deadline);
                  return (
                    <tr key={e.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{e.company_name}</p>
                        <p className="text-xs text-gray-400">{e.contact_name} &middot; {e.contact_email}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-600">{e.domain_needed}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-500">{e.delivery_format || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[e.status] || "bg-gray-100 text-gray-500"}`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        {sla && <span className={`text-xs font-medium ${sla.color}`}>{sla.text}</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/enquiries/${e.id}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed">Prev</button>
              <button onClick={() => setPage(page + 1)} disabled={page >= totalPages} className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
