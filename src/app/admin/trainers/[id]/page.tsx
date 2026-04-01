"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Trainer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  location_city: string;
  location_country: string;
  headshot_url: string | null;
  bio: string;
  linkedin_url: string;
  primary_domains: string[];
  secondary_domains: string[];
  topics_trained: string[];
  years_of_experience: number | null;
  total_sessions_delivered: number;
  preferred_group_size_min: number | null;
  preferred_group_size_max: number | null;
  delivery_formats: string[];
  certifications: {
    name: string;
    issuingOrganization: string;
    issueDate: string;
    expiryDate: string;
    credentialId: string;
  }[];
  sample_outline_url: string | null;
  sample_slides_url: string | null;
  sample_video_url: string | null;
  day_rate_usd: number | null;
  hourly_rate_usd: number | null;
  rate_notes: string;
  status: string;
  rating_avg: number;
  rating_count: number;
  submitted_at: string;
  approved_at: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  in_review: "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  suspended: "bg-gray-100 text-gray-600",
};

export default function TrainerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/trainers?search=&status=&sort=created_at&order=desc&page=1&limit=100`);
      const data = await res.json();
      const found = data.trainers?.find((t: Trainer) => t.id === params.id);
      setTrainer(found || null);
      setLoading(false);
    }
    load();
  }, [params.id]);

  async function handleAction(newStatus: string) {
    if (!trainer) return;
    setActionLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/trainers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: trainer.id,
          status: newStatus,
          reviewerNotes: notes,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Action failed");
      }

      setTrainer({ ...trainer, status: newStatus });
      setNotes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Trainer not found</p>
        <button onClick={() => router.push("/admin")} className="mt-4 text-blue-600 text-sm font-medium">
          Back to list
        </button>
      </div>
    );
  }

  const certs = Array.isArray(trainer.certifications) ? trainer.certifications : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      {/* Header */}
      <button
        onClick={() => router.push("/admin")}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to trainers
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          {trainer.headshot_url ? (
            <img src={trainer.headshot_url} alt="" className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-lg font-bold">
              {trainer.first_name[0]}{trainer.last_name[0]}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {trainer.first_name} {trainer.last_name}
            </h1>
            <p className="text-sm text-gray-500">{trainer.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[trainer.status] || "bg-gray-100 text-gray-500"}`}>
            {trainer.status}
          </span>
          <Link
            href={`/admin/trainers/${trainer.id}/verification`}
            className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            Verification Pipeline
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        {/* Personal Info */}
        <Section title="Personal Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
            <Row label="Phone" value={trainer.phone || "—"} />
            <Row label="Location" value={[trainer.location_city, trainer.location_country].filter(Boolean).join(", ") || "—"} />
            <Row label="LinkedIn" value={trainer.linkedin_url || "—"} link={trainer.linkedin_url} />
            <Row label="Registered" value={new Date(trainer.created_at).toLocaleDateString()} />
          </div>
          {trainer.bio && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-600">{trainer.bio}</p>
            </div>
          )}
        </Section>

        {/* Domains */}
        <Section title="Training Domains">
          {(trainer.primary_domains?.length > 0 || trainer.secondary_domains?.length > 0) ? (
            <div className="space-y-3">
              {trainer.primary_domains?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Primary</p>
                  <div className="flex flex-wrap gap-1.5">
                    {trainer.primary_domains.map((d) => (
                      <span key={d} className="px-2.5 py-1 bg-blue-600 text-white rounded-full text-xs">{d}</span>
                    ))}
                  </div>
                </div>
              )}
              {trainer.secondary_domains?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Secondary</p>
                  <div className="flex flex-wrap gap-1.5">
                    {trainer.secondary_domains.map((d) => (
                      <span key={d} className="px-2.5 py-1 bg-gray-200 text-gray-700 rounded-full text-xs">{d}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No domains selected</p>
          )}
        </Section>

        {/* Experience */}
        <Section title="Experience">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
            <Row label="Years" value={trainer.years_of_experience != null ? `${trainer.years_of_experience} years` : "—"} />
            <Row label="Sessions" value={trainer.total_sessions_delivered ? String(trainer.total_sessions_delivered) : "—"} />
            <Row label="Group Size" value={trainer.preferred_group_size_min && trainer.preferred_group_size_max ? `${trainer.preferred_group_size_min}–${trainer.preferred_group_size_max}` : "—"} />
            <Row label="Formats" value={trainer.delivery_formats?.join(", ") || "—"} />
          </div>
          {trainer.topics_trained?.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-1">Topics</p>
              <div className="flex flex-wrap gap-1.5">
                {trainer.topics_trained.map((t) => (
                  <span key={t} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{t}</span>
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* Certifications */}
        {certs.length > 0 && (
          <Section title="Certifications">
            <div className="space-y-2">
              {certs.map((cert, i) => (
                <div key={i} className="border border-gray-100 rounded-lg p-3">
                  <p className="font-medium text-sm text-gray-900">{cert.name}</p>
                  {cert.issuingOrganization && <p className="text-xs text-gray-500">{cert.issuingOrganization}</p>}
                  <div className="flex flex-wrap gap-x-4 mt-1 text-xs text-gray-400">
                    {cert.issueDate && <span>Issued: {cert.issueDate}</span>}
                    {cert.expiryDate && <span>Expires: {cert.expiryDate}</span>}
                    {cert.credentialId && <span>ID: {cert.credentialId}</span>}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Content */}
        {(trainer.sample_outline_url || trainer.sample_slides_url || trainer.sample_video_url) && (
          <Section title="Sample Content">
            <div className="space-y-1">
              {trainer.sample_outline_url && <Row label="Outline" value="Uploaded" link={trainer.sample_outline_url} />}
              {trainer.sample_slides_url && <Row label="Slides" value="Uploaded" link={trainer.sample_slides_url} />}
              {trainer.sample_video_url && <Row label="Video" value={trainer.sample_video_url} link={trainer.sample_video_url} />}
            </div>
          </Section>
        )}

        {/* Rates */}
        <Section title="Rate Card">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
            <Row label="Day Rate" value={trainer.day_rate_usd ? `$${trainer.day_rate_usd}` : "—"} />
            <Row label="Hourly Rate" value={trainer.hourly_rate_usd ? `$${trainer.hourly_rate_usd}` : "—"} />
          </div>
          {trainer.rate_notes && <p className="text-sm text-gray-500 mt-2">{trainer.rate_notes}</p>}
        </Section>

        {/* Actions */}
        <Section title="Actions">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reviewer Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                placeholder="Optional notes for this action..."
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>
            )}

            <div className="flex flex-wrap gap-3">
              {trainer.status !== "approved" && (
                <button
                  onClick={() => handleAction("approved")}
                  disabled={actionLoading}
                  className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition"
                >
                  {actionLoading ? "..." : "Approve"}
                </button>
              )}
              {trainer.status !== "rejected" && (
                <button
                  onClick={() => handleAction("rejected")}
                  disabled={actionLoading}
                  className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition"
                >
                  {actionLoading ? "..." : "Reject"}
                </button>
              )}
              {trainer.status !== "in_review" && trainer.status !== "approved" && (
                <button
                  onClick={() => handleAction("in_review")}
                  disabled={actionLoading}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {actionLoading ? "..." : "Move to Review"}
                </button>
              )}
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function Row({ label, value, link }: { label: string; value: string; link?: string | null }) {
  return (
    <div className="flex py-0.5">
      <span className="text-sm text-gray-500 w-28 shrink-0">{label}</span>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
          {value}
        </a>
      ) : (
        <span className="text-sm text-gray-900">{value}</span>
      )}
    </div>
  );
}
