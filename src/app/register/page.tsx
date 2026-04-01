"use client";

import { DELIVERY_FORMAT_OPTIONS } from "@/lib/registration-types";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface ParsedData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  locationCity: string;
  locationCountry: string;
  linkedinUrl: string;
  bio: string;
  yearsOfExperience: number | null;
  totalSessionsDelivered: number | null;
  preferredGroupSizeMin: number | null;
  preferredGroupSizeMax: number | null;
  deliveryFormats: string[];
  topicsTrained: string[];
  certifications: {
    name: string;
    issuingOrganization: string;
    issueDate: string;
    expiryDate: string;
    credentialId: string;
  }[];
  primaryDomains: string[];
  secondaryDomains: string[];
  dayRateUsd: number | null;
  hourlyRateUsd: number | null;
  rateNotes: string;
  sampleVideoUrl: string;
}

interface Domain {
  id: string;
  name: string;
  category: string;
}

export default function RegisterPage() {
  const [step, setStep] = useState<"upload" | "review">("upload");
  const [parsing, setParsing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [data, setData] = useState<ParsedData | null>(null);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [domainSearch, setDomainSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Fetch domains via server-side API (avoids mixed content issues)
  useEffect(() => {
    async function fetchDomains() {
      try {
        const res = await fetch("/api/domains");
        if (res.ok) {
          const data = await res.json();
          setDomains(data || []);
        }
      } catch {
        console.error("Failed to fetch domains");
      }
    }
    fetchDomains();
  }, []);

  async function handleUpload(file: File) {
    setResumeFile(file);
    setParsing(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json();
        const debugInfo = body.debug ? ` (${typeof body.debug === 'string' ? body.debug.slice(0, 200) : JSON.stringify(body.debug)})` : "";
        throw new Error((body.error || "Failed to parse resume") + debugInfo);
      }

      const { data: parsed } = await res.json();
      setData(parsed);
      setStep("review");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to parse resume"
      );
    } finally {
      setParsing(false);
    }
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  }

  function updateField<K extends keyof ParsedData>(
    key: K,
    value: ParsedData[K]
  ) {
    if (!data) return;
    setData({ ...data, [key]: value });
  }

  function toggleFormat(format: string) {
    if (!data) return;
    const current = data.deliveryFormats;
    if (current.includes(format)) {
      updateField(
        "deliveryFormats",
        current.filter((f) => f !== format)
      );
    } else {
      updateField("deliveryFormats", [...current, format]);
    }
  }

  function toggleDomain(
    name: string,
    type: "primaryDomains" | "secondaryDomains"
  ) {
    if (!data) return;
    const other =
      type === "primaryDomains" ? "secondaryDomains" : "primaryDomains";
    const current = data[type];
    const otherList = data[other];

    if (current.includes(name)) {
      updateField(
        type,
        current.filter((d) => d !== name)
      );
    } else {
      updateField(type, [...current, name]);
      if (otherList.includes(name)) {
        updateField(
          other,
          otherList.filter((d) => d !== name)
        );
      }
    }
  }

  function removeCert(index: number) {
    if (!data) return;
    updateField(
      "certifications",
      data.certifications.filter((_, i) => i !== index)
    );
  }

  function removeTopic(topic: string) {
    if (!data) return;
    updateField(
      "topicsTrained",
      data.topicsTrained.filter((t) => t !== topic)
    );
  }

  // Resolve domain names to IDs
  function domainNameToId(name: string): string | null {
    const d = domains.find(
      (dom) => dom.name.toLowerCase() === name.toLowerCase()
    );
    return d?.id || null;
  }

  async function handleSubmit() {
    if (!data) return;

    // Validate required fields
    if (!data.firstName.trim() || !data.lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }
    if (!data.email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!data.phone.trim()) {
      setError("Phone is required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = new FormData();

      // Send raw domain names — server resolves them to IDs
      const jsonData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        locationCity: data.locationCity,
        locationCountry: data.locationCountry,
        linkedinUrl: data.linkedinUrl,
        bio: data.bio,
        primaryDomains: data.primaryDomains,
        secondaryDomains: data.secondaryDomains,
        yearsOfExperience: data.yearsOfExperience ?? "",
        certifications: data.certifications,
        topicsTrained: data.topicsTrained,
        totalSessionsDelivered: data.totalSessionsDelivered ?? "",
        preferredGroupSizeMin: data.preferredGroupSizeMin ?? "",
        preferredGroupSizeMax: data.preferredGroupSizeMax ?? "",
        deliveryFormats: data.deliveryFormats,
        sampleVideoUrl: data.sampleVideoUrl,
        availabilitySlots: [],
        dayRateUsd: data.dayRateUsd ?? "",
        hourlyRateUsd: data.hourlyRateUsd ?? "",
        rateNotes: data.rateNotes,
      };

      payload.append("data", JSON.stringify(jsonData));

      // Attach the resume file itself
      if (resumeFile) {
        payload.append("sampleOutline", resumeFile);
      }

      const res = await fetch("/api/register", {
        method: "POST",
        body: payload,
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error || "Registration failed");
      }

      // Log debug info for domain troubleshooting
      if (body.debug) {
        console.log("Registration debug:", JSON.stringify(body.debug, null, 2));
      }

      router.push("/register/success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  // ─── UPLOAD STEP ───
  if (step === "upload") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Trainer Registration
            </h1>
            <p className="text-gray-500 mt-2">
              Upload your resume and we&apos;ll auto-fill your profile
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {/* Upload area */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition"
            >
              {parsing ? (
                <div className="space-y-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto" />
                  <p className="text-sm font-medium text-blue-600">
                    Parsing your resume...
                  </p>
                  <p className="text-xs text-gray-400">
                    Extracting your details with AI
                  </p>
                </div>
              ) : (
                <>
                  <svg
                    className="w-12 h-12 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-base font-medium text-gray-700">
                    Drop your resume here or click to upload
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    PDF, DOCX, or TXT — Max 10MB
                  </p>
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              onChange={handleFileSelect}
              className="hidden"
            />

            {error && (
              <div className="mt-4 bg-red-50 text-red-600 text-sm rounded-lg p-3">
                {error}
              </div>
            )}

            {/* Sample resume download */}
            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500 mb-2">
                Not sure what to include?
              </p>
              <a
                href="/sample-trainer-resume.txt"
                download
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download Sample Resume Template
              </a>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Your resume is processed securely and only used to pre-fill your
            registration.
          </p>
        </div>
      </div>
    );
  }

  // ─── REVIEW STEP ───
  if (!data) return null;

  // Identify missing required fields
  const missingFields: string[] = [];
  if (!data.firstName) missingFields.push("firstName");
  if (!data.lastName) missingFields.push("lastName");
  if (!data.email) missingFields.push("email");
  if (!data.phone) missingFields.push("phone");
  if (!data.locationCity) missingFields.push("locationCity");
  if (!data.locationCountry) missingFields.push("locationCountry");

  const isMissing = (field: string) => missingFields.includes(field);

  const filteredDomains = domainSearch
    ? domains.filter((d) =>
        d.name.toLowerCase().includes(domainSearch.toLowerCase())
      )
    : domains;

  const groupedDomains = filteredDomains.reduce<Record<string, Domain[]>>(
    (acc, d) => {
      const cat = d.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(d);
      return acc;
    },
    {}
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Review Your Profile
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            We extracted the following from your resume.{" "}
            {missingFields.length > 0 && (
              <span className="text-amber-600 font-medium">
                Please fill in the highlighted fields.
              </span>
            )}
          </p>
        </div>

        {/* Resume file badge */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {resumeFile?.name}
          </span>
          <button
            type="button"
            onClick={() => {
              setStep("upload");
              setData(null);
              setResumeFile(null);
              setError("");
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Upload different
          </button>
        </div>

        <div className="space-y-6">
          {/* ── Personal Info ── */}
          <FormSection title="Personal Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="First Name"
                required
                missing={isMissing("firstName")}
              >
                <input
                  type="text"
                  value={data.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  className={inputClass(isMissing("firstName"))}
                  placeholder="First name"
                />
              </Field>
              <Field
                label="Last Name"
                required
                missing={isMissing("lastName")}
              >
                <input
                  type="text"
                  value={data.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  className={inputClass(isMissing("lastName"))}
                  placeholder="Last name"
                />
              </Field>
            </div>
            <Field label="Email" required missing={isMissing("email")}>
              <input
                type="email"
                value={data.email}
                onChange={(e) => updateField("email", e.target.value)}
                className={inputClass(isMissing("email"))}
                placeholder="email@example.com"
              />
            </Field>
            <Field label="Phone" required missing={isMissing("phone")}>
              <input
                type="tel"
                value={data.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className={inputClass(isMissing("phone"))}
                placeholder="+1 (555) 000-0000"
              />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="City"
                required
                missing={isMissing("locationCity")}
              >
                <input
                  type="text"
                  value={data.locationCity}
                  onChange={(e) => updateField("locationCity", e.target.value)}
                  className={inputClass(isMissing("locationCity"))}
                  placeholder="City"
                />
              </Field>
              <Field
                label="Country"
                required
                missing={isMissing("locationCountry")}
              >
                <input
                  type="text"
                  value={data.locationCountry}
                  onChange={(e) =>
                    updateField("locationCountry", e.target.value)
                  }
                  className={inputClass(isMissing("locationCountry"))}
                  placeholder="Country"
                />
              </Field>
            </div>
            <Field label="LinkedIn">
              <input
                type="url"
                value={data.linkedinUrl}
                onChange={(e) => updateField("linkedinUrl", e.target.value)}
                className={inputClass(false)}
                placeholder="https://linkedin.com/in/..."
              />
            </Field>
            <Field label="Professional Summary">
              <textarea
                value={data.bio}
                onChange={(e) => updateField("bio", e.target.value)}
                rows={3}
                className={inputClass(false) + " resize-none"}
                placeholder="Brief professional summary..."
              />
            </Field>
          </FormSection>

          {/* ── Domains ── */}
          <FormSection title="Training Domains">
            <div className="flex gap-4 text-sm mb-2">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600" />
                Primary ({data.primaryDomains.length})
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-gray-400" />
                Secondary ({data.secondaryDomains.length})
              </span>
            </div>

            {/* Selected domains */}
            {(data.primaryDomains.length > 0 ||
              data.secondaryDomains.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-3">
                {data.primaryDomains.map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-full text-sm"
                  >
                    {name}
                    <button
                      type="button"
                      onClick={() => toggleDomain(name, "primaryDomains")}
                      className="hover:text-blue-200"
                    >
                      &times;
                    </button>
                  </span>
                ))}
                {data.secondaryDomains.map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm"
                  >
                    {name}
                    <button
                      type="button"
                      onClick={() => toggleDomain(name, "secondaryDomains")}
                      className="hover:text-gray-900"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}

            <input
              type="text"
              value={domainSearch}
              onChange={(e) => setDomainSearch(e.target.value)}
              placeholder="Search domains to add..."
              className={inputClass(false)}
            />
            <div className="max-h-48 overflow-y-auto mt-2 space-y-3">
              {Object.entries(groupedDomains).map(([cat, doms]) => (
                <div key={cat}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    {cat}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {doms.map((d) => {
                      const isPri = data.primaryDomains.includes(d.name);
                      const isSec = data.secondaryDomains.includes(d.name);
                      if (isPri || isSec) return null;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() =>
                            toggleDomain(d.name, "primaryDomains")
                          }
                          className="px-2.5 py-1 rounded-full text-xs border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 transition"
                        >
                          {d.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </FormSection>

          {/* ── Experience ── */}
          <FormSection title="Experience">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Years of Experience">
                <input
                  type="number"
                  min={0}
                  value={data.yearsOfExperience ?? ""}
                  onChange={(e) =>
                    updateField(
                      "yearsOfExperience",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className={inputClass(false)}
                  placeholder="e.g. 10"
                />
              </Field>
              <Field label="Total Sessions Delivered">
                <input
                  type="number"
                  min={0}
                  value={data.totalSessionsDelivered ?? ""}
                  onChange={(e) =>
                    updateField(
                      "totalSessionsDelivered",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className={inputClass(false)}
                  placeholder="e.g. 150"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Field label="Group Min">
                <input
                  type="number"
                  min={1}
                  value={data.preferredGroupSizeMin ?? ""}
                  onChange={(e) =>
                    updateField(
                      "preferredGroupSizeMin",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className={inputClass(false)}
                  placeholder="Min"
                />
              </Field>
              <Field label="Group Max">
                <input
                  type="number"
                  min={1}
                  value={data.preferredGroupSizeMax ?? ""}
                  onChange={(e) =>
                    updateField(
                      "preferredGroupSizeMax",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className={inputClass(false)}
                  placeholder="Max"
                />
              </Field>
            </div>
            <Field label="Delivery Formats">
              <div className="flex flex-wrap gap-2">
                {DELIVERY_FORMAT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleFormat(opt.value)}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition ${
                      data.deliveryFormats.includes(opt.value)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-300 hover:border-blue-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </Field>
          </FormSection>

          {/* ── Topics ── */}
          {data.topicsTrained.length > 0 && (
            <FormSection title="Topics Trained">
              <div className="flex flex-wrap gap-2">
                {data.topicsTrained.map((topic) => (
                  <span
                    key={topic}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                  >
                    {topic}
                    <button
                      type="button"
                      onClick={() => removeTopic(topic)}
                      className="hover:text-blue-900"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </FormSection>
          )}

          {/* ── Certifications ── */}
          {data.certifications.length > 0 && (
            <FormSection title="Certifications">
              <div className="space-y-3">
                {data.certifications.map((cert, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-3 border border-gray-200 rounded-lg p-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-900">
                        {cert.name}
                      </p>
                      {cert.issuingOrganization && (
                        <p className="text-xs text-gray-500">
                          {cert.issuingOrganization}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-gray-400">
                        {cert.issueDate && <span>Issued: {cert.issueDate}</span>}
                        {cert.expiryDate && (
                          <span>Expires: {cert.expiryDate}</span>
                        )}
                        {cert.credentialId && (
                          <span>ID: {cert.credentialId}</span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCert(i)}
                      className="text-red-500 hover:text-red-600 text-xs shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </FormSection>
          )}

          {/* ── Rates ── */}
          <FormSection title="Rate Card">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Day Rate (USD)">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    $
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={data.dayRateUsd ?? ""}
                    onChange={(e) =>
                      updateField(
                        "dayRateUsd",
                        e.target.value ? parseFloat(e.target.value) : null
                      )
                    }
                    className={inputClass(false) + " pl-7"}
                    placeholder="e.g. 1500"
                  />
                </div>
              </Field>
              <Field label="Hourly Rate (USD)">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    $
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={data.hourlyRateUsd ?? ""}
                    onChange={(e) =>
                      updateField(
                        "hourlyRateUsd",
                        e.target.value ? parseFloat(e.target.value) : null
                      )
                    }
                    className={inputClass(false) + " pl-7"}
                    placeholder="e.g. 200"
                  />
                </div>
              </Field>
            </div>
            <Field label="Rate Notes">
              <textarea
                value={data.rateNotes}
                onChange={(e) => updateField("rateNotes", e.target.value)}
                rows={2}
                className={inputClass(false) + " resize-none"}
                placeholder="Any notes about your rates..."
              />
            </Field>
          </FormSection>

          {/* ── Error ── */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          {/* ── Submit ── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 pb-8">
            <button
              type="button"
              onClick={() => {
                setStep("upload");
                setData(null);
                setResumeFile(null);
              }}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition w-full sm:w-auto"
            >
              Start Over
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition w-full sm:w-auto"
            >
              {submitting ? "Submitting..." : "Submit Registration"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helper components ───

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="px-5 py-4 space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  missing,
  children,
}: {
  label: string;
  required?: boolean;
  missing?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        {missing && (
          <span className="ml-2 text-xs text-amber-600 font-normal">
            Missing — please fill in
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function inputClass(missing: boolean) {
  return `w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
    missing
      ? "border-amber-400 bg-amber-50"
      : "border-gray-300 bg-white"
  }`;
}
