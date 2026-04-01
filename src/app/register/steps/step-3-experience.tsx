"use client";

import { useRegistration } from "@/lib/registration-context";
import type { CertificationEntry } from "@/lib/registration-types";
import { useRef } from "react";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function Step3Experience() {
  const { formData, updateForm } = useRegistration();

  function addCertification() {
    const newCert: CertificationEntry = {
      id: generateId(),
      name: "",
      issuingOrganization: "",
      issueDate: "",
      expiryDate: "",
      credentialId: "",
      credentialUrl: "",
      document: null,
      documentPreview: "",
    };
    updateForm({ certifications: [...formData.certifications, newCert] });
  }

  function updateCertification(
    id: string,
    updates: Partial<CertificationEntry>
  ) {
    updateForm({
      certifications: formData.certifications.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    });
  }

  function removeCertification(id: string) {
    updateForm({
      certifications: formData.certifications.filter((c) => c.id !== id),
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Experience & Certifications
        </h2>
        <p className="text-gray-500 mt-1">
          Share your training experience and professional certifications.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Years of Experience <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min={0}
          max={50}
          value={formData.yearsOfExperience}
          onChange={(e) =>
            updateForm({
              yearsOfExperience:
                e.target.value === "" ? "" : parseInt(e.target.value),
            })
          }
          className="w-full max-w-xs px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          placeholder="e.g. 10"
        />
      </div>

      {/* Certifications */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">
            Certifications
          </label>
          <button
            type="button"
            onClick={addCertification}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            + Add Certification
          </button>
        </div>

        {formData.certifications.length === 0 && (
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-400 text-sm">
              No certifications added yet. Click &quot;Add Certification&quot;
              to get started.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {formData.certifications.map((cert) => (
            <CertificationCard
              key={cert.id}
              cert={cert}
              onUpdate={(updates) => updateCertification(cert.id, updates)}
              onRemove={() => removeCertification(cert.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CertificationCard({
  cert,
  onUpdate,
  onRemove,
}: {
  cert: CertificationEntry;
  onUpdate: (updates: Partial<CertificationEntry>) => void;
  onRemove: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleDocument(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onUpdate({ document: file, documentPreview: file.name });
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Certification</h4>
        <button
          type="button"
          onClick={onRemove}
          className="text-sm text-red-500 hover:text-red-600"
        >
          Remove
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Certification Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={cert.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="e.g. AWS Solutions Architect"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Issuing Organization
          </label>
          <input
            type="text"
            value={cert.issuingOrganization}
            onChange={(e) => onUpdate({ issuingOrganization: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="e.g. Amazon Web Services"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Issue Date
          </label>
          <input
            type="date"
            value={cert.issueDate}
            onChange={(e) => onUpdate({ issueDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Expiry Date
          </label>
          <input
            type="date"
            value={cert.expiryDate}
            onChange={(e) => onUpdate({ expiryDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Credential ID
          </label>
          <input
            type="text"
            value={cert.credentialId}
            onChange={(e) => onUpdate({ credentialId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="e.g. ABC-12345"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Credential URL
          </label>
          <input
            type="url"
            value={cert.credentialUrl}
            onChange={(e) => onUpdate({ credentialUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="https://..."
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">
          Proof Document
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            {cert.documentPreview || "Upload file"}
          </button>
          {cert.documentPreview && (
            <span className="text-xs text-gray-400">{cert.documentPreview}</span>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleDocument}
          className="hidden"
        />
      </div>
    </div>
  );
}
