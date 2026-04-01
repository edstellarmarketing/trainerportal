"use client";

import { useEffect, useState } from "react";

const FORMAT_OPTIONS = ["in-person", "virtual", "hybrid"];

export default function EditProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState<Record<string, unknown>>({});

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/trainer/profile");
      if (res.ok) {
        const { trainer } = await res.json();
        setForm({
          phone: trainer.phone || "",
          locationCity: trainer.location_city || "",
          locationCountry: trainer.location_country || "",
          linkedinUrl: trainer.linkedin_url || "",
          bio: trainer.bio || "",
          primaryDomains: trainer.primary_domains || [],
          secondaryDomains: trainer.secondary_domains || [],
          topicsTrained: trainer.topics_trained || [],
          yearsOfExperience: trainer.years_of_experience ?? "",
          totalSessionsDelivered: trainer.total_sessions_delivered ?? "",
          preferredGroupSizeMin: trainer.preferred_group_size_min ?? "",
          preferredGroupSizeMax: trainer.preferred_group_size_max ?? "",
          deliveryFormats: trainer.delivery_formats || [],
          sampleVideoUrl: trainer.sample_video_url || "",
          dayRateUsd: trainer.day_rate_usd ?? "",
          hourlyRateUsd: trainer.hourly_rate_usd ?? "",
          rateNotes: trainer.rate_notes || "",
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  function update(key: string, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/trainer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Save failed");
      setSuccess("Profile updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>

      {success && <div className="bg-green-50 text-green-700 text-sm rounded-lg p-3">{success}</div>}
      {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>}

      <FormSection title="Personal Info">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Phone" value={form.phone as string} onChange={(v) => update("phone", v)} />
          <Field label="City" value={form.locationCity as string} onChange={(v) => update("locationCity", v)} />
          <Field label="Country" value={form.locationCountry as string} onChange={(v) => update("locationCountry", v)} />
          <Field label="LinkedIn" value={form.linkedinUrl as string} onChange={(v) => update("linkedinUrl", v)} type="url" />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea value={form.bio as string} onChange={(e) => update("bio", e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none" />
        </div>
      </FormSection>

      <FormSection title="Training Domains">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Domains (comma-separated)</label>
            <input type="text" value={(form.primaryDomains as string[]).join(", ")} onChange={(e) => update("primaryDomains", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Domains (comma-separated)</label>
            <input type="text" value={(form.secondaryDomains as string[]).join(", ")} onChange={(e) => update("secondaryDomains", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
        </div>
      </FormSection>

      <FormSection title="Experience">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Years of Experience" value={String(form.yearsOfExperience)} onChange={(v) => update("yearsOfExperience", v ? parseInt(v) : "")} type="number" />
          <Field label="Total Sessions" value={String(form.totalSessionsDelivered)} onChange={(v) => update("totalSessionsDelivered", v ? parseInt(v) : "")} type="number" />
          <Field label="Group Size Min" value={String(form.preferredGroupSizeMin)} onChange={(v) => update("preferredGroupSizeMin", v ? parseInt(v) : "")} type="number" />
          <Field label="Group Size Max" value={String(form.preferredGroupSizeMax)} onChange={(v) => update("preferredGroupSizeMax", v ? parseInt(v) : "")} type="number" />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Formats</label>
          <div className="flex gap-2">
            {FORMAT_OPTIONS.map((f) => (
              <button key={f} type="button" onClick={() => {
                const cur = form.deliveryFormats as string[];
                update("deliveryFormats", cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]);
              }} className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition ${(form.deliveryFormats as string[]).includes(f) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-blue-300"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Topics (comma-separated)</label>
          <input type="text" value={(form.topicsTrained as string[]).join(", ")} onChange={(e) => update("topicsTrained", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
        </div>
      </FormSection>

      <FormSection title="Rate Card">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Day Rate (USD)" value={String(form.dayRateUsd)} onChange={(v) => update("dayRateUsd", v ? parseFloat(v) : "")} type="number" />
          <Field label="Hourly Rate (USD)" value={String(form.hourlyRateUsd)} onChange={(v) => update("hourlyRateUsd", v ? parseFloat(v) : "")} type="number" />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Rate Notes</label>
          <textarea value={form.rateNotes as string} onChange={(e) => update("rateNotes", e.target.value)} rows={2} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none" />
        </div>
      </FormSection>

      <FormSection title="Sample Content">
        <Field label="Sample Video URL" value={form.sampleVideoUrl as string} onChange={(v) => update("sampleVideoUrl", v)} type="url" />
      </FormSection>

      <div className="pb-8">
        <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
    </div>
  );
}
