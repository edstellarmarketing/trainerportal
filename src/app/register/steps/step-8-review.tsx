"use client";

import { useRegistration } from "@/lib/registration-context";

export function Step8Review() {
  const { formData } = useRegistration();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Review & Submit</h2>
        <p className="text-gray-500 mt-1">
          Review your information before submitting. You can go back to any
          step to make changes.
        </p>
      </div>

      {/* Basic Info */}
      <Section title="Basic Information">
        <Row label="Name" value={`${formData.firstName} ${formData.lastName}`} />
        <Row label="Email" value={formData.email} />
        <Row label="Phone" value={formData.phone} />
        <Row
          label="Location"
          value={
            formData.locationCity && formData.locationCountry
              ? `${formData.locationCity}, ${formData.locationCountry}`
              : formData.locationCity || formData.locationCountry || "—"
          }
        />
        <Row label="LinkedIn" value={formData.linkedinUrl || "—"} />
        <Row label="Bio" value={formData.bio || "—"} />
        {formData.headshotPreview && (
          <div className="flex items-center gap-2 py-1">
            <span className="text-sm text-gray-500 w-32 shrink-0">
              Headshot
            </span>
            <img
              src={formData.headshotPreview}
              alt="Headshot"
              className="w-12 h-12 rounded-full object-cover"
            />
          </div>
        )}
      </Section>

      {/* Domains */}
      <Section title="Domains">
        <Row
          label="Primary"
          value={
            formData.primaryDomains.length > 0
              ? `${formData.primaryDomains.length} selected`
              : "None selected"
          }
        />
        <Row
          label="Secondary"
          value={
            formData.secondaryDomains.length > 0
              ? `${formData.secondaryDomains.length} selected`
              : "None selected"
          }
        />
      </Section>

      {/* Experience */}
      <Section title="Experience & Certifications">
        <Row
          label="Years of Experience"
          value={
            formData.yearsOfExperience !== ""
              ? `${formData.yearsOfExperience} years`
              : "—"
          }
        />
        <Row
          label="Certifications"
          value={
            formData.certifications.length > 0
              ? formData.certifications.map((c) => c.name).filter(Boolean).join(", ") ||
                `${formData.certifications.length} added`
              : "None"
          }
        />
      </Section>

      {/* Training History */}
      <Section title="Training History">
        <Row
          label="Topics"
          value={formData.topicsTrained.join(", ") || "—"}
        />
        <Row
          label="Total Sessions"
          value={
            formData.totalSessionsDelivered !== ""
              ? String(formData.totalSessionsDelivered)
              : "—"
          }
        />
        <Row
          label="Group Size"
          value={
            formData.preferredGroupSizeMin !== "" &&
            formData.preferredGroupSizeMax !== ""
              ? `${formData.preferredGroupSizeMin}–${formData.preferredGroupSizeMax}`
              : "—"
          }
        />
        <Row
          label="Formats"
          value={formData.deliveryFormats.join(", ") || "—"}
        />
      </Section>

      {/* Content */}
      <Section title="Sample Content">
        <Row
          label="Outline"
          value={formData.sampleOutlinePreview || "Not uploaded"}
        />
        <Row
          label="Slides"
          value={formData.sampleSlidesPreview || "Not uploaded"}
        />
        <Row label="Video" value={formData.sampleVideoUrl || "—"} />
      </Section>

      {/* Availability */}
      <Section title="Availability">
        <Row
          label="Slots"
          value={`${formData.availabilitySlots.length} slot(s) added`}
        />
      </Section>

      {/* Rates */}
      <Section title="Rate Card">
        <Row
          label="Day Rate"
          value={
            formData.dayRateUsd !== ""
              ? `$${formData.dayRateUsd}`
              : "—"
          }
        />
        <Row
          label="Hourly Rate"
          value={
            formData.hourlyRateUsd !== ""
              ? `$${formData.hourlyRateUsd}`
              : "—"
          }
        />
        <Row label="Notes" value={formData.rateNotes || "—"} />
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2.5">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="px-4 py-3 space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex py-1">
      <span className="text-sm text-gray-500 w-36 shrink-0">{label}</span>
      <span className="text-sm text-gray-900 break-words">{value}</span>
    </div>
  );
}
