"use client";

import { useRegistration } from "@/lib/registration-context";
import { STEP_LABELS } from "@/lib/registration-types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Stepper } from "./stepper";
import { Step1BasicInfo } from "./steps/step-1-basic-info";
import { Step2Domains } from "./steps/step-2-domains";
import { Step3Experience } from "./steps/step-3-experience";
import { Step4TrainingHistory } from "./steps/step-4-training-history";
import { Step5Content } from "./steps/step-5-content";
import { Step6Availability } from "./steps/step-6-availability";
import { Step7Rates } from "./steps/step-7-rates";
import { Step8Review } from "./steps/step-8-review";

const STEPS = [
  Step1BasicInfo,
  Step2Domains,
  Step3Experience,
  Step4TrainingHistory,
  Step5Content,
  Step6Availability,
  Step7Rates,
  Step8Review,
];

export default function RegisterPage() {
  const { formData, currentStep, setCurrentStep, resetForm, isLoaded } =
    useRegistration();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const StepComponent = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;

  function validateCurrentStep(): string | null {
    switch (currentStep) {
      case 0:
        if (!formData.firstName.trim()) return "First name is required.";
        if (!formData.lastName.trim()) return "Last name is required.";
        if (!formData.email.trim()) return "Email is required.";
        if (!formData.phone.trim()) return "Phone is required.";
        if (!formData.locationCity.trim()) return "City is required.";
        if (!formData.locationCountry.trim()) return "Country is required.";
        return null;
      case 1:
        if (formData.primaryDomains.length === 0)
          return "Select at least one primary domain.";
        return null;
      case 2:
        if (formData.yearsOfExperience === "")
          return "Years of experience is required.";
        return null;
      case 3:
        if (formData.deliveryFormats.length === 0)
          return "Select at least one delivery format.";
        return null;
      default:
        return null;
    }
  }

  function handleNext() {
    const validationError = validateCurrentStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setCurrentStep(currentStep + 1);
    window.scrollTo(0, 0);
  }

  function handleBack() {
    setError("");
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");

    try {
      const payload = new FormData();

      // Add JSON data
      const jsonData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        locationCity: formData.locationCity,
        locationCountry: formData.locationCountry,
        linkedinUrl: formData.linkedinUrl,
        bio: formData.bio,
        primaryDomains: formData.primaryDomains,
        secondaryDomains: formData.secondaryDomains,
        yearsOfExperience: formData.yearsOfExperience,
        certifications: formData.certifications.map((c) => ({
          name: c.name,
          issuingOrganization: c.issuingOrganization,
          issueDate: c.issueDate,
          expiryDate: c.expiryDate,
          credentialId: c.credentialId,
          credentialUrl: c.credentialUrl,
        })),
        topicsTrained: formData.topicsTrained,
        totalSessionsDelivered: formData.totalSessionsDelivered,
        preferredGroupSizeMin: formData.preferredGroupSizeMin,
        preferredGroupSizeMax: formData.preferredGroupSizeMax,
        deliveryFormats: formData.deliveryFormats,
        sampleVideoUrl: formData.sampleVideoUrl,
        availabilitySlots: formData.availabilitySlots,
        dayRateUsd: formData.dayRateUsd,
        hourlyRateUsd: formData.hourlyRateUsd,
        rateNotes: formData.rateNotes,
      };
      payload.append("data", JSON.stringify(jsonData));

      // Add files
      if (formData.headshot) payload.append("headshot", formData.headshot);
      if (formData.sampleOutline)
        payload.append("sampleOutline", formData.sampleOutline);
      if (formData.sampleSlides)
        payload.append("sampleSlides", formData.sampleSlides);

      formData.certifications.forEach((cert, i) => {
        if (cert.document) {
          payload.append(`certDocument_${i}`, cert.document);
        }
      });

      const res = await fetch("/api/register", {
        method: "POST",
        body: payload,
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Registration failed");
      }

      resetForm();
      router.push("/register/success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Trainer Registration
          </h1>
          <p className="text-gray-500 mt-2">
            Join the Edstellar trainer network
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <Stepper />
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <StepComponent />

          {error && (
            <div className="mt-6 bg-red-50 text-red-600 text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-0 disabled:pointer-events-none transition"
            >
              Back
            </button>

            <span className="text-sm text-gray-400">
              Step {currentStep + 1} of {STEP_LABELS.length}
            </span>

            {isLastStep ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {submitting ? "Submitting..." : "Submit Registration"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
